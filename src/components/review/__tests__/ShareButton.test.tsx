// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShareButton } from "../ShareButton";

describe("ShareButton", () => {
  it("클릭하면 공유 링크를 클립보드에 복사한다", async () => {
    // userEvent.setup()이 navigator.clipboard에 자체 스텁을 설치하므로
    // (@testing-library/user-event 14.6, beforeEach에서 미리 교체해둔 값을 덮어씀),
    // setup() 이후 해당 스텁의 writeText를 스파이한다.
    const user = userEvent.setup();
    const writeTextSpy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<ShareButton reviewId="review-1" />);

    await user.click(screen.getByRole("button", { name: "공유" }));

    expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining("/share/review-1"));
    expect(await screen.findByText("링크가 복사되었습니다.")).toBeInTheDocument();
  });
});
