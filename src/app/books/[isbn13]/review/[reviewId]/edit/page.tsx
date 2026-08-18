import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTagPresets } from "@/app/actions/reviews";
import { EditReviewFormContainer } from "./EditReviewFormContainer";

interface EditReviewPageProps {
  params: Promise<{ isbn13: string; reviewId: string }>;
}

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const { isbn13, reviewId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const [review, presets] = await Promise.all([
    prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        book: true,
        tags: { include: { tag: true } },
        excerpts: { orderBy: { order: "asc" } },
      },
    }),
    getTagPresets(),
  ]);

  if (!review || review.userId !== session.user.id || review.bookId !== isbn13) {
    notFound();
  }

  return (
    <>
      <Header title="리뷰 수정" variant="back" backHref={`/books/${isbn13}`} />
      <main className="flex flex-col relative w-full pt-16 bg-background min-h-screen p-margin-mobile">
        <EditReviewFormContainer
          reviewId={review.id}
          book={{
            isbn13: review.book.isbn13,
            title: review.book.title,
            author: review.book.author,
            coverUrl: review.book.coverUrl,
          }}
          presets={presets}
          initialValues={{
            rating: review.rating,
            body: review.body,
            shortReview: review.shortReview,
            finishedAt: review.finishedAt.toISOString().slice(0, 10),
            channel: review.channel,
            originStory: review.originStory,
            visibility: review.visibility,
            tags: review.tags.map((rt) => rt.tag.label),
            excerpts: review.excerpts.map((e) => ({
              id: e.id,
              quote: e.quote,
              pageLabel: e.pageLabel,
              comment: e.comment,
            })),
          }}
        />
      </main>
    </>
  );
}
