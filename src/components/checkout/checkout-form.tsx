"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createOrderAction } from "@/app/actions/order";
import { FieldError } from "@/components/auth/field-error";
import { useCart } from "@/components/cart/cart-provider";
import { formatWon } from "@/lib/currency";
import type { OrderActionState } from "@/lib/order-action-types";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[var(--accent)] focus:ring-4 focus:ring-orange-100";

function OrderSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-6 w-full rounded-2xl bg-[var(--ink)] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-black/40"
      disabled={disabled || pending}
      type="submit"
    >
      {pending ? "주문을 안전하게 저장하는 중..." : "주문 확정하기"}
    </button>
  );
}

export function CheckoutForm({ requestId }: { requestId: string }) {
  const { cart, isHydrated, subtotal, total, minimumOrderRemaining } = useCart();
  const initialState: OrderActionState = {};
  const [state, formAction] = useActionState(createOrderAction, initialState);

  if (!isHydrated) {
    return (
      <div
        aria-busy="true"
        className="grid animate-pulse gap-6 lg:grid-cols-[1fr_22rem]"
      >
        <div className="h-[34rem] rounded-[2rem] bg-white" />
        <div className="h-80 rounded-[2rem] bg-white" />
      </div>
    );
  }

  if (!cart) {
    return (
      <section className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(33,31,28,0.06)] ring-1 ring-black/5">
        <span aria-hidden="true" className="text-6xl">
          🥡
        </span>
        <h2 className="mt-6 text-2xl font-black tracking-[-0.04em]">
          주문할 메뉴가 없어요
        </h2>
        <p className="mt-3 text-sm text-black/50">
          장바구니에 메뉴를 담은 다음 주문서를 작성해 주세요.
        </p>
        <Link
          className="mt-7 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-bold text-white"
          href="/"
        >
          식당 둘러보기
        </Link>
      </section>
    );
  }

  const requestedItems = cart.items.map((item) => ({
    menuItemId: item.menuItemId,
    quantity: item.quantity,
  }));

  return (
    <form
      action={formAction}
      className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start"
      noValidate
    >
      <input name="idempotencyKey" type="hidden" value={requestId} />
      <input name="restaurantId" type="hidden" value={cart.restaurant.id} />
      <input
        name="items"
        type="hidden"
        value={JSON.stringify(requestedItems)}
      />

      <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(33,31,28,0.06)] ring-1 ring-black/5 sm:p-8">
        <p className="text-xs font-bold tracking-[0.1em] text-[var(--accent)]">
          DELIVERY INFORMATION
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
          어디로 배달할까요?
        </h2>

        <div className="mt-8 space-y-6">
          <div>
            <label className="text-sm font-bold" htmlFor="deliveryAddress">
              배송 주소 <span className="text-[var(--accent)]">*</span>
            </label>
            <input
              aria-describedby="delivery-address-error"
              aria-invalid={Boolean(state.fieldErrors?.deliveryAddress)}
              autoComplete="street-address"
              className={inputClassName}
              id="deliveryAddress"
              maxLength={255}
              name="deliveryAddress"
              placeholder="예: 서울시 성동구 성수이로 12"
              required
            />
            <FieldError
              id="delivery-address-error"
              errors={state.fieldErrors?.deliveryAddress}
            />
          </div>

          <div>
            <label
              className="text-sm font-bold"
              htmlFor="deliveryAddressDetail"
            >
              상세 주소
            </label>
            <input
              aria-describedby="delivery-address-detail-error"
              aria-invalid={Boolean(
                state.fieldErrors?.deliveryAddressDetail,
              )}
              autoComplete="address-line2"
              className={inputClassName}
              id="deliveryAddressDetail"
              maxLength={120}
              name="deliveryAddressDetail"
              placeholder="예: 101동 202호"
            />
            <FieldError
              id="delivery-address-detail-error"
              errors={state.fieldErrors?.deliveryAddressDetail}
            />
          </div>

          <div>
            <label className="text-sm font-bold" htmlFor="deliveryRequest">
              배달 요청사항
            </label>
            <textarea
              aria-describedby="delivery-request-error"
              aria-invalid={Boolean(state.fieldErrors?.deliveryRequest)}
              className={`${inputClassName} min-h-28 resize-y`}
              id="deliveryRequest"
              maxLength={255}
              name="deliveryRequest"
              placeholder="예: 문 앞에 놓고 벨을 눌러주세요."
            />
            <FieldError
              id="delivery-request-error"
              errors={state.fieldErrors?.deliveryRequest}
            />
          </div>
        </div>

        <p className="mt-7 rounded-2xl bg-orange-50 px-4 py-3 text-xs leading-5 text-orange-800">
          결제는 시연용입니다. 주문 확정 시 실제 결제 없이 주문 정보만
          안전하게 저장됩니다.
        </p>
      </section>

      <aside className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(33,31,28,0.06)] ring-1 ring-black/5 lg:sticky lg:top-6">
        <p className="text-xs font-bold text-[var(--accent)]">ORDER SUMMARY</p>
        <h2 className="mt-2 text-xl font-black tracking-[-0.035em]">
          {cart.restaurant.name}
        </h2>

        <ul className="mt-5 divide-y divide-black/8 border-y border-black/8">
          {cart.items.map((item) => (
            <li
              className="flex items-start justify-between gap-4 py-4 text-sm"
              key={item.menuItemId}
            >
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="mt-1 text-xs text-black/45">
                  {formatWon(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="font-bold">
                {formatWon(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between text-black/55">
            <dt>상품 금액</dt>
            <dd className="font-bold text-black">{formatWon(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-black/55">
            <dt>배달비</dt>
            <dd className="font-bold text-black">
              {cart.restaurant.deliveryFee === 0
                ? "무료"
                : formatWon(cart.restaurant.deliveryFee)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-4 text-base">
            <dt className="font-black">총 결제금액</dt>
            <dd className="text-lg font-black text-[var(--accent)]">
              {formatWon(total)}
            </dd>
          </div>
        </dl>

        {minimumOrderRemaining > 0 ? (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            최소 주문까지 {formatWon(minimumOrderRemaining)} 더 담아주세요.
          </p>
        ) : null}

        {state.message ? (
          <p
            className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            role="alert"
          >
            {state.message}
          </p>
        ) : null}

        <OrderSubmitButton disabled={minimumOrderRemaining > 0} />
        <Link
          className="mt-3 flex justify-center rounded-2xl px-4 py-3 text-sm font-bold text-black/45 transition hover:bg-black/5 hover:text-black"
          href="/cart"
        >
          장바구니 수정
        </Link>
      </aside>
    </form>
  );
}
