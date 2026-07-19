export function rollProbabilityPercent(diceNumber: number): number {
  const combinations = 6 - Math.abs(7 - diceNumber);
  return (combinations / 36) * 100;
}

interface NumberTokenProps {
  number: number;
  radius?: number;
}

export function NumberToken({ number, radius = 18 }: NumberTokenProps) {
  const isHot = number === 6 || number === 8;
  const color = isHot ? "var(--number-red)" : "var(--number-black)";

  return (
    <g>
      <circle
        r={radius}
        fill="var(--token-cream)"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth={1}
      />
      <text
        y={-radius * 0.12}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={radius * 0.9}
        fontWeight="bold"
        fill={color}
      >
        {number}
      </text>
      <text
        y={radius * 0.55}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={radius * 0.32}
        fill={color}
      >
        {rollProbabilityPercent(number).toFixed(1)}%
      </text>
    </g>
  );
}
