import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lexicon — 책 통합검색 & 리뷰",
  description: "도서관 소장, 서점 정가, 중고 시세를 한 화면에서 비교하고 리뷰를 모아보는 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${hankenGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background font-body-md text-on-background">
        {children}
      </body>
    </html>
  );
}
