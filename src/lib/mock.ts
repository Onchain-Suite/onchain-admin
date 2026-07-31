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

/**
 * Built-in sample data so the console runs before the backend's GET /admin/*
 * endpoints exist. Deterministic (no randomness) so builds and snapshots are
 * stable. Swap off with ADMIN_MOCK=0 once the real endpoints land.
 */

const day = (i: number) => new Date(Date.UTC(2026, 6, 18 + i)).toISOString().slice(0, 10);
const spark = (base: number, amp: number, n = 16) =>
  Array.from({ length: n }, (_, i) => Math.round(base + Math.sin(i / 2.3) * amp + i * (amp / 12)));

export function mockSnapshot(): AdminSnapshot {
  const sends = Array.from({ length: 14 }, (_, i) => {
    const wave = Math.sin(i / 2) * 400;
    return {
      date: day(i),
      email: Math.round(2200 + wave + i * 60),
      push: Math.round(900 + wave / 2 + i * 30),
    };
  });

  return {
    northStars: [
      { key: "mrr", label: "MRR", value: "$48.2K", sub: "ARR $578K", trend: { deltaPct: 12.4, direction: "up" }, spark: spark(40, 6) },
      { key: "nrr", label: "Net revenue retention", value: "118%", sub: "trailing 3mo", trend: { deltaPct: 4.1, direction: "up" }, spark: spark(108, 5) },
      { key: "active", label: "Active orgs (MAU)", value: "63", sub: "of 148 total", trend: { deltaPct: 8.0, direction: "up" }, spark: spark(52, 6) },
      { key: "activation", label: "Activation rate", value: "61%", sub: "first value <10min", trend: { deltaPct: 2.3, direction: "up" }, spark: spark(55, 4) },
      { key: "failrate", label: "Email failure (30d)", value: "1.9%", sub: "bounce + complaint", trend: { deltaPct: 0.4, direction: "up", invert: true }, spark: spark(2, 0.4) },
      { key: "health", label: "System health", value: "Amber", sub: "queue backlog", trend: { deltaPct: 0, direction: "flat" }, spark: spark(95, 3) },
    ],
    health: [
      { name: "API", status: "operational", detail: "p50 120ms" },
      { name: "Database", status: "operational", detail: "12/100 conns" },
      { name: "Queue", status: "degraded", detail: "backlog 1.2k" },
      { name: "Email plane", status: "operational", detail: "verified" },
    ],
    sends,
    errors: mockStatus().errors,
  };
}

export function mockStatus(): StatusBoard {
  return {
    subsystems: [
      { name: "API", status: "operational", detail: "p50 120ms · p99 480ms" },
      { name: "Database (Neon)", status: "operational", detail: "12/100 conns · lag 40ms" },
      { name: "Redis", status: "operational", detail: "mem 38%" },
      { name: "Queue (BullMQ)", status: "degraded", detail: "campaign backlog 1.2k" },
      { name: "AI / vector store", status: "operational", detail: "embeddings ok" },
      { name: "Email plane", status: "operational", detail: "all domains sendReady" },
      { name: "GoldRush API", status: "operational", detail: "circuit closed" },
      { name: "BlockRadar", status: "degraded", detail: "p99 elevated" },
    ],
    queues: [
      { name: "campaign-send", waiting: 1204, active: 12, failed: 3 },
      { name: "enrichment", waiting: 88, active: 4, failed: 0 },
      { name: "billing-expiry", waiting: 0, active: 0, failed: 0 },
      { name: "ai-reindex", waiting: 21, active: 1, failed: 1 },
    ],
    schedulers: [
      { name: "campaign-dispatcher", lastRun: "2026-07-31T09:45:00Z", outcome: "ok", durationMs: 820 },
      { name: "billing-expiry-sweep", lastRun: "2026-07-31T06:00:00Z", outcome: "ok", durationMs: 1400 },
      { name: "ai-reindex", lastRun: "2026-07-31T03:00:00Z", outcome: "failed", durationMs: 5200 },
      { name: "reputation-rollup", lastRun: "2026-07-31T08:00:00Z", outcome: "ok", durationMs: 640 },
    ],
    process: { rssMb: 512, eventLoopLagMs: 8, uptimeHours: 142 },
    errors: [
      { id: "e1", at: "2026-07-31T09:41:12Z", level: "error", source: "email.send", message: "Provider 502 on batch b_8831 (retried, delivered)" },
      { id: "e2", at: "2026-07-31T08:03:55Z", level: "warning", source: "queue.worker", message: "Backlog above threshold (1.2k > 1k)" },
      { id: "e3", at: "2026-07-30T22:17:41Z", level: "error", source: "webhook.inbound", message: "Signature mismatch from org_2 endpoint" },
      { id: "e4", at: "2026-07-30T19:52:08Z", level: "warning", source: "domain.verify", message: "DNS propagation slow for volt.xyz" },
      { id: "e5", at: "2026-07-30T14:11:03Z", level: "error", source: "ai.reindex", message: "Vector upsert timeout on shard 3 (retrying)" },
    ],
  };
}

export function mockAnalytics(): AnalyticsOverview {
  return {
    growth: { usersTotal: 512, usersNew: 47, orgsTotal: 148, orgsNew: 12, activationRate: 0.61 },
    engagement: { campaigns: 384, emails: 1_240_000, inApp: 486_000, automations: 1_920, appEvents: 3_100_000, aiQueries: 8_400 },
    revenue: {
      mrr: 48_200,
      plans: [
        { plan: "PAYG", orgs: 61, mrr: 0 },
        { plan: "Starter", orgs: 44, mrr: 8_800 },
        { plan: "Growth", orgs: 31, mrr: 21_700 },
        { plan: "Scale", orgs: 12, mrr: 17_700 },
      ],
      paygOutstanding: 12_430,
      topups30d: 38_900,
      expiring14d: 7,
    },
    deliverability: { bounceRate: 0.019, complaintRate: 0.0008, sendReadyDomains: 121, totalDomains: 134 },
    series: Array.from({ length: 14 }, (_, i) => ({
      date: day(i),
      users: 460 + i * 4 + Math.round(Math.sin(i / 2) * 6),
      orgs: 132 + i + Math.round(Math.sin(i / 3) * 2),
    })),
  };
}

export function mockOrgs(): OrgSummary[] {
  return [
    { id: "org_1", name: "Aster Labs", plan: "Growth", planExpiresAt: "2026-09-02", members: 8, contacts: 42_100, messages30d: 128_400, walletBalance: 240, createdAt: "2026-03-02", lastActivity: "2026-07-31", health: 88 },
    { id: "org_2", name: "Nimbus Protocol", plan: "Scale", planExpiresAt: "2026-08-19", members: 14, contacts: 210_500, messages30d: 302_100, walletBalance: 1_820, createdAt: "2026-01-19", lastActivity: "2026-07-31", health: 92 },
    { id: "org_3", name: "Meridian", plan: "Starter", planExpiresAt: "2026-08-04", members: 3, contacts: 3_200, messages30d: 9_800, walletBalance: 12, createdAt: "2026-06-24", lastActivity: "2026-07-29", health: 46 },
    { id: "org_4", name: "Volt Finance", plan: "Growth", planExpiresAt: "2026-08-11", members: 6, contacts: 28_900, messages30d: 74_300, walletBalance: 90, createdAt: "2026-05-11", lastActivity: "2026-07-30", health: 71 },
    { id: "org_5", name: "Cobalt DAO", plan: "Scale", planExpiresAt: "2026-11-30", members: 21, contacts: 512_000, messages30d: 511_900, walletBalance: 4_200, createdAt: "2025-11-30", lastActivity: "2026-07-31", health: 95 },
    { id: "org_6", name: "Harbor", plan: "Starter", planExpiresAt: "2026-08-02", members: 2, contacts: 900, messages30d: 1_200, walletBalance: 0, createdAt: "2026-07-10", lastActivity: "2026-07-22", health: 33 },
  ];
}

export function mockOrgDetail(id: string): OrgDetail {
  const base = mockOrgs().find((o) => o.id === id) ?? mockOrgs()[0];
  return {
    ...base,
    membersList: [
      { name: "Ada Okafor", email: "ada@" + base.name.toLowerCase().replace(/\s/g, "") + ".xyz", role: "OWNER" },
      { name: "Reza Farid", email: "reza@" + base.name.toLowerCase().replace(/\s/g, "") + ".xyz", role: "ADMIN" },
      { name: "Priya N.", email: "priya@" + base.name.toLowerCase().replace(/\s/g, "") + ".xyz", role: "MEMBER" },
    ].slice(0, Math.max(1, Math.min(3, base.members))),
    domains: [
      { domain: "mail." + base.name.toLowerCase().replace(/\s/g, "") + ".xyz", status: "operational", sendReady: true },
      { domain: base.name.toLowerCase().replace(/\s/g, "") + ".xyz", status: base.health < 50 ? "degraded" : "operational", sendReady: base.health >= 50 },
    ],
    usage: [
      { label: "Contacts", used: base.contacts, limit: base.plan === "Scale" ? 1_000_000 : base.plan === "Growth" ? 100_000 : 10_000 },
      { label: "Monthly messages", used: base.messages30d, limit: base.plan === "Scale" ? 1_000_000 : base.plan === "Growth" ? 250_000 : 25_000 },
      { label: "Seats", used: base.members, limit: base.plan === "Scale" ? 25 : base.plan === "Growth" ? 10 : 3 },
    ],
    ledgerTail: [
      { at: "2026-07-28T10:00:00Z", kind: "topup", amount: 250, reference: "blockradar:0x91af" },
      { at: "2026-07-25T14:30:00Z", kind: "message_debit", amount: -32, reference: "campaign c_771" },
      { at: "2026-07-20T09:12:00Z", kind: "admin_grant", amount: 50, reference: "support credit" },
    ],
    onboarding: [
      { step: "Created org", done: true },
      { step: "Connected wallet", done: true },
      { step: "Verified domain", done: base.health >= 50 },
      { step: "First campaign", done: base.messages30d > 5_000 },
    ],
  };
}

export function mockUsers(): UserRow[] {
  return [
    { id: "u_1", email: "ada@asterlabs.xyz", orgs: 1, roles: "OWNER", verified: true, createdAt: "2026-03-02", lastSession: "2026-07-31T09:20:00Z" },
    { id: "u_2", email: "reza@nimbus.xyz", orgs: 2, roles: "ADMIN, MEMBER", verified: true, createdAt: "2026-01-20", lastSession: "2026-07-31T07:02:00Z" },
    { id: "u_3", email: "sam@meridian.xyz", orgs: 1, roles: "OWNER", verified: false, createdAt: "2026-06-24", lastSession: "2026-07-29T18:44:00Z" },
    { id: "u_4", email: "noreply@harbor.xyz", orgs: 0, roles: "—", verified: false, createdAt: "2026-07-10" },
    { id: "u_5", email: "ops@cobalt.dao", orgs: 1, roles: "OWNER", verified: true, createdAt: "2025-11-30", lastSession: "2026-07-31T11:15:00Z" },
  ];
}

export function mockBilling(): BillingOps {
  return {
    waterfall: { newMrr: 6_400, expansion: 3_100, contraction: -900, churn: -1_800 },
    pending: [
      { id: "pu_1", org: "Volt Finance", amount: 299, status: "awaiting_confirmation", ageHours: 3.2, reference: "blockradar:0x77c1" },
      { id: "pu_2", org: "Harbor", amount: 49, status: "amount_mismatch", ageHours: 26.5, reference: "blockradar:0x0a9e" },
    ],
    webhookFailures: [
      { id: "wf_1", at: "2026-07-31T02:11:00Z", kind: "signature_failure", detail: "BlockRadar sig invalid for 0x0a9e" },
      { id: "wf_2", at: "2026-07-30T20:40:00Z", kind: "amount_mismatch", detail: "Expected 299, received 290 (Volt)" },
    ],
    ledger: [
      { at: "2026-07-31T09:00:00Z", org: "Cobalt DAO", kind: "topup", amount: 1_000, reference: "0x91af" },
      { at: "2026-07-30T16:20:00Z", org: "Aster Labs", kind: "message_debit", amount: -128, reference: "c_812" },
      { at: "2026-07-30T12:05:00Z", org: "Nimbus", kind: "ai_debit", amount: -44, reference: "q_5521" },
      { at: "2026-07-29T10:00:00Z", org: "Meridian", kind: "admin_grant", amount: 25, reference: "support" },
    ],
  };
}

export function mockDeliverability(): DeliverabilityBoard {
  const m = (sent: number, b: number, c: number) => {
    const delivered = sent - b;
    return {
      sent,
      delivered,
      bounced: b,
      complained: c,
      bounceRate: b / Math.max(1, delivered + b),
      complaintRate: c / Math.max(1, delivered),
    };
  };
  return {
    activeRouting: { transactional: "acs", marketing: "sendgrid" },
    providers: [
      { provider: "acs", configured: true, activeRole: "transactional", window24h: m(42_000, 640, 18), window7d: m(291_000, 4_800, 120), reputation: "healthy" },
      { provider: "sendgrid", configured: true, activeRole: "marketing", window24h: m(148_000, 3_900, 140), window7d: m(1_020_000, 26_500, 900), reputation: "warning" },
      { provider: "ses", configured: false, activeRole: "inactive", window24h: m(0, 0, 0), window7d: m(0, 0, 0), reputation: "healthy" },
    ],
    domains: [
      { domain: "mail.asterlabs.xyz", org: "Aster Labs", status: "operational", sendReady: true, bounceRate: 0.011, complaintRate: 0.0004, suppressions: 320 },
      { domain: "mail.nimbus.xyz", org: "Nimbus", status: "operational", sendReady: true, bounceRate: 0.008, complaintRate: 0.0002, suppressions: 880 },
      { domain: "meridian.xyz", org: "Meridian", status: "degraded", sendReady: false, bounceRate: 0.041, complaintRate: 0.0012, suppressions: 45 },
      { domain: "mail.cobalt.dao", org: "Cobalt DAO", status: "operational", sendReady: true, bounceRate: 0.006, complaintRate: 0.0001, suppressions: 2_100 },
    ],
  };
}

export function mockVisitors(): VisitorAnalytics {
  return {
    totals: { visitors: 18_420, views: 52_300 },
    topPages: [
      { path: "/", views: 21_000, visitors: 9_800 },
      { path: "/pricing", views: 9_400, visitors: 6_100 },
      { path: "/product", views: 6_200, visitors: 3_400 },
      { path: "/blog/onchain-crm", views: 4_100, visitors: 2_900 },
      { path: "/login", views: 3_800, visitors: 2_200 },
    ],
    topCountries: [
      { country: "United States", code: "US", visitors: 6_800 },
      { country: "Nigeria", code: "NG", visitors: 3_100 },
      { country: "United Kingdom", code: "GB", visitors: 2_050 },
      { country: "Germany", code: "DE", visitors: 1_400 },
      { country: "India", code: "IN", visitors: 1_240 },
    ],
    series: Array.from({ length: 14 }, (_, i) => ({
      date: day(i),
      visitors: 1_100 + i * 30 + Math.round(Math.sin(i / 2) * 120),
      views: 3_200 + i * 80 + Math.round(Math.sin(i / 2) * 260),
    })),
  };
}

export function mockAudit(): AuditEntry[] {
  return [
    { id: "a1", at: "2026-07-31T09:50:00Z", actor: "ada@onchainsuite.com", action: "domain.resync", target: "org_3 · meridian.xyz", detail: "Re-ran verification" },
    { id: "a2", at: "2026-07-30T15:10:00Z", actor: "reza@onchainsuite.com", action: "wallet.credit", target: "org_4 · +$50", detail: "admin_grant · support" },
    { id: "a3", at: "2026-07-29T11:02:00Z", actor: "ada@onchainsuite.com", action: "plan.extend", target: "org_6 · +14d", detail: "trial extension" },
    { id: "a4", at: "2026-07-28T08:44:00Z", actor: "reza@onchainsuite.com", action: "member.disable", target: "org_2 · priya@nimbus.xyz", detail: "offboarded" },
  ];
}
