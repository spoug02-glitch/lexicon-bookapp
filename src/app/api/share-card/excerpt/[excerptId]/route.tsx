import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderExcerptCardPng } from "@/lib/share-card/render";
import { getShareCardTheme, getShareCardRatio } from "@/lib/share-card/theme";

interface RouteParams {
  params: Promise<{ excerptId: string }>;
}

// 발췌 공유 카드 PNG. 공개 리뷰의 발췌만 렌더한다 — 비공개 리뷰는 공유 링크와
// 동일한 정책으로 여기서도 접근을 막는다(리뷰 공개 여부는 발췌 단위로 따로 없음).
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { excerptId } = await params;
  const { searchParams } = new URL(request.url);

  const excerpt = await prisma.excerpt.findUnique({
    where: { id: excerptId },
    include: { review: { include: { book: true } } },
  });

  if (!excerpt || excerpt.review.visibility !== "PUBLIC") {
    return NextResponse.json({ error: "발췌를 찾을 수 없습니다." }, { status: 404 });
  }

  const theme = getShareCardTheme(searchParams.get("theme"));
  const ratio = getShareCardRatio(searchParams.get("ratio"));

  const image = await renderExcerptCardPng(
    {
      bookTitle: excerpt.review.book.title,
      author: excerpt.review.book.author,
      pageLabel: excerpt.pageLabel,
      quote: excerpt.quote,
    },
    theme,
    ratio,
  );

  // ImageResponse 기본 캐시 헤더(1년 immutable)를 쓰면 발췌를 수정해도 예전 이미지가
  // 계속 서빙된다. excerptId만으로는 캐시 키가 갱신을 못 따라가므로 짧게 덮어쓴다.
  image.headers.set("Cache-Control", "public, max-age=0, s-maxage=300, must-revalidate");
  return image;
}
