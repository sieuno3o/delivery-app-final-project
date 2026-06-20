import { describe, expect, it } from "vitest";

import {
  addItemToCart,
  calculateCartItemCount,
  calculateCartSubtotal,
  calculateCartTotal,
  calculateMinimumOrderRemaining,
  isDifferentRestaurant,
  parseStoredCart,
  updateCartItemQuantity,
  type CartRestaurant,
} from "./cart";

const restaurant: CartRestaurant = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "성수키친",
  slug: "seongsu-kitchen",
  deliveryFee: 2500,
  minimumOrderAmount: 15000,
};

const otherRestaurant: CartRestaurant = {
  ...restaurant,
  id: "22222222-2222-4222-8222-222222222222",
  name: "한옥밥상",
  slug: "hanok-bapsang",
};

const menu = {
  menuItemId: "33333333-3333-4333-8333-333333333333",
  name: "새우 로제 파스타",
  price: 14900,
};

describe("cart", () => {
  it("첫 메뉴를 담고 같은 메뉴를 다시 담으면 수량을 늘린다", () => {
    const firstCart = addItemToCart(null, restaurant, menu);
    const secondCart = addItemToCart(firstCart, restaurant, menu);

    expect(secondCart.items[0]?.quantity).toBe(2);
    expect(calculateCartItemCount(secondCart)).toBe(2);
  });

  it("서로 다른 식당을 구분한다", () => {
    const cart = addItemToCart(null, restaurant, menu);
    expect(isDifferentRestaurant(cart, otherRestaurant)).toBe(true);
  });

  it("수량이 0이 되면 메뉴를 제거하고 빈 장바구니를 null로 만든다", () => {
    const cart = addItemToCart(null, restaurant, menu);
    expect(updateCartItemQuantity(cart, menu.menuItemId, 0)).toBeNull();
  });

  it("상품 합계, 배달비 포함 총액, 최소 주문 부족액을 계산한다", () => {
    const cart = addItemToCart(null, restaurant, menu);

    expect(calculateCartSubtotal(cart)).toBe(14900);
    expect(calculateCartTotal(cart)).toBe(17400);
    expect(calculateMinimumOrderRemaining(cart)).toBe(100);
  });

  it("손상된 로컬 저장값을 거부한다", () => {
    expect(parseStoredCart("not-json")).toBeNull();
    expect(parseStoredCart(JSON.stringify({ items: [] }))).toBeNull();
  });
});
