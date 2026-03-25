/**
 * SEO/AEO/GEO implementation tests
 *
 * Validates that all SEO improvements from the audit are correctly implemented:
 * - Canonical tag in index.html
 * - JSON-LD structured data (VideoGame, Organization, WebSite, FAQPage, BreadcrumbList, Speakable)
 * - Web manifest link
 * - llms.txt link tags
 * - Dynamic sitemap includes all pages
 * - robots.txt is comprehensive
 * - Alt tags are non-empty
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const CLIENT_DIR = path.resolve(__dirname, "../client");
const PUBLIC_DIR = path.join(CLIENT_DIR, "public");
const SRC_DIR = path.join(CLIENT_DIR, "src");

describe("SEO: index.html meta tags", () => {
  const indexHtml = fs.readFileSync(path.join(CLIENT_DIR, "index.html"), "utf-8");

  it("has a canonical link tag", () => {
    expect(indexHtml).toContain('rel="canonical"');
  });

  it("has Open Graph meta tags", () => {
    expect(indexHtml).toContain('property="og:title"');
    expect(indexHtml).toContain('property="og:description"');
    expect(indexHtml).toContain('property="og:type"');
    expect(indexHtml).toContain('property="og:image"');
  });

  it("has Twitter Card meta tags", () => {
    expect(indexHtml).toContain('name="twitter:card"');
    expect(indexHtml).toContain('name="twitter:title"');
  });

  it("has web manifest link", () => {
    expect(indexHtml).toContain('rel="manifest"');
    expect(indexHtml).toContain("site.webmanifest");
  });

  it("has llms.txt alternate link", () => {
    expect(indexHtml).toContain("/llms.txt");
    expect(indexHtml).toContain("/llms-full.txt");
  });

  it("has RSS feed link", () => {
    expect(indexHtml).toContain('type="application/rss+xml"');
  });
});

describe("SEO: JSON-LD structured data in index.html", () => {
  const indexHtml = fs.readFileSync(path.join(CLIENT_DIR, "index.html"), "utf-8");

  // Extract JSON-LD content
  const jsonLdMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const jsonLd = jsonLdMatch ? JSON.parse(jsonLdMatch[1]) : null;

  it("has a valid JSON-LD @graph array", () => {
    expect(jsonLd).toBeTruthy();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@graph"]).toBeInstanceOf(Array);
    expect(jsonLd["@graph"].length).toBeGreaterThanOrEqual(5);
  });

  it("includes VideoGame schema", () => {
    const videoGame = jsonLd["@graph"].find((item: any) => item["@type"] === "VideoGame");
    expect(videoGame).toBeTruthy();
    expect(videoGame.name).toContain("7 Deadly Sins");
    expect(videoGame.gamePlatform).toBe("Web Browser");
    expect(videoGame.isAccessibleForFree).toBe(true);
    expect(videoGame.numberOfPlayers).toBeTruthy();
  });

  it("includes Organization schema with sameAs and logo", () => {
    const org = jsonLd["@graph"].find((item: any) => item["@type"] === "Organization");
    expect(org).toBeTruthy();
    expect(org.sameAs).toBeInstanceOf(Array);
    expect(org.sameAs.length).toBeGreaterThanOrEqual(1);
    expect(org.logo).toBeTruthy();
  });

  it("includes WebSite schema with SearchAction", () => {
    const website = jsonLd["@graph"].find((item: any) => item["@type"] === "WebSite");
    expect(website).toBeTruthy();
    expect(website.potentialAction).toBeTruthy();
    expect(website.potentialAction["@type"]).toBe("SearchAction");
  });

  it("includes FAQPage schema with questions", () => {
    const faq = jsonLd["@graph"].find((item: any) => item["@type"] === "FAQPage");
    expect(faq).toBeTruthy();
    expect(faq.mainEntity).toBeInstanceOf(Array);
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(3);
    expect(faq.mainEntity[0]["@type"]).toBe("Question");
  });

  it("includes BreadcrumbList schema", () => {
    const breadcrumb = jsonLd["@graph"].find((item: any) => item["@type"] === "BreadcrumbList");
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb.itemListElement).toBeInstanceOf(Array);
    expect(breadcrumb.itemListElement.length).toBeGreaterThanOrEqual(3);
  });

  it("includes Speakable schema", () => {
    const speakable = jsonLd["@graph"].find((item: any) => item["@type"] === "WebPage" && item.speakable);
    expect(speakable).toBeTruthy();
    expect(speakable.speakable["@type"]).toBe("SpeakableSpecification");
  });
});

describe("SEO: robots.txt", () => {
  const robotsTxt = fs.readFileSync(path.join(PUBLIC_DIR, "robots.txt"), "utf-8");

  it("exists and is non-empty", () => {
    expect(robotsTxt.length).toBeGreaterThan(100);
  });

  it("allows Googlebot", () => {
    expect(robotsTxt).toContain("User-agent: Googlebot");
    expect(robotsTxt).toMatch(/User-agent: Googlebot[\s\S]*?Allow: \//);
  });

  it("references sitemap", () => {
    expect(robotsTxt).toContain("Sitemap:");
    expect(robotsTxt).toContain("sitemap.xml");
  });

  it("references llms.txt", () => {
    expect(robotsTxt).toContain("llms.txt");
    expect(robotsTxt).toContain("llms-full.txt");
  });

  it("blocks AI training crawlers", () => {
    expect(robotsTxt).toContain("GPTBot");
    expect(robotsTxt).toContain("CCBot");
  });
});

describe("SEO: sitemap.xml", () => {
  const sitemapXml = fs.readFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), "utf-8");

  it("is valid XML with urlset", () => {
    expect(sitemapXml).toContain("<urlset");
    expect(sitemapXml).toContain("</urlset>");
  });

  it("contains the homepage", () => {
    expect(sitemapXml).toContain("https://www.7sinscardgame.com/</loc>");
  });

  it("contains key pages", () => {
    const requiredPages = [
      "/how-to-play",
      "/blog",
      "/rules",
      "/deck-builder",
      "/community",
      "/chronicles",
      "/faq",
    ];
    for (const page of requiredPages) {
      expect(sitemapXml).toContain(page);
    }
  });

  it("has more than 480 URLs (blog posts + static pages)", () => {
    const urlCount = (sitemapXml.match(/<url>/g) || []).length;
    expect(urlCount).toBeGreaterThan(480);
  });
});

describe("SEO: llms.txt files", () => {
  it("llms.txt exists and has content", () => {
    const llmsTxt = fs.readFileSync(path.join(PUBLIC_DIR, "llms.txt"), "utf-8");
    expect(llmsTxt.length).toBeGreaterThan(200);
    expect(llmsTxt).toContain("7 Deadly Sins");
  });

  it("llms-full.txt exists and is larger than llms.txt", () => {
    const llmsTxt = fs.readFileSync(path.join(PUBLIC_DIR, "llms.txt"), "utf-8");
    const llmsFullTxt = fs.readFileSync(path.join(PUBLIC_DIR, "llms-full.txt"), "utf-8");
    expect(llmsFullTxt.length).toBeGreaterThan(llmsTxt.length);
  });
});

describe("SEO: web manifest", () => {
  it("site.webmanifest exists and is valid JSON", () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, "site.webmanifest"), "utf-8"));
    expect(manifest.name).toContain("7 Deadly Sins");
    expect(manifest.icons).toBeInstanceOf(Array);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(1);
    expect(manifest.display).toBe("standalone");
  });
});

describe("SEO: usePageMeta hook exists", () => {
  it("usePageMeta hook file exists", () => {
    const hookPath = path.join(SRC_DIR, "hooks", "usePageMeta.ts");
    expect(fs.existsSync(hookPath)).toBe(true);
  });

  it("usePageMeta supports noindex option", () => {
    const hookContent = fs.readFileSync(path.join(SRC_DIR, "hooks", "usePageMeta.ts"), "utf-8");
    expect(hookContent).toContain("noindex");
    expect(hookContent).toContain("canonical");
    expect(hookContent).toContain("og:title");
  });
});

describe("SEO: FAQ page exists", () => {
  it("FAQ.tsx page component exists", () => {
    const faqPath = path.join(SRC_DIR, "pages", "FAQ.tsx");
    expect(fs.existsSync(faqPath)).toBe(true);
  });

  it("FAQ page has FAQPage schema injection", () => {
    const faqContent = fs.readFileSync(path.join(SRC_DIR, "pages", "FAQ.tsx"), "utf-8");
    expect(faqContent).toContain("FAQPage");
    expect(faqContent).toContain("usePageMeta");
  });

  it("FAQ route is registered in App.tsx", () => {
    const appContent = fs.readFileSync(path.join(SRC_DIR, "App.tsx"), "utf-8");
    expect(appContent).toContain('"/faq"');
  });
});

describe("SEO: HowToPlay has HowTo schema", () => {
  it("HowToPlay page has HowTo schema injection", () => {
    const howToContent = fs.readFileSync(path.join(SRC_DIR, "pages", "HowToPlay.tsx"), "utf-8");
    expect(howToContent).toContain('"HowTo"');
    expect(howToContent).toContain("HowToStep");
  });
});

describe("Accessibility: alt tags", () => {
  it("no empty alt tags without aria-hidden in key pages", () => {
    const keyPages = ["Home.tsx", "HowToPlay.tsx", "FAQ.tsx"];
    for (const page of keyPages) {
      const pagePath = path.join(SRC_DIR, "pages", page);
      if (!fs.existsSync(pagePath)) continue;
      const content = fs.readFileSync(pagePath, "utf-8");
      // Find all alt="" that don't have aria-hidden nearby
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('alt=""') && !lines[i].includes("aria-hidden")) {
          // This is a violation
          throw new Error(`${page}:${i + 1} has empty alt="" without aria-hidden`);
        }
      }
    }
  });
});

describe("SEO: dynamic sitemap includes all static pages", () => {
  it("server/_core/index.ts includes all required static pages in sitemap", () => {
    const serverIndex = fs.readFileSync(path.resolve(__dirname, "_core/index.ts"), "utf-8");
    const requiredPages = [
      "/how-to-play",
      "/practice",
      "/community",
      "/chronicles",
      "/faq",
      "/terms",
      "/privacy",
      "/cookies",
      "/brandbook",
    ];
    for (const page of requiredPages) {
      expect(serverIndex).toContain(`"${page}"`);
    }
  });
});
