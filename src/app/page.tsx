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
import { getOrganizations, getUsers, type OrgListItem } from "@/lib/org-api";
import { getSystemStatus } from "@/lib/system";
import { formatCompact, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

const repTone = (s?: string): "success" | "warning" | "danger" => {
  const v = (s ?? "ok").toLowerCase();
  if (v === "critical") return "danger";
  if (v === "warning") return "warning";
  return "success";
};

export default async function OverviewPage() {
  const [orgsRead, usersRead, { data: sys, isMock: sysMock, error: sysErr }] =
    await Promise.all([getOrganizations(), getUsers(), getSystemStatus()]);

  const fleet = computeFleet(orgsRead.data);
  const dataMock = orgsRead.isMock;
  const topPlan = Math.max(...fleet.plans.map((p) => p.count), 1);

  return (
    <>
      <PageHeading
        title="Overview"
        description="Are we growing, are customers healthy, is the system healthy — the whole platform at a glance."
        action={
          !sysMock && !dataMock ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              Live
            </span>
          ) : null
        }
      />
      {dataMock ? <MockBanner endpoint="GET /admin/organizations" error={orgsRead.error} /> : null}
      {sysMock ? <MockBanner endpoint="GET /health, /observability/failure-rate" error={sysErr} /> : null}

      {/* North-star strip */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Organizations" value={formatCompact(fleet.total)} hint={`${fleet.new30d} new · 30d`} />
        <StatCard label="Active orgs" value={formatCompact(fleet.active)} hint={`of ${fleet.total} total`} />
        <StatCard label="Users" value={formatCompact(usersRead.data.length)} hint={usersRead.isMock ? "sample" : undefined} />
        <StatCard label="Messages (30d)" value={formatCompact(fleet.totalMessages30d)} />
        <StatCard
          label="Failure rate"
          value={sys.failure ? formatPercent(sys.failure.httpErrorRate) : "—"}
          hint={sys.failure ? `${sys.failure.queueFailed} queue fails` : undefined}
          tone={sys.failure && (sys.failure.httpErrorRate >= 0.01 || sys.failure.queueFailed > 0) ? "danger" : "default"}
        />
        <Card className="flex items-center justify-between p-5">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">System health</div>
            <div className="mt-2 text-2xl font-semibold capitalize text-foreground">{sys.overall}</div>
          </div>
          {sys.overall === "operational" ? (
            <CheckCircleIcon className="h-8 w-8 text-emerald-500" aria-hidden="true" />
          ) : (
            <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" aria-hidden="true" />
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* At-risk fleet — the tenant(s) poisoning shared reputation */}
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
                  {
                    header: "Organization",
                    cell: (o) => (
                      <Link href={`/analytics?org=${o.id}`} className="font-medium text-foreground hover:text-primary">
                        {o.name}
                      </Link>
                    ),
                  },
                  { header: "Plan", cell: (o) => <span className="text-muted-foreground">{o.plan}</span> },
                  { header: "Bounce", align: "right", cell: (o) => <span className={((o.bounceRate ?? 0) >= 0.02) ? "text-destructive" : ""}>{formatPercent(o.bounceRate ?? 0)}</span> },
                  { header: "Complaint", align: "right", cell: (o) => formatPercent(o.complaintRate ?? 0) },
                  { header: "Reputation", align: "right", cell: (o) => <Badge tone={repTone(o.reputationStatus)}>{o.reputationStatus ?? "ok"}</Badge> },
                ]}
              />
            )}
          </CardContent>
        </Card>

        {/* Plan distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Plan distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fleet.plans.map((p) => (
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
