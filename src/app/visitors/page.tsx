import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { ChartLegend, ChartPanel } from "@/components/chart-panel";
import { FilterBar } from "@/components/filter-bar";
import { MockBanner } from "@/components/mock-banner";
import { PageHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { adminApi } from "@/lib/admin-api";
import { parseFilters, RANGE_SPEC, rangeLabel, type SearchParams } from "@/lib/filters";
import { formatCompact } from "@/lib/utils";

export const dynamic = "force-dynamic";

const VISIT_SERIES = [
  { key: "visitors", label: "Visitors", color: "var(--chart-1)" },
  { key: "views", label: "Views", color: "var(--chart-2)" },
];

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const f = parseFilters(await searchParams);
  const { data, isMock, error } = await adminApi.visitors(f);
  const topCountry = Math.max(...data.topCountries.map((c) => c.visitors), 1);

  return (
    <>
      <PageHeading
        title="Visitors"
        description="First-party marketing-site analytics captured at the edge from Vercel geo headers (daily rollups, no raw IPs)."
      />
      <FilterBar specs={[RANGE_SPEC]} />
      {isMock ? (
        <MockBanner endpoint="GET /admin/analytics/visitors" error={error} />
      ) : null}

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <StatCard label="Visitors" value={formatCompact(data.totals.visitors)} />
        <StatCard label="Page views" value={formatCompact(data.totals.views)} />
      </div>

      <Card className="mb-8">
        <CardHeader className="flex items-center justify-between gap-2">
          <CardTitle>Traffic · {rangeLabel(f.range)}</CardTitle>
          <ChartLegend series={VISIT_SERIES} />
        </CardHeader>
        <CardContent>
          <ChartPanel data={data.series} xKey="date" series={VISIT_SERIES} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.topPages.map((p) => (
              <div key={p.path} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-mono text-xs text-foreground">{p.path}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatCompact(p.views)} views · {formatCompact(p.visitors)} visitors
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top countries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topCountries.map((c) => (
              <div key={c.code}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{c.country}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCompact(c.visitors)}
                  </span>
                </div>
                <Meter used={c.visitors} limit={topCountry} className="mt-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
