"use client";

import { useEffect } from "react";

import { useCart } from "@/components/cart/cart-provider";

export function ClearCartAfterOrder({ orderId }: { orderId: string }) {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    window.history.replaceState(null, "", `/orders/${orderId}`);
  }, [clearCart, orderId]);

  return null;
}
