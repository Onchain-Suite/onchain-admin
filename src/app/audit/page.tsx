import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { MockBanner } from "@/components/mock-banner";
import { PageHeading } from "@/components/section-heading";
import { adminApi } from "@/lib/admin-api";
import type { AuditEntry } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const { data, isMock, error } = await adminApi.audit();

  return (
    <>
      <PageHeading
        title="Audit log"
        description="Append-only record of every admin mutation — who, what, target, when. One-year retention. Read-only view."
      />
      {isMock ? <MockBanner endpoint="GET /admin/audit" error={error} /> : null}
      <Card>
        <CardContent className="p-0">
          <DataTable<AuditEntry>
            rows={data}
            rowKey={(a) => a.id}
            empty="No admin actions recorded."
            columns={[
              { header: "When", cell: (a) => <span className="text-muted-foreground">{timeAgo(a.at)}</span> },
              { header: "Actor", cell: (a) => <span className="text-foreground">{a.actor}</span> },
              { header: "Action", cell: (a) => <span className="font-mono text-xs text-primary">{a.action}</span> },
              { header: "Target", cell: (a) => <span className="text-foreground">{a.target}</span> },
              { header: "Detail", cell: (a) => <span className="text-muted-foreground">{a.detail ?? "—"}</span> },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
