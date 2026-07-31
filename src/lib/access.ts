import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Cloudflare Access identity verification.
 *
 * Access sits in front of admin.onchainsuite.com and injects a signed JWT on
 * every request (header `Cf-Access-Jwt-Assertion`, also the `CF_Authorization`
 * cookie). We verify it here so the app refuses even if the edge policy were
 * ever misconfigured or bypassed — defense in depth behind the network gate.
 */

const TEAM_DOMAIN = process.env.CF_ACCESS_TEAM_DOMAIN ?? "";
const AUD = process.env.CF_ACCESS_AUD ?? "";

// Lazily created so a missing env var doesn't crash module load in dev.
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  if (!TEAM_DOMAIN) return null;
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`https://${TEAM_DOMAIN}/cdn-cgi/access/certs`)
    );
  }
  return jwks;
}

export const ACCESS_JWT_HEADER = "cf-access-jwt-assertion";

export interface AccessIdentity {
  email: string;
  /** Cloudflare's stable user id (the `sub` claim). */
  userId?: string;
}

/**
 * Verify a Cloudflare Access JWT. Returns the identity on success, or null on
 * any failure (missing token, bad signature, wrong audience/issuer, expiry).
 */
export async function verifyAccessJwt(
  token: string | null | undefined
): Promise<AccessIdentity | null> {
  const keySet = getJwks();
  if (!token || !keySet || !AUD) return null;
  try {
    const { payload } = await jwtVerify(token, keySet, {
      issuer: `https://${TEAM_DOMAIN}`,
      audience: AUD,
    });
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!email) return null;
    return {
      email,
      userId: typeof payload.sub === "string" ? payload.sub : undefined,
    };
  } catch {
    return null;
  }
}

/** Emails explicitly permitted in-app, on top of the Access policy. Empty = allow all who pass Access. */
export function allowlist(): string[] {
  return (process.env.ADMIN_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowed(email: string): boolean {
  const list = allowlist();
  return list.length === 0 || list.includes(email.toLowerCase());
}

/** Emails permitted to run mutating admin actions (PRD: SUPER_ADMIN only). */
export function superAdmins(): string[] {
  return (process.env.ADMIN_SUPERADMINS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Default-deny: with no ADMIN_SUPERADMINS set, nobody can mutate. */
export function isSuperAdmin(email: string): boolean {
  return superAdmins().includes(email.toLowerCase());
}

/** Dev-only escape hatch so the console runs on localhost, where no Access sits in front. */
export function devBypassIdentity(): AccessIdentity | null {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.ADMIN_DEV_BYPASS_AUTH === "1"
  ) {
    return { email: "dev@onchainsuite.local", userId: "dev" };
  }
  return null;
}
