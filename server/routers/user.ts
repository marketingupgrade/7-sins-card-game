/**
 * User account management — currently just GDPR data purge.
 *
 * `purge` is the one procedure that requires a real Supabase access token —
 * the server verifies via `auth.getUser()` and rejects if the token's user
 * doesn't match the supabaseUserId being purged. This is the pattern to
 * extend when other procedures need authenticated mutations.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { deleteAllUserData } from "../db-supabase";
import { getServerSupabase } from "../supabaseServer";
import { publicProcedure, router } from "../_core/trpc";

export const userRouter = router({
  purge: publicProcedure
    .input(
      z.object({
        supabaseUserId: z.string().min(1).max(64),
        accessToken: z.string().min(1).max(4096),
      })
    )
    .mutation(async ({ input }) => {
      const sb = getServerSupabase();
      const { data, error } = await sb.auth.getUser(input.accessToken);
      if (error || !data?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });
      }
      if (data.user.id !== input.supabaseUserId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot purge another user's data." });
      }

      const result = await deleteAllUserData(input.supabaseUserId);
      return {
        success: true,
        ...result,
        message: `Purged ${result.decksDeleted} decks and ${result.commentsDeleted} comments.`,
      };
    }),
});
