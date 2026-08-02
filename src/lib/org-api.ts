// SERVER ONLY. Holds ADMIN_API_TOKEN — never import into a client component.
// Backend reads authenticated with the read-only admin token (Bearer). Org-
// scoped routes also send the selected org as `x-org-id`; platform routes
// (/admin/*) don't. Everything falls back to sample data if a route 404s.
import type { AuditEntry, UserRow } from "@/lib/types";

const BASE = (process.env.BACKEND_URL ?? "").replace(/\/$/, "");
const TOKEN = process.env.ADMIN_API_TOKEN ?? "";
const USE_MOCK = process.env.ADMIN_MOCK === "1";

export interface OrgRead<T> {
  data: T;
  /** true when serving sample data (mock mode or the call failed). */
  isMock: boolean;
  /** true when no org id is selected yet — the page should prompt for one. */
  needsOrg?: boolean;
  error?: string;
}

async function getOrg<T>(path: string, orgId: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${TOKEN}`,
        "x-org-id": orgId,
        accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}`);
    const body = (await res.json()) as { data?: T } | T;
    return body && typeof body === "object" && "data" in body
      ? (body as { data: T }).data
      : (body as T);
  } finally {
    clearTimeout(timer);
  }
}

/** Platform-scoped GET (no x-org-id) for the /admin/* aggregate routes. */
async function getPlatform<T>(path: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "GET",
      headers: { authorization: `Bearer ${TOKEN}`, accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}`);
    const body = (await res.json()) as { data?: T } | T;
    return body && typeof body === "object" && "data" in body
      ? (body as { data: T }).data
      : (body as T);
  } finally {
    clearTimeout(timer);
  }
}

/** Unwrap either `{ items, total }` or a bare array into `T[]`. */
function toItems<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (isObj(payload) && Array.isArray(payload.items)) return payload.items as T[];
  return [];
}

/* ── Domains (GET /sender-identities/domains/authentication) ─────────────────
 * The payload arrives either as an array of rows or an object keyed by domain;
 * both forms are handled (mirrors the main app's extractDomainMap). */
export interface OrgDomain {
  domain: string;
  dkim: boolean;
  spf: boolean;
  status: string;
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const truthy = (v: unknown): boolean =>
  v === true ||
  (typeof v === "string" &&
    ["pass", "passed", "verified", "true", "valid", "up", "ok"].includes(
      v.trim().toLowerCase()
    ));

const str = (...vals: unknown[]): string => {
  for (const v of vals) if (typeof v === "string" && v.trim()) return v.trim();
  return "";
};

function parseDomains(payload: unknown): OrgDomain[] {
  const root =
    isObj(payload) && "data" in payload ? (payload as { data: unknown }).data : payload;

  if (Array.isArray(root)) {
    return root.filter(isObj).map((e) => ({
      domain: str(e.domain, e.name, e.hostname, e.host),
      dkim: truthy(e.dkim ?? e.dkimValid ?? e.dkimVerified ?? e.dkimStatus),
      spf: truthy(e.spf ?? e.spfValid ?? e.spfVerified ?? e.spfStatus),
      status: str(e.status, e.verificationStatus, e.state),
    }));
  }
  if (isObj(root)) {
    return Object.entries(root)
      .filter(([, v]) => isObj(v))
      .map(([domain, v]) => {
        const o = v as Record<string, unknown>;
        return {
          domain,
          dkim: truthy(o.dkim ?? o.dkimValid ?? o.dkimVerified),
          spf: truthy(o.spf ?? o.spfValid ?? o.spfVerified),
          status: str(o.status, o.verificationStatus, o.state),
        };
      });
  }
  return [];
}

export async function getOrgDomains(orgId: string): Promise<OrgRead<OrgDomain[]>> {
  if (!orgId) return { data: [], isMock: false, needsOrg: true };
  if (USE_MOCK) return { data: mockDomains(), isMock: true };
  try {
    const payload = await getOrg<unknown>(
      "/sender-identities/domains/authentication",
      orgId
    );
    return { data: parseDomains(payload), isMock: false };
  } catch (e) {
    return {
      data: mockDomains(),
      isMock: true,
      error: e instanceof Error ? e.message : "Failed to reach backend",
    };
  }
}

function mockDomains(): OrgDomain[] {
  return [
    { domain: "mail.example.xyz", dkim: true, spf: true, status: "verified" },
    { domain: "example.xyz", dkim: false, spf: true, status: "pending" },
  ];
}

/* ── Analytics (org-scoped, composed from existing read routes) ──────────────
 * GET /campaigns/analytics/overview, /audience/overview, /identity/stats,
 * /automations/metrics — all accept the admin key + x-org-id. Rates from the
 * API are already percentages (e.g. openRate 58.33), not 0..1. */
export interface OrgAnalytics {
  rangeDays: number;
  email: {
    sent: number;
    delivered: number;
    uniqueOpens: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
  };
  inapp: { sent: number; viewed: number; viewRate: number; clickRate: number };
  messagesSent: number;
  audience: {
    total: number;
    withWallet: number;
    avgHealth: number;
    active: number;
    cooling: number;
    cold: number;
  };
  identity: {
    registeredUsers: number;
    members: number;
    email: number;
    telegram: number;
    x: number;
    discord: number;
    farcaster: number;
  };
  automations: { active: number; entries: number; conversions: number; revenue: number };
}

interface CampaignsResp {
  rangeDays?: number;
  email?: Partial<OrgAnalytics["email"]> & Record<string, number>;
  inapp?: Record<string, number>;
  totals?: { messagesSent?: number };
}
interface AudienceResp {
  total?: number;
  withWallet?: number;
  avgHealth?: number;
  activeCount?: number;
  coolingCount?: number;
  coldCount?: number;
}
interface IdentityResp {
  registeredUsers?: number;
  groups?: Record<string, number>;
}
interface AutomationsResp {
  active?: number;
  entries?: number;
  conversions?: number;
  revenue?: number;
}

const n = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

async function getOrgOrNull<T>(path: string, orgId: string): Promise<T | null> {
  try {
    return await getOrg<T>(path, orgId);
  } catch {
    return null;
  }
}

export async function getOrgAnalytics(orgId: string): Promise<OrgRead<OrgAnalytics>> {
  if (!orgId) return { data: emptyAnalytics(), isMock: false, needsOrg: true };
  if (USE_MOCK) return { data: emptyAnalytics(), isMock: true };

  const [c, a, i, au] = await Promise.all([
    getOrgOrNull<CampaignsResp>("/campaigns/analytics/overview", orgId),
    getOrgOrNull<AudienceResp>("/audience/overview", orgId),
    getOrgOrNull<IdentityResp>("/identity/stats", orgId),
    getOrgOrNull<AutomationsResp>("/automations/metrics", orgId),
  ]);

  if (!c && !a && !i && !au) {
    return {
      data: emptyAnalytics(),
      isMock: true,
      error: "backend unreachable or key not authorized for these routes",
    };
  }

  const groups = i?.groups ?? {};
  return {
    data: {
      rangeDays: n(c?.rangeDays) || 30,
      email: {
        sent: n(c?.email?.sent),
        delivered: n(c?.email?.delivered),
        uniqueOpens: n(c?.email?.uniqueOpens),
        openRate: n(c?.email?.openRate),
        clickRate: n(c?.email?.clickRate),
        bounceRate: n(c?.email?.bounceRate),
        unsubscribeRate: n(c?.email?.unsubscribeRate),
      },
      inapp: {
        sent: n(c?.inapp?.sent),
        viewed: n(c?.inapp?.viewed),
        viewRate: n(c?.inapp?.viewRate),
        clickRate: n(c?.inapp?.clickRate),
      },
      messagesSent: n(c?.totals?.messagesSent),
      audience: {
        total: n(a?.total),
        withWallet: n(a?.withWallet),
        avgHealth: n(a?.avgHealth),
        active: n(a?.activeCount),
        cooling: n(a?.coolingCount),
        cold: n(a?.coldCount),
      },
      identity: {
        registeredUsers: n(i?.registeredUsers),
        members: n(groups.members),
        email: n(groups.verified_email),
        telegram: n(groups.verified_telegram),
        x: n(groups.verified_x),
        discord: n(groups.verified_discord),
        farcaster: n(groups.verified_farcaster),
      },
      automations: {
        active: n(au?.active),
        entries: n(au?.entries),
        conversions: n(au?.conversions),
        revenue: n(au?.revenue),
      },
    },
    isMock: false,
  };
}

function emptyAnalytics(): OrgAnalytics {
  return {
    rangeDays: 30,
    email: { sent: 0, delivered: 0, uniqueOpens: 0, openRate: 0, clickRate: 0, bounceRate: 0, unsubscribeRate: 0 },
    inapp: { sent: 0, viewed: 0, viewRate: 0, clickRate: 0 },
    messagesSent: 0,
    audience: { total: 0, withWallet: 0, avgHealth: 0, active: 0, cooling: 0, cold: 0 },
    identity: { registeredUsers: 0, members: 0, email: 0, telegram: 0, x: 0, discord: 0, farcaster: 0 },
    automations: { active: 0, entries: 0, conversions: 0, revenue: 0 },
  };
}

/* ── Billing (GET /billing/plan-usage/{organizationId}) ──────────────────────
 * Accepts the admin key + org in the path. limit -1 = unlimited. */
export interface OrgMeter {
  name: string;
  used: number;
  limit: number; // -1 = unlimited
  percent: number;
  status: string;
}
export interface OrgBilling {
  plan: { key: string; label: string; monthlyPrice: number };
  period: string;
  meters: OrgMeter[];
}

interface PlanUsageResp {
  plan?: { key?: string; label?: string; monthlyPrice?: number };
  period?: string;
  meters?: Record<
    string,
    { used?: number; limit?: number; percent?: number; status?: string }
  >;
}

const METER_LABELS: Record<string, string> = {
  contacts: "Contacts",
  trackedWallets: "Tracked wallets",
  emailsPerMonth: "Emails / month",
  aiCredits: "AI credits",
  goldrushCredits: "GoldRush credits",
  seats: "Seats",
  automations: "Automations",
  apiKeys: "API keys",
};

export async function getOrgBilling(orgId: string): Promise<OrgRead<OrgBilling>> {
  if (!orgId) return { data: emptyBilling(), isMock: false, needsOrg: true };
  if (USE_MOCK) return { data: emptyBilling(), isMock: true };
  try {
    const r = await getOrg<PlanUsageResp>(`/billing/plan-usage/${orgId}`, orgId);
    return {
      data: {
        plan: {
          key: r.plan?.key ?? "—",
          label: r.plan?.label ?? "—",
          monthlyPrice: n(r.plan?.monthlyPrice),
        },
        period: r.period ?? "",
        meters: Object.entries(r.meters ?? {}).map(([key, m]) => ({
          name: METER_LABELS[key] ?? key,
          used: n(m.used),
          limit: typeof m.limit === "number" ? m.limit : -1,
          percent: n(m.percent),
          status: m.status ?? "ok",
        })),
      },
      isMock: false,
    };
  } catch (e) {
    return {
      data: emptyBilling(),
      isMock: true,
      error: e instanceof Error ? e.message : "Failed to reach backend",
    };
  }
}

function emptyBilling(): OrgBilling {
  return { plan: { key: "—", label: "—", monthlyPrice: 0 }, period: "", meters: [] };
}

/* ── Platform lists (GET /admin/organizations|users|audit) ───────────────────
 * New backend routes (see docs/endpoints-to-build.md). Until they exist they
 * 404 and we fall back to sample data. Accept `{ items, total }` or a bare
 * array. */
export interface OrgListItem {
  id: string;
  name: string;
  plan: string;
  members: number;
  contacts?: number;
  messages30d?: number;
  walletBalance?: number;
  bounceRate?: number; // 0..1
  complaintRate?: number; // 0..1
  reputationStatus?: string; // "ok" | "warning" | "critical" | …
  createdAt: string;
  lastActivity?: string | null;
}

export async function getOrganizations(): Promise<OrgRead<OrgListItem[]>> {
  if (USE_MOCK) return { data: sampleOrgs(), isMock: true };
  try {
    // Pull the whole fleet (24 today) for the aggregate + at-risk views.
    const items = toItems<OrgListItem>(await getPlatform("/admin/organizations?limit=500"));
    return { data: items, isMock: false };
  } catch (e) {
    return {
      data: sampleOrgs(),
      isMock: true,
      error: e instanceof Error ? e.message : "endpoint not available",
    };
  }
}

export async function getUsers(): Promise<OrgRead<UserRow[]>> {
  if (USE_MOCK) return { data: sampleUsers(), isMock: true };
  try {
    return { data: toItems<UserRow>(await getPlatform("/admin/users?limit=500")), isMock: false };
  } catch (e) {
    return {
      data: sampleUsers(),
      isMock: true,
      error: e instanceof Error ? e.message : "endpoint not available",
    };
  }
}

export async function getAudit(): Promise<OrgRead<AuditEntry[]>> {
  if (USE_MOCK) return { data: sampleAudit(), isMock: true };
  try {
    return { data: toItems<AuditEntry>(await getPlatform("/admin/audit")), isMock: false };
  } catch (e) {
    return {
      data: sampleAudit(),
      isMock: true,
      error: e instanceof Error ? e.message : "endpoint not available",
    };
  }
}

function sampleOrgs(): OrgListItem[] {
  return [
    { id: "org_1", name: "Aster Labs", plan: "Growth", members: 8, contacts: 42_100, messages30d: 128_400, createdAt: "2026-03-02", lastActivity: "2026-07-31" },
    { id: "org_2", name: "Nimbus Protocol", plan: "Scale", members: 14, contacts: 210_500, messages30d: 302_100, createdAt: "2026-01-19", lastActivity: "2026-07-31" },
    { id: "org_3", name: "Meridian", plan: "Starter", members: 3, contacts: 3_200, messages30d: 9_800, createdAt: "2026-06-24", lastActivity: "2026-07-29" },
  ];
}

function sampleUsers(): UserRow[] {
  return [
    { id: "u_1", email: "ada@asterlabs.xyz", orgs: 1, roles: "OWNER", verified: true, createdAt: "2026-03-02", lastSession: "2026-07-31T09:20:00Z" },
    { id: "u_2", email: "reza@nimbus.xyz", orgs: 2, roles: "ADMIN, MEMBER", verified: true, createdAt: "2026-01-20", lastSession: "2026-07-31T07:02:00Z" },
    { id: "u_3", email: "noreply@harbor.xyz", orgs: 0, roles: "—", verified: false, createdAt: "2026-07-10" },
  ];
}

function sampleAudit(): AuditEntry[] {
  return [
    { id: "a1", at: "2026-07-31T09:50:00Z", actor: "jorshimayor", action: "domain.resync", target: "Onchain Suite · onchain-suite.xyz", detail: "Re-ran verification" },
    { id: "a2", at: "2026-07-30T15:10:00Z", actor: "Olusegun-Aborode", action: "wallet.credit", target: "Aster Labs · +$50", detail: "admin_grant" },
  ];
}
