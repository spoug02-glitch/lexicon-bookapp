import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { getBookDetailService } from "@/lib/services/books";
import { getTagPresets } from "@/app/actions/reviews";
import { ReviewFormContainer } from "./ReviewFormContainer";

interface NewReviewForBookPageProps {
  params: Promise<{ isbn13: string }>;
}

export default async function NewReviewForBookPage({ params }: NewReviewForBookPageProps) {
  const { isbn13 } = await params;
  const [{ book }, presets] = await Promise.all([
    getBookDetailService(isbn13),
    getTagPresets(),
  ]);

  if (!book) notFound();

  return (
    <>
      <Header title="리뷰 작성" variant="back" backHref={`/books/${isbn13}`} />
      <main className="flex flex-col relative w-full pt-16 bg-background min-h-screen p-margin-mobile">
        <ReviewFormContainer
          book={{
            isbn13: book.isbn13,
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl,
          }}
          presets={presets}
        />
      </main>
    </>
  );
}
