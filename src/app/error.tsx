"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("화면 렌더링 오류", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-6 text-center text-[var(--ink)]">
      <div className="max-w-md rounded-[2rem] bg-white p-9 shadow-[0_24px_80px_rgba(33,31,28,0.08)] ring-1 ring-black/5">
        <span aria-hidden="true" className="text-5xl">
          🥲
        </span>
        <h1 className="mt-5 text-2xl font-black tracking-[-0.04em]">
          정보를 불러오지 못했어요
        </h1>
        <p className="mt-3 text-sm leading-6 text-black/50">
          데이터베이스 연결을 확인한 뒤 다시 시도해 주세요.
        </p>
        <button
          className="mt-7 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white"
          onClick={reset}
          type="button"
        >
          다시 시도
        </button>
      </div>
    </main>
  );
}
