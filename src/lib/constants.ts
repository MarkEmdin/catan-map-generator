import type { BorderSegment } from "./types";

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
  O: 11,
  P: 3,
  Q: 5,
  R: 6,
};

// Fixed traversal order for the 3-4-5-4-3 board: outer ring (12) -> middle
// ring (6) -> center (1). Both rings are walked clockwise starting from the
// west hex, but the middle ring is walked in the opposite rotational sense
// from the outer ring - with matching rotation, letters mapped to 6 and 8
// (C, E, K, R) can end up adjacent across the outer/middle boundary
// depending on where the desert lands; this arrangement was verified
// (see numbers.test.ts) to keep 6 and 8 apart for every possible desert
// position. Letters A-R are assigned to these positions in order, skipping
// whichever position ends up holding the desert.
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
  { x: -1, y: 1, z: 0 },
  { x: 0, y: 1, z: -1 },
  { x: 1, y: 0, z: -1 },
  { x: 1, y: -1, z: 0 },
  { x: 0, y: -1, z: 1 },
  { x: -1, y: 0, z: 1 },
  { x: 0, y: 0, z: 0 },
];

// Placeholder composition, pending confirmation against a physical set (see
// CLAUDE.md "Known limitations"). 9 ports total: 4x generic (3:1) + 1 each
// resource (2:1), spread across the 6 frame segments. Only the segment
// *order* is randomized at generation time; each segment's own port
// composition is fixed.
export const BORDER_SEGMENTS_DEFAULT: BorderSegment[] = [
  {
    id: 1,
    position: 0,
    fixedPorts: [
      { type: "3:1", edgeOffsetInSegment: 0 },
      { type: "wheat", edgeOffsetInSegment: 1 },
    ],
  },
  {
    id: 2,
    position: 1,
    fixedPorts: [{ type: "brick", edgeOffsetInSegment: 0 }],
  },
  {
    id: 3,
    position: 2,
    fixedPorts: [
      { type: "3:1", edgeOffsetInSegment: 0 },
      { type: "ore", edgeOffsetInSegment: 1 },
    ],
  },
  {
    id: 4,
    position: 3,
    fixedPorts: [{ type: "sheep", edgeOffsetInSegment: 0 }],
  },
  {
    id: 5,
    position: 4,
    fixedPorts: [
      { type: "3:1", edgeOffsetInSegment: 0 },
      { type: "wood", edgeOffsetInSegment: 1 },
    ],
  },
  {
    id: 6,
    position: 5,
    fixedPorts: [{ type: "3:1", edgeOffsetInSegment: 0 }],
  },
];
