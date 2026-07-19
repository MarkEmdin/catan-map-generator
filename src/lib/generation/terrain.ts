import { TERRAIN_SET, SPIRAL_ORDER } from "../constants";
import { CubeCoord, cubeKey, neighbors } from "./coords";
import { shuffle } from "./shuffle";

export interface TerrainPlacement {
  coordCube: CubeCoord;
  terrainType: string;
}

const CENTER: CubeCoord = { x: 0, y: 0, z: 0 };
// Requiring zero same-terrain neighbors (rather than tolerating one) is a
// much rarer outcome of a full random reshuffle - empirically ~2000
// attempts on average, up to ~13000 in testing - but each attempt is cheap
// (O(19) work), so even the worst case stays well under 100ms.
const MAX_RESHUFFLE_ATTEMPTS = 50000;

function buildTerrainDeck(): string[] {
  const deck: string[] = [];
  for (const terrain of TERRAIN_SET) {
    for (let i = 0; i < terrain.count; i++) {
      deck.push(terrain.key);
    }
  }
  return deck;
}

function hasSameTerrainViolation(placements: TerrainPlacement[]): boolean {
  const byKey = new Map(placements.map((p) => [cubeKey(p.coordCube), p]));
  return placements.some((placement) => {
    const sameTerrainNeighbors = neighbors(placement.coordCube).filter((n) => {
      const neighbor = byKey.get(cubeKey(n));
      return neighbor !== undefined && neighbor.terrainType === placement.terrainType;
    });
    return sameTerrainNeighbors.length >= 1;
  });
}

function buildPlacements(desertInCenter: boolean): TerrainPlacement[] {
  const deck = buildTerrainDeck();

  if (desertInCenter) {
    const rest = shuffle(deck.filter((terrainType) => terrainType !== "desert"));
    const otherPositions = SPIRAL_ORDER.filter(
      (coord) => cubeKey(coord) !== cubeKey(CENTER)
    );
    return [
      { coordCube: CENTER, terrainType: "desert" },
      ...otherPositions.map((coordCube, i) => ({
        coordCube,
        terrainType: rest[i],
      })),
    ];
  }

  const shuffled = shuffle(deck);
  return SPIRAL_ORDER.map((coordCube, i) => ({
    coordCube,
    terrainType: shuffled[i],
  }));
}

export function placeTerrain(config: {
  desertInCenter: boolean;
  allowSameTerrainNeighbors: boolean;
}): TerrainPlacement[] {
  let placements = buildPlacements(config.desertInCenter);

  if (config.allowSameTerrainNeighbors) {
    return placements;
  }

  let attempts = 1;
  while (hasSameTerrainViolation(placements) && attempts < MAX_RESHUFFLE_ATTEMPTS) {
    placements = buildPlacements(config.desertInCenter);
    attempts++;
  }

  return placements;
}
