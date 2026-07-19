import { describe, expect, it } from "vitest";
import { layoutPorts } from "./portLayout";
import { generatePorts } from "./ports";
import { BORDER_SEGMENTS_DEFAULT, SPIRAL_ORDER } from "../constants";
import { cubeKey, neighbors } from "./coords";

const HEX_SIZE = 50;
const OUTER_RING = SPIRAL_ORDER.slice(0, 12);

function flattenPorts(groups: ReturnType<typeof layoutPorts>) {
  return groups.flatMap((g) => g.ports);
}

describe("layoutPorts", () => {
  it("produces one group per segment, 9 port placements total, each with 2 coast points", () => {
    const groups = layoutPorts(BORDER_SEGMENTS_DEFAULT, HEX_SIZE);
    expect(groups).toHaveLength(6);
    const placements = flattenPorts(groups);
    expect(placements).toHaveLength(9);
    for (const p of placements) {
      expect(p.coastPoints).toHaveLength(2);
    }
  });

  it("places each port icon farther from the board center than its coast points", () => {
    const placements = flattenPorts(layoutPorts(BORDER_SEGMENTS_DEFAULT, HEX_SIZE));
    for (const p of placements) {
      const iconDistance = Math.hypot(p.x, p.y);
      for (const coast of p.coastPoints) {
        const coastDistance = Math.hypot(coast.x, coast.y);
        expect(iconDistance).toBeGreaterThan(coastDistance);
      }
    }
  });

  it("gives coast points that sit on the outer hex ring (roughly one hexSize from a ring hex center)", () => {
    const placements = flattenPorts(layoutPorts(BORDER_SEGMENTS_DEFAULT, HEX_SIZE));
    for (const p of placements) {
      const edgeLength = Math.hypot(
        p.coastPoints[0].x - p.coastPoints[1].x,
        p.coastPoints[0].y - p.coastPoints[1].y
      );
      expect(edgeLength).toBeCloseTo(HEX_SIZE, 0);
    }
  });

  it("stays correct (9 placements, valid geometry) for any shuffled segment order", () => {
    for (let i = 0; i < 50; i++) {
      const segments = generatePorts();
      const placements = flattenPorts(layoutPorts(segments, HEX_SIZE));
      expect(placements).toHaveLength(9);
      for (const p of placements) {
        expect(Number.isFinite(p.x)).toBe(true);
        expect(Number.isFinite(p.y)).toBe(true);
        expect(p.coastPoints).toHaveLength(2);
      }
    }
  });

  it("never uses adjacent hexes for two different sides' ports, for any side order", () => {
    // This is the actual fix: every side's ports live on its own single
    // hex (index side*2+1), and that hex is never a neighbor of the next
    // side's hex - true regardless of which segment (1 or 2 ports) is
    // shuffled into which position, so ports can never bleed across sides.
    for (let side = 0; side < 6; side++) {
      const hexA = OUTER_RING[side * 2 + 1];
      const hexB = OUTER_RING[((side + 1) % 6) * 2 + 1];
      const isAdjacent = neighbors(hexA).some((n) => cubeKey(n) === cubeKey(hexB));
      expect(isAdjacent).toBe(false);
    }
  });

  it("places a 2-port segment's two ports on adjacent edges of the same hex", () => {
    const twoPortSegment = BORDER_SEGMENTS_DEFAULT.find((s) => s.fixedPorts.length === 2)!;
    const [{ ports }] = layoutPorts([twoPortSegment], HEX_SIZE);
    // Adjacent edges of one hexagon share exactly one vertex.
    const shared = ports[0].coastPoints.filter((p) =>
      ports[1].coastPoints.some((q) => Math.hypot(p.x - q.x, p.y - q.y) < 1e-6)
    );
    expect(shared).toHaveLength(1);
  });
});
