import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "이메일을 입력해 주세요.")
  .email("올바른 이메일 형식을 입력해 주세요.")
  .max(255, "이메일은 255자 이하여야 합니다.");

const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다.")
  .max(72, "비밀번호는 72자 이하여야 합니다.")
  .regex(/[A-Za-z]/, "비밀번호에 영문자를 하나 이상 포함해 주세요.")
  .regex(/[0-9]/, "비밀번호에 숫자를 하나 이상 포함해 주세요.");

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "이름은 2자 이상이어야 합니다.")
      .max(30, "이름은 30자 이하여야 합니다."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .max(72, "비밀번호 확인은 72자 이하여야 합니다."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 서로 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "비밀번호를 입력해 주세요.")
    .max(72, "비밀번호를 확인해 주세요."),
});

export function getSafeRedirectPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "/";
  }

  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\r\n]/.test(value)
  ) {
    return "/";
  }

  const path = value.split(/[?#]/, 1)[0];

  if (path === "/login" || path === "/signup") {
    return "/";
  }

  return value;
}
