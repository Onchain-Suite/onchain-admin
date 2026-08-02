import Link from "next/link";

import { MockBanner } from "@/components/mock-banner";
import { PageHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getOrganizations, type OrgListItem } from "@/lib/org-api";
import { formatCompact } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrgsPage() {
  const { data, isMock, error } = await getOrganizations();

  return (
    <>
      <PageHeading
        title="Organizations"
        description="Every organization on the platform. Click one to open its live analytics."
      />
      {isMock ? <MockBanner endpoint="GET /admin/organizations" error={error} /> : null}
      <Card>
        <CardContent className="p-0">
          <DataTable<OrgListItem>
            rows={data}
            rowKey={(o) => o.id}
            empty="No organizations."
            columns={[
              {
                header: "Organization",
                cell: (o) => (
                  <Link
                    href={`/analytics?org=${o.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {o.name}
                  </Link>
                ),
              },
              { header: "Plan", cell: (o) => <span className="text-muted-foreground">{o.plan}</span> },
              { header: "Members", align: "right", cell: (o) => o.members },
              {
                header: "Messages 30d",
                align: "right",
                cell: (o) => (o.messages30d != null ? formatCompact(o.messages30d) : "—"),
              },
              { header: "Created", align: "right", cell: (o) => <span className="text-muted-foreground">{o.createdAt}</span> },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
