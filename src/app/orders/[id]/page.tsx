import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { ClearCartAfterOrder } from "@/components/orders/clear-cart-after-order";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { getOrderByIdForUser } from "@/data/orders";
import { requireUser } from "@/lib/auth/session";
import { formatWon } from "@/lib/currency";
import { orderStatusLabels } from "@/lib/order-presenter";

type OrderPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
};

export const metadata: Metadata = {
  title: "주문 상세",
};

export default async function OrderPage({
  params,
  searchParams,
}: OrderPageProps) {
  const [{ id }, query, user] = await Promise.all([
    params,
    searchParams,
    requireUser("/orders"),
  ]);
  const order = await getOrderByIdForUser(id, user.id);

  if (!order) {
    notFound();
  }

  const justPlaced = query.placed === "1";
  const createdAt = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(order.createdAt);

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--ink)]" id="main-content">
      {justPlaced ? <ClearCartAfterOrder orderId={order.id} /> : null}
      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16">
        <SiteHeader />
        <section className="py-10 sm:py-14">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-black/50 transition hover:text-black"
            href="/orders"
          >
            <span aria-hidden="true">←</span>
            주문내역
          </Link>

          {justPlaced ? (
            <div className="mt-8 rounded-[2rem] bg-[var(--ink)] p-7 text-white shadow-xl sm:p-9">
              <p className="text-xs font-bold tracking-[0.12em] text-orange-300">
                ORDER COMPLETE
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
                주문이 접수됐어요!
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/65">
                주문 정보가 DB에 안전하게 저장되었습니다. 식당에서 주문을
                확인하면 조리를 시작해요.
              </p>
            </div>
          ) : (
            <div className="mt-9">
              <p className="text-xs font-bold tracking-[0.12em] text-[var(--accent)]">
                ORDER DETAIL
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">
                주문 상세
              </h1>
            </div>
          )}

          <div className="mt-7">
            <OrderStatusTimeline
              currentStatus={order.status}
              history={order.statusHistory}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(33,31,28,0.06)] ring-1 ring-black/5 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/8 pb-6">
                <div>
                  <p className="text-xs font-bold text-black/40">주문번호</p>
                  <p className="mt-1 font-black">{order.orderNumber}</p>
                  <p className="mt-2 text-xs text-black/40">{createdAt}</p>
                </div>
                <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-black text-[var(--accent)]">
                  {orderStatusLabels[order.status]}
                </span>
              </div>

              <div className="py-6">
                <p className="text-xs font-bold text-black/40">주문 식당</p>
                <Link
                  className="mt-1 inline-flex text-xl font-black tracking-[-0.03em] hover:text-[var(--accent)]"
                  href={`/restaurants/${order.restaurantSlug}`}
                >
                  {order.restaurantName}
                </Link>
              </div>

              <ul className="divide-y divide-black/8 border-y border-black/8">
                {order.items.map((item) => (
                  <li
                    className="flex items-start justify-between gap-5 py-5"
                    key={item.id}
                  >
                    <div>
                      <p className="font-black">{item.menuName}</p>
                      <p className="mt-1 text-sm text-black/45">
                        {formatWon(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-black">
                      {formatWon(item.unitPrice * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="pt-6">
                <p className="text-xs font-bold text-black/40">배달 정보</p>
                <p className="mt-2 font-bold">
                  {order.deliveryAddress}
                  {order.deliveryAddressDetail
                    ? `, ${order.deliveryAddressDetail}`
                    : ""}
                </p>
                <p className="mt-2 text-sm text-black/50">
                  요청사항: {order.deliveryRequest || "없음"}
                </p>
              </div>
            </section>

            <aside className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(33,31,28,0.06)] ring-1 ring-black/5 lg:sticky lg:top-6">
              <h2 className="text-lg font-black tracking-[-0.03em]">
                결제 금액
              </h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-black/55">
                  <dt>상품 금액</dt>
                  <dd className="font-bold text-black">
                    {formatWon(order.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between text-black/55">
                  <dt>배달비</dt>
                  <dd className="font-bold text-black">
                    {order.deliveryFee === 0
                      ? "무료"
                      : formatWon(order.deliveryFee)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-black/10 pt-4 text-base">
                  <dt className="font-black">총 결제금액</dt>
                  <dd className="text-lg font-black text-[var(--accent)]">
                    {formatWon(order.totalAmount)}
                  </dd>
                </div>
              </dl>
              <p className="mt-6 rounded-2xl bg-[var(--surface)] px-4 py-3 text-xs leading-5 text-black/50">
                메뉴명과 가격은 주문 당시 기준으로 저장되어 이후 메뉴가
                바뀌어도 그대로 유지됩니다.
              </p>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
