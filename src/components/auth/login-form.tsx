"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";
import type { AuthActionState } from "@/lib/auth/types";

import { FieldError } from "./field-error";
import { SubmitButton } from "./submit-button";

const inputClassName =
  "mt-2 w-full rounded-2xl border border-black/10 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[var(--accent)] focus:ring-4 focus:ring-orange-100";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const initialState: AuthActionState = {};
  const [state, formAction] = useActionState(loginAction, initialState);
  const signUpHref =
    redirectTo === "/"
      ? "/signup"
      : `/signup?next=${encodeURIComponent(redirectTo)}`;

  return (
    <>
      <form action={formAction} className="space-y-5" noValidate>
        <input name="redirectTo" type="hidden" value={redirectTo} />

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
            autoComplete="current-password"
            className={inputClassName}
            id="password"
            name="password"
            placeholder="비밀번호를 입력해 주세요"
            type="password"
          />
          <FieldError
            id="password-error"
            errors={state.fieldErrors?.password}
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

        <SubmitButton pendingLabel="로그인 중...">로그인</SubmitButton>
      </form>

      <p className="mt-7 border-t border-black/10 pt-6 text-center text-sm text-black/55">
        아직 계정이 없나요?{" "}
        <Link className="font-bold text-[var(--accent)]" href={signUpHref}>
          회원가입
        </Link>
      </p>
    </>
  );
}
