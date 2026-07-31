import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { HealthPill, ReputationPill } from "@/components/ui/health-pill";
import { MockBanner } from "@/components/mock-banner";
import { PageHeading, SectionHeading } from "@/components/section-heading";
import { adminApi } from "@/lib/admin-api";
import type { DeliverMetrics, DomainReputation, ProviderHealth } from "@/lib/types";
import { formatCompact, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PROVIDER_LABEL: Record<string, string> = {
  acs: "Azure ACS",
  sendgrid: "SendGrid",
  ses: "AWS SES",
};

function MetricRow({ label, m }: { label: string; m: DeliverMetrics }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/50 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Stat label="Sent" value={formatCompact(m.sent)} />
        <Stat label="Delivered" value={formatCompact(m.delivered)} />
        <Stat
          label="Bounce rate"
          value={formatPercent(m.bounceRate)}
          danger={m.bounceRate >= 0.05}
          warn={m.bounceRate >= 0.02}
        />
        <Stat
          label="Complaint rate"
          value={formatPercent(m.complaintRate)}
          danger={m.complaintRate >= 0.005}
          warn={m.complaintRate >= 0.001}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  danger,
  warn,
}: {
  label: string;
  value: string;
  danger?: boolean;
  warn?: boolean;
}) {
  const tone = danger ? "text-destructive" : warn ? "text-amber-600 dark:text-amber-400" : "text-foreground";
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`tabular-nums font-medium ${tone}`}>{value}</div>
    </div>
  );
}

function ProviderCard({ p }: { p: ProviderHealth }) {
  return (
    <Card className={p.configured ? "" : "opacity-70"}>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>{PROVIDER_LABEL[p.provider] ?? p.provider}</CardTitle>
        {p.configured ? (
          <ReputationPill status={p.reputation} />
        ) : (
          <Badge tone="neutral">not configured</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge tone="info">{p.activeRole}</Badge>
        </div>
        <MetricRow label="24 hours" m={p.window24h} />
        <MetricRow label="7 days" m={p.window7d} />
      </CardContent>
    </Card>
  );
}

export default async function DeliverabilityPage() {
  const { data, isMock, error } = await adminApi.deliverability();

  return (
    <>
      <PageHeading
        title="Deliverability"
        description="Your reputation moat: the three ESPs side-by-side and per-domain reputation across all orgs. Read-only — never sends or reroutes."
      />
      {isMock ? (
        <MockBanner endpoint="GET /admin/email/providers/health" error={error} />
      ) : null}

      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border border-border/60 bg-card p-4 text-sm">
        <span className="text-muted-foreground">Active routing:</span>
        <span className="inline-flex items-center gap-1.5">
          <Badge tone="info">transactional</Badge>
          <span className="font-medium text-foreground">
            {PROVIDER_LABEL[data.activeRouting.transactional] ?? data.activeRouting.transactional}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Badge tone="info">marketing</Badge>
          <span className="font-medium text-foreground">
            {PROVIDER_LABEL[data.activeRouting.marketing] ?? data.activeRouting.marketing}
          </span>
        </span>
      </div>

      <SectionHeading>Providers</SectionHeading>
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {data.providers.map((p) => (
          <ProviderCard key={p.provider} p={p} />
        ))}
      </div>

      <SectionHeading>Domains across all orgs</SectionHeading>
      <Card>
        <CardContent className="p-0">
          <DataTable<DomainReputation>
            rows={data.domains}
            rowKey={(d) => d.domain}
            columns={[
              { header: "Domain", cell: (d) => <span className="font-mono text-xs text-foreground">{d.domain}</span> },
              { header: "Org", cell: (d) => <span className="text-muted-foreground">{d.org}</span> },
              { header: "Status", cell: (d) => <HealthPill status={d.status} /> },
              {
                header: "Bounce",
                align: "right",
                cell: (d) => (
                  <span className={d.bounceRate >= 0.02 ? "text-destructive" : "text-muted-foreground"}>
                    {formatPercent(d.bounceRate)}
                  </span>
                ),
              },
              { header: "Complaint", align: "right", cell: (d) => formatPercent(d.complaintRate) },
              { header: "Suppressions", align: "right", cell: (d) => formatCompact(d.suppressions) },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
