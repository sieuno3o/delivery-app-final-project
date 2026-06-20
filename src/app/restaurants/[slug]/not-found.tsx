import Link from "next/link";

export default function RestaurantNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-6 text-center text-[var(--ink)]" id="main-content">
      <div className="max-w-md rounded-[2rem] bg-white p-9 shadow-[0_24px_80px_rgba(33,31,28,0.08)] ring-1 ring-black/5">
        <span aria-hidden="true" className="text-5xl">
          🔎
        </span>
        <h1 className="mt-5 text-2xl font-black tracking-[-0.04em]">
          식당을 찾을 수 없어요
        </h1>
        <p className="mt-3 text-sm leading-6 text-black/50">
          주소가 바뀌었거나 현재 운영하지 않는 식당일 수 있어요.
        </p>
        <Link
          className="mt-7 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white"
          href="/"
        >
          식당 목록으로
        </Link>
      </div>
    </main>
  );
}
