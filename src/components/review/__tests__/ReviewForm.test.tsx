// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewForm } from "../ReviewForm";

const book = { isbn13: "9788900000001", title: "테스트북", author: "저자", coverUrl: null };

describe("ReviewForm 발췌 연동", () => {
  it("발췌를 추가하고 제출하면 onSubmit payload에 excerpts가 포함된다", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewForm book={book} presets={[]} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /발췌 추가/ }));
    await user.type(screen.getByPlaceholderText("인용할 문장을 입력하세요"), "인상적인 문장");
    await user.type(
      screen.getByPlaceholderText("책에 대한 생각을 자유롭게 적어주세요..."),
      "총평입니다",
    );
    await user.click(screen.getByRole("button", { name: "저장하기" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.excerpts).toHaveLength(1);
    expect(payload.excerpts[0].quote).toBe("인상적인 문장");
  });

  it("공개 상태에서 발췌가 있으면 공개 안내 문구가 보인다", async () => {
    const user = userEvent.setup();
    render(<ReviewForm book={book} presets={[]} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /발췌 추가/ }));
    await user.type(screen.getByPlaceholderText("인용할 문장을 입력하세요"), "문장");

    expect(screen.getByText("발췌 1개도 함께 공개됩니다.")).toBeInTheDocument();
  });
});
