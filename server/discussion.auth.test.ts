/**
 * Tests for discussion router auth gates.
 *
 * Validates the audit-findings hardenings:
 * - delete requires guestId at the router (input validation)
 * - delete throws FORBIDDEN if the underlying ownership check fails
 * - upvote is rate-limited per IP via the shared sliding-window limiter
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { _resetRateLimits } from "./rateLimit";

const deleteMock = vi.fn();
const upvoteMock = vi.fn();
vi.mock("./db-supabase", async () => {
  const actual = await vi.importActual("./db-supabase");
  return {
    ...actual,
    deleteDiscussionComment: (id: number, guestId: string) => deleteMock(id, guestId),
    upvoteDiscussionComment: (id: number) => upvoteMock(id),
  };
});

function ctxFromIp(ip: string): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { "x-forwarded-for": ip },
      socket: {} as never,
      ip,
    } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("discussion.delete auth", () => {
  beforeEach(() => {
    deleteMock.mockReset();
  });

  it("rejects calls without a guestId at the input layer", async () => {
    const caller = appRouter.createCaller(ctxFromIp("1.1.1.1"));
    await expect(
      // @ts-expect-error — intentionally missing required field
      caller.discussion.delete({ commentId: 1 })
    ).rejects.toThrow();
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("throws FORBIDDEN when the db ownership check returns false", async () => {
    deleteMock.mockResolvedValue(false);
    const caller = appRouter.createCaller(ctxFromIp("1.1.1.1"));
    await expect(
      caller.discussion.delete({ commentId: 7, guestId: "imposter" })
    ).rejects.toThrow(/cannot delete/i);
    expect(deleteMock).toHaveBeenCalledWith(7, "imposter");
  });

  it("succeeds when the db ownership check passes", async () => {
    deleteMock.mockResolvedValue(true);
    const caller = appRouter.createCaller(ctxFromIp("1.1.1.1"));
    const result = await caller.discussion.delete({ commentId: 7, guestId: "owner" });
    expect(result).toEqual({ success: true });
    expect(deleteMock).toHaveBeenCalledWith(7, "owner");
  });
});

describe("discussion.upvote rate limiting", () => {
  beforeEach(() => {
    upvoteMock.mockReset();
    upvoteMock.mockResolvedValue(true);
    _resetRateLimits();
  });

  it("rejects after 30 upvotes from the same IP within a minute", async () => {
    const caller = appRouter.createCaller(ctxFromIp("9.9.9.9"));
    for (let i = 0; i < 30; i++) {
      await caller.discussion.upvote({ commentId: i + 1 });
    }
    await expect(
      caller.discussion.upvote({ commentId: 100 })
    ).rejects.toThrow(/too many|slow down/i);
    expect(upvoteMock).toHaveBeenCalledTimes(30);
  });

  it("allows a new IP to upvote even after another IP is throttled", async () => {
    const a = appRouter.createCaller(ctxFromIp("9.9.9.9"));
    for (let i = 0; i < 30; i++) await a.discussion.upvote({ commentId: i + 1 });
    await expect(a.discussion.upvote({ commentId: 100 })).rejects.toThrow();

    upvoteMock.mockClear();
    const b = appRouter.createCaller(ctxFromIp("8.8.8.8"));
    await expect(b.discussion.upvote({ commentId: 200 })).resolves.toBe(true);
    expect(upvoteMock).toHaveBeenCalledWith(200);
  });
});
