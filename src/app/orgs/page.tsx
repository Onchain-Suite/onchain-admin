import { Card, CardContent } from "@/components/ui/card";
import { MockBanner } from "@/components/mock-banner";
import { OrgsExplorer } from "@/components/orgs-explorer";
import { PageHeading } from "@/components/section-heading";
import { adminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function OrgsPage() {
  const { data, isMock, error } = await adminApi.orgs();

  return (
    <>
      <PageHeading
        title="Organizations"
        description="Search any org and drill into plan, usage, deliverability, and billing. Read-only."
      />
      {isMock ? <MockBanner endpoint="GET /admin/orgs" error={error} /> : null}
      <Card>
        <CardContent className="p-4">
          <OrgsExplorer orgs={data} />
        </CardContent>
      </Card>
    </>
  );
}
