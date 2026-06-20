import Link from "next/link";

import type { RestaurantListItem } from "@/data/restaurants";
import { formatWon } from "@/lib/currency";
import {
  formatDeliveryFee,
  formatDeliveryTime,
  formatRating,
  formatReviewCount,
  getRestaurantVisual,
} from "@/lib/restaurant-presenter";

export function RestaurantCard({
  restaurant,
}: {
  restaurant: RestaurantListItem;
}) {
  const visual = getRestaurantVisual(restaurant.category);

  return (
    <Link
      className="group block overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_50px_rgba(33,31,28,0.07)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(33,31,28,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
      href={`/restaurants/${restaurant.slug}`}
    >
      <article>
        <div
          className="relative flex h-44 items-center justify-center overflow-hidden"
          style={{ background: visual.background }}
        >
          <div className="absolute -right-10 -top-14 h-36 w-36 rounded-full bg-white/15" />
          <div className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-black/5" />
          <span
            aria-hidden="true"
            className="relative text-7xl drop-shadow-[0_12px_18px_rgba(0,0,0,0.15)] transition duration-300 group-hover:scale-110"
          >
            {visual.emoji}
          </span>
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold shadow-sm backdrop-blur">
            {restaurant.category}
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black tracking-[-0.035em]">
                {restaurant.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-black/50">
                {restaurant.description}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-700">
              ★ {formatRating(restaurant.ratingTenths)}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-black/8 pt-4 text-xs font-semibold text-black/50">
            <span>
              {formatDeliveryTime(
                restaurant.deliveryTimeMin,
                restaurant.deliveryTimeMax,
              )}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatDeliveryFee(restaurant.deliveryFee)}</span>
            <span aria-hidden="true">·</span>
            <span>
              최소 주문 {formatWon(restaurant.minimumOrderAmount)}
            </span>
            <span aria-hidden="true">·</span>
            <span>리뷰 {formatReviewCount(restaurant.reviewCount)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
