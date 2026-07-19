import { describe, expect, it } from "vitest";
import { rollProbabilityPercent } from "./NumberToken";

describe("rollProbabilityPercent", () => {
  it("matches the known two-dice probability distribution", () => {
    expect(rollProbabilityPercent(2)).toBeCloseTo((1 / 36) * 100);
    expect(rollProbabilityPercent(3)).toBeCloseTo((2 / 36) * 100);
    expect(rollProbabilityPercent(4)).toBeCloseTo((3 / 36) * 100);
    expect(rollProbabilityPercent(5)).toBeCloseTo((4 / 36) * 100);
    expect(rollProbabilityPercent(6)).toBeCloseTo((5 / 36) * 100);
    expect(rollProbabilityPercent(8)).toBeCloseTo((5 / 36) * 100);
    expect(rollProbabilityPercent(9)).toBeCloseTo((4 / 36) * 100);
    expect(rollProbabilityPercent(10)).toBeCloseTo((3 / 36) * 100);
    expect(rollProbabilityPercent(11)).toBeCloseTo((2 / 36) * 100);
    expect(rollProbabilityPercent(12)).toBeCloseTo((1 / 36) * 100);
  });

  it("is symmetric around 7", () => {
    for (let n = 2; n <= 6; n++) {
      expect(rollProbabilityPercent(n)).toBeCloseTo(rollProbabilityPercent(14 - n));
    }
  });
});
