# Runbook — custom domain `admin.onchainsuite.com`

Point the admin console at `admin.onchainsuite.com`. It's a subdomain of a
domain you already own, so this is **one DNS record at GoDaddy** — no Cloudflare,
no nameserver change, and **no impact on email** (you're adding a CNAME for the
app, not touching MX / SPF / DKIM).

## Steps

1. **Vercel** — `onchain-admin` project → **Settings → Domains → Add** →
   `admin.onchainsuite.com`. It shows "Invalid Configuration" and the exact
   record to create (a CNAME for a subdomain).

2. **GoDaddy** — `onchainsuite.com` → **DNS → Add Record**:

   ```
   Type:  CNAME
   Name:  admin
   Value: cname.vercel-dns.com     ← use exactly what Vercel shows
   TTL:   1 hour (default)
   ```

   Save.

3. **Wait** a few minutes (up to ~1h). Vercel detects the record, flips to
   **Valid Configuration**, and auto-issues the TLS cert. `https://admin.onchainsuite.com`
   is live.

4. **Point auth at the domain** — in the GitHub OAuth app (see
   `github-auth-setup.md`):
   - Homepage URL → `https://admin.onchainsuite.com`
   - Authorization callback URL → `https://admin.onchainsuite.com/api/auth/callback/github`

## Notes

- If GitHub sign-in loops after adding the domain, set
  `AUTH_URL=https://admin.onchainsuite.com` in Vercel. Auth.js usually infers it
  on Vercel, so you likely won't need to.
- Set the domain as the project's **Production** domain in Vercel so it serves
  the production deployment.
- Deliverability is unaffected — this CNAME is only for the app hostname; your
  mail records at GoDaddy are untouched.
