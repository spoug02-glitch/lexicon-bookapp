// 발췌 공유 카드의 스타일 정의. 새 카드팩(유료 텍스처 등)을 추가할 때
// 이 레지스트리에 항목만 더하면 되도록, 렌더러(render.tsx)는 이 타입에만 의존한다.
export interface ShareCardTheme {
  id: string;
  label: string;
  background: string;
  textColor: string;
  mutedTextColor: string;
  accentColor: string;
  watermarkColor: string; // 배경에 맞춰 미리 낮은 불투명도로 계산해둔 rgba
  // 향후 유료 텍스처 카드팩(종이 질감, 옛날 책 페이지 등) 확장 지점 — 현재 무료 스타일은 비워둔다.
  texture?: string;
  premium?: boolean;
}

export const SHARE_CARD_THEMES: ShareCardTheme[] = [
  {
    id: "light",
    label: "라이트",
    background: "#F8F9FF",
    textColor: "#041627",
    mutedTextColor: "#5B6472",
    accentColor: "#6B8F86",
    watermarkColor: "rgba(4, 22, 39, 0.08)",
  },
  {
    id: "navy",
    label: "딥 네이비",
    background: "#041627",
    textColor: "#F8F9FF",
    mutedTextColor: "rgba(248, 249, 255, 0.62)",
    accentColor: "#6B8F86",
    watermarkColor: "rgba(248, 249, 255, 0.12)",
  },
  {
    id: "sage",
    label: "세이지 포인트",
    background: "#EDF2EF",
    textColor: "#041627",
    mutedTextColor: "#4B5F58",
    accentColor: "#6B8F86",
    watermarkColor: "rgba(4, 22, 39, 0.07)",
  },
];

export function getShareCardTheme(id: string | null | undefined): ShareCardTheme {
  return SHARE_CARD_THEMES.find((theme) => theme.id === id) ?? SHARE_CARD_THEMES[0];
}

export interface ShareCardRatio {
  id: string;
  label: string;
  width: number;
  height: number;
}

// 책결 공유 카드 시안에 명시된 권장 사이즈를 그대로 사용.
export const SHARE_CARD_RATIOS: ShareCardRatio[] = [
  { id: "square", label: "정사각형", width: 1080, height: 1080 },
  { id: "portrait", label: "세로형", width: 1080, height: 1350 },
];

export const OG_CARD_RATIO: ShareCardRatio = {
  id: "og",
  label: "링크 미리보기",
  width: 1200,
  height: 630,
};

export function getShareCardRatio(id: string | null | undefined): ShareCardRatio {
  return SHARE_CARD_RATIOS.find((ratio) => ratio.id === id) ?? SHARE_CARD_RATIOS[0];
}
