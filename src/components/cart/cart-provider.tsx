"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  addItemToCart,
  calculateCartItemCount,
  calculateCartSubtotal,
  calculateCartTotal,
  calculateMinimumOrderRemaining,
  isDifferentRestaurant,
  parseStoredCart,
  updateCartItemQuantity,
  type AddCartItem,
  type Cart,
  type CartRestaurant,
} from "@/lib/cart";

const CART_STORAGE_KEY = "dongne-hanip-cart-v1";

type PendingItem = {
  restaurant: CartRestaurant;
  item: AddCartItem;
};

type CartContextValue = {
  cart: Cart | null;
  isHydrated: boolean;
  itemCount: number;
  subtotal: number;
  total: number;
  minimumOrderRemaining: number;
  requestAddItem: (restaurant: CartRestaurant, item: AddCartItem) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  getMenuQuantity: (menuItemId: string) => number;
  notify: (message: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCart(parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY)));
      setIsHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (cart) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } else {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [cart, isHydrated]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((message: string) => {
    setToast(message);
  }, []);

  const requestAddItem = useCallback(
    (restaurant: CartRestaurant, item: AddCartItem) => {
      if (isDifferentRestaurant(cart, restaurant)) {
        setPendingItem({ restaurant, item });
        return;
      }

      setCart((currentCart) =>
        addItemToCart(currentCart, restaurant, item),
      );
      notify(`${item.name}을(를) 장바구니에 담았어요.`);
    },
    [cart, notify],
  );

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    setCart((currentCart) =>
      currentCart
        ? updateCartItemQuantity(currentCart, menuItemId, quantity)
        : null,
    );
  }, []);

  const removeItem = useCallback(
    (menuItemId: string) => {
      setCart((currentCart) =>
        currentCart
          ? updateCartItemQuantity(currentCart, menuItemId, 0)
          : null,
      );
      notify("장바구니에서 메뉴를 삭제했어요.");
    },
    [notify],
  );

  const clearCart = useCallback(() => {
    setCart(null);
    notify("장바구니를 비웠어요.");
  }, [notify]);

  const confirmReplacement = useCallback(() => {
    if (!pendingItem) {
      return;
    }

    setCart(addItemToCart(null, pendingItem.restaurant, pendingItem.item));
    notify(`${pendingItem.restaurant.name} 메뉴로 장바구니를 바꿨어요.`);
    setPendingItem(null);
  }, [notify, pendingItem]);

  const getMenuQuantity = useCallback(
    (menuItemId: string) =>
      cart?.items.find((item) => item.menuItemId === menuItemId)?.quantity ?? 0,
    [cart],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isHydrated,
      itemCount: calculateCartItemCount(cart),
      subtotal: calculateCartSubtotal(cart),
      total: calculateCartTotal(cart),
      minimumOrderRemaining: calculateMinimumOrderRemaining(cart),
      requestAddItem,
      updateQuantity,
      removeItem,
      clearCart,
      getMenuQuantity,
      notify,
    }),
    [
      cart,
      clearCart,
      getMenuQuantity,
      isHydrated,
      notify,
      removeItem,
      requestAddItem,
      updateQuantity,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}

      {toast ? (
        <div
          aria-live="polite"
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white shadow-2xl sm:bottom-6"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      {pendingItem && cart ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5 backdrop-blur-sm"
          role="presentation"
        >
          <section
            aria-labelledby="replace-cart-title"
            aria-modal="true"
            className="w-full max-w-sm rounded-[2rem] bg-white p-7 shadow-2xl"
            role="dialog"
          >
            <span aria-hidden="true" className="text-4xl">
              🛒
            </span>
            <h2
              className="mt-4 text-xl font-black tracking-[-0.035em]"
              id="replace-cart-title"
            >
              장바구니를 바꿀까요?
            </h2>
            <p className="mt-3 text-sm leading-6 text-black/55">
              현재 {cart.restaurant.name} 메뉴가 담겨 있어요. 다른 식당인{" "}
              {pendingItem.restaurant.name} 메뉴를 담으면 기존 장바구니가
              비워집니다.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                className="rounded-2xl bg-black/5 px-4 py-3 text-sm font-bold text-black/60"
                onClick={() => setPendingItem(null)}
                type="button"
              >
                취소
              </button>
              <button
                className="rounded-2xl bg-[var(--ink)] px-4 py-3 text-sm font-bold text-white"
                onClick={confirmReplacement}
                type="button"
              >
                바꾸고 담기
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart는 CartProvider 안에서 사용해야 합니다.");
  }

  return context;
}
