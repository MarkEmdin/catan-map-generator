import { describe, expect, it } from "vitest";
import { layoutPorts } from "./portLayout";
import { PORT_LAYOUT_DEFAULT, SPIRAL_ORDER } from "../constants";
import { cubeToPixel, hexCorners } from "./coords";

const HEX_SIZE = 50;
const OUTER_RING = SPIRAL_ORDER.slice(0, 12);

describe("layoutPorts", () => {
  it("produces 9 port placements, each with 2 coast points", () => {
    const placements = layoutPorts(PORT_LAYOUT_DEFAULT, HEX_SIZE);
    expect(placements).toHaveLength(9);
    for (const p of placements) {
      expect(p.coastPoints).toHaveLength(2);
    }
  });

  it("places each port icon farther from the board center than its coast points", () => {
    const placements = layoutPorts(PORT_LAYOUT_DEFAULT, HEX_SIZE);
    for (const p of placements) {
      const iconDistance = Math.hypot(p.x, p.y);
      for (const coast of p.coastPoints) {
        const coastDistance = Math.hypot(coast.x, coast.y);
        expect(iconDistance).toBeGreaterThan(coastDistance);
      }
    }
  });

  it("gives coast points that sit on the outer hex ring (roughly one hexSize from a ring hex center)", () => {
    const placements = layoutPorts(PORT_LAYOUT_DEFAULT, HEX_SIZE);
    for (const p of placements) {
      const edgeLength = Math.hypot(
        p.coastPoints[0].x - p.coastPoints[1].x,
        p.coastPoints[0].y - p.coastPoints[1].y
      );
      expect(edgeLength).toBeCloseTo(HEX_SIZE, 0);
    }
  });

  it("gives a leaning port one coast point that's also a vertex of its leaned-toward neighbor", () => {
    const leaningPorts = PORT_LAYOUT_DEFAULT.filter((p) => p.leanTowardIndex !== null);
    expect(leaningPorts.length).toBeGreaterThan(0);
    for (const port of leaningPorts) {
      const [placement] = layoutPorts([port], HEX_SIZE);
      const neighborHex = OUTER_RING[port.leanTowardIndex!];
      const neighborCorners = hexCorners(cubeToPixel(neighborHex, HEX_SIZE), HEX_SIZE);
      const sharedCount = placement.coastPoints.filter((p) =>
        neighborCorners.some((c) => Math.hypot(c.x - p.x, c.y - p.y) < 1e-6)
      ).length;
      expect(sharedCount).toBe(1);
    }
  });

  it("gives a corner port two coast points that belong only to its own hex", () => {
    const cornerPorts = PORT_LAYOUT_DEFAULT.filter((p) => p.leanTowardIndex === null);
    expect(cornerPorts.length).toBeGreaterThan(0);
    for (const port of cornerPorts) {
      const [placement] = layoutPorts([port], HEX_SIZE);
      const neighborIndices = [
        (port.outerRingIndex + 11) % 12,
        (port.outerRingIndex + 1) % 12,
      ];
      for (const neighborIndex of neighborIndices) {
        const neighborCorners = hexCorners(
          cubeToPixel(OUTER_RING[neighborIndex], HEX_SIZE),
          HEX_SIZE
        );
        for (const coastPoint of placement.coastPoints) {
          const isShared = neighborCorners.some(
            (c) => Math.hypot(c.x - coastPoint.x, c.y - coastPoint.y) < 1e-6
          );
          expect(isShared).toBe(false);
        }
      }
    }
  });
});
