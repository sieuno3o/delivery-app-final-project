import type { RestaurantDetail } from "@/data/restaurants";
import { formatWon } from "@/lib/currency";

type MenuItem = RestaurantDetail["menuItems"][number];

export function MenuCard({ menuItem }: { menuItem: MenuItem }) {
  return (
    <article
      className={`relative rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(33,31,28,0.055)] ring-1 ring-black/5 ${
        menuItem.isSoldOut ? "opacity-55" : ""
      }`}
    >
      <div className="flex min-h-32 flex-col justify-between">
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
        <p className="mt-5 text-base font-black">{formatWon(menuItem.price)}</p>
      </div>
    </article>
  );
}
