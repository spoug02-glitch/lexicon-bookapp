// 발췌 "텍스트 복사"용 순수 포맷 함수 — DOM/클립보드에 의존하지 않아 단위테스트 가능.
export interface ExcerptShareTextInput {
  quote: string;
  bookTitle: string;
  author: string | null;
  pageLabel: string | null;
}

export function buildExcerptShareText({
  quote,
  bookTitle,
  author,
  pageLabel,
}: ExcerptShareTextInput): string {
  const sourceParts = [bookTitle, author, pageLabel].filter(
    (part): part is string => !!part && part.trim().length > 0,
  );
  return `"${quote}"\n(${sourceParts.join(", ")}) —책결`;
}

// 카드 이미지에 그대로 넣을 인용문 길이를 제한한다 — Excerpt.quote는 최대 1000자까지 허용되지만
// (src/lib/validation/review.ts) 카드 한 장에 그 분량을 다 넣으면 "책 페이지를 복제"한 것처럼
// 보이고 레이아웃도 깨진다. 워드 경계에서 자르고 말줄임표를 붙인다.
export const CARD_QUOTE_MAX_LENGTH = 220;

export function truncateQuoteForCard(quote: string, maxLength = CARD_QUOTE_MAX_LENGTH): string {
  if (quote.length <= maxLength) return quote;
  const slice = quote.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}

// 인용문 길이에 따라 카드 폰트 크기를 몇 단계로 나눠 긴 문장도 오버플로 없이 들어가게 한다.
export function quoteFontScaleFor(quoteLength: number): number {
  if (quoteLength <= 40) return 0.058;
  if (quoteLength <= 90) return 0.048;
  if (quoteLength <= 150) return 0.04;
  return 0.033;
}
