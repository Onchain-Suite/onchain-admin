# Runbook — GitHub sign-in setup

How to turn on GitHub authentication for the admin console. Sign-in is
restricted to members of the `onchainsuite` GitHub org; the GitHub **username**
is the identity used for authorization.

## Plan: free — no GitHub Pro needed

Everything below works on **GitHub Free**: OAuth apps, the org-membership check
(`read:org`), the private repo, and Actions CI (2,000 free min/month for private
repos; our run is ~40s). Pro/Team/Enterprise are **not** required. (Only SAML
SSO/SCIM needs Enterprise, and we don't use it.)

---

## Step 1 — Create the OAuth app (org-owned)

GitHub → the **onchainsuite** org → **Settings → Developer settings → OAuth Apps
→ New OAuth App** (org-owned so it survives any one person leaving; a personal
app at `github.com/settings/developers` also works).

- **Application name:** `OnchainSuite Admin`
- **Homepage URL:** your production URL, e.g. `https://admin.onchainsuite.com`
  (or the Vercel URL for now)
- **Authorization callback URL:** `https://admin.onchainsuite.com/api/auth/callback/github`
  - ⚠️ A classic OAuth app allows **one** callback URL. Use the **production**
    one here. For local sign-in testing, see "Local development" below.

Click **Register application**, then:

- Copy the **Client ID** → `AUTH_GITHUB_ID`
- **Generate a new client secret** → `AUTH_GITHUB_SECRET` (shown once — copy it)

## Step 2 — Approve the app for the org (if restrictions are on)

If the org has **third-party application access policy** enabled (Org → Settings
→ Third-party Access), an **org owner** must approve the app, or the
org-membership check can't read membership and sign-in will fail. If the policy
is off, nothing to do.

## Step 3 — Set the env vars in Vercel

Vercel → `onchain-admin` project → **Settings → Environment Variables →
Production** (add to Preview too if you want the app usable on preview URLs):

```
AUTH_SECRET=<run: openssl rand -base64 32>          # secret
AUTH_GITHUB_ID=<client id from step 1>
AUTH_GITHUB_SECRET=<client secret from step 1>       # secret
ADMIN_GITHUB_ORG=onchainsuite

# Who can sign in (optional). These four = only them. Empty = any org member.
ADMIN_ALLOWLIST=jorshimayor,Olusegun-Aborode,joel-obafemi,mujeebahmad03
# Who can run mutating actions (domain resync, wallet credit, plan change).
ADMIN_SUPERADMINS=jorshimayor,Olusegun-Aborode,joel-obafemi,mujeebahmad03

BACKEND_URL=https://<backend>/api/v1
ADMIN_API_TOKEN=<read-only token, when the backend has it>   # secret
ADMIN_MOCK=1                                          # 0 once GET /admin/* is live
# never set ADMIN_DEV_BYPASS_AUTH in production
```

> **Usernames, not the org.** `onchainsuite` is the org and never appears as a
> signed-in identity — only put people's usernames in these lists. Org
> membership is already enforced separately, so `ADMIN_ALLOWLIST` is a *further*
> narrowing; leave it empty to admit every org member.

Redeploy (or push to `main`) so the new env takes effect.

## Step 4 — Set Deployment Protection to preview-only

Vercel → Settings → **Deployment Protection → Only Preview Deployments**. The
app's own GitHub sign-in is the production gate; leaving Vercel SSO on too would
double-prompt everyone.

## Step 5 — Verify

- [ ] Visit the production URL → redirected to `/signin`.
- [ ] "Sign in with GitHub" → GitHub consent → back into the app.
- [ ] A **non-org-member** who tries is bounced back to `/signin` (denied).
- [ ] A **super-admin** (list above) sees the "Admin actions" panel on an org
      detail page; a non-super-admin sees the read-only note instead.
- [ ] Sign out (top-right) returns to `/signin`.

---

## Local development

You do **not** need OAuth to run locally — `ADMIN_DEV_BYPASS_AUTH=1` in
`.env.local` signs you in as `dev` (a super-admin) and skips GitHub entirely.

To test **real** GitHub sign-in locally, either:
- temporarily point the prod OAuth app's callback at
  `http://localhost:3100/api/auth/callback/github`, or
- create a **second** personal OAuth app with that localhost callback and put
  its id/secret in `.env.local`, then set `ADMIN_DEV_BYPASS_AUTH=0`.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `redirect_uri` mismatch on GitHub | Callback URL in the OAuth app ≠ the app's `/api/auth/callback/github`. Match host + path exactly. |
| Signs in but immediately bounced to `/signin` | Not an `onchainsuite` member, or the org's third-party policy hasn't approved the app (Step 2). |
| Everyone can get in, even non-members | `ADMIN_GITHUB_ORG` unset/typo — the membership check defaults open only if it can't read; confirm the var and the app approval. |
| Super-admin panel never shows | The user's GitHub username isn't in `ADMIN_SUPERADMINS` (case-insensitive), or the var didn't redeploy. |
| `MissingSecret` / session errors | `AUTH_SECRET` not set in the environment. |
