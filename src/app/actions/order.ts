"use server";

import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  menuItems,
  orderItems,
  orders,
  orderStatusHistory,
  restaurants,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import type { OrderActionState } from "@/lib/order-action-types";
import {
  OrderValidationError,
  createOrderNumber,
  createOrderSchema,
  parseRequestedItems,
  priceOrder,
} from "@/lib/order";

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function createOrderAction(
  _previousState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { message: "로그인 후 주문해 주세요." };
  }

  const result = createOrderSchema.safeParse({
    idempotencyKey: formData.get("idempotencyKey"),
    restaurantId: formData.get("restaurantId"),
    items: parseRequestedItems(formData.get("items")),
    deliveryAddress: formData.get("deliveryAddress"),
    deliveryAddressDetail: formData.get("deliveryAddressDetail"),
    deliveryRequest: formData.get("deliveryRequest"),
  });

  if (!result.success) {
    const flattened = result.error.flatten();
    return {
      message: flattened.formErrors[0],
      fieldErrors: {
        deliveryAddress: flattened.fieldErrors.deliveryAddress,
        deliveryAddressDetail:
          flattened.fieldErrors.deliveryAddressDetail,
        deliveryRequest: flattened.fieldErrors.deliveryRequest,
      },
    };
  }

  const existingOrder = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(
        eq(orders.idempotencyKey, result.data.idempotencyKey),
        eq(orders.userId, user.id),
      ),
    )
    .limit(1);

  if (existingOrder[0]) {
    redirect(`/orders/${existingOrder[0].id}?placed=1`);
  }

  let orderId: string;

  try {
    orderId = await db.transaction(async (transaction) => {
      const [restaurant] = await transaction
        .select({
          id: restaurants.id,
          deliveryFee: restaurants.deliveryFee,
          minimumOrderAmount: restaurants.minimumOrderAmount,
          isActive: restaurants.isActive,
        })
        .from(restaurants)
        .where(eq(restaurants.id, result.data.restaurantId))
        .limit(1);

      if (!restaurant) {
        throw new OrderValidationError("식당 정보를 찾을 수 없습니다.");
      }

      const requestedMenuIds = result.data.items.map(
        (item) => item.menuItemId,
      );
      const currentMenus = await transaction
        .select({
          id: menuItems.id,
          restaurantId: menuItems.restaurantId,
          name: menuItems.name,
          price: menuItems.price,
          isSoldOut: menuItems.isSoldOut,
        })
        .from(menuItems)
        .where(inArray(menuItems.id, requestedMenuIds));

      const pricedOrder = priceOrder(
        restaurant,
        currentMenus,
        result.data.items,
      );
      const [newOrder] = await transaction
        .insert(orders)
        .values({
          orderNumber: createOrderNumber(),
          idempotencyKey: result.data.idempotencyKey,
          userId: user.id,
          restaurantId: restaurant.id,
          deliveryAddress: result.data.deliveryAddress,
          deliveryAddressDetail:
            result.data.deliveryAddressDetail || null,
          deliveryRequest: result.data.deliveryRequest || null,
          subtotal: pricedOrder.subtotal,
          deliveryFee: pricedOrder.deliveryFee,
          totalAmount: pricedOrder.totalAmount,
        })
        .returning({ id: orders.id });

      if (!newOrder) {
        throw new Error("주문 저장 결과를 확인할 수 없습니다.");
      }

      await transaction.insert(orderItems).values(
        pricedOrder.items.map((item) => ({
          orderId: newOrder.id,
          menuItemId: item.menuItemId,
          menuName: item.menuName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
      );
      await transaction.insert(orderStatusHistory).values({
        orderId: newOrder.id,
        status: "received",
        changedByUserId: user.id,
        note: "고객 주문 접수",
      });

      return newOrder.id;
    });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return { message: error.message };
    }

    if (isUniqueViolation(error)) {
      const [duplicateOrder] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(
          and(
            eq(orders.idempotencyKey, result.data.idempotencyKey),
            eq(orders.userId, user.id),
          ),
        )
        .limit(1);

      if (duplicateOrder) {
        redirect(`/orders/${duplicateOrder.id}?placed=1`);
      }
    }

    console.error("주문 생성 실패", error);
    return {
      message: "주문을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  redirect(`/orders/${orderId}?placed=1`);
}
