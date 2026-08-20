import type { ReadingChannel } from "@prisma/client";

// Notion 리뷰 동기화 데이터베이스의 속성 이름. scripts/notion-setup.ts(DB 생성)와
// lib/services/notion.ts(내보내기/불러오기) 양쪽에서 공유하는 단일 소스.
export const NOTION_PROPERTIES = {
  title: "제목",
  author: "저자",
  isbn13: "ISBN13",
  rating: "별점",
  shortReview: "한줄평",
  body: "리뷰",
  channel: "채널",
  originStory: "발견서사",
  finishedAt: "완독일",
  visibility: "공개여부",
  tags: "태그",
  // 내보낸 리뷰와 다시 매칭하기 위한 내부 동기화 키. 사용자가 직접 수정하지 않아야 함.
  reviewId: "ChaekgyeolReviewId",
} as const;

export const CHANNEL_LABELS: Record<ReadingChannel, string> = {
  PAPER: "종이책",
  EBOOK: "전자책",
  AUDIOBOOK: "오디오북",
};

export const CHANNEL_BY_LABEL: Record<string, ReadingChannel> = Object.fromEntries(
  Object.entries(CHANNEL_LABELS).map(([key, label]) => [label, key as ReadingChannel]),
);

export const VISIBILITY_LABELS: Record<"PUBLIC" | "PRIVATE", string> = {
  PUBLIC: "공개",
  PRIVATE: "비공개",
};
