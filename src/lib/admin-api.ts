// SERVER ONLY. Holds ADMIN_API_TOKEN — never import into a client component.
import { mockSnapshot } from "@/lib/mock";
import type { AdminSnapshot } from "@/lib/types";

const BACKEND_URL = (process.env.BACKEND_URL ?? "").replace(/\/$/, "");
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN ?? "";
const USE_MOCK = process.env.ADMIN_MOCK === "1";

/**
 * Bounded, read-only GET against the backend admin API. Unwraps the shared
 * `{ success, data }` envelope. Every call has a timeout + abort so the
 * dashboard can never hang on a slow upstream.
 */
async function getJson<T>(path: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${ADMIN_API_TOKEN}`,
        accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`GET ${path} → HTTP ${res.status}`);
    }
    const body = (await res.json()) as unknown;
    if (body && typeof body === "object" && "data" in body) {
      return (body as { data: T }).data;
    }
    return body as T;
  } finally {
    clearTimeout(timer);
  }
}

export interface SnapshotResult {
  snapshot: AdminSnapshot;
  /** True when serving built-in sample data rather than live backend data. */
  isMock: boolean;
  /** Set when a live fetch failed and we fell back to sample data. */
  error?: string;
}

/**
 * The dashboard's single read. Uses sample data when ADMIN_MOCK=1 (or when the
 * live call fails), so the console is always renderable. Read-only by design —
 * there are no mutating methods in this service.
 */
export async function getSnapshot(): Promise<SnapshotResult> {
  if (USE_MOCK) return { snapshot: mockSnapshot(), isMock: true };
  try {
    const snapshot = await getJson<AdminSnapshot>("/admin/snapshot");
    return { snapshot, isMock: false };
  } catch (e) {
    return {
      snapshot: mockSnapshot(),
      isMock: true,
      error: e instanceof Error ? e.message : "Failed to reach backend",
    };
  }
}
