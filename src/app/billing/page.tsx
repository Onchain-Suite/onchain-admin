import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Meter } from "@/components/ui/meter";
import { MockBanner } from "@/components/mock-banner";
import { OrgPicker } from "@/components/org-picker";
import { PageHeading, SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { type SearchParams } from "@/lib/filters";
import { type BillingSummary, getBillingSummary, getOrgBilling } from "@/lib/org-api";
import { getOrgId, getOrgOptions } from "@/lib/org-context";
import { formatCompact, formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Spender = BillingSummary["topSpenders"][number];

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const org = await getOrgId(await searchParams);
  const [{ data, isMock, needsOrg, error }, orgs, summary] = await Promise.all([
    getOrgBilling(org),
    getOrgOptions(),
    getBillingSummary(),
  ]);
  const s = summary.data;

  return (
    <>
      <PageHeading
        title="Billing"
        description="Platform revenue snapshot, plus plan and live usage meters per organization."
      />

      <SectionHeading>Platform · money</SectionHeading>
      {summary.isMock ? <MockBanner endpoint="GET /admin/billing/summary" error={summary.error} /> : null}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="MRR (est.)" value={formatMoney(s.mrrUsd)} hint="catalog list price × active paid" />
        <StatCard label="PAYG wallets" value={formatMoney(s.paygWalletTotalUsd)} hint="Σ balances" />
        <StatCard label="Organizations" value={formatCompact(s.totalOrgs)} />
        <StatCard label="Paid plans" value={formatCompact(s.planDistribution.filter((p) => !["free", "payg"].includes(p.plan.toLowerCase())).reduce((n, p) => n + p.count, 0))} />
      </div>
      {s.topSpenders.length > 0 ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top spenders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable<Spender>
              rows={s.topSpenders}
              rowKey={(r) => r.organizationId}
              columns={[
                { header: "Organization", cell: (r) => <span className="font-medium text-foreground">{r.name ?? "(unknown)"}</span> },
                { header: "Balance", align: "right", cell: (r) => formatMoney(r.balanceUsd) },
                { header: "Lifetime spend", align: "right", cell: (r) => formatMoney(r.lifetimeSpendUsd) },
              ]}
            />
          </CardContent>
        </Card>
      ) : null}

      <SectionHeading>Organization · plan &amp; usage</SectionHeading>
      <OrgPicker current={org} orgs={orgs} />

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
