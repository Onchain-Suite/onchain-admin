/**
 * Read-only monitoring contracts for the internal admin console. Mirror these
 * on the backend's GET /admin/* routes (see notes/prd.md §4). Every shape is a
 * read model — the console never mutates.
 */

export type HealthStatus = "operational" | "degraded" | "down";
export type ReputationStatus = "healthy" | "warning" | "critical";

export interface Trend {
  /** Signed percentage change over the window, e.g. +12.4 or -3.1. */
  deltaPct: number;
  direction: "up" | "down" | "flat";
  /** true when "up" is bad (e.g. failure rate). */
  invert?: boolean;
}

/* ── Overview: north-star tiles (prd §0) ─────────────────────────────────── */
export interface NorthStar {
  key: string;
  label: string;
  value: string;
  sub?: string;
  trend?: Trend;
  /** Sparkline series (raw numbers, normalized at render). */
  spark: number[];
}

/* ── Service health (shared, prd §3.1 / §6) ──────────────────────────────── */
export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  detail?: string;
}

export interface QueueDepth {
  name: string;
  waiting: number;
  active: number;
  failed: number;
}

export interface SchedulerRun {
  name: string;
  lastRun: string; // ISO
  outcome: "ok" | "failed" | "skipped";
  durationMs?: number;
}

export interface ErrorRow {
  id: string;
  at: string; // ISO
  level: "error" | "warning";
  source: string;
  message: string;
}

export interface StatusBoard {
  subsystems: ServiceHealth[];
  queues: QueueDepth[];
  schedulers: SchedulerRun[];
  process: { rssMb: number; eventLoopLagMs: number; uptimeHours: number };
  errors: ErrorRow[];
}

/* ── Analytics overview (prd §3.2) ───────────────────────────────────────── */
export interface PlanSlice {
  plan: string;
  orgs: number;
  mrr: number;
}

export interface AnalyticsOverview {
  growth: {
    usersTotal: number;
    usersNew: number;
    orgsTotal: number;
    orgsNew: number;
    activationRate: number; // 0..1
  };
  engagement: {
    campaigns: number;
    emails: number;
    inApp: number;
    automations: number;
    appEvents: number;
    aiQueries: number;
  };
  revenue: {
    mrr: number;
    plans: PlanSlice[];
    paygOutstanding: number;
    topups30d: number;
    expiring14d: number;
  };
  deliverability: {
    bounceRate: number; // 0..1
    complaintRate: number; // 0..1
    sendReadyDomains: number;
    totalDomains: number;
  };
  series: { date: string; users: number; orgs: number }[];
}

/* ── Organizations (prd §3.3) ────────────────────────────────────────────── */
export interface OrgSummary {
  id: string;
  name: string;
  plan: string;
  planExpiresAt?: string;
  members: number;
  contacts: number;
  messages30d: number;
  walletBalance: number;
  createdAt: string;
  lastActivity: string;
  /** 0..100 composite health (usage, deliverability, payment). */
  health: number;
}

export interface OrgDetail extends OrgSummary {
  membersList: { name: string; email: string; role: string }[];
  domains: { domain: string; status: HealthStatus; sendReady: boolean }[];
  usage: { label: string; used: number; limit: number }[];
  ledgerTail: { at: string; kind: string; amount: number; reference?: string }[];
  onboarding: { step: string; done: boolean }[];
}

/* ── Users (prd §3.3) ────────────────────────────────────────────────────── */
export interface UserRow {
  id: string;
  email: string;
  orgs: number;
  roles: string;
  verified: boolean;
  createdAt: string;
  lastSession?: string;
}

/* ── Billing ops (prd §3.4 / §10.2) ──────────────────────────────────────── */
export interface BillingOps {
  waterfall: {
    newMrr: number;
    expansion: number;
    contraction: number;
    churn: number;
  };
  pending: {
    id: string;
    org: string;
    amount: number;
    status: string;
    ageHours: number;
    reference: string;
  }[];
  webhookFailures: { id: string; at: string; kind: string; detail: string }[];
  ledger: {
    at: string;
    org: string;
    kind: string;
    amount: number;
    reference?: string;
  }[];
}

/* ── Deliverability & providers (prd §3.5 / §3.5b) ───────────────────────── */
export interface DeliverMetrics {
  sent: number;
  delivered: number;
  bounced: number;
  complained: number;
  bounceRate: number; // 0..1
  complaintRate: number; // 0..1
}

export interface ProviderHealth {
  provider: string; // "acs" | "sendgrid" | "ses"
  configured: boolean;
  activeRole: "transactional" | "marketing" | "both" | "inactive";
  window24h: DeliverMetrics;
  window7d: DeliverMetrics;
  reputation: ReputationStatus;
}

export interface DomainReputation {
  domain: string;
  org: string;
  status: HealthStatus;
  sendReady: boolean;
  bounceRate: number;
  complaintRate: number;
  suppressions: number;
}

export interface DeliverabilityBoard {
  activeRouting: { transactional: string; marketing: string };
  providers: ProviderHealth[];
  domains: DomainReputation[];
}

/* ── Visitor analytics (prd §3.3b) ───────────────────────────────────────── */
export interface VisitorAnalytics {
  totals: { visitors: number; views: number };
  topPages: { path: string; views: number; visitors: number }[];
  topCountries: { country: string; code: string; visitors: number }[];
  series: { date: string; visitors: number; views: number }[];
}

/* ── Audit log (prd §10.7) ───────────────────────────────────────────────── */
export interface AuditEntry {
  id: string;
  at: string; // ISO
  actor: string;
  action: string;
  target: string;
  detail?: string;
}

/* ── Send volume (overview chart) ────────────────────────────────────────── */
export interface SendPoint {
  date: string; // yyyy-mm-dd
  email: number;
  push: number;
}

/** The overview page's aggregate read — GET /admin/snapshot. */
export interface AdminSnapshot {
  northStars: NorthStar[];
  health: ServiceHealth[];
  sends: SendPoint[];
  errors: ErrorRow[];
}
