"use client";

import { useCart } from "@/components/cart/cart-provider";
import type { RestaurantDetail } from "@/data/restaurants";
import { formatWon } from "@/lib/currency";

type MenuItem = RestaurantDetail["menuItems"][number];
type RestaurantForCart = Pick<
  RestaurantDetail,
  "id" | "name" | "slug" | "deliveryFee" | "minimumOrderAmount"
>;

export function MenuCard({
  menuItem,
  restaurant,
}: {
  menuItem: MenuItem;
  restaurant: RestaurantForCart;
}) {
  const { getMenuQuantity, requestAddItem } = useCart();
  const quantity = getMenuQuantity(menuItem.id);

  return (
    <article
      className={`relative rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(33,31,28,0.055)] ring-1 ring-black/5 ${
        menuItem.isSoldOut ? "opacity-55" : ""
      }`}
    >
      <div className="flex min-h-36 flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black tracking-[-0.03em]">
              {menuItem.name}
            </h3>
            {menuItem.isPopular ? (
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-extrabold text-[var(--accent)]">
                인기
              </span>
            ) : null}
            {menuItem.isSoldOut ? (
              <span className="rounded-full bg-black/8 px-2.5 py-1 text-[11px] font-extrabold text-black/55">
                품절
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-black/50">
            {menuItem.description}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-base font-black">{formatWon(menuItem.price)}</p>
            {quantity > 0 ? (
              <p className="mt-1 text-xs font-bold text-[var(--accent)]">
                장바구니에 {quantity}개
              </p>
            ) : null}
          </div>
          <button
            aria-label={`${menuItem.name} 담기`}
            className="shrink-0 rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-black/40"
            disabled={menuItem.isSoldOut}
            onClick={() =>
              requestAddItem(
                {
                  id: restaurant.id,
                  name: restaurant.name,
                  slug: restaurant.slug,
                  deliveryFee: restaurant.deliveryFee,
                  minimumOrderAmount: restaurant.minimumOrderAmount,
                },
                {
                  menuItemId: menuItem.id,
                  name: menuItem.name,
                  price: menuItem.price,
                },
              )
            }
            type="button"
          >
            {menuItem.isSoldOut ? "품절" : "담기"}
          </button>
        </div>
      </div>
    </article>
  );
}
