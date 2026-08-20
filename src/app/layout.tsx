import type { Metadata } from "next";
import localFont from "next/font/local";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background font-body-md text-on-background">
        {children}
      </body>
    </html>
  );
}
