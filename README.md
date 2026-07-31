# OnchainSuite Admin

Internal, **read-only** monitoring console. Runs at `admin.onchainsuite.com`,
gated by **Cloudflare Access (GitHub SSO)** at the edge, with a second identity
check inside the app. Standalone deployment — none of this ships in the
customer app bundle.

Shares the OnchainSuite **Design System v2** tokens with the main app
(`src/app/globals.css` ↔ the main app's `src/styles/globals.css`). Keep them in
sync.

## Two gates

1. **Cloudflare Access** (network) — no unauthenticated request reaches the app.
2. **App** (`src/middleware.ts`) — re-verifies the Access JWT and applies an
   optional email allowlist. Belt and suspenders.

The console only ever issues `GET /admin/*` to the backend with a scoped
read-only token. There are no mutating actions by design.

## 1. Cloudflare Access — GitHub SSO (dashboard)

You don't have Google Workspace; use your existing GitHub org instead.

1. **Zero Trust → Settings → Authentication → Login methods → Add GitHub.**
   Follow the OAuth-app steps; authorize the `onchainsuite` org.
2. **Zero Trust → Access → Applications → Add → Self-hosted.**
   - Application domain: `admin.onchainsuite.com`
   - Identity provider: GitHub
   - Session duration: 8–24h
3. **Policy** (Allow): rule = *GitHub → Organization = onchainsuite*. Optionally
   require WARP / device posture.
4. Open the app's **Overview** and copy the **Application Audience (AUD) tag**,
   and note your **team domain** (`<team>.cloudflareaccess.com`).

For a 5-person team you can also add **One-time PIN** as a second login method
and require both, or allowlist the 5 emails via `ADMIN_ALLOWLIST`.

## 2. Backend read-only token

Have the backend issue a **scoped, read-only service token** (access to
`GET /admin/*` only) and expose an aggregate `GET /admin/snapshot` returning the
`AdminSnapshot` shape in `src/lib/types.ts`. Put the token in `ADMIN_API_TOKEN`.
Until that endpoint exists, leave `ADMIN_MOCK=1` and the console runs on sample
data.

## 3. Run locally

```bash
bun install
cp .env.example .env.local   # fill CF_ACCESS_* when wiring real auth
bun run dev                  # ADMIN_DEV_BYPASS_AUTH=1 lets you in on localhost
```

There is no Cloudflare Access in front of `localhost`, so
`ADMIN_DEV_BYPASS_AUTH=1` (dev only, ignored in production) bypasses the JWT
gate. Never set it in a deployed environment.

## 4. Deploy

Deploy anywhere that runs a Next.js Node server (or Cloudflare Workers via
OpenNext). The one hard requirement: `admin.onchainsuite.com` must be a
**Cloudflare-proxied** record (orange cloud) so the Access policy intercepts it.
Set the production env vars:

```
CF_ACCESS_TEAM_DOMAIN, CF_ACCESS_AUD, BACKEND_URL, ADMIN_API_TOKEN
ADMIN_MOCK=0            # once the backend endpoint is live
# do NOT set ADMIN_DEV_BYPASS_AUTH in production
```

## Hardening already wired

- `X-Robots-Tag: noindex`, `X-Frame-Options: DENY`, `nosniff`, `no-referrer`
  on every response (`next.config.ts`).
- Read-only service layer — no mutations exist.
- Access JWT verified in-app even though the edge already gates it.

## Structure

```
src/
  middleware.ts          # gate: verify Access JWT + allowlist
  lib/
    access.ts            # Access JWT verification (jose)
    admin-api.ts         # SERVER-ONLY read-only backend client
    types.ts             # AdminSnapshot contracts (mirror on the backend)
    mock.ts              # sample data until GET /admin/snapshot lands
  app/
    layout.tsx, globals.css, page.tsx, loading.tsx
  components/            # design-system-v2 UI (cards, badges, chart)
```
