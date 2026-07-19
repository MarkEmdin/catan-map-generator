import { BorderSegment } from "../types";
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

function outwardDirection(side: number, hexSize: number): Point {
  const [a, b] = sideHexes(side);
  const pa = cubeToPixel(a, hexSize);
  const pb = cubeToPixel(b, hexSize);
  return normalize({ x: pa.x + pb.x, y: pa.y + pb.y });
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

export interface SegmentPortLayout {
  segmentId: number;
  ports: PortPlacement[];
}

export interface SeaWedge {
  segmentId: number;
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
// bounding a side. Unlike coastalEdge(), this doesn't depend on which
// side's outward direction is asking: it's a fixed property of the hex, so
// two adjacent sides sharing a corner hex always agree on the exact same
// point, and their wedges tile with no gap or overlap.
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

// One trapezoid-ish wedge of sea per border segment: the inner boundary
// runs from the outermost tip of this side's starting corner hex, along
// the middle hex's outward edge, to the outermost tip of the next corner
// hex (shared with the next side) - so adjacent segments tile edge-to-edge.
export function layoutSeaWedges(
  segments: BorderSegment[],
  hexSize: number
): SeaWedge[] {
  return segments.map((segment) => {
    const side = segment.position;
    const [cornerStart, middle] = sideHexes(side);
    const cornerEnd = OUTER_RING[(side * 2 + 2) % 12];
    const outward = outwardDirection(side, hexSize);

    const tipStart = outermostVertex(cubeToPixel(cornerStart, hexSize), hexSize);
    const tipEnd = outermostVertex(cubeToPixel(cornerEnd, hexSize), hexSize);
    const middleEdge = orderTowards(
      coastalEdge(cubeToPixel(middle, hexSize), hexSize, outward),
      tipStart
    );

    const inner = [tipStart, ...middleEdge, tipEnd];
    const depth = hexSize * SEA_DEPTH_FACTOR;
    const outer = inner.map((p) => pushRadially(p, depth)).reverse();

    return { segmentId: segment.id, points: [...inner, ...outer] };
  });
}

export function layoutPorts(
  segments: BorderSegment[],
  hexSize: number
): SegmentPortLayout[] {
  return segments.map((segment) => {
    const hexes = sideHexes(segment.position);
    const outward = outwardDirection(segment.position, hexSize);

    const ports = segment.fixedPorts.map((port) => {
      const hex = hexes[port.edgeOffsetInSegment];
      const center = cubeToPixel(hex, hexSize);
      const coastPoints = coastalEdge(center, hexSize, outward);
      const edgeMidpoint = {
        x: (coastPoints[0].x + coastPoints[1].x) / 2,
        y: (coastPoints[0].y + coastPoints[1].y) / 2,
      };

      return {
        type: port.type,
        x: edgeMidpoint.x + outward.x * hexSize * PORT_DISTANCE_FACTOR,
        y: edgeMidpoint.y + outward.y * hexSize * PORT_DISTANCE_FACTOR,
        coastPoints,
      };
    });

    return { segmentId: segment.id, ports };
  });
}
