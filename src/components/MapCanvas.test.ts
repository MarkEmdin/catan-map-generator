import { describe, expect, it } from "vitest";
import { computeBounds } from "./MapCanvas";

describe("computeBounds", () => {
  it("wraps all given points with padding on every side", () => {
    const bounds = computeBounds([
      { x: -10, y: -5 },
      { x: 20, y: 15 },
    ]);
    expect(bounds.minX).toBeLessThan(-10);
    expect(bounds.minY).toBeLessThan(-5);
    expect(bounds.maxX).toBeGreaterThan(20);
    expect(bounds.maxY).toBeGreaterThan(15);
  });
});
