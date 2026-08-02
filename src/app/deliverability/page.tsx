import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { MockBanner } from "@/components/mock-banner";
import { OrgPicker } from "@/components/org-picker";
import { PageHeading, SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { type SearchParams } from "@/lib/filters";
import {
  getEmailSummary,
  getOffenders,
  getOrgDomains,
  type Offender,
  type OrgDomain,
} from "@/lib/org-api";
import { getOrgId, getOrgOptions } from "@/lib/org-context";
import { formatCompact, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DeliverabilityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const org = await getOrgId(await searchParams);
  const [{ data, isMock, needsOrg, error }, orgs, emailRead, offRead] =
    await Promise.all([
      getOrgDomains(org),
      getOrgOptions(),
      getEmailSummary(30),
      getOffenders(30),
    ]);
  const e = emailRead.data;

  return (
    <>
      <PageHeading
        title="Deliverability"
        description="Platform email reputation and the tenants driving it, plus per-domain auth for a selected org."
      />

      {/* Platform email health (§5, §10.1) */}
      <SectionHeading>Platform · email (30d)</SectionHeading>
      {emailRead.isMock ? <MockBanner endpoint="GET /admin/email/summary" error={emailRead.error} /> : null}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sent" value={formatCompact(e.totals.sent)} hint={`${formatCompact(e.totals.delivered)} delivered`} />
        <StatCard label="Delivery rate" value={formatPercent(e.rates.deliveryRate)} />
        <StatCard label="Bounce rate" value={formatPercent(e.rates.bounceRate)} tone={e.rates.bounceRate >= 0.02 ? "danger" : "default"} />
        <StatCard label="Complaint rate" value={formatPercent(e.rates.complaintRate)} tone={e.rates.complaintRate >= 0.001 ? "danger" : "default"} />
      </div>

      <Card className="mb-8">
        <CardContent className="p-0">
          <DataTable<Offender>
            rows={offRead.data}
            rowKey={(o) => o.organizationId ?? o.name ?? "unknown"}
            empty="No offenders — no org exceeds the bounce/complaint thresholds at ≥50-send sample."
            columns={[
              { header: "Organization", cell: (o) => <span className="font-medium text-foreground">{o.name ?? "(unknown)"}</span> },
              { header: "Sent", align: "right", cell: (o) => formatCompact(o.sent ?? 0) },
              { header: "Bounce", align: "right", cell: (o) => <span className={(o.bounceRate ?? 0) >= 0.02 ? "text-destructive" : ""}>{formatPercent(o.bounceRate ?? 0)}</span> },
              { header: "Complaint", align: "right", cell: (o) => formatPercent(o.complaintRate ?? 0) },
              { header: "Worst domain", align: "right", cell: (o) => <span className="font-mono text-xs text-muted-foreground">{o.domains?.[0]?.domain ?? "—"}</span> },
            ]}
          />
        </CardContent>
      </Card>

      {/* Per-org domains */}
      <SectionHeading>Organization · domains</SectionHeading>
      <OrgPicker current={org} orgs={orgs} />
      {needsOrg ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Pick an organization to load its sending domains.
          </CardContent>
        </Card>
      ) : (
        <>
          {isMock ? <MockBanner endpoint="GET /sender-identities/domains/authentication" error={error} /> : null}
          <Card>
            <CardContent className="p-0">
              <DataTable<OrgDomain>
                rows={data}
                rowKey={(d) => d.domain}
                empty="No domains for this organization."
                columns={[
                  { header: "Domain", cell: (d) => <span className="font-mono text-xs text-foreground">{d.domain}</span> },
                  { header: "DKIM", cell: (d) => (d.dkim ? <Badge tone="success">pass</Badge> : <Badge tone="danger">fail</Badge>) },
                  { header: "SPF", cell: (d) => (d.spf ? <Badge tone="success">pass</Badge> : <Badge tone="danger">fail</Badge>) },
                  { header: "Status", align: "right", cell: (d) => <span className="text-muted-foreground">{d.status || "—"}</span> },
                ]}
              />
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
