export interface GenerationConfig {
  language: "ru" | "en" | "de";
  desertInCenter: boolean;
  allowSameTerrainNeighbors: boolean;
}

export interface HexTile {
  id: string;
  coordCube: { x: number; y: number; z: number };
  terrainType: string;
  numberToken: number | null;
  letter: string | null;
}

export interface PortSpec {
  id: number;
  type: string;
  // Index (0-11) into the 12 outer-ring hexes - the hex this port sits on.
  outerRingIndex: number;
  // Index (0-11) of the neighboring outer-ring hex this port's edge leans
  // toward, so one of its 2 connector vertices is the one shared with that
  // neighbor. null means a "corner" port: both connector vertices belong
  // only to outerRingIndex's own hex (its single most outward edge).
  leanTowardIndex: number | null;
}
