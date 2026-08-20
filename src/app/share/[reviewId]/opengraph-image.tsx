import { prisma } from "@/lib/prisma";
import { renderExcerptCardPng } from "@/lib/share-card/render";
import { getShareCardTheme, OG_CARD_RATIO } from "@/lib/share-card/theme";

export const size = { width: OG_CARD_RATIO.width, height: OG_CARD_RATIO.height };
export const contentType = "image/png";
export const alt = "책결 — 책과 만난 순간을 기록하는 곳";

interface OgImageProps {
  params: Promise<{ reviewId: string }>;
}

// 링크 미리보기(OG) 이미지. 공개 리뷰만 실제 정보를 담아 렌더하고, 비공개/존재하지 않는
// 리뷰는 내용을 전혀 드러내지 않는 중립 브랜드 이미지로 대체한다(정보 유출 방지).
export default async function OpengraphImage({ params }: OgImageProps) {
  const { reviewId } = await params;
  const theme = getShareCardTheme("light");

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      book: true,
      excerpts: { orderBy: { order: "asc" }, take: 1 },
    },
  });

  if (!review || review.visibility !== "PUBLIC") {
    const fallback = await renderExcerptCardPng(
      { bookTitle: "", author: null, pageLabel: null, quote: "책과 만난 순간을 기록하는 곳" },
      theme,
      OG_CARD_RATIO,
    );
    fallback.headers.set("Cache-Control", "public, max-age=0, s-maxage=300, must-revalidate");
    return fallback;
  }

  const representativeExcerpt = review.excerpts[0];
  const quote =
    representativeExcerpt?.quote ??
    review.shortReview ??
    (review.body.length > 120 ? `${review.body.slice(0, 120)}…` : review.body);

  const image = await renderExcerptCardPng(
    {
      bookTitle: review.book.title,
      author: review.book.author,
      pageLabel: representativeExcerpt?.pageLabel ?? null,
      quote,
    },
    theme,
    OG_CARD_RATIO,
  );
  image.headers.set("Cache-Control", "public, max-age=0, s-maxage=300, must-revalidate");
  return image;
}
