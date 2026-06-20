import { describe, expect, it } from "vitest";

import {
  OrderValidationError,
  createOrderNumber,
  priceOrder,
  type MenuForOrder,
  type RestaurantForOrder,
} from "./order";

const restaurant: RestaurantForOrder = {
  id: "11111111-1111-4111-8111-111111111111",
  deliveryFee: 2500,
  minimumOrderAmount: 15000,
  isActive: true,
};

const menus: MenuForOrder[] = [
  {
    id: "22222222-2222-4222-8222-222222222222",
    restaurantId: restaurant.id,
    name: "파스타",
    price: 8000,
    isSoldOut: false,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    restaurantId: restaurant.id,
    name: "샐러드",
    price: 7000,
    isSoldOut: false,
  },
];

describe("priceOrder", () => {
  it("DB 가격으로 상품 합계와 최종 금액을 계산한다", () => {
    const result = priceOrder(restaurant, menus, [
      { menuItemId: menus[0]!.id, quantity: 1 },
      { menuItemId: menus[1]!.id, quantity: 1 },
    ]);

    expect(result.subtotal).toBe(15000);
    expect(result.totalAmount).toBe(17500);
  });

  it("다른 식당 메뉴와 품절 메뉴를 거부한다", () => {
    expect(() =>
      priceOrder(restaurant, [{ ...menus[0]!, restaurantId: "other" }], [
        { menuItemId: menus[0]!.id, quantity: 2 },
      ]),
    ).toThrow(OrderValidationError);

    expect(() =>
      priceOrder(restaurant, [{ ...menus[0]!, isSoldOut: true }], [
        { menuItemId: menus[0]!.id, quantity: 2 },
      ]),
    ).toThrow("품절");
  });

  it("서버 기준 최소 주문 금액 미달을 거부한다", () => {
    expect(() =>
      priceOrder(restaurant, menus, [
        { menuItemId: menus[0]!.id, quantity: 1 },
      ]),
    ).toThrow("최소 주문 금액");
  });
});

describe("createOrderNumber", () => {
  it("날짜와 고정 길이 접미사로 읽기 쉬운 주문번호를 만든다", () => {
    expect(createOrderNumber(new Date(2026, 5, 20), "A1B2C3D4")).toBe(
      "DH-20260620-A1B2C3D4",
    );
  });
});
