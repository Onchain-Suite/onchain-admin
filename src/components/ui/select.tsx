import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Native `<select>` styled to the design system, with a chevron affordance and
 * a token-based focus ring. Presentational (no state) so it works in both
 * server and client components. Width is intrinsic — pass `min-w-*`/`w-*` via
 * `className` when a fixed width is wanted.
 */
export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative inline-block">
      <select
        className={cn(
          "h-9 cursor-pointer appearance-none rounded-lg border border-border/60 bg-background pl-3 pr-9 text-sm text-foreground outline-none transition-colors hover:border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronUpDownIcon
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}
