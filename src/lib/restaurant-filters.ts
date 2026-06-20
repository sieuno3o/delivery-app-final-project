export const deliveryFeeFilterOptions = [
  { value: 0, label: "무료 배달" },
  { value: 2000, label: "2,000원 이하" },
  { value: 3000, label: "3,000원 이하" },
] as const;

export const minimumOrderFilterOptions = [
  { value: 12000, label: "12,000원 이하" },
  { value: 15000, label: "15,000원 이하" },
] as const;

export type RestaurantFilters = {
  query?: string;
  category?: string;
  maxDeliveryFee?: number;
  maxMinimumOrderAmount?: number;
};

type RawSearchParams = Record<
  string,
  string | string[] | undefined
>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeText(
  value: string | string[] | undefined,
  maxLength: number,
) {
  const normalized = firstValue(value)?.trim().replace(/\s+/g, " ");
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

function parseAllowedNumber(
  value: string | string[] | undefined,
  allowedValues: readonly number[],
) {
  const rawValue = firstValue(value);

  if (!rawValue) {
    return undefined;
  }

  const parsed = Number(rawValue);
  return allowedValues.includes(parsed) ? parsed : undefined;
}

export function parseRestaurantFilters(
  searchParams: RawSearchParams,
): RestaurantFilters {
  return {
    query: normalizeText(searchParams.q, 50),
    category: normalizeText(searchParams.category, 40),
    maxDeliveryFee: parseAllowedNumber(
      searchParams.deliveryFee,
      deliveryFeeFilterOptions.map((option) => option.value),
    ),
    maxMinimumOrderAmount: parseAllowedNumber(
      searchParams.minimumOrder,
      minimumOrderFilterOptions.map((option) => option.value),
    ),
  };
}

export function hasActiveRestaurantFilters(filters: RestaurantFilters) {
  return Boolean(
    filters.query ||
      filters.category ||
      filters.maxDeliveryFee !== undefined ||
      filters.maxMinimumOrderAmount !== undefined,
  );
}
