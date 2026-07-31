import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartLegend, ChartPanel } from "@/components/chart-panel";
import { FilterBar } from "@/components/filter-bar";
import { MockBanner } from "@/components/mock-banner";
import { NorthStarTile } from "@/components/north-star-tile";
import { PageHeading, SectionHeading } from "@/components/section-heading";
import { HealthPill } from "@/components/ui/health-pill";
import { adminApi } from "@/lib/admin-api";
import { parseFilters, RANGE_SPEC, rangeLabel, type SearchParams } from "@/lib/filters";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SEND_SERIES = [
  { key: "email", label: "Email", color: "var(--chart-1)" },
  { key: "push", label: "In-app", color: "var(--chart-2)" },
];

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const f = parseFilters(await searchParams);
  const { data, isMock, error } = await adminApi.snapshot(f);

  return (
    <>
      <PageHeading
        title="Overview"
        description="Are we growing, are customers healthy, is the system healthy — at a glance."
      />
      <FilterBar specs={[RANGE_SPEC]} />
      {isMock ? <MockBanner endpoint="GET /admin/snapshot" error={error} /> : null}

      <SectionHeading>North-star metrics</SectionHeading>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.northStars.map((tile) => (
          <NorthStarTile key={tile.key} tile={tile} />
        ))}
      </div>

      <SectionHeading>Service health</SectionHeading>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.health.map((svc) => (
          <Card key={svc.name} className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-medium text-foreground">{svc.name}</div>
              {svc.detail ? (
                <div className="text-xs text-muted-foreground">{svc.detail}</div>
              ) : null}
            </div>
            <HealthPill status={svc.status} />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between gap-2">
            <CardTitle>Send volume · {rangeLabel(f.range)}</CardTitle>
            <ChartLegend series={SEND_SERIES} />
          </CardHeader>
          <CardContent>
            <ChartPanel data={data.sends} xKey="date" series={SEND_SERIES} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent errors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.errors.slice(0, 5).map((err) => (
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
                  {timeAgo(err.at)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
