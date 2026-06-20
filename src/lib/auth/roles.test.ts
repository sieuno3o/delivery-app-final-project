import { describe, expect, it } from "vitest";

import { getConfiguredAdminEmails, resolveUserRole } from "./roles";

describe("관리자 이메일 역할 판정", () => {
  it("쉼표 목록의 공백과 대소문자를 정규화한다", () => {
    const emails = getConfiguredAdminEmails(
      " Admin@Example.com, owner@example.com ",
    );

    expect(emails.has("admin@example.com")).toBe(true);
    expect(emails.has("owner@example.com")).toBe(true);
  });

  it("설정된 이메일만 관리자 역할을 부여한다", () => {
    expect(resolveUserRole("ADMIN@example.com", "admin@example.com")).toBe(
      "admin",
    );
    expect(resolveUserRole("user@example.com", "admin@example.com")).toBe(
      "customer",
    );
  });
});
