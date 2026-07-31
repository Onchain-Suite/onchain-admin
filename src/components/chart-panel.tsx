"use client";

import dynamic from "next/dynamic";

import type { SeriesDef } from "@/components/sends-chart";

// Recharts is heavy and client-only — split it into its own chunk and skip SSR.
const SeriesChart = dynamic(
  () => import("./sends-chart").then((m) => m.SeriesChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-lg bg-muted/50" />
    ),
  }
);

export function ChartPanel({
  data,
  xKey,
  series,
  height,
}: {
  data: object[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
}) {
  return <SeriesChart data={data} xKey={xKey} series={series} height={height} />;
}

/** Reusable legend dots row matching a chart's series. */
export function ChartLegend({ series }: { series: SeriesDef[] }) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      {series.map((s) => (
        <span key={s.key} className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: s.color }}
            aria-hidden="true"
          />
          {s.label}
        </span>
      ))}
    </div>
  );
}
