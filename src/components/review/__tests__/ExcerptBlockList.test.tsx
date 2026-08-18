// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExcerptBlockList } from "../ExcerptBlockList";

describe("ExcerptBlockList", () => {
  it("발췌가 없으면 접힌 추가 버튼만 보인다", () => {
    render(<ExcerptBlockList value={[]} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /발췌 추가/ })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/인용/)).not.toBeInTheDocument();
  });

  it("추가 버튼을 누르면 빈 블록이 하나 생긴다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ExcerptBlockList value={[]} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /발췌 추가/ }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0];
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ quote: "", pageLabel: null, comment: null });
  });

  it("블록의 삭제 버튼을 누르면 해당 블록이 제거된다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const value = [
      { id: "a", quote: "문장A", pageLabel: null, comment: null },
      { id: "b", quote: "문장B", pageLabel: null, comment: null },
    ];
    render(<ExcerptBlockList value={value} onChange={onChange} />);

    await user.click(screen.getAllByRole("button", { name: "발췌 삭제" })[0]);

    expect(onChange).toHaveBeenCalledWith([value[1]]);
  });

  it("아래로 이동 버튼을 누르면 순서가 바뀐다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const value = [
      { id: "a", quote: "문장A", pageLabel: null, comment: null },
      { id: "b", quote: "문장B", pageLabel: null, comment: null },
    ];
    render(<ExcerptBlockList value={value} onChange={onChange} />);

    await user.click(screen.getAllByRole("button", { name: "아래로 이동" })[0]);

    expect(onChange).toHaveBeenCalledWith([value[1], value[0]]);
  });

  it("코멘트 추가 버튼을 누르면 코멘트 입력창이 나타난다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const value = [{ id: "a", quote: "문장A", pageLabel: null, comment: null }];
    render(<ExcerptBlockList value={value} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "한줄코멘트 추가" }));

    expect(onChange).toHaveBeenCalledWith([{ ...value[0], comment: "" }]);
  });

  it("빈 줄로 구분된 여러 문단을 붙여넣으면 블록이 여러 개로 분리된다", () => {
    const onChange = vi.fn();
    const value = [{ id: "a", quote: "", pageLabel: null, comment: null }];
    render(<ExcerptBlockList value={value} onChange={onChange} />);

    const textarea = screen.getByPlaceholderText("인용할 문장을 입력하세요");
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => "첫 문단입니다.\n\n두번째 문단입니다." },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0];
    expect(next).toHaveLength(2);
    expect(next[0].quote).toBe("첫 문단입니다.");
    expect(next[1].quote).toBe("두번째 문단입니다.");
  });
});
