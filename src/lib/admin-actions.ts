// SERVER ONLY. Holds ADMIN_API_TOKEN — never import into a client component.
// Mutating admin actions (PRD §3.3 P1). Every call is POST-only, carries the
// acting super-admin's email for the backend audit row, and is bounded.
import { ENDPOINTS } from "@/lib/endpoints";

const BACKEND_URL = (process.env.BACKEND_URL ?? "").replace(/\/$/, "");
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN ?? "";
const USE_MOCK = process.env.ADMIN_MOCK === "1";

export interface ActionResult {
  ok: boolean;
  message: string;
}

async function postJson(
  path: string,
  body: Record<string, unknown>,
  timeoutMs = 8000
): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${ADMIN_API_TOKEN}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`POST ${path} → HTTP ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Run a mutation against the backend, stamping the actor for the audit row.
 * Returns a friendly result; with ADMIN_MOCK it no-ops and reports success so
 * the flow is testable before the backend routes exist.
 */
export async function runAction(
  path: string,
  body: Record<string, unknown>,
  actor: string,
  successMessage: string
): Promise<ActionResult> {
  if (USE_MOCK) return { ok: true, message: `${successMessage} (mock)` };
  try {
    await postJson(path, { ...body, actor });
    return { ok: true, message: successMessage };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed" };
  }
}

/* Typed wrappers, one per action endpoint. */
export const backendActions = {
  syncDomain: (orgId: string, domain: string, actor: string) =>
    runAction(ENDPOINTS.syncDomain.build(orgId), { domain }, actor, `Domain re-sync queued for ${domain}`),
  creditWallet: (orgId: string, amount: number, note: string, actor: string) =>
    runAction(ENDPOINTS.creditWallet.build(orgId), { amount, note, kind: "admin_grant" }, actor, `Credited $${amount}`),
  setPlan: (orgId: string, plan: string, extendDays: number, actor: string) =>
    runAction(ENDPOINTS.setPlan.build(orgId), { plan, extendDays }, actor, `Plan set to ${plan}${extendDays ? ` (+${extendDays}d)` : ""}`),
  toggleOrg: (orgId: string, enabled: boolean, actor: string) =>
    runAction(ENDPOINTS.toggleOrg.build(orgId), { enabled }, actor, enabled ? "Organization enabled" : "Organization disabled"),
  resendInvite: (orgId: string, email: string, actor: string) =>
    runAction(ENDPOINTS.resendInvite.build(orgId), { email }, actor, `Invite resent to ${email}`),
};
