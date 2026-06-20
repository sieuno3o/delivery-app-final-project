import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[var(--surface)] px-5 py-8 text-[var(--ink)] sm:px-8 sm:py-12" id="main-content">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <header>
          <Link className="text-xl font-black tracking-[-0.04em]" href="/">
            동네한입
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-12">
          <section className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-[0_24px_80px_rgba(33,31,28,0.09)] ring-1 ring-black/5 sm:p-9">
            <p className="text-xs font-bold tracking-[0.12em] text-[var(--accent)]">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.05em]">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-black/55">
              {description}
            </p>

            <div className="mt-8">{children}</div>

            <div className="mt-7 border-t border-black/10 pt-6 text-center text-sm text-black/55">
              {footer}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
