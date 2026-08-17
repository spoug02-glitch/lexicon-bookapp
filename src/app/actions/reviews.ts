"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-guard";
import { createReviewSchema, type CreateReviewInput } from "@/lib/validation/review";
import { getBookDetailService } from "@/lib/services/books";

// 리뷰의 태그 연결을 통째로 재생성한다(가장 단순 — 부분 diff보다 신뢰성이 높음).
// 새로 등장한 라벨은 Tag로 upsert하며 usageCount를 올려 자동완성 우선순위에 반영한다.
async function syncReviewTags(reviewId: string, labels: string[]) {
  await prisma.reviewTag.deleteMany({ where: { reviewId } });

  for (const label of labels) {
    const tag = await prisma.tag.upsert({
      where: { label },
      update: { usageCount: { increment: 1 } },
      create: { label, usageCount: 1 },
    });
    await prisma.reviewTag.create({ data: { reviewId, tagId: tag.id } });
  }
}

export async function createReview(input: CreateReviewInput) {
  const userId = await requireUserId();
  const parsed = createReviewSchema.parse(input);

  // /reviews/new(책 미확정 진입)에서 고른 책은 아직 Book 테이블에 없을 수 있다.
  // Review.bookId FK가 실패하지 않도록 리뷰 생성 전에 항상 책 존재를 보장한다.
  const { book } = await getBookDetailService(parsed.bookIsbn13);
  if (!book) {
    throw new Error("책 정보를 확인할 수 없어 리뷰를 저장하지 못했습니다.");
  }

  const review = await prisma.review.create({
    data: {
      userId,
      bookId: parsed.bookIsbn13,
      rating: parsed.rating,
      body: parsed.body ?? "",
      shortReview: parsed.shortReview,
      finishedAt: new Date(parsed.finishedAt),
      channel: parsed.channel,
      originStory: parsed.originStory,
      visibility: parsed.visibility,
    },
  });

  await syncReviewTags(review.id, parsed.tags);

  revalidatePath(`/books/${parsed.bookIsbn13}`);
  revalidatePath("/history");

  return review;
}

export async function updateReview(reviewId: string, input: CreateReviewInput) {
  const userId = await requireUserId();
  const parsed = createReviewSchema.parse(input);

  const existing = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!existing || existing.userId !== userId) {
    throw new Error("이 리뷰를 수정할 권한이 없습니다.");
  }

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: parsed.rating,
      body: parsed.body ?? "",
      shortReview: parsed.shortReview,
      finishedAt: new Date(parsed.finishedAt),
      channel: parsed.channel,
      originStory: parsed.originStory,
      visibility: parsed.visibility,
    },
  });

  await syncReviewTags(review.id, parsed.tags);

  revalidatePath(`/books/${parsed.bookIsbn13}`);
  revalidatePath("/history");

  return review;
}

export async function deleteReview(reviewId: string, bookIsbn13: string) {
  const userId = await requireUserId();

  const existing = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!existing || existing.userId !== userId) {
    throw new Error("이 리뷰를 삭제할 권한이 없습니다.");
  }

  await prisma.review.delete({ where: { id: reviewId } });

  revalidatePath(`/books/${bookIsbn13}`);
  revalidatePath("/history");
}

// 좋아요는 로그인 필수. 이미 눌렀으면 취소(토글), 사용자당 리뷰 1개에 최대 1개(스키마 unique로 강제).
// find-then-act 대신 "우선 생성 시도 → unique 충돌이면 이미 좋아요 상태이므로 삭제"로 처리해
// 동시 클릭/중복 요청 race에서도 unique 제약을 그대로 신뢰할 수 있게 한다.
export async function toggleReviewLike(reviewId: string, bookIsbn13: string) {
  const userId = await requireUserId();

  try {
    await prisma.reviewLike.create({ data: { userId, reviewId } });
    revalidatePath(`/books/${bookIsbn13}`);
    return { liked: true };
  } catch (error) {
    const isDuplicate =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
    if (!isDuplicate) throw error;

    await prisma.reviewLike.deleteMany({ where: { userId, reviewId } });
    revalidatePath(`/books/${bookIsbn13}`);
    return { liked: false };
  }
}

// 프리셋(#소장필요 #밑줄용 #영화나오면)을 포함해 사용 빈도순으로 태그 후보를 내려준다.
export async function getTagPresets() {
  const tags = await prisma.tag.findMany({
    orderBy: { usageCount: "desc" },
    take: 20,
  });

  return tags.map((tag) => tag.label);
}
