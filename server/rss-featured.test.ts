import { describe, it, expect } from "vitest";

const BASE = "http://localhost:3000";

describe("RSS Feed", () => {
  it("should return valid RSS XML at /rss.xml", async () => {
    const res = await fetch(`${BASE}/rss.xml`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/rss+xml");
    const body = await res.text();
    expect(body).toContain('<?xml version="1.0"');
    expect(body).toContain("<rss version=");
    expect(body).toContain("<channel>");
    expect(body).toContain("7 Deadly Sins Card Game");
  });

  it("should contain at least one <item> with required fields", async () => {
    const res = await fetch(`${BASE}/rss.xml`);
    const body = await res.text();
    expect(body).toContain("<item>");
    expect(body).toContain("<title>");
    expect(body).toContain("<link>");
    expect(body).toContain("<guid");
    expect(body).toContain("<pubDate>");
    expect(body).toContain("<description>");
    expect(body).toContain("<category>");
  });

  it("should include enclosure tags for featured images", async () => {
    const res = await fetch(`${BASE}/rss.xml`);
    const body = await res.text();
    expect(body).toContain('<enclosure url="https://');
    expect(body).toContain('type="image/webp"');
  });

  it("should include atom:link self reference", async () => {
    const res = await fetch(`${BASE}/rss.xml`);
    const body = await res.text();
    expect(body).toContain('rel="self"');
    expect(body).toContain("/rss.xml");
  });
});

describe("Blog Featured Images", () => {
  it("blog.list should return featuredImage for posts", async () => {
    const input = encodeURIComponent(JSON.stringify({ json: { page: 1, limit: 3 } }));
    const res = await fetch(`${BASE}/api/trpc/blog.list?input=${input}`);
    expect(res.status).toBe(200);
    const data = await res.json();
    const posts = data.result.data.json.posts;
    expect(posts.length).toBeGreaterThan(0);
    // All posts should have a featuredImage
    for (const post of posts) {
      expect(post.featuredImage).toBeTruthy();
      expect(post.featuredImage).toContain("supabase.co");
    }
  });

  it("blog.getBySlug should return featuredImage", async () => {
    // First get a slug from the list
    const listInput = encodeURIComponent(JSON.stringify({ json: { page: 1, limit: 1 } }));
    const listRes = await fetch(`${BASE}/api/trpc/blog.list?input=${listInput}`);
    const listData = await listRes.json();
    const slug = listData.result.data.json.posts[0].slug;

    const input = encodeURIComponent(JSON.stringify({ json: { slug } }));
    const res = await fetch(`${BASE}/api/trpc/blog.getBySlug?input=${input}`);
    expect(res.status).toBe(200);
    const data = await res.json();
    const post = data.result.data.json;
    expect(post.featuredImage).toBeTruthy();
    expect(post.featuredImage).toContain("supabase.co");
  });
});
