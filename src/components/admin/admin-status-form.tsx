"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateOrderStatusAction } from "@/app/actions/admin-orders";
import type { AdminOrderActionState } from "@/lib/admin-order-action-types";
import {
  getNextOrderStatuses,
  orderStatusLabels,
  type OrderStatus,
} from "@/lib/order-status";

function StatusSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-5 w-full rounded-2xl bg-[var(--ink)] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-55"
      disabled={pending}
      type="submit"
    >
      {pending ? "상태를 저장하는 중..." : "상태 변경"}
    </button>
  );
}

export function AdminStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const initialState: AdminOrderActionState = {};
  const [state, formAction] = useActionState(
    updateOrderStatusAction,
    initialState,
  );
  const nextStatuses = getNextOrderStatuses(currentStatus);

  if (nextStatuses.length === 0) {
    return (
      <div className="mt-5 rounded-2xl bg-[var(--surface)] px-4 py-4 text-sm leading-6 text-black/50">
        완료되거나 취소된 주문은 더 이상 상태를 변경할 수 없습니다.
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-5" noValidate>
      <input name="orderId" type="hidden" value={orderId} />

      <label className="text-sm font-bold" htmlFor="nextStatus">
        다음 상태
      </label>
      <select
        className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[var(--surface)] px-4 text-sm font-bold outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-orange-100"
        defaultValue={nextStatuses[0]}
        id="nextStatus"
        name="nextStatus"
      >
        {nextStatuses.map((status) => (
          <option key={status} value={status}>
            {orderStatusLabels[status]}
          </option>
        ))}
      </select>

      <label className="mt-5 block text-sm font-bold" htmlFor="note">
        관리 메모
      </label>
      <textarea
        className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-black/10 bg-[var(--surface)] px-4 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[var(--accent)] focus:ring-4 focus:ring-orange-100"
        id="note"
        maxLength={120}
        name="note"
        placeholder="예: 조리를 시작했습니다."
      />

      {state.message ? (
        <p
          className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
            state.success
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
          role={state.success ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}

      <StatusSubmitButton />
    </form>
  );
}
