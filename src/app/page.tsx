import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { MockBanner } from "@/components/mock-banner";
import { PageHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Meter } from "@/components/ui/meter";
import { computeFleet } from "@/lib/fleet";
import {
  getBillingSummary,
  getEmailSummary,
  getOrganizations,
  getUserMetrics,
  type OrgListItem,
} from "@/lib/org-api";
import { getOverallHealth } from "@/lib/system";
import { formatCompact, formatDelta, formatMoney, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

const repTone = (s?: string): "success" | "warning" | "danger" => {
  const v = (s ?? "ok").toLowerCase();
  if (v === "critical" || v === "blocked") return "danger";
  if (v === "warning" || v === "warn") return "warning";
  return "success";
};

export default async function OverviewPage() {
  const [billing, email, users, orgsRead, health] = await Promise.all([
    getBillingSummary(),
    getEmailSummary(30),
    getUserMetrics(30),
    getOrganizations(),
    getOverallHealth(),
  ]);

  const fleet = computeFleet(orgsRead.data);
  const b = billing.data;
  const e = email.data;
  const u = users.data;
  const anyMock = billing.isMock || email.isMock || users.isMock;
  const topPlan = Math.max(...b.planDistribution.map((p) => p.count), 1);

  return (
    <>
      <PageHeading
        title="Overview"
        description="Are we growing, are customers healthy, is the system healthy — the whole platform at a glance."
        action={
          !anyMock ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              Live
            </span>
          ) : null
        }
      />
      {anyMock ? (
        <MockBanner endpoint="GET /admin/billing/summary, /admin/email/summary, …" />
      ) : null}

      {/* North-star strip */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="MRR (est.)" value={formatMoney(b.mrrUsd)} hint={`${formatMoney(b.paygWalletTotalUsd)} PAYG wallets`} />
        <StatCard label="Organizations" value={formatCompact(b.totalOrgs)} hint={`${fleet.new30d} new · 30d`} />
        <StatCard label="Active users" value={formatCompact(u.activeUsers.value)} hint={`of ${formatCompact(u.totalUsers)} total`} />
        <StatCard label="New signups (30d)" value={formatCompact(u.newSignups.value)} hint={u.newSignups.deltaPct ? `${formatDelta(u.newSignups.deltaPct)} vs prev` : undefined} />
        <StatCard
          label="Email bounce (30d)"
          value={formatPercent(e.rates.bounceRate)}
          hint={`${formatCompact(e.totals.delivered)} delivered · ${formatCompact(e.totals.failed)} failed`}
          tone={e.rates.bounceRate >= 0.02 ? "danger" : "default"}
        />
        <Card className="flex items-center justify-between p-5">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">System health</div>
            <div className="mt-2 text-2xl font-semibold capitalize text-foreground">{health}</div>
          </div>
          {health === "operational" ? (
            <CheckCircleIcon className="h-8 w-8 text-emerald-500" aria-hidden="true" />
          ) : (
            <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" aria-hidden="true" />
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between gap-2">
            <CardTitle>At-risk organizations</CardTitle>
            <Badge tone={fleet.atRisk.length ? "danger" : "success"}>
              {fleet.atRisk.length} of {fleet.total}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {fleet.atRisk.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                No organizations flagged — every tenant is within bounce/complaint thresholds.
              </p>
            ) : (
              <DataTable<OrgListItem>
                rows={fleet.atRisk}
                rowKey={(o) => o.id}
                columns={[
                  { header: "Organization", cell: (o) => <Link href={`/analytics?org=${o.id}`} className="font-medium text-foreground hover:text-primary">{o.name}</Link> },
                  { header: "Bounce", align: "right", cell: (o) => <span className="text-destructive">{formatPercent(o.bounceRate ?? 0)}</span> },
                  { header: "Complaint", align: "right", cell: (o) => formatPercent(o.complaintRate ?? 0) },
                  { header: "Reputation", align: "right", cell: (o) => <Badge tone={repTone(o.reputationStatus)}>{o.reputationStatus ?? "ok"}</Badge> },
                ]}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {b.planDistribution.map((p) => (
              <div key={p.plan}>
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize text-foreground">{p.plan}</span>
                  <span className="tabular-nums text-muted-foreground">{p.count}</span>
                </div>
                <Meter used={p.count} limit={topPlan} className="mt-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
