import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { getOrdersForUser } from "@/data/orders";
import { requireUser } from "@/lib/auth/session";
import { formatWon } from "@/lib/currency";
import {
  orderStatusLabels,
  summarizeOrderItems,
} from "@/lib/order-presenter";

export const metadata = {
  title: "주문내역",
};

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const orders = await getOrdersForUser(user.id);

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16">
        <SiteHeader />

        <section className="py-12 sm:py-16">
          <p className="text-sm font-bold text-[var(--accent)]">MY ORDERS</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">
            {user.name}님의 주문내역
          </h1>

          {orders.length === 0 ? (
            <div className="mt-10 rounded-[2rem] bg-white px-6 py-14 text-center shadow-[0_20px_60px_rgba(33,31,28,0.06)] ring-1 ring-black/5 sm:px-10">
              <p className="text-lg font-extrabold">아직 주문이 없어요</p>
              <p className="mt-2 text-sm text-black/50">
                첫 주문을 완료하면 이곳에서 다시 확인할 수 있어요.
              </p>
              <Link
                className="mt-6 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white"
                href="/"
              >
                식당 둘러보기
              </Link>
            </div>
          ) : (
            <ul className="mt-10 space-y-4">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    className="group block rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(33,31,28,0.05)] ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(33,31,28,0.09)] sm:p-7"
                    href={`/orders/${order.id}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-black/40">
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
                      <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-[var(--accent)]">
                        {orderStatusLabels[order.status]}
                      </span>
                    </div>
                    <div className="mt-6 flex items-end justify-between border-t border-black/8 pt-5">
                      <div>
                        <p className="text-xs text-black/35">
                          {order.orderNumber}
                        </p>
                        <p className="mt-1 text-lg font-black">
                          {formatWon(order.totalAmount)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-black/40 group-hover:text-black">
                        상세 보기 →
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
