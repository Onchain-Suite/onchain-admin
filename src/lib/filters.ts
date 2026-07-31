/**
 * Composable, URL-driven filters. Filter state lives in the query string so
 * every view is shareable and bookmarkable, and the server components read it
 * directly. Each page opts into the specs it needs (see FilterBar) — that's the
 * composability: add a spec to a page's list and it appears, parses, and flows
 * to the service with no extra wiring.
 */

export type Range = "24h" | "7d" | "30d" | "90d";
export type Provider = "all" | "acs" | "sendgrid" | "ses";
export type Plan = "all" | "PAYG" | "Starter" | "Growth" | "Scale";
export type HealthBand = "all" | "healthy" | "watch" | "risk";
export type Reputation = "all" | "healthy" | "warning" | "critical";
export type Level = "all" | "error" | "warning";
export type Verified = "all" | "verified" | "unverified";

export interface Filters {
  range: Range;
  provider: Provider;
  plan: Plan;
  health: HealthBand;
  reputation: Reputation;
  level: Level;
  verified: Verified;
}

export const DEFAULTS: Filters = {
  range: "30d",
  provider: "all",
  plan: "all",
  health: "all",
  reputation: "all",
  level: "all",
  verified: "all",
};

/** Shape of an App Router page's awaited `searchParams`. */
export type SearchParams = Record<string, string | string[] | undefined>;

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSpec {
  key: keyof Filters;
  label: string;
  options: FilterOption[];
}

export const RANGE_SPEC: FilterSpec = {
  key: "range",
  label: "Window",
  options: [
    { value: "24h", label: "Day" },
    { value: "7d", label: "Week" },
    { value: "30d", label: "Month" },
    { value: "90d", label: "Quarter" },
  ],
};

export const PROVIDER_SPEC: FilterSpec = {
  key: "provider",
  label: "Provider",
  options: [
    { value: "all", label: "All" },
    { value: "acs", label: "Azure ACS" },
    { value: "sendgrid", label: "SendGrid" },
    { value: "ses", label: "AWS SES" },
  ],
};

export const PLAN_SPEC: FilterSpec = {
  key: "plan",
  label: "Plan",
  options: [
    { value: "all", label: "All" },
    { value: "PAYG", label: "PAYG" },
    { value: "Starter", label: "Starter" },
    { value: "Growth", label: "Growth" },
    { value: "Scale", label: "Scale" },
  ],
};

export const HEALTH_SPEC: FilterSpec = {
  key: "health",
  label: "Health",
  options: [
    { value: "all", label: "All" },
    { value: "healthy", label: "Healthy" },
    { value: "watch", label: "Watch" },
    { value: "risk", label: "At risk" },
  ],
};

export const REPUTATION_SPEC: FilterSpec = {
  key: "reputation",
  label: "Reputation",
  options: [
    { value: "all", label: "All" },
    { value: "healthy", label: "Healthy" },
    { value: "warning", label: "Warning" },
    { value: "critical", label: "Critical" },
  ],
};

export const LEVEL_SPEC: FilterSpec = {
  key: "level",
  label: "Level",
  options: [
    { value: "all", label: "All" },
    { value: "error", label: "Errors" },
    { value: "warning", label: "Warnings" },
  ],
};

export const VERIFIED_SPEC: FilterSpec = {
  key: "verified",
  label: "Verified",
  options: [
    { value: "all", label: "All" },
    { value: "verified", label: "Verified" },
    { value: "unverified", label: "Unverified" },
  ],
};

const SPEC_BY_KEY: Record<keyof Filters, FilterSpec> = {
  range: RANGE_SPEC,
  provider: PROVIDER_SPEC,
  plan: PLAN_SPEC,
  health: HEALTH_SPEC,
  reputation: REPUTATION_SPEC,
  level: LEVEL_SPEC,
  verified: VERIFIED_SPEC,
};

type RawParams = Record<string, string | string[] | undefined>;

/** Parse a searchParams object into a fully-defaulted, validated Filters. */
export function parseFilters(params: RawParams): Filters {
  const out: Filters = { ...DEFAULTS };
  // Written through a string-keyed view: each value is validated against its
  // own key's option set first, so the runtime value is always a legal member.
  const writable = out as unknown as Record<string, string>;
  for (const key of Object.keys(SPEC_BY_KEY) as (keyof Filters)[]) {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value && SPEC_BY_KEY[key].options.some((o) => o.value === value)) {
      writable[key] = value;
    }
  }
  return out;
}

/* ── Range helpers (shared by mock + any live aggregation) ────────────────── */

export function rangeDays(range: Range): number {
  return { "24h": 1, "7d": 7, "30d": 30, "90d": 90 }[range];
}

/** Number of buckets to plot for a range. */
export function rangePoints(range: Range): number {
  return { "24h": 24, "7d": 7, "30d": 30, "90d": 90 }[range];
}

/** Flow-metric scale relative to the 30-day baseline (stock metrics ignore it). */
export function rangeFactor(range: Range): number {
  return rangeDays(range) / 30;
}

/** Human label for the active window, e.g. "last 7 days". */
export function rangeLabel(range: Range): string {
  return range === "24h" ? "last 24 hours" : `last ${rangeDays(range)} days`;
}

/**
 * Backend query string for the live path, mapping filter keys to API params
 * (range → window). Only the keys a call cares about are included.
 */
export function buildQuery(f: Filters, keys: (keyof Filters)[]): string {
  const q = new URLSearchParams();
  for (const key of keys) {
    const value = f[key];
    if (value === DEFAULTS[key]) continue;
    q.set(key === "range" ? "window" : key, value);
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}
