import { SiteHeader } from "@/components/layout/site-header";
import { CartView } from "@/components/cart/cart-view";

export const metadata = {
  title: "장바구니",
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--ink)]" id="main-content">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <SiteHeader />
        <section className="py-12 sm:py-16">
          <p className="text-xs font-bold tracking-[0.12em] text-[var(--accent)]">
            YOUR CART
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">
            장바구니
          </h1>
          <div className="mt-9">
            <CartView />
          </div>
        </section>
      </div>
    </main>
  );
}
