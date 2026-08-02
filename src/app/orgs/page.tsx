import Link from "next/link";

import { MockBanner } from "@/components/mock-banner";
import { PageHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { computeFleet, isAtRisk } from "@/lib/fleet";
import { getOrganizations, type OrgListItem } from "@/lib/org-api";
import { formatCompact, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

const repTone = (s?: string): "success" | "warning" | "danger" => {
  const v = (s ?? "ok").toLowerCase();
  if (v === "critical") return "danger";
  if (v === "warning") return "warning";
  return "success";
};

export default async function OrgsPage() {
  const { data, isMock, error } = await getOrganizations();
  const fleet = computeFleet(data);
  // At-risk first, then by created (newest).
  const rows = [...data].sort((a, b) => {
    const risk = Number(isAtRisk(b)) - Number(isAtRisk(a));
    return risk !== 0 ? risk : b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <>
      <PageHeading
        title="Organizations"
        description="Every organization on the platform, at-risk first. Click one to open its live analytics."
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
        <CardContent className="p-0">
          <DataTable<OrgListItem>
            rows={rows}
            rowKey={(o) => o.id}
            empty="No organizations."
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
              { header: "Members", align: "right", cell: (o) => o.members },
              { header: "Messages 30d", align: "right", cell: (o) => (o.messages30d != null ? formatCompact(o.messages30d) : "—") },
              {
                header: "Bounce",
                align: "right",
                cell: (o) => (
                  <span className={(o.bounceRate ?? 0) >= 0.02 ? "text-destructive" : "text-muted-foreground"}>
                    {formatPercent(o.bounceRate ?? 0)}
                  </span>
                ),
              },
              { header: "Reputation", align: "right", cell: (o) => <Badge tone={repTone(o.reputationStatus)}>{o.reputationStatus ?? "ok"}</Badge> },
              { header: "Created", align: "right", cell: (o) => <span className="text-muted-foreground">{o.createdAt.slice(0, 10)}</span> },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
