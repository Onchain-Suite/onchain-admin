import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { headers } from "next/headers";

import { ChartPanel } from "@/components/chart-panel";
import { StatCard } from "@/components/stat-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSnapshot } from "@/lib/admin-api";
import type { HealthStatus } from "@/lib/types";
import { formatCompact, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

const HEALTH_TONE: Record<HealthStatus, "success" | "warning" | "danger"> = {
  operational: "success",
  degraded: "warning",
  down: "danger",
};

export default async function AdminDashboard() {
  const [{ snapshot, isMock, error }, headerList] = await Promise.all([
    getSnapshot(),
    headers(),
  ]);
  const email = headerList.get("x-admin-email") ?? "unknown";
  const { health, stats, sends, orgs, errors } = snapshot;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              OnchainSuite Admin
            </h1>
            <p className="text-xs text-muted-foreground">
              Internal monitoring · signed in as {email}
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {isMock ? (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400">
          <ExclamationTriangleIcon
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <span>
            Showing sample data{error ? ` (backend unreachable: ${error})` : ""}.
            Set <code className="font-mono">ADMIN_MOCK=0</code> once{" "}
            <code className="font-mono">GET /admin/snapshot</code> is live.
          </span>
        </div>
      ) : null}

      {/* Service health */}
      <section className="mb-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Service health
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {health.map((svc) => (
            <Card key={svc.name} className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-medium text-foreground">
                  {svc.name}
                </div>
                {svc.detail ? (
                  <div className="text-xs text-muted-foreground">
                    {svc.detail}
                  </div>
                ) : null}
              </div>
              <Badge tone={HEALTH_TONE[svc.status]}>
                <span
                  className="h-1.5 w-1.5 rounded-full bg-current"
                  aria-hidden="true"
                />
                {svc.status}
              </Badge>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total orgs"
          value={formatCompact(stats.totalOrgs)}
          hint={`${stats.activeOrgs7d} active in 7d`}
        />
        <StatCard
          label="Emails sent (24h)"
          value={formatCompact(stats.emailsSent24h)}
          hint={`${formatPercent(stats.deliveryRate)} delivered`}
        />
        <StatCard
          label="In-app pushes (24h)"
          value={formatCompact(stats.pushesSent24h)}
        />
        <StatCard
          label="Delivery rate"
          value={formatPercent(stats.deliveryRate)}
        />
        <StatCard
          label="Active orgs (7d)"
          value={formatCompact(stats.activeOrgs7d)}
        />
        <StatCard
          label="Errors (24h)"
          value={formatCompact(stats.errors24h)}
          tone={stats.errors24h > 0 ? "danger" : "default"}
        />
      </section>

      {/* Send volume chart */}
      <section className="mb-6">
        <Card>
          <CardHeader className="flex items-center justify-between gap-2">
            <CardTitle>Send volume · last 14 days</CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" />
                Email
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--chart-2)]" />
                In-app
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ChartPanel data={sends} />
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top orgs */}
        <Card>
          <CardHeader>
            <CardTitle>Top organizations</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-2.5 font-medium">Org</th>
                  <th className="px-5 py-2.5 font-medium">Plan</th>
                  <th className="px-5 py-2.5 text-right font-medium">Members</th>
                  <th className="px-5 py-2.5 text-right font-medium">
                    Emails 30d
                  </th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <tr
                    key={org.id}
                    className="border-b border-border/40 last:border-0"
                  >
                    <td className="px-5 py-2.5 font-medium text-foreground">
                      {org.name}
                    </td>
                    <td className="px-5 py-2.5 text-muted-foreground">
                      {org.plan}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-muted-foreground">
                      {org.members}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-foreground">
                      {formatCompact(org.emails30d)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Recent errors */}
        <Card>
          <CardHeader>
            <CardTitle>Recent errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {errors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No errors in the window.
              </p>
            ) : (
              errors.map((err) => (
                <div
                  key={err.id}
                  className="rounded-lg border border-border/50 bg-background/50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {err.source}
                    </span>
                    <Badge tone={err.level === "error" ? "danger" : "warning"}>
                      {err.level}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{err.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(err.at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
