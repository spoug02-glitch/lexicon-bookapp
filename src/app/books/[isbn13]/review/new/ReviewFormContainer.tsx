"use client";

import { useRouter } from "next/navigation";
import { ReviewForm, type ReviewFormValues } from "@/components/review/ReviewForm";
import { createReview } from "@/app/actions/reviews";

interface ReviewFormContainerProps {
  book: { isbn13: string; title: string; author: string | null; coverUrl: string | null };
  presets: string[];
}

export function ReviewFormContainer({ book, presets }: ReviewFormContainerProps) {
  const router = useRouter();

  async function handleSubmit(values: ReviewFormValues) {
    await createReview(values);
    router.push(`/books/${book.isbn13}`);
  }

  return <ReviewForm book={book} presets={presets} onSubmit={handleSubmit} />;
}
