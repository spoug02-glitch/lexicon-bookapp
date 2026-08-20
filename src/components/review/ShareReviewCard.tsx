import type { ReadingChannel } from "@prisma/client";
import { BookCover } from "@/components/book/BookCover";
import { ChannelBadge } from "@/components/review/ChannelBadge";
import { StarRating } from "@/components/review/StarRating";
import { ExcerptShareTrigger } from "@/components/review/ExcerptShareTrigger";

interface ShareReviewCardProps {
  book: { isbn13: string; title: string; author: string | null; coverUrl: string | null };
  review: {
    rating: number | null;
    shortReview: string | null;
    body: string;
    channel: ReadingChannel | null;
    originStory: string | null;
    tags: string[];
    excerpts: { id: string; quote: string; pageLabel: string | null; comment: string | null }[];
  };
}

export function ShareReviewCard({ book, review }: ShareReviewCardProps) {
  return (
    <div className="flex flex-col gap-stack-lg max-w-lg mx-auto p-margin-mobile">
      <div className="flex items-center gap-4">
        <BookCover src={book.coverUrl} alt={book.title} size="md" />
        <div className="flex flex-col gap-1">
          <h1 className="font-title-lg text-title-lg text-on-surface">{book.title}</h1>
          {book.author && <p className="text-body-md text-on-surface-variant">{book.author}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ChannelBadge channel={review.channel} />
        {review.rating != null && <StarRating value={review.rating} readOnly size={18} />}
      </div>

      {review.shortReview && (
        <p className="text-title-lg font-title-lg text-on-surface font-bold">{review.shortReview}</p>
      )}

      {review.originStory && (
        <p className="text-body-md text-on-surface-variant italic">&ldquo;{review.originStory}&rdquo;</p>
      )}

      {review.excerpts.length > 0 && (
        <div className="flex flex-col gap-2">
          {review.excerpts.map((excerpt) => (
            <blockquote
              key={excerpt.id}
              className="flex items-start justify-between gap-2 border-l-2 border-outline-variant/40 pl-3 text-body-md text-on-surface"
            >
              <div className="min-w-0">
                &ldquo;{excerpt.quote}&rdquo;
                {excerpt.pageLabel && (
                  <span className="block text-label-md text-on-surface-variant mt-1">
                    {excerpt.pageLabel}
                  </span>
                )}
                {excerpt.comment && (
                  <span className="block text-label-md text-on-surface-variant mt-1">
                    {excerpt.comment}
                  </span>
                )}
              </div>
              <ExcerptShareTrigger
                excerpt={{
                  excerptId: excerpt.id,
                  quote: excerpt.quote,
                  pageLabel: excerpt.pageLabel,
                  bookTitle: book.title,
                  author: book.author,
                }}
              />
            </blockquote>
          ))}
        </div>
      )}

      <p className="text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">{review.body}</p>

      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="bg-surface-container-high text-on-surface-variant text-label-md px-2 py-0.5 rounded-full"
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
