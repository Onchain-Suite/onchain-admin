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
