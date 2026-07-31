// SERVER ONLY. Holds ADMIN_API_TOKEN — never import into a client component.
import {
  mockAnalytics,
  mockAudit,
  mockBilling,
  mockDeliverability,
  mockOrgDetail,
  mockOrgs,
  mockSnapshot,
  mockStatus,
  mockUsers,
  mockVisitors,
} from "@/lib/mock";
import type {
  AdminSnapshot,
  AnalyticsOverview,
  AuditEntry,
  BillingOps,
  DeliverabilityBoard,
  OrgDetail,
  OrgSummary,
  StatusBoard,
  UserRow,
  VisitorAnalytics,
} from "@/lib/types";

const BACKEND_URL = (process.env.BACKEND_URL ?? "").replace(/\/$/, "");
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN ?? "";
const USE_MOCK = process.env.ADMIN_MOCK === "1";

/**
 * Bounded, read-only GET against the backend admin API. Unwraps the shared
 * `{ success, data }` envelope. Every call has a timeout + abort so no page can
 * hang on a slow upstream.
 */
async function getJson<T>(path: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${ADMIN_API_TOKEN}`,
        accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}`);
    const body = (await res.json()) as unknown;
    if (body && typeof body === "object" && "data" in body) {
      return (body as { data: T }).data;
    }
    return body as T;
  } finally {
    clearTimeout(timer);
  }
}

export interface Read<T> {
  data: T;
  /** True when serving built-in sample data rather than live backend data. */
  isMock: boolean;
  /** Set when a live fetch failed and we fell back to sample data. */
  error?: string;
}

/**
 * Fetch `path`, or fall back to `fallback()` sample data when ADMIN_MOCK=1 or
 * the live call fails — so every page is always renderable. Read-only by design.
 */
async function read<T>(path: string, fallback: () => T): Promise<Read<T>> {
  if (USE_MOCK) return { data: fallback(), isMock: true };
  try {
    return { data: await getJson<T>(path), isMock: false };
  } catch (e) {
    return {
      data: fallback(),
      isMock: true,
      error: e instanceof Error ? e.message : "Failed to reach backend",
    };
  }
}

/* One read per PRD area (notes/prd.md §4). No mutating methods exist. */
export const adminApi = {
  snapshot: () => read<AdminSnapshot>("/admin/snapshot", mockSnapshot),
  status: () => read<StatusBoard>("/admin/status", mockStatus),
  analytics: () =>
    read<AnalyticsOverview>("/admin/analytics/overview", mockAnalytics),
  orgs: () => read<OrgSummary[]>("/admin/orgs", mockOrgs),
  org: (id: string) =>
    read<OrgDetail>(`/admin/orgs/${id}`, () => mockOrgDetail(id)),
  users: () => read<UserRow[]>("/admin/users", mockUsers),
  billing: () => read<BillingOps>("/admin/billing", mockBilling),
  deliverability: () =>
    read<DeliverabilityBoard>("/admin/email/providers/health", mockDeliverability),
  visitors: () =>
    read<VisitorAnalytics>("/admin/analytics/visitors", mockVisitors),
  audit: () => read<AuditEntry[]>("/admin/audit", mockAudit),
};
