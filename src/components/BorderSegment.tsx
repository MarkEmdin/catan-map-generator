import { PortMarker } from "./PortMarker";
import { PortPlacement } from "@/lib/generation/portLayout";

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
