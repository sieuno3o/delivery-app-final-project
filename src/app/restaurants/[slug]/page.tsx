import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { MenuCard } from "@/components/restaurants/menu-card";
import { getRestaurantBySlug } from "@/data/restaurants";
import { formatWon } from "@/lib/currency";
import {
  formatDeliveryFee,
  formatDeliveryTime,
  formatRating,
  formatReviewCount,
  getRestaurantVisual,
} from "@/lib/restaurant-presenter";

type RestaurantPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: RestaurantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    return { title: "식당을 찾을 수 없음" };
  }

  return {
    title: restaurant.name,
    description: restaurant.description,
  };
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant) {
    notFound();
  }

  const visual = getRestaurantVisual(restaurant.category);
  const restaurantForCart = {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    deliveryFee: restaurant.deliveryFee,
    minimumOrderAmount: restaurant.minimumOrderAmount,
  };
  const menuGroups = restaurant.menuItems.reduce((groups, menuItem) => {
    const categoryMenus = groups.get(menuItem.category) ?? [];
    categoryMenus.push(menuItem);
    groups.set(menuItem.category, categoryMenus);
    return groups;
  }, new Map<string, typeof restaurant.menuItems>());

  return (
    <main className="min-h-screen bg-[var(--surface)] text-[var(--ink)]" id="main-content">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <SiteHeader />

        <div className="py-7">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-black/55 transition hover:text-black"
            href="/"
          >
            <span aria-hidden="true">←</span>
            식당 목록
          </Link>
        </div>

        <section className="overflow-hidden rounded-[2.25rem] bg-white shadow-[0_22px_70px_rgba(33,31,28,0.08)] ring-1 ring-black/5 lg:grid lg:grid-cols-[0.85fr_1.15fr]">
          <div
            className="relative flex min-h-72 items-center justify-center overflow-hidden lg:min-h-[28rem]"
            style={{ background: visual.background }}
          >
            <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-white/15" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-black/5" />
            <span
              aria-hidden="true"
              className="relative text-9xl drop-shadow-[0_20px_24px_rgba(0,0,0,0.18)]"
            >
              {visual.emoji}
            </span>
          </div>

          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <p className="text-xs font-bold tracking-[0.12em] text-[var(--accent)]">
              {restaurant.category} · OPEN NOW
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.055em] sm:text-5xl">
              {restaurant.name}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-black/55">
              {restaurant.description}
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-[var(--surface)] p-4">
                <dt className="text-xs font-bold text-black/40">평점</dt>
                <dd className="mt-1 text-sm font-black">
                  ★ {formatRating(restaurant.ratingTenths)}
                </dd>
              </div>
              <div className="rounded-2xl bg-[var(--surface)] p-4">
                <dt className="text-xs font-bold text-black/40">배달 시간</dt>
                <dd className="mt-1 text-sm font-black">
                  {formatDeliveryTime(
                    restaurant.deliveryTimeMin,
                    restaurant.deliveryTimeMax,
                  )}
                </dd>
              </div>
              <div className="rounded-2xl bg-[var(--surface)] p-4">
                <dt className="text-xs font-bold text-black/40">배달비</dt>
                <dd className="mt-1 text-sm font-black">
                  {formatDeliveryFee(restaurant.deliveryFee).replace(
                    "배달비 ",
                    "",
                  )}
                </dd>
              </div>
              <div className="rounded-2xl bg-[var(--surface)] p-4">
                <dt className="text-xs font-bold text-black/40">최소 주문</dt>
                <dd className="mt-1 text-sm font-black">
                  {formatWon(restaurant.minimumOrderAmount)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-black/45">
              <span>리뷰 {formatReviewCount(restaurant.reviewCount)}개</span>
              <span>{restaurant.address}</span>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mb-10">
            <p className="text-xs font-bold tracking-[0.12em] text-[var(--accent)]">
              MENU
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
              메뉴를 골라보세요
            </h2>
            <p className="mt-3 text-sm text-black/50">
              총 {restaurant.menuItems.length}개 메뉴 · 가격과 품절 여부는 DB
              기준입니다.
            </p>
          </div>

          {menuGroups.size > 0 ? (
            <div className="space-y-12">
              {[...menuGroups.entries()].map(([category, menuItems]) => (
                <section key={category}>
                  <div className="mb-4 flex items-center gap-3">
                    <h3 className="text-xl font-black tracking-[-0.035em]">
                      {category}
                    </h3>
                    <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-bold text-black/45">
                      {menuItems.length}
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {menuItems.map((menuItem) => (
                      <MenuCard
                        key={menuItem.id}
                        menuItem={menuItem}
                        restaurant={restaurantForCart}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] bg-white px-6 py-14 text-center ring-1 ring-black/5">
              <p className="text-lg font-black">준비 중인 메뉴예요</p>
              <p className="mt-2 text-sm text-black/50">
                잠시 후 새로운 메뉴로 찾아올게요.
              </p>
            </div>
          )}
        </section>

        <footer className="border-t border-black/10 py-6 text-xs text-black/45">
          동네한입 · {restaurant.name}
        </footer>
      </div>
    </main>
  );
}
