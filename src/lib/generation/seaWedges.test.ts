import { describe, expect, it } from "vitest";
import { layoutSeaWedges } from "./portLayout";

const HEX_SIZE = 50;

function closeTo(a: { x: number; y: number }, b: { x: number; y: number }) {
  expect(a.x).toBeCloseTo(b.x, 5);
  expect(a.y).toBeCloseTo(b.y, 5);
}

type Pt = { x: number; y: number };

function orientation(p: Pt, q: Pt, r: Pt): number {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (Math.abs(val) < 1e-9) return 0;
  return val > 0 ? 1 : 2;
}

function onSegment(p: Pt, q: Pt, r: Pt): boolean {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
}

function segmentsIntersect(p1: Pt, q1: Pt, p2: Pt, q2: Pt): boolean {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;
  return false;
}

// Rejects self-intersecting (bowtie/star) polygons - the exact shape a
// mis-ordered edge produced before the orderTowards() fix.
function isSimplePolygon(points: Pt[]): boolean {
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const a1 = points[i];
    const a2 = points[(i + 1) % n];
    for (let j = i + 1; j < n; j++) {
      const areAdjacent = j === i + 1 || (i === 0 && j === n - 1);
      if (areAdjacent) continue;
      const b1 = points[j];
      const b2 = points[(j + 1) % n];
      if (segmentsIntersect(a1, a2, b1, b2)) return false;
    }
  }
  return true;
}

describe("layoutSeaWedges", () => {
  it("produces one 8-point wedge per segment (4 inner + 4 outer)", () => {
    const wedges = layoutSeaWedges(HEX_SIZE);
    expect(wedges).toHaveLength(6);
    for (const wedge of wedges) {
      expect(wedge.points).toHaveLength(8);
      for (const p of wedge.points) {
        expect(Number.isFinite(p.x)).toBe(true);
        expect(Number.isFinite(p.y)).toBe(true);
      }
    }
  });

  it("tiles edge-to-edge: each wedge's last inner point matches the next wedge's first", () => {
    const wedges = layoutSeaWedges(HEX_SIZE);
    for (let s = 0; s < 6; s++) {
      const current = wedges[s].points;
      const next = wedges[(s + 1) % 6].points;
      // inner boundary is points[0..3] (tipStart, edge0, edge1, tipEnd).
      closeTo(current[3], next[0]);
    }
  });

  it("is a simple (non-self-intersecting) polygon for every segment", () => {
    const wedges = layoutSeaWedges(HEX_SIZE);
    for (const wedge of wedges) {
      expect(isSimplePolygon(wedge.points)).toBe(true);
    }
  });

  it("walks the inner coastline in a single angular direction, without doubling back", () => {
    // A backwards jump (e.g. an unordered edge) produces a spiky,
    // self-crossing-looking wedge even when technically non-self-intersecting.
    // Cross product sign (not raw atan2) avoids false positives at the
    // +/-180 degree wraparound.
    const wedges = layoutSeaWedges(HEX_SIZE);
    for (const wedge of wedges) {
      const inner = wedge.points.slice(0, 4);
      const turns = [];
      for (let i = 1; i < inner.length; i++) {
        const a = inner[i - 1];
        const b = inner[i];
        turns.push(a.x * b.y - a.y * b.x);
      }
      const allSameSign = turns.every((t) => t < 0) || turns.every((t) => t > 0);
      expect(allSameSign).toBe(true);
    }
  });

  it("confines every point to its own angular sector, so wedges never overlap a neighbor", () => {
    // Pushing points outward along one shared direction (instead of
    // radially from the board center) could shift a point's angle past its
    // own tip and into the neighboring wedge's sector. Radial pushing
    // can't do that, since it doesn't change any point's angle at all -
    // verify that invariant directly rather than trusting the intent.
    const cross = (a: Pt, b: Pt) => a.x * b.y - a.y * b.x;
    const wedges = layoutSeaWedges(HEX_SIZE);
    for (const wedge of wedges) {
      const tipStart = wedge.points[0];
      const tipEnd = wedge.points[3];
      for (const p of wedge.points) {
        expect(cross(tipStart, p)).toBeLessThanOrEqual(1e-6);
        expect(cross(p, tipEnd)).toBeLessThanOrEqual(1e-6);
      }
    }
  });

  it("pushes the outer boundary strictly farther from center than the coastline", () => {
    const wedges = layoutSeaWedges(HEX_SIZE);
    for (const wedge of wedges) {
      const inner = wedge.points.slice(0, 4);
      const outer = wedge.points.slice(4).reverse();
      inner.forEach((innerPoint, i) => {
        const outerPoint = outer[i];
        expect(Math.hypot(outerPoint.x, outerPoint.y)).toBeGreaterThan(
          Math.hypot(innerPoint.x, innerPoint.y)
        );
      });
    }
  });
});
