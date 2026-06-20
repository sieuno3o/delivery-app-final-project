import { formatWon } from "./currency";

type RestaurantVisual = {
  emoji: string;
  background: string;
};

const categoryVisuals: Record<string, RestaurantVisual> = {
  한식: {
    emoji: "🍚",
    background: "linear-gradient(135deg, #f4b860 0%, #e97645 100%)",
  },
  중식: {
    emoji: "🥟",
    background: "linear-gradient(135deg, #ef6a65 0%, #c9323e 100%)",
  },
  일식: {
    emoji: "🍣",
    background: "linear-gradient(135deg, #f7a7a1 0%, #ef705e 100%)",
  },
  양식: {
    emoji: "🍝",
    background: "linear-gradient(135deg, #f2cf74 0%, #e58a45 100%)",
  },
  버거: {
    emoji: "🍔",
    background: "linear-gradient(135deg, #ecbd57 0%, #d66a36 100%)",
  },
  샐러드: {
    emoji: "🥗",
    background: "linear-gradient(135deg, #9acb73 0%, #4e9c68 100%)",
  },
};

const fallbackVisual: RestaurantVisual = {
  emoji: "🍽️",
  background: "linear-gradient(135deg, #9aa4b2 0%, #667085 100%)",
};

export function getRestaurantVisual(category: string) {
  return categoryVisuals[category] ?? fallbackVisual;
}

export function formatRating(ratingTenths: number) {
  return (ratingTenths / 10).toFixed(1);
}

export function formatReviewCount(reviewCount: number) {
  return new Intl.NumberFormat("ko-KR").format(reviewCount);
}

export function formatDeliveryTime(minimum: number, maximum: number) {
  return `${minimum}~${maximum}분`;
}

export function formatDeliveryFee(deliveryFee: number) {
  return deliveryFee === 0 ? "무료 배달" : `배달비 ${formatWon(deliveryFee)}`;
}
