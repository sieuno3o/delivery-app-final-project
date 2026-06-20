import { describe, expect, it } from "vitest";

import {
  formatDeliveryFee,
  formatDeliveryTime,
  formatRating,
  formatReviewCount,
  getRestaurantVisual,
} from "./restaurant-presenter";

describe("restaurant presenter", () => {
  it("DB의 10배 평점을 소수점 한 자리로 표시한다", () => {
    expect(formatRating(48)).toBe("4.8");
  });

  it("배달 시간과 배달비를 읽기 좋게 표시한다", () => {
    expect(formatDeliveryTime(25, 40)).toBe("25~40분");
    expect(formatDeliveryFee(0)).toBe("무료 배달");
    expect(formatDeliveryFee(2500)).toBe("배달비 ₩2,500");
  });

  it("리뷰 수에 천 단위 구분자를 적용한다", () => {
    expect(formatReviewCount(1284)).toBe("1,284");
  });

  it("알 수 없는 카테고리에도 기본 시각 요소를 제공한다", () => {
    expect(getRestaurantVisual("기타").emoji).toBe("🍽️");
  });
});
