import { describe, expect, it } from "vitest";
import { buildExcerptShareText, quoteFontScaleFor, truncateQuoteForCard } from "../text";

describe("buildExcerptShareText", () => {
  it("책 제목·저자·페이지를 전부 포함한다", () => {
    const text = buildExcerptShareText({
      quote: "인생은 가까이서 보면 비극이지만, 멀리서 보면 희극이다.",
      bookTitle: "데미안",
      author: "헤르만 헤세",
      pageLabel: "p.23",
    });
    expect(text).toBe(
      '"인생은 가까이서 보면 비극이지만, 멀리서 보면 희극이다."\n(데미안, 헤르만 헤세, p.23) —책결',
    );
  });

  it("저자/페이지가 없으면 해당 부분을 생략한다", () => {
    const text = buildExcerptShareText({
      quote: "문장",
      bookTitle: "책 제목",
      author: null,
      pageLabel: null,
    });
    expect(text).toBe('"문장"\n(책 제목) —책결');
  });
});

describe("truncateQuoteForCard", () => {
  it("상한보다 짧으면 그대로 반환한다", () => {
    expect(truncateQuoteForCard("짧은 문장", 220)).toBe("짧은 문장");
  });

  it("상한을 넘으면 단어 경계에서 자르고 말줄임표를 붙인다", () => {
    const long = "가나다 ".repeat(100).trim(); // 400자 안팎
    const result = truncateQuoteForCard(long, 220);
    expect(result.length).toBeLessThanOrEqual(221); // …(1자) 포함
    expect(result.endsWith("…")).toBe(true);
    expect(result.startsWith("가나다")).toBe(true);
  });

  it("Excerpt 최대 길이(1000자)에서도 카드용 상한을 넘지 않는다", () => {
    const maxExcerpt = "다".repeat(1000);
    const result = truncateQuoteForCard(maxExcerpt);
    expect(result.length).toBeLessThanOrEqual(221);
  });
});

describe("quoteFontScaleFor", () => {
  it("문장이 길수록 더 작은 스케일을 반환한다(단조 감소)", () => {
    const scales = [10, 50, 100, 200].map(quoteFontScaleFor);
    for (let i = 1; i < scales.length; i++) {
      expect(scales[i]).toBeLessThanOrEqual(scales[i - 1]);
    }
  });
});
