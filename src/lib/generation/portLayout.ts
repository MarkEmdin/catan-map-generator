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
