/**
 * Central integration map: every backend endpoint the console talks to, in one
 * place, so the frontend and backend converge on one contract.
 *
 * `status` is the gap report in code:
 *  - "new"      → an aggregate/action route the backend must add for the admin
 *                 surface (the PRD's §3/§4 endpoints). `sources` lists the
 *                 EXISTING endpoints/tables it composes (from notes/endpoints.md).
 *  - "existing" → already live in the inventory; consumed as-is.
 *
 * Reads live in admin-api.ts, mutations in admin-actions.ts — both build their
 * URLs from here so there is a single source of truth for paths.
 */

export type EndpointStatus = "existing" | "new";

export interface AdminEndpoint {
  method: "GET" | "POST";
  /** Path builder; `id` is the org id for per-org routes. */
  build: (id?: string) => string;
  status: EndpointStatus;
  /** Existing endpoints/tables this composes, for the backend implementer. */
  sources: string;
}

export const ENDPOINTS = {
  // ── Reads (aggregate; PRD §3.1–§3.5b) ──────────────────────────────────────
  snapshot: { method: "GET", build: () => "/admin/snapshot", status: "new", sources: "/health/*, billing, delivery_events, /metrics" },
  status: { method: "GET", build: () => "/admin/status", status: "new", sources: "/health, /health/queues|apis|worker, /observability/*, /metrics, Bull Board" },
  analytics: { method: "GET", build: () => "/admin/analytics/overview", status: "new", sources: "organization, delivery_events, credit_ledger, aiQueryLog, app_events, onboarding" },
  orgs: { method: "GET", build: () => "/admin/orgs", status: "new", sources: "organization (23), organizations (7), usage meters" },
  org: { method: "GET", build: (id) => `/admin/orgs/${id}`, status: "new", sources: "organization, user, domain (13), credit_ledger, onboarding/admin/summary" },
  users: { method: "GET", build: () => "/admin/users", status: "new", sources: "user (9), auth (24)" },
  billing: { method: "GET", build: () => "/admin/billing", status: "new", sources: "billing (28), credit_balances/credit_ledger, pending_upgrades" },
  providerHealth: { method: "GET", build: () => "/admin/email/providers/health", status: "new", sources: "delivery_events.provider, EmailProviderResolver, EmailReputationService" },
  visitors: { method: "GET", build: () => "/admin/analytics/visitors", status: "new", sources: "visit_daily_rollups (+ ingest POST /admin-analytics/visits)" },
  audit: { method: "GET", build: () => "/admin/audit", status: "new", sources: "admin_audit_log (new model)" },

  // ── Mutations (SUPER_ADMIN + audited; PRD §3.3 P1 / §10.3) ─────────────────
  syncDomain: { method: "POST", build: (id) => `/admin/orgs/${id}/actions/sync-domain`, status: "new", sources: "wraps existing syncDomain" },
  creditWallet: { method: "POST", build: (id) => `/admin/orgs/${id}/actions/credit-wallet`, status: "new", sources: "wraps existing payg.credit (kind admin_grant)" },
  setPlan: { method: "POST", build: (id) => `/admin/orgs/${id}/actions/set-plan`, status: "new", sources: "wraps existing activation path (plan + planExpiresAt)" },
  toggleOrg: { method: "POST", build: (id) => `/admin/orgs/${id}/actions/toggle-org`, status: "new", sources: "existing org enabled flag" },
  resendInvite: { method: "POST", build: (id) => `/admin/orgs/${id}/actions/resend-invite`, status: "new", sources: "existing invite/verification service" },
} as const satisfies Record<string, AdminEndpoint>;

export type EndpointKey = keyof typeof ENDPOINTS;
