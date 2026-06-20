import { describe, expect, it } from "vitest";

import {
  canTransitionOrderStatus,
  getNextOrderStatuses,
} from "./order-status";

describe("주문 상태 전이", () => {
  it("정상 배송 순서만 앞으로 진행한다", () => {
    expect(canTransitionOrderStatus("received", "preparing")).toBe(true);
    expect(canTransitionOrderStatus("preparing", "delivering")).toBe(true);
    expect(canTransitionOrderStatus("delivering", "completed")).toBe(true);
  });

  it("접수·조리 단계에서는 주문을 취소할 수 있다", () => {
    expect(getNextOrderStatuses("received")).toContain("cancelled");
    expect(getNextOrderStatuses("preparing")).toContain("cancelled");
  });

  it("역방향 전이와 종료 상태 변경을 차단한다", () => {
    expect(canTransitionOrderStatus("preparing", "received")).toBe(false);
    expect(canTransitionOrderStatus("completed", "cancelled")).toBe(false);
    expect(canTransitionOrderStatus("cancelled", "received")).toBe(false);
  });
});
