import { randomBytes } from "node:crypto";

import { z } from "zod";

export const requestedOrderItemSchema = z.object({
  menuItemId: z.string().uuid("올바르지 않은 메뉴입니다."),
  quantity: z.number().int().min(1).max(99),
});

export const createOrderSchema = z.object({
  idempotencyKey: z.string().uuid("주문 요청 번호가 올바르지 않습니다."),
  restaurantId: z.string().uuid("식당 정보가 올바르지 않습니다."),
  items: z
    .array(requestedOrderItemSchema)
    .min(1, "장바구니가 비어 있습니다.")
    .refine(
      (items) =>
        new Set(items.map((item) => item.menuItemId)).size === items.length,
      "같은 메뉴가 중복되었습니다.",
    ),
  deliveryAddress: z
    .string()
    .trim()
    .min(5, "배송 주소를 5자 이상 입력해 주세요.")
    .max(255, "배송 주소는 255자 이하여야 합니다."),
  deliveryAddressDetail: z
    .string()
    .trim()
    .max(120, "상세 주소는 120자 이하여야 합니다."),
  deliveryRequest: z
    .string()
    .trim()
    .max(255, "요청사항은 255자 이하여야 합니다."),
});

export type RequestedOrderItem = z.infer<typeof requestedOrderItemSchema>;

export type MenuForOrder = {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  isSoldOut: boolean;
};

export type RestaurantForOrder = {
  id: string;
  deliveryFee: number;
  minimumOrderAmount: number;
  isActive: boolean;
};

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderValidationError";
  }
}

export function priceOrder(
  restaurant: RestaurantForOrder,
  menus: MenuForOrder[],
  requestedItems: RequestedOrderItem[],
) {
  if (!restaurant.isActive) {
    throw new OrderValidationError("현재 주문할 수 없는 식당입니다.");
  }

  const menusById = new Map(menus.map((menu) => [menu.id, menu]));
  const items = requestedItems.map((requestedItem) => {
    const menu = menusById.get(requestedItem.menuItemId);

    if (!menu || menu.restaurantId !== restaurant.id) {
      throw new OrderValidationError("식당에 속하지 않은 메뉴가 포함되어 있습니다.");
    }

    if (menu.isSoldOut) {
      throw new OrderValidationError(`${menu.name} 메뉴가 품절되었습니다.`);
    }

    return {
      menuItemId: menu.id,
      menuName: menu.name,
      unitPrice: menu.price,
      quantity: requestedItem.quantity,
      lineTotal: menu.price * requestedItem.quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  if (subtotal < restaurant.minimumOrderAmount) {
    throw new OrderValidationError(
      `최소 주문 금액보다 ${restaurant.minimumOrderAmount - subtotal}원이 부족합니다.`,
    );
  }

  return {
    items,
    subtotal,
    deliveryFee: restaurant.deliveryFee,
    totalAmount: subtotal + restaurant.deliveryFee,
  };
}

export function createOrderNumber(
  now = new Date(),
  randomSuffix = randomBytes(4).toString("hex").toUpperCase(),
) {
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  return `DH-${date}-${randomSuffix}`;
}

export function parseRequestedItems(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}
