"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ReadingChannel } from "@prisma/client";
import { ReviewCard } from "./ReviewCard";
import { toggleReviewLike, deleteReview } from "@/app/actions/reviews";

export interface CommunityReview {
  id: string;
  userId: string;
  rating: number | null;
  body: string;
  finishedAt: Date;
  channel: ReadingChannel | null;
  shortReview: string | null;
  originStory: string | null;
  tags: string[];
  excerpts: { id: string; quote: string; pageLabel: string | null; comment: string | null }[];
  visibility: "PUBLIC" | "PRIVATE";
  reviewerName: string | null;
  likeCount: number;
  likedByMe: boolean;
}

interface CommunityReviewListProps {
  bookIsbn13: string;
  bookTitle: string;
  bookAuthor: string | null;
  reviews: CommunityReview[]; // 좋아요 많은 순, 동률이면 최신순으로 이미 정렬돼 전달됨
  isLoggedIn: boolean;
  currentUserId?: string;
}

const VISIBLE_COUNT = 3;

type LikeState = { count: number; likedByMe: boolean };

export function CommunityReviewList({
  bookIsbn13,
  bookTitle,
  bookAuthor,
  reviews,
  isLoggedIn,
  currentUserId,
}: CommunityReviewListProps) {
  const [expanded, setExpanded] = useState(false);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [likeStates, setLikeStates] = useState<Map<string, LikeState>>(
    () => new Map(reviews.map((r) => [r.id, { count: r.likeCount, likedByMe: r.likedByMe }])),
  );
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const visibleReviews = reviews.filter((r) => !removedIds.has(r.id));

  if (visibleReviews.length === 0) {
    return (
      <p className="text-body-md text-on-surface-variant">
        아직 리뷰가 없습니다. 가장 먼저 리뷰를 남겨보세요.
      </p>
    );
  }

  function handleToggle(reviewId: string) {
    if (!isLoggedIn) {
      router.push(`/signin?callbackUrl=${encodeURIComponent(`/books/${bookIsbn13}`)}`);
      return;
    }
    const before = likeStates.get(reviewId);
    if (!before) return;
    const after: LikeState = {
      count: before.likedByMe ? before.count - 1 : before.count + 1,
      likedByMe: !before.likedByMe,
    };
    setLikeStates((prev) => new Map(prev).set(reviewId, after));

    startTransition(async () => {
      try {
        await toggleReviewLike(reviewId, bookIsbn13);
      } catch {
        setLikeStates((prev) => new Map(prev).set(reviewId, before));
      }
    });
  }

  function handleDelete(reviewId: string) {
    if (!window.confirm("이 리뷰를 삭제할까요? 되돌릴 수 없습니다.")) return;
    startTransition(async () => {
      await deleteReview(reviewId, bookIsbn13);
      setRemovedIds((prev) => new Set(prev).add(reviewId));
    });
  }

  const shown = expanded ? visibleReviews : visibleReviews.slice(0, VISIBLE_COUNT);

  return (
    <div className="flex flex-col gap-stack-md">
      {shown.map((review) => {
        const state = likeStates.get(review.id) ?? {
          count: review.likeCount,
          likedByMe: review.likedByMe,
        };
        const isMine = currentUserId != null && review.userId === currentUserId;
        return (
          <ReviewCard
            key={review.id}
            review={review}
            context="book-detail"
            reviewer={{ name: review.reviewerName }}
            likes={{
              count: state.count,
              likedByMe: state.likedByMe,
              onToggle: () => handleToggle(review.id),
              disabled: pending,
            }}
            manage={
              isMine
                ? {
                    onEdit: () => router.push(`/books/${bookIsbn13}/review/${review.id}/edit`),
                    onDelete: () => handleDelete(review.id),
                    disabled: pending,
                  }
                : undefined
            }
            share
            book={{ isbn13: bookIsbn13, title: bookTitle, author: bookAuthor, coverUrl: null }}
          />
        );
      })}

      {!expanded && visibleReviews.length > VISIBLE_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-body-md font-medium text-primary hover:underline self-center"
        >
          더보기 ({visibleReviews.length - VISIBLE_COUNT}개 더)
        </button>
      )}
    </div>
  );
}
