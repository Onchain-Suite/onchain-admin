import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { MockBanner } from "@/components/mock-banner";
import { PageHeading, SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { adminApi } from "@/lib/admin-api";
import type { BillingOps } from "@/lib/types";
import { formatMoney, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Pending = BillingOps["pending"][number];
type Ledger = BillingOps["ledger"][number];

export default async function BillingPage() {
  const { data, isMock, error } = await adminApi.billing();
  const { waterfall } = data;
  const netNew =
    waterfall.newMrr + waterfall.expansion + waterfall.contraction + waterfall.churn;

  return (
    <>
      <PageHeading
        title="Billing operations"
        description="MRR movement, stuck upgrades, webhook failures, and the credit ledger — the reconciliation surface across Stripe and BlockRadar."
      />
      {isMock ? <MockBanner endpoint="GET /admin/billing" error={error} /> : null}

      <SectionHeading>MRR movement (30d)</SectionHeading>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="New" value={formatMoney(waterfall.newMrr)} />
        <StatCard label="Expansion" value={formatMoney(waterfall.expansion)} />
        <StatCard label="Contraction" value={formatMoney(waterfall.contraction)} tone="danger" />
        <StatCard label="Churn" value={formatMoney(waterfall.churn)} tone="danger" />
        <StatCard label="Net new MRR" value={formatMoney(netNew)} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending upgrades</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable<Pending>
              rows={data.pending}
              rowKey={(p) => p.id}
              empty="No pending upgrades."
              columns={[
                { header: "Org", cell: (p) => <span className="text-foreground">{p.org}</span> },
                { header: "Amount", align: "right", cell: (p) => formatMoney(p.amount) },
                {
                  header: "Status",
                  cell: (p) => (
                    <Badge tone={p.status === "amount_mismatch" ? "danger" : "warning"}>
                      {p.status.replace(/_/g, " ")}
                    </Badge>
                  ),
                },
                {
                  header: "Age",
                  align: "right",
                  cell: (p) => (
                    <span className={p.ageHours > 1 ? "text-destructive" : "text-muted-foreground"}>
                      {p.ageHours.toFixed(1)}h
                    </span>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhook failures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.webhookFailures.map((w) => (
              <div key={w.id} className="rounded-lg border border-border/50 bg-background/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{w.kind}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(w.at)}</span>
                </div>
                <p className="mt-1 text-sm text-foreground">{w.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credit ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable<Ledger>
            rows={data.ledger}
            rowKey={(l) => `${l.at}-${l.org}`}
            columns={[
              { header: "When", cell: (l) => <span className="text-muted-foreground">{timeAgo(l.at)}</span> },
              { header: "Org", cell: (l) => <span className="text-foreground">{l.org}</span> },
              { header: "Kind", cell: (l) => <span className="font-mono text-xs text-muted-foreground">{l.kind}</span> },
              { header: "Reference", cell: (l) => <span className="font-mono text-xs text-muted-foreground">{l.reference ?? "—"}</span> },
              {
                header: "Amount",
                align: "right",
                cell: (l) => (
                  <span className={l.amount < 0 ? "text-muted-foreground" : "text-emerald-600 dark:text-emerald-400"}>
                    {l.amount < 0 ? "" : "+"}
                    {formatMoney(l.amount)}
                  </span>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
