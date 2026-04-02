/**
 * Vercel Edge Middleware — Bot Detection & Prerender Routing
 *
 * Runs at the Vercel CDN edge (< 1ms cold start) before any serverless
 * function or static file is served. Detects bot/crawler user-agents and
 * rewrites their requests to the /api serverless function, which returns
 * fully prerendered HTML with meta tags, JSON-LD, and article content.
 *
 * Human visitors pass through untouched and receive the React SPA from
 * static files (index.html) as usual.
 *
 * Architecture:
 *   Bot → Edge Middleware → rewrite to /api → prerender HTML
 *   Human → Edge Middleware → pass through → static SPA
 *
 * @see server/_core/prerender.ts for the Express-level prerender logic
 * @see api/_source.ts for the Vercel serverless function
 */
import { rewrite, next } from "@vercel/functions";

// ─── Bot User-Agent Patterns ─────────────────────────────────────────
// 28+ patterns covering search engines, AI crawlers, social media bots,
// SEO tools, and validation services.
const BOT_UA_PATTERNS: RegExp[] = [
  // Search engines
  /googlebot/i,
  /bingbot/i,
  /yandexbot/i,
  /baiduspider/i,
  /duckduckbot/i,
  /slurp/i,
  /ia_archiver/i,
  // Social media crawlers
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /telegrambot/i,
  /discordbot/i,
  /slackbot/i,
  /pinterestbot/i,
  /redditbot/i,
  // AI answer engines & crawlers
  /gptbot/i,
  /chatgpt-user/i,
  /claudebot/i,
  /anthropic-ai/i,
  /perplexitybot/i,
  /cohere-ai/i,
  /applebot/i,
  /amazonbot/i,
  // SEO tools
  /petalbot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /mj12bot/i,
  /dotbot/i,
  /rogerbot/i,
  /screaming frog/i,
  // Link preview & validation
  /embedly/i,
  /quora link preview/i,
  /outbrain/i,
  /w3c_validator/i,
  /lighthouse/i,
];

/**
 * Check if a user-agent string matches any known bot pattern.
 */
function isBot(ua: string): boolean {
  return BOT_UA_PATTERNS.some((pattern) => pattern.test(ua));
}

// ─── Paths that should be prerendered for bots ───────────────────────
// These are the static pages and blog routes that have prerender support
// in the API serverless function.
const PRERENDER_STATIC_PATHS = new Set([
  "/",
  "/how-to-play",
  "/rules",
  "/faq",
  "/blog",
  "/community",
  "/deck-builder",
  "/chronicles",
  "/practice",
  "/balance",
  "/changelog",
  "/collection",
  "/matchups",
  "/terms",
  "/privacy",
  "/cookies",
  "/brandbook",
]);

/**
 * Check if a pathname should be prerendered for bots.
 * Matches static pages and /blog/:slug routes.
 */
function isPrerenderablePath(pathname: string): boolean {
  // Exact match for static pages
  if (PRERENDER_STATIC_PATHS.has(pathname)) return true;
  // Blog post routes: /blog/some-slug
  if (/^\/blog\/[a-z0-9-]+$/.test(pathname)) return true;
  return false;
}

// ─── Edge Middleware Handler ─────────────────────────────────────────
export default function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const ua = request.headers.get("user-agent") || "";

  // Only intercept GET requests from bots on prerenderable paths
  if (request.method === "GET" && isBot(ua) && isPrerenderablePath(pathname)) {
    // Rewrite bot request to the /api serverless function for prerendering.
    // The original pathname is preserved so Express can route it properly.
    return rewrite(new URL("/api" + pathname + url.search, request.url));
  }

  // All other requests pass through to static files / SPA
  return next();
}

// ─── Matcher Configuration ───────────────────────────────────────────
// Only run middleware on paths that could be prerendered.
// Excludes static assets, API routes, and file extensions to minimize
// edge invocations and keep costs low.
export const config = {
  matcher: [
    // Match root
    "/",
    // Match all static prerender pages
    "/how-to-play",
    "/rules",
    "/faq",
    "/blog",
    "/community",
    "/deck-builder",
    "/chronicles",
    "/practice",
    "/balance",
    "/changelog",
    "/collection",
    "/matchups",
    "/terms",
    "/privacy",
    "/cookies",
    "/brandbook",
    // Match blog post slugs
    "/blog/:slug",
  ],
};
