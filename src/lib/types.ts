/** Read-only monitoring contracts. Mirror these on the backend's GET /admin/* routes. */

export type HealthStatus = "operational" | "degraded" | "down";

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  detail?: string;
}

export interface OverviewStats {
  totalOrgs: number;
  activeOrgs7d: number;
  emailsSent24h: number;
  deliveryRate: number; // 0..1
  pushesSent24h: number;
  errors24h: number;
}

export interface SendPoint {
  date: string; // ISO date (yyyy-mm-dd)
  email: number;
  push: number;
}

export interface OrgRow {
  id: string;
  name: string;
  plan: string;
  members: number;
  emails30d: number;
  createdAt: string; // ISO
}

export interface ErrorRow {
  id: string;
  at: string; // ISO timestamp
  level: "error" | "warning";
  source: string;
  message: string;
}

/** One aggregate payload for the dashboard — GET /admin/snapshot. */
export interface AdminSnapshot {
  health: ServiceHealth[];
  stats: OverviewStats;
  sends: SendPoint[];
  orgs: OrgRow[];
  errors: ErrorRow[];
}
