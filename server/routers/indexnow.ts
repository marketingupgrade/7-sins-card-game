/** IndexNow — Instant search engine indexing. */
import { z } from "zod";
import { getAllBlogSlugs } from "../db-supabase";
import { buildAllSiteUrls, submitUrl, submitUrls } from "../indexnow";
import { publicProcedure, router } from "../_core/trpc";

export const indexnowRouter = router({
  submitUrl: publicProcedure
    .input(z.object({ url: z.string().min(1).max(2048) }))
    .mutation(async ({ input }) => submitUrl(input.url)),

  submitAll: publicProcedure.mutation(async () => {
    const slugData = await getAllBlogSlugs();
    const slugs = slugData.map((s) => s.slug);
    const allUrls = buildAllSiteUrls(slugs);
    const results = await submitUrls(allUrls);
    return {
      totalUrls: allUrls.length,
      batches: results,
      allSuccess: results.every((r) => r.success),
    };
  }),

  submitBlogPosts: publicProcedure.mutation(async () => {
    const slugData = await getAllBlogSlugs();
    const blogUrls = slugData.map((s) => `https://www.7sinscardgame.com/blog/${s.slug}`);
    const results = await submitUrls(blogUrls);
    return {
      totalUrls: blogUrls.length,
      batches: results,
      allSuccess: results.every((r) => r.success),
    };
  }),

  submitBatch: publicProcedure
    .input(z.object({ urls: z.array(z.string().min(1).max(2048)).min(1).max(10000) }))
    .mutation(async ({ input }) => {
      const results = await submitUrls(input.urls);
      return {
        totalUrls: input.urls.length,
        batches: results,
        allSuccess: results.every((r) => r.success),
      };
    }),
});
