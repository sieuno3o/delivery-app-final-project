"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUpAction } from "@/app/actions/auth";
import type { AuthActionState } from "@/lib/auth/types";

import { FieldError } from "./field-error";
import { SubmitButton } from "./submit-button";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[var(--accent)] focus:ring-4 focus:ring-orange-100";

export function SignUpForm({ redirectTo }: { redirectTo: string }) {
  const initialState: AuthActionState = {};
  const [state, formAction] = useActionState(signUpAction, initialState);
  const loginHref =
    redirectTo === "/"
      ? "/login"
      : `/login?next=${encodeURIComponent(redirectTo)}`;

  return (
    <>
      <form action={formAction} className="space-y-5" noValidate>
        <input name="redirectTo" type="hidden" value={redirectTo} />

        <div>
          <label className="text-sm font-bold" htmlFor="name">
            이름
          </label>
          <input
            aria-describedby="name-error"
            aria-invalid={Boolean(state.fieldErrors?.name)}
            autoComplete="name"
            className={inputClassName}
            id="name"
            maxLength={30}
            name="name"
            placeholder="홍길동"
          />
          <FieldError id="name-error" errors={state.fieldErrors?.name} />
        </div>

        <div>
          <label className="text-sm font-bold" htmlFor="email">
            이메일
          </label>
          <input
            aria-describedby="email-error"
            aria-invalid={Boolean(state.fieldErrors?.email)}
            autoComplete="email"
            className={inputClassName}
            id="email"
            name="email"
            placeholder="hello@example.com"
            type="email"
          />
          <FieldError id="email-error" errors={state.fieldErrors?.email} />
        </div>

        <div>
          <label className="text-sm font-bold" htmlFor="password">
            비밀번호
          </label>
          <input
            aria-describedby="password-error"
            aria-invalid={Boolean(state.fieldErrors?.password)}
            autoComplete="new-password"
            className={inputClassName}
            id="password"
            maxLength={72}
            name="password"
            placeholder="영문과 숫자를 포함한 8자 이상"
            type="password"
          />
          <FieldError
            id="password-error"
            errors={state.fieldErrors?.password}
          />
        </div>

        <div>
          <label className="text-sm font-bold" htmlFor="confirmPassword">
            비밀번호 확인
          </label>
          <input
            aria-describedby="confirm-password-error"
            aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
            autoComplete="new-password"
            className={inputClassName}
            id="confirmPassword"
            maxLength={72}
            name="confirmPassword"
            placeholder="비밀번호를 한 번 더 입력해 주세요"
            type="password"
          />
          <FieldError
            id="confirm-password-error"
            errors={state.fieldErrors?.confirmPassword}
          />
        </div>

        {state.message ? (
          <p
            className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            role="alert"
          >
            {state.message}
          </p>
        ) : null}

        <SubmitButton pendingLabel="계정을 만드는 중...">
          회원가입
        </SubmitButton>
      </form>

      <p className="mt-7 border-t border-black/10 pt-6 text-center text-sm text-black/55">
        이미 계정이 있나요?{" "}
        <Link className="font-bold text-[var(--accent)]" href={loginHref}>
          로그인
        </Link>
      </p>
    </>
  );
}
