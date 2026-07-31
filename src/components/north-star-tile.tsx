import {
  ArrowDownRightIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/solid";

import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/ui/sparkline";
import type { NorthStar } from "@/lib/types";
import { cn, formatDelta } from "@/lib/utils";

export function NorthStarTile({ tile }: { tile: NorthStar }) {
  const t = tile.trend;
  // "good" = up when not inverted, down when inverted (e.g. failure rate).
  const good =
    !t || t.direction === "flat"
      ? null
      : t.invert
        ? t.direction === "down"
        : t.direction === "up";
  const toneClass =
    good === null
      ? "text-muted-foreground"
      : good
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-destructive";
  const Arrow =
    !t || t.direction === "flat"
      ? ArrowRightIcon
      : t.direction === "up"
        ? ArrowUpRightIcon
        : ArrowDownRightIcon;

  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {tile.label}
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold tabular-nums text-foreground">
            {tile.value}
          </div>
          {tile.sub ? (
            <div className="mt-0.5 text-xs text-muted-foreground">{tile.sub}</div>
          ) : null}
        </div>
        <Sparkline
          data={tile.spark}
          stroke={good === false ? "var(--destructive)" : "var(--chart-1)"}
          className="opacity-80"
        />
      </div>
      {t ? (
        <div className={cn("mt-3 flex items-center gap-1 text-xs font-medium", toneClass)}>
          <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          {t.direction === "flat" ? "no change" : `${formatDelta(t.deltaPct)} vs prev`}
        </div>
      ) : null}
    </Card>
  );
}
