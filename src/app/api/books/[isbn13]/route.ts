import { NextRequest, NextResponse } from "next/server";
import { getBookDetailService } from "@/lib/services/books";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ isbn13: string }> },
) {
  const { isbn13 } = await params;
  const result = await getBookDetailService(isbn13);

  if (result.quotaExceeded) {
    return NextResponse.json(
      { error: "오늘의 조회 한도에 도달했습니다.", code: "QUOTA_EXCEEDED" },
      { status: 429 },
    );
  }
  if (!result.book) {
    return NextResponse.json({ error: "책 정보를 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ book: result.book, stale: result.stale });
}
