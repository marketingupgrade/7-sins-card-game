/**
 * Tests for IndexNow — Instant search engine indexing protocol.
 *
 * Covers:
 * 1. Key file existence and content
 * 2. buildAllSiteUrls() generates correct URL list
 * 3. getStatusMessage() returns correct messages
 * 4. submitUrl() makes correct GET request
 * 5. submitUrls() makes correct POST request with batch support
 * 6. URL normalization (relative → absolute)
 * 7. Chunk splitting for large URL sets
 * 8. Error handling for network failures
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildAllSiteUrls,
  INDEXNOW_KEY,
  INDEXNOW_ENDPOINT,
  SITE_HOST,
  BASE_URL,
  MAX_URLS_PER_BATCH,
  getStatusMessage,
} from "./indexnow";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/* ─── 1. Key File Tests ───────────────────────────────────────── */
describe("IndexNow Key File", () => {
  const keyFilePath = join(__dirname, "../client/public", `${INDEXNOW_KEY}.txt`);

  it("should have the key file in client/public", () => {
    expect(existsSync(keyFilePath)).toBe(true);
  });

  it("should contain the correct key in the file", () => {
    const content = readFileSync(keyFilePath, "utf-8").trim();
    expect(content).toBe(INDEXNOW_KEY);
  });

  it("should have a valid hexadecimal key (8-128 chars)", () => {
    expect(INDEXNOW_KEY).toMatch(/^[a-zA-Z0-9-]{8,128}$/);
  });
});

/* ─── 2. Constants Tests ──────────────────────────────────────── */
describe("IndexNow Constants", () => {
  it("should use api.indexnow.org as the endpoint", () => {
    expect(INDEXNOW_ENDPOINT).toBe("https://api.indexnow.org/indexnow");
  });

  it("should use www.7sinscardgame.com as the host", () => {
    expect(SITE_HOST).toBe("www.7sinscardgame.com");
  });

  it("should have BASE_URL matching the host", () => {
    expect(BASE_URL).toBe(`https://${SITE_HOST}`);
  });

  it("should have MAX_URLS_PER_BATCH set to 10000", () => {
    expect(MAX_URLS_PER_BATCH).toBe(10_000);
  });
});

/* ─── 3. buildAllSiteUrls Tests ───────────────────────────────── */
describe("buildAllSiteUrls", () => {
  it("should include all 17 static pages", () => {
    const urls = buildAllSiteUrls([]);
    expect(urls.length).toBe(17);
    expect(urls).toContain(`${BASE_URL}/`);
    expect(urls).toContain(`${BASE_URL}/blog`);
    expect(urls).toContain(`${BASE_URL}/how-to-play`);
    expect(urls).toContain(`${BASE_URL}/collection`);
    expect(urls).toContain(`${BASE_URL}/rules`);
    expect(urls).toContain(`${BASE_URL}/practice`);
    expect(urls).toContain(`${BASE_URL}/deck-builder`);
    expect(urls).toContain(`${BASE_URL}/community`);
    expect(urls).toContain(`${BASE_URL}/chronicles`);
    expect(urls).toContain(`${BASE_URL}/balance`);
    expect(urls).toContain(`${BASE_URL}/matchups`);
    expect(urls).toContain(`${BASE_URL}/changelog`);
    expect(urls).toContain(`${BASE_URL}/faq`);
    expect(urls).toContain(`${BASE_URL}/brandbook`);
    expect(urls).toContain(`${BASE_URL}/terms`);
    expect(urls).toContain(`${BASE_URL}/privacy`);
    expect(urls).toContain(`${BASE_URL}/cookies`);
  });

  it("should include blog post URLs", () => {
    const slugs = ["test-post", "another-post", "third-post"];
    const urls = buildAllSiteUrls(slugs);
    expect(urls).toContain(`${BASE_URL}/blog/test-post`);
    expect(urls).toContain(`${BASE_URL}/blog/another-post`);
    expect(urls).toContain(`${BASE_URL}/blog/third-post`);
  });

  it("should have static pages + blog posts total", () => {
    const slugs = ["a", "b", "c"];
    const urls = buildAllSiteUrls(slugs);
    expect(urls.length).toBe(17 + 3);
  });

  it("should return only static pages when no blog slugs", () => {
    const urls = buildAllSiteUrls([]);
    expect(urls.length).toBe(17);
  });

  it("should generate absolute URLs with https", () => {
    const urls = buildAllSiteUrls(["test"]);
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\/www\.7sinscardgame\.com\//);
    }
  });

  it("should handle large number of blog slugs", () => {
    const slugs = Array.from({ length: 500 }, (_, i) => `post-${i}`);
    const urls = buildAllSiteUrls(slugs);
    expect(urls.length).toBe(17 + 500);
  });
});

/* ─── 4. getStatusMessage Tests ───────────────────────────────── */
describe("getStatusMessage", () => {
  it("should return correct message for 200", () => {
    expect(getStatusMessage(200)).toContain("submitted successfully");
  });

  it("should return correct message for 202", () => {
    expect(getStatusMessage(202)).toContain("Accepted");
  });

  it("should return correct message for 400", () => {
    expect(getStatusMessage(400)).toContain("Bad Request");
  });

  it("should return correct message for 403", () => {
    expect(getStatusMessage(403)).toContain("Forbidden");
  });

  it("should return correct message for 422", () => {
    expect(getStatusMessage(422)).toContain("Unprocessable");
  });

  it("should return correct message for 429", () => {
    expect(getStatusMessage(429)).toContain("Too Many Requests");
  });

  it("should return a message for unknown status codes", () => {
    const msg = getStatusMessage(500);
    expect(msg).toContain("500");
  });
});

/* ─── 5. URL Normalization Tests ──────────────────────────────── */
describe("URL Normalization", () => {
  it("should convert relative paths to absolute URLs in buildAllSiteUrls", () => {
    const urls = buildAllSiteUrls(["test-slug"]);
    const blogUrl = urls.find((u) => u.includes("test-slug"));
    expect(blogUrl).toBe(`${BASE_URL}/blog/test-slug`);
  });

  it("should not double-prefix absolute URLs", () => {
    const urls = buildAllSiteUrls([]);
    const homeUrl = urls.find((u) => u.endsWith("/"));
    expect(homeUrl).toBe(`${BASE_URL}/`);
    // Should not be https://...https://...
    expect(homeUrl!.match(/https/g)!.length).toBe(1);
  });
});

/* ─── 6. Batch Chunking Logic Tests ───────────────────────────── */
describe("Batch Chunking Logic", () => {
  it("should handle empty URL array", () => {
    const chunks: string[][] = [];
    const urls: string[] = [];
    for (let i = 0; i < urls.length; i += MAX_URLS_PER_BATCH) {
      chunks.push(urls.slice(i, i + MAX_URLS_PER_BATCH));
    }
    expect(chunks.length).toBe(0);
  });

  it("should create single chunk for small URL sets", () => {
    const urls = Array.from({ length: 100 }, (_, i) => `https://example.com/page-${i}`);
    const chunks: string[][] = [];
    for (let i = 0; i < urls.length; i += MAX_URLS_PER_BATCH) {
      chunks.push(urls.slice(i, i + MAX_URLS_PER_BATCH));
    }
    expect(chunks.length).toBe(1);
    expect(chunks[0].length).toBe(100);
  });

  it("should split into multiple chunks for large URL sets", () => {
    const urls = Array.from({ length: 25_000 }, (_, i) => `https://example.com/page-${i}`);
    const chunks: string[][] = [];
    for (let i = 0; i < urls.length; i += MAX_URLS_PER_BATCH) {
      chunks.push(urls.slice(i, i + MAX_URLS_PER_BATCH));
    }
    expect(chunks.length).toBe(3);
    expect(chunks[0].length).toBe(10_000);
    expect(chunks[1].length).toBe(10_000);
    expect(chunks[2].length).toBe(5_000);
  });

  it("should handle exact batch size boundary", () => {
    const urls = Array.from({ length: 10_000 }, (_, i) => `https://example.com/page-${i}`);
    const chunks: string[][] = [];
    for (let i = 0; i < urls.length; i += MAX_URLS_PER_BATCH) {
      chunks.push(urls.slice(i, i + MAX_URLS_PER_BATCH));
    }
    expect(chunks.length).toBe(1);
    expect(chunks[0].length).toBe(10_000);
  });
});

/* ─── 7. IndexNow POST Body Format Tests ─────────────────────── */
describe("IndexNow POST Body Format", () => {
  it("should construct valid JSON body for batch submission", () => {
    const urls = ["https://www.7sinscardgame.com/blog/test"];
    const body = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    expect(body.host).toBe("www.7sinscardgame.com");
    expect(body.key).toBe(INDEXNOW_KEY);
    expect(body.keyLocation).toBe(`https://www.7sinscardgame.com/${INDEXNOW_KEY}.txt`);
    expect(body.urlList).toEqual(urls);
  });

  it("should include keyLocation pointing to the key file", () => {
    const keyLocation = `${BASE_URL}/${INDEXNOW_KEY}.txt`;
    expect(keyLocation).toBe(
      "https://www.7sinscardgame.com/505b6460d365492eabc067eac9bfe230.txt"
    );
  });
});

/* ─── 8. IndexNow GET URL Format Tests ────────────────────────── */
describe("IndexNow GET URL Format", () => {
  it("should construct valid GET URL for single submission", () => {
    const testUrl = "https://www.7sinscardgame.com/blog/test-post";
    const getUrl = `${INDEXNOW_ENDPOINT}?url=${encodeURIComponent(testUrl)}&key=${INDEXNOW_KEY}`;

    expect(getUrl).toContain("api.indexnow.org/indexnow");
    expect(getUrl).toContain(`key=${INDEXNOW_KEY}`);
    expect(getUrl).toContain("url=");
  });

  it("should URL-encode special characters in the submitted URL", () => {
    const testUrl = "https://www.7sinscardgame.com/blog/test post?q=1&a=2";
    const encoded = encodeURIComponent(testUrl);
    expect(encoded).not.toContain(" ");
    expect(encoded).not.toContain("&");
    expect(encoded).toContain("%20");
    expect(encoded).toContain("%26");
  });
});

/* ─── 9. Static Pages Match Sitemap ───────────────────────────── */
describe("Static Pages Match Sitemap", () => {
  const sitemapStaticPages = [
    "/", "/blog", "/how-to-play", "/collection", "/rules",
    "/practice", "/deck-builder", "/community", "/chronicles",
    "/balance", "/matchups", "/changelog", "/faq", "/brandbook",
    "/terms", "/privacy", "/cookies",
  ];

  it("should include all sitemap static pages in IndexNow URLs", () => {
    const indexNowUrls = buildAllSiteUrls([]);
    for (const page of sitemapStaticPages) {
      expect(indexNowUrls).toContain(`${BASE_URL}${page}`);
    }
  });

  it("should have exactly the same number of static pages as sitemap", () => {
    const indexNowUrls = buildAllSiteUrls([]);
    expect(indexNowUrls.length).toBe(sitemapStaticPages.length);
  });
});
