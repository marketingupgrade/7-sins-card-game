/**
 * Tests for user.purge tRPC procedure.
 *
 * Validates that the purge endpoint:
 * 1. Accepts a valid supabaseUserId and calls deleteAllUserData
 * 2. Returns success with deletion counts
 * 3. Rejects invalid/empty supabaseUserId inputs
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db-supabase module so we don't need a real database
// Note: deleteAllUserData is imported from ./db-supabase in routers.ts
vi.mock("./db-supabase", async () => {
  const actual = await vi.importActual("./db-supabase");
  return {
    ...actual,
    deleteAllUserData: vi.fn().mockResolvedValue({
      decksDeleted: 3,
      commentsDeleted: 5,
    }),
  };
});

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("user.purge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("purges user data and returns deletion counts", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.user.purge({
      supabaseUserId: "test-user-uuid-123",
    });

    expect(result.success).toBe(true);
    expect(result.decksDeleted).toBe(3);
    expect(result.commentsDeleted).toBe(5);
    expect(result.message).toContain("3 decks");
    expect(result.message).toContain("5 comments");
  });

  it("rejects empty supabaseUserId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.user.purge({ supabaseUserId: "" })
    ).rejects.toThrow();
  });

  it("rejects supabaseUserId exceeding max length", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.user.purge({ supabaseUserId: "a".repeat(65) })
    ).rejects.toThrow();
  });
});
