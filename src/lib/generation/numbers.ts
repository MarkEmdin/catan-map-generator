import { LETTER_TO_NUMBER, SPIRAL_ORDER } from "../constants";
import { HexTile } from "../types";
import { TerrainPlacement } from "./terrain";
import { cubeKey } from "./coords";

const LETTERS = "ABCDEFGHIJKLMNOPQR".split("");

export function assignNumbers(placements: TerrainPlacement[]): HexTile[] {
  const byKey = new Map(placements.map((p) => [cubeKey(p.coordCube), p]));

  const spiralWithoutDesert = SPIRAL_ORDER.filter((coord) => {
    const placement = byKey.get(cubeKey(coord));
    return placement !== undefined && placement.terrainType !== "desert";
  });

  const letterByKey = new Map<string, string>();
  spiralWithoutDesert.forEach((coord, i) => {
    letterByKey.set(cubeKey(coord), LETTERS[i]);
  });

  return placements.map((placement) => {
    const key = cubeKey(placement.coordCube);
    const letter = letterByKey.get(key) ?? null;
    return {
      id: key,
      coordCube: placement.coordCube,
      terrainType: placement.terrainType,
      numberToken: letter !== null ? LETTER_TO_NUMBER[letter] : null,
      letter,
    };
  });
}
