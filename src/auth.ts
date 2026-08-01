import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const REQUIRED_ORG = (process.env.ADMIN_GITHUB_ORG ?? "onchainsuite").toLowerCase();

const GH_HEADERS = (token: string) => ({
  authorization: `Bearer ${token}`,
  accept: "application/vnd.github+json",
  "user-agent": "onchain-admin",
  "x-github-api-version": "2022-11-28",
});

/**
 * Is the authenticated user a member of REQUIRED_ORG? Tries the direct
 * membership endpoint first (works for private membership with read:org), then
 * falls back to listing orgs. Returns false only when neither confirms it.
 */
async function isOrgMember(token: string): Promise<boolean> {
  try {
    const m = await fetch(
      `https://api.github.com/user/memberships/orgs/${REQUIRED_ORG}`,
      { headers: GH_HEADERS(token) }
    );
    if (m.ok) {
      const body = (await m.json()) as { state?: string };
      if (body.state === "active") return true;
    }
  } catch {
    /* fall through to the list check */
  }
  try {
    const r = await fetch("https://api.github.com/user/orgs?per_page=100", {
      headers: GH_HEADERS(token),
    });
    if (r.ok) {
      const orgs = (await r.json()) as Array<{ login?: string }>;
      if (orgs.some((o) => o.login?.toLowerCase() === REQUIRED_ORG)) return true;
    }
  } catch {
    /* deny below */
  }
  return false;
}

/**
 * In-app identity gate: sign in with GitHub, restricted to members of the
 * required org. Gates the app at the app layer — no edge or DNS dependency.
 * The GitHub username becomes the identity used by the SUPER_ADMIN allowlist
 * (src/lib/access.ts).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      authorization: { params: { scope: "read:user read:org" } },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      const token = account?.access_token;
      return typeof token === "string" ? isOrgMember(token) : false;
    },
    async jwt({ token, profile }) {
      const login = (profile as { login?: string } | undefined)?.login;
      if (login) token.login = login;
      return token;
    },
    async session({ session, token }) {
      if (typeof token.login === "string") session.user.login = token.login;
      return session;
    },
  },
  pages: { signIn: "/signin", error: "/signin" },
});
