export interface GenerationConfig {
  language: "ru" | "en" | "de";
  desertInCenter: boolean;
  allowSameTerrainNeighbors: boolean;
  allowFullyRandomPorts: boolean;
}

export interface HexTile {
  id: string;
  coordCube: { x: number; y: number; z: number };
  terrainType: string;
  numberToken: number | null;
  letter: string | null;
}

export interface BorderSegment {
  id: number;
  position: number;
  fixedPorts: Array<{
    type: string;
    edgeOffsetInSegment: number;
  }>;
}
