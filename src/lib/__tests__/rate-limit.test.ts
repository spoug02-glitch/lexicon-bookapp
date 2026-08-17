import { describe, expect, it, vi, afterEach } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

afterEach(() => {
  vi.useRealTimers();
});

describe("checkRateLimit", () => {
  it("한도 이내면 허용하고 remaining을 감소시킨다", () => {
    const key = `test-${Math.random()}`;
    const first = checkRateLimit(key, 3, 60_000);
    const second = checkRateLimit(key, 3, 60_000);

    expect(first).toEqual({ allowed: true, remaining: 2 });
    expect(second).toEqual({ allowed: true, remaining: 1 });
  });

  it("한도를 넘으면 차단한다", () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);

    const third = checkRateLimit(key, 2, 60_000);

    expect(third).toEqual({ allowed: false, remaining: 0 });
  });

  it("윈도우가 지나면 다시 허용한다", () => {
    vi.useFakeTimers();
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 1, 1000);
    expect(checkRateLimit(key, 1, 1000).allowed).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(checkRateLimit(key, 1, 1000).allowed).toBe(true);
  });

  it("서로 다른 키는 독립적으로 카운트된다", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    checkRateLimit(keyA, 1, 60_000);

    expect(checkRateLimit(keyB, 1, 60_000).allowed).toBe(true);
  });
});
