import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { getOrdersForAdmin } from "@/data/admin-orders";
import { requireAdmin } from "@/lib/auth/session";
import { formatWon } from "@/lib/currency";
import {
  orderStatusLabels,
  summarizeOrderItems,
} from "@/lib/order-presenter";

export const metadata: Metadata = {
  title: "관리자 주문 관리",
};

export default async function AdminOrdersPage() {
  const admin = await requireAdmin("/admin/orders");
  const orders = await getOrdersForAdmin();

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <SiteHeader />
        <section className="py-12 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-[var(--accent)]">
                ADMIN CONSOLE
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">
                주문 관리
              </h1>
              <p className="mt-3 text-sm text-black/50">
                {admin.name} 관리자님 · 최신 주문부터 표시합니다.
              </p>
            </div>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-black/50 ring-1 ring-black/5">
              총 {orders.length}건
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="mt-10 rounded-[2rem] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-black/5">
              <span aria-hidden="true" className="text-5xl">
                🧾
              </span>
              <h2 className="mt-5 text-xl font-black">아직 주문이 없어요</h2>
              <p className="mt-2 text-sm text-black/50">
                고객 주문이 접수되면 이곳에서 상태를 관리할 수 있습니다.
              </p>
            </div>
          ) : (
            <ul className="mt-10 grid gap-5 lg:grid-cols-2">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    className="group block h-full rounded-[2rem] bg-white p-6 shadow-[0_18px_55px_rgba(33,31,28,0.05)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(33,31,28,0.09)]"
                    href={`/admin/orders/${order.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-black/35">
                          {new Intl.DateTimeFormat("ko-KR", {
                            timeZone: "Asia/Seoul",
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }).format(order.createdAt)}
                        </p>
                        <h2 className="mt-2 text-xl font-black tracking-[-0.035em] group-hover:text-[var(--accent)]">
                          {order.restaurantName}
                        </h2>
                        <p className="mt-2 text-sm text-black/50">
                          {summarizeOrderItems(order.items)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-orange-50 px-3 py-2 text-xs font-black text-[var(--accent)]">
                        {orderStatusLabels[order.status]}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 border-t border-black/8 pt-5 text-sm">
                      <div>
                        <p className="text-xs font-bold text-black/35">고객</p>
                        <p className="mt-1 truncate font-bold">
                          {order.customerName}
                        </p>
                        <p className="mt-1 truncate text-xs text-black/40">
                          {order.customerEmail}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-black/35">
                          결제 금액
                        </p>
                        <p className="mt-1 text-lg font-black">
                          {formatWon(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-xs text-black/35">
                      <span>{order.orderNumber}</span>
                      <span className="font-bold group-hover:text-black">
                        관리하기 →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
