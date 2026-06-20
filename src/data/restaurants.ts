import "server-only";

import { cache } from "react";

import { and, asc, desc, eq, ilike, lte, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { menuItems, restaurants } from "@/db/schema";
import type { RestaurantFilters } from "@/lib/restaurant-filters";

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function getRestaurants(filters: RestaurantFilters = {}) {
  const conditions: SQL[] = [eq(restaurants.isActive, true)];

  if (filters.query) {
    conditions.push(
      ilike(restaurants.name, `%${escapeLikePattern(filters.query)}%`),
    );
  }

  if (filters.category) {
    conditions.push(eq(restaurants.category, filters.category));
  }

  if (filters.maxDeliveryFee !== undefined) {
    conditions.push(lte(restaurants.deliveryFee, filters.maxDeliveryFee));
  }

  if (filters.maxMinimumOrderAmount !== undefined) {
    conditions.push(
      lte(
        restaurants.minimumOrderAmount,
        filters.maxMinimumOrderAmount,
      ),
    );
  }

  return db
    .select()
    .from(restaurants)
    .where(and(...conditions))
    .orderBy(desc(restaurants.ratingTenths), desc(restaurants.reviewCount));
}

export const getRestaurantCategories = cache(async () => {
  const rows = await db
    .selectDistinct({ category: restaurants.category })
    .from(restaurants)
    .where(eq(restaurants.isActive, true))
    .orderBy(asc(restaurants.category));

  return rows.map((row) => row.category);
});

export const getRestaurantBySlug = cache(async (slug: string) => {
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.slug, slug))
    .limit(1);

  if (!restaurant || !restaurant.isActive) {
    return null;
  }

  const menus = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurant.id))
    .orderBy(asc(menuItems.position), asc(menuItems.name));

  return {
    ...restaurant,
    menuItems: menus,
  };
});

export type RestaurantListItem = Awaited<
  ReturnType<typeof getRestaurants>
>[number];
export type RestaurantDetail = NonNullable<
  Awaited<ReturnType<typeof getRestaurantBySlug>>
>;
