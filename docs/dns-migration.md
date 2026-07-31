# DNS migration runbook — GoDaddy → Cloudflare (for `admin.onchainsuite.com` Access)

**Goal:** put the `onchainsuite.com` DNS zone on Cloudflare so Zero Trust Access
can gate `admin.onchainsuite.com`, **without touching email deliverability**.

**What changes:** only the domain's **nameservers** (GoDaddy → Cloudflare).
GoDaddy stays the **registrar** (renewals, ownership unchanged). Cloudflare
becomes the authoritative DNS host. The **only** record that gets proxied
(orange cloud) is `admin.onchainsuite.com`; **every mail record stays "DNS only"
(grey cloud).**

**Why it's safe:** email routing is just DNS records (MX / SPF / DKIM / DMARC +
the sending-domain CNAMEs). Cloudflare serves them exactly like GoDaddy did and
never touches SMTP — it only proxies HTTP for orange-clouded records.

> ⚠️ The single most common mistake: letting Cloudflare **orange-cloud a DKIM /
> sending CNAME**. That flattens the target and **breaks DKIM + domain
> verification**. Keep all mail records **grey**.

---

## Phase 1 — Inventory (before you change anything)

- [ ] At GoDaddy, export/screenshot the **full DNS zone**.
- [ ] Record every mail-related entry explicitly:
  - [ ] `MX` records (mail routing)
  - [ ] `TXT` SPF (`v=spf1 …`)
  - [ ] `TXT` DMARC (`_dmarc.onchainsuite.com`)
  - [ ] **Every DKIM / sending CNAME** — including the per-domain
        SendGrid / ACS / SES verification CNAMEs this app's flow created
        (e.g. `s1._domainkey…`, `*._domainkey…`, provider verification hosts)
  - [ ] Any other subdomains (app, api, marketing, staging, etc.)
- [ ] Note whether **DNSSEC** is enabled at GoDaddy (Domain settings → DNSSEC).

## Phase 2 — Stage the zone in Cloudflare (nameservers NOT changed yet)

- [ ] Add `onchainsuite.com` to a Cloudflare account (Free plan is enough).
- [ ] Let Cloudflare **auto-scan** existing records.
- [ ] **Diff the import against your Phase 1 inventory.** Auto-scan misses
      records — manually add anything missing. A missing DKIM CNAME = signed
      mail starts failing after the switch.
- [ ] Set **every mail record to "DNS only" (grey cloud)**:
  - MX / TXT are grey by default (can't be proxied) — confirm.
  - **DKIM / sending CNAMEs**: Cloudflare may default these to orange — **flip
    each to grey.**
- [ ] Leave a placeholder for `admin` (added in Phase 5) — or add it now
      pointing at Vercel and orange-cloud it.

## Phase 3 — DNSSEC (skip only if it was never enabled)

- [ ] If DNSSEC is ON at GoDaddy: **disable it at GoDaddy first.**
- [ ] Wait for the DS record to clear (can take a few hours).
- [ ] (After Phase 4 propagates) re-enable DNSSEC **from Cloudflare** (DNS →
      Settings → DNSSEC → enable, then add the DS record it gives you back at
      GoDaddy).
- [ ] A DNSSEC mismatch during the switch breaks **all** resolution, mail
      included — do not skip this.

## Phase 4 — Flip the nameservers

- [ ] In Cloudflare, copy the **two assigned nameservers**.
- [ ] At GoDaddy: Domain → Nameservers → **change to Cloudflare's two**.
- [ ] Propagation is up to ~24–48h. Because records already match, there is
      **no downtime** — resolvers just move from one matching zone to the other.
- [ ] Cloudflare emails you when the domain is "Active".

## Phase 5 — Wire the admin subdomain + Access

- [ ] In Vercel, add `admin.onchainsuite.com` to the `onchain-admin` project.
- [ ] In Cloudflare DNS, add the record Vercel asks for (`CNAME admin →
      cname.vercel-dns.com` or the A/ALIAS Vercel specifies) and **proxy it
      (orange cloud)** so Access can intercept.
- [ ] In Cloudflare Zero Trust → Access → Applications, point the admin Access
      app (GitHub SSO policy) at `admin.onchainsuite.com` (see README §1).
- [ ] Set the app's env vars in Vercel (see `.env.example`): `CF_ACCESS_*`,
      `BACKEND_URL`, `ADMIN_API_TOKEN`, `ADMIN_SUPERADMINS`, `ADMIN_MOCK`.
- [ ] Set Vercel **Deployment Protection → Only Preview Deployments** so
      internal users aren't double-gated (Access + Vercel SSO).

## Phase 6 — Verify (do NOT skip)

**Email / deliverability**
- [ ] Send a test from each sending domain; confirm it lands (not spam).
- [ ] Check SPF + DKIM + DMARC all **pass** (mail-tester.com or Google
      Postmaster Tools).
- [ ] Re-run this app's domain verification "validate" for each sending domain —
      each should still report verified.
- [ ] Confirm inbound mail still arrives (MX intact).

**Admin app**
- [ ] `admin.onchainsuite.com` → Cloudflare Access login (GitHub) → app loads.
- [ ] The raw `*.vercel.app` URL returns **403** (gate working).

## Rollback

- [ ] If anything breaks, revert nameservers at GoDaddy to the originals.
      GoDaddy's zone still exists, so resolution returns to the old records
      within the TTL window. Fix the Cloudflare zone, then retry.

---

### Cost note
No extra charge for the `admin` subdomain: subdomains are free, Cloudflare DNS +
Zero Trust Access are free (≤50 users), Vercel custom domains are free, and TLS
certs are auto-provisioned free on both. You keep paying only the GoDaddy
registration you already have.
