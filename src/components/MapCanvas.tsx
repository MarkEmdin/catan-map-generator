import { HexTile as HexTileData, BorderSegment as BorderSegmentData } from "@/lib/types";
import { cubeToPixel, hexCorners, Point } from "@/lib/generation/coords";
import { layoutPorts } from "@/lib/generation/portLayout";
import { HexTile } from "./HexTile";
import { BorderSegment } from "./BorderSegment";

const PORT_MARKER_RADIUS = 16;
const PADDING = 24;

interface MapCanvasProps {
  hexes: HexTileData[];
  segments: BorderSegmentData[];
  hexSize?: number;
}

export function computeViewBox(points: Point[]): string {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs) - PADDING;
  const minY = Math.min(...ys) - PADDING;
  const maxX = Math.max(...xs) + PADDING;
  const maxY = Math.max(...ys) + PADDING;
  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
}

export function MapCanvas({ hexes, segments, hexSize = 50 }: MapCanvasProps) {
  const hexPositions = hexes.map((hex) => ({
    hex,
    pixel: cubeToPixel(hex.coordCube, hexSize),
  }));
  const portGroups = layoutPorts(segments, hexSize);

  const boundingPoints = [
    ...hexPositions.flatMap(({ pixel }) => hexCorners(pixel, hexSize)),
    ...portGroups.flatMap((group) =>
      group.ports.flatMap((port) => [
        { x: port.x - PORT_MARKER_RADIUS, y: port.y - PORT_MARKER_RADIUS },
        { x: port.x + PORT_MARKER_RADIUS, y: port.y + PORT_MARKER_RADIUS },
        ...port.coastPoints,
      ])
    ),
  ];

  return (
    <svg
      viewBox={computeViewBox(boundingPoints)}
      width="100%"
      height="auto"
      role="img"
      aria-label="Catan board map"
    >
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
