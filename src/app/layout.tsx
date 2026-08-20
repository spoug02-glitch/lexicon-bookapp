import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { BackButtonHandler } from "@/components/native/BackButtonHandler";
import "./globals.css";

// 셀프 호스팅: Pretendard는 Google Fonts에 없어 next/font/local로 가변 폰트를 직접 번들.
const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

export const metadata: Metadata = {
  title: "책결 — 책 통합검색 & 리뷰",
  description: "도서관 소장, 서점 정가, 중고 시세를 한 화면에서 비교하고 리뷰를 모아보는 서비스",
};

// Android 15+(targetSdk 36)는 앱 선언과 무관하게 엣지투엣지를 강제한다 — WebView가 상태바/
// 제스처바 아래까지 그려지므로, viewport-fit=cover 없이는 CSS의 env(safe-area-inset-*)가
// 항상 0으로 계산되어 헤더/하단 내비게이션(pt-safe/pb-safe, globals.css)이 시스템 바에 가려진다.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background font-body-md text-on-background">
        <BackButtonHandler />
        {children}
      </body>
    </html>
  );
}
