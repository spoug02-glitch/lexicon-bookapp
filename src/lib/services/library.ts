import "server-only";
import { getOrSetCache } from "@/lib/cache";
import { checkHoldings, type LibraryHolding } from "@/lib/external/library";

const HOLDINGS_TTL_MS = 12 * 60 * 60 * 1000;

export interface HoldingsResult {
  holdings: LibraryHolding[];
  stale: boolean;
  errorMessage?: string;
}

export async function getHoldingsService(
  isbn13: string,
  region: string,
  dtlRegion: string,
): Promise<HoldingsResult> {
  try {
    const { data, stale } = await getOrSetCache(
      "LIBRARY_HOLDINGS",
      `${isbn13}:${region}:${dtlRegion}`,
      HOLDINGS_TTL_MS,
      () => checkHoldings(isbn13, region, dtlRegion),
    );
    return { holdings: data, stale };
  } catch {
    return {
      holdings: [],
      stale: false,
      errorMessage: "도서관 소장 여부 조회 중 오류가 발생했습니다.",
    };
  }
}
