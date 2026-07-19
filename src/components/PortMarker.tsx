const RESOURCE_COLORS: Record<string, string> = {
  brick: "var(--terrain-hills)",
  wood: "var(--terrain-forest)",
  ore: "var(--terrain-mountains)",
  wheat: "var(--terrain-fields)",
  sheep: "var(--terrain-pasture)",
};

export function getPortDisplay(type: string): { label: string; color: string } {
  if (type === "3:1") {
    return { label: "3:1", color: "var(--number-black)" };
  }
  return { label: "2:1", color: RESOURCE_COLORS[type] ?? "var(--number-black)" };
}

export interface Point {
  x: number;
  y: number;
}

interface PortMarkerProps {
  type: string;
  x: number;
  y: number;
  coastPoints: Point[];
  radius?: number;
}

export function PortMarker({ type, x, y, coastPoints, radius = 16 }: PortMarkerProps) {
  const { label, color } = getPortDisplay(type);

  return (
    <g>
      {coastPoints.map((point, i) => (
        <line
          key={i}
          x1={x}
          y1={y}
          x2={point.x}
          y2={point.y}
          stroke={color}
          strokeWidth={2}
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
      ))}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill="var(--token-cream)"
        stroke={color}
        strokeWidth={3}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={radius * 0.65}
        fontWeight="bold"
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}
