// 책결 앱 아이콘(Android adaptive icon) 소스 3장을 생성한다: 배경(단색), 전경(로고), 합성본(레거시/플레이스토어용).
// @capacitor/assets가 이 세 파일을 읽어 mipmap 전체 해상도로 리사이즈한다.
//
// 이전 버전은 logo-paths.ts의 벡터 좌표를 satori로 그려 만들었으나, 손으로 재현한 좌표가
// 확정 레퍼런스(docs/brand/logo-wordmark-reference.png)와 계속 어긋난다는 피드백을 받았다.
// 지금은 레퍼런스 이미지에서 직접 크롭한 아이콘 마크(docs/brand/source/icon-mark-crop.png,
// 흰 배경의 둥근 사각형 안에 오프화이트 마크)를 그대로 리사이즈해서 쓴다.
import { writeFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const NAVY = "#041627";
const SIZE = 1024;
const SOURCE = "docs/brand/source/icon-mark-crop.png";
const CONTENT_SIZE = 760; // 세이프존 안에 들어가는 마크 크기(안쪽 여백 = 어댑티브 아이콘 세이프존)
const MASK_RADIUS = 170; // 소스 크롭(147x149 기준)의 둥근 모서리 비율에 맞춘 마스크 반경
const EDGE_INSET = 4; // 소스 크롭 가장자리의 안티에일리어싱 흰 테두리 제거용

async function main() {
  mkdirSync("resources", { recursive: true });

  const meta = await sharp(SOURCE).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  const cropBuf = await sharp(SOURCE)
    .extract({
      left: EDGE_INSET,
      top: EDGE_INSET,
      width: width - EDGE_INSET * 2,
      height: height - EDGE_INSET * 2,
    })
    .resize(CONTENT_SIZE, CONTENT_SIZE, { kernel: "lanczos3" })
    .toBuffer();

  const maskSvg = Buffer.from(
    `<svg width="${CONTENT_SIZE}" height="${CONTENT_SIZE}"><rect x="0" y="0" width="${CONTENT_SIZE}" height="${CONTENT_SIZE}" rx="${MASK_RADIUS}" ry="${MASK_RADIUS}" fill="white"/></svg>`,
  );
  const mask = await sharp(maskSvg).png().toBuffer();

  const masked = await sharp(cropBuf)
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .toBuffer();

  // 전경: 마스킹된 마크를 세이프존만큼 여백을 두고 투명 캔버스 중앙에 배치
  const offset = Math.round((SIZE - CONTENT_SIZE) / 2);
  const foreground = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: masked, left: offset, top: offset }])
    .png()
    .toBuffer();
  writeFileSync("resources/icon-foreground.png", foreground);

  // 배경: 딥네이비 단색
  const background = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: NAVY },
  })
    .png()
    .toBuffer();
  writeFileSync("resources/icon-background.png", background);

  // 합성본: 레거시 런처/플레이스토어 아이콘용(배경+전경 합쳐서 꽉 차게)
  const flat = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: NAVY },
  })
    .composite([{ input: foreground }])
    .png()
    .toBuffer();
  writeFileSync("resources/icon.png", flat);

  console.log("아이콘 3종 생성 완료: resources/icon.png, icon-foreground.png, icon-background.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
