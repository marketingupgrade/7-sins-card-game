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
