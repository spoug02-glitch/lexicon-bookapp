import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShareReviewCard } from "@/components/review/ShareReviewCard";

interface SharePageProps {
  params: Promise<{ reviewId: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { reviewId } = await params;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      book: true,
      tags: { include: { tag: true } },
      excerpts: { orderBy: { order: "asc" } },
    },
  });

  if (!review || review.visibility !== "PUBLIC") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background py-margin-mobile">
      <ShareReviewCard
        book={{
          isbn13: review.book.isbn13,
          title: review.book.title,
          author: review.book.author,
          coverUrl: review.book.coverUrl,
        }}
        review={{
          rating: review.rating,
          shortReview: review.shortReview,
          body: review.body,
          channel: review.channel,
          originStory: review.originStory,
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
  );
}
