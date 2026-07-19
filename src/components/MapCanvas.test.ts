import { describe, expect, it } from "vitest";
import { computeViewBox } from "./MapCanvas";

describe("computeViewBox", () => {
  it("wraps all given points with padding on every side", () => {
    const viewBox = computeViewBox([
      { x: -10, y: -5 },
      { x: 20, y: 15 },
    ]);
    const [minX, minY, width, height] = viewBox.split(" ").map(Number);
    expect(minX).toBeLessThan(-10);
    expect(minY).toBeLessThan(-5);
    expect(minX + width).toBeGreaterThan(20);
    expect(minY + height).toBeGreaterThan(15);
  });
});
