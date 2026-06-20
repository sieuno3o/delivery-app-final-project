import Link from "next/link";

import {
  deliveryFeeFilterOptions,
  minimumOrderFilterOptions,
  type RestaurantFilters,
} from "@/lib/restaurant-filters";

const controlClassName =
  "h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-orange-100";

export function RestaurantFilterForm({
  categories,
  filters,
}: {
  categories: string[];
  filters: RestaurantFilters;
}) {
  return (
    <form
      action="/#restaurants"
      className="mb-9 rounded-[2rem] bg-white p-5 shadow-[0_16px_50px_rgba(33,31,28,0.05)] ring-1 ring-black/5 sm:p-6"
      method="get"
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.9fr_0.9fr]">
        <div>
          <label className="text-xs font-bold text-black/45" htmlFor="q">
            식당 이름
          </label>
          <div className="relative mt-2">
            <span
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35"
            >
              ⌕
            </span>
            <input
              className={`${controlClassName} w-full pl-10`}
              defaultValue={filters.query}
              id="q"
              maxLength={50}
              name="q"
              placeholder="예: 성수키친"
              type="search"
            />
          </div>
        </div>

        <div>
          <label
            className="text-xs font-bold text-black/45"
            htmlFor="category"
          >
            음식 종류
          </label>
          <select
            className={`${controlClassName} mt-2 w-full`}
            defaultValue={filters.category ?? ""}
            id="category"
            name="category"
          >
            <option value="">전체</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="text-xs font-bold text-black/45"
            htmlFor="deliveryFee"
          >
            배달비
          </label>
          <select
            className={`${controlClassName} mt-2 w-full`}
            defaultValue={filters.maxDeliveryFee?.toString() ?? ""}
            id="deliveryFee"
            name="deliveryFee"
          >
            <option value="">전체</option>
            {deliveryFeeFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="text-xs font-bold text-black/45"
            htmlFor="minimumOrder"
          >
            최소 주문
          </label>
          <select
            className={`${controlClassName} mt-2 w-full`}
            defaultValue={
              filters.maxMinimumOrderAmount?.toString() ?? ""
            }
            id="minimumOrder"
            name="minimumOrder"
          >
            <option value="">전체</option>
            {minimumOrderFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          className="flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-bold text-black/45 transition hover:bg-black/5 hover:text-black"
          href="/#restaurants"
        >
          필터 초기화
        </Link>
        <button
          className="h-11 rounded-2xl bg-[var(--ink)] px-6 text-sm font-bold text-white transition hover:bg-black"
          type="submit"
        >
          조건 적용
        </button>
      </div>
    </form>
  );
}
