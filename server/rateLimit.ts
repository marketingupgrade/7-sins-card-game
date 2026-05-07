/**
 * In-memory sliding-window rate limiter.
 *
 * Per-instance state: on a multi-instance deployment (e.g. Vercel with several
 * lambdas active simultaneously) a determined attacker can scale their request
 * rate by hitting different cold instances. For the abuse this guards against
 * (a single client spamming `discussion.upvote`) it's sufficient. Move to a
 * shared store (Redis/Upstash) if cross-instance limits are needed.
 */

import type { Request } from "express";

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  /** Logical scope, used as part of the key (e.g. "discussion.upvote"). */
  scope: string;
  /** Window duration in milliseconds. */
  windowMs: number;
  /** Max requests permitted per key per window. */
  max: number;
};

export function getRequestIp(req: Pick<Request, "headers" | "socket" | "ip">): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }
  return req.ip ?? req.socket?.remoteAddress ?? "unknown";
}

export function checkRateLimit(key: string, options: RateLimitOptions): boolean {
  const now = Date.now();
  const bucketKey = `${options.scope}:${key}`;
  const bucket = buckets.get(bucketKey);

  if (!bucket || now - bucket.windowStart >= options.windowMs) {
    buckets.set(bucketKey, { count: 1, windowStart: now });
    return true;
  }

  if (bucket.count >= options.max) {
    return false;
  }

  bucket.count += 1;
  return true;
}

/** Test helper — clears all rate-limit state. */
export function _resetRateLimits(): void {
  buckets.clear();
}
