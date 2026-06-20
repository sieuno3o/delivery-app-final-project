export const orderStatusLabels = {
  received: "주문 접수",
  preparing: "조리 중",
  delivering: "배달 중",
  completed: "배달 완료",
  cancelled: "주문 취소",
} as const;

export function summarizeOrderItems(
  items: { menuName: string; quantity: number }[],
) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return "메뉴 정보 없음";
  }

  const firstItem = items[0]!;
  if (itemCount === firstItem.quantity) {
    return `${firstItem.menuName} ${firstItem.quantity}개`;
  }

  return `${firstItem.menuName} 외 ${itemCount - firstItem.quantity}개`;
}
