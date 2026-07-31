"use client";

import dynamic from "next/dynamic";

import type { SendPoint } from "@/lib/types";

// Recharts is heavy and client-only — split it into its own chunk and skip SSR.
const SendsChart = dynamic(
  () => import("./sends-chart").then((m) => m.SendsChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-lg bg-muted/50" />
    ),
  }
);

export function ChartPanel({ data }: { data: SendPoint[] }) {
  return <SendsChart data={data} />;
}
