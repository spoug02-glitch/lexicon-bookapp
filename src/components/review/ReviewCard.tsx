import Link from "next/link";
import type { ReadingChannel } from "@prisma/client";
import { BookCover } from "@/components/book/BookCover";
import { ChannelBadge } from "@/components/review/ChannelBadge";
import { StarRating } from "@/components/review/StarRating";

interface ReviewCardReview {
  id: string;
  rating: number | null;
  body: string;
  finishedAt: Date;
  channel: ReadingChannel | null;
  shortReview: string | null;
  originStory: string | null;
  tags: string[];
  visibility: "PUBLIC" | "PRIVATE";
  excerpts: { id: string; quote: string; pageLabel: string | null; comment: string | null }[];
}

interface LikeState {
  count: number;
  likedByMe: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

interface ManageActions {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

interface ReviewCardProps {
  review: ReviewCardReview;
  context: "book-detail" | "my-history";
  reviewer?: { name: string | null };
  book?: { isbn13: string; title: string; author: string | null; coverUrl: string | null };
  likes?: LikeState;
  manage?: ManageActions;
  showVisibilityBadge?: boolean;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function TagRow({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="bg-surface-container-high text-on-surface-variant text-label-md px-2 py-0.5 rounded-full"
        >
          {tag.startsWith("#") ? tag : `#${tag}`}
        </span>
      ))}
    </div>
  );
}

function ExcerptPreview({ reviewId, excerpts }: { reviewId: string; excerpts: ReviewCardReview["excerpts"] }) {
  if (excerpts.length === 0) return null;
  const shown = excerpts.slice(0, 2);
  const remaining = excerpts.length - shown.length;

  return (
    <div className="flex flex-col gap-1 mt-2">
      {shown.map((excerpt) => (
        <p key={excerpt.id} className="text-body-md text-on-surface-variant italic border-l-2 border-outline-variant/40 pl-2">
          &ldquo;<span>{excerpt.quote}</span>&rdquo;
          {excerpt.pageLabel && <span className="not-italic text-label-md ml-1">({excerpt.pageLabel})</span>}
        </p>
      ))}
      {remaining > 0 && (
        <Link
          href={`/share/${reviewId}`}
          className="text-label-md text-primary hover:underline self-start"
        >
          발췌 {remaining}개 더보기
        </Link>
      )}
    </div>
  );
}

export function ReviewCard({
  review,
  context,
  reviewer,
  book,
  likes,
  manage,
  showVisibilityBadge,
}: ReviewCardProps) {
  if (context === "my-history" && book) {
    return (
      <div className="flex gap-stack-md bg-surface-container-lowest rounded-xl p-stack-sm shadow-sm overflow-hidden transition-all hover:shadow-md">
        <Link href={`/books/${book.isbn13}`} className="shrink-0">
          <BookCover src={book.coverUrl} alt={book.title} size="md" />
        </Link>
        <div className="flex flex-col flex-1 min-w-0 py-1 justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <ChannelBadge channel={review.channel} />
                {showVisibilityBadge && review.visibility === "PRIVATE" && (
                  <span
                    className="material-symbols-outlined text-[16px] text-on-surface-variant"
                    aria-label="비공개"
                  >
                    lock
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {review.rating != null && <StarRating value={review.rating} readOnly size={14} />}
                {manage && <ManageMenu {...manage} />}
              </div>
            </div>
            <Link href={`/books/${book.isbn13}`}>
              <h3 className="font-title-lg text-title-lg text-on-surface truncate leading-tight mb-1">
                {book.title}
              </h3>
            </Link>
            {book.author && (
              <p className="font-body-md text-body-md text-on-surface-variant truncate">
                {book.author}
              </p>
            )}
          </div>
          {review.shortReview && (
            <p className="font-title-lg text-body-md text-on-surface font-bold mt-2 line-clamp-1">
              {review.shortReview}
            </p>
          )}
          {review.originStory && (
            <p className="text-body-md text-on-surface-variant italic mt-1 line-clamp-1">
              &ldquo;{review.originStory}&rdquo;
            </p>
          )}
          <p className="font-body-md text-body-md text-on-surface line-clamp-2 mt-2 italic opacity-90 leading-snug">
            &ldquo;{review.body}&rdquo;
          </p>
          <TagRow tags={review.tags} />
          <ExcerptPreview reviewId={review.id} excerpts={review.excerpts} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface p-stack-md rounded-xl shadow-sm">
      <div className="flex justify-between items-start mb-stack-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-body-md">
            {(reviewer?.name ?? "?").slice(0, 1)}
          </div>
          <div>
            <div className="font-medium text-on-surface text-body-md">
              {reviewer?.name ?? "익명"}
            </div>
            {review.rating != null && <StarRating value={review.rating} readOnly size={16} />}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-end gap-1">
            <span className="text-label-md text-on-surface-variant">
              {formatDate(review.finishedAt)}
            </span>
            <div className="flex items-center gap-1">
              <ChannelBadge channel={review.channel} />
              {showVisibilityBadge && review.visibility === "PRIVATE" && (
                <span
                  className="material-symbols-outlined text-[16px] text-on-surface-variant"
                  aria-label="비공개"
                >
                  lock
                </span>
              )}
            </div>
          </div>
          {manage && <ManageMenu {...manage} />}
        </div>
      </div>
      {review.shortReview && (
        <p className="text-body-md text-on-surface font-bold mb-1">{review.shortReview}</p>
      )}
      {review.originStory && (
        <p className="text-body-md text-on-surface-variant italic mb-1">
          &ldquo;{review.originStory}&rdquo;
        </p>
      )}
      <p className="text-body-md text-on-surface-variant leading-relaxed line-clamp-3">
        {review.body}
      </p>
      <TagRow tags={review.tags} />
      <ExcerptPreview reviewId={review.id} excerpts={review.excerpts} />
      {likes && (
        <button
          type="button"
          onClick={likes.onToggle}
          disabled={likes.disabled}
          aria-pressed={likes.likedByMe}
          className={`mt-stack-sm flex items-center gap-1 text-label-md transition-colors disabled:opacity-50 ${
            likes.likedByMe ? "text-error" : "text-on-surface-variant hover:text-error"
          }`}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: `'FILL' ${likes.likedByMe ? 1 : 0}` }}
          >
            favorite
          </span>
          좋아요 {likes.count}
        </button>
      )}
    </div>
  );
}

function ManageMenu({ onEdit, onDelete, disabled }: ManageActions) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        aria-label="리뷰 수정"
        className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[16px]">edit</span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        aria-label="리뷰 삭제"
        className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[16px]">delete</span>
      </button>
    </div>
  );
}
