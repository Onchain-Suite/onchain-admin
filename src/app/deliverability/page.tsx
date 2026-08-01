import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { MockBanner } from "@/components/mock-banner";
import { OrgField } from "@/components/org-field";
import { PageHeading } from "@/components/section-heading";
import { type SearchParams } from "@/lib/filters";
import { getOrgDomains, type OrgDomain } from "@/lib/org-api";

export const dynamic = "force-dynamic";

export default async function DeliverabilityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const org = typeof sp.org === "string" ? sp.org : "";
  const { data, isMock, needsOrg, error } = await getOrgDomains(org);

  return (
    <>
      <PageHeading
        title="Deliverability"
        description="Per-domain authentication (DKIM / SPF / verification) for an organization, from GET /sender-identities/domains/authentication. Read-only."
      />
      <OrgField current={org} />

      {needsOrg ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Enter an organization id above to load its sending domains.
          </CardContent>
        </Card>
      ) : (
        <>
          {isMock ? (
            <MockBanner
              endpoint="GET /sender-identities/domains/authentication"
              error={error}
            />
          ) : null}
          <Card>
            <CardContent className="p-0">
              <DataTable<OrgDomain>
                rows={data}
                rowKey={(d) => d.domain}
                empty="No domains for this organization."
                columns={[
                  {
                    header: "Domain",
                    cell: (d) => (
                      <span className="font-mono text-xs text-foreground">{d.domain}</span>
                    ),
                  },
                  {
                    header: "DKIM",
                    cell: (d) =>
                      d.dkim ? (
                        <Badge tone="success">pass</Badge>
                      ) : (
                        <Badge tone="danger">fail</Badge>
                      ),
                  },
                  {
                    header: "SPF",
                    cell: (d) =>
                      d.spf ? (
                        <Badge tone="success">pass</Badge>
                      ) : (
                        <Badge tone="danger">fail</Badge>
                      ),
                  },
                  {
                    header: "Status",
                    align: "right",
                    cell: (d) => (
                      <span className="text-muted-foreground">{d.status || "—"}</span>
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>
          <p className="mt-4 text-xs text-muted-foreground">
            Per-provider (ACS / SendGrid / SES) reputation isn&apos;t exposed by an
            existing endpoint — it would need the aggregate route from the PRD.
          </p>
        </>
      )}
    </>
  );
}
