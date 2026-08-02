"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Select } from "@/components/ui/select";
import { SortableTable, type SortColumn } from "@/components/ui/sortable-table";
import { Badge } from "@/components/ui/badge";
import { isAtRisk } from "@/lib/fleet";
import type { OrgListItem } from "@/lib/org-api";
import { formatCompact, formatMoney, formatPercent } from "@/lib/utils";

const repTone = (s?: string): "success" | "warning" | "danger" => {
  const v = (s ?? "ok").toLowerCase();
  if (v === "critical") return "danger";
  if (v === "warning") return "warning";
  return "success";
};

type Risk = "all" | "at-risk" | "healthy";

export function OrgsExplorer({ orgs }: { orgs: OrgListItem[] }) {
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState("all");
  const [risk, setRisk] = useState<Risk>("all");

  const plans = useMemo(
    () => Array.from(new Set(orgs.map((o) => o.plan))).sort(),
    [orgs]
  );

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return orgs.filter((o) => {
      if (needle && ![o.name, o.plan, o.id].some((f) => f.toLowerCase().includes(needle)))
        return false;
      if (plan !== "all" && o.plan !== plan) return false;
      if (risk === "at-risk" && !isAtRisk(o)) return false;
      if (risk === "healthy" && isAtRisk(o)) return false;
      return true;
    });
  }, [orgs, q, plan, risk]);

  const columns: SortColumn<OrgListItem>[] = [
    {
      header: "Organization",
      sortKey: (o) => o.name.toLowerCase(),
      cell: (o) => (
        <Link href={`/analytics?org=${o.id}`} className="font-medium text-foreground hover:text-primary">
          {o.name}
        </Link>
      ),
    },
    { header: "Plan", sortKey: (o) => o.plan, cell: (o) => <span className="text-muted-foreground">{o.plan}</span> },
    { header: "Members", align: "right", sortKey: (o) => o.members, cell: (o) => o.members },
    {
      header: "Messages 30d",
      align: "right",
      sortKey: (o) => o.messages30d ?? null,
      cell: (o) => (o.messages30d != null ? formatCompact(o.messages30d) : "—"),
    },
    {
      header: "Wallet",
      align: "right",
      sortKey: (o) => o.walletBalance ?? null,
      cell: (o) => (o.walletBalance != null ? formatMoney(o.walletBalance) : "—"),
    },
    {
      header: "Bounce",
      align: "right",
      sortKey: (o) => o.bounceRate ?? null,
      cell: (o) => (
        <span className={(o.bounceRate ?? 0) >= 0.02 ? "text-destructive" : "text-muted-foreground"}>
          {formatPercent(o.bounceRate ?? 0)}
        </span>
      ),
    },
    {
      header: "Reputation",
      align: "right",
      sortKey: (o) => o.reputationStatus ?? "ok",
      cell: (o) => <Badge tone={repTone(o.reputationStatus)}>{o.reputationStatus ?? "ok"}</Badge>,
    },
    {
      header: "Created",
      align: "right",
      sortKey: (o) => o.createdAt,
      cell: (o) => <span className="text-muted-foreground">{o.createdAt.slice(0, 10)}</span>,
    },
  ];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, plan, or id…"
            aria-label="Search organizations"
            className="h-9 w-full rounded-lg border border-border/60 bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Select value={plan} onChange={(e) => setPlan(e.target.value)} aria-label="Filter by plan">
          <option value="all">All plans</option>
          {plans.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Select value={risk} onChange={(e) => setRisk(e.target.value as Risk)} aria-label="Filter by risk">
          <option value="all">All health</option>
          <option value="at-risk">At risk</option>
          <option value="healthy">Healthy</option>
        </Select>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {rows.length} of {orgs.length}
        </span>
      </div>
      <SortableTable<OrgListItem>
        rows={rows}
        rowKey={(o) => o.id}
        empty="No organizations match."
        columns={columns}
      />
    </div>
  );
}
