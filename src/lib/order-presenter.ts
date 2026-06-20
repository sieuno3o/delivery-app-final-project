export { orderStatusLabels } from "./order-status";

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
