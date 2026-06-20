import "server-only";

import { cache } from "react";

import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { menuItems, restaurants } from "@/db/schema";

export const getRestaurants = cache(async () => {
  return db
    .select()
    .from(restaurants)
    .where(eq(restaurants.isActive, true))
    .orderBy(desc(restaurants.ratingTenths), desc(restaurants.reviewCount));
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
