"use client";

import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { Fragment, type ReactNode, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc";

export interface SortColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
  className?: string;
  /** Provide to make the column sortable. Return the raw value to order by. */
  sortKey?: (row: T) => string | number | boolean | null | undefined;
}

const isEmpty = (v: unknown) => v == null || v === "";

/** Compare two sort values; empties always sort last regardless of direction. */
function compare(a: unknown, b: unknown, dir: SortDir): number {
  const ae = isEmpty(a);
  const be = isEmpty(b);
  if (ae && be) return 0;
  if (ae) return 1;
  if (be) return -1;
  const base =
    typeof a === "number" && typeof b === "number"
      ? a - b
      : String(a).localeCompare(String(b), undefined, {
          numeric: true,
          sensitivity: "base",
        });
  return dir === "asc" ? base : -base;
}

/**
 * Client table with click-to-sort headers. Columns with a `sortKey` render a
 * sort button (first click ascending, then toggles); the active column shows a
 * direction chevron. Only sorting is stateful here — filter/search upstream and
 * pass the reduced `rows`.
 */
export function SortableTable<T>({
  columns,
  rows,
  rowKey,
  empty = "Nothing to show.",
  initialSort,
}: {
  columns: SortColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: string;
  initialSort?: { index: number; dir: SortDir };
}) {
  const [sort, setSort] = useState<{ index: number; dir: SortDir } | null>(
    initialSort ?? null
  );

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const key = columns[sort.index]?.sortKey;
    if (!key) return rows;
    return [...rows].sort((a, b) => compare(key(a), key(b), sort.dir));
  }, [rows, sort, columns]);

  const toggle = (index: number) =>
    setSort((prev) =>
      prev && prev.index === index
        ? { index, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { index, dir: "asc" }
    );

  if (rows.length === 0) {
    return <p className="px-5 py-4 text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            {columns.map((col, i) => {
              const active = sort?.index === i;
              return (
                <th
                  key={i}
                  aria-sort={
                    active
                      ? sort!.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={cn(
                    "px-5 py-2.5 font-medium",
                    col.align === "right" && "text-right"
                  )}
                >
                  {col.sortKey ? (
                    <button
                      type="button"
                      onClick={() => toggle(i)}
                      className={cn(
                        "group inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground",
                        active && "text-foreground",
                        col.align === "right" && "flex-row-reverse"
                      )}
                    >
                      <span>{col.header}</span>
                      {active ? (
                        sort!.dir === "asc" ? (
                          <ChevronUpIcon className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ChevronDownIcon className="h-3 w-3" aria-hidden="true" />
                        )
                      ) : (
                        <ChevronUpDownIcon
                          className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-border/40 last:border-0 hover:bg-muted/30"
            >
              {columns.map((col, i) => (
                <Fragment key={i}>
                  <td
                    className={cn(
                      "px-5 py-2.5 align-middle",
                      col.align === "right" && "text-right tabular-nums",
                      col.className
                    )}
                  >
                    {col.cell(row)}
                  </td>
                </Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
