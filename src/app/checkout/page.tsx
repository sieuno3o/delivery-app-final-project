import { randomUUID } from "node:crypto";

import Link from "next/link";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { SiteHeader } from "@/components/layout/site-header";
import { requireUser } from "@/lib/auth/session";

export const metadata = {
  title: "주문서",
};

export default async function CheckoutPage() {
  await requireUser("/checkout");

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--ink)]" id="main-content">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <SiteHeader />
        <section className="py-10 sm:py-14">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-black/50 transition hover:text-black"
            href="/cart"
          >
            <span aria-hidden="true">←</span>
            장바구니로 돌아가기
          </Link>
          <p className="mt-9 text-xs font-bold tracking-[0.12em] text-[var(--accent)]">
            CHECKOUT
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">
            주문서 작성
          </h1>
          <div className="mt-9">
            <CheckoutForm requestId={randomUUID()} />
          </div>
        </section>
      </div>
    </main>
  );
}
