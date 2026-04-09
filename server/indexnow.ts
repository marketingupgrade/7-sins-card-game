/**
 * IndexNow — Instant search engine indexing protocol.
 *
 * Submits URLs to the IndexNow API which is shared across
 * Bing, Yandex, Naver, Seznam.cz, and Yep.
 *
 * Protocol docs: https://www.indexnow.org/documentation
 */

const INDEXNOW_KEY = "505b6460d365492eabc067eac9bfe230";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const SITE_HOST = "www.7sinscardgame.com";
const BASE_URL = `https://${SITE_HOST}`;

/** Maximum URLs per batch submission (IndexNow limit is 10,000) */
const MAX_URLS_PER_BATCH = 10_000;

export interface IndexNowResult {
  success: boolean;
  statusCode: number;
  message: string;
  urlCount: number;
}

/**
 * Submit a single URL to IndexNow.
 * Uses GET request for simplicity.
 */
export async function submitUrl(url: string): Promise<IndexNowResult> {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const endpoint = `${INDEXNOW_ENDPOINT}?url=${encodeURIComponent(fullUrl)}&key=${INDEXNOW_KEY}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "User-Agent": "7DeadlySins-IndexNow/1.0" },
    });

    return {
      success: response.status === 200 || response.status === 202,
      statusCode: response.status,
      message: getStatusMessage(response.status),
      urlCount: 1,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 0,
      message: `Network error: ${error instanceof Error ? error.message : "Unknown"}`,
      urlCount: 1,
    };
  }
}

/**
 * Submit a batch of URLs to IndexNow.
 * Uses POST request with JSON body.
 * Automatically splits into chunks of MAX_URLS_PER_BATCH if needed.
 */
export async function submitUrls(urls: string[]): Promise<IndexNowResult[]> {
  if (urls.length === 0) {
    return [{ success: true, statusCode: 200, message: "No URLs to submit", urlCount: 0 }];
  }

  // Normalize URLs to full absolute URLs
  const fullUrls = urls.map((url) =>
    url.startsWith("http") ? url : `${BASE_URL}${url}`
  );

  // Split into chunks
  const chunks: string[][] = [];
  for (let i = 0; i < fullUrls.length; i += MAX_URLS_PER_BATCH) {
    chunks.push(fullUrls.slice(i, i + MAX_URLS_PER_BATCH));
  }

  const results: IndexNowResult[] = [];

  for (const chunk of chunks) {
    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "User-Agent": "7DeadlySins-IndexNow/1.0",
        },
        body: JSON.stringify({
          host: SITE_HOST,
          key: INDEXNOW_KEY,
          keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
          urlList: chunk,
        }),
      });

      results.push({
        success: response.status === 200 || response.status === 202,
        statusCode: response.status,
        message: getStatusMessage(response.status),
        urlCount: chunk.length,
      });
    } catch (error) {
      results.push({
        success: false,
        statusCode: 0,
        message: `Network error: ${error instanceof Error ? error.message : "Unknown"}`,
        urlCount: chunk.length,
      });
    }
  }

  return results;
}

/**
 * Build the full list of all site URLs for bulk submission.
 * Includes static pages + all published blog post URLs.
 */
export function buildAllSiteUrls(blogSlugs: string[]): string[] {
  const staticPages = [
    "/",
    "/blog",
    "/how-to-play",
    "/collection",
    "/rules",
    "/practice",
    "/deck-builder",
    "/community",
    "/chronicles",
    "/balance",
    "/matchups",
    "/changelog",
    "/faq",
    "/brandbook",
    "/terms",
    "/privacy",
    "/cookies",
  ];

  const blogUrls = blogSlugs.map((slug) => `/blog/${slug}`);

  return [...staticPages, ...blogUrls].map((path) => `${BASE_URL}${path}`);
}

/**
 * Human-readable status message for IndexNow response codes.
 */
function getStatusMessage(status: number): string {
  switch (status) {
    case 200:
      return "OK — URL(s) submitted successfully";
    case 202:
      return "Accepted — URL(s) received, key validation pending";
    case 400:
      return "Bad Request — Invalid format";
    case 403:
      return "Forbidden — Key not valid (not found or mismatch)";
    case 422:
      return "Unprocessable Entity — URL(s) don't belong to host or key mismatch";
    case 429:
      return "Too Many Requests — Rate limited (potential spam detection)";
    default:
      return `Unexpected response: HTTP ${status}`;
  }
}

// Export constants for testing
export { INDEXNOW_KEY, INDEXNOW_ENDPOINT, SITE_HOST, BASE_URL, MAX_URLS_PER_BATCH, getStatusMessage };
