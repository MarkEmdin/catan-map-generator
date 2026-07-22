import { PortSpec } from "../types";
import { SPIRAL_ORDER } from "../constants";
import { CubeCoord, Point, cubeToPixel, hexCorners } from "./coords";

export interface PortPlacement {
  type: string;
  x: number;
  y: number;
  coastPoints: Point[];
}

const OUTER_RING = SPIRAL_ORDER.slice(0, 12);
const PORT_DISTANCE_FACTOR = 0.9;

function sideHexes(side: number): [CubeCoord, CubeCoord] {
  return [OUTER_RING[side * 2], OUTER_RING[side * 2 + 1]];
}

function normalize(v: Point): Point {
  const length = Math.hypot(v.x, v.y);
  return { x: v.x / length, y: v.y / length };
}

// Direction from the board center through this hex's own center.
function outwardDirection(hex: CubeCoord, hexSize: number): Point {
  return normalize(cubeToPixel(hex, hexSize));
}

function coastalEdge(center: Point, hexSize: number, outward: Point): Point[] {
  const corners = hexCorners(center, hexSize);
  let bestIndex = 0;
  let bestDot = -Infinity;
  for (let i = 0; i < 6; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 6];
    const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const direction = normalize({ x: midpoint.x - center.x, y: midpoint.y - center.y });
    const dot = direction.x * outward.x + direction.y * outward.y;
    if (dot > bestDot) {
      bestDot = dot;
      bestIndex = i;
    }
  }
  return [corners[bestIndex], corners[(bestIndex + 1) % 6]];
}

function pointsEqual(a: Point, b: Point): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) < 1e-6;
}

// The edge of `center`'s hex that has exactly one vertex in common with its
// neighbor at `leanCenter` - i.e. "own vertex + vertex shared with that
// neighbor". A host and its ring-neighbor always share exactly one full
// edge (2 vertices); the wanted edge is one of the two edges adjacent to
// that shared edge (each touches exactly one of its 2 vertices). Of those
// two candidates, the one whose own hex-center-outward alignment is
// stronger is the coastal one - the other faces the board's interior.
//
// A blended-direction approach (nudging outwardDirection toward the
// neighbor) was tried first and works for hexes that sit *between* two
// neighbors, where the unnudged direction is an exact tie between two
// edges - but a hex that is itself a true geometric corner of the board
// has an unambiguous (non-tied) own-direction edge choice that a small
// nudge can't override, so it kept picking its own natural edge instead of
// leaning as asked. This picks the edge directly instead of nudging toward
// it, so it works for both cases.
function leaningEdge(center: Point, hexSize: number, leanCenter: Point): Point[] {
  const corners = hexCorners(center, hexSize);
  const leanCorners = hexCorners(leanCenter, hexSize);

  const sharedEdgeIndex = corners.findIndex((corner, i) => {
    const next = corners[(i + 1) % 6];
    return (
      leanCorners.some((c) => pointsEqual(c, corner)) &&
      leanCorners.some((c) => pointsEqual(c, next))
    );
  });

  const outward = normalize(center);
  const candidates = [(sharedEdgeIndex + 5) % 6, (sharedEdgeIndex + 1) % 6];
  let best = candidates[0];
  let bestDot = -Infinity;
  for (const i of candidates) {
    const a = corners[i];
    const b = corners[(i + 1) % 6];
    const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const direction = normalize({ x: midpoint.x - center.x, y: midpoint.y - center.y });
    const dot = direction.x * outward.x + direction.y * outward.y;
    if (dot > bestDot) {
      bestDot = dot;
      best = i;
    }
  }
  return [corners[best], corners[(best + 1) % 6]];
}

export interface SeaWedge {
  side: number;
  points: Point[];
}

const SEA_DEPTH_FACTOR = 1.6;

// Extends a point away from the board center (0,0) along its own radial
// direction, rather than by a single shared "outward" vector. The inner
// boundary isn't straight (corner hexes sit farther out than the middle
// hex), so translating every point by the same vector can push the
// "dipped-in" middle points into the neighboring wedge's territory.
// Radial scaling keeps each point's angular position fixed, so neighboring
// wedges - which share exact tip points - never cross into each other.
function pushRadially(point: Point, extraDistance: number): Point {
  const distance = Math.hypot(point.x, point.y);
  const scale = (distance + extraDistance) / distance;
  return { x: point.x * scale, y: point.y * scale };
}

// The single outermost vertex of a hex - used for the two "corner" hexes
// bounding a side. This doesn't depend on which side is asking: it's a
// fixed property of the hex, so two adjacent sides sharing a corner hex
// always agree on the exact same point, and their wedges tile with no gap
// or overlap.
function outermostVertex(center: Point, hexSize: number): Point {
  return hexCorners(center, hexSize).reduce((best, corner) =>
    Math.hypot(corner.x, corner.y) > Math.hypot(best.x, best.y) ? corner : best
  );
}

// coastalEdge()'s two points come back in the hex's own clockwise winding
// order, which has no relation to which end of the *side* they're nearer
// to - stitching them in as-is can walk the boundary backwards and produce
// a self-intersecting polygon. Reorder so the first point is nearer start.
function orderTowards(edge: Point[], start: Point): Point[] {
  const d0 = Math.hypot(edge[0].x - start.x, edge[0].y - start.y);
  const d1 = Math.hypot(edge[1].x - start.x, edge[1].y - start.y);
  return d0 <= d1 ? edge : [edge[1], edge[0]];
}

// One trapezoid-ish wedge of sea per board side (0-5, purely a geometric
// division of the coastline - independent of where ports actually are):
// the inner boundary runs from the outermost tip of the side's starting
// corner hex, along the middle hex's outward edge, to the outermost tip of
// the next corner hex (shared with the next side) - so adjacent wedges
// tile edge-to-edge. Used only to size the sea background in MapCanvas.
export function layoutSeaWedges(hexSize: number): SeaWedge[] {
  return Array.from({ length: 6 }, (_, side) => {
    const [cornerStart, middle] = sideHexes(side);
    const cornerEnd = OUTER_RING[(side * 2 + 2) % 12];

    const tipStart = outermostVertex(cubeToPixel(cornerStart, hexSize), hexSize);
    const tipEnd = outermostVertex(cubeToPixel(cornerEnd, hexSize), hexSize);
    const middleEdge = orderTowards(
      coastalEdge(
        cubeToPixel(middle, hexSize),
        hexSize,
        outwardDirection(middle, hexSize)
      ),
      tipStart
    );

    const inner = [tipStart, ...middleEdge, tipEnd];
    const depth = hexSize * SEA_DEPTH_FACTOR;
    const outer = inner.map((p) => pushRadially(p, depth)).reverse();

    return { side, points: [...inner, ...outer] };
  });
}

// Each port sits on its own outer-ring hex (outerRingIndex). A "corner"
// port (leanTowardIndex: null) uses that hex's own single most outward
// edge (both connector vertices belong only to it). Otherwise, the edge is
// picked leaning toward the given neighbor, so one connector vertex ends up
// being the one shared with that neighbor - matching a reference board's
// "own vertex + shared vertex with neighbor" port placement.
export function layoutPorts(ports: PortSpec[], hexSize: number): PortPlacement[] {
  return ports.map((port) => {
    const hex = OUTER_RING[port.outerRingIndex];
    const center = cubeToPixel(hex, hexSize);
    const coastPoints =
      port.leanTowardIndex === null
        ? coastalEdge(center, hexSize, outwardDirection(hex, hexSize))
        : leaningEdge(center, hexSize, cubeToPixel(OUTER_RING[port.leanTowardIndex], hexSize));

    const edgeMidpoint = {
      x: (coastPoints[0].x + coastPoints[1].x) / 2,
      y: (coastPoints[0].y + coastPoints[1].y) / 2,
    };
    const pushDirection = normalize({
      x: edgeMidpoint.x - center.x,
      y: edgeMidpoint.y - center.y,
    });

    return {
      type: port.type,
      x: edgeMidpoint.x + pushDirection.x * hexSize * PORT_DISTANCE_FACTOR,
      y: edgeMidpoint.y + pushDirection.y * hexSize * PORT_DISTANCE_FACTOR,
      coastPoints,
    };
  });
}
