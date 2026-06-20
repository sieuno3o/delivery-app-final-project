import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { RestaurantCard } from "@/components/restaurants/restaurant-card";
import { RestaurantFilterForm } from "@/components/restaurants/restaurant-filters";
import {
  getRestaurantCategories,
  getRestaurants,
} from "@/data/restaurants";
import {
  hasActiveRestaurantFilters,
  parseRestaurantFilters,
} from "@/lib/restaurant-filters";

type HomeProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
};

export default async function Home({ searchParams }: HomeProps) {
  const filters = parseRestaurantFilters(await searchParams);
  const [restaurants, categories] = await Promise.all([
    getRestaurants(filters),
    getRestaurantCategories(),
  ]);
  const hasFilters = hasActiveRestaurantFilters(filters);

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <SiteHeader />

        <section className="relative overflow-hidden py-16 sm:py-24" id="top">
          <div className="absolute right-0 top-14 hidden h-64 w-64 rounded-full bg-orange-200/35 blur-3xl sm:block" />
          <div className="relative">
            <p className="mb-5 text-sm font-bold text-[var(--accent)]">
              DELIVERY, MADE CLEAR
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.08] tracking-[-0.06em] sm:text-7xl">
              오늘은 어떤 한입이
              <br />필요한가요?
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-black/60 sm:text-lg">
              가까운 맛집의 메뉴를 천천히 둘러보세요. 주문할 때 보이는
              가격과 배달 정보는 모두 데이터베이스에서 불러옵니다.
            </p>
            <Link
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white transition hover:bg-black"
              href="#restaurants"
            >
              식당 둘러보기
              <span aria-hidden="true">↓</span>
            </Link>
          </div>
        </section>

        <section className="pb-24" id="restaurants">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-[var(--accent)]">
                NEARBY RESTAURANTS
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
                지금 주문 가능한 맛집
              </h2>
            </div>
            <p className="hidden text-sm font-semibold text-black/45 sm:block">
              검색 결과 {restaurants.length}곳
            </p>
          </div>

          <RestaurantFilterForm
            categories={categories}
            filters={filters}
          />

          {restaurants.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-black/5">
              <span aria-hidden="true" className="text-5xl">
                🍽️
              </span>
              <h3 className="mt-5 text-xl font-black">
                {hasFilters
                  ? "조건에 맞는 식당이 없어요"
                  : "아직 등록된 식당이 없어요"}
              </h3>
              <p className="mt-2 text-sm text-black/50">
                {hasFilters
                  ? "검색어나 금액 조건을 조금 넓혀보세요."
                  : "시드 데이터를 확인한 뒤 다시 시도해 주세요."}
              </p>
              {hasFilters ? (
                <Link
                  className="mt-6 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white"
                  href="/#restaurants"
                >
                  전체 식당 보기
                </Link>
              ) : null}
            </div>
          )}
        </section>

        <footer className="flex flex-col gap-2 border-t border-black/10 py-6 text-xs text-black/45 sm:flex-row sm:items-center sm:justify-between">
          <span>컴퓨터과학개론 · 배달앱 만들기 &amp; 배포</span>
          <span>Next.js · PostgreSQL · Vercel</span>
        </footer>
      </div>
    </main>
  );
}
