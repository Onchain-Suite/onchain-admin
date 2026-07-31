import {
  DEFAULTS,
  type Filters,
  rangeFactor,
  rangePoints,
  type Range,
} from "@/lib/filters";
import type {
  AdminSnapshot,
  AnalyticsOverview,
  AuditEntry,
  BillingOps,
  DeliverabilityBoard,
  DomainReputation,
  OrgDetail,
  OrgSummary,
  ReputationStatus,
  StatusBoard,
  UserRow,
  VisitorAnalytics,
} from "@/lib/types";

/**
 * Built-in sample data so the console runs before the backend's GET /admin/*
 * endpoints exist. Deterministic (no randomness) so builds and snapshots are
 * stable, and responsive to the active Filters so the UI visibly reacts. Swap
 * off with ADMIN_MOCK=0 once the real endpoints land.
 */

/** Bucket label for point i of n: "HH:00" for the 24h window, else "MM-DD". */
function bucketLabel(range: Range, i: number, n: number): string {
  if (range === "24h") return `${String(i).padStart(2, "0")}:00`;
  const d = new Date(Date.UTC(2026, 6, 31));
  d.setUTCDate(d.getUTCDate() - (n - 1 - i));
  return d.toISOString().slice(5, 10);
}

/** Build a windowed series, one entry per key, scaled to the range. */
function series<K extends string>(
  range: Range,
  gens: Record<K, (i: number, n: number) => number>
): (Record<K, number> & { date: string })[] {
  const n = rangePoints(range);
  const keys = Object.keys(gens) as K[];
  return Array.from({ length: n }, (_, i) => {
    const values = Object.fromEntries(keys.map((k) => [k, gens[k](i, n)]));
    return {
      date: bucketLabel(range, i, n),
      ...values,
    } as Record<K, number> & { date: string };
  });
}

const scale = (base: number, range: Range) => Math.round(base * rangeFactor(range));

export function mockSnapshot(f: Filters = DEFAULTS): AdminSnapshot {
  const { range } = f;
  const wave = (i: number, amp: number) => Math.sin(i / 2) * amp;
  return {
    northStars: [
      { key: "mrr", label: "MRR", value: "$48.2K", sub: "ARR $578K", trend: { deltaPct: 12.4, direction: "up" }, spark: [40, 41, 43, 42, 44, 46, 45, 47, 48] },
      { key: "nrr", label: "Net revenue retention", value: "118%", sub: "trailing 3mo", trend: { deltaPct: 4.1, direction: "up" }, spark: [108, 110, 109, 112, 114, 113, 116, 118] },
      { key: "active", label: "Active orgs (MAU)", value: "63", sub: "of 148 total", trend: { deltaPct: 8.0, direction: "up" }, spark: [52, 54, 53, 56, 58, 60, 61, 63] },
      { key: "activation", label: "Activation rate", value: "61%", sub: "first value <10min", trend: { deltaPct: 2.3, direction: "up" }, spark: [55, 56, 57, 58, 59, 60, 61] },
      { key: "failrate", label: "Email failure (30d)", value: "1.9%", sub: "bounce + complaint", trend: { deltaPct: 0.4, direction: "up", invert: true }, spark: [1.4, 1.5, 1.6, 1.7, 1.8, 1.9] },
      { key: "health", label: "System health", value: "Amber", sub: "queue backlog", trend: { deltaPct: 0, direction: "flat" }, spark: [95, 96, 94, 95, 93, 95] },
    ],
    health: [
      { name: "API", status: "operational", detail: "p50 120ms" },
      { name: "Database", status: "operational", detail: "12/100 conns" },
      { name: "Queue", status: "degraded", detail: "backlog 1.2k" },
      { name: "Email plane", status: "operational", detail: "verified" },
    ],
    sends: series(range, {
      email: (i) => 2400 + Math.round(wave(i, 400) + i * 20),
      push: (i) => 1000 + Math.round(wave(i, 180) + i * 10),
    }),
    errors: mockStatus(f).errors,
  };
}

export function mockStatus(f: Filters = DEFAULTS): StatusBoard {
  const errors: StatusBoard["errors"] = [
    { id: "e1", at: "2026-07-31T09:41:12Z", level: "error", source: "email.send", message: "Provider 502 on batch b_8831 (retried, delivered)" },
    { id: "e2", at: "2026-07-31T08:03:55Z", level: "warning", source: "queue.worker", message: "Backlog above threshold (1.2k > 1k)" },
    { id: "e3", at: "2026-07-30T22:17:41Z", level: "error", source: "webhook.inbound", message: "Signature mismatch from org_2 endpoint" },
    { id: "e4", at: "2026-07-30T19:52:08Z", level: "warning", source: "domain.verify", message: "DNS propagation slow for volt.xyz" },
    { id: "e5", at: "2026-07-30T14:11:03Z", level: "error", source: "ai.reindex", message: "Vector upsert timeout on shard 3 (retrying)" },
  ];
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
    errors: f.level === "all" ? errors : errors.filter((e) => e.level === f.level),
  };
}

export function mockAnalytics(f: Filters = DEFAULTS): AnalyticsOverview {
  const { range } = f;
  return {
    growth: {
      usersTotal: 512,
      usersNew: scale(47, range),
      orgsTotal: 148,
      orgsNew: scale(12, range),
      activationRate: 0.61,
    },
    engagement: {
      campaigns: scale(384, range),
      emails: scale(1_240_000, range),
      inApp: scale(486_000, range),
      automations: scale(1_920, range),
      appEvents: scale(3_100_000, range),
      aiQueries: scale(8_400, range),
    },
    revenue: {
      mrr: 48_200,
      plans: [
        { plan: "PAYG", orgs: 61, mrr: 0 },
        { plan: "Starter", orgs: 44, mrr: 8_800 },
        { plan: "Growth", orgs: 31, mrr: 21_700 },
        { plan: "Scale", orgs: 12, mrr: 17_700 },
      ],
      paygOutstanding: 12_430,
      topups30d: scale(38_900, range),
      expiring14d: 7,
    },
    deliverability: { bounceRate: 0.019, complaintRate: 0.0008, sendReadyDomains: 121, totalDomains: 134 },
    series: series(range, {
      users: (i, n) => 460 + Math.round((i / n) * 52) + Math.round(Math.sin(i / 2) * 6),
      orgs: (i, n) => 132 + Math.round((i / n) * 16) + Math.round(Math.sin(i / 3) * 2),
    }),
  };
}

const ALL_ORGS: OrgSummary[] = [
  { id: "org_1", name: "Aster Labs", plan: "Growth", planExpiresAt: "2026-09-02", members: 8, contacts: 42_100, messages30d: 128_400, walletBalance: 240, createdAt: "2026-03-02", lastActivity: "2026-07-31", health: 88 },
  { id: "org_2", name: "Nimbus Protocol", plan: "Scale", planExpiresAt: "2026-08-19", members: 14, contacts: 210_500, messages30d: 302_100, walletBalance: 1_820, createdAt: "2026-01-19", lastActivity: "2026-07-31", health: 92 },
  { id: "org_3", name: "Meridian", plan: "Starter", planExpiresAt: "2026-08-04", members: 3, contacts: 3_200, messages30d: 9_800, walletBalance: 12, createdAt: "2026-06-24", lastActivity: "2026-07-29", health: 46 },
  { id: "org_4", name: "Volt Finance", plan: "Growth", planExpiresAt: "2026-08-11", members: 6, contacts: 28_900, messages30d: 74_300, walletBalance: 90, createdAt: "2026-05-11", lastActivity: "2026-07-30", health: 71 },
  { id: "org_5", name: "Cobalt DAO", plan: "Scale", planExpiresAt: "2026-11-30", members: 21, contacts: 512_000, messages30d: 511_900, walletBalance: 4_200, createdAt: "2025-11-30", lastActivity: "2026-07-31", health: 95 },
  { id: "org_6", name: "Harbor", plan: "Starter", planExpiresAt: "2026-08-02", members: 2, contacts: 900, messages30d: 1_200, walletBalance: 0, createdAt: "2026-07-10", lastActivity: "2026-07-22", health: 33 },
];

function inHealthBand(health: number, band: Filters["health"]): boolean {
  if (band === "healthy") return health >= 75;
  if (band === "watch") return health >= 50 && health < 75;
  if (band === "risk") return health < 50;
  return true;
}

export function mockOrgs(f: Filters = DEFAULTS): OrgSummary[] {
  return ALL_ORGS.filter(
    (o) =>
      (f.plan === "all" || o.plan === f.plan) && inHealthBand(o.health, f.health)
  );
}

export function mockOrgDetail(id: string): OrgDetail {
  const base = ALL_ORGS.find((o) => o.id === id) ?? ALL_ORGS[0];
  const slug = base.name.toLowerCase().replace(/\s/g, "");
  return {
    ...base,
    membersList: [
      { name: "Ada Okafor", email: `ada@${slug}.xyz`, role: "OWNER" },
      { name: "Reza Farid", email: `reza@${slug}.xyz`, role: "ADMIN" },
      { name: "Priya N.", email: `priya@${slug}.xyz`, role: "MEMBER" },
    ].slice(0, Math.max(1, Math.min(3, base.members))),
    domains: [
      { domain: `mail.${slug}.xyz`, status: "operational", sendReady: true },
      { domain: `${slug}.xyz`, status: base.health < 50 ? "degraded" : "operational", sendReady: base.health >= 50 },
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

const ALL_USERS: UserRow[] = [
  { id: "u_1", email: "ada@asterlabs.xyz", orgs: 1, roles: "OWNER", verified: true, createdAt: "2026-03-02", lastSession: "2026-07-31T09:20:00Z" },
  { id: "u_2", email: "reza@nimbus.xyz", orgs: 2, roles: "ADMIN, MEMBER", verified: true, createdAt: "2026-01-20", lastSession: "2026-07-31T07:02:00Z" },
  { id: "u_3", email: "sam@meridian.xyz", orgs: 1, roles: "OWNER", verified: false, createdAt: "2026-06-24", lastSession: "2026-07-29T18:44:00Z" },
  { id: "u_4", email: "noreply@harbor.xyz", orgs: 0, roles: "—", verified: false, createdAt: "2026-07-10" },
  { id: "u_5", email: "ops@cobalt.dao", orgs: 1, roles: "OWNER", verified: true, createdAt: "2025-11-30", lastSession: "2026-07-31T11:15:00Z" },
];

export function mockUsers(f: Filters = DEFAULTS): UserRow[] {
  if (f.verified === "all") return ALL_USERS;
  const want = f.verified === "verified";
  return ALL_USERS.filter((u) => u.verified === want);
}

export function mockBilling(f: Filters = DEFAULTS): BillingOps {
  const { range } = f;
  return {
    waterfall: {
      newMrr: scale(6_400, range),
      expansion: scale(3_100, range),
      contraction: -scale(900, range),
      churn: -scale(1_800, range),
    },
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

function domainReputation(bounceRate: number, complaintRate: number): ReputationStatus {
  if (bounceRate >= 0.05 || complaintRate >= 0.005) return "critical";
  if (bounceRate >= 0.02 || complaintRate >= 0.001) return "warning";
  return "healthy";
}

export function mockDeliverability(f: Filters = DEFAULTS): DeliverabilityBoard {
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

  const providers = [
    { provider: "acs", configured: true, activeRole: "transactional" as const, window24h: m(42_000, 640, 18), window7d: m(291_000, 4_800, 120), reputation: "healthy" as const },
    { provider: "sendgrid", configured: true, activeRole: "marketing" as const, window24h: m(148_000, 3_900, 140), window7d: m(1_020_000, 26_500, 900), reputation: "warning" as const },
    { provider: "ses", configured: false, activeRole: "inactive" as const, window24h: m(0, 0, 0), window7d: m(0, 0, 0), reputation: "healthy" as const },
  ];

  const domains: DomainReputation[] = [
    { domain: "mail.asterlabs.xyz", org: "Aster Labs", provider: "acs", status: "operational", sendReady: true, bounceRate: 0.011, complaintRate: 0.0004, suppressions: 320 },
    { domain: "mail.nimbus.xyz", org: "Nimbus", provider: "sendgrid", status: "operational", sendReady: true, bounceRate: 0.008, complaintRate: 0.0002, suppressions: 880 },
    { domain: "meridian.xyz", org: "Meridian", provider: "sendgrid", status: "degraded", sendReady: false, bounceRate: 0.041, complaintRate: 0.0012, suppressions: 45 },
    { domain: "mail.cobalt.dao", org: "Cobalt DAO", provider: "acs", status: "operational", sendReady: true, bounceRate: 0.006, complaintRate: 0.0001, suppressions: 2_100 },
  ];

  return {
    activeRouting: { transactional: "acs", marketing: "sendgrid" },
    providers: f.provider === "all" ? providers : providers.filter((p) => p.provider === f.provider),
    domains: domains.filter(
      (d) =>
        (f.provider === "all" || d.provider === f.provider) &&
        (f.reputation === "all" ||
          domainReputation(d.bounceRate, d.complaintRate) === f.reputation)
    ),
  };
}

export function mockVisitors(f: Filters = DEFAULTS): VisitorAnalytics {
  const { range } = f;
  return {
    totals: { visitors: scale(18_420, range), views: scale(52_300, range) },
    topPages: [
      { path: "/", views: scale(21_000, range), visitors: scale(9_800, range) },
      { path: "/pricing", views: scale(9_400, range), visitors: scale(6_100, range) },
      { path: "/product", views: scale(6_200, range), visitors: scale(3_400, range) },
      { path: "/blog/onchain-crm", views: scale(4_100, range), visitors: scale(2_900, range) },
      { path: "/login", views: scale(3_800, range), visitors: scale(2_200, range) },
    ],
    topCountries: [
      { country: "United States", code: "US", visitors: scale(6_800, range) },
      { country: "Nigeria", code: "NG", visitors: scale(3_100, range) },
      { country: "United Kingdom", code: "GB", visitors: scale(2_050, range) },
      { country: "Germany", code: "DE", visitors: scale(1_400, range) },
      { country: "India", code: "IN", visitors: scale(1_240, range) },
    ],
    series: series(range, {
      visitors: (i) => 1_100 + i * 30 + Math.round(Math.sin(i / 2) * 120),
      views: (i) => 3_200 + i * 80 + Math.round(Math.sin(i / 2) * 260),
    }),
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
