import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth/session";

export const metadata = {
  title: "주문내역",
};

export default async function OrdersPage() {
  const user = await requireUser("/orders");

  return (
    <main className="min-h-screen bg-[var(--surface)] px-6 py-8 text-[var(--ink)] sm:px-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between border-b border-black/10 pb-5">
          <Link className="text-xl font-black tracking-[-0.04em]" href="/">
            동네한입
          </Link>
          <form action={logoutAction}>
            <button
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black/60 shadow-sm ring-1 ring-black/5"
              type="submit"
            >
              로그아웃
            </button>
          </form>
        </header>

        <section className="py-16">
          <p className="text-sm font-bold text-[var(--accent)]">MY ORDERS</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">
            {user.name}님의 주문내역
          </h1>
          <div className="mt-10 rounded-[2rem] bg-white px-6 py-14 text-center shadow-[0_20px_60px_rgba(33,31,28,0.06)] ring-1 ring-black/5 sm:px-10">
            <p className="text-lg font-extrabold">아직 주문이 없어요</p>
            <p className="mt-2 text-sm text-black/50">
              다음 단계에서 식당과 메뉴를 연결하면 주문 기록이 여기에 표시됩니다.
            </p>
            <Link
              className="mt-6 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white"
              href="/"
            >
              식당 둘러보기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
