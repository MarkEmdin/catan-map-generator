import { BORDER_SEGMENTS_DEFAULT } from "../constants";
import { BorderSegment } from "../types";
import { shuffle } from "./shuffle";

export function generatePorts(): BorderSegment[] {
  return shuffle(BORDER_SEGMENTS_DEFAULT).map((segment, position) => ({
    ...segment,
    position,
  }));
}
