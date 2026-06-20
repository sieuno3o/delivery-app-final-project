import { describe, expect, it } from "vitest";

import {
  getSafeRedirectPath,
  loginSchema,
  signUpSchema,
} from "./validation";

describe("signUpSchema", () => {
  it("이메일을 소문자로 정규화한다", () => {
    const result = signUpSchema.parse({
      name: "홍길동",
      email: "  HELLO@Example.com ",
      password: "Password123",
      confirmPassword: "Password123",
    });

    expect(result.email).toBe("hello@example.com");
  });

  it("서로 다른 비밀번호를 거부한다", () => {
    const result = signUpSchema.safeParse({
      name: "홍길동",
      email: "hello@example.com",
      password: "Password123",
      confirmPassword: "Password456",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.confirmPassword).toContain(
      "비밀번호가 서로 일치하지 않습니다.",
    );
  });
});

describe("loginSchema", () => {
  it("빈 로그인 입력을 거부한다", () => {
    expect(loginSchema.safeParse({ email: "", password: "" }).success).toBe(
      false,
    );
  });
});

describe("getSafeRedirectPath", () => {
  it("앱 내부 경로만 허용한다", () => {
    expect(getSafeRedirectPath("/orders")).toBe("/orders");
    expect(getSafeRedirectPath("https://example.com")).toBe("/");
    expect(getSafeRedirectPath("//example.com")).toBe("/");
    expect(getSafeRedirectPath("/\\example.com")).toBe("/");
    expect(getSafeRedirectPath("/login")).toBe("/");
  });
});
