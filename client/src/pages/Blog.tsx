/**
 * Blog Index Page
 *
 * SEO-optimized blog listing with category filtering, search, and pagination.
 * Dark gothic theme matching the rest of the site.
 * Wikipedia-style internal linking between posts for maximum SEO value.
 */

import { useState, useMemo, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, BookOpen, Filter } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  "game-guides": "Game Guides",
  "faction-guides": "Faction Guides",
  comparisons: "Comparisons",
  "free-to-play": "Free to Play",
  "dark-fantasy-lore": "Dark Fantasy Lore",
  "game-design": "Game Design",
  "seo-pillars": "Strategy & Tips",
  "aeo-questions": "FAQ",
  "multiplayer-social": "Multiplayer",
  "industry-culture": "Culture & News",
};

const POSTS_PER_PAGE = 24;

export default function Blog() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialCategory = params.get("category") || "";
  const initialPage = parseInt(params.get("page") || "1", 10);
  const initialSearch = params.get("q") || "";

  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Debounce search input and sync to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
      // Update URL with search query for SearchAction schema
      const url = new URL(window.location.href);
      if (searchQuery) {
        url.searchParams.set("q", searchQuery);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url.toString());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = trpc.blog.list.useQuery({
    page,
    limit: POSTS_PER_PAGE,
    category: category || undefined,
    search: debouncedSearch || undefined,
  });

  const { data: categories } = trpc.blog.categories.useQuery();

  const totalPages = data ? Math.ceil(data.total / POSTS_PER_PAGE) : 0;

  // Update document title, meta, and schema for SEO
  useEffect(() => {
    const baseUrl = "https://www.7sinscardgame.com";
    const title = category
      ? `${CATEGORY_LABELS[category] || category} - 7 Deadly Sins Blog`
      : "Blog - 7 Deadly Sins Card Game";
    const description = category
      ? `Browse ${CATEGORY_LABELS[category] || category} articles about the 7 Deadly Sins Card Game. Free PvP strategy guides, dark fantasy lore, and mythology.`
      : "Explore the Cathedral Chronicles — strategy guides, dark fantasy lore, mythology, and tips for the free PvP card game 7 Deadly Sins.";
    document.title = title;

    // Helper to set or create a meta tag
    const setMeta = (attr: string, key: string, value: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", category ? `${baseUrl}/blog?category=${category}` : `${baseUrl}/blog`);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "7 Deadly Sins Card Game");
    setMeta("name", "twitter:card", "summary");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", category ? `${baseUrl}/blog?category=${category}` : `${baseUrl}/blog`);

    // CollectionPage + BreadcrumbList schema
    let scriptTag = document.querySelector('script[data-blog-list-schema]');
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.setAttribute("type", "application/ld+json");
      scriptTag.setAttribute("data-blog-list-schema", "true");
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url: category ? `${baseUrl}/blog?category=${category}` : `${baseUrl}/blog`,
        isPartOf: { "@type": "WebSite", name: "7 Deadly Sins Card Game", url: baseUrl },
        inLanguage: "en",
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${baseUrl}/blog` },
          ...(category ? [{ "@type": "ListItem", position: 3, name: CATEGORY_LABELS[category] || category, item: `${baseUrl}/blog?category=${category}` }] : []),
        ],
      },
    ]);

    return () => {
      const schema = document.querySelector('script[data-blog-list-schema]');
      if (schema) schema.remove();
      const canonicalEl = document.querySelector('link[rel="canonical"]');
      if (canonicalEl) canonicalEl.remove();
    };
  }, [category]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-amber-100">
      {/* Hero Header */}
      <header className="relative py-16 px-4 text-center border-b border-amber-900/20">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="font-[Cinzel] text-4xl md:text-5xl text-amber-200 tracking-wider mb-4">
            THE CATHEDRAL CHRONICLES
          </h1>
          <p className="text-amber-200/50 text-lg font-[Cinzel] tracking-widest uppercase">
            Guides, Strategy, Lore & More
          </p>
          <p className="text-amber-200/30 text-base mt-2 max-w-2xl mx-auto">
            {data?.total ? `${data.total} articles` : ""} exploring the world of 7 Deadly Sins and competitive card gaming
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/50" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-amber-950/20 border-amber-900/30 text-amber-100 placeholder:text-amber-200/30 focus:border-amber-600/50"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => { setCategory(""); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-[Cinzel] tracking-wider transition-all ${
              !category
                ? "bg-amber-700/40 text-amber-200 border border-amber-600/50"
                : "bg-amber-950/20 text-amber-200/50 border border-amber-900/20 hover:border-amber-700/40 hover:text-amber-200/70"
            }`}
          >
            ALL
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.category}
              onClick={() => { setCategory(cat.category); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-[Cinzel] tracking-wider transition-all ${
                category === cat.category
                  ? "bg-amber-700/40 text-amber-200 border border-amber-600/50"
                  : "bg-amber-950/20 text-amber-200/50 border border-amber-900/20 hover:border-amber-700/40 hover:text-amber-200/70"
              }`}
            >
              {CATEGORY_LABELS[cat.category] || cat.category} ({cat.count})
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-amber-950/10 border border-amber-900/20 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-amber-900/20 rounded w-1/3 mb-4" />
                <div className="h-6 bg-amber-900/20 rounded w-full mb-3" />
                <div className="h-4 bg-amber-900/20 rounded w-2/3 mb-2" />
                <div className="h-4 bg-amber-900/20 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : data?.posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-amber-500/30 mx-auto mb-4" />
            <p className="text-amber-200/50 text-lg">No articles found</p>
            <p className="text-amber-200/30 text-sm mt-2">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block bg-amber-950/10 border border-amber-900/20 rounded-lg overflow-hidden hover:border-amber-700/40 hover:bg-amber-950/20 transition-all"
              >
                {/* Featured image */}
                {(post as any).featuredImage && (
                  <div className="w-full h-40 overflow-hidden bg-amber-950/30">
                    <img
                      src={(post as any).featuredImage}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-[Cinzel] tracking-wider text-amber-500/60 uppercase bg-amber-900/20 px-2 py-0.5 rounded">
                    {CATEGORY_LABELS[post.category] || post.category}
                  </span>
                  <span className="text-[11px] text-amber-200/30">
                    {post.readingTime} min read
                  </span>
                </div>
                <h2 className="text-lg font-[Cinzel] text-amber-200 group-hover:text-amber-100 transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-amber-200/40 line-clamp-3">
                  {post.metaDescription}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-amber-200/25">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-amber-500/50 group-hover:text-amber-400/70 transition-colors font-[Cinzel] tracking-wider">
                    READ MORE →
                  </span>
                </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="border-amber-900/30 text-amber-200/60 hover:text-amber-200 hover:border-amber-700/50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded text-sm ${
                      pageNum === page
                        ? "bg-amber-700/40 text-amber-200 border border-amber-600/50"
                        : "text-amber-200/40 hover:text-amber-200/70"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="border-amber-900/30 text-amber-200/60 hover:text-amber-200 hover:border-amber-700/50"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-amber-900/20 py-12 text-center">
        <p className="text-amber-200/30 text-sm font-[Cinzel] tracking-wider mb-4">
          READY TO PLAY?
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-amber-800/60 to-amber-700/40 border border-amber-600/40 rounded-lg text-amber-200 font-[Cinzel] tracking-wider hover:border-amber-500/60 transition-all"
        >
          ENTER THE CATHEDRAL
        </Link>
      </div>
    </div>
  );
}
