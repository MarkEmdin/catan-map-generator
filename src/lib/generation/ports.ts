import { BORDER_SEGMENTS_DEFAULT } from "../constants";
import { BorderSegment } from "../types";
import { shuffle } from "./shuffle";

// Each side's ports all sit on that side's own single hex (see
// portLayout.ts) which is never adjacent to a neighboring side's hex, so
// unlike an earlier version of this function, no reshuffle-until-valid
// step is needed here to keep segments' ports apart from each other.
export function generatePorts(): BorderSegment[] {
  return shuffle(BORDER_SEGMENTS_DEFAULT).map((segment, position) => ({
    ...segment,
    position,
  }));
}
