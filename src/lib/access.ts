/**
 * Authorization helpers, keyed on the signed-in GitHub username. Org membership
 * is enforced at sign-in (src/auth.ts); these add optional finer-grained gates
 * on top.
 */

/** GitHub usernames permitted in-app beyond org membership. Empty = any org member. */
export function allowlist(): string[] {
  return (process.env.ADMIN_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowed(user: string): boolean {
  const list = allowlist();
  return list.length === 0 || list.includes(user.toLowerCase());
}

/** GitHub usernames permitted to run mutating admin actions (PRD: SUPER_ADMIN). */
export function superAdmins(): string[] {
  return (process.env.ADMIN_SUPERADMINS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Default-deny: with no ADMIN_SUPERADMINS set, nobody can mutate. */
export function isSuperAdmin(user: string): boolean {
  return superAdmins().includes(user.toLowerCase());
}
