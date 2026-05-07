/**
 * Vercel Serverless Function Source (Supabase Edition)
 *
 * This file is the editable source. During build, esbuild bundles it into
 * api/index.mjs which Vercel uses as the serverless function entry point.
 *
 * KEY CHANGE: Uses server/db-supabase.ts instead of server/db.ts
 * to query Supabase Postgres directly via @supabase/supabase-js,
 * eliminating the dependency on Manus TiDB / Drizzle ORM / mysql2.
 *
 * Includes prerender middleware for bot/crawler SEO on Vercel.
 */
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerChatRoutes } from "../server/_core/chat";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { getAllBlogSlugs, getRecentBlogPosts, getBlogPostBySlug } from "../server/db-supabase";
// Note: readFileSync/join no longer needed — Edge Middleware handles SPA routing.
// Only bot requests reach this serverless function now.

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Security headers — keep in sync with server/_core/index.ts. Vercel routes
// production traffic through this serverless entry, so missing CSP / X-Frame
// here means production was previously running without those defenses even
// though the express dev server set them.
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://*.umami.is",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://xqotfmrlhqiayiyjijpl.supabase.co https://*.supabase.co",
      "font-src 'self' https://xqotfmrlhqiayiyjijpl.supabase.co",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.umami.is",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// ─── Prerender constants ───────────────────────────────────────────────
const BASE_URL = "https://www.7sinscardgame.com";
const OG_IMAGE = "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/og-banner-7a8HHUKyS9YrWQLuM7Cgyi.png";
const FAVICON = "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/favicon_f4fbfc17.ico";
const ICON_192 = "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/7s-icon-192x192_8dcc7e63.png";

const BOT_UA_PATTERNS = [
  /googlebot/i, /bingbot/i, /yandexbot/i, /baiduspider/i,
  /duckduckbot/i, /slurp/i, /ia_archiver/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
  /whatsapp/i, /telegrambot/i, /discordbot/i, /slackbot/i,
  /pinterestbot/i, /redditbot/i,
  /gptbot/i, /chatgpt-user/i, /claudebot/i, /anthropic-ai/i,
  /perplexitybot/i, /cohere-ai/i, /applebot/i, /amazonbot/i,
  /petalbot/i, /semrushbot/i, /ahrefsbot/i, /mj12bot/i,
  /dotbot/i, /rogerbot/i, /screaming frog/i,
  /embedly/i, /quora link preview/i, /outbrain/i,
  /w3c_validator/i, /lighthouse/i,
];

function isBot(ua: string): boolean {
  return BOT_UA_PATTERNS.some((p) => p.test(ua));
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const STATIC_PAGES: Record<string, { title: string; description: string }> = {
  "/": {
    title: "7 Deadly Sins Card Game - Choose Your Sin | Free PvP Strategy Card Game",
    description: "A free strategic 4-player PvP card game where seven deadly sins clash in a gothic cathedral. Choose your sin, master compound mechanics, and outlast your rivals across 20 rounds of judgment.",
  },
  "/how-to-play": {
    title: "How to Play the 7 Deadly Sins Card Game - Step-by-Step Guide",
    description: "Learn how to play the 7 Deadly Sins Card Game in 6 easy steps. Choose your sin faction, build your deck, master the energy system, and dominate the arena.",
  },
  "/rules": {
    title: "Game Rules - 7 Deadly Sins Card Game",
    description: "Complete rules reference for the 7 Deadly Sins Card Game. Energy system, compound mechanics, Fibonacci scaling, faction passives, and win conditions explained.",
  },
  "/faq": {
    title: "FAQ - 7 Deadly Sins Card Game",
    description: "Frequently asked questions about the 7 Deadly Sins Card Game. Learn about gameplay, factions, energy system, multiplayer, and more.",
  },
  "/blog": {
    title: "Blog - 7 Deadly Sins Card Game | Lore, Strategy & Mythology",
    description: "Dark fantasy lore, strategy guides, and mythology from the world of the 7 Deadly Sins Card Game. Explore sin traditions from Dante, Buddhist, Norse, Japanese, and Celtic cultures.",
  },
  "/community": {
    title: "Community Decks - 7 Deadly Sins Card Game",
    description: "Browse and share community-created decks for the 7 Deadly Sins Card Game. Find the best strategies for each sin faction.",
  },
  "/deck-builder": {
    title: "Deck Builder - 7 Deadly Sins Card Game",
    description: "Build and customize your deck for the 7 Deadly Sins Card Game. Choose cards, optimize your strategy, and prepare for battle.",
  },
  "/chronicles": {
    title: "Chronicles - 7 Deadly Sins Card Game",
    description: "Explore the chronicles and lore of the 7 Deadly Sins Card Game. Dark fantasy narratives from the cathedral of judgment.",
  },
  "/practice": {
    title: "Practice Mode - 7 Deadly Sins Card Game",
    description: "Practice against AI opponents in the 7 Deadly Sins Card Game. Hone your skills before entering multiplayer matches.",
  },
  "/balance": {
    title: "Balance Analysis - 7 Deadly Sins Card Game",
    description: "Detailed statistical balance analysis of all 7 sin factions. Win rates, matchup matrices, and card efficiency data.",
  },
  "/changelog": {
    title: "Changelog - 7 Deadly Sins Card Game",
    description: "Version history and patch notes for the 7 Deadly Sins Card Game. Track balance changes, new features, and bug fixes.",
  },
  "/collection": {
    title: "Card Collection - 7 Deadly Sins Card Game",
    description: "Browse the complete card collection for all 7 sin factions. View card stats, effects, and artwork.",
  },
  "/matchups": {
    title: "Matchup Matrix - 7 Deadly Sins Card Game",
    description: "Faction matchup data and win rates for the 7 Deadly Sins Card Game. Find your best and worst matchups.",
  },
  "/terms": {
    title: "Terms of Service - 7 Deadly Sins Card Game",
    description: "Terms of service for the 7 Deadly Sins Card Game website.",
  },
  "/privacy": {
    title: "Privacy Policy - 7 Deadly Sins Card Game",
    description: "Privacy policy for the 7 Deadly Sins Card Game website.",
  },
  "/cookies": {
    title: "Cookie Policy - 7 Deadly Sins Card Game",
    description: "Cookie policy for the 7 Deadly Sins Card Game website.",
  },
  "/brandbook": {
    title: "Brand Book - 7 Deadly Sins Card Game",
    description: "Brand guidelines, visual identity, and design system for the 7 Deadly Sins Card Game.",
  },
};

function buildPrerenderHtml(opts: {
  title: string;
  description: string;
  url: string;
  ogImage?: string;
  articleContent?: string;
  jsonLd?: object;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string;
  category?: string;
}): string {
  const {
    title, description, url,
    ogImage = OG_IMAGE,
    articleContent = "",
    jsonLd,
    publishedTime, modifiedTime,
    keywords = "", category = "",
  } = opts;

  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description.slice(0, 320));

  let head = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">
  <link rel="canonical" href="${url}">
  <link rel="icon" type="image/x-icon" href="${FAVICON}">
  <link rel="icon" type="image/png" sizes="192x192" href="${ICON_192}">
  <meta name="theme-color" content="#1a1520">
  <meta property="og:type" content="${publishedTime ? "article" : "website"}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="7 Deadly Sins Card Game">`;

  if (publishedTime) head += `\n  <meta property="article:published_time" content="${publishedTime}">`;
  if (modifiedTime) head += `\n  <meta property="article:modified_time" content="${modifiedTime}">`;
  if (category) head += `\n  <meta property="article:section" content="${escapeHtml(category)}">`;

  head += `
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${ogImage}">`;

  if (keywords) head += `\n  <meta name="keywords" content="${escapeHtml(keywords)}">`;

  head += `
  <link rel="alternate" type="application/rss+xml" title="7 Deadly Sins Card Game Blog" href="${BASE_URL}/rss.xml">
  <link rel="alternate" type="text/plain" title="LLMs.txt" href="${BASE_URL}/llms.txt">`;

  if (jsonLd) head += `\n  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;

  head += `\n</head>`;

  return `${head}
<body>
  <header><nav>
    <a href="/">Home</a> | <a href="/how-to-play">How to Play</a> | <a href="/rules">Rules</a> |
    <a href="/blog">Blog</a> | <a href="/faq">FAQ</a> | <a href="/community">Community</a> |
    <a href="/deck-builder">Deck Builder</a>
  </nav></header>
  <main>${articleContent}</main>
  <footer>
    <p>&copy; 2025 7 Deadly Sins Card Game. All rights reserved.</p>
    <nav><a href="/terms">Terms</a> | <a href="/privacy">Privacy</a> | <a href="/cookies">Cookies</a> | <a href="/brandbook">Brand Book</a></nav>
  </footer>
</body>
</html>`;
}

function buildArticleJsonLd(post: {
  title: string; slug: string; metaDescription: string;
  category: string; keywords: string; featuredImage: string | null;
  publishedAt: Date; updatedAt: Date; readingTime: number;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    url: `${BASE_URL}/blog/${post.slug}`,
    image: post.featuredImage || OG_IMAGE,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "7 Deadly Sins Card Game", url: BASE_URL },
    publisher: { "@type": "Organization", name: "7 Deadly Sins Card Game", url: BASE_URL, logo: { "@type": "ImageObject", url: ICON_192 } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/blog/${post.slug}` },
    articleSection: post.category,
    keywords: post.keywords,
    wordCount: Math.round(post.readingTime * 200),
    timeRequired: `PT${post.readingTime}M`,
    inLanguage: "en",
    isAccessibleForFree: true,
  };
}

// ─── Prerender middleware for Vercel ────────────────────────────────────
// Intercepts bot requests for blog posts and static pages, returns fully
// rendered HTML. Non-bot requests get a minimal redirect/fallback.
app.get("/blog/:slug", async (req, res, next) => {
  const ua = req.headers["user-agent"] || "";
  if (!isBot(ua)) return next();

  try {
    const slug = req.params.slug;
    const post = await getBlogPostBySlug(slug);
    if (!post) return next();

    const jsonLd = buildArticleJsonLd(post);
    const html = buildPrerenderHtml({
      title: `${post.title} | 7 Deadly Sins Card Game Blog`,
      description: post.metaDescription,
      url: `${BASE_URL}/blog/${post.slug}`,
      ogImage: post.featuredImage || OG_IMAGE,
      articleContent: `<article>
        <h1>${escapeHtml(post.title)}</h1>
        <p><time datetime="${post.publishedAt.toISOString()}">${post.publishedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time> &middot; ${post.readingTime} min read &middot; ${escapeHtml(post.category)}</p>
        <p>${escapeHtml(post.metaDescription)}</p>
      </article>`,
      jsonLd,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      keywords: post.keywords,
      category: post.category,
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200");
    res.setHeader("X-Prerendered", "true");
    return res.status(200).send(html);
  } catch (err) {
    console.error("Prerender blog error:", err);
    return next();
  }
});

// Prerender static pages for bots
const PRERENDER_STATIC_PATHS = Object.keys(STATIC_PAGES);
for (const pagePath of PRERENDER_STATIC_PATHS) {
  if (pagePath === "/") continue; // homepage handled separately
  app.get(pagePath, (req, res, next) => {
    const ua = req.headers["user-agent"] || "";
    if (!isBot(ua)) return next();

    const config = STATIC_PAGES[pagePath];
    const html = buildPrerenderHtml({
      title: config.title,
      description: config.description,
      url: `${BASE_URL}${pagePath}`,
      articleContent: `<h1>${escapeHtml(config.title)}</h1><p>${escapeHtml(config.description)}</p>`,
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200");
    res.setHeader("X-Prerendered", "true");
    return res.status(200).send(html);
  });
}

// Homepage prerender
app.get("/", (req, res, next) => {
  const ua = req.headers["user-agent"] || "";
  if (!isBot(ua)) return next();

  const config = STATIC_PAGES["/"];
  const html = buildPrerenderHtml({
    title: config.title,
    description: config.description,
    url: BASE_URL,
    articleContent: `<h1>${escapeHtml(config.title)}</h1><p>${escapeHtml(config.description)}</p>`,
  });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200");
  res.setHeader("X-Prerendered", "true");
  return res.status(200).send(html);
});

// ─── Dynamic sitemap.xml ───────────────────────────────────────────────
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const slugs = await getAllBlogSlugs();
    const baseUrl = BASE_URL;

    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/blog", priority: "0.9", changefreq: "daily" },
      { loc: "/how-to-play", priority: "0.8", changefreq: "monthly" },
      { loc: "/rules", priority: "0.8", changefreq: "monthly" },
      { loc: "/faq", priority: "0.7", changefreq: "monthly" },
      { loc: "/collection", priority: "0.8", changefreq: "monthly" },
      { loc: "/balance", priority: "0.7", changefreq: "monthly" },
      { loc: "/matchups", priority: "0.7", changefreq: "monthly" },
      { loc: "/deck-builder", priority: "0.7", changefreq: "monthly" },
      { loc: "/community", priority: "0.6", changefreq: "weekly" },
      { loc: "/chronicles", priority: "0.6", changefreq: "monthly" },
      { loc: "/practice", priority: "0.6", changefreq: "monthly" },
      { loc: "/changelog", priority: "0.5", changefreq: "weekly" },
      { loc: "/terms", priority: "0.3", changefreq: "yearly" },
      { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
      { loc: "/cookies", priority: "0.3", changefreq: "yearly" },
      { loc: "/brandbook", priority: "0.3", changefreq: "yearly" },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const { slug, updatedAt } of slugs) {
      const lastmod = updatedAt
        ? new Date(updatedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${slug}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    res.status(500).send("Error generating sitemap");
  }
});

// ─── RSS feed ──────────────────────────────────────────────────────────
app.get("/rss.xml", async (_req, res) => {
  try {
    const posts = await getRecentBlogPosts(50);
    const baseUrl = BASE_URL;
    const now = posts.length > 0 && posts[0].publishedAt
      ? new Date(posts[0].publishedAt).toUTCString()
      : new Date().toUTCString();

    let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n`;
    rss += `<channel>\n`;
    rss += `  <title>7 Deadly Sins Card Game - Lore &amp; Strategy</title>\n`;
    rss += `  <link>${baseUrl}/blog</link>\n`;
    rss += `  <description>Dark fantasy lore, strategy guides, and mythology from the world of the 7 Deadly Sins Card Game.</description>\n`;
    rss += `  <language>en-us</language>\n`;
    rss += `  <lastBuildDate>${now}</lastBuildDate>\n`;
    rss += `  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;
    rss += `  <image>\n`;
    rss += `    <url>${OG_IMAGE}</url>\n`;
    rss += `    <title>7 Deadly Sins Card Game</title>\n`;
    rss += `    <link>${baseUrl}</link>\n`;
    rss += `  </image>\n`;

    for (const post of posts) {
      const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : now;
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const desc = (post.metaDescription || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const title = (post.title || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      rss += `  <item>\n`;
      rss += `    <title>${title}</title>\n`;
      rss += `    <link>${postUrl}</link>\n`;
      rss += `    <guid isPermaLink="true">${postUrl}</guid>\n`;
      rss += `    <pubDate>${pubDate}</pubDate>\n`;
      rss += `    <description>${desc}</description>\n`;
      rss += `    <category>${post.category}</category>\n`;
      if (post.featuredImage) {
        rss += `    <enclosure url="${post.featuredImage}" type="image/webp" length="0" />\n`;
      }
      rss += `  </item>\n`;
    }

    rss += `</channel>\n`;
    rss += `</rss>`;

    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(rss);
  } catch (err) {
    console.error("RSS feed generation error:", err);
    res.status(500).send("Error generating RSS feed");
  }
});

// OAuth routes (kept for backward compat, no-ops on Vercel with Supabase Auth)
registerOAuthRoutes(app);

// Chat routes
registerChatRoutes(app);

// tRPC middleware
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// ─── Catch-all for unhandled routes ──────────────────────────────────
// With Edge Middleware handling bot→API routing, only bot requests
// should reach this serverless function. Any unmatched routes get a 404.
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  // If a non-bot request somehow reaches here, redirect to the SPA root
  return res.redirect(302, req.path);
});

export default app;
