"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/ui/data-table";
import type { OrgSummary } from "@/lib/types";
import { cn, formatCompact, formatMoney } from "@/lib/utils";

function HealthScore({ value }: { value: number }) {
  const tone =
    value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-destructive";
  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <span className={cn("h-2 w-2 rounded-full", tone)} aria-hidden="true" />
      {value}
    </span>
  );
}

export function OrgsExplorer({ orgs }: { orgs: OrgSummary[] }) {
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return orgs;
    return orgs.filter((o) =>
      [o.name, o.plan, o.id].some((f) => f.toLowerCase().includes(needle))
    );
  }, [orgs, q]);

  return (
    <div>
      <div className="relative mb-3 max-w-sm">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, plan, or id…"
          aria-label="Search organizations"
          className="h-9 w-full rounded-lg border border-border/60 bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
        />
      </div>
      <DataTable<OrgSummary>
        rows={rows}
        rowKey={(o) => o.id}
        empty="No organizations match."
        columns={[
          {
            header: "Organization",
            cell: (o) => (
              <Link href={`/orgs/${o.id}`} className="font-medium text-foreground hover:text-primary">
                {o.name}
              </Link>
            ),
          },
          { header: "Plan", cell: (o) => <span className="text-muted-foreground">{o.plan}</span> },
          { header: "Members", align: "right", cell: (o) => o.members },
          { header: "Messages 30d", align: "right", cell: (o) => formatCompact(o.messages30d) },
          { header: "Wallet", align: "right", cell: (o) => formatMoney(o.walletBalance) },
          { header: "Health", align: "right", cell: (o) => <HealthScore value={o.health} /> },
        ]}
      />
    </div>
  );
}
