"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { DEFAULTS, type FilterSpec, type Filters } from "@/lib/filters";
import { cn } from "@/lib/utils";

/**
 * Renders a composable row of filter controls. Pass only the specs a page
 * needs. Each selection updates the URL query string (preserving the others),
 * which re-runs the server component with the new filters.
 */
export function FilterBar({ specs }: { specs: FilterSpec[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const set = useCallback(
    (key: keyof Filters, value: string) => {
      const next = new URLSearchParams(params.toString());
      // Keep the URL clean: drop params that equal their default.
      if (value === DEFAULTS[key]) next.delete(key);
      else next.set(key, value);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-border/60 bg-card p-3">
      {specs.map((spec) => {
        const current = params.get(spec.key) ?? DEFAULTS[spec.key];
        return (
          <div key={spec.key} className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {spec.label}
            </span>
            <div className="inline-flex rounded-lg border border-border/60 bg-background p-0.5">
              {spec.options.map((opt) => {
                const active = current === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set(spec.key, opt.value)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
