/**
 * Tests for user.purge tRPC procedure.
 *
 * Validates that the purge endpoint:
 * 1. Verifies the caller's Supabase access token belongs to the target user
 * 2. Returns success with deletion counts on a valid call
 * 3. Rejects mismatched/invalid tokens and malformed input
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db-supabase module so we don't need a real database
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

// Mock the server Supabase client so we control auth.getUser responses
const getUserMock = vi.fn();
vi.mock("./supabaseServer", () => ({
  getServerSupabase: () => ({
    auth: { getUser: (token: string) => getUserMock(token) },
  }),
}));

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

  it("purges user data when access token matches the target user", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "test-user-uuid-123" } },
      error: null,
    });
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.user.purge({
      supabaseUserId: "test-user-uuid-123",
      accessToken: "valid-token",
    });

    expect(result.success).toBe(true);
    expect(result.decksDeleted).toBe(3);
    expect(result.commentsDeleted).toBe(5);
    expect(result.message).toContain("3 decks");
    expect(result.message).toContain("5 comments");
  });

  it("rejects when the access token belongs to a different user", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "different-user-uuid" } },
      error: null,
    });
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.user.purge({
        supabaseUserId: "victim-user-uuid",
        accessToken: "attacker-token",
      })
    ).rejects.toThrow(/another user/i);
  });

  it("rejects when the access token is invalid", async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: { message: "invalid token" },
    });
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.user.purge({
        supabaseUserId: "test-user-uuid-123",
        accessToken: "bad-token",
      })
    ).rejects.toThrow(/invalid or expired/i);
  });

  it("rejects empty supabaseUserId", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.user.purge({ supabaseUserId: "", accessToken: "x" })
    ).rejects.toThrow();
  });

  it("rejects supabaseUserId exceeding max length", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.user.purge({ supabaseUserId: "a".repeat(65), accessToken: "x" })
    ).rejects.toThrow();
  });

  it("rejects missing access token", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      // @ts-expect-error — intentionally missing required field
      caller.user.purge({ supabaseUserId: "test-user-uuid-123" })
    ).rejects.toThrow();
  });
});
