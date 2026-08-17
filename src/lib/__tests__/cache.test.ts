import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    apiCache: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getOrSetCache } from "@/lib/cache";

const findUnique = vi.mocked(prisma.apiCache.findUnique);
const upsert = vi.mocked(prisma.apiCache.upsert);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getOrSetCache", () => {
  it("캐시 히트(만료 전)면 fetcher를 호출하지 않고 캐시된 값을 반환한다", async () => {
    findUnique.mockResolvedValueOnce({
      payload: JSON.stringify({ hello: "world" }),
      expiresAt: new Date(Date.now() + 60_000),
    } as never);
    const fetcher = vi.fn();

    const result = await getOrSetCache("ALADIN_SEARCH", "key1", 1000, fetcher);

    expect(result).toEqual({ data: { hello: "world" }, stale: false });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("캐시 미스면 fetcher를 호출하고 결과를 저장한다", async () => {
    findUnique.mockResolvedValueOnce(null);
    const fetcher = vi.fn().mockResolvedValueOnce({ fresh: true });

    const result = await getOrSetCache("ALADIN_SEARCH", "key2", 1000, fetcher);

    expect(result).toEqual({ data: { fresh: true }, stale: false });
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it("캐시가 만료됐으면 fetcher를 다시 호출한다", async () => {
    findUnique.mockResolvedValueOnce({
      payload: JSON.stringify({ old: true }),
      expiresAt: new Date(Date.now() - 1000),
    } as never);
    const fetcher = vi.fn().mockResolvedValueOnce({ fresh: true });

    const result = await getOrSetCache("ALADIN_SEARCH", "key3", 1000, fetcher);

    expect(result).toEqual({ data: { fresh: true }, stale: false });
  });

  it("만료된 캐시가 있고 fetcher가 실패하면 stale 데이터를 반환한다", async () => {
    findUnique.mockResolvedValueOnce({
      payload: JSON.stringify({ old: true }),
      expiresAt: new Date(Date.now() - 1000),
    } as never);
    const fetcher = vi.fn().mockRejectedValueOnce(new Error("upstream down"));

    const result = await getOrSetCache("ALADIN_SEARCH", "key4", 1000, fetcher);

    expect(result).toEqual({ data: { old: true }, stale: true });
  });

  it("캐시가 없고 fetcher도 실패하면 에러를 던진다", async () => {
    findUnique.mockResolvedValueOnce(null);
    const fetcher = vi.fn().mockRejectedValueOnce(new Error("upstream down"));

    await expect(getOrSetCache("ALADIN_SEARCH", "key5", 1000, fetcher)).rejects.toThrow(
      "upstream down",
    );
  });
});
