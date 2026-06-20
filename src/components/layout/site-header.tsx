import Link from "next/link";

import { AuthNav } from "@/components/auth/auth-nav";
import { CartLink } from "@/components/cart/cart-link";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-black/10 py-5">
      <Link className="text-xl font-black tracking-[-0.04em]" href="/">
        동네한입
      </Link>
      <div className="hidden items-center gap-2 sm:flex">
        <CartLink />
        <AuthNav />
      </div>
    </header>
  );
}
