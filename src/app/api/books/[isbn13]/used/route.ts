import { NextRequest, NextResponse } from "next/server";
import { getUsedListingsService } from "@/lib/services/books";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ isbn13: string }> },
) {
  const { isbn13 } = await params;
  const result = await getUsedListingsService(isbn13);

  if (result.quotaExceeded) {
    return NextResponse.json(
      { error: "오늘의 조회 한도에 도달했습니다.", code: "QUOTA_EXCEEDED" },
      { status: 429 },
    );
  }
  return NextResponse.json({ items: result.items, stale: result.stale });
}
