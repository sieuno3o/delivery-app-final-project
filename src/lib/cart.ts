import { z } from "zod";

export const MAX_CART_ITEM_QUANTITY = 99;

const cartRestaurantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  deliveryFee: z.number().int().nonnegative(),
  minimumOrderAmount: z.number().int().nonnegative(),
});

const cartItemSchema = z.object({
  menuItemId: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().min(1).max(MAX_CART_ITEM_QUANTITY),
});

export const cartSchema = z.object({
  restaurant: cartRestaurantSchema,
  items: z.array(cartItemSchema).min(1),
});

export type CartRestaurant = z.infer<typeof cartRestaurantSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type Cart = z.infer<typeof cartSchema>;
export type AddCartItem = Omit<CartItem, "quantity">;

export function parseStoredCart(value: string | null): Cart | null {
  if (!value) {
    return null;
  }

  try {
    const result = cartSchema.safeParse(JSON.parse(value));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function isDifferentRestaurant(
  cart: Cart | null,
  restaurant: CartRestaurant,
) {
  return Boolean(cart && cart.restaurant.id !== restaurant.id);
}

export function addItemToCart(
  cart: Cart | null,
  restaurant: CartRestaurant,
  item: AddCartItem,
): Cart {
  if (!cart || isDifferentRestaurant(cart, restaurant)) {
    return {
      restaurant,
      items: [{ ...item, quantity: 1 }],
    };
  }

  const existingItem = cart.items.find(
    (cartItem) => cartItem.menuItemId === item.menuItemId,
  );

  if (!existingItem) {
    return {
      ...cart,
      items: [...cart.items, { ...item, quantity: 1 }],
    };
  }

  return {
    ...cart,
    items: cart.items.map((cartItem) =>
      cartItem.menuItemId === item.menuItemId
        ? {
            ...cartItem,
            quantity: Math.min(
              cartItem.quantity + 1,
              MAX_CART_ITEM_QUANTITY,
            ),
          }
        : cartItem,
    ),
  };
}

export function updateCartItemQuantity(
  cart: Cart,
  menuItemId: string,
  quantity: number,
): Cart | null {
  if (quantity <= 0) {
    const remainingItems = cart.items.filter(
      (item) => item.menuItemId !== menuItemId,
    );

    return remainingItems.length > 0
      ? { ...cart, items: remainingItems }
      : null;
  }

  return {
    ...cart,
    items: cart.items.map((item) =>
      item.menuItemId === menuItemId
        ? {
            ...item,
            quantity: Math.min(quantity, MAX_CART_ITEM_QUANTITY),
          }
        : item,
    ),
  };
}

export function calculateCartSubtotal(cart: Cart | null) {
  return (
    cart?.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    ) ?? 0
  );
}

export function calculateCartTotal(cart: Cart | null) {
  return cart ? calculateCartSubtotal(cart) + cart.restaurant.deliveryFee : 0;
}

export function calculateCartItemCount(cart: Cart | null) {
  return cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

export function calculateMinimumOrderRemaining(cart: Cart | null) {
  if (!cart) {
    return 0;
  }

  return Math.max(
    cart.restaurant.minimumOrderAmount - calculateCartSubtotal(cart),
    0,
  );
}
