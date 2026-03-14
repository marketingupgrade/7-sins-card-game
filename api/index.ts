/**
 * Vercel Serverless Function Entry Point
 * 
 * This file creates and exports the Express app for Vercel's serverless runtime.
 * It mirrors the setup in server/_core/index.ts but WITHOUT calling app.listen()
 * since Vercel handles the HTTP layer.
 * 
 * Local development still uses server/_core/index.ts with app.listen().
 */

import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerChatRoutes } from "../server/_core/chat";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

// Body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// Dynamic sitemap.xml
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const { getAllBlogSlugs } = await import("../server/db");
    const slugs = await getAllBlogSlugs();
    const baseUrl = "https://www.7sinscardgame.com";

    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/blog", priority: "0.9", changefreq: "daily" },
      { loc: "/collection", priority: "0.8", changefreq: "monthly" },
      { loc: "/balance", priority: "0.7", changefreq: "monthly" },
      { loc: "/matchups", priority: "0.7", changefreq: "monthly" },
      { loc: "/rules", priority: "0.8", changefreq: "monthly" },
      { loc: "/changelog", priority: "0.5", changefreq: "weekly" },
      { loc: "/deck-builder", priority: "0.7", changefreq: "monthly" },
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

// RSS feed
app.get("/rss.xml", async (_req, res) => {
  try {
    const { getRecentBlogPosts } = await import("../server/db");
    const posts = await getRecentBlogPosts(50);
    const baseUrl = "https://www.7sinscardgame.com";
    const now = posts.length > 0 && posts[0].publishedAt
      ? new Date(posts[0].publishedAt).toUTCString()
      : new Date().toUTCString();

    let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n`;
    rss += `<channel>\n`;
    rss += `  <title>7 Deadly Sins Card Game - Lore &amp; Strategy</title>\n`;
    rss += `  <link>${baseUrl}/blog</link>\n`;
    rss += `  <description>Dark fantasy lore, strategy guides, and mythology from the world of the 7 Deadly Sins Card Game. Free PvP card game infused with Dante, Buddhist, Norse, Japanese, and Celtic sin traditions.</description>\n`;
    rss += `  <language>en-us</language>\n`;
    rss += `  <lastBuildDate>${now}</lastBuildDate>\n`;
    rss += `  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;
    rss += `  <image>\n`;
    rss += `    <url>https://d2xsxph8kpxj0f.cloudfront.net/310419663028555243/o77RcHv9EmwRBvLHbxTivs/og-banner-7a8HHUKyS9YrWQLuM7Cgyi.png</url>\n`;
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

// OAuth callback under /api/oauth/callback
registerOAuthRoutes(app);

// Chat API with streaming and tool calling
registerChatRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Export the Express app for Vercel serverless
export default app;
