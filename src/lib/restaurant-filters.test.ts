import { describe, expect, it } from "vitest";

import {
  hasActiveRestaurantFilters,
  parseRestaurantFilters,
} from "./restaurant-filters";

describe("parseRestaurantFilters", () => {
  it("검색어 공백을 정리하고 허용된 필터 숫자를 변환한다", () => {
    expect(
      parseRestaurantFilters({
        q: "  성수   키친 ",
        category: " 양식 ",
        deliveryFee: "3000",
        minimumOrder: "15000",
      }),
    ).toEqual({
      query: "성수 키친",
      category: "양식",
      maxDeliveryFee: 3000,
      maxMinimumOrderAmount: 15000,
    });
  });

  it("허용하지 않은 숫자와 빈 문자열을 무시한다", () => {
    const filters = parseRestaurantFilters({
      q: " ",
      deliveryFee: "999999",
      minimumOrder: "-1",
    });

    expect(filters).toEqual({
      query: undefined,
      category: undefined,
      maxDeliveryFee: undefined,
      maxMinimumOrderAmount: undefined,
    });
    expect(hasActiveRestaurantFilters(filters)).toBe(false);
  });

  it("중복 쿼리 파라미터에서는 첫 번째 값만 사용한다", () => {
    expect(
      parseRestaurantFilters({ q: ["한옥", "무시"], category: ["한식"] }),
    ).toMatchObject({ query: "한옥", category: "한식" });
  });
});
