import { HexTile as HexTileData, PortSpec } from "@/lib/types";
import { cubeToPixel, hexCorners, Point } from "@/lib/generation/coords";
import { layoutPorts, layoutSeaWedges } from "@/lib/generation/portLayout";
import { HexTile } from "./HexTile";
import { PortMarker } from "./PortMarker";

const PORT_MARKER_RADIUS = 16;
const PADDING = 24;

interface MapCanvasProps {
  hexes: HexTileData[];
  ports: PortSpec[];
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

export function MapCanvas({ hexes, ports, hexSize = 50 }: MapCanvasProps) {
  const hexPositions = hexes.map((hex) => ({
    hex,
    pixel: cubeToPixel(hex.coordCube, hexSize),
  }));
  const portPlacements = layoutPorts(ports, hexSize);
  const seaWedges = layoutSeaWedges(hexSize);

  const boundingPoints = [
    ...hexPositions.flatMap(({ pixel }) => hexCorners(pixel, hexSize)),
    ...seaWedges.flatMap((wedge) => wedge.points),
    ...portPlacements.flatMap((port) => [
      { x: port.x - PORT_MARKER_RADIUS, y: port.y - PORT_MARKER_RADIUS },
      { x: port.x + PORT_MARKER_RADIUS, y: port.y + PORT_MARKER_RADIUS },
      ...port.coastPoints,
    ]),
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
      {portPlacements.map((port, i) => (
        <PortMarker
          key={i}
          type={port.type}
          x={port.x}
          y={port.y}
          coastPoints={port.coastPoints}
        />
      ))}
    </svg>
  );
}
