import { cn } from "@/lib/utils";

/** Usage-vs-limit bar. Turns amber ≥75% and red ≥90%. */
export function Meter({
  used,
  limit,
  className,
}: {
  used: number;
  limit: number;
  className?: string;
}) {
  const ratio = limit > 0 ? Math.min(1, used / limit) : 0;
  const pct = Math.round(ratio * 100);
  const tone =
    ratio >= 0.9
      ? "bg-destructive"
      : ratio >= 0.75
        ? "bg-amber-500"
        : "bg-primary";
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}
