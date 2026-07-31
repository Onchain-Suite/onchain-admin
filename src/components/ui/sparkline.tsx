/** Tiny inline-SVG sparkline. No chart library — cheap enough for every tile. */
export function Sparkline({
  data,
  className,
  width = 120,
  height = 32,
  stroke = "var(--chart-1)",
}: {
  data: number[];
  className?: string;
  width?: number;
  height?: number;
  stroke?: string;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / span) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      width={width}
      height={height}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        stroke={stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
