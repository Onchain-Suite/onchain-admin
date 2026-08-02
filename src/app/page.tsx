import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { MockBanner } from "@/components/mock-banner";
import { OrgPicker } from "@/components/org-picker";
import { PageHeading, SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { type SearchParams } from "@/lib/filters";
import { getOrgAnalytics, getOrgBilling } from "@/lib/org-api";
import { getOrgId, getOrgOptions } from "@/lib/org-context";
import { getSystemStatus } from "@/lib/system";
import { formatCompact, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const org = await getOrgId(await searchParams);
  const [{ data: sys, isMock: sysMock, error: sysErr }, orgs] = await Promise.all([
    getSystemStatus(),
    getOrgOptions(),
  ]);
  const [analytics, billing] = org
    ? await Promise.all([getOrgAnalytics(org), getOrgBilling(org)])
    : [null, null];

  return (
    <>
      <PageHeading
        title="Overview"
        description="Platform health at a glance, plus a snapshot for a selected organization — all live from existing endpoints."
        action={
          sysMock ? null : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              Live
            </span>
          )
        }
      />
      {sysMock ? (
        <MockBanner endpoint="GET /health, /observability/failure-rate" error={sysErr} />
      ) : null}

      <SectionHeading>System health</SectionHeading>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center justify-between p-5">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Overall
            </div>
            <div className="mt-2 text-lg font-semibold capitalize text-foreground">
              {sys.overall}
            </div>
          </div>
          {sys.overall === "operational" ? (
            <CheckCircleIcon className="h-8 w-8 text-emerald-500" aria-hidden="true" />
          ) : (
            <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" aria-hidden="true" />
          )}
        </Card>
        <StatCard
          label="HTTP error rate"
          value={sys.failure ? formatPercent(sys.failure.httpErrorRate) : "—"}
          tone={sys.failure && sys.failure.httpErrorRate >= 0.01 ? "danger" : "default"}
        />
        <StatCard
          label="Queue failures"
          value={sys.failure ? String(sys.failure.queueFailed) : "—"}
          tone={sys.failure && sys.failure.queueFailed > 0 ? "danger" : "default"}
        />
        <StatCard
          label="Routes healthy"
          value={sys.routes ? `${sys.routes.observed - sys.routes.failing}/${sys.routes.observed}` : "—"}
          tone={sys.routes && sys.routes.failing > 0 ? "danger" : "default"}
        />
      </div>

      <SectionHeading>Organization snapshot</SectionHeading>
      <OrgPicker current={org} orgs={orgs} />
      {!org ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Enter an organization id to see its plan, messaging, and audience —
            or open{" "}
            <Link href="/analytics" className="text-primary hover:underline">
              Analytics
            </Link>{" "}
            /{" "}
            <Link href="/billing" className="text-primary hover:underline">
              Billing
            </Link>{" "}
            for the full view.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Plan" value={billing?.data.plan.label ?? "—"} />
          <StatCard
            label="Messages (30d)"
            value={formatCompact(analytics?.data.messagesSent ?? 0)}
          />
          <StatCard
            label="Contacts"
            value={formatCompact(analytics?.data.audience.total ?? 0)}
            hint={`${formatCompact(analytics?.data.audience.withWallet ?? 0)} with wallet`}
          />
          <StatCard
            label="Email open rate"
            value={`${(analytics?.data.email.openRate ?? 0).toFixed(1)}%`}
          />
        </div>
      )}
    </>
  );
}
