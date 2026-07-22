import type { PortSpec } from "./types";

export const TERRAIN_SET = [
  { key: "hills", count: 3, resourceKey: "brick" },
  { key: "forest", count: 4, resourceKey: "wood" },
  { key: "mountains", count: 3, resourceKey: "ore" },
  { key: "fields", count: 4, resourceKey: "wheat" },
  { key: "pasture", count: 4, resourceKey: "sheep" },
  { key: "desert", count: 1, resourceKey: null },
] as const;

export const LETTER_TO_NUMBER: Record<string, number> = {
  A: 5,
  B: 2,
  C: 6,
  D: 3,
  E: 8,
  F: 10,
  G: 9,
  H: 12,
  I: 11,
  J: 4,
  K: 8,
  L: 10,
  M: 9,
  N: 4,
  O: 5,
  P: 6,
  Q: 3,
  R: 11,
};

// Fixed traversal order for the 3-4-5-4-3 board: outer ring (12) -> middle
// ring (6) -> center (1), both walked clockwise starting from the west hex
// in the same rotational sense. This specific rotation/direction pairing
// was chosen (see numbers.test.ts) to keep 6 and 8 apart for every possible
// desert position, given the current LETTER_TO_NUMBER mapping - if that
// mapping changes, re-verify (or re-search) this arrangement, since a
// different mapping can make a different rotation the safe one. Letters
// A-R are assigned to these positions in order, skipping whichever
// position ends up holding the desert.
export const SPIRAL_ORDER: Array<{ x: number; y: number; z: number }> = [
  { x: -2, y: 0, z: 2 },
  { x: -1, y: -1, z: 2 },
  { x: 0, y: -2, z: 2 },
  { x: 1, y: -2, z: 1 },
  { x: 2, y: -2, z: 0 },
  { x: 2, y: -1, z: -1 },
  { x: 2, y: 0, z: -2 },
  { x: 1, y: 1, z: -2 },
  { x: 0, y: 2, z: -2 },
  { x: -1, y: 2, z: -1 },
  { x: -2, y: 2, z: 0 },
  { x: -2, y: 1, z: 1 },
  { x: -1, y: 0, z: 1 },
  { x: 0, y: -1, z: 1 },
  { x: 1, y: -1, z: 0 },
  { x: 1, y: 0, z: -1 },
  { x: 0, y: 1, z: -1 },
  { x: -1, y: 1, z: 0 },
  { x: 0, y: 0, z: 0 },
];

// Confirmed against the physical set. 9 ports total: 4x generic (3:1) + 1
// each resource (2:1). Fully static - see src/lib/generation/portLayout.ts
// for how outerRingIndex/leanTowardIndex become pixel positions.
//
// Labeling the 12 outer-ring hexes A-L clockwise from the top (A = index 7,
// then B=6, C=5, D=4, E=3, F=2, G=1, H=0, I=11, J=10, K=9, L=8 - SPIRAL_ORDER
// index decreases going clockwise from A, wrapping after H=0 to I=11):
//
// ore: C + shared-with-B · 3:1: D (corner) · 3:1: E + shared-with-F
// wheat: G + shared-with-F · brick: H (corner) · sheep: I + shared-with-J
// wood: K + shared-with-J · 3:1: L (corner) · 3:1: A + shared-with-B
export const PORT_LAYOUT_DEFAULT: PortSpec[] = [
  { id: 1, type: "ore", outerRingIndex: 5, leanTowardIndex: 6 },
  { id: 2, type: "3:1", outerRingIndex: 4, leanTowardIndex: null },
  { id: 3, type: "3:1", outerRingIndex: 3, leanTowardIndex: 2 },
  { id: 4, type: "wheat", outerRingIndex: 1, leanTowardIndex: 2 },
  { id: 5, type: "brick", outerRingIndex: 0, leanTowardIndex: null },
  { id: 6, type: "sheep", outerRingIndex: 11, leanTowardIndex: 10 },
  { id: 7, type: "wood", outerRingIndex: 9, leanTowardIndex: 10 },
  { id: 8, type: "3:1", outerRingIndex: 8, leanTowardIndex: null },
  { id: 9, type: "3:1", outerRingIndex: 7, leanTowardIndex: 6 },
];
