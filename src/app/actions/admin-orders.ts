"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { orders, orderStatusHistory } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import type { AdminOrderActionState } from "@/lib/admin-order-action-types";
import {
  canTransitionOrderStatus,
  orderStatuses,
  orderStatusLabels,
} from "@/lib/order-status";

const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid("주문 정보가 올바르지 않습니다."),
  nextStatus: z.enum(orderStatuses),
  note: z
    .string()
    .trim()
    .max(120, "관리 메모는 120자 이하여야 합니다."),
});

class AdminOrderError extends Error {}

export async function updateOrderStatusAction(
  _previousState: AdminOrderActionState,
  formData: FormData,
): Promise<AdminOrderActionState> {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    return { message: "관리자만 주문 상태를 변경할 수 있습니다." };
  }

  const result = updateOrderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    nextStatus: formData.get("nextStatus"),
    note: formData.get("note"),
  });

  if (!result.success) {
    return {
      message:
        result.error.flatten().fieldErrors.note?.[0] ??
        "상태 변경 정보를 확인해 주세요.",
    };
  }

  try {
    await db.transaction(async (transaction) => {
      const [currentOrder] = await transaction
        .select({ status: orders.status })
        .from(orders)
        .where(eq(orders.id, result.data.orderId))
        .for("update")
        .limit(1);

      if (!currentOrder) {
        throw new AdminOrderError("주문을 찾을 수 없습니다.");
      }

      if (
        !canTransitionOrderStatus(
          currentOrder.status,
          result.data.nextStatus,
        )
      ) {
        throw new AdminOrderError(
          `${orderStatusLabels[currentOrder.status]}에서 ${orderStatusLabels[result.data.nextStatus]} 상태로 변경할 수 없습니다.`,
        );
      }

      const [updatedOrder] = await transaction
        .update(orders)
        .set({
          status: result.data.nextStatus,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(orders.id, result.data.orderId),
            eq(orders.status, currentOrder.status),
          ),
        )
        .returning({ id: orders.id });

      if (!updatedOrder) {
        throw new AdminOrderError(
          "다른 관리자가 먼저 상태를 변경했습니다. 새로고침 후 다시 시도해 주세요.",
        );
      }

      await transaction.insert(orderStatusHistory).values({
        orderId: result.data.orderId,
        status: result.data.nextStatus,
        changedByUserId: user.id,
        note:
          result.data.note ||
          `관리자가 ${orderStatusLabels[result.data.nextStatus]} 상태로 변경`,
      });
    });
  } catch (error) {
    if (error instanceof AdminOrderError) {
      return { message: error.message };
    }

    console.error("주문 상태 변경 실패", error);
    return {
      message: "주문 상태를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${result.data.orderId}`);
  revalidatePath(`/orders/${result.data.orderId}`);

  return {
    success: true,
    status: result.data.nextStatus,
    message: `${orderStatusLabels[result.data.nextStatus]} 상태로 변경했습니다.`,
  };
}
