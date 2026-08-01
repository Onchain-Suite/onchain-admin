import { Card, CardContent } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { MockBanner } from "@/components/mock-banner";
import { OrgField } from "@/components/org-field";
import { PageHeading, SectionHeading } from "@/components/section-heading";
import { type SearchParams } from "@/lib/filters";
import { getOrgBilling } from "@/lib/org-api";
import { getOrgId } from "@/lib/org-context";
import { formatCompact, formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const org = await getOrgId(await searchParams);
  const { data, isMock, needsOrg, error } = await getOrgBilling(org);

  return (
    <>
      <PageHeading
        title="Billing"
        description="Plan and live usage meters for an organization, from GET /billing/plan-usage. Read-only."
      />
      <OrgField current={org} />

      {needsOrg ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Enter an organization id above to load its plan and usage.
          </CardContent>
        </Card>
      ) : (
        <>
          {isMock ? (
            <MockBanner endpoint="GET /billing/plan-usage/{organizationId}" error={error} />
          ) : null}

          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            <Card className="p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Plan
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {data.plan.label}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{data.plan.key}</div>
            </Card>
            <Card className="p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Monthly price
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {formatMoney(data.plan.monthlyPrice)}
              </div>
            </Card>
            <Card className="p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Period
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {data.period || "—"}
              </div>
            </Card>
          </div>

          <SectionHeading>Usage meters</SectionHeading>
          <Card>
            <CardContent className="space-y-4">
              {data.meters.length === 0 ? (
                <p className="text-sm text-muted-foreground">No meters reported.</p>
              ) : (
                data.meters.map((m) => {
                  const unlimited = m.limit < 0;
                  return (
                    <div key={m.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{m.name}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {formatCompact(m.used)} /{" "}
                          {unlimited ? "∞" : formatCompact(m.limit)}
                        </span>
                      </div>
                      {unlimited ? (
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted" />
                      ) : (
                        <Meter used={m.used} limit={m.limit} className="mt-1.5" />
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
