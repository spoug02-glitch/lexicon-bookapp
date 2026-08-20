import { describe, expect, it } from "vitest";
import { buildExcerptCardElement } from "../render";
import { getShareCardTheme, getShareCardRatio } from "../theme";

// satori(next/og)로 넘기는 JSX 트리를 그대로 검사한다 — 실제 PNG 렌더는 API 라우트를
// 통해 개발 서버에서 별도로 확인했고, 여기서는 "페이지 정보가 없으면 p 로고를 아예
// 렌더하지 않는다"는, 유일하게 이미지로 미검증이었던 조건 분기를 고정한다.
describe("buildExcerptCardElement", () => {
  const theme = getShareCardTheme("light");
  const ratio = getShareCardRatio("square");

  function metaRowChildren(quote: string, pageLabel: string | null) {
    const element = buildExcerptCardElement(
      { bookTitle: "책 제목", author: "저자", pageLabel, quote },
      theme,
      ratio,
    );
    const metaRow = (element.props.children as unknown[])[0] as {
      props: { children: unknown[] };
    };
    return metaRow.props.children;
  }

  it("pageLabel이 없으면 p 로고/페이지 블록을 렌더하지 않는다", () => {
    const [, pageBlock] = metaRowChildren("문장", null);
    expect(pageBlock).toBeFalsy();
  });

  it("pageLabel이 있으면 p 로고/페이지 블록을 렌더한다", () => {
    const [, pageBlock] = metaRowChildren("문장", "p.42");
    expect(pageBlock).toBeTruthy();
  });
});
