import { describe, expect, it } from "vitest";
import { createReviewSchema } from "@/lib/validation/review";

const base = {
  bookIsbn13: "9788900000001",
  rating: 4,
  body: "좋은 책이었습니다.",
  shortReview: null,
  finishedAt: "2026-08-01",
  channel: null,
  originStory: null,
  visibility: "PUBLIC" as const,
  tags: [] as string[],
  excerpts: [] as { id: string; quote: string; pageLabel: string | null; comment: string | null }[],
};

describe("createReviewSchema", () => {
  it("channel/originStory 없이도 유효하다(모두 선택 사항)", () => {
    const result = createReviewSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("channel/originStory/shortReview/tags를 채워도 유효하다", () => {
    const result = createReviewSchema.safeParse({
      ...base,
      channel: "PAPER",
      originStory: "2026년 어느 날 동네 헌책방에서",
      shortReview: "짧지만 강렬했다",
      tags: ["소장필요", "밑줄용"],
    });
    expect(result.success).toBe(true);
  });

  it("공개(PUBLIC)인데 body가 비어있으면 무효하다", () => {
    const result = createReviewSchema.safeParse({
      ...base,
      body: "",
      visibility: "PUBLIC",
    });
    expect(result.success).toBe(false);
  });

  it("공개(PUBLIC)인데 body가 null이면 무효하다", () => {
    const result = createReviewSchema.safeParse({
      ...base,
      body: null,
      visibility: "PUBLIC",
    });
    expect(result.success).toBe(false);
  });

  it("비공개(PRIVATE)면 body가 비어있어도 유효하다", () => {
    const result = createReviewSchema.safeParse({
      ...base,
      body: null,
      visibility: "PRIVATE",
    });
    expect(result.success).toBe(true);
  });

  it("태그가 10개를 초과하면 무효하다", () => {
    const result = createReviewSchema.safeParse({
      ...base,
      tags: Array.from({ length: 11 }, (_, i) => `태그${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rating은 optional(null)이 허용된다", () => {
    const result = createReviewSchema.safeParse({ ...base, rating: null });
    expect(result.success).toBe(true);
  });

  it("rating이 범위(1~5)를 벗어나면 무효하다", () => {
    const result = createReviewSchema.safeParse({ ...base, rating: 6 });
    expect(result.success).toBe(false);
  });

  it("finishedAt이 미래 날짜면 무효하다", () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
    const result = createReviewSchema.safeParse({
      ...base,
      finishedAt: future.toISOString().slice(0, 10),
    });
    expect(result.success).toBe(false);
  });

  it("finishedAt 형식이 YYYY-MM-DD가 아니면 무효하다", () => {
    const result = createReviewSchema.safeParse({ ...base, finishedAt: "2026/08/01" });
    expect(result.success).toBe(false);
  });

  it("finishedAt이 형식은 맞지만 존재하지 않는 날짜면 무효하다", () => {
    const result = createReviewSchema.safeParse({ ...base, finishedAt: "2026-13-40" });
    expect(result.success).toBe(false);
  });

  it("excerpts를 채워도 유효하다", () => {
    const result = createReviewSchema.safeParse({
      ...base,
      excerpts: [
        { id: "tmp-1", quote: "인상 깊은 문장", pageLabel: "p.12", comment: "좋았다" },
        { id: "tmp-2", quote: "또 다른 문장", pageLabel: null, comment: null },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("excerpt의 quote가 빈 문자열이면 무효하다", () => {
    const result = createReviewSchema.safeParse({
      ...base,
      excerpts: [{ id: "tmp-1", quote: "", pageLabel: null, comment: null }],
    });
    expect(result.success).toBe(false);
  });

  it("excerpts가 20개를 초과하면 무효하다", () => {
    const result = createReviewSchema.safeParse({
      ...base,
      excerpts: Array.from({ length: 21 }, (_, i) => ({
        id: `tmp-${i}`,
        quote: `문장 ${i}`,
        pageLabel: null,
        comment: null,
      })),
    });
    expect(result.success).toBe(false);
  });

  it("excerpts를 생략하면 빈 배열이 기본값이다", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { excerpts: _omit, ...withoutExcerpts } = base;
    const result = createReviewSchema.safeParse(withoutExcerpts);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.excerpts).toEqual([]);
    }
  });
});
