# PRD — Internal Admin Dashboard (backend)

**Status:** Draft for team review · **Date:** 2026-07-24
**Audience:** OnchainSuite team (internal only — never customer-facing)
**Owner:** Backend · frontend surface lives in the dashboard repo behind a
platform-admin gate.

***

## 1. Why

Today, answering "is the platform healthy / who are our users / did that
payment land?" requires SSH-level tools: Render logs, Neon SQL, Bull Board,
scattered health endpoints. Every launch-week incident this month (Azure env
drift, stuck Event Grid subscription, org-less users, unfired scheduled
campaigns) was diagnosed by hand. The admin dashboard turns those
investigations into a screen the whole team can read.

**Goals**

1. One place to see **system status** at a glance (and get paged less).
2. **Business analytics** without SQL: users, orgs, revenue, usage growth.
3. **User/org operations**: look up any org, see plan/usage/health, fix
   common problems (resync a domain, credit a wallet, resend an invite).

**Non-goals (v1):** feature flags, customer impersonation, editing campaign
content, anything writeable by non-admins, public status page (separate,
later).

## 2. Access model

- Platform-level roles already exist: `UserRole.SUPER_ADMIN` / `ADMIN`
  (distinct from per-org roles). The admin API is a new `AdminModule`
  mounted at **`/admin/*`**, guarded by `BetterAuthGuard` + the existing
  platform `RolesGuard` with `@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)`;
  **mutating admin actions require** **`SUPER_ADMIN`**.
- Every mutating admin action writes an **audit row**
  (`admin_audit_log`: who, action, target, payload, at) — new model, the
  only schema addition in v1.
- Frontend: `/admin` section in the existing dashboard app, rendered only
  when the session user's platform role is admin (server-checked on every
  API call regardless).
- Bench rule: all `/admin/*` mutating routes must 401/403 pre-auth (the
  api-benchtest covers this automatically once routes exist).

## 3. Information architecture (5 areas)

### 3.1 System status (P0)

One screen aggregating what already exists — no new collectors:

| Signal                                                                | Source (already live)                                            |
| --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| API/DB/Redis/queue health                                             | `/health`, `/health/queues`, `/health/apis`, `/health/worker`    |
| Route-level error hotspots                                            | `/observability/apis`, `/observability/modules`                  |
| AI subsystem (embeddings/vector store/LLM)                            | `/ai/health`, `GET /ai/metrics`                                  |
| Azure email plane (per-domain verification states, sendReady)         | `/domain/azure/status`                                           |
| Queue depths + failed jobs                                            | Bull Board data (`/admin/queues`) surfaced as counts             |
| Schedulers (campaign, billing expiry, AI reindex): last run + outcome | new: each scheduler writes a heartbeat row/log line to read back |
| Process metrics (RSS, event-loop lag)                                 | `/metrics` (Prometheus) summarized                               |

New endpoint: **`GET /admin/status`** — a single aggregation call the UI
polls (60s), returning green/amber/red per subsystem + the raw detail
blocks above. Budget rule: it must stay cheap (parallel fan-out with 3s
per-probe timeout; failures render amber, never hang the page).

### 3.2 Analytics (P0)

**`GET /admin/analytics/overview?window=30d`** returning:

- **Growth:** users total/new, orgs total/new, activation rate (orgs that
  verified a domain or connected a wallet within 7 days).
- **Engagement:** campaigns launched, messages sent by channel
  (email vs in-app, from `delivery_events`), automations fired
  (entries created), app events ingested (`app_events`), AI queries
  (`aiQueryLog`).
- **Revenue:** plan distribution (orgs per tier from `organization.plan`),
  MRR (sum of catalog price by plan), PAYG wallet balances outstanding +
  30d top-up volume (`credit_balances` / `credit_ledger`), upcoming
  expirations (next 14 days, from `planExpiresAt`).
- **Deliverability:** platform-wide bounce/complaint rates (already
  computed per-org by `EmailReputationService` — add a cross-org rollup),
  domains by `sendReady` state.

All read-only aggregations over existing tables; heavier ones cached 5 min.

### 3.3 Users & orgs (P0 read, P1 actions)

- **`GET /admin/orgs?query=&page=`** — search by name/slug/id/plan; row =
  plan, planExpiresAt, member count, contacts, monthly messages, wallet
  balance, created, last activity.
- **`GET /admin/orgs/:id`** — full profile: members+roles, domains with
  verification states, usage meters vs limits, recent delivery events,
  PAYG ledger tail, campaigns/automations counts, onboarding progress
  (reuses `GET /onboarding/admin/summary` internals).
- **`GET /admin/users?query=`** — user search: email, orgs+roles, verified,
  created, last session.
- **P1 actions (SUPER\_ADMIN + audited):**
  - resync a domain (invokes existing `syncDomain`)
  - grant/adjust PAYG wallet credit (existing `payg.credit` with kind
    `admin_grant`)
  - extend `planExpiresAt` / change plan (existing activation path)
  - disable/enable a member or an org (existing flags)
  - resend invite / verification email (existing services)

### 3.3b Visitor analytics — geolocation, visitors, pages (P1)

**Why not just "pull from Vercel":** Vercel Web Analytics has **no public
query API** — its visitor/geo data is viewable only in vercel.com's own
dashboard and can't be embedded or fetched into ours. So we capture the
same signals ourselves at the edge, which is straightforward because every
page request already passes through our Next.js app on Vercel:

1. **Collection (dashboard repo):** Next.js middleware records one event
   per page view using the geo data **Vercel already attaches to every
   request** (`x-vercel-ip-country`, `x-vercel-ip-country-region`,
   `x-vercel-ip-city` headers / `request.geo`): path, country, region,
   city, referrer, and an anonymous daily visitor hash
   (`sha256(ip + UA + day)` — no raw IP stored, GDPR-friendly). Fire-and-
   forget POST to the backend; never blocks rendering.
2. **Ingest (backend):** `POST /admin-analytics/visits` (internal key, not
   customer-facing) buffers and writes **daily aggregates**, not raw rows:
   `visit_daily_rollups (day, path, country, visitors, views)` — bounded
   storage per the Neon budget (raw events discarded after rollup;
   \~hundreds of rows/day, not millions).
3. **Serve:** `GET /admin/analytics/visitors?window=30d` → total visitors,
   views, top pages, top countries/cities, daily timeseries — rendered as
   the "Visitors" card + world map in the admin dashboard.

Notes: keep Vercel Web Analytics enabled anyway (free tier, useful
cross-check in vercel.com for the team); if we later prefer buying instead
of building, **Plausible or PostHog have real APIs** and could feed the
same admin card — the collection design above costs \~a day and keeps the
data first-party.

### 3.4 Billing operations (P1)

- Pending upgrades stuck > 1h (`pending_upgrades` by status) with the
  Blockradar reference for reconciliation.
- Webhook failure feed (amount mismatches, signature failures — from logs
  today; add a `billing_webhook_events` row write when we get there).
- Credit ledger browser (org, kind, amount, reference).

### 3.5 Deliverability & email ops (P1)

- Per-domain table across ALL orgs: verification states, sendReady, 7-day
  bounce/complaint (per-domain reputation from the warm-up design doc),
  suppression counts.
- Warm-up/quota tracker: which domains are on which ACS tier
  (`DomainSendingPolicy` once the sending-limits design ships) and
  `readyForTierRequest` flags — feeds the Azure quota-ticket runbook.

### 3.5b Multi-provider email monitoring (P1)

We send through three ESPs behind one provider-neutral pipeline — Azure
Communication Services (`acs`), SendGrid (`sendgrid`), and AWS SES (`ses`) —
routed by env (`EMAIL_PROVIDER` for transactional, `MARKETING_PROVIDER` for
bulk). When a provider's reputation slips, deliverability (and revenue) slips
with it, so ops needs the three **side-by-side**, not one at a time.

New endpoint: **`GET /admin/email/providers/health`** (platform-admin only —
`BetterAuthGuard` + platform `RolesGuard`, `@Roles(ADMIN, SUPER_ADMIN)`).
Read-only: it never sends mail and never changes routing. Returns:

- **`activeRouting`** — which provider currently carries `transactional` vs
  `marketing` mail (derived from `EMAIL_PROVIDER` / `MARKETING_PROVIDER`, with
  the same ACS fallback the send path uses).
- **`providers[]`** — one **health card** per ESP:
  - **configured** — the adapter's `isConfigured()` (env completeness), so an
    unconfigured provider reads as present-but-off rather than vanishing.
  - **activeRole** — `transactional` | `marketing` | `both` | `inactive`.
  - **metrics** — `sent`, `delivered`, `bounced`, `complained`, plus
    **bounce rate** (`bounced / (delivered + bounced)`) and **complaint rate**
    (`complained / delivered`), over **both a 24h and a 7d window**.
  - **reputationStatus** — `healthy` | `warning` | `critical` from the
    deliverability thresholds below (evaluated on the 7d window).

**Per-provider attribution:** `DeliveryEvent` gains a nullable `provider`
column (`acs` | `ses` | `sendgrid`), stamped by each ingest service on its own
events (ACS Event Grid, SES→SNS, SendGrid Event Webhook). Additive and
back-compat: rows written before the column stay `NULL` and surface as
unattributed. Counts are aggregated by `provider` + `event_type` over each
window.

**Deliverability thresholds** (mirror the per-org `EmailReputationService`):

| Status     | Trigger                                           |
| ---------- | ------------------------------------------------- |
| `warning`  | bounce rate ≥ **2%** OR complaint rate ≥ **0.1%** |
| `critical` | bounce rate ≥ **5%** OR complaint rate ≥ **0.5%** |

**Fail-soft:** a provider whose metrics can't be computed returns zeroed
counts + `reputationStatus: 'healthy'` — one provider's failure never blanks
the board or 500s the endpoint.

## 4. API design summary

| Endpoint                                                                          | Method   | Role                 | Phase |
| --------------------------------------------------------------------------------- | -------- | -------------------- | ----- |
| `/admin/status`                                                                   | GET      | ADMIN                | P0    |
| `/admin/analytics/overview`                                                       | GET      | ADMIN                | P0    |
| `/admin/orgs` / `/admin/orgs/:id`                                                 | GET      | ADMIN                | P0    |
| `/admin/users`                                                                    | GET      | ADMIN                | P0    |
| `/admin/orgs/:id/actions/*` (sync-domain, credit-wallet, set-plan, toggle-member) | POST     | SUPER\_ADMIN         | P1    |
| `/admin/billing/pending` · `/admin/billing/ledger`                                | GET      | ADMIN                | P1    |
| `/admin/analytics/visitors` (+ internal ingest `/admin-analytics/visits`)         | GET/POST | ADMIN / internal key | P1    |
| `/admin/email/domains`                                                            | GET      | ADMIN                | P1    |
| `/admin/email/providers/health`                                                   | GET      | ADMIN                | P1    |

Conventions per CLAUDE.md: response envelope, pagination on every list,
DTO validation, no module cycles (AdminModule imports Database only and
calls sibling services through existing global/queue patterns; where a
service isn't globally available, P1 actions enqueue by queue name).

## 5. Build plan

| Phase  | Scope                                                                                                                                                                                               | Estimate                             |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **P0** | AdminModule + guards + audit model/migration; `/admin/status`, `/admin/analytics/overview`, org/user read endpoints; frontend `/admin` section (status board + analytics cards + org search/detail) | \~3–4 days backend + 3 days frontend |
| **P1** | Audited actions (domain resync, wallet credit, plan set, member toggle), billing ops, deliverability table                                                                                          | \~3 days backend + 2 days frontend   |
| **P2** | Scheduler heartbeats surfaced, webhook event persistence, alerting hooks (email/Slack on red status), CSV exports                                                                                   | as needed                            |

Definition of done per phase: CLAUDE.md §13 (specs, boot, bench clean with
new op count, API\_ENDPOINTS.md entries — marked internal-only).

## 6. Success criteria

- Any teammate can answer "is prod healthy?" in <10 seconds without Render
  access.
- Org support questions (plan? usage? domain stuck?) answered from one
  screen, no SQL.
- Every admin mutation traceable in `admin_audit_log`.
- Zero admin endpoints reachable without platform-admin role (bench-enforced).

## 7. Open questions for the team

1. Should ADMIN (non-super) see revenue numbers, or restrict analytics to
   SUPER\_ADMIN? Restrict to Super Admin
2. Slack alerts on status flips (P2) — which channel, what severity gates? email and slack
3. Data retention for `admin_audit_log` (proposal: 1 year). OKay




# Admin Dashboard — What a Unicorn-Scale Startup Needs

Companion to the existing `notes/admin-dashboard-prd.md` (the internal ops PRD)
and `notes/admin-dashboard-endpoints.md` (the 469-endpoint inventory). This doc
says **what to surface and why** — the panels, the north-star metrics, and the
data source for each — framed for a company that wants to scale to unicorn.

Principle: a great admin dashboard answers three questions at a glance —
**Are we growing? Are customers healthy? Is the system healthy?** — and lets you
drill from any number to the row that caused it.

---

## 0. The top strip — 6 north-star tiles (always visible)
| Tile | Why | Source |
| --- | --- | --- |
| **MRR / ARR** (+ MoM growth %) | the number the board asks first | `billing/*` (subscriptions, invoices) |
| **Net Revenue Retention (NRR)** | the single best unicorn predictor (>120% is elite) | billing + cohort math over `subscription`/`invoice` |
| **Active orgs (WAU/MAU)** | is the product used, not just bought | `organization/*`, `delivery_events`, usage meters |
| **Activation rate** | % of new orgs reaching first value (<10 min per the product spec) | `onboarding/*`, first-campaign/first-cohort events |
| **Email failure rate (30d)** | reputation = deliverability = revenue | `observability`, `delivery_events` |
| **System health** (RED + SLO) | one green/amber/red | `health/*`, `/metrics`, `/health/circuits` |

Each tile is a sparkline + current value + trend; click → the section below.

---

## 1. Revenue & billing
Panels: **MRR/ARR** with new/expansion/contraction/churn waterfall · **plan
distribution** (PAYG vs Launch/Growth/Pro) · **churn & NRR by cohort** · **LTV
and CAC / LTV\:CAC ratio** · **PAYG balances + burn** · **failed payments** ·
**refunds/disputes flagged for review** (the `BILLING_REFUND_REVIEW` alerts) ·
**credit consumption** (messages / GoldRush / AI).
Source: `billing` (28 ops), `intelligence/query/credits`, PAYG ledger.
Unicorn extras: **magic number**, **burn multiple**, **quick ratio**
(new+expansion ÷ churn+contraction).

## 2. Customers (orgs) & health scoring
Panels: **org table** (plan, seats, MRR, created, last-active, health score) ·
**at-risk list** (declining usage, high bounce, unpaid) · **expansion candidates**
(near a tier limit) · **org detail** drill-down (members, domains, campaigns,
billing history, usage vs limits).
Source: `organization` (23) + `organizations` (7) + `user` + usage meters.
Health score = weighted(usage trend, seats active, deliverability, payment
status) — the leading indicator of churn/expansion.

## 3. Growth funnel (AARRR)
Panels: **acquisition** (signups by source/day) · **activation** (funnel:
signup → org → connect → first cohort → first campaign) · **retention**
(cohort curves, DAU/MAU) · **referral/invites** · **expansion**.
Source: `auth` (24), `onboarding` (7), `user` (9), `organization/invites`.
Flag: **org-less users** and **stuck onboarding** (a launch-week incident class).

## 4. Product usage & engagement
Panels: **campaigns sent / open / click / unsubscribe** · **active automations
+ runs + failures** · **audience sizes & import health** · **intelligence
queries + AI/GoldRush credit spend** · **in-app push delivered/viewed**.
Source: `campaigns` (40), `automations` (49), `audience` (61),
`intelligence` (82), `ai` (7), `inapp` (3). *This is where your product depth
lives — the biggest endpoint groups.*

## 5. Email / deliverability (your reputation moat)
Panels: **send volume by provider** (ACS/SES/SendGrid) · **bounce & complaint
rate — 30d, per provider AND per org** (alert at 1% / 0.1%) · **suppression-list
size + growth** · **domain-verification status** (DKIM/SPF/DMARC per customer
domain) · **warm-up / rate-limit state per domain** · **webhook health**
(SES→SNS, SendGrid Event Webhook).
Source: `domain` (13), `sender-identities` (8), `email` (6), `observability`,
`delivery_events`. See `notes/sterling-email-reputation.md`.

## 6. System health & operations
Panels: **RED metrics** (rate/errors/duration, p50/p95/p99) · **queue depths +
failed jobs** (Bull Board link) · **circuit-breaker states** (`/health/circuits`)
· **worker heartbeats** · **external-API health** (GoldRush/Azure/Stripe/
BlockRadar) · **error feed**.
Source: `health` (6), `observability` (3), `/metrics`, `/health/queues|mcp|worker`.

## 7. Trust, safety & data quality
Panels: **manual-review queues** (amount-mismatch payments, refund reviews,
reference-less deposits) · **suppressed/complained recipients** · **data-quality
alerts** (org-less users, unfired schedules, stuck enrichments) · **audit log**
of admin actions.
Source: `billing`, `audience`, `identity` (9), plus ops queries.

---

## 8. Cross-cutting requirements for a *unicorn-grade* dashboard
- **Real-time-ish** — the top strip refreshes; don't make ops SSH for "is it up".
- **Drill-everywhere** — every metric → the underlying rows.
- **Alerting, not just charts** — thresholds on failure rate, churn spike,
  payment failures, complaint rate, queue backlog → Slack/Pager.
- **Cohorts & time-series** — retention/NRR are cohort questions; store daily
  snapshots so trends survive.
- **Per-tenant AND aggregate** — every reputation/usage number needs both views
  (one bad tenant can throttle shared SES reputation).
- **RBAC + audit** — platform-admin gate, and log who did what.
- **SLOs** — define and display: API p95 < 500ms, email failure < 1%, uptime
  target; show error budget burn.

## 9. Build order (MVP → unicorn)
1. **MVP:** the 6 north-star tiles + org table + system health + email failure
   rate. (Answers growth/health/uptime immediately.)
2. **v2:** revenue waterfall + churn/NRR cohorts + funnel + per-provider
   deliverability.
3. **v3:** health scoring, at-risk/expansion lists, alerting, SLO error budgets,
   audit log.

Most data already exists behind the endpoints in
`notes/admin-dashboard-endpoints.md`; the gaps are **daily snapshots** (for
cohorts/trends) and **a couple of aggregate admin endpoints** (platform-wide
MRR, failure rate, org health) that don't exist yet as single calls.

---

## 10. What a unicorn-stage admin needs

The panels above answer "are we growing / healthy / up?". This section is the
**prioritized capability spec** — the surfaces a company scaling toward unicorn
actually runs on. Roadmap, not implementation: each item names the moat it
protects and the data it stands on. **P0** = table stakes at scale, **P1** =
the next tier, **P2** = leverage.

### 10.1 Deliverability command center (P0)
Email is the product's reputation moat; one bad sender can throttle a shared IP
pool for everyone.
- **Per-provider + per-domain reputation** side-by-side (ACS / SendGrid / SES),
  each with bounce/complaint rate and a healthy/warning/critical status — the
  aggregate hides the tenant that's poisoning the pool.
  *(Shipping: `GET /admin/email/providers/health` — the per-provider half.)*
- **Bounce/complaint trends** — time-series, not just a current number; a rate
  creeping up over a week is the early warning.
- **Blocklist watch** — Spamhaus/Barracuda/Google Postmaster + SES account
  reputation & sending-pause signals; alert the moment an IP/domain is listed.
- **Provider failover** — one-click (and eventually automatic) reroute of
  transactional/marketing traffic to a healthy provider when one degrades, plus
  the SES→SendGrid daily-cap overflow already wired into the resolver.
- **Suppression + warm-up state** — list size/growth and per-domain warm-up/tier
  posture, feeding the ACS quota-ticket runbook.
Source: `delivery_events` (`provider` column), `EmailProviderResolver`,
`EmailReputationService`, `DomainSendingPolicy`, provider postmaster APIs.

### 10.2 Revenue ops (P0)
- **MRR / ARR** with the new/expansion/contraction/churn waterfall, and **churn
  + NRR by cohort**.
- **Stripe + BlockRadar reconciliation** — one ledger view across both PSPs;
  flag amount mismatches, missing references, and unreconciled deposits.
- **Failed-payment / refund / dispute queues** — actionable work lists
  (`BILLING_REFUND_REVIEW` alerts), not just counts, with retry/settle actions.
- **PAYG wallet balances + burn** — outstanding balances, top-up volume, and
  projected-empty dates so dunning fires before a wallet runs dry.
Source: `billing`, `credit_balances` / `credit_ledger`, `pending_upgrades`,
Stripe + BlockRadar webhooks.

### 10.3 Tenant ops (P1)
- **Customer 360** — one org page: plan, usage vs limits, deliverability,
  billing history, members, domains, support/incident history, health score.
- **Impersonation** (audited, time-boxed, SUPER_ADMIN) — "see what the customer
  sees" without asking for their password.
- **Plan / quota overrides** — grant credit, bump a limit, extend an expiry,
  change tier from the console (all audited).
- **Suspend / enable** an org or member; **feature flags** per org for staged
  rollouts and kill-switches.
Source: `organization`, `user`, usage meters, feature-flag store, audit log.

### 10.4 Abuse / fraud (P1)
- **Spam-sender detection** — accounts with anomalous bounce/complaint or
  content patterns; auto-throttle before they burn shared reputation.
- **Anomalous-send detection** — sudden volume spikes, list-bombing,
  disposable-domain floods; rate-limit + hold for review.
- **Abuse queue** — a triage surface for flagged tenants with freeze / warn /
  ban actions, wired to the same suppression pipeline.
Source: `delivery_events`, send-rate telemetry, signup/enrichment signals.

### 10.5 System health / SLOs (P0)
- **Queue depth + worker heartbeats** — per queue, with last-run/outcome for
  each scheduler (a launch-week incident class).
- **Redis / DB health** — connection pools, replication lag, memory pressure.
- **Error budgets** — define and display SLOs (API p95 < 500ms, email failure
  < 1%, uptime target) and burn rate, not just raw dashboards.
- **Incident timeline** — a running feed of status flips + deploys so "what
  changed?" is answerable in seconds.
Source: `health/*`, `/metrics`, `observability`, Bull Board, scheduler
heartbeats.

### 10.6 Growth analytics (P1)
- **Activation funnel** — signup → org → connect → first cohort → first
  campaign, with drop-off per step and time-to-value.
- **Feature adoption** — which features an org has ever used vs its plan, to
  drive expansion plays and spot dead features.
- **Cohort retention** — weekly/monthly curves and DAU/MAU, stored as daily
  snapshots so trends survive.
Source: `auth`, `onboarding`, `campaigns`, `automations`, `app_events`,
daily-snapshot tables.

### 10.7 Compliance / audit (P1 → P2)
- **Immutable audit log** — every admin mutation (who, action, target, payload,
  at); the `admin_audit_log` model from the PRD, append-only.
- **GDPR export / delete** — per-subject data export and right-to-erasure
  workflows across contacts, events, and PII, with a verifiable completion
  record.
- **Data-residency** — visibility into where each tenant's data lives and
  controls to keep region-pinned tenants compliant.
Source: `admin_audit_log`, `identity`, contact PII stores, region metadata.

---


