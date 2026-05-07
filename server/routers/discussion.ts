/**
 * Discussion comments — threaded community discussion on analysis pages.
 *
 * Auth model:
 * - guests are identified by a localStorage `guestId`; `delete` requires it and
 *   server-side `deleteDiscussionComment` rejects mismatches.
 * - `upvote` is rate-limited per IP (30/min) via `server/rateLimit.ts`.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createDiscussionComment,
  deleteDiscussionComment,
  getDiscussionComments,
  upvoteDiscussionComment,
} from "../db-supabase";
import { checkRateLimit, getRequestIp } from "../rateLimit";
import { publicProcedure, router } from "../_core/trpc";

export const discussionRouter = router({
  list: publicProcedure
    .input(z.object({ pageContext: z.string().min(1).max(64).default("balance") }))
    .query(async ({ input }) => getDiscussionComments(input.pageContext)),

  create: publicProcedure
    .input(
      z.object({
        pageContext: z.string().min(1).max(64).default("balance"),
        section: z.string().max(64).optional(),
        parentId: z.number().int().positive().optional(),
        authorName: z
          .string()
          .min(1)
          .max(100)
          .transform((s) => s.replace(/[<>"'&]/g, "")),
        guestId: z.string().max(64).optional(),
        content: z
          .string()
          .min(1)
          .max(2000)
          .transform((s) => s.replace(/[<>"']/g, "")),
      })
    )
    .mutation(async ({ input }) => {
      return createDiscussionComment({
        pageContext: input.pageContext,
        section: input.section ?? null,
        parentId: input.parentId ?? null,
        userId: null,
        authorName: input.authorName,
        guestId: input.guestId ?? null,
        content: input.content,
      });
    }),

  delete: publicProcedure
    .input(
      z.object({
        commentId: z.number().int().positive(),
        guestId: z.string().min(1).max(64),
      })
    )
    .mutation(async ({ input }) => {
      const ok = await deleteDiscussionComment(input.commentId, input.guestId);
      if (!ok) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete this comment." });
      }
      return { success: true };
    }),

  upvote: publicProcedure
    .input(z.object({ commentId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const ip = getRequestIp(ctx.req);
      const allowed = checkRateLimit(ip, {
        scope: "discussion.upvote",
        windowMs: 60_000,
        max: 30,
      });
      if (!allowed) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many upvotes. Slow down." });
      }
      return upvoteDiscussionComment(input.commentId);
    }),
});
