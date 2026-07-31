// SERVER ONLY. Reads the identity verified by src/middleware.ts (Cloudflare
// Access JWT) and resolves the platform role for gating mutating actions.
import { headers } from "next/headers";

import { isSuperAdmin } from "@/lib/access";

export interface Identity {
  email: string;
  /** May run mutating admin actions (PRD: SUPER_ADMIN only). */
  superAdmin: boolean;
}

export async function getIdentity(): Promise<Identity> {
  const email = (await headers()).get("x-admin-email") ?? "unknown";
  return { email, superAdmin: isSuperAdmin(email) };
}
