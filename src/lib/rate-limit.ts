import "server-only";

// 프로세스 메모리 기반의 가벼운 sliding-window rate limiter.
// 별도 인프라(Redis 등) 없이, 특정 IP가 알라딘 쿼터를 혼자 소진하는 것을 막는 최소한의 방어.
// 여러 인스턴스로 스케일아웃하면 인스턴스별로 카운트가 분리되지만, 이 프로젝트는
// 단일 로컬 프로세스로 운영되므로 이 정도로 충분하다.
const buckets = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    buckets.set(key, timestamps);
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return { allowed: true, remaining: limit - timestamps.length };
}
