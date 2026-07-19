import { describe, expect, it } from "vitest";
import { hexPoints } from "./HexTile";

function parsePoints(points: string): Array<[number, number]> {
  return points.split(" ").map((pair) => {
    const [x, y] = pair.split(",").map(Number);
    return [x, y];
  });
}

describe("hexPoints", () => {
  it("produces 6 corners at the given radius from center", () => {
    const corners = parsePoints(hexPoints(50));
    expect(corners).toHaveLength(6);
    for (const [x, y] of corners) {
      expect(Math.hypot(x, y)).toBeCloseTo(50);
    }
  });

  it("is pointy-top: has a vertex directly above and below center, none directly left/right", () => {
    const corners = parsePoints(hexPoints(50));
    const topVertex = corners.find(([x, y]) => Math.abs(x) < 1e-6 && y < 0);
    const bottomVertex = corners.find(([x, y]) => Math.abs(x) < 1e-6 && y > 0);
    expect(topVertex).toBeDefined();
    expect(bottomVertex).toBeDefined();
    for (const [x, y] of corners) {
      expect(Math.abs(y) < 1e-6 && Math.abs(x) > 1e-6).toBe(false);
    }
  });
});
