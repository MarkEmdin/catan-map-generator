import { describe, expect, it } from "vitest";
import { generatePorts } from "./ports";
import { PORT_LAYOUT_DEFAULT } from "../constants";

function countPortTypes(ports: ReturnType<typeof generatePorts>) {
  const counts: Record<string, number> = {};
  for (const port of ports) {
    counts[port.type] = (counts[port.type] ?? 0) + 1;
  }
  return counts;
}

const EXPECTED_PORT_COUNTS = { "3:1": 4, brick: 1, ore: 1, sheep: 1, wheat: 1, wood: 1 };

describe("generatePorts", () => {
  it("always returns the 9 ports in the same fixed layout - nothing is shuffled", () => {
    for (let i = 0; i < 10; i++) {
      expect(generatePorts()).toEqual(PORT_LAYOUT_DEFAULT);
    }
  });

  it("returns fresh objects rather than the shared constant, so callers can't mutate it", () => {
    const ports = generatePorts();
    expect(ports).not.toBe(PORT_LAYOUT_DEFAULT);
    ports[0].outerRingIndex = 99;
    expect(PORT_LAYOUT_DEFAULT[0].outerRingIndex).not.toBe(99);
  });

  it("totals 9 ports: 4x 3:1 + 1 of each resource", () => {
    const ports = generatePorts();
    expect(ports).toHaveLength(9);
    expect(countPortTypes(ports)).toEqual(EXPECTED_PORT_COUNTS);
  });

  it("uses each of the 12 outer-ring hexes at most once", () => {
    const ports = generatePorts();
    const indices = ports.map((p) => p.outerRingIndex);
    expect(new Set(indices).size).toBe(indices.length);
  });

  it("spreads the 9 ports as evenly as mathematically possible on the 12-hex coast", () => {
    // 3 empty hexes split the 12-hex ring into 3 arcs summing to 9 filled
    // hexes, so some arc is always >= 3 - the best achievable is exactly
    // three evenly-spaced runs of 3. Regression guard: if an edit to
    // PORT_LAYOUT_DEFAULT makes some run longer (e.g. 4, from two hosts
    // landing next to each other), this fails.
    const hostIndices = new Set(generatePorts().map((p) => p.outerRingIndex));
    let longestRun = 0;
    let currentRun = 0;
    for (let i = 0; i < 24; i++) {
      if (hostIndices.has(i % 12)) {
        currentRun++;
        longestRun = Math.max(longestRun, currentRun);
      } else {
        currentRun = 0;
      }
    }
    expect(longestRun).toBe(3);
  });
});
