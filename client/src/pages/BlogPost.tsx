/**
 * Individual Blog Post Page
 *
 * SEO-optimized with structured data (Article schema), canonical URLs,
 * related posts sidebar, and internal linking.
 * Renders markdown content with proper heading hierarchy.
 */

import { useEffect, useMemo } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, Clock, Calendar, Tag } from "lucide-react";

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

/** Simple markdown-to-HTML renderer for blog content */
function renderMarkdown(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-[Cinzel] text-amber-200 mt-8 mb-3 tracking-wide">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-[Cinzel] text-amber-200 mt-10 mb-4 tracking-wide">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-amber-200 font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="text-amber-300/70">$1</em>')
    // Links (internal)
    .replace(/\[(.+?)\]\(\/(.+?)\)/g, '<a href="/$2" class="text-amber-400 hover:text-amber-300 underline underline-offset-2">$1</a>')
    // Links (external)
    .replace(/\[(.+?)\]\((https?:\/\/.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-400 hover:text-amber-300 underline underline-offset-2">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 pl-2 text-amber-200/60 before:content-[\'•\'] before:text-amber-500/50 before:mr-2">$1</li>')
    // Paragraphs (lines not already tagged)
    .replace(/^(?!<[hlu]|<li)(.+)$/gm, '<p class="text-amber-200/55 leading-relaxed mb-4">$1</p>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g, '<ul class="mb-4 space-y-1">$1</ul>');

  return html;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const { data: relatedPosts } = trpc.blog.related.useQuery(
    {
      category: post?.category || "",
      excludeSlug: slug || "",
      limit: 5,
    },
    { enabled: !!post?.category }
  );

  // Update document title and meta for SEO
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | 7 Deadly Sins Card Game Blog`;
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", post.metaDescription || "");

      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", post.keywords || "");

      // Add structured data (Article schema)
      let scriptTag = document.querySelector('script[data-blog-schema]');
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.setAttribute("type", "application/ld+json");
        scriptTag.setAttribute("data-blog-schema", "true");
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.metaDescription,
        keywords: post.keywords,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: {
          "@type": "Organization",
          name: "7 Deadly Sins Card Game",
        },
        publisher: {
          "@type": "Organization",
          name: "7 Deadly Sins Card Game",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${window.location.origin}/blog/${post.slug}`,
        },
      });

      return () => {
        // Cleanup schema on unmount
        const schema = document.querySelector('script[data-blog-schema]');
        if (schema) schema.remove();
      };
    }
  }, [post]);

  const renderedContent = useMemo(() => {
    if (!post?.content) return "";
    return renderMarkdown(post.content);
  }, [post?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-amber-200/60 text-sm font-[Cinzel] tracking-wider">
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-[Cinzel] text-amber-200 mb-4">Article Not Found</h1>
          <p className="text-amber-200/40 mb-6">This scroll has been lost to the ages.</p>
          <Link
            href="/blog"
            className="text-amber-400 hover:text-amber-300 font-[Cinzel] tracking-wider"
          >
            ← Back to Chronicles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-amber-100">
      {/* Navigation */}
      <nav className="border-b border-amber-900/20 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-amber-200/50 hover:text-amber-200 transition-colors text-sm font-[Cinzel] tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" />
            BACK TO CHRONICLES
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Article Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/blog?category=${post.category}`}
              className="text-xs font-[Cinzel] tracking-wider text-amber-500/70 uppercase bg-amber-900/20 px-3 py-1 rounded hover:bg-amber-900/30 transition-colors"
            >
              <Tag className="w-3 h-3 inline mr-1" />
              {CATEGORY_LABELS[post.category] || post.category}
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-[Cinzel] text-amber-200 tracking-wide leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-amber-200/35">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime} min read
            </span>
          </div>
        </header>

        {/* Article Content */}
        <article
          className="prose prose-invert max-w-none mb-16"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />


        {/* CTA */}
        <div className="bg-gradient-to-r from-amber-950/30 to-amber-900/10 border border-amber-900/30 rounded-lg p-8 text-center mb-12">
          <h3 className="text-xl font-[Cinzel] text-amber-200 tracking-wider mb-3">
            READY TO PLAY?
          </h3>
          <p className="text-amber-200/40 mb-5">
            Jump into a free multiplayer match — no download required.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-amber-800/60 to-amber-700/40 border border-amber-600/40 rounded-lg text-amber-200 font-[Cinzel] tracking-wider hover:border-amber-500/60 transition-all"
          >
            ENTER THE CATHEDRAL
          </Link>
        </div>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="border-t border-amber-900/20 pt-8">
            <h2 className="text-xl font-[Cinzel] text-amber-200 tracking-wider mb-6">
              RELATED ARTICLES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group block bg-amber-950/10 border border-amber-900/20 rounded-lg p-5 hover:border-amber-700/40 hover:bg-amber-950/20 transition-all"
                >
                  <span className="text-[10px] font-[Cinzel] tracking-wider text-amber-500/50 uppercase">
                    {CATEGORY_LABELS[related.category] || related.category}
                  </span>
                  <h3 className="text-base font-[Cinzel] text-amber-200/80 group-hover:text-amber-200 transition-colors mt-1 line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-xs text-amber-200/30 mt-2 line-clamp-2">
                    {related.metaDescription}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
