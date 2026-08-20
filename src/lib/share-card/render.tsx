import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { LOGO_DOT, LOGO_FOLDED_PAGE_PATH, LOGO_SPINE_PATH } from "@/components/brand/logo-paths";
import { CARD_QUOTE_MAX_LENGTH, quoteFontScaleFor, truncateQuoteForCard } from "./text";
import type { ShareCardRatio, ShareCardTheme } from "./theme";

export interface ExcerptCardData {
  bookTitle: string;
  author: string | null;
  pageLabel: string | null;
  quote: string;
}

// `fetch(new URL(..., import.meta.url))`가 Next.js 공식 문서의 권장 방식이지만, 이 환경의
// Node fetch(undici)는 file:// 스킴을 지원하지 않아 `next start`에서도 그대로 500이 난다
// (실제로 재현·확인함). fs.readFileSync를 문자열 리터럴 경로로 직접 호출하고,
// next.config.ts의 outputFileTracingIncludes로 프로덕션 번들 누락을 별도 방지한다.
let semiBoldFont: ArrayBuffer | null = null;
let boldFont: ArrayBuffer | null = null;

function readFontFile(fileName: string): ArrayBuffer {
  const buf = fs.readFileSync(path.join(process.cwd(), "src/fonts", fileName));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

function loadSemiBoldFont(): ArrayBuffer {
  if (!semiBoldFont) semiBoldFont = readFontFile("Pretendard-SemiBold.otf");
  return semiBoldFont;
}

function loadBoldFont(): ArrayBuffer {
  if (!boldFont) boldFont = readFontFile("Pretendard-Bold.otf");
  return boldFont;
}

// 카드 메타 정보 줄(책 제목 · 저자)에 들어가는 "p." 로고 — 페이지 표기 자체를 대신하므로
// 강조되지 않게 작게, 상징색(accent) 단색으로만 그린다. 페이지/위치 정보가 없으면 아예 렌더하지 않는다.
// (책의 결 가로선은 이 크기에서는 뭉개져 보여 생략 — LogoMark의 풀사이즈 마크와만 공유)
function PageLogo({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: "flex" }}>
      <path d={LOGO_SPINE_PATH} fill={color} />
      <path d={LOGO_FOLDED_PAGE_PATH} fill={color} />
      <circle cx={LOGO_DOT.cx} cy={LOGO_DOT.cy} r={LOGO_DOT.r} fill={color} />
    </svg>
  );
}

export function buildExcerptCardElement(
  data: ExcerptCardData,
  theme: ShareCardTheme,
  ratio: ShareCardRatio,
) {
  const quote = truncateQuoteForCard(data.quote, CARD_QUOTE_MAX_LENGTH);
  const padding = Math.round(ratio.width * 0.08);
  const metaFontSize = Math.round(ratio.width * 0.026);
  const quoteFontSize = Math.round(ratio.width * quoteFontScaleFor(quote.length));
  const watermarkFontSize = Math.round(ratio.width * 0.028);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: ratio.width,
        height: ratio.height,
        padding,
        backgroundColor: theme.background,
        fontFamily: "Pretendard",
      }}
    >
      {/* 상단 메타 정보: 책 제목 · 저자 ............. [p 로고]페이지 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            color: theme.mutedTextColor,
            fontSize: metaFontSize,
            fontWeight: 600,
            maxWidth: "75%",
          }}
        >
          {data.bookTitle}
          {data.author ? ` · ${data.author}` : ""}
        </div>
        {data.pageLabel && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <PageLogo color={theme.accentColor} size={Math.round(metaFontSize * 0.9)} />
            <span style={{ display: "flex", color: theme.accentColor, fontSize: metaFontSize, fontWeight: 600 }}>
              {data.pageLabel}
            </span>
          </div>
        )}
      </div>

      {/* 본문: 발췌 문장이 카드의 주인공 */}
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>
        <span
          style={{
            display: "flex",
            color: theme.accentColor,
            opacity: 0.35,
            fontSize: quoteFontSize * 1.4,
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: Math.round(quoteFontSize * 0.2),
          }}
        >
          &ldquo;
        </span>
        <div
          style={{
            display: "flex",
            color: theme.textColor,
            fontSize: quoteFontSize,
            fontWeight: 600,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
          }}
        >
          {quote}
        </div>
      </div>

      {/* 책결 워터마크 — 아주 작고 낮은 대비, 가독성을 방해하지 않는 선에서만 */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span
          style={{
            display: "flex",
            color: theme.watermarkColor,
            fontSize: watermarkFontSize,
            fontWeight: 700,
          }}
        >
          책결
        </span>
      </div>
    </div>
  );
}

export async function renderExcerptCardPng(
  data: ExcerptCardData,
  theme: ShareCardTheme,
  ratio: ShareCardRatio,
): Promise<ImageResponse> {
  return new ImageResponse(buildExcerptCardElement(data, theme, ratio), {
    width: ratio.width,
    height: ratio.height,
    fonts: [
      { name: "Pretendard", data: loadSemiBoldFont(), weight: 600, style: "normal" },
      { name: "Pretendard", data: loadBoldFont(), weight: 700, style: "normal" },
    ],
  });
}
