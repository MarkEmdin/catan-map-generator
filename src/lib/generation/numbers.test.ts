import { describe, expect, it } from "vitest";
import { assignNumbers } from "./numbers";
import { placeTerrain } from "./terrain";
import { cubeKey, neighbors } from "./coords";
import { LETTER_TO_NUMBER } from "../constants";

const RUNS = 200;
const ALL_LETTERS = "ABCDEFGHIJKLMNOPQR".split("");

describe("assignNumbers", () => {
  it("gives the desert no letter and no number token", () => {
    for (let i = 0; i < RUNS; i++) {
      const placements = placeTerrain({
        desertInCenter: i % 2 === 0,
        allowSameTerrainNeighbors: true,
      });
      const hexes = assignNumbers(placements);
      const desertHexes = hexes.filter((h) => h.terrainType === "desert");
      expect(desertHexes).toHaveLength(1);
      expect(desertHexes[0].letter).toBeNull();
      expect(desertHexes[0].numberToken).toBeNull();
    }
  });

  it("assigns every letter A-R exactly once across the 18 non-desert hexes", () => {
    for (let i = 0; i < RUNS; i++) {
      const placements = placeTerrain({
        desertInCenter: i % 2 === 0,
        allowSameTerrainNeighbors: true,
      });
      const hexes = assignNumbers(placements);
      const letters = hexes
        .map((h) => h.letter)
        .filter((l): l is string => l !== null)
        .sort();
      expect(letters).toEqual([...ALL_LETTERS].sort());
    }
  });

  it("maps each letter to its official number via LETTER_TO_NUMBER", () => {
    for (let i = 0; i < RUNS; i++) {
      const placements = placeTerrain({
        desertInCenter: i % 2 === 0,
        allowSameTerrainNeighbors: true,
      });
      const hexes = assignNumbers(placements);
      for (const hex of hexes) {
        if (hex.letter !== null) {
          expect(hex.numberToken).toBe(LETTER_TO_NUMBER[hex.letter]);
        }
      }
    }
  });

  it("never places two 6-or-8 number tokens on adjacent hexes", () => {
    for (let i = 0; i < RUNS; i++) {
      const placements = placeTerrain({
        desertInCenter: i % 2 === 0,
        allowSameTerrainNeighbors: true,
      });
      const hexes = assignNumbers(placements);
      const byKey = new Map(hexes.map((h) => [cubeKey(h.coordCube), h]));

      for (const hex of hexes) {
        if (hex.numberToken === 6 || hex.numberToken === 8) {
          for (const n of neighbors(hex.coordCube)) {
            const neighbor = byKey.get(cubeKey(n));
            if (neighbor && (neighbor.numberToken === 6 || neighbor.numberToken === 8)) {
              throw new Error(
                `6/8 adjacency violation: ${hex.letter}(${hex.numberToken}) at ${cubeKey(
                  hex.coordCube
                )} next to ${neighbor.letter}(${neighbor.numberToken})`
              );
            }
          }
        }
      }
    }
  });
});
