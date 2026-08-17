import { NextRequest, NextResponse } from "next/server";
import { getHoldingsService } from "@/lib/services/library";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ isbn13: string }> },
) {
  const { isbn13 } = await params;
  const region = req.nextUrl.searchParams.get("region");
  const dtlRegion = req.nextUrl.searchParams.get("dtl_region");
  if (!region || !dtlRegion) {
    return NextResponse.json(
      { error: "region, dtl_region 파라미터가 필요합니다." },
      { status: 400 },
    );
  }

  const result = await getHoldingsService(isbn13, region, dtlRegion);
  if (result.errorMessage) {
    return NextResponse.json({ error: result.errorMessage }, { status: 502 });
  }
  return NextResponse.json({ holdings: result.holdings, stale: result.stale });
}
