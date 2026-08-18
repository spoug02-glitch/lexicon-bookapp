// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewCard } from "../ReviewCard";

const baseReview = {
  id: "review-1",
  rating: 4,
  body: "총평입니다",
  finishedAt: new Date("2026-08-01"),
  channel: null,
  shortReview: null,
  originStory: null,
  tags: [],
  visibility: "PUBLIC" as const,
};

describe("ReviewCard 발췌 미리보기", () => {
  it("발췌가 2개 이하면 전부 보여주고 더보기 링크가 없다", () => {
    render(
      <ReviewCard
        review={{
          ...baseReview,
          excerpts: [
            { id: "e1", quote: "첫 문장", pageLabel: null, comment: null },
            { id: "e2", quote: "둘째 문장", pageLabel: null, comment: null },
          ],
        }}
        context="book-detail"
      />,
    );

    expect(screen.getByText("첫 문장")).toBeInTheDocument();
    expect(screen.getByText("둘째 문장")).toBeInTheDocument();
    expect(screen.queryByText(/더/)).not.toBeInTheDocument();
  });

  it("발췌가 3개 이상이면 2개만 보여주고 더보기 링크를 표시한다", () => {
    render(
      <ReviewCard
        review={{
          ...baseReview,
          excerpts: [
            { id: "e1", quote: "첫 문장", pageLabel: null, comment: null },
            { id: "e2", quote: "둘째 문장", pageLabel: null, comment: null },
            { id: "e3", quote: "셋째 문장", pageLabel: null, comment: null },
          ],
        }}
        context="book-detail"
      />,
    );

    expect(screen.getByText("첫 문장")).toBeInTheDocument();
    expect(screen.getByText("둘째 문장")).toBeInTheDocument();
    expect(screen.queryByText("셋째 문장")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "발췌 1개 더보기" })).toHaveAttribute(
      "href",
      "/share/review-1",
    );
  });

  it("비공개 리뷰는 발췌가 3개 이상이어도 더보기 링크를 렌더링하지 않는다", () => {
    render(
      <ReviewCard
        review={{
          ...baseReview,
          visibility: "PRIVATE",
          excerpts: [
            { id: "e1", quote: "첫 문장", pageLabel: null, comment: null },
            { id: "e2", quote: "둘째 문장", pageLabel: null, comment: null },
            { id: "e3", quote: "셋째 문장", pageLabel: null, comment: null },
          ],
        }}
        context="book-detail"
      />,
    );

    expect(screen.getByText("첫 문장")).toBeInTheDocument();
    expect(screen.getByText("둘째 문장")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /더보기/ })).not.toBeInTheDocument();
  });
});
