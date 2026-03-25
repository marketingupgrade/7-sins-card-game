import { useEffect } from "react";

const BASE_URL = "https://www.7sinscardgame.com";
const SITE_NAME = "7 Deadly Sins Card Game";

interface PageMetaOptions {
  /** Page title — will be appended with " | 7 Deadly Sins Card Game" unless noSuffix is true */
  title: string;
  /** Meta description for search engines (max ~155 chars recommended) */
  description: string;
  /** Canonical path, e.g. "/how-to-play". Defaults to current pathname. */
  canonicalPath?: string;
  /** If true, don't append the site name suffix to the title */
  noSuffix?: boolean;
  /** If true, add noindex meta tag (for ephemeral pages like lobby/game) */
  noindex?: boolean;
  /** OG type override (defaults to "website") */
  ogType?: string;
}

/**
 * Sets document.title, canonical URL, meta description, and OG tags for the current page.
 * Cleans up on unmount by restoring defaults.
 */
export function usePageMeta({
  title,
  description,
  canonicalPath,
  noSuffix = false,
  noindex = false,
  ogType,
}: PageMetaOptions) {
  useEffect(() => {
    // Set document title
    const fullTitle = noSuffix ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    // Set or update canonical link
    const path = canonicalPath ?? window.location.pathname;
    const canonicalUrl = `${BASE_URL}${path === "/" ? "" : path}`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      canonical.href = canonicalUrl;
    } else {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = canonicalUrl;
      document.head.appendChild(canonical);
    }

    // Set or update meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (metaDesc) {
      metaDesc.content = description;
    } else {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      metaDesc.content = description;
      document.head.appendChild(metaDesc);
    }

    // Set or update OG tags
    setMetaProperty("og:title", fullTitle);
    setMetaProperty("og:description", description);
    setMetaProperty("og:url", canonicalUrl);
    if (ogType) setMetaProperty("og:type", ogType);

    // Set or update Twitter tags
    setMetaProperty("twitter:title", fullTitle);
    setMetaProperty("twitter:description", description);

    // Handle noindex
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (noindex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.name = "robots";
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.content = "noindex, nofollow";
    } else if (robotsMeta) {
      robotsMeta.remove();
    }

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = SITE_NAME;
      if (canonical) canonical.href = `${BASE_URL}/`;
      if (metaDesc) {
        metaDesc.content =
          "A strategic 4-player card game where seven deadly sins clash in a gothic cathedral. Choose your sin, master compound mechanics, and outlast your rivals across 20 rounds of judgment.";
      }
      if (robotsMeta && noindex) robotsMeta.remove();
    };
  }, [title, description, canonicalPath, noSuffix, noindex, ogType]);
}

function setMetaProperty(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement | null;
  }
  if (meta) {
    meta.content = content;
  }
}
