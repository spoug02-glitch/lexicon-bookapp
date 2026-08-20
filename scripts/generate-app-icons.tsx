// 책결 앱 아이콘(Android adaptive icon) 소스 3장을 생성한다: 배경(단색), 전경(로고), 합성본(레거시/플레이스토어용).
// @capacitor/assets가 이 세 파일을 읽어 mipmap 전체 해상도로 리사이즈한다.
import { writeFileSync, mkdirSync } from "node:fs";
import { ImageResponse } from "next/og";
import {
  LOGO_DOT,
  LOGO_FOLDED_PAGE_PATH,
  LOGO_GRAIN_LINES,
  LOGO_SPINE_PATH,
} from "../src/components/brand/logo-paths";

const NAVY = "#041627";
const SAGE = "#6B8F86";
const OFFWHITE = "#F8F9FF";
const SIZE = 1024;

function Mark({ scale, strokeColor }: { scale: number; strokeColor: string }) {
  // logo-paths.ts의 좌표계는 48x48 뷰박스 기준 — SIZE*scale 픽셀로 확대.
  const px = SIZE * scale;
  return (
    <svg width={px} height={px} viewBox="0 0 48 48" style={{ display: "flex" }}>
      <path d={LOGO_SPINE_PATH} fill={strokeColor} />
      {LOGO_GRAIN_LINES.map((d) => (
        <path key={d} d={d} stroke={strokeColor} strokeWidth={4} strokeLinecap="round" fill="none" />
      ))}
      <path d={LOGO_FOLDED_PAGE_PATH} fill={SAGE} />
      <circle cx={LOGO_DOT.cx} cy={LOGO_DOT.cy} r={LOGO_DOT.r} fill={strokeColor} />
    </svg>
  );
}

async function toPng(el: React.ReactElement): Promise<Buffer> {
  const res = new ImageResponse(el, { width: SIZE, height: SIZE });
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  mkdirSync("resources", { recursive: true });

  // 배경: 딥네이비 단색
  const background = await toPng(
    <div style={{ width: SIZE, height: SIZE, display: "flex", backgroundColor: NAVY }} />,
  );
  writeFileSync("resources/icon-background.png", background);

  // 전경: 어댑티브 아이콘 세이프존(약 66%) 안에 로고, 배경 투명
  const foreground = await toPng(
    <div
      style={{
        width: SIZE,
        height: SIZE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Mark scale={0.9} strokeColor={OFFWHITE} />
    </div>,
  );
  writeFileSync("resources/icon-foreground.png", foreground);

  // 합성본: 레거시 런처/플레이스토어 아이콘용(배경+전경 합쳐서 꽉 차게)
  const flat = await toPng(
    <div
      style={{
        width: SIZE,
        height: SIZE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: NAVY,
      }}
    >
      <Mark scale={0.9} strokeColor={OFFWHITE} />
    </div>,
  );
  writeFileSync("resources/icon.png", flat);

  console.log("아이콘 3종 생성 완료: resources/icon.png, icon-foreground.png, icon-background.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
