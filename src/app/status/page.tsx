import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { MockBanner } from "@/components/mock-banner";
import { PageHeading, SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { HealthPill } from "@/components/ui/health-pill";
import { getSystemStatus, type QueueRow } from "@/lib/system";
import { formatCompact, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const { data, isMock, error } = await getSystemStatus();

  return (
    <>
      <PageHeading
        title="System status"
        description="Platform-wide health, queues, and failure rate — live from the backend's /health and /observability endpoints. Answer 'is prod healthy?' in seconds."
        action={
          isMock ? null : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              Live
            </span>
          )
        }
      />
      {isMock ? (
        <MockBanner endpoint="GET /health, /observability/failure-rate" error={error} />
      ) : null}

      {/* Overall + failure-rate summary */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center justify-between p-5">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Overall
            </div>
            <div className="mt-2 text-lg font-semibold capitalize text-foreground">
              {data.overall}
            </div>
          </div>
          {data.overall === "operational" ? (
            <CheckCircleIcon className="h-8 w-8 text-emerald-500" aria-hidden="true" />
          ) : (
            <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" aria-hidden="true" />
          )}
        </Card>
        <StatCard
          label="HTTP error rate"
          value={data.failure ? formatPercent(data.failure.httpErrorRate) : "—"}
          hint={data.failure ? `${formatCompact(data.failure.httpTotal)} reqs` : undefined}
          tone={data.failure && data.failure.httpErrorRate >= 0.01 ? "danger" : "default"}
        />
        <StatCard
          label="Queue failure rate"
          value={data.failure ? formatPercent(data.failure.queueFailureRate) : "—"}
          hint={data.failure ? `${data.failure.queueFailed} failed` : undefined}
          tone={data.failure && data.failure.queueFailed > 0 ? "danger" : "default"}
        />
        <StatCard
          label="Routes healthy"
          value={
            data.routes
              ? `${data.routes.observed - data.routes.failing - data.routes.degraded}/${data.routes.observed}`
              : "—"
          }
          hint={data.routes && data.routes.failing > 0 ? `${data.routes.failing} failing` : undefined}
          tone={data.routes && data.routes.failing > 0 ? "danger" : "default"}
        />
      </div>

      <SectionHeading>Subsystems</SectionHeading>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.subsystems.map((svc) => (
          <Card key={svc.name} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium text-foreground">{svc.name}</div>
              <HealthPill status={svc.status} />
            </div>
            {svc.detail ? (
              <div className="mt-1 text-xs text-muted-foreground">{svc.detail}</div>
            ) : null}
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queues</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable<QueueRow>
            rows={data.queues}
            rowKey={(q) => q.name}
            empty="No queues reported."
            columns={[
              { header: "Queue", cell: (q) => <span className="font-mono text-xs">{q.name}</span> },
              { header: "Waiting", align: "right", cell: (q) => formatCompact(q.waiting) },
              { header: "Active", align: "right", cell: (q) => q.active },
              {
                header: "Failed",
                align: "right",
                cell: (q) =>
                  q.failed > 0 ? <span className="text-destructive">{q.failed}</span> : q.failed,
              },
              { header: "Workers", align: "right", cell: (q) => q.workers },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
