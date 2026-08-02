"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { SortableTable, type SortColumn } from "@/components/ui/sortable-table";
import type { UserRow } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

type Verified = "all" | "verified" | "unverified";

export function UsersExplorer({ users }: { users: UserRow[] }) {
  const [q, setQ] = useState("");
  const [verified, setVerified] = useState<Verified>("all");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users.filter((u) => {
      if (needle && ![u.email, u.roles, u.id].some((f) => f.toLowerCase().includes(needle)))
        return false;
      if (verified === "verified" && !u.verified) return false;
      if (verified === "unverified" && u.verified) return false;
      return true;
    });
  }, [users, q, verified]);

  const columns: SortColumn<UserRow>[] = [
    { header: "Email", sortKey: (u) => u.email.toLowerCase(), cell: (u) => <span className="text-foreground">{u.email}</span> },
    { header: "Orgs", align: "right", sortKey: (u) => u.orgs, cell: (u) => u.orgs },
    { header: "Roles", sortKey: (u) => u.roles, cell: (u) => <span className="text-muted-foreground">{u.roles}</span> },
    {
      header: "Verified",
      sortKey: (u) => (u.verified ? 1 : 0),
      cell: (u) =>
        u.verified ? <Badge tone="success">verified</Badge> : <Badge tone="warning">unverified</Badge>,
    },
    {
      header: "Last session",
      align: "right",
      sortKey: (u) => u.lastSession ?? null,
      cell: (u) => (
        <span className="text-muted-foreground">{u.lastSession ? timeAgo(u.lastSession) : "never"}</span>
      ),
    },
    {
      header: "Joined",
      align: "right",
      sortKey: (u) => u.createdAt,
      cell: (u) => <span className="text-muted-foreground">{u.createdAt.slice(0, 10)}</span>,
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
            placeholder="Search email, role, or id…"
            aria-label="Search users"
            className="h-9 w-full rounded-lg border border-border/60 bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Select value={verified} onChange={(e) => setVerified(e.target.value as Verified)} aria-label="Filter by verification">
          <option value="all">All users</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </Select>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {rows.length} of {users.length}
        </span>
      </div>
      <SortableTable<UserRow>
        rows={rows}
        rowKey={(u) => u.id}
        empty="No users match."
        columns={columns}
      />
    </div>
  );
}
