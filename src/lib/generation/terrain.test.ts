import { describe, expect, it } from "vitest";
import { placeTerrain, TerrainPlacement } from "./terrain";
import { cubeKey, neighbors } from "./coords";
import { TERRAIN_SET } from "../constants";

const RUNS = 100;
// Zero-tolerance reshuffling takes ~2000 attempts on average (vs a handful
// for the other rules), so this run count is kept lower to keep the suite
// fast while still giving reasonable confidence in the invariant.
const STRICT_RUNS = 15;

function countByTerrain(placements: TerrainPlacement[]) {
  const counts: Record<string, number> = {};
  for (const p of placements) {
    counts[p.terrainType] = (counts[p.terrainType] ?? 0) + 1;
  }
  return counts;
}

function countSameTerrainViolations(placements: TerrainPlacement[]) {
  const byKey = new Map(placements.map((p) => [cubeKey(p.coordCube), p]));
  let violations = 0;
  for (const p of placements) {
    const sameTerrainNeighbors = neighbors(p.coordCube).filter((n) => {
      const neighbor = byKey.get(cubeKey(n));
      return neighbor !== undefined && neighbor.terrainType === p.terrainType;
    });
    if (sameTerrainNeighbors.length >= 1) violations++;
  }
  return violations;
}

describe("placeTerrain", () => {
  it("places exactly 19 hexes matching TERRAIN_SET counts", () => {
    for (let i = 0; i < RUNS; i++) {
      const placements = placeTerrain({
        desertInCenter: false,
        allowSameTerrainNeighbors: true,
      });
      expect(placements).toHaveLength(19);
      const counts = countByTerrain(placements);
      for (const terrain of TERRAIN_SET) {
        expect(counts[terrain.key]).toBe(terrain.count);
      }
    }
  });

  it("fixes the desert at the center when desertInCenter is true", () => {
    for (let i = 0; i < RUNS; i++) {
      const placements = placeTerrain({
        desertInCenter: true,
        allowSameTerrainNeighbors: true,
      });
      const center = placements.find((p) => cubeKey(p.coordCube) === "0,0,0");
      expect(center?.terrainType).toBe("desert");
    }
  });

  it("never produces same-terrain adjacency violations when disallowed", () => {
    for (let i = 0; i < STRICT_RUNS; i++) {
      const placements = placeTerrain({
        desertInCenter: i % 2 === 0,
        allowSameTerrainNeighbors: false,
      });
      expect(countSameTerrainViolations(placements)).toBe(0);
    }
  });
});
