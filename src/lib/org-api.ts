// SERVER ONLY. Holds ADMIN_API_TOKEN — never import into a client component.
// Org-scoped reads against EXISTING backend routes: authenticated with the
// read-only admin token (Bearer) and the selected org (`x-org-id`). No new
// backend endpoints — these are the routes already in the inventory.

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
