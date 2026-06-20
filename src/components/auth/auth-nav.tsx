import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth/session";

export async function AuthNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <nav className="flex items-center gap-2" aria-label="회원 메뉴">
        <Link
          className="rounded-full px-3 py-2 text-sm font-bold text-black/60 transition hover:bg-white"
          href="/login"
        >
          로그인
        </Link>
        <Link
          className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-bold text-white transition hover:bg-black"
          href="/signup"
        >
          회원가입
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2" aria-label="회원 메뉴">
      <span className="hidden text-sm font-bold text-black/55 sm:inline">
        {user.name}님
      </span>
      <Link
        className="rounded-full px-3 py-2 text-sm font-bold transition hover:bg-white"
        href="/orders"
      >
        주문내역
      </Link>
      <form action={logoutAction}>
        <button
          className="rounded-full bg-white px-3 py-2 text-sm font-bold text-black/60 shadow-sm ring-1 ring-black/5 transition hover:text-black"
          type="submit"
        >
          로그아웃
        </button>
      </form>
    </nav>
  );
}
