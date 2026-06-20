import type { Metadata } from "next";

import { CartProvider } from "@/components/cart/cart-provider";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

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
      <body className="pb-24 sm:pb-0">
        <a
          className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-full bg-[var(--ink)] px-4 py-3 text-sm font-bold text-white transition focus:translate-y-0"
          href="#main-content"
        >
          본문 바로가기
        </a>
        <CartProvider>
          {children}
          <MobileBottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
