export const orderStatuses = [
  "received",
  "preparing",
  "delivering",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  received: "주문 접수",
  preparing: "조리 중",
  delivering: "배달 중",
  completed: "배달 완료",
  cancelled: "주문 취소",
};

export const fulfillmentOrderStatuses = [
  "received",
  "preparing",
  "delivering",
  "completed",
] as const satisfies readonly OrderStatus[];

const allowedTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  received: ["preparing", "cancelled"],
  preparing: ["delivering", "cancelled"],
  delivering: ["completed"],
  completed: [],
  cancelled: [],
};

export function getNextOrderStatuses(status: OrderStatus) {
  return allowedTransitions[status];
}

export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
) {
  return allowedTransitions[currentStatus].includes(nextStatus);
}
