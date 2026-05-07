import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, getRequestIp, _resetRateLimits } from "./rateLimit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    _resetRateLimits();
    vi.useRealTimers();
  });

  it("allows up to `max` requests inside the window then blocks", () => {
    for (let i = 0; i < 3; i++) {
      expect(
        checkRateLimit("k", { scope: "test", windowMs: 60_000, max: 3 })
      ).toBe(true);
    }
    expect(
      checkRateLimit("k", { scope: "test", windowMs: 60_000, max: 3 })
    ).toBe(false);
  });

  it("resets the bucket once the window has elapsed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));

    expect(checkRateLimit("k", { scope: "test", windowMs: 1000, max: 1 })).toBe(true);
    expect(checkRateLimit("k", { scope: "test", windowMs: 1000, max: 1 })).toBe(false);

    vi.advanceTimersByTime(1500);

    expect(checkRateLimit("k", { scope: "test", windowMs: 1000, max: 1 })).toBe(true);
  });

  it("scopes keys independently — same IP, different actions", () => {
    expect(checkRateLimit("ip1", { scope: "a", windowMs: 60_000, max: 1 })).toBe(true);
    expect(checkRateLimit("ip1", { scope: "a", windowMs: 60_000, max: 1 })).toBe(false);
    // different scope, same key — gets its own bucket
    expect(checkRateLimit("ip1", { scope: "b", windowMs: 60_000, max: 1 })).toBe(true);
  });
});

describe("getRequestIp", () => {
  it("uses the first x-forwarded-for entry when present", () => {
    expect(
      getRequestIp({
        headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
        socket: { remoteAddress: "9.9.9.9" } as never,
        ip: undefined,
      })
    ).toBe("1.2.3.4");
  });

  it("falls back to req.ip then socket address", () => {
    expect(
      getRequestIp({
        headers: {},
        socket: { remoteAddress: "9.9.9.9" } as never,
        ip: "5.5.5.5",
      })
    ).toBe("5.5.5.5");

    expect(
      getRequestIp({
        headers: {},
        socket: { remoteAddress: "9.9.9.9" } as never,
        ip: undefined,
      })
    ).toBe("9.9.9.9");
  });

  it("returns 'unknown' when no source is available", () => {
    expect(
      getRequestIp({
        headers: {},
        socket: {} as never,
        ip: undefined,
      })
    ).toBe("unknown");
  });
});
