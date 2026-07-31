import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthPill } from "@/components/ui/health-pill";
import { Meter } from "@/components/ui/meter";
import { MockBanner } from "@/components/mock-banner";
import { adminApi } from "@/lib/admin-api";
import { cn, formatCompact, formatMoney, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: org, isMock, error } = await adminApi.org(id);

  return (
    <>
      <Link
        href="/orgs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        All organizations
      </Link>

      {isMock ? <MockBanner endpoint={`GET /admin/orgs/${id}`} error={error} /> : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{org.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {org.plan} · created {org.createdAt} · last active {timeAgo(org.lastActivity)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="info">Health {org.health}</Badge>
          <Badge tone="neutral">{org.members} members</Badge>
          <Badge tone="neutral">{formatMoney(org.walletBalance)} wallet</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Usage vs limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {org.usage.map((u) => (
              <div key={u.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{u.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCompact(u.used)} / {formatCompact(u.limit)}
                  </span>
                </div>
                <Meter used={u.used} limit={u.limit} className="mt-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Onboarding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {org.onboarding.map((s) => (
              <div key={s.step} className="flex items-center gap-2 text-sm">
                <CheckCircleIcon
                  className={cn(
                    "h-4 w-4",
                    s.done ? "text-emerald-500" : "text-muted-foreground/40"
                  )}
                  aria-hidden="true"
                />
                <span className={s.done ? "text-foreground" : "text-muted-foreground"}>
                  {s.step}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {org.membersList.map((m) => (
              <div key={m.email} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm text-foreground">{m.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.email}</div>
                </div>
                <Badge tone="neutral">{m.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domains</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {org.domains.map((d) => (
              <div key={d.domain} className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-xs text-foreground">{d.domain}</span>
                <HealthPill status={d.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PAYG ledger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {org.ledgerTail.map((l, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted-foreground">{l.kind}</div>
                  {l.reference ? (
                    <div className="truncate text-xs text-muted-foreground/70">{l.reference}</div>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "shrink-0 tabular-nums font-medium",
                    l.amount < 0 ? "text-muted-foreground" : "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {l.amount < 0 ? "" : "+"}
                  {formatMoney(l.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
