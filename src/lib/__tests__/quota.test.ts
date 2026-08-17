import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    apiQuotaUsage: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { recordQuotaUsage, withQuota, QuotaExceededError } from "@/lib/quota";

const findMany = vi.mocked(prisma.apiQuotaUsage.findMany);
const upsert = vi.mocked(prisma.apiQuotaUsage.upsert);
const update = vi.mocked(prisma.apiQuotaUsage.update);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("recordQuotaUsage", () => {
  it("호출 시 provider+날짜 키로 카운트를 1 증가시킨다", async () => {
    await recordQuotaUsage("ALADIN_SEARCH");

    expect(upsert).toHaveBeenCalledTimes(1);
    const call = upsert.mock.calls[0][0] as {
      update: { count: { increment: number } };
      create: { count: number; provider: string };
    };
    expect(call.update.count.increment).toBe(1);
    expect(call.create.count).toBe(1);
    expect(call.create.provider).toBe("ALADIN_SEARCH");
  });
});

describe("withQuota", () => {
  it("그룹이 없는 provider는 증가/조회 없이 바로 fn을 실행한다", async () => {
    const fn = vi.fn().mockResolvedValueOnce("결과");

    const result = await withQuota("LIBRARY_HOLDINGS", fn);

    expect(result).toBe("결과");
    expect(upsert).not.toHaveBeenCalled();
    expect(findMany).not.toHaveBeenCalled();
  });

  it("먼저 원자적으로 증가시킨 뒤 합계가 허용 범위면 fn을 실행하고 되돌리지 않는다", async () => {
    // 이 호출 자체가 증가시킨 뒤의 합계이므로 fn 호출 여부는 이 값 기준으로 판단된다.
    findMany.mockResolvedValueOnce([{ count: 10 }] as never);
    const fn = vi.fn().mockResolvedValueOnce("결과");

    const result = await withQuota("ALADIN_SEARCH", fn);

    expect(result).toBe("결과");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledTimes(1); // 선증가
    expect(update).not.toHaveBeenCalled(); // 롤백 없음
  });

  it("증가 후 합계가 한도를 넘으면 증가분을 되돌리고 fn 없이 QuotaExceededError를 던진다", async () => {
    findMany.mockResolvedValueOnce([{ count: 4801 }] as never);
    const fn = vi.fn();

    await expect(withQuota("ALADIN_SEARCH", fn)).rejects.toBeInstanceOf(QuotaExceededError);
    expect(fn).not.toHaveBeenCalled();
    expect(upsert).toHaveBeenCalledTimes(1); // 선증가는 이미 발생
    expect(update).toHaveBeenCalledTimes(1); // 롤백(decrement)
    const rollbackCall = update.mock.calls[0][0] as { data: { count: { decrement: number } } };
    expect(rollbackCall.data.count.decrement).toBe(1);
  });
});
