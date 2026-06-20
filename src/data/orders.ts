import "server-only";

import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  orderItems,
  orders,
  orderStatusHistory,
  restaurants,
} from "@/db/schema";

export async function getOrderByIdForUser(orderId: string, userId: string) {
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      deliveryAddress: orders.deliveryAddress,
      deliveryAddressDetail: orders.deliveryAddressDetail,
      deliveryRequest: orders.deliveryRequest,
      subtotal: orders.subtotal,
      deliveryFee: orders.deliveryFee,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      restaurantId: restaurants.id,
      restaurantName: restaurants.name,
      restaurantSlug: restaurants.slug,
    })
    .from(orders)
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  if (!order) {
    return null;
  }

  const [items, statusHistory] = await Promise.all([
    db
      .select({
        id: orderItems.id,
        menuName: orderItems.menuName,
        unitPrice: orderItems.unitPrice,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .orderBy(asc(orderItems.createdAt)),
    db
      .select({
        id: orderStatusHistory.id,
        status: orderStatusHistory.status,
        note: orderStatusHistory.note,
        createdAt: orderStatusHistory.createdAt,
      })
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, order.id))
      .orderBy(asc(orderStatusHistory.createdAt)),
  ]);

  return { ...order, items, statusHistory };
}

export async function getOrdersForUser(userId: string) {
  const userOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      restaurantName: restaurants.name,
    })
    .from(orders)
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  if (userOrders.length === 0) {
    return [];
  }

  const items = await db
    .select({
      orderId: orderItems.orderId,
      menuName: orderItems.menuName,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        userOrders.map((order) => order.id),
      ),
    )
    .orderBy(asc(orderItems.createdAt));
  const itemsByOrderId = items.reduce((groups, item) => {
    const orderItemsForOrder = groups.get(item.orderId) ?? [];
    orderItemsForOrder.push(item);
    groups.set(item.orderId, orderItemsForOrder);
    return groups;
  }, new Map<string, typeof items>());

  return userOrders.map((order) => ({
    ...order,
    items: itemsByOrderId.get(order.id) ?? [],
  }));
}

export type OrderDetail = NonNullable<
  Awaited<ReturnType<typeof getOrderByIdForUser>>
>;
