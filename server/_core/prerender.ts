/**
 * Prerender middleware for SEO crawlers and bots.
 *
 * Serves fully rendered HTML (with meta tags, JSON-LD, and article content)
 * to non-JS crawlers so blog posts and key pages are indexable.
 * Human visitors still get the SPA.
 */
import type { Request, Response, NextFunction } from "express";

const BASE_URL = "https://www.7sinscardgame.com";
const OG_IMAGE = "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/og-banner-7a8HHUKyS9YrWQLuM7Cgyi.png";
const FAVICON = "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/favicon_f4fbfc17.ico";
const ICON_192 = "https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/7s-icon-192x192_8dcc7e63.png";

// Known bot user-agent patterns (search engines, AI crawlers, social media)
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
  return BOT_UA_PATTERNS.some((pattern) => pattern.test(ua));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Strip HTML tags to get plain text for meta descriptions
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Build a full HTML page with meta tags and content for crawlers.
 */
function buildHtmlPage(opts: {
  title: string;
  description: string;
  url: string;
  ogImage?: string;
  canonicalUrl?: string;
  articleContent?: string;
  jsonLd?: object;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string;
  category?: string;
}): string {
  const {
    title,
    description,
    url,
    ogImage = OG_IMAGE,
    canonicalUrl,
    articleContent = "",
    jsonLd,
    publishedTime,
    modifiedTime,
    author = "7 Deadly Sins Card Game",
    keywords = "",
    category = "",
  } = opts;

  const canonical = canonicalUrl || url;
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description.slice(0, 320));

  let head = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/x-icon" href="${FAVICON}">
  <link rel="icon" type="image/png" sizes="192x192" href="${ICON_192}">
  <meta name="theme-color" content="#1a1520">
  <!-- Open Graph -->
  <meta property="og:type" content="${publishedTime ? "article" : "website"}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="7 Deadly Sins Card Game">`;

  if (publishedTime) {
    head += `\n  <meta property="article:published_time" content="${publishedTime}">`;
  }
  if (modifiedTime) {
    head += `\n  <meta property="article:modified_time" content="${modifiedTime}">`;
  }
  if (author) {
    head += `\n  <meta property="article:author" content="${escapeHtml(author)}">`;
  }
  if (category) {
    head += `\n  <meta property="article:section" content="${escapeHtml(category)}">`;
  }

  head += `
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${ogImage}">`;

  if (keywords) {
    head += `\n  <meta name="keywords" content="${escapeHtml(keywords)}">`;
  }

  head += `
  <!-- Alternate -->
  <link rel="alternate" type="application/rss+xml" title="7 Deadly Sins Card Game Blog" href="${BASE_URL}/rss.xml">
  <link rel="alternate" type="text/plain" title="LLMs.txt" href="${BASE_URL}/llms.txt">`;

  if (jsonLd) {
    head += `\n  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
  }

  head += `\n</head>`;

  const body = `<body>
  <header>
    <nav>
      <a href="/">Home</a> |
      <a href="/how-to-play">How to Play</a> |
      <a href="/rules">Rules</a> |
      <a href="/blog">Blog</a> |
      <a href="/faq">FAQ</a> |
      <a href="/community">Community</a> |
      <a href="/deck-builder">Deck Builder</a>
    </nav>
  </header>
  <main>
    ${articleContent}
  </main>
  <footer>
    <p>&copy; 2025 7 Deadly Sins Card Game. All rights reserved.</p>
    <nav>
      <a href="/terms">Terms</a> |
      <a href="/privacy">Privacy</a> |
      <a href="/cookies">Cookies</a> |
      <a href="/brandbook">Brand Book</a>
    </nav>
  </footer>
</body>
</html>`;

  return head + "\n" + body;
}

/**
 * Build Article JSON-LD for a blog post
 */
function buildArticleJsonLd(post: {
  title: string;
  slug: string;
  metaDescription: string;
  category: string;
  keywords: string;
  featuredImage: string | null;
  publishedAt: Date;
  updatedAt: Date;
  readingTime: number;
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
    author: {
      "@type": "Organization",
      name: "7 Deadly Sins Card Game",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "7 Deadly Sins Card Game",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: ICON_192,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${post.slug}`,
    },
    articleSection: post.category,
    keywords: post.keywords,
    wordCount: Math.round(post.readingTime * 200),
    timeRequired: `PT${post.readingTime}M`,
    inLanguage: "en",
    isAccessibleForFree: true,
  };
}

/**
 * Static page metadata for prerendering
 */
const STATIC_PAGES: Record<
  string,
  { title: string; description: string; jsonLdType?: string }
> = {
  "/": {
    title: "7 Deadly Sins Card Game - Choose Your Sin | Free PvP Strategy Card Game",
    description:
      "A free strategic 4-player PvP card game where seven deadly sins clash in a gothic cathedral. Choose your sin, master compound mechanics, and outlast your rivals across 20 rounds of judgment.",
  },
  "/how-to-play": {
    title: "How to Play the 7 Deadly Sins Card Game - Step-by-Step Guide",
    description:
      "Learn how to play the 7 Deadly Sins Card Game in 6 easy steps. Choose your sin faction, build your deck, master the energy system, and dominate the arena.",
  },
  "/rules": {
    title: "Game Rules - 7 Deadly Sins Card Game",
    description:
      "Complete rules reference for the 7 Deadly Sins Card Game. Energy system, compound mechanics, Fibonacci scaling, faction passives, and win conditions explained.",
  },
  "/faq": {
    title: "FAQ - 7 Deadly Sins Card Game",
    description:
      "Frequently asked questions about the 7 Deadly Sins Card Game. Learn about gameplay, factions, energy system, multiplayer, and more.",
  },
  "/blog": {
    title: "Blog - 7 Deadly Sins Card Game | Lore, Strategy & Mythology",
    description:
      "Dark fantasy lore, strategy guides, and mythology from the world of the 7 Deadly Sins Card Game. Explore sin traditions from Dante, Buddhist, Norse, Japanese, and Celtic cultures.",
  },
  "/community": {
    title: "Community Decks - 7 Deadly Sins Card Game",
    description:
      "Browse and share community-created decks for the 7 Deadly Sins Card Game. Find the best strategies for each sin faction.",
  },
  "/deck-builder": {
    title: "Deck Builder - 7 Deadly Sins Card Game",
    description:
      "Build and customize your deck for the 7 Deadly Sins Card Game. Choose cards, optimize your strategy, and prepare for battle.",
  },
  "/chronicles": {
    title: "Chronicles - 7 Deadly Sins Card Game",
    description:
      "Explore the chronicles and lore of the 7 Deadly Sins Card Game. Dark fantasy narratives from the cathedral of judgment.",
  },
  "/practice": {
    title: "Practice Mode - 7 Deadly Sins Card Game",
    description:
      "Practice against AI opponents in the 7 Deadly Sins Card Game. Hone your skills before entering multiplayer matches.",
  },
  "/balance": {
    title: "Balance Analysis - 7 Deadly Sins Card Game",
    description:
      "Detailed statistical balance analysis of all 7 sin factions. Win rates, matchup matrices, and card efficiency data.",
  },
  "/changelog": {
    title: "Changelog - 7 Deadly Sins Card Game",
    description:
      "Version history and patch notes for the 7 Deadly Sins Card Game. Track balance changes, new features, and bug fixes.",
  },
  "/collection": {
    title: "Card Collection - 7 Deadly Sins Card Game",
    description:
      "Browse the complete card collection for all 7 sin factions. View card stats, effects, and artwork.",
  },
  "/matchups": {
    title: "Matchup Matrix - 7 Deadly Sins Card Game",
    description:
      "Faction matchup data and win rates for the 7 Deadly Sins Card Game. Find your best and worst matchups.",
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
    description:
      "Brand guidelines, visual identity, and design system for the 7 Deadly Sins Card Game.",
  },
};

/**
 * Express middleware: intercepts bot requests for blog posts and static pages,
 * returns fully rendered HTML. Non-bot requests pass through to the SPA.
 */
export function prerenderMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ua = req.headers["user-agent"] || "";

    // Only intercept GET requests from bots
    if (req.method !== "GET" || !isBot(ua)) {
      return next();
    }

    const path = req.path;

    // Skip API routes, assets, and static files
    if (
      path.startsWith("/api/") ||
      path.startsWith("/assets/") ||
      path.startsWith("/src/") ||
      path.match(/\.\w{2,5}$/) // files with extensions (.js, .css, .png, etc.)
    ) {
      return next();
    }

    try {
      // Blog post route: /blog/:slug
      const blogMatch = path.match(/^\/blog\/([a-z0-9-]+)$/);
      if (blogMatch) {
        const slug = blogMatch[1];
        const { getBlogPostBySlug } = await import("../db-supabase");
        const post = await getBlogPostBySlug(slug);
        if (post) {
          // Strip HTML/markdown styling from content for clean crawler text
          const cleanContent = post.content.startsWith("<")
            ? post.content
            : `<article><h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.metaDescription)}</p>${escapeHtml(post.content)}</article>`;

          const jsonLd = buildArticleJsonLd(post);

          const html = buildHtmlPage({
            title: `${post.title} | 7 Deadly Sins Card Game Blog`,
            description: post.metaDescription,
            url: `${BASE_URL}/blog/${post.slug}`,
            ogImage: post.featuredImage || OG_IMAGE,
            articleContent: `<article>
              <h1>${escapeHtml(post.title)}</h1>
              <p><time datetime="${post.publishedAt.toISOString()}">${post.publishedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time> &middot; ${post.readingTime} min read &middot; ${escapeHtml(post.category)}</p>
              <p>${escapeHtml(post.metaDescription)}</p>
              <div>${cleanContent}</div>
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
        }
        // Post not found, fall through to SPA (which shows 404)
        return next();
      }

      // Static pages
      const pageConfig = STATIC_PAGES[path];
      if (pageConfig) {
        const html = buildHtmlPage({
          title: pageConfig.title,
          description: pageConfig.description,
          url: `${BASE_URL}${path === "/" ? "" : path}`,
          articleContent: `<h1>${escapeHtml(pageConfig.title)}</h1><p>${escapeHtml(pageConfig.description)}</p>`,
        });

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200");
        res.setHeader("X-Prerendered", "true");
        return res.status(200).send(html);
      }

      // Not a prerenderable route, pass through to SPA
      return next();
    } catch (err) {
      console.error("Prerender error:", err);
      return next();
    }
  };
}
