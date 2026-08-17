// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagSelector } from "../TagSelector";

const presets = ["#소장필요", "밑줄용"];

describe("TagSelector", () => {
  it("프리셋 칩을 클릭하면 선택된다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagSelector value={[]} onChange={onChange} presets={presets} />);

    await user.click(screen.getByRole("button", { name: "#소장필요" }));

    expect(onChange).toHaveBeenCalledWith(["#소장필요"]);
  });

  it("이미 선택된 프리셋을 다시 클릭하면 제거된다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagSelector value={["#소장필요"]} onChange={onChange} presets={presets} />);

    await user.click(screen.getByRole("button", { name: "#소장필요" }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("자유 입력 후 추가 버튼을 누르면 새 태그가 추가된다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagSelector value={[]} onChange={onChange} presets={presets} />);

    await user.type(screen.getByPlaceholderText("새 태그 입력 후 Enter"), "영화나오면");
    await user.click(screen.getByRole("button", { name: "추가" }));

    expect(onChange).toHaveBeenCalledWith(["#영화나오면"]);
  });

  it("10개가 선택되면 추가 입력이 비활성화된다", () => {
    const value = Array.from({ length: 10 }, (_, i) => `#태그${i}`);
    render(<TagSelector value={value} onChange={vi.fn()} presets={presets} />);

    expect(screen.getByPlaceholderText("새 태그 입력 후 Enter")).toBeDisabled();
    expect(screen.getByRole("button", { name: "추가" })).toBeDisabled();
  });

  it("x 버튼을 누르면 선택된 태그가 제거된다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagSelector value={["#소장필요"]} onChange={onChange} presets={presets} />);

    await user.click(screen.getByRole("button", { name: "#소장필요 태그 제거" }));

    expect(onChange).toHaveBeenCalledWith([]);
  });
});
