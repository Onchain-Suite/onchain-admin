"use client";

import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * Org context for the org-scoped pages. There's no "list all orgs" endpoint, so
 * the admin enters an org id; it's kept in the URL (`?org=`) — shareable and
 * read by the server components, which forward it to the backend as `x-org-id`.
 */
export function OrgField({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(current);

  const apply = () => {
    const next = new URLSearchParams(params.toString());
    const v = value.trim();
    if (v) next.set("org", v);
    else next.delete("org");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card p-3">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <BuildingOffice2Icon className="h-4 w-4" aria-hidden="true" />
        Organization
      </span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") apply();
        }}
        placeholder="org id  (sent as x-org-id)"
        aria-label="Organization id"
        className="h-9 w-72 rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
      />
      <button
        type="button"
        onClick={apply}
        className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Load
      </button>
      {current ? (
        <span className="text-xs text-muted-foreground">
          viewing <code className="font-mono text-foreground">{current}</code>
        </span>
      ) : null}
    </div>
  );
}
