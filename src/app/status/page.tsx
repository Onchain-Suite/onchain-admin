import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { HealthPill } from "@/components/ui/health-pill";
import { MockBanner } from "@/components/mock-banner";
import { PageHeading, SectionHeading } from "@/components/section-heading";
import { adminApi } from "@/lib/admin-api";
import type { QueueDepth, SchedulerRun } from "@/lib/types";
import { formatCompact, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const OUTCOME_TONE = {
  ok: "success",
  failed: "danger",
  skipped: "neutral",
} as const;

export default async function StatusPage() {
  const { data, isMock, error } = await adminApi.status();

  return (
    <>
      <PageHeading
        title="System status"
        description="One board aggregating health, queues, schedulers, and the error feed — answer 'is prod healthy?' in seconds."
      />
      {isMock ? <MockBanner endpoint="GET /admin/status" error={error} /> : null}

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

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Queue depths</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable<QueueDepth>
              rows={data.queues}
              rowKey={(q) => q.name}
              columns={[
                { header: "Queue", cell: (q) => <span className="font-mono text-xs">{q.name}</span> },
                { header: "Waiting", align: "right", cell: (q) => formatCompact(q.waiting) },
                { header: "Active", align: "right", cell: (q) => q.active },
                {
                  header: "Failed",
                  align: "right",
                  cell: (q) =>
                    q.failed > 0 ? (
                      <span className="text-destructive">{q.failed}</span>
                    ) : (
                      q.failed
                    ),
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedulers · last run</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable<SchedulerRun>
              rows={data.schedulers}
              rowKey={(s) => s.name}
              columns={[
                { header: "Scheduler", cell: (s) => <span className="font-mono text-xs">{s.name}</span> },
                { header: "Last run", cell: (s) => timeAgo(s.lastRun) },
                {
                  header: "Outcome",
                  align: "right",
                  cell: (s) => <Badge tone={OUTCOME_TONE[s.outcome]}>{s.outcome}</Badge>,
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="RSS memory" value={`${data.process.rssMb} MB`} />
            <Row label="Event-loop lag" value={`${data.process.eventLoopLagMs} ms`} />
            <Row label="Uptime" value={`${data.process.uptimeHours} h`} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Error feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.errors.map((err) => (
              <div
                key={err.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/50 bg-background/50 p-3"
              >
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted-foreground">{err.source}</div>
                  <p className="mt-0.5 text-sm text-foreground">{err.message}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge tone={err.level === "error" ? "danger" : "warning"}>{err.level}</Badge>
                  <span className="text-xs text-muted-foreground">{timeAgo(err.at)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}
