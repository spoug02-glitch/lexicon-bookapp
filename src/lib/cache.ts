import "server-only";
import { prisma } from "@/lib/prisma";
import type { ApiProvider } from "@prisma/client";

interface CacheOutcome<T> {
  data: T;
  stale: boolean;
}

// 캐시 히트(만료 전)면 즉시 반환. 미스/만료면 fetcher를 호출해 새로 저장.
// fetcher가 실패하고 만료된 캐시라도 있으면 "최신이 아닐 수 있음" 표시와 함께 그 값을 반환한다.
export async function getOrSetCache<T>(
  provider: ApiProvider,
  cacheKey: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<CacheOutcome<T>> {
  const now = new Date();
  const cached = await prisma.apiCache.findUnique({
    where: { provider_cacheKey: { provider, cacheKey } },
  });

  if (cached && cached.expiresAt > now) {
    return { data: JSON.parse(cached.payload) as T, stale: false };
  }

  try {
    const data = await fetcher();
    await prisma.apiCache.upsert({
      where: { provider_cacheKey: { provider, cacheKey } },
      update: {
        payload: JSON.stringify(data),
        fetchedAt: now,
        expiresAt: new Date(now.getTime() + ttlMs),
      },
      create: {
        provider,
        cacheKey,
        payload: JSON.stringify(data),
        expiresAt: new Date(now.getTime() + ttlMs),
      },
    });
    return { data, stale: false };
  } catch (error) {
    if (cached) {
      return { data: JSON.parse(cached.payload) as T, stale: true };
    }
    throw error;
  }
}
