import "server-only";

import { asc, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  orderItems,
  orders,
  orderStatusHistory,
  restaurants,
  users,
} from "@/db/schema";

export async function getOrdersForAdmin() {
  const adminOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      customerName: users.name,
      customerEmail: users.email,
      restaurantName: restaurants.name,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .orderBy(desc(orders.createdAt));

  if (adminOrders.length === 0) {
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
        adminOrders.map((order) => order.id),
      ),
    )
    .orderBy(asc(orderItems.createdAt));
  const itemsByOrderId = items.reduce((groups, item) => {
    const orderItemsForOrder = groups.get(item.orderId) ?? [];
    orderItemsForOrder.push(item);
    groups.set(item.orderId, orderItemsForOrder);
    return groups;
  }, new Map<string, typeof items>());

  return adminOrders.map((order) => ({
    ...order,
    items: itemsByOrderId.get(order.id) ?? [],
  }));
}

export async function getOrderByIdForAdmin(orderId: string) {
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
      customerName: users.name,
      customerEmail: users.email,
      restaurantName: restaurants.name,
      restaurantSlug: restaurants.slug,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .innerJoin(restaurants, eq(orders.restaurantId, restaurants.id))
    .where(eq(orders.id, orderId))
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

export type AdminOrderDetail = NonNullable<
  Awaited<ReturnType<typeof getOrderByIdForAdmin>>
>;
