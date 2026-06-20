"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import {
  DUMMY_PASSWORD_HASH,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";
import {
  createSession,
  deleteCurrentSession,
  prepareSession,
  writeSessionCookie,
} from "@/lib/auth/session";
import type { AuthActionState } from "@/lib/auth/types";
import {
  getSafeRedirectPath,
  loginSchema,
  signUpSchema,
} from "@/lib/auth/validation";

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const passwordHash = await hashPassword(result.data.password);
  let newSession: ReturnType<typeof prepareSession> | null = null;

  try {
    newSession = await db.transaction(async (transaction) => {
      const [user] = await transaction
        .insert(users)
        .values({
          name: result.data.name,
          email: result.data.email,
          passwordHash,
        })
        .returning({ id: users.id });

      if (!user) {
        throw new Error("회원 저장 결과를 확인할 수 없습니다.");
      }

      const preparedSession = prepareSession(user.id);
      await transaction.insert(sessions).values(preparedSession.record);

      return preparedSession;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        fieldErrors: {
          email: ["이미 가입된 이메일입니다."],
        },
      };
    }

    console.error("회원가입 실패", error);
    return {
      message: "회원가입을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  await writeSessionCookie(newSession.token, newSession.expiresAt);
  redirect(getSafeRedirectPath(formData.get("redirectTo")));
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, result.data.email))
    .limit(1);

  const passwordMatches = await verifyPassword(
    result.data.password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );

  if (!user || !passwordMatches) {
    return {
      message: "이메일 또는 비밀번호를 확인해 주세요.",
    };
  }

  try {
    await createSession(user.id);
  } catch (error) {
    console.error("로그인 세션 생성 실패", error);
    return {
      message: "로그인을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  redirect(getSafeRedirectPath(formData.get("redirectTo")));
}

export async function logoutAction() {
  await deleteCurrentSession();
  redirect("/login");
}
