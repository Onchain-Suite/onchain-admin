import { Card, CardContent } from "@/components/ui/card";
import { FilterBar } from "@/components/filter-bar";
import { MockBanner } from "@/components/mock-banner";
import { OrgsExplorer } from "@/components/orgs-explorer";
import { PageHeading } from "@/components/section-heading";
import { adminApi } from "@/lib/admin-api";
import { HEALTH_SPEC, parseFilters, PLAN_SPEC, type SearchParams } from "@/lib/filters";

export const dynamic = "force-dynamic";

export default async function OrgsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const f = parseFilters(await searchParams);
  const { data, isMock, error } = await adminApi.orgs(f);

  return (
    <>
      <PageHeading
        title="Organizations"
        description="Search any org and drill into plan, usage, deliverability, and billing. Read-only."
      />
      <FilterBar specs={[PLAN_SPEC, HEALTH_SPEC]} />
      {isMock ? <MockBanner endpoint="GET /admin/orgs" error={error} /> : null}
      <Card>
        <CardContent className="p-4">
          <OrgsExplorer orgs={data} />
        </CardContent>
      </Card>
    </>
  );
}
