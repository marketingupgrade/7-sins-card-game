/**
 * tRPC Router Definitions for 7 Deadly Sins Card Game
 *
 * The root router composes domain-specific sub-routers (auth, discussion,
 * deck, community, profile, user, blog, game, indexnow). Each lives in its
 * own file in this directory.
 *
 * All game procedures use `publicProcedure` because the Vercel deployment
 * doesn't run Manus OAuth — players are identified by a client-generated
 * `playerId`. The one exception is `user.purge`, which verifies a real
 * Supabase access token; that's the pattern to extend if other procedures
 * ever need authenticated mutations.
 */
import { systemRouter } from "../_core/systemRouter";
import { router } from "../_core/trpc";
import { authRouter } from "./auth";
import { blogRouter } from "./blog";
import { communityRouter } from "./community";
import { deckRouter } from "./deck";
import { discussionRouter } from "./discussion";
import { gameRouter } from "./game";
import { indexnowRouter } from "./indexnow";
import { profileRouter } from "./profile";
import { userRouter } from "./user";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  discussion: discussionRouter,
  deck: deckRouter,
  community: communityRouter,
  profile: profileRouter,
  user: userRouter,
  blog: blogRouter,
  game: gameRouter,
  indexnow: indexnowRouter,
});

export type AppRouter = typeof appRouter;
