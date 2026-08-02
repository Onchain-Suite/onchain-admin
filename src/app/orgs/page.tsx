import { MockBanner } from "@/components/mock-banner";
import { OrgsExplorer } from "@/components/orgs-explorer";
import { PageHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { computeFleet, isAtRisk } from "@/lib/fleet";
import { getOrganizations } from "@/lib/org-api";

export const dynamic = "force-dynamic";

export default async function OrgsPage() {
  const { data, isMock, error } = await getOrganizations();
  const fleet = computeFleet(data);
  // At-risk first, then newest — the explorer keeps this as the default order
  // (its column sorts are opt-in on header click).
  const rows = [...data].sort((a, b) => {
    const risk = Number(isAtRisk(b)) - Number(isAtRisk(a));
    return risk !== 0 ? risk : b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <>
      <PageHeading
        title="Organizations"
        description="Every organization on the platform, at-risk first. Filter, sort, and click one to open its live analytics."
        action={
          <div className="flex items-center gap-2">
            <Badge tone="neutral">{fleet.total} total</Badge>
            <Badge tone={fleet.atRisk.length ? "danger" : "success"}>
              {fleet.atRisk.length} at risk
            </Badge>
          </div>
        }
      />
      {isMock ? <MockBanner endpoint="GET /admin/organizations" error={error} /> : null}
      <Card>
        <CardContent className="p-4">
          <OrgsExplorer orgs={rows} />
        </CardContent>
      </Card>
    </>
  );
}
