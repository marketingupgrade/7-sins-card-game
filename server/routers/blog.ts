/** Blog — public SEO content. */
import { z } from "zod";
import {
  getAllBlogSlugs,
  getBlogCategoryCounts,
  getBlogPostBySlug,
  getBlogPosts,
  getRelatedPosts,
} from "../db-supabase";
import { publicProcedure, router } from "../_core/trpc";

export const blogRouter = router({
  list: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().min(1).max(100).default(20),
        category: z.string().max(64).optional(),
        search: z.string().max(200).optional(),
      })
    )
    .query(async ({ input }) => getBlogPosts(input)),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(255) }))
    .query(async ({ input }) => (await getBlogPostBySlug(input.slug)) ?? null),

  related: publicProcedure
    .input(
      z.object({
        category: z.string().min(1).max(64),
        excludeSlug: z.string().min(1).max(255),
        limit: z.number().int().min(1).max(10).default(5),
      })
    )
    .query(async ({ input }) =>
      getRelatedPosts(input.category, input.excludeSlug, input.limit)
    ),

  categories: publicProcedure.query(async () => getBlogCategoryCounts()),

  allSlugs: publicProcedure.query(async () => getAllBlogSlugs()),
});
