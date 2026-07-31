import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const REQUIRED_ORG = (process.env.ADMIN_GITHUB_ORG ?? "onchainsuite").toLowerCase();

/**
 * In-app identity gate: sign in with GitHub, restricted to members of the
 * required org. Replaces the Cloudflare Access edge gate — no Cloudflare, DNS
 * stays on GoDaddy. The GitHub username becomes the identity used by the
 * SUPER_ADMIN allowlist (src/lib/access.ts).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      // read:org lets us verify org membership (incl. private) at sign-in.
      authorization: { params: { scope: "read:user read:org" } },
    }),
  ],
  callbacks: {
    // Only members of REQUIRED_ORG may sign in.
    async signIn({ account }) {
      const token = account?.access_token;
      if (!token) return false;
      try {
        const res = await fetch("https://api.github.com/user/orgs", {
          headers: {
            authorization: `Bearer ${token}`,
            accept: "application/vnd.github+json",
            "user-agent": "onchain-admin",
          },
        });
        if (!res.ok) return false;
        const orgs = (await res.json()) as Array<{ login?: string }>;
        return orgs.some((o) => o.login?.toLowerCase() === REQUIRED_ORG);
      } catch {
        return false;
      }
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
  pages: { signIn: "/signin" },
});
