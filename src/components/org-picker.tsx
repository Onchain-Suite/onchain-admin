"use client";

import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Select } from "@/components/ui/select";

export interface OrgOption {
  id: string;
  name: string;
}

const inputCls =
  "h-9 rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50";

/**
 * Select an org. When the org list is available (GET /admin/organizations
 * shipped) it's a **name** dropdown; until then it falls back to a manual
 * id field. Either way the chosen id goes to the URL (`?org=`) and the
 * `admin_org` cookie, and is sent to the backend as `x-org-id`.
 */
export function OrgPicker({
  current,
  orgs,
}: {
  current: string;
  orgs: OrgOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(current);

  const setOrg = (v: string) => {
    const next = new URLSearchParams(params.toString());
    if (v) {
      next.set("org", v);
      document.cookie = `admin_org=${encodeURIComponent(v)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
    } else {
      next.delete("org");
      document.cookie = "admin_org=; path=/; max-age=0; samesite=lax";
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card p-3">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <BuildingOffice2Icon className="h-4 w-4" aria-hidden="true" />
        Organization
      </span>

      {orgs.length > 0 ? (
        <Select
          value={current}
          onChange={(e) => setOrg(e.target.value)}
          aria-label="Organization"
          className="min-w-64"
        >
          <option value="">Select an organization…</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
      ) : (
        <>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setOrg(value.trim());
            }}
            placeholder="org id  (sent as x-org-id)"
            aria-label="Organization id"
            className={`${inputCls} w-72`}
          />
          <button
            type="button"
            onClick={() => setOrg(value.trim())}
            className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Load
          </button>
        </>
      )}
    </div>
  );
}
