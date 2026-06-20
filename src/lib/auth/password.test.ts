import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it(
    "평문 대신 bcrypt 해시를 저장하고 검증한다",
    async () => {
      const password = "Password123";
      const passwordHash = await hashPassword(password);

      expect(passwordHash).not.toBe(password);
      await expect(verifyPassword(password, passwordHash)).resolves.toBe(true);
      await expect(
        verifyPassword("WrongPassword1", passwordHash),
      ).resolves.toBe(false);
    },
    15_000,
  );
});
