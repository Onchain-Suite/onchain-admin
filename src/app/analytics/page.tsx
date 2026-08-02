import { Card, CardContent } from "@/components/ui/card";
import { MockBanner } from "@/components/mock-banner";
import { OrgPicker } from "@/components/org-picker";
import { PageHeading, SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { type SearchParams } from "@/lib/filters";
import { getOrgAnalytics } from "@/lib/org-api";
import { getOrgId, getOrgOptions } from "@/lib/org-context";
import { formatCompact } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Rates from the API are already percentages (e.g. 58.33), not 0..1.
const pct = (v: number) => `${v.toFixed(1)}%`;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const org = await getOrgId(await searchParams);
  const [{ data, isMock, needsOrg, error }, orgs] = await Promise.all([
    getOrgAnalytics(org),
    getOrgOptions(),
  ]);

  return (
    <>
      <PageHeading
        title="Analytics"
        description={`Messaging, audience, identity, and automations for an organization — live from existing read routes (last ${data.rangeDays} days). Read-only.`}
      />
      <OrgPicker current={org} orgs={orgs} />

      {needsOrg ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Enter an organization id above to load its analytics.
          </CardContent>
        </Card>
      ) : (
        <>
          {isMock ? (
            <MockBanner
              endpoint="GET /campaigns/analytics/overview, /audience/overview, …"
              error={error}
            />
          ) : null}

          <SectionHeading>Messaging · last {data.rangeDays} days</SectionHeading>
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Messages sent" value={formatCompact(data.messagesSent)} />
            <StatCard label="Emails sent" value={formatCompact(data.email.sent)} hint={`${formatCompact(data.email.uniqueOpens)} unique opens`} />
            <StatCard label="Open rate" value={pct(data.email.openRate)} />
            <StatCard label="Click rate" value={pct(data.email.clickRate)} />
            <StatCard label="Bounce rate" value={pct(data.email.bounceRate)} tone={data.email.bounceRate >= 2 ? "danger" : "default"} />
            <StatCard label="Unsub rate" value={pct(data.email.unsubscribeRate)} />
            <StatCard label="In-app sent" value={formatCompact(data.inapp.sent)} hint={`${formatCompact(data.inapp.viewed)} viewed`} />
            <StatCard label="In-app view rate" value={pct(data.inapp.viewRate)} />
          </div>

          <SectionHeading>Audience</SectionHeading>
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Contacts" value={formatCompact(data.audience.total)} hint={`${formatCompact(data.audience.withWallet)} with wallet`} />
            <StatCard label="Avg health" value={data.audience.avgHealth.toFixed(1)} />
            <StatCard label="Active" value={formatCompact(data.audience.active)} />
            <StatCard label="Cooling / cold" value={`${formatCompact(data.audience.cooling)} / ${formatCompact(data.audience.cold)}`} />
          </div>

          <SectionHeading>Identity</SectionHeading>
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Registered users" value={formatCompact(data.identity.registeredUsers)} hint={`${formatCompact(data.identity.members)} members`} />
            <StatCard label="Verified email" value={formatCompact(data.identity.email)} />
            <StatCard label="Verified Telegram" value={formatCompact(data.identity.telegram)} />
            <StatCard label="Verified X" value={formatCompact(data.identity.x)} />
            <StatCard label="Verified Discord" value={formatCompact(data.identity.discord)} />
            <StatCard label="Verified Farcaster" value={formatCompact(data.identity.farcaster)} />
          </div>

          <SectionHeading>Automations</SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active" value={formatCompact(data.automations.active)} />
            <StatCard label="Entries" value={formatCompact(data.automations.entries)} />
            <StatCard label="Conversions" value={formatCompact(data.automations.conversions)} />
            <StatCard label="Revenue" value={formatCompact(data.automations.revenue)} />
          </div>
        </>
      )}
    </>
  );
}
