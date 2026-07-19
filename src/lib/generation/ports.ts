import { BORDER_SEGMENTS_DEFAULT } from "../constants";
import { BorderSegment } from "../types";
import { shuffle } from "./shuffle";

function shuffleSegmentOrder(segments: BorderSegment[]): BorderSegment[] {
  return shuffle(segments).map((segment, position) => ({
    ...segment,
    position,
  }));
}

function shufflePortTypes(segments: BorderSegment[]): BorderSegment[] {
  const shuffledTypes = shuffle(segments.flatMap((s) => s.fixedPorts.map((p) => p.type)));
  let cursor = 0;
  return segments.map((segment) => ({
    ...segment,
    fixedPorts: segment.fixedPorts.map((port) => ({
      ...port,
      type: shuffledTypes[cursor++],
    })),
  }));
}

export function generatePorts(config: {
  allowFullyRandomPorts: boolean;
}): BorderSegment[] {
  const segments = shuffleSegmentOrder(BORDER_SEGMENTS_DEFAULT);
  return config.allowFullyRandomPorts ? shufflePortTypes(segments) : segments;
}
