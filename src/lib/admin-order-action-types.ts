import type { OrderStatus } from "./order-status";

export type AdminOrderActionState = {
  message?: string;
  success?: boolean;
  status?: OrderStatus;
};
