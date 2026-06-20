"use client";

import Link from "next/link";

import { formatWon } from "@/lib/currency";

import { useCart } from "./cart-provider";

export function CartView() {
  const {
    cart,
    isHydrated,
    subtotal,
    total,
    minimumOrderRemaining,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (!isHydrated) {
    return (
      <div
        aria-busy="true"
        className="animate-pulse rounded-[2rem] bg-white p-7 ring-1 ring-black/5"
      >
        <div className="h-7 w-40 rounded bg-black/10" />
        <div className="mt-8 h-28 rounded-3xl bg-black/8" />
        <div className="mt-4 h-28 rounded-3xl bg-black/8" />
      </div>
    );
  }

  if (!cart) {
    return (
      <section className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(33,31,28,0.06)] ring-1 ring-black/5">
        <span aria-hidden="true" className="text-6xl">
          🛒
        </span>
        <h2 className="mt-6 text-2xl font-black tracking-[-0.04em]">
          장바구니가 비어 있어요
        </h2>
        <p className="mt-3 text-sm text-black/50">
          마음에 드는 식당에서 메뉴를 담아보세요.
        </p>
        <Link
          className="mt-7 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white"
          href="/"
        >
          식당 둘러보기
        </Link>
      </section>
    );
  }

  const progress = Math.min(
    (subtotal / Math.max(cart.restaurant.minimumOrderAmount, 1)) * 100,
    100,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(33,31,28,0.06)] ring-1 ring-black/5 sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-black/8 pb-5">
          <div>
            <p className="text-xs font-bold tracking-[0.1em] text-[var(--accent)]">
              ONE RESTAURANT
            </p>
            <Link
              className="mt-2 inline-flex text-xl font-black tracking-[-0.035em] hover:text-[var(--accent)]"
              href={`/restaurants/${cart.restaurant.slug}`}
            >
              {cart.restaurant.name}
            </Link>
          </div>
          <button
            className="rounded-full px-3 py-2 text-xs font-bold text-black/40 transition hover:bg-black/5 hover:text-black"
            onClick={clearCart}
            type="button"
          >
            전체 삭제
          </button>
        </div>

        <ul className="divide-y divide-black/8">
          {cart.items.map((item) => (
            <li className="py-6" key={item.menuItemId}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-black tracking-[-0.025em]">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-black/45">
                    {formatWon(item.price)}
                  </p>
                </div>
                <button
                  aria-label={`${item.name} 삭제`}
                  className="text-xs font-bold text-black/35 underline decoration-black/15 underline-offset-4 hover:text-red-600"
                  onClick={() => removeItem(item.menuItemId)}
                  type="button"
                >
                  삭제
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <div
                  aria-label={`${item.name} 수량 ${item.quantity}개`}
                  className="inline-flex items-center rounded-full bg-[var(--surface)] p-1"
                >
                  <button
                    aria-label={`${item.name} 수량 줄이기`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold transition hover:bg-white"
                    onClick={() =>
                      updateQuantity(item.menuItemId, item.quantity - 1)
                    }
                    type="button"
                  >
                    −
                  </button>
                  <span className="min-w-9 text-center text-sm font-black">
                    {item.quantity}
                  </span>
                  <button
                    aria-label={`${item.name} 수량 늘리기`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold transition hover:bg-white disabled:opacity-30"
                    disabled={item.quantity >= 99}
                    onClick={() =>
                      updateQuantity(item.menuItemId, item.quantity + 1)
                    }
                    type="button"
                  >
                    +
                  </button>
                </div>
                <p className="font-black">
                  {formatWon(item.price * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(33,31,28,0.06)] ring-1 ring-black/5 lg:sticky lg:top-6">
        <h2 className="text-lg font-black tracking-[-0.03em]">결제 예정 금액</h2>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between text-black/55">
            <dt>상품 금액</dt>
            <dd className="font-bold text-black">{formatWon(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between text-black/55">
            <dt>배달비</dt>
            <dd className="font-bold text-black">
              {cart.restaurant.deliveryFee === 0
                ? "무료"
                : formatWon(cart.restaurant.deliveryFee)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-black/10 pt-4 text-base">
            <dt className="font-black">총 결제금액</dt>
            <dd className="text-lg font-black text-[var(--accent)]">
              {formatWon(total)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 rounded-2xl bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span>최소 주문 {formatWon(cart.restaurant.minimumOrderAmount)}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-black/50">
            {minimumOrderRemaining > 0
              ? `${formatWon(minimumOrderRemaining)} 더 담으면 주문할 수 있어요.`
              : "최소 주문 금액을 채웠어요."}
          </p>
        </div>

        {minimumOrderRemaining > 0 ? (
          <button
            className="mt-5 w-full cursor-not-allowed rounded-2xl bg-black/15 px-4 py-3.5 text-sm font-bold text-black/40"
            disabled
            type="button"
          >
            {formatWon(minimumOrderRemaining)} 더 담기
          </button>
        ) : (
          <Link
            className="mt-5 flex w-full justify-center rounded-2xl bg-[var(--ink)] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-black"
            href="/checkout"
          >
            주문하기
          </Link>
        )}
      </aside>
    </div>
  );
}
