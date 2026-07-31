"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SendPoint } from "@/lib/types";

/** Email vs in-app send volume over the window. Colors come from v2 chart tokens. */
export function SendsChart({ data }: { data: SendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="fillEmail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillPush" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => d.slice(5)}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            color: "var(--popover-foreground)",
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--muted-foreground)" }}
        />
        <Area
          type="monotone"
          dataKey="email"
          name="Email"
          stroke="var(--chart-1)"
          fill="url(#fillEmail)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="push"
          name="In-app"
          stroke="var(--chart-2)"
          fill="url(#fillPush)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
