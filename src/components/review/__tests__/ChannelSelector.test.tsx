// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChannelSelector } from "../ChannelSelector";

describe("ChannelSelector", () => {
  it("칩을 클릭하면 해당 채널로 선택된다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChannelSelector value={null} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "종이책" }));

    expect(onChange).toHaveBeenCalledWith("PAPER");
  });

  it("이미 선택된 칩을 다시 누르면 선택이 해제된다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ChannelSelector value="EBOOK" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "전자책" }));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
