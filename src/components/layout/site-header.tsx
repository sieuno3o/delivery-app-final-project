import Link from "next/link";

import { AuthNav } from "@/components/auth/auth-nav";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-black/10 py-5">
      <Link className="text-xl font-black tracking-[-0.04em]" href="/">
        동네한입
      </Link>
      <AuthNav />
    </header>
  );
}
