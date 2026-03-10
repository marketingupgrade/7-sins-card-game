/**
 * Vercel Serverless Function - tRPC API Handler
 *
 * Minimal Express wrapper that only handles /api/trpc routes.
 * No Manus OAuth or chat routes needed for Vercel deployment.
 */

import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

const app = express();

// Enable CORS for all origins
app.use(cors({ origin: true, credentials: true }));

// Body parser
app.use(express.json({ limit: "10mb" }));

// Simple context (no Manus auth on Vercel)
function createVercelContext(opts: CreateExpressContextOptions) {
  return {
    req: opts.req,
    res: opts.res,
    user: null,
  };
}

// tRPC API - mount at /api/trpc
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: createVercelContext,
  })
);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
