import { describe, expect, it } from "vitest";

import { formatWon } from "./currency";

describe("formatWon", () => {
  it("원화 금액을 소수점 없이 표시한다", () => {
    expect(formatWon(12500)).toBe("₩12,500");
  });

  it("유한하지 않은 값은 거부한다", () => {
    expect(() => formatWon(Number.NaN)).toThrow(TypeError);
  });
});
