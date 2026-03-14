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

/** Render blog content — detects HTML vs markdown and styles accordingly */
function renderContent(content: string): string {
  // Detect if content is already HTML (from OpenAI-generated posts)
  const isHtml = content.trim().startsWith("<");

  if (isHtml) {
    // Style existing HTML tags with gothic theme classes
    return content
      .replace(/<h1([^>]*)>/gi, '<h1$1 class="text-3xl font-[Cinzel] text-amber-200 mt-10 mb-4 tracking-wide">')
      .replace(/<h2([^>]*)>/gi, '<h2$1 class="text-2xl font-[Cinzel] text-amber-200 mt-10 mb-4 tracking-wide">')
      .replace(/<h3([^>]*)>/gi, '<h3$1 class="text-xl font-[Cinzel] text-amber-200 mt-8 mb-3 tracking-wide">')
      .replace(/<p([^>]*)>/gi, '<p$1 class="text-amber-200/55 leading-relaxed mb-4">')
      .replace(/<strong([^>]*)>/gi, '<strong$1 class="text-amber-200 font-semibold">')
      .replace(/<em([^>]*)>/gi, '<em$1 class="text-amber-300/70">')
      .replace(/<a ([^>]*href="\/[^"]*")/gi, '<a class="text-amber-400 hover:text-amber-300 underline underline-offset-2" $1')
      .replace(/<a ([^>]*href="https?:\/\/[^"]*")/gi, '<a class="text-amber-400 hover:text-amber-300 underline underline-offset-2" target="_blank" rel="noopener noreferrer" $1')
      .replace(/<ul([^>]*)>/gi, '<ul$1 class="mb-4 space-y-1 list-disc list-inside text-amber-200/60">')
      .replace(/<ol([^>]*)>/gi, '<ol$1 class="mb-4 space-y-1 list-decimal list-inside text-amber-200/60">')
      .replace(/<li([^>]*)>/gi, '<li$1 class="ml-4 pl-2 text-amber-200/60">')
      .replace(/<blockquote([^>]*)>/gi, '<blockquote$1 class="border-l-2 border-amber-700/50 pl-4 italic text-amber-200/40 my-4">');
  }

  // Markdown rendering for older posts
  let html = content
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
      const baseUrl = "https://www.7sinscardgame.com";
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      document.title = `${post.title} | 7 Deadly Sins Card Game Blog`;

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

      // Standard meta
      setMeta("name", "description", post.metaDescription || "");
      setMeta("name", "keywords", post.keywords || "");
      setMeta("name", "author", "7 Deadly Sins Card Game");

      // Canonical URL
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", postUrl);

      // Open Graph meta tags
      setMeta("property", "og:title", post.title);
      setMeta("property", "og:description", post.metaDescription || "");
      setMeta("property", "og:url", postUrl);
      setMeta("property", "og:type", "article");
      setMeta("property", "og:site_name", "7 Deadly Sins Card Game");
      setMeta("property", "article:published_time", post.publishedAt ? new Date(post.publishedAt).toISOString() : "");
      setMeta("property", "article:modified_time", post.updatedAt ? new Date(post.updatedAt).toISOString() : "");
      setMeta("property", "article:section", CATEGORY_LABELS[post.category] || post.category);

      // Twitter Card meta tags
      setMeta("name", "twitter:card", "summary_large_image");
      setMeta("name", "twitter:title", post.title);
      setMeta("name", "twitter:description", post.metaDescription || "");

      // Article schema + BreadcrumbList
      let scriptTag = document.querySelector('script[data-blog-schema]');
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.setAttribute("type", "application/ld+json");
        scriptTag.setAttribute("data-blog-schema", "true");
        document.head.appendChild(scriptTag);
      }

      const schemas: object[] = [
        // Article schema
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.metaDescription,
          keywords: post.keywords,
          datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
          dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
          author: {
            "@type": "Organization",
            name: "7 Deadly Sins Card Game",
            url: baseUrl,
          },
          publisher: {
            "@type": "Organization",
            name: "7 Deadly Sins Card Game",
            url: baseUrl,
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": postUrl,
          },
          articleSection: CATEGORY_LABELS[post.category] || post.category,
          inLanguage: "en",
          isAccessibleForFree: true,
        },
        // BreadcrumbList schema
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: baseUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: `${baseUrl}/blog`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: CATEGORY_LABELS[post.category] || post.category,
              item: `${baseUrl}/blog?category=${post.category}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: post.title,
              item: postUrl,
            },
          ],
        },
      ];

      // Add FAQPage schema for AEO-question category posts
      if (post.category === "aeo-questions" && post.content) {
        const faqItems: { question: string; answer: string }[] = [];
        // Extract Q&A from h2/h3 headings followed by paragraphs
        const headingRegex = /<h[23][^>]*>(.+?)<\/h[23]>/gi;
        const contentStr = post.content;
        let match;
        while ((match = headingRegex.exec(contentStr)) !== null) {
          const question = match[1].replace(/<[^>]+>/g, "").trim();
          const afterHeading = contentStr.slice(match.index + match[0].length);
          const nextTag = afterHeading.match(/<p[^>]*>(.+?)<\/p>/i);
          if (nextTag && question.includes("?")) {
            faqItems.push({
              question,
              answer: nextTag[1].replace(/<[^>]+>/g, "").trim(),
            });
          }
        }
        if (faqItems.length > 0) {
          schemas.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          });
        }
      }

      scriptTag.textContent = JSON.stringify(schemas);

      return () => {
        // Cleanup schema and dynamic meta on unmount
        const schema = document.querySelector('script[data-blog-schema]');
        if (schema) schema.remove();
        const canonicalEl = document.querySelector('link[rel="canonical"]');
        if (canonicalEl) canonicalEl.remove();
      };
    }
  }, [post]);

  const renderedContent = useMemo(() => {
    if (!post?.content) return "";
    return renderContent(post.content);
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
