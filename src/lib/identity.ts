// SERVER ONLY. Resolves the signed-in identity from the Auth.js session and the
// platform role for gating mutating actions.
import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/access";

export interface Identity {
  /** GitHub username (or "unknown" when not signed in). */
  user: string;
  /** May run mutating admin actions (PRD: SUPER_ADMIN only). */
  superAdmin: boolean;
  /** True only for the local dev bypass; never in production. */
  isDev?: boolean;
}

/** Local escape hatch so the console runs without real OAuth on localhost. */
function devBypass(): Identity | null {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.ADMIN_DEV_BYPASS_AUTH === "1"
  ) {
    return { user: "dev", superAdmin: true, isDev: true };
  }
  return null;
}

export async function getIdentity(): Promise<Identity> {
  const dev = devBypass();
  if (dev) return dev;
  const session = await auth();
  const user = session?.user?.login ?? session?.user?.email ?? "unknown";
  return { user, superAdmin: isSuperAdmin(user) };
}
