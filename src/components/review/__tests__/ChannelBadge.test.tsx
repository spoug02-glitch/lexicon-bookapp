// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChannelBadge } from "../ChannelBadge";

describe("ChannelBadge", () => {
  it("channel이 null이면 아무것도 렌더링하지 않는다", () => {
    const { container } = render(<ChannelBadge channel={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("channel에 맞는 라벨을 렌더링한다", () => {
    render(<ChannelBadge channel="AUDIOBOOK" />);
    expect(screen.getByText("오디오북")).toBeInTheDocument();
  });
});
