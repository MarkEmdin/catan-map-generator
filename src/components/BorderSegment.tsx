import { PortMarker, Point } from "./PortMarker";

export interface PortPlacement {
  type: string;
  x: number;
  y: number;
  coastPoints: Point[];
}

interface BorderSegmentProps {
  ports: PortPlacement[];
}

export function BorderSegment({ ports }: BorderSegmentProps) {
  return (
    <g>
      {ports.map((port, i) => (
        <PortMarker
          key={i}
          type={port.type}
          x={port.x}
          y={port.y}
          coastPoints={port.coastPoints}
        />
      ))}
    </g>
  );
}
