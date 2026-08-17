// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VisibilityToggle } from "../VisibilityToggle";

describe("VisibilityToggle", () => {
  it("비공개를 클릭하면 PRIVATE로 전달된다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<VisibilityToggle value="PUBLIC" onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "비공개" }));

    expect(onChange).toHaveBeenCalledWith("PRIVATE");
  });

  it("현재 값에 맞는 칩이 선택 상태로 표시된다", () => {
    render(<VisibilityToggle value="PRIVATE" onChange={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "비공개" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "공개" })).toHaveAttribute("aria-checked", "false");
  });
});
