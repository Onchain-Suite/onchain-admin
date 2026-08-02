import type { OrgListItem } from "@/lib/org-api";

const DAY = 24 * 60 * 60 * 1000;

/** Reputation is at risk when the backend flags it, or bounce/complaint is high. */
export function isAtRisk(o: OrgListItem): boolean {
  const status = (o.reputationStatus ?? "ok").toLowerCase();
  if (status === "warning" || status === "critical") return true;
  if ((o.bounceRate ?? 0) >= 0.02) return true;
  if ((o.complaintRate ?? 0) >= 0.001) return true;
  return false;
}

function activeWithin(o: OrgListItem, since: number): boolean {
  if (o.lastActivity) {
    const t = new Date(o.lastActivity).getTime();
    if (Number.isFinite(t) && t >= since) return true;
  }
  return (o.messages30d ?? 0) > 0;
}

export interface Fleet {
  total: number;
  new30d: number;
  active: number;
  plans: { plan: string; count: number }[];
  atRisk: OrgListItem[];
  worstBounce: number; // 0..1
  totalMessages30d: number;
  totalWallet: number;
}

/** Platform-wide rollup from the org fleet. `now` defaults to the wall clock. */
export function computeFleet(orgs: OrgListItem[], now = Date.now()): Fleet {
  const since = now - 30 * DAY;
  const plans = new Map<string, number>();
  let new30d = 0;
  let active = 0;
  let worstBounce = 0;
  let totalMessages30d = 0;
  let totalWallet = 0;

  for (const o of orgs) {
    plans.set(o.plan, (plans.get(o.plan) ?? 0) + 1);
    const created = new Date(o.createdAt).getTime();
    if (Number.isFinite(created) && created >= since) new30d += 1;
    if (activeWithin(o, since)) active += 1;
    worstBounce = Math.max(worstBounce, o.bounceRate ?? 0);
    totalMessages30d += o.messages30d ?? 0;
    totalWallet += o.walletBalance ?? 0;
  }

  return {
    total: orgs.length,
    new30d,
    active,
    plans: [...plans.entries()]
      .map(([plan, count]) => ({ plan, count }))
      .sort((a, b) => b.count - a.count),
    atRisk: orgs
      .filter(isAtRisk)
      .sort((a, b) => (b.bounceRate ?? 0) - (a.bounceRate ?? 0)),
    worstBounce,
    totalMessages30d,
    totalWallet,
  };
}
