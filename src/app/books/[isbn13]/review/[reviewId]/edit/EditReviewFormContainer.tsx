"use client";

import { useRouter } from "next/navigation";
import type { ReadingChannel } from "@prisma/client";
import type { ExcerptBlockValue } from "@/components/review/ExcerptBlockList";
import { ReviewForm, type ReviewFormValues } from "@/components/review/ReviewForm";
import { updateReview } from "@/app/actions/reviews";

interface EditReviewFormContainerProps {
  reviewId: string;
  book: { isbn13: string; title: string; author: string | null; coverUrl: string | null };
  presets: string[];
  initialValues: {
    rating: number | null;
    body: string;
    shortReview: string | null;
    finishedAt: string;
    channel: ReadingChannel | null;
    originStory: string | null;
    visibility: "PUBLIC" | "PRIVATE";
    tags: string[];
    excerpts: ExcerptBlockValue[];
  };
}

export function EditReviewFormContainer({
  reviewId,
  book,
  presets,
  initialValues,
}: EditReviewFormContainerProps) {
  const router = useRouter();

  async function handleSubmit(values: ReviewFormValues) {
    await updateReview(reviewId, values);
    router.push(`/books/${book.isbn13}`);
  }

  return (
    <ReviewForm
      book={book}
      presets={presets}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      submitLabel="수정하기"
    />
  );
}
