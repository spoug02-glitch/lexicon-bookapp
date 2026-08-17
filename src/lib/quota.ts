import "server-only";
import { prisma } from "@/lib/prisma";
import type { ApiProvider } from "@prisma/client";

// 알라딘은 TTBKey 하나로 ItemSearch/ItemLookUp/ItemOffStoreList를 공유 호출하므로
// 세 provider의 카운트를 합산해서 일 5,000회 제한(안전마진 4,800)을 판단한다.
// 도서관정보나루는 공식 한도가 불명확해 쿼터 차단 없이 캐싱만 적용(quotaGroup이 null 반환).
const ALADIN_GROUP: ApiProvider[] = ["ALADIN_SEARCH", "ALADIN_LOOKUP", "ALADIN_USED"];
const ALADIN_DAILY_LIMIT = 4800;

function quotaGroup(provider: ApiProvider): { providers: ApiProvider[]; limit: number } | null {
  if (ALADIN_GROUP.includes(provider)) {
    return { providers: ALADIN_GROUP, limit: ALADIN_DAILY_LIMIT };
  }
  return null;
}

function todayKST(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

export async function recordQuotaUsage(provider: ApiProvider): Promise<void> {
  const date = todayKST();
  await prisma.apiQuotaUsage.upsert({
    where: { provider_date: { provider, date } },
    update: { count: { increment: 1 } },
    create: { provider, date, count: 1 },
  });
}

export class QuotaExceededError extends Error {
  constructor(public readonly provider: ApiProvider) {
    super(`${provider} 오늘의 API 호출 한도에 도달했습니다.`);
    this.name = "QuotaExceededError";
  }
}

// 쿼터 확인 → 실행을 한 번에 처리하는 헬퍼.
// "확인 후 기록"(check-then-record) 순서는 동시 요청 사이에 TOCTOU 경쟁이 생겨
// 그룹 합계가 한도를 넘겨도 통과할 수 있다. 대신 먼저 원자적으로 증가시키고(단일
// upsert라 DB 레벨에서 원자적) 그 결과로 그룹 합계를 확인해, 초과 시에는 방금
// 늘린 만큼만 되돌린다 — 실행하지 못한 요청이 카운트에 남지 않도록.
export async function withQuota<T>(provider: ApiProvider, fn: () => Promise<T>): Promise<T> {
  const group = quotaGroup(provider);
  if (!group) {
    return fn();
  }

  const date = todayKST();
  await recordQuotaUsage(provider);

  const rows = await prisma.apiQuotaUsage.findMany({
    where: { provider: { in: group.providers }, date },
  });
  const used = rows.reduce((sum, row) => sum + row.count, 0);

  if (used > group.limit) {
    await prisma.apiQuotaUsage.update({
      where: { provider_date: { provider, date } },
      data: { count: { decrement: 1 } },
    });
    throw new QuotaExceededError(provider);
  }

  return fn();
}
