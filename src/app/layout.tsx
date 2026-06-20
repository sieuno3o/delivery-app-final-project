import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "동네한입",
    template: "%s | 동네한입",
  },
  description: "우리 동네 맛집을 발견하고 간편하게 주문하는 배달 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="ko">
      <body>{children}</body>
    </html>
  );
}
