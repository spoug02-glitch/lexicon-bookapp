import { NextRequest, NextResponse } from "next/server";
import { searchBooksService } from "@/lib/services/books";
import { checkRateLimit } from "@/lib/rate-limit";

// 검색은 캐시 miss마다 알라딘 쿼터를 소모한다. 한 IP가 서로 다른 검색어를 계속 보내면
// 전체 서비스 공용 쿼터(일 4,800회)를 혼자 다 쓸 수 있어 최소한의 요청 빈도 제한을 둔다.
const SEARCH_RATE_LIMIT = 20;
const SEARCH_RATE_WINDOW_MS = 60 * 1000;

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "검색어(q)가 필요합니다." }, { status: 400 });
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`search:${ip}`, SEARCH_RATE_LIMIT, SEARCH_RATE_WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "검색 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", code: "RATE_LIMITED" },
      { status: 429 },
    );
  }

  const result = await searchBooksService(q);
  if (result.quotaExceeded) {
    return NextResponse.json(
      { error: "오늘의 검색 한도에 도달했습니다.", code: "QUOTA_EXCEEDED" },
      { status: 429 },
    );
  }
  return NextResponse.json({ items: result.items, stale: result.stale });
}
