import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Compact number formatting for stat tiles: 1234 → "1.2K". */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Percentage with one decimal, e.g. 0.9873 → "98.7%". */
export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}
