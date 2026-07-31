# OnchainSuite Admin

Internal, **read-only** monitoring console, gated by **in-app GitHub sign-in**
restricted to the OnchainSuite GitHub org. No Cloudflare — DNS can stay on
GoDaddy. Standalone deployment on Vercel; none of this ships in the customer app
bundle.

Shares the OnchainSuite **Design System v2** tokens with the main app
(`src/app/globals.css` ↔ the main app's `src/styles/globals.css`). Keep them in
sync.

## The gate

1. **Sign in with GitHub** (Auth.js, `src/auth.ts`) — only members of the
   `onchainsuite` org can sign in; `src/middleware.ts` redirects everyone else
   to `/signin`. The GitHub **username** is the identity.
2. **SUPER_ADMIN** (`ADMIN_SUPERADMINS`) — of those who sign in, only listed
   usernames can run the mutating actions; everyone else is read-only.

The console only issues `GET /admin/*` to the backend with a scoped read-only
token; mutations go through audited, SUPER_ADMIN-only server actions.

## 1. GitHub OAuth app (one-time setup)

Create a GitHub OAuth app — `github.com/settings/developers` → **New OAuth App**
(or the org → Settings → Developer settings → OAuth Apps to own it at the org):

- **Homepage URL:** `https://admin.onchainsuite.com` (or your Vercel URL)
- **Authorization callback URLs:**
  - `https://admin.onchainsuite.com/api/auth/callback/github` (prod)
  - `http://localhost:3100/api/auth/callback/github` (dev)

Copy the **Client ID** and generate a **Client Secret** → `AUTH_GITHUB_ID` /
`AUTH_GITHUB_SECRET`. Set `ADMIN_GITHUB_ORG=onchainsuite` and an `AUTH_SECRET`
(`openssl rand -base64 32`). Org membership is checked at sign-in via the
`read:org` scope.

## 2. Backend read-only token

Have the backend issue a **scoped, read-only service token** (access to
`GET /admin/*` only) and expose an aggregate `GET /admin/snapshot` returning the
`AdminSnapshot` shape in `src/lib/types.ts`. Put the token in `ADMIN_API_TOKEN`.
Until that endpoint exists, leave `ADMIN_MOCK=1` and the console runs on sample
data.

## 3. Run locally

```bash
bun install
cp .env.example .env.local   # AUTH_SECRET is prefilled; add GitHub creds for real sign-in
bun run dev                  # ADMIN_DEV_BYPASS_AUTH=1 lets you in without OAuth
```

`ADMIN_DEV_BYPASS_AUTH=1` (dev only, ignored in production) skips GitHub sign-in
on localhost so you don't need OAuth to run the app. Never set it in a
deployment.

## 4. Deploy (Vercel)

Hosted on **Vercel** (matches the org's other frontends). CI/CD is wired: every
push to `main` deploys.

**Env vars** (Vercel → Project → Settings → Environment Variables, Production):

```
AUTH_SECRET=<openssl rand -base64 32>            # secret
AUTH_GITHUB_ID=<oauth app client id>
AUTH_GITHUB_SECRET=<oauth app client secret>     # secret
ADMIN_GITHUB_ORG=onchainsuite
BACKEND_URL=https://<backend>/api/v1
ADMIN_API_TOKEN=<read-only service token>        # secret
ADMIN_SUPERADMINS=your-gh-username,...            # who may mutate
ADMIN_MOCK=0                                       # once GET /admin/* is live
# never set ADMIN_DEV_BYPASS_AUTH in production
```

**Domain (optional, DNS stays on GoDaddy):**

1. Add `admin.onchainsuite.com` to the Vercel project.
2. In **GoDaddy DNS**, add the `CNAME admin → cname.vercel-dns.com` (or the
   record Vercel shows). No Cloudflare, no nameserver change.
3. Update the GitHub OAuth app's callback URL to the final hostname.

**Vercel Deployment Protection:** the app already gates itself with GitHub
sign-in, so set Protection to **Only Preview Deployments** (Project → Settings →
Deployment Protection) — otherwise viewers are double-gated (Vercel SSO *and*
GitHub) and each would need a Vercel account. The app's own `/signin` is the
production gate.

## Hardening already wired

- `X-Robots-Tag: noindex`, `X-Frame-Options: DENY`, `nosniff`, `no-referrer`
  on every response (`next.config.ts`).
- Read-only service layer — mutations only via audited, SUPER_ADMIN server actions.
- Middleware requires a valid session; unauthenticated → `/signin`.

## Structure

```
src/
  auth.ts                # Auth.js: GitHub provider, org-restricted sign-in
  middleware.ts          # gate: require session, else redirect to /signin
  lib/
    access.ts            # allowlist + SUPER_ADMIN (by GitHub username)
    identity.ts          # resolve signed-in user + role from the session
    admin-api.ts         # SERVER-ONLY read-only backend client
    admin-actions.ts     # SERVER-ONLY mutating actions (SUPER_ADMIN)
    endpoints.ts         # central backend endpoint map (reads + mutations)
    types.ts             # contracts (mirror on the backend)
    mock.ts              # sample data until GET /admin/* lands
  app/
    signin/, api/auth/[...nextauth]/  # sign-in page + Auth.js routes
    layout.tsx, globals.css, page.tsx, loading.tsx, actions.ts
  components/            # design-system-v2 UI (cards, badges, chart, filters)
```
