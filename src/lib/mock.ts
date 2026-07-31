import type { AdminSnapshot } from "@/lib/types";

/**
 * Built-in sample data so the console runs before the backend's GET /admin/*
 * endpoints exist. Deterministic (no randomness) so builds and snapshots are
 * stable. Swap off with ADMIN_MOCK=0 once the real endpoints land.
 */
export function mockSnapshot(): AdminSnapshot {
  const days = 14;
  const sends = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.UTC(2026, 6, 18 + i)); // Jul 18 → Jul 31 2026
    const wave = Math.sin(i / 2) * 400;
    return {
      date: d.toISOString().slice(0, 10),
      email: Math.round(2200 + wave + i * 60),
      push: Math.round(900 + wave / 2 + i * 30),
    };
  });

  return {
    health: [
      { name: "API", status: "operational", detail: "p50 120ms" },
      { name: "Database", status: "operational", detail: "12/100 conns" },
      { name: "Queue", status: "degraded", detail: "backlog 1.2k" },
      { name: "Email provider", status: "operational", detail: "verified" },
    ],
    stats: {
      totalOrgs: 148,
      activeOrgs7d: 63,
      emailsSent24h: 41230,
      deliveryRate: 0.981,
      pushesSent24h: 15870,
      errors24h: 27,
    },
    sends,
    orgs: [
      { id: "org_1", name: "Aster Labs", plan: "Growth", members: 8, emails30d: 128400, createdAt: "2026-03-02" },
      { id: "org_2", name: "Nimbus Protocol", plan: "Scale", members: 14, emails30d: 302100, createdAt: "2026-01-19" },
      { id: "org_3", name: "Meridian", plan: "Starter", members: 3, emails30d: 9800, createdAt: "2026-06-24" },
      { id: "org_4", name: "Volt Finance", plan: "Growth", members: 6, emails30d: 74300, createdAt: "2026-05-11" },
      { id: "org_5", name: "Cobalt DAO", plan: "Scale", members: 21, emails30d: 511900, createdAt: "2025-11-30" },
    ],
    errors: [
      { id: "e1", at: "2026-07-31T09:41:12Z", level: "error", source: "email.send", message: "Provider 502 on batch b_8831 (retried, delivered)" },
      { id: "e2", at: "2026-07-31T08:03:55Z", level: "warning", source: "queue.worker", message: "Backlog above threshold (1.2k > 1k)" },
      { id: "e3", at: "2026-07-30T22:17:41Z", level: "error", source: "webhook.inbound", message: "Signature mismatch from org_2 endpoint" },
      { id: "e4", at: "2026-07-30T19:52:08Z", level: "warning", source: "domain.verify", message: "DNS propagation slow for volt.xyz (still pending)" },
    ],
  };
}
