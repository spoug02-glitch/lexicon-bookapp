// 책결 "p." 심볼의 벡터 경로. LogoMark(실제 DOM/SVG), render.tsx의 PageLogo(satori),
// generate-app-icons.tsx(앱 아이콘)가 같은 모양을 그려야 하므로 여기 한 곳에서만 관리한다.
//
// 굵기 기준: 확정 레퍼런스(docs/brand/logo-wordmark-reference.png)는 얇은 선 드로잉이 아니라
// 두꺼운 필로 채워진 형태다 — 이전 버전이 "스켈레톤 같다"는 피드백을 받은 건 기둥(spine)이
// 뷰박스 대비 너무 얇았기 때문. 기둥 폭을 2.5배로 늘리고, 책의 결(가로선)도 얇은 1px급 선이
// 아니라 눈에 띄는 두께의 스트로크로 그린다.
export const LOGO_SPINE_PATH =
  "M17 6C19.76 6 22 8.24 22 11V37C22 39.76 19.76 42 17 42C14.24 42 12 39.76 12 37V11C12 8.24 14.24 6 17 6Z";

export const LOGO_FOLDED_PAGE_PATH =
  "M22 6C31 6 38 12.6 38 21C38 26.6 34.7 31.4 29.8 33.7C28.5 34.3 27 33.3 27 31.9V24.3C27 23.3 27.5 22.4 28.4 21.9C31.1 20.5 32.9 17.9 32.9 15C32.9 11 29.4 7.8 25.1 7.8H22V6Z";

export const LOGO_DOT = { cx: 17, cy: 39.5, r: 3 };

// 책의 결(가로선) — LogoMark 전용, 두꺼운 스트로크로 그린다(caller가 strokeWidth 4 지정).
export const LOGO_GRAIN_LINES = [
  "M22 25C26 24.3 30 24.3 32 25",
  "M22 29C25.5 28.5 28.5 28.5 30.5 29",
  "M22 33C24.8 32.6 27 32.6 28.6 33",
];
