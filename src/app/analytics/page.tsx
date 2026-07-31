import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { ChartLegend, ChartPanel } from "@/components/chart-panel";
import { FilterBar } from "@/components/filter-bar";
import { MockBanner } from "@/components/mock-banner";
import { PageHeading, SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { adminApi } from "@/lib/admin-api";
import { parseFilters, RANGE_SPEC, rangeLabel, type SearchParams } from "@/lib/filters";
import { formatCompact, formatMoney, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

const GROWTH_SERIES = [
  { key: "users", label: "Users", color: "var(--chart-1)" },
  { key: "orgs", label: "Orgs", color: "var(--chart-2)" },
];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const f = parseFilters(await searchParams);
  const { data, isMock, error } = await adminApi.analytics(f);
  const { growth, engagement, revenue, deliverability } = data;
  const topPlanOrgs = Math.max(...revenue.plans.map((p) => p.orgs), 1);

  return (
    <>
      <PageHeading
        title="Analytics"
        description={`Growth, engagement, revenue, and deliverability — read-only aggregates over the platform (${rangeLabel(f.range)}).`}
      />
      <FilterBar specs={[RANGE_SPEC]} />
      {isMock ? (
        <MockBanner endpoint="GET /admin/analytics/overview" error={error} />
      ) : null}

      <SectionHeading>Growth</SectionHeading>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Users" value={formatCompact(growth.usersTotal)} hint={`+${growth.usersNew} new`} />
        <StatCard label="Orgs" value={formatCompact(growth.orgsTotal)} hint={`+${growth.orgsNew} new`} />
        <StatCard label="Activation" value={formatPercent(growth.activationRate)} hint="first value <10min" />
        <StatCard label="MRR" value={formatMoney(revenue.mrr)} hint={`ARR ${formatMoney(revenue.mrr * 12)}`} />
        <StatCard label="PAYG outstanding" value={formatMoney(revenue.paygOutstanding)} hint={`${formatMoney(revenue.topups30d)} topped up 30d`} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between gap-2">
            <CardTitle>Users & orgs · {rangeLabel(f.range)}</CardTitle>
            <ChartLegend series={GROWTH_SERIES} />
          </CardHeader>
          <CardContent>
            <ChartPanel data={data.series} xKey="date" series={GROWTH_SERIES} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {revenue.plans.map((p) => (
              <div key={p.plan}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{p.plan}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {p.orgs} orgs · {formatMoney(p.mrr)}
                  </span>
                </div>
                <Meter used={p.orgs} limit={topPlanOrgs} className="mt-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <SectionHeading>Engagement · {rangeLabel(f.range)}</SectionHeading>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Campaigns launched" value={formatCompact(engagement.campaigns)} />
        <StatCard label="Emails sent" value={formatCompact(engagement.emails)} />
        <StatCard label="In-app pushes" value={formatCompact(engagement.inApp)} />
        <StatCard label="Automations fired" value={formatCompact(engagement.automations)} />
        <StatCard label="App events ingested" value={formatCompact(engagement.appEvents)} />
        <StatCard label="AI queries" value={formatCompact(engagement.aiQueries)} />
      </div>

      <SectionHeading>Deliverability</SectionHeading>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Bounce rate" value={formatPercent(deliverability.bounceRate)} tone={deliverability.bounceRate >= 0.02 ? "danger" : "default"} />
        <StatCard label="Complaint rate" value={formatPercent(deliverability.complaintRate)} />
        <StatCard label="Send-ready domains" value={`${deliverability.sendReadyDomains}/${deliverability.totalDomains}`} />
        <StatCard label="Plan expirations (14d)" value={String(revenue.expiring14d)} tone={revenue.expiring14d > 0 ? "danger" : "default"} />
      </div>
    </>
  );
}
