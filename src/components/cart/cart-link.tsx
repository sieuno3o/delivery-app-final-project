"use client";

import Link from "next/link";

import { useCart } from "./cart-provider";

export function CartLink() {
  const { itemCount, isHydrated } = useCart();

  return (
    <Link
      aria-label={`장바구니 ${isHydrated ? itemCount : 0}개`}
      className="relative inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-black/65 shadow-sm ring-1 ring-black/5 transition hover:text-black"
      href="/cart"
    >
      <span aria-hidden="true">🛒</span>
      <span className="hidden sm:inline">장바구니</span>
      {isHydrated && itemCount > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-black text-white">
          {itemCount}
        </span>
      ) : null}
    </Link>
  );
}
