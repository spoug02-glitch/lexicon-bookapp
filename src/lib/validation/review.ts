import { z } from "zod";

export const ReadingChannelEnum = z.enum(["PAPER", "EBOOK", "AUDIOBOOK"]);
export const ReviewVisibilityEnum = z.enum(["PUBLIC", "PRIVATE"]);

export const excerptSchema = z.object({
  id: z.string().min(1),
  quote: z.string().trim().min(1, "발췌 문장을 입력해주세요.").max(1000),
  pageLabel: z.string().trim().max(30, "페이지/위치는 30자 이내로 입력해주세요.").nullable(),
  comment: z.string().trim().max(200, "한줄코멘트는 200자 이내로 입력해주세요.").nullable(),
});

// 공개 리뷰는 감상(body)이 반드시 있어야 한다("감상 없이 공개 불가" 규칙).
// 비공개 리뷰는 채널/서사/한줄평만 남기고 body를 비워도 된다.
export const createReviewSchema = z
  .object({
    bookIsbn13: z.string().min(1),
    rating: z.number().int().min(1).max(5).nullable(),
    body: z.string().max(4000).nullable(),
    shortReview: z.string().trim().max(60, "한줄평은 60자 이내로 입력해주세요.").nullable(),
    finishedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "완독일 형식이 올바르지 않습니다(YYYY-MM-DD).")
      .refine((value) => !Number.isNaN(new Date(value).getTime()), {
        message: "유효하지 않은 날짜입니다.",
      })
      .refine((value) => new Date(value).getTime() <= Date.now(), {
        message: "완독일은 미래 날짜일 수 없습니다.",
      }),
    channel: ReadingChannelEnum.nullable(),
    originStory: z.string().trim().max(300, "발견 서사는 300자 이내로 입력해주세요.").nullable(),
    visibility: ReviewVisibilityEnum.default("PUBLIC"),
    tags: z.array(z.string().trim().min(1).max(20)).max(10, "태그는 최대 10개까지 선택할 수 있습니다.").default([]),
    excerpts: z.array(excerptSchema).max(20, "발췌는 최대 20개까지 추가할 수 있습니다.").default([]),
  })
  .refine((data) => data.visibility !== "PUBLIC" || (data.body?.trim().length ?? 0) > 0, {
    message: "공개하려면 리뷰 내용이 필요합니다.",
    path: ["body"],
  });

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
