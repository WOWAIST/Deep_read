import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechDoc Coach",
  description: "영어 기술 문서를 번역 없이 스스로 읽고 이해하는 훈련 도구",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
