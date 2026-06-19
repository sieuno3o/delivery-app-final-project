const wonFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

export function formatWon(amount: number) {
  if (!Number.isFinite(amount)) {
    throw new TypeError("금액은 유한한 숫자여야 합니다.");
  }

  return wonFormatter.format(amount);
}
