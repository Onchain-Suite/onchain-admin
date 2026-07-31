"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import type { UserRow } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export function UsersExplorer({ users }: { users: UserRow[] }) {
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((u) =>
      [u.email, u.roles, u.id].some((f) => f.toLowerCase().includes(needle))
    );
  }, [users, q]);

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
          placeholder="Search email, role, or id…"
          aria-label="Search users"
          className="h-9 w-full rounded-lg border border-border/60 bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
        />
      </div>
      <DataTable<UserRow>
        rows={rows}
        rowKey={(u) => u.id}
        empty="No users match."
        columns={[
          { header: "Email", cell: (u) => <span className="text-foreground">{u.email}</span> },
          { header: "Orgs", align: "right", cell: (u) => u.orgs },
          { header: "Roles", cell: (u) => <span className="text-muted-foreground">{u.roles}</span> },
          {
            header: "Verified",
            cell: (u) =>
              u.verified ? (
                <Badge tone="success">verified</Badge>
              ) : (
                <Badge tone="warning">unverified</Badge>
              ),
          },
          {
            header: "Last session",
            align: "right",
            cell: (u) => (
              <span className="text-muted-foreground">
                {u.lastSession ? timeAgo(u.lastSession) : "never"}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
