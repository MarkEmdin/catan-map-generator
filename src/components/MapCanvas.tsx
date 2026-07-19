import { HexTile as HexTileData, BorderSegment as BorderSegmentData } from "@/lib/types";
import { cubeToPixel, hexCorners, Point } from "@/lib/generation/coords";
import { layoutPorts, layoutSeaWedges } from "@/lib/generation/portLayout";
import { HexTile } from "./HexTile";
import { BorderSegment } from "./BorderSegment";

const PORT_MARKER_RADIUS = 16;
const PADDING = 24;

interface MapCanvasProps {
  hexes: HexTileData[];
  segments: BorderSegmentData[];
  hexSize?: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function computeBounds(points: Point[]): Bounds {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    minX: Math.min(...xs) - PADDING,
    minY: Math.min(...ys) - PADDING,
    maxX: Math.max(...xs) + PADDING,
    maxY: Math.max(...ys) + PADDING,
  };
}

export function MapCanvas({ hexes, segments, hexSize = 50 }: MapCanvasProps) {
  const hexPositions = hexes.map((hex) => ({
    hex,
    pixel: cubeToPixel(hex.coordCube, hexSize),
  }));
  const portGroups = layoutPorts(segments, hexSize);
  const seaWedges = layoutSeaWedges(segments, hexSize);

  const boundingPoints = [
    ...hexPositions.flatMap(({ pixel }) => hexCorners(pixel, hexSize)),
    ...seaWedges.flatMap((wedge) => wedge.points),
    ...portGroups.flatMap((group) =>
      group.ports.flatMap((port) => [
        { x: port.x - PORT_MARKER_RADIUS, y: port.y - PORT_MARKER_RADIUS },
        { x: port.x + PORT_MARKER_RADIUS, y: port.y + PORT_MARKER_RADIUS },
        ...port.coastPoints,
      ])
    ),
  ];

  const bounds = computeBounds(boundingPoints);
  const viewBox = `${bounds.minX} ${bounds.minY} ${bounds.maxX - bounds.minX} ${
    bounds.maxY - bounds.minY
  }`;

  return (
    <svg
      viewBox={viewBox}
      width="100%"
      height="auto"
      role="img"
      aria-label="Catan board map"
    >
      <rect
        x={bounds.minX}
        y={bounds.minY}
        width={bounds.maxX - bounds.minX}
        height={bounds.maxY - bounds.minY}
        fill="var(--sea-light)"
      />
      {seaWedges.map((wedge) => {
        // wedge.points[0] (tipStart) -> points[7] (its pushed-out
        // counterpart) is the radial seam shared with the previous
        // segment - one per wedge covers all 6 dividers with no overlap.
        const from = wedge.points[0];
        const to = wedge.points[7];
        return (
          <line
            key={`seam-${wedge.segmentId}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })}
      {hexPositions.map(({ hex, pixel }) => (
        <g key={hex.id} transform={`translate(${pixel.x}, ${pixel.y})`}>
          <HexTile
            id={hex.id}
            terrainType={hex.terrainType}
            numberToken={hex.numberToken}
            size={hexSize}
          />
        </g>
      ))}
      {portGroups.map((group) => (
        <BorderSegment key={group.segmentId} ports={group.ports} />
      ))}
    </svg>
  );
}
