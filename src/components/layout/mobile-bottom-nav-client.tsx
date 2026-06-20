"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/components/cart/cart-provider";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
};

export function MobileBottomNavClient({
  isAuthenticated,
  isAdmin,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const { itemCount, isHydrated } = useCart();
  const items: NavItem[] = [
    { href: "/", label: "홈", icon: "⌂" },
    {
      href: "/cart",
      label: "장바구니",
      icon: "🛒",
      badge: isHydrated ? itemCount : 0,
    },
    isAuthenticated
      ? { href: "/orders", label: "주문내역", icon: "▤" }
      : { href: "/login", label: "로그인", icon: "♙" },
  ];

  if (isAdmin) {
    items.push({ href: "/admin/orders", label: "관리", icon: "⚙" });
  }

  return (
    <nav
      aria-label="모바일 주요 메뉴"
      className="fixed inset-x-3 bottom-3 z-40 grid rounded-[1.5rem] bg-[var(--ink)] p-1.5 text-white shadow-[0_18px_55px_rgba(0,0,0,0.28)] sm:hidden"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.1rem] px-1 text-[10px] font-bold transition ${
              isActive
                ? "bg-white text-[var(--ink)]"
                : "text-white/65 hover:text-white"
            }`}
            href={item.href}
            key={item.href}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {item.icon}
            </span>
            <span>{item.label}</span>
            {item.badge ? (
              <span className="absolute right-[22%] top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 py-0.5 text-[9px] font-black text-white">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
