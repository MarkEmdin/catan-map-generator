import { describe, expect, it } from "vitest";
import { generatePorts } from "./ports";
import { BORDER_SEGMENTS_DEFAULT } from "../constants";

const RUNS = 100;

function countPortTypes(segments: ReturnType<typeof generatePorts>) {
  const counts: Record<string, number> = {};
  for (const segment of segments) {
    for (const port of segment.fixedPorts) {
      counts[port.type] = (counts[port.type] ?? 0) + 1;
    }
  }
  return counts;
}

const EXPECTED_PORT_COUNTS = { "3:1": 4, brick: 1, ore: 1, sheep: 1, wheat: 1, wood: 1 };

describe("generatePorts", () => {
  it("returns all 6 segments with position a permutation of 0-5", () => {
    for (let i = 0; i < RUNS; i++) {
      const segments = generatePorts();
      expect(segments).toHaveLength(6);
      expect(segments.map((s) => s.position).sort()).toEqual([0, 1, 2, 3, 4, 5]);
      expect(segments.map((s) => s.id).sort()).toEqual(
        BORDER_SEGMENTS_DEFAULT.map((s) => s.id).sort()
      );
    }
  });

  it("keeps each segment's own port composition fixed - only segment order shuffles", () => {
    const byId = new Map(BORDER_SEGMENTS_DEFAULT.map((s) => [s.id, s.fixedPorts]));
    for (let i = 0; i < RUNS; i++) {
      const segments = generatePorts();
      for (const segment of segments) {
        expect(segment.fixedPorts).toEqual(byId.get(segment.id));
      }
    }
  });

  it("always totals 9 ports: 4x 3:1 + 1 of each resource", () => {
    for (let i = 0; i < RUNS; i++) {
      expect(countPortTypes(generatePorts())).toEqual(EXPECTED_PORT_COUNTS);
    }
  });
});
