import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { BookCover } from "@/components/book/BookCover";
import { CommunityReviewList, type CommunityReview } from "@/components/review/CommunityReviewList";
import { QuotaBanner } from "@/components/ui/QuotaBanner";
import { getBookDetailService } from "@/lib/services/books";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface BookDetailPageProps {
  params: Promise<{ isbn13: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { isbn13 } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id;

  const { book, quotaExceeded } = await getBookDetailService(isbn13);

  const rawReviews = await prisma.review.findMany({
    where: { bookId: isbn13, visibility: "PUBLIC" },
    include: {
      user: true,
      tags: { include: { tag: true } },
      _count: { select: { likes: true } },
      // 로그인 안 했으면 매칭될 수 없는 값으로 조회해 항상 같은 타입 형태를 유지한다.
      likes: { where: { userId: currentUserId ?? "__anonymous__" } },
    },
  });

  // 좋아요 많은 순, 동률이면 최신순(createdAt desc).
  const reviews: CommunityReview[] = [...rawReviews]
    .sort(
      (a, b) =>
        b._count.likes - a._count.likes || b.createdAt.getTime() - a.createdAt.getTime(),
    )
    .map((r) => ({
      id: r.id,
      userId: r.userId,
      rating: r.rating,
      body: r.body,
      finishedAt: r.finishedAt,
      channel: r.channel,
      shortReview: r.shortReview,
      originStory: r.originStory,
      tags: r.tags.map((rt) => rt.tag.label),
      visibility: r.visibility,
      reviewerName: r.user.displayName ?? r.user.name,
      likeCount: r._count.likes,
      likedByMe: r.likes.length > 0,
    }));

  if (!book) {
    if (quotaExceeded) {
      return (
        <>
          <Header title="책 상세" variant="back" />
          <main className="flex flex-col relative w-full pt-16 px-margin-mobile bg-background min-h-screen">
            <QuotaBanner provider="aladin" />
          </main>
        </>
      );
    }
    notFound();
  }

  return (
    <>
      <Header title="책 상세" variant="back" />
      <main className="flex flex-col relative w-full pt-16 pb-24 bg-background min-h-screen">
        <div className="flex flex-col w-full pb-safe">
          {/* 책 기본 정보 */}
          <div className="px-margin-mobile py-stack-lg bg-surface">
            <div className="flex flex-col md:flex-row gap-stack-lg md:gap-margin-desktop items-center md:items-start max-w-container-max mx-auto">
              <BookCover src={book.coverUrl} alt={book.title} size="lg" />
              <div className="flex flex-col gap-stack-sm flex-1 text-center md:text-left pt-stack-sm">
                <h2 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface mt-unit leading-tight">
                  {book.title}
                </h2>
                {book.author && (
                  <p className="text-title-lg font-title-lg text-on-surface-variant">
                    {book.author}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mt-stack-sm text-body-md text-on-surface-variant">
                  {book.publisher && <span>출판사: {book.publisher}</span>}
                  {book.pubDate && (
                    <span>출간일: {book.pubDate.toISOString().slice(0, 10)}</span>
                  )}
                  <span>ISBN: {book.isbn13}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 정가 */}
          <div className="bg-surface-container-low py-stack-lg">
            <div className="max-w-container-max mx-auto px-margin-mobile">
              {book.isSeed && (
                <p className="text-label-md text-on-surface-variant bg-surface-container px-3 py-2 rounded-lg mb-stack-md">
                  [예시] 이 책은 데모용 가상의 도서이며, 아래 가격 정보도 실제 데이터가 아닌
                  예시입니다.
                </p>
              )}
              <div className="bg-surface rounded-xl p-stack-md shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-on-surface">
                  storefront
                </span>
                <span className="text-body-lg font-semibold text-on-surface">정가</span>
                <span className="ml-auto text-title-lg font-title-lg text-on-surface">
                  {book.priceStandard != null
                    ? `${book.priceStandard.toLocaleString()}원`
                    : "가격 정보 없음"}
                </span>
              </div>
            </div>
          </div>

          {/* 커뮤니티 리뷰 */}
          <div className="max-w-container-max mx-auto px-margin-mobile py-stack-lg w-full">
            <div className="flex justify-between items-center mb-stack-md">
              <h3 className="text-title-lg font-title-lg text-on-surface">커뮤니티 리뷰</h3>
              <Link
                href={`/books/${book.isbn13}/review/new`}
                className="text-primary font-medium text-body-md flex items-center gap-1 hover:underline"
              >
                리뷰 작성 <span className="material-symbols-outlined text-[16px]">edit</span>
              </Link>
            </div>
            <CommunityReviewList
              bookIsbn13={book.isbn13}
              reviews={reviews}
              isLoggedIn={!!currentUserId}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      </main>
    </>
  );
}
