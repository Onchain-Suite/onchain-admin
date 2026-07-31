import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-accent text-accent-foreground",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
