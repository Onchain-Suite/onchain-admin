import { Card, CardContent } from "@/components/ui/card";
import { MockBanner } from "@/components/mock-banner";
import { PageHeading } from "@/components/section-heading";
import { UsersExplorer } from "@/components/users-explorer";
import { adminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const { data, isMock, error } = await adminApi.users();

  return (
    <>
      <PageHeading
        title="Users"
        description="Look up any user: orgs and roles, verification, and last session. Org-less users are a launch-week incident class — spot them here."
      />
      {isMock ? <MockBanner endpoint="GET /admin/users" error={error} /> : null}
      <Card>
        <CardContent className="p-4">
          <UsersExplorer users={data} />
        </CardContent>
      </Card>
    </>
  );
}
