import { NumberToken } from "./NumberToken";
import { hexCorners } from "../lib/generation/coords";

const TERRAIN_COLORS: Record<string, string> = {
  hills: "var(--terrain-hills)",
  forest: "var(--terrain-forest)",
  mountains: "var(--terrain-mountains)",
  fields: "var(--terrain-fields)",
  pasture: "var(--terrain-pasture)",
  desert: "var(--terrain-desert)",
};

export function hexPoints(size: number): string {
  return hexCorners({ x: 0, y: 0 }, size)
    .map(({ x, y }) => `${x},${y}`)
    .join(" ");
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

interface HexTileProps {
  id: string;
  terrainType: string;
  numberToken: number | null;
  size?: number;
}

export function HexTile({ id, terrainType, numberToken, size = 50 }: HexTileProps) {
  const filterId = `hex-texture-${sanitizeId(id)}`;

  return (
    <g>
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={0.8}
            numOctaves={3}
            seed={2}
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0"
            result="fadedNoise"
          />
          <feComposite in="fadedNoise" in2="SourceGraphic" operator="in" result="noiseClipped" />
          <feBlend in="SourceGraphic" in2="noiseClipped" mode="multiply" />
        </filter>
      </defs>
      <polygon
        points={hexPoints(size)}
        fill={TERRAIN_COLORS[terrainType]}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={2}
        strokeLinejoin="round"
        filter={`url(#${filterId})`}
      />
      {numberToken !== null && <NumberToken number={numberToken} radius={size * 0.36} />}
    </g>
  );
}
