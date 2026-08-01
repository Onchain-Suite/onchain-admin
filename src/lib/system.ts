// SERVER ONLY. Live system-monitoring board composed from the backend's
// existing GLOBAL endpoints (no org context, no new backend work):
//   /health, /health/queues, /health/circuits, /health/worker, /health/apis,
//   /observability/failure-rate
// Fail-soft: any endpoint that errors is skipped, never blanks the board.
import type { HealthStatus } from "@/lib/types";

const BASE = (process.env.BACKEND_URL ?? "").replace(/\/$/, "");
const TOKEN = process.env.ADMIN_API_TOKEN ?? "";

export interface Subsystem {
  name: string;
  status: HealthStatus;
  detail?: string;
}
export interface QueueRow {
  name: string;
  waiting: number;
  active: number;
  failed: number;
  workers: number;
}
export interface FailureRate {
  status: HealthStatus;
  httpErrorRate: number; // 0..1
  httpTotal: number;
  queueFailureRate: number; // 0..1
  queueFailed: number;
}
export interface SystemStatus {
  overall: HealthStatus;
  subsystems: Subsystem[];
  queues: QueueRow[];
  failure: FailureRate | null;
  routes: { observed: number; failing: number; degraded: number } | null;
}

export interface SystemRead {
  data: SystemStatus;
  /** true when the backend was unreachable and we fell back to sample data. */
  isMock: boolean;
  error?: string;
}

const mapStatus = (s?: string): HealthStatus => {
  const v = (s ?? "").toLowerCase();
  if (["up", "ok", "healthy", "closed"].includes(v)) return "operational";
  if (["degraded", "warn", "warning", "half-open"].includes(v)) return "degraded";
  return "down"; // down, failing, open, error, unknown
};

const titleize = (key: string) =>
  key
    .replace(/[:_]/g, ": ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Db", "DB");

async function get<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: TOKEN ? { authorization: `Bearer ${TOKEN}` } : {},
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: T } | T;
    return (body && typeof body === "object" && "data" in body
      ? (body as { data: T }).data
      : (body as T)) ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ── Response shapes (from the live API) ─────────────────────────────────── */
interface HealthResp {
  status?: string;
  info?: Record<string, { status?: string; message?: string; ageMs?: number }>;
}
interface QueuesResp {
  metrics?: Array<{
    name: string;
    waiting?: number;
    active?: number;
    failed?: number;
    workers?: number;
  }>;
}
interface CircuitsResp {
  circuits?: Array<{ name?: string; status?: string }>;
}
interface WorkerResp {
  groups?: Array<{ group: string; healthy?: boolean; ageMs?: number }>;
}
interface ApisResp {
  summary?: { observedRoutes?: number; failingRoutes?: number; degradedRoutes?: number };
}
interface FailureResp {
  status?: string;
  http?: { errorRate?: number; totalRequests?: number };
  queues?: { failureRate?: number; totalFailed?: number };
}

export async function getSystemStatus(): Promise<SystemRead> {
  const [health, queues, circuits, worker, apis, failure] = await Promise.all([
    get<HealthResp>("/health"),
    get<QueuesResp>("/health/queues"),
    get<CircuitsResp>("/health/circuits"),
    get<WorkerResp>("/health/worker"),
    get<ApisResp>("/health/apis"),
    get<FailureResp>("/observability/failure-rate"),
  ]);

  if (!health && !queues && !failure) {
    return { data: mockSystemStatus(), isMock: true, error: "backend unreachable" };
  }

  const subsystems: Subsystem[] = [];
  for (const [key, v] of Object.entries(health?.info ?? {})) {
    subsystems.push({
      name: titleize(key),
      status: mapStatus(v?.status),
      detail: v?.message ?? (v?.ageMs != null ? `${Math.round(v.ageMs / 1000)}s ago` : undefined),
    });
  }
  if (circuits) {
    const open = (circuits.circuits ?? []).filter((c) => mapStatus(c.status) !== "operational");
    subsystems.push({
      name: "Circuit breakers",
      status: open.length ? "degraded" : "operational",
      detail: open.length ? `${open.length} tripped` : "all closed",
    });
  }
  if (worker?.groups?.length) {
    const unhealthy = worker.groups.filter((g) => !g.healthy);
    subsystems.push({
      name: "Workers",
      status: unhealthy.length ? "down" : "operational",
      detail: `${worker.groups.length} groups${unhealthy.length ? `, ${unhealthy.length} stale` : ""}`,
    });
  }

  const queueRows: QueueRow[] = (queues?.metrics ?? []).map((q) => ({
    name: q.name,
    waiting: q.waiting ?? 0,
    active: q.active ?? 0,
    failed: q.failed ?? 0,
    workers: q.workers ?? 0,
  }));

  return {
    data: {
      overall: mapStatus(health?.status),
      subsystems,
      queues: queueRows,
      failure: failure
        ? {
            status: mapStatus(failure.status),
            httpErrorRate: failure.http?.errorRate ?? 0,
            httpTotal: failure.http?.totalRequests ?? 0,
            queueFailureRate: failure.queues?.failureRate ?? 0,
            queueFailed: failure.queues?.totalFailed ?? 0,
          }
        : null,
      routes: apis?.summary
        ? {
            observed: apis.summary.observedRoutes ?? 0,
            failing: apis.summary.failingRoutes ?? 0,
            degraded: apis.summary.degradedRoutes ?? 0,
          }
        : null,
    },
    isMock: false,
  };
}

/** Fallback only when the backend is unreachable. */
function mockSystemStatus(): SystemStatus {
  return {
    overall: "operational",
    subsystems: [
      { name: "Database", status: "operational", detail: "connection healthy" },
      { name: "Cache", status: "operational", detail: "up" },
      { name: "Workers", status: "operational", detail: "2 groups" },
      { name: "Circuit breakers", status: "operational", detail: "all closed" },
    ],
    queues: [
      { name: "email", waiting: 0, active: 0, failed: 4, workers: 1 },
      { name: "automation-runtime", waiting: 0, active: 0, failed: 0, workers: 1 },
    ],
    failure: { status: "operational", httpErrorRate: 0, httpTotal: 0, queueFailureRate: 0, queueFailed: 0 },
    routes: { observed: 4, failing: 0, degraded: 0 },
  };
}
