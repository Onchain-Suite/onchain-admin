import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
  /** Extra classes for the cell. */
  className?: string;
}

/** Read-only table. Header + rows from a typed column config; no interactivity. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty = "Nothing to show.",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: string;
}) {
  if (rows.length === 0) {
    return <p className="px-5 py-4 text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  "px-5 py-2.5 font-medium",
                  col.align === "right" && "text-right"
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
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
