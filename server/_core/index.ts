import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerChatRoutes } from "./chat";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    // CSP: allow self, Supabase CDN for fonts/images, inline styles for Tailwind
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://xqotfmrlhqiayiyjijpl.supabase.co https://*.supabase.co",
        "font-src 'self' https://xqotfmrlhqiayiyjijpl.supabase.co",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ")
    );
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });
  // Dynamic sitemap.xml
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const { getAllBlogSlugs } = await import("../db-supabase");
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
        const lastmod = updatedAt ? new Date(updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
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
      const { getRecentBlogPosts } = await import("../db-supabase");
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
      rss += `    <url>https://xqotfmrlhqiayiyjijpl.supabase.co/storage/v1/object/public/assets/og-banner-7a8HHUKyS9YrWQLuM7Cgyi.png</url>\n`;
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
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
