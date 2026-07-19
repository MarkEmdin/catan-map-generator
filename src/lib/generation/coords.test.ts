import { describe, expect, it } from "vitest";
import { cubeAdd, cubeEquals, cubeKey, cubeToPixel, neighbors } from "./coords";

describe("cubeKey / cubeEquals", () => {
  it("produces a stable, unique key per coordinate", () => {
    expect(cubeKey({ x: 1, y: -1, z: 0 })).toBe("1,-1,0");
    expect(cubeKey({ x: 0, y: 0, z: 0 })).toBe("0,0,0");
  });

  it("treats coordinates with equal components as equal", () => {
    expect(cubeEquals({ x: 1, y: -1, z: 0 }, { x: 1, y: -1, z: 0 })).toBe(true);
    expect(cubeEquals({ x: 1, y: -1, z: 0 }, { x: 1, y: 0, z: -1 })).toBe(false);
  });
});

describe("cubeAdd", () => {
  it("adds component-wise", () => {
    expect(cubeAdd({ x: 1, y: -1, z: 0 }, { x: -1, y: 0, z: 1 })).toEqual({
      x: 0,
      y: -1,
      z: 1,
    });
  });
});

describe("neighbors", () => {
  it("returns 6 neighbors, each a valid cube coordinate (sums to 0)", () => {
    const result = neighbors({ x: 0, y: 0, z: 0 });
    expect(result).toHaveLength(6);
    for (const n of result) {
      expect(n.x + n.y + n.z).toBe(0);
    }
  });

  it("is symmetric: if B is a neighbor of A, A is a neighbor of B", () => {
    const center = { x: 1, y: -2, z: 1 };
    for (const n of neighbors(center)) {
      const back = neighbors(n);
      expect(back.some((c) => cubeEquals(c, center))).toBe(true);
    }
  });

  it("produces 6 distinct neighbors with no duplicates", () => {
    const keys = neighbors({ x: 0, y: 0, z: 0 }).map(cubeKey);
    expect(new Set(keys).size).toBe(6);
  });
});

describe("cubeToPixel", () => {
  it("maps the origin to the pixel origin", () => {
    expect(cubeToPixel({ x: 0, y: 0, z: 0 }, 10)).toEqual({ x: 0, y: 0 });
  });

  it("scales linearly with hexSize", () => {
    const cube = { x: 1, y: -1, z: 0 };
    const small = cubeToPixel(cube, 1);
    const big = cubeToPixel(cube, 10);
    expect(big.x).toBeCloseTo(small.x * 10);
    expect(big.y).toBeCloseTo(small.y * 10);
  });
});
