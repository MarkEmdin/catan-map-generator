import { describe, expect, it } from "vitest";
import { layoutPorts } from "./portLayout";
import { generatePorts } from "./ports";
import { BORDER_SEGMENTS_DEFAULT } from "../constants";

const HEX_SIZE = 50;

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
});
