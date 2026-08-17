"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ReadingChannel } from "@prisma/client";
import { FilterChips, type FilterValue } from "@/components/history/FilterChips";
import { ReviewCard } from "@/components/review/ReviewCard";
import { deleteReview } from "@/app/actions/reviews";

interface HistoryReview {
  id: string;
  rating: number | null;
  body: string;
  finishedAt: Date;
  channel: ReadingChannel | null;
  shortReview: string | null;
  originStory: string | null;
  tags: string[];
  visibility: "PUBLIC" | "PRIVATE";
  book: { isbn13: string; title: string; author: string | null; coverUrl: string | null };
}

function monthLabel(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

export function HistoryTimeline({ reviews }: { reviews: HistoryReview[] }) {
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(review: HistoryReview) {
    if (!window.confirm("이 리뷰를 삭제할까요? 되돌릴 수 없습니다.")) return;
    startTransition(async () => {
      await deleteReview(review.id, review.book.isbn13);
      setRemovedIds((prev) => new Set(prev).add(review.id));
    });
  }

  const grouped = useMemo(() => {
    const remaining = reviews.filter((r) => !removedIds.has(r.id));
    const filtered = filter === "ALL" ? remaining : remaining.filter((r) => r.channel === filter);

    const groups = new Map<string, HistoryReview[]>();
    for (const review of filtered) {
      const label = monthLabel(review.finishedAt);
      const list = groups.get(label) ?? [];
      list.push(review);
      groups.set(label, list);
    }
    return groups;
  }, [reviews, removedIds, filter]);

  return (
    <div className="flex flex-col gap-stack-lg">
      <FilterChips active={filter} onChange={setFilter} />

      {grouped.size === 0 ? (
        <p className="text-body-md text-on-surface-variant text-center mt-stack-lg">
          해당 채널로 남긴 리뷰가 아직 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-stack-lg">
          {Array.from(grouped.entries()).map(([label, items]) => (
            <div key={label} className="flex flex-col gap-stack-sm">
              <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest px-unit mb-1">
                {label}
              </h2>
              <div className="flex flex-col gap-stack-md">
                {items.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    context="my-history"
                    book={review.book}
                    showVisibilityBadge
                    manage={{
                      onEdit: () =>
                        router.push(`/books/${review.book.isbn13}/review/${review.id}/edit`),
                      onDelete: () => handleDelete(review),
                      disabled: pending,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
