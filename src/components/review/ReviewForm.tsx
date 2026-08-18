"use client";

import { useState, type FormEvent } from "react";
import type { ReadingChannel } from "@prisma/client";
import { ChannelSelector } from "@/components/review/ChannelSelector";
import { ExcerptBlockList, type ExcerptBlockValue } from "@/components/review/ExcerptBlockList";
import { TagSelector } from "@/components/review/TagSelector";
import { VisibilityToggle } from "@/components/review/VisibilityToggle";
import { StarRating } from "@/components/review/StarRating";
import { BookCover } from "@/components/book/BookCover";

export interface ReviewFormValues {
  bookIsbn13: string;
  rating: number | null;
  body: string;
  shortReview: string | null;
  finishedAt: string; // yyyy-mm-dd
  channel: ReadingChannel | null;
  originStory: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  tags: string[];
  excerpts: ExcerptBlockValue[];
}

interface ReviewFormProps {
  book: { isbn13: string; title: string; author: string | null; coverUrl: string | null };
  presets: string[];
  onSubmit: (values: ReviewFormValues) => Promise<void>;
  initialValues?: Partial<ReviewFormValues>;
  submitLabel?: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ReviewForm({
  book,
  presets,
  onSubmit,
  initialValues,
  submitLabel = "저장하기",
}: ReviewFormProps) {
  const [channel, setChannel] = useState<ReadingChannel | null>(initialValues?.channel ?? null);
  const [rating, setRating] = useState(initialValues?.rating ?? 0);
  const [body, setBody] = useState(initialValues?.body ?? "");
  const [shortReview, setShortReview] = useState(initialValues?.shortReview ?? "");
  const [originStory, setOriginStory] = useState(initialValues?.originStory ?? "");
  const [finishedAt, setFinishedAt] = useState(initialValues?.finishedAt ?? todayIso());
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(
    initialValues?.visibility ?? "PUBLIC",
  );
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [excerpts, setExcerpts] = useState<ExcerptBlockValue[]>(initialValues?.excerpts ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 공개 리뷰는 감상(body)이 반드시 있어야 한다. 비공개는 본문 없이도 저장할 수 있다.
  const bodyRequired = visibility === "PUBLIC" && body.trim().length === 0;
  const canSubmit = !bodyRequired && !submitting;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        bookIsbn13: book.isbn13,
        rating: rating > 0 ? rating : null,
        body: body.trim(),
        shortReview: shortReview.trim().length > 0 ? shortReview.trim() : null,
        finishedAt,
        channel,
        originStory: originStory.trim().length > 0 ? originStory.trim() : null,
        visibility,
        tags,
        excerpts: excerpts
          .filter((block) => block.quote.trim().length > 0)
          .map((block) => ({ ...block, quote: block.quote.trim() })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full h-full gap-stack-lg pb-[120px]">
      <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/20">
        <BookCover src={book.coverUrl} alt={book.title} size="sm" />
        <div className="flex flex-col gap-1">
          <h3 className="font-title-lg text-title-lg text-on-surface line-clamp-2">
            {book.title}
          </h3>
          {book.author && <p className="text-body-md text-on-surface-variant">{book.author}</p>}
        </div>
      </div>

      <ChannelSelector value={channel} onChange={setChannel} />

      <ExcerptBlockList value={excerpts} onChange={setExcerpts} />

      <div className="flex flex-col gap-stack-sm w-full">
        <div className="flex items-center justify-between">
          <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            별점
          </label>
          <span className="text-label-md text-on-surface-variant/70">선택</span>
        </div>
        <StarRating value={rating} onChange={setRating} size={32} />
      </div>

      <div className="flex flex-col gap-stack-sm w-full">
        <div className="flex items-center justify-between">
          <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            한줄평
          </label>
          <span className="text-label-md text-on-surface-variant/70">
            {shortReview.length}/60
          </span>
        </div>
        <input
          type="text"
          className="w-full bg-[#F1F5F9] text-on-surface p-4 rounded-xl text-body-lg focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-all placeholder:text-on-surface-variant/50 border border-transparent hover:border-outline-variant/30"
          placeholder="[예시] 인생 책 등극"
          maxLength={60}
          value={shortReview}
          onChange={(e) => setShortReview(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-stack-sm w-full">
        <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
          긴 리뷰
        </label>
        <textarea
          className="w-full bg-[#F1F5F9] text-on-surface p-4 rounded-xl text-body-lg focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-all resize-none placeholder:text-on-surface-variant/50 border border-transparent hover:border-outline-variant/30 leading-relaxed"
          placeholder="책에 대한 생각을 자유롭게 적어주세요..."
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-stack-sm w-full">
        <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
          발견 서사
        </label>
        <input
          type="text"
          className="w-full bg-[#F1F5F9] text-on-surface p-4 rounded-xl text-body-lg focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-all placeholder:text-on-surface-variant/50 border border-transparent hover:border-outline-variant/30"
          placeholder="예: 2026년 어느 날 동네 헌책방에서"
          maxLength={300}
          value={originStory}
          onChange={(e) => setOriginStory(e.target.value)}
        />
      </div>

      <TagSelector value={tags} onChange={setTags} presets={presets} />

      <VisibilityToggle value={visibility} onChange={setVisibility} />
      {visibility === "PUBLIC" && excerpts.length > 0 && (
        <p className="text-label-md text-on-surface-variant">
          발췌 {excerpts.length}개도 함께 공개됩니다.
        </p>
      )}

      <div className="flex flex-col gap-stack-sm w-full">
        <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
          완독일
        </label>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
              calendar_today
            </span>
          </div>
          <input
            type="date"
            className="w-full bg-[#F1F5F9] text-on-surface pl-12 pr-4 py-3 rounded-xl text-body-md focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface transition-all border border-transparent font-medium"
            value={finishedAt}
            onChange={(e) => setFinishedAt(e.target.value)}
            max={todayIso()}
          />
        </div>
      </div>

      {bodyRequired && (
        <p className="text-body-md text-error">공개하려면 리뷰 내용이 필요합니다.</p>
      )}
      {error && <p className="text-body-md text-error">{error}</p>}

      <div className="fixed bottom-0 left-0 w-full p-margin-mobile bg-surface/90 backdrop-blur-md pb-safe">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-primary text-on-primary font-title-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            check
          </span>
          {submitting ? "저장 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
