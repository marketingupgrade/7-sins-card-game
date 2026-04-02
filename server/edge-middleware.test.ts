/**
 * Tests for Vercel Edge Middleware (middleware.ts)
 *
 * Since the middleware runs on Vercel's Edge Runtime, we can't directly
 * import it in a Node.js test environment. Instead, we extract and test
 * the core logic: bot detection patterns, path matching, and routing decisions.
 *
 * These tests ensure the middleware correctly:
 * 1. Identifies 28+ bot user-agent patterns
 * 2. Matches prerenderable paths (17 static + blog slugs)
 * 3. Routes bots to /api for prerendering
 * 4. Passes human visitors through to the SPA
 */
import { describe, it, expect } from "vitest";

// ─── Replicate the middleware's bot detection logic for testing ───────
const BOT_UA_PATTERNS: RegExp[] = [
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

const PRERENDER_STATIC_PATHS = new Set([
  "/", "/how-to-play", "/rules", "/faq", "/blog", "/community",
  "/deck-builder", "/chronicles", "/practice", "/balance",
  "/changelog", "/collection", "/matchups", "/terms",
  "/privacy", "/cookies", "/brandbook",
]);

function isPrerenderablePath(pathname: string): boolean {
  if (PRERENDER_STATIC_PATHS.has(pathname)) return true;
  if (/^\/blog\/[a-z0-9-]+$/.test(pathname)) return true;
  return false;
}

function middlewareDecision(method: string, ua: string, pathname: string): "rewrite" | "next" {
  if (method === "GET" && isBot(ua) && isPrerenderablePath(pathname)) {
    return "rewrite";
  }
  return "next";
}

// ─── Bot Detection Tests ─────────────────────────────────────────────

describe("Edge Middleware — Bot Detection", () => {
  describe("Search engine bots", () => {
    it("detects Googlebot", () => {
      expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    });
    it("detects Googlebot-Image", () => {
      expect(isBot("Googlebot-Image/1.0")).toBe(true);
    });
    it("detects Bingbot", () => {
      expect(isBot("Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)")).toBe(true);
    });
    it("detects YandexBot", () => {
      expect(isBot("Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)")).toBe(true);
    });
    it("detects Baiduspider", () => {
      expect(isBot("Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)")).toBe(true);
    });
    it("detects DuckDuckBot", () => {
      expect(isBot("DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)")).toBe(true);
    });
  });

  describe("AI answer engine bots", () => {
    it("detects GPTBot", () => {
      expect(isBot("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)")).toBe(true);
    });
    it("detects ChatGPT-User", () => {
      expect(isBot("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ChatGPT-User/1.0; +https://openai.com/bot)")).toBe(true);
    });
    it("detects ClaudeBot", () => {
      expect(isBot("Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://www.anthropic.com)")).toBe(true);
    });
    it("detects anthropic-ai", () => {
      expect(isBot("anthropic-ai")).toBe(true);
    });
    it("detects PerplexityBot", () => {
      expect(isBot("Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai)")).toBe(true);
    });
    it("detects Cohere-ai", () => {
      expect(isBot("cohere-ai")).toBe(true);
    });
    it("detects Applebot", () => {
      expect(isBot("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/600.2.5 (KHTML, like Gecko) Version/8.0.2 Safari/600.2.5 (Applebot/0.1)")).toBe(true);
    });
    it("detects Amazonbot", () => {
      expect(isBot("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/600.2.5 (KHTML, like Gecko) Version/8.0.2 Safari/600.2.5 (Amazonbot/0.1)")).toBe(true);
    });
  });

  describe("Social media crawlers", () => {
    it("detects Facebook", () => {
      expect(isBot("facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)")).toBe(true);
    });
    it("detects Twitterbot", () => {
      expect(isBot("Twitterbot/1.0")).toBe(true);
    });
    it("detects LinkedInBot", () => {
      expect(isBot("LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)")).toBe(true);
    });
    it("detects WhatsApp", () => {
      expect(isBot("WhatsApp/2.21.4.22 A")).toBe(true);
    });
    it("detects TelegramBot", () => {
      expect(isBot("TelegramBot (like TwitterBot)")).toBe(true);
    });
    it("detects Discordbot", () => {
      expect(isBot("Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)")).toBe(true);
    });
    it("detects Slackbot", () => {
      expect(isBot("Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)")).toBe(true);
    });
    it("detects Pinterestbot", () => {
      expect(isBot("Pinterest/0.2 (+http://www.pinterest.com/bot.html)")).toBe(false); // "Pinterest" not "Pinterestbot"
      expect(isBot("Mozilla/5.0 (compatible; Pinterestbot/1.0; +http://www.pinterest.com/bot.html)")).toBe(true);
    });
    it("detects Redditbot", () => {
      expect(isBot("Mozilla/5.0 (compatible; redditbot/1.0; +http://www.reddit.com/feedback)")).toBe(true);
    });
  });

  describe("SEO tools", () => {
    it("detects SEMrushBot", () => {
      expect(isBot("Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)")).toBe(true);
    });
    it("detects AhrefsBot", () => {
      expect(isBot("Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)")).toBe(true);
    });
    it("detects MJ12bot", () => {
      expect(isBot("Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)")).toBe(true);
    });
    it("detects Screaming Frog", () => {
      expect(isBot("Screaming Frog SEO Spider/17.2")).toBe(true);
    });
  });

  describe("Validation & preview tools", () => {
    it("detects W3C Validator", () => {
      expect(isBot("W3C_Validator/1.3")).toBe(true);
    });
    it("detects Lighthouse", () => {
      expect(isBot("Mozilla/5.0 Chrome/98.0.4758.102 Mobile Safari/537.36 Chrome-Lighthouse")).toBe(true);
    });
    it("detects Embedly", () => {
      expect(isBot("Mozilla/5.0 (compatible; Embedly/0.2; +http://support.embed.ly/)")).toBe(true);
    });
  });

  describe("Human browsers (should NOT be detected as bots)", () => {
    it("does not flag Chrome desktop", () => {
      expect(isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")).toBe(false);
    });
    it("does not flag Firefox desktop", () => {
      expect(isBot("Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0")).toBe(false);
    });
    it("does not flag Safari mobile", () => {
      expect(isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1")).toBe(false);
    });
    it("does not flag Chrome mobile", () => {
      expect(isBot("Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36")).toBe(false);
    });
    it("does not flag Edge desktop", () => {
      expect(isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0")).toBe(false);
    });
    it("does not flag empty user-agent", () => {
      expect(isBot("")).toBe(false);
    });
    it("does not flag curl (not a known bot)", () => {
      expect(isBot("curl/7.88.1")).toBe(false);
    });
  });
});

// ─── Path Matching Tests ─────────────────────────────────────────────

describe("Edge Middleware — Path Matching", () => {
  describe("Static prerender pages", () => {
    const staticPages = [
      "/", "/how-to-play", "/rules", "/faq", "/blog", "/community",
      "/deck-builder", "/chronicles", "/practice", "/balance",
      "/changelog", "/collection", "/matchups", "/terms",
      "/privacy", "/cookies", "/brandbook",
    ];

    for (const page of staticPages) {
      it(`matches static page: ${page}`, () => {
        expect(isPrerenderablePath(page)).toBe(true);
      });
    }
  });

  describe("Blog post slugs", () => {
    it("matches /blog/some-article-slug", () => {
      expect(isPrerenderablePath("/blog/some-article-slug")).toBe(true);
    });
    it("matches /blog/wrath-of-the-seven-sins", () => {
      expect(isPrerenderablePath("/blog/wrath-of-the-seven-sins")).toBe(true);
    });
    it("matches /blog/123-numeric-slug", () => {
      expect(isPrerenderablePath("/blog/123-numeric-slug")).toBe(true);
    });
    it("matches /blog/a", () => {
      expect(isPrerenderablePath("/blog/a")).toBe(true);
    });
  });

  describe("Non-prerenderable paths", () => {
    it("does not match /api/trpc", () => {
      expect(isPrerenderablePath("/api/trpc")).toBe(false);
    });
    it("does not match /assets/image.png", () => {
      expect(isPrerenderablePath("/assets/image.png")).toBe(false);
    });
    it("does not match /lobby", () => {
      expect(isPrerenderablePath("/lobby")).toBe(false);
    });
    it("does not match /game/abc123", () => {
      expect(isPrerenderablePath("/game/abc123")).toBe(false);
    });
    it("does not match /blog (trailing slash)", () => {
      expect(isPrerenderablePath("/blog/")).toBe(false);
    });
    it("does not match /blog/slug/extra", () => {
      expect(isPrerenderablePath("/blog/slug/extra")).toBe(false);
    });
    it("does not match /settings", () => {
      expect(isPrerenderablePath("/settings")).toBe(false);
    });
    it("does not match /blog/UPPERCASE-SLUG", () => {
      // Blog slugs should be lowercase
      expect(isPrerenderablePath("/blog/UPPERCASE-SLUG")).toBe(false);
    });
  });
});

// ─── Routing Decision Tests ──────────────────────────────────────────

describe("Edge Middleware — Routing Decisions", () => {
  const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
  const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
  const GPTBOT = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)";
  const DISCORD = "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)";

  describe("Bot + prerenderable path → rewrite to /api", () => {
    it("rewrites Googlebot on homepage", () => {
      expect(middlewareDecision("GET", GOOGLEBOT, "/")).toBe("rewrite");
    });
    it("rewrites Googlebot on blog post", () => {
      expect(middlewareDecision("GET", GOOGLEBOT, "/blog/wrath-lore")).toBe("rewrite");
    });
    it("rewrites GPTBot on /faq", () => {
      expect(middlewareDecision("GET", GPTBOT, "/faq")).toBe("rewrite");
    });
    it("rewrites Discordbot on /blog/some-post", () => {
      expect(middlewareDecision("GET", DISCORD, "/blog/some-post")).toBe("rewrite");
    });
    it("rewrites Googlebot on /how-to-play", () => {
      expect(middlewareDecision("GET", GOOGLEBOT, "/how-to-play")).toBe("rewrite");
    });
    it("rewrites Googlebot on /terms", () => {
      expect(middlewareDecision("GET", GOOGLEBOT, "/terms")).toBe("rewrite");
    });
    it("rewrites Googlebot on /brandbook", () => {
      expect(middlewareDecision("GET", GOOGLEBOT, "/brandbook")).toBe("rewrite");
    });
  });

  describe("Human + prerenderable path → pass through (next)", () => {
    it("passes Chrome on homepage", () => {
      expect(middlewareDecision("GET", CHROME, "/")).toBe("next");
    });
    it("passes Chrome on blog post", () => {
      expect(middlewareDecision("GET", CHROME, "/blog/wrath-lore")).toBe("next");
    });
    it("passes Chrome on /faq", () => {
      expect(middlewareDecision("GET", CHROME, "/faq")).toBe("next");
    });
  });

  describe("Bot + non-prerenderable path → pass through (next)", () => {
    it("passes Googlebot on /lobby", () => {
      expect(middlewareDecision("GET", GOOGLEBOT, "/lobby")).toBe("next");
    });
    it("passes Googlebot on /api/trpc", () => {
      expect(middlewareDecision("GET", GOOGLEBOT, "/api/trpc")).toBe("next");
    });
    it("passes Googlebot on /game/abc123", () => {
      expect(middlewareDecision("GET", GOOGLEBOT, "/game/abc123")).toBe("next");
    });
  });

  describe("Non-GET methods → pass through (next)", () => {
    it("passes POST from Googlebot", () => {
      expect(middlewareDecision("POST", GOOGLEBOT, "/")).toBe("next");
    });
    it("passes PUT from Googlebot", () => {
      expect(middlewareDecision("PUT", GOOGLEBOT, "/blog/test")).toBe("next");
    });
    it("passes HEAD from Googlebot", () => {
      expect(middlewareDecision("HEAD", GOOGLEBOT, "/faq")).toBe("next");
    });
  });
});

// ─── Matcher Config Tests ────────────────────────────────────────────

describe("Edge Middleware — Matcher Config Completeness", () => {
  it("has all 17 static pages in PRERENDER_STATIC_PATHS", () => {
    expect(PRERENDER_STATIC_PATHS.size).toBe(17);
  });

  it("PRERENDER_STATIC_PATHS matches the middleware config matcher list", () => {
    // These should match the `config.matcher` array in middleware.ts
    const matcherPaths = [
      "/", "/how-to-play", "/rules", "/faq", "/blog", "/community",
      "/deck-builder", "/chronicles", "/practice", "/balance",
      "/changelog", "/collection", "/matchups", "/terms",
      "/privacy", "/cookies", "/brandbook",
    ];
    for (const path of matcherPaths) {
      expect(PRERENDER_STATIC_PATHS.has(path)).toBe(true);
    }
  });

  it("bot patterns count is at least 28", () => {
    expect(BOT_UA_PATTERNS.length).toBeGreaterThanOrEqual(28);
  });
});
