import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminStatusForm } from "@/components/admin/admin-status-form";
import { SiteHeader } from "@/components/layout/site-header";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { getOrderByIdForAdmin } from "@/data/admin-orders";
import { requireAdmin } from "@/lib/auth/session";
import { formatWon } from "@/lib/currency";
import { orderStatusLabels } from "@/lib/order-status";

type AdminOrderPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "관리자 주문 상세",
};

export default async function AdminOrderPage({
  params,
}: AdminOrderPageProps) {
  const { id } = await params;
  await requireAdmin("/admin/orders");
  const order = await getOrderByIdForAdmin(id);

  if (!order) {
    notFound();
  }

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
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <SiteHeader />
        <section className="py-10 sm:py-14">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-black/50 transition hover:text-black"
            href="/admin/orders"
          >
            <span aria-hidden="true">←</span>
            주문 관리 목록
          </Link>

          <div className="mt-9 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-[var(--accent)]">
                ADMIN ORDER DETAIL
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">
                {order.restaurantName} 주문
              </h1>
              <p className="mt-3 text-sm text-black/45">
                {order.orderNumber} · {createdAt}
              </p>
            </div>
            <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-black text-[var(--accent)]">
              {orderStatusLabels[order.status]}
            </span>
          </div>

          <div className="mt-8">
            <OrderStatusTimeline
              currentStatus={order.status}
              history={order.statusHistory}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(33,31,28,0.06)] ring-1 ring-black/5 sm:p-8">
              <div className="grid gap-6 border-b border-black/8 pb-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold text-black/35">고객 정보</p>
                  <p className="mt-2 font-black">{order.customerName}</p>
                  <p className="mt-1 text-sm text-black/45">
                    {order.customerEmail}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-black/35">배달 주소</p>
                  <p className="mt-2 font-bold">
                    {order.deliveryAddress}
                    {order.deliveryAddressDetail
                      ? `, ${order.deliveryAddressDetail}`
                      : ""}
                  </p>
                  <p className="mt-1 text-sm text-black/45">
                    요청사항: {order.deliveryRequest || "없음"}
                  </p>
                </div>
              </div>

              <div className="py-6">
                <p className="text-xs font-bold text-black/35">주문 메뉴</p>
                <ul className="mt-3 divide-y divide-black/8 border-y border-black/8">
                  {order.items.map((item) => (
                    <li
                      className="flex items-start justify-between gap-5 py-4"
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
              </div>

              <dl className="space-y-3 border-t border-black/8 pt-6 text-sm">
                <div className="flex justify-between text-black/50">
                  <dt>상품 금액</dt>
                  <dd className="font-bold text-black">
                    {formatWon(order.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between text-black/50">
                  <dt>배달비</dt>
                  <dd className="font-bold text-black">
                    {order.deliveryFee === 0
                      ? "무료"
                      : formatWon(order.deliveryFee)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-black/8 pt-4 text-base">
                  <dt className="font-black">총 결제금액</dt>
                  <dd className="text-lg font-black text-[var(--accent)]">
                    {formatWon(order.totalAmount)}
                  </dd>
                </div>
              </dl>
            </section>

            <aside className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(33,31,28,0.06)] ring-1 ring-black/5 lg:sticky lg:top-6">
              <p className="text-xs font-bold tracking-[0.1em] text-[var(--accent)]">
                STATUS CONTROL
              </p>
              <h2 className="mt-2 text-xl font-black tracking-[-0.035em]">
                주문 상태 변경
              </h2>
              <p className="mt-2 text-xs leading-5 text-black/45">
                허용된 다음 단계만 선택할 수 있으며 모든 변경은 이력에
                기록됩니다.
              </p>
              <AdminStatusForm
                currentStatus={order.status}
                key={order.status}
                orderId={order.id}
              />
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
