import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "danger";
}) {
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-2 text-2xl font-semibold tabular-nums",
          tone === "danger" ? "text-destructive" : "text-foreground"
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </Card>
  );
}
