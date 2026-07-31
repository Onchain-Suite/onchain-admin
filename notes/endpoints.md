# Admin Dashboard — Full Endpoint Inventory

All **469** API operations across **46** modules (generated from `src/docs/swagger.json`). Use this to wire the admin dashboard; see `notes/admin-dashboard-unicorn.md` for what to surface.

> Auth: session (`BetterAuthGuard` + `x-org-id`) for org routes; `SecretKeyGuard` (`sk_*`) for server-to-server; admin views should sit behind a platform-admin gate.


## intelligence  (82)

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/api/v1/intelligence/assistant` | Ask the multi-source intelligence assistant (in-process, tool-using chat) |
| `POST` | `/api/v1/intelligence/assistant/stream` | Stream the intelligence assistant over SSE (live tokens + tool/proposed events) |
| `GET` | `/api/v1/intelligence/insights` | List insights |
| `POST` | `/api/v1/intelligence/insights/generate` | Generate insight (internal trigger) |
| `GET` | `/api/v1/intelligence/insights/latest` | Get latest insight |
| `GET` | `/api/v1/intelligence/insights/{insightId}` | Get single insight |
| `POST` | `/api/v1/intelligence/insights/{insightId}/act` | Act on insight (fork recommended play) |
| `POST` | `/api/v1/intelligence/insights/{insightId}/dismiss` | Dismiss insight |
| `GET` | `/api/v1/intelligence/metrics` | Intelligence metrics |
| `GET` | `/api/v1/intelligence/pipelines` | List GoldRush-backed intelligence pipelines |
| `POST` | `/api/v1/intelligence/pipelines` | Create an intelligence pipeline with GoldRush Pipeline API sync |
| `GET` | `/api/v1/intelligence/pipelines/{pipelineId}` | Get an intelligence pipeline |
| `PUT` | `/api/v1/intelligence/pipelines/{pipelineId}` | Update an intelligence pipeline and resync it |
| `POST` | `/api/v1/intelligence/pipelines/{pipelineId}/sync` | Force a sync of a local pipeline to GoldRush |
| `GET` | `/api/v1/intelligence/query/cache` | List persisted GoldRush cache entries for the org |
| `DELETE` | `/api/v1/intelligence/query/cache/{cacheId}` | Invalidate a persisted GoldRush cache entry |
| `GET` | `/api/v1/intelligence/query/cache/{cacheId}` | Get a persisted GoldRush cache entry |
| `POST` | `/api/v1/intelligence/query/campaign/from-query` | Create a campaign from query results |
| `GET` | `/api/v1/intelligence/query/credits` | GoldRush credit meter for the active org: used / limit / remaining / status (ok|warn|exceeded) for the current month |
| `POST` | `/api/v1/intelligence/query/enrichment/contacts/enqueue` | Enqueue enrichment jobs for recent contacts with wallet addresses |
| `POST` | `/api/v1/intelligence/query/enrichment/protocol` | Enrich a protocol from settings: discover each contract's holders via GoldRush and enqueue per-wallet enrichment (+ contacts) |
| `GET` | `/api/v1/intelligence/query/enrichment/status` | Enrichment progress: enriched-wallet count, latest lastEnrichedAt, and queue depth (idle = drained) |
| `POST` | `/api/v1/intelligence/query/enrichment/wallets/enqueue` | Enqueue or run a GoldRush enrichment job for a single wallet |
| `POST` | `/api/v1/intelligence/query/enrichment/wallets/enqueue-and-wait` | Enrich a single wallet and briefly wait for the result in one call (for a frontend "enrich this wallet" action) |
| `GET` | `/api/v1/intelligence/query/enrichment/wallets/{walletAddress}` | Get the latest materialized wallet enrichment metrics |
| `POST` | `/api/v1/intelligence/query/generate-sql` | Generate safe SQL from a natural-language prompt using Groq + LangChain |
| `GET` | `/api/v1/intelligence/query/goldrush/mcp/catalog` | Fetch the live GoldRush MCP catalog, including tools and resources |
| `GET` | `/api/v1/intelligence/query/goldrush/mcp/conversations` | List persisted GoldRush MCP conversations |
| `GET` | `/api/v1/intelligence/query/goldrush/mcp/conversations/{conversationId}` | Get a persisted GoldRush MCP conversation |
| `POST` | `/api/v1/intelligence/query/goldrush/mcp/plan` | Resolve prompt, protocol, and saved settings into a GoldRush MCP execution plan |
| `GET` | `/api/v1/intelligence/query/goldrush/mcp/pool` | Inspect the pooled GoldRush MCP runtime health and capacity |
| `POST` | `/api/v1/intelligence/query/goldrush/mcp/pool/reset` | Recycle all GoldRush MCP pooled sessions and warm the pool again |
| `POST` | `/api/v1/intelligence/query/goldrush/mcp/pool/warm` | Warm the GoldRush MCP pool to the configured minimum size |
| `POST` | `/api/v1/intelligence/query/goldrush/mcp/query` | Dynamically route any prompt through the live GoldRush MCP tool catalog and return the answer |
| `GET` | `/api/v1/intelligence/query/goldrush/mcp/query/stream` | Stream a dynamic GoldRush MCP query with live agent progress updates (SSE) |
| `POST` | `/api/v1/intelligence/query/goldrush/mcp/query/stream` | Stream a dynamic GoldRush MCP query with live agent progress updates over POST (SSE) |
| `GET` | `/api/v1/intelligence/query/goldrush/mcp/resources` | List available GoldRush MCP resources exposed by the official server |
| `POST` | `/api/v1/intelligence/query/goldrush/mcp/resources/read` | Read a live GoldRush MCP resource through the backend |
| `POST` | `/api/v1/intelligence/query/goldrush/mcp/run` | Execute an official GoldRush MCP tool through the backend |
| `GET` | `/api/v1/intelligence/query/goldrush/mcp/tools` | List available GoldRush MCP tools exposed by the official server |
| `POST` | `/api/v1/intelligence/query/goldrush/run` | Execute a cache-aware GoldRush wallet query and persist the run |
| `GET` | `/api/v1/intelligence/query/history` | List recent query history for current user |
| `GET` | `/api/v1/intelligence/query/protocols` | List saved protocol registry entries for AI query suggestions |
| `POST` | `/api/v1/intelligence/query/protocols` | Create or update a protocol registry entry for AI query suggestions |
| `POST` | `/api/v1/intelligence/query/run` | Execute a user query (async) |
| `POST` | `/api/v1/intelligence/query/segments/from-query` | Create an audience segment from query results |
| `GET` | `/api/v1/intelligence/query/starters` | List starter saved queries for the Intelligence SQL editor |
| `POST` | `/api/v1/intelligence/query/suggestions` | Suggest protocol-aware and sector-aware Intelligence queries using AI |
| `GET` | `/api/v1/intelligence/query/suggestions/analytics` | Get AI query suggestion analytics for the active organization |
| `POST` | `/api/v1/intelligence/query/suggestions/{logId}/track` | Track usage analytics for an AI query suggestion |
| `GET` | `/api/v1/intelligence/query/templates` | List safe parameterized intelligence query templates |
| `POST` | `/api/v1/intelligence/query/templates` | Create a safe parameterized intelligence query template |
| `GET` | `/api/v1/intelligence/query/templates/{templateId}` | Get a safe parameterized intelligence query template |
| `PUT` | `/api/v1/intelligence/query/templates/{templateId}` | Update a safe parameterized intelligence query template |
| `POST` | `/api/v1/intelligence/query/templates/{templateId}/run` | Run a safe parameterized intelligence query template and optionally materialize it |
| `POST` | `/api/v1/intelligence/query/validate` | Validate query syntax before running |
| `GET` | `/api/v1/intelligence/query/{queryId}/export.csv` | Download stored query results as CSV |
| `GET` | `/api/v1/intelligence/query/{queryId}/report-data` | Chart-ready report payload for a stored query (typed columns, auto-suggested line/bar/pie charts, summary stats, table) |
| `GET` | `/api/v1/intelligence/query/{queryId}/results` | Get paginated query results |
| `POST` | `/api/v1/intelligence/query/{queryId}/save` | Save query as a named report |
| `GET` | `/api/v1/intelligence/query/{queryId}/status` | Get query execution status |
| `GET` | `/api/v1/intelligence/query/{queryId}/summary` | Get query summary |
| `GET` | `/api/v1/intelligence/recommendations` | Retention recommendations: cohorts from contact_360 mapped to Plays + email templates |
| `GET` | `/api/v1/intelligence/reports` | List reports |
| `GET` | `/api/v1/intelligence/reports/filters` | Reports filter options |
| `GET` | `/api/v1/intelligence/reports/metrics` | Reports metrics |
| `GET` | `/api/v1/intelligence/reports/summary` | Reports summary |
| `GET` | `/api/v1/intelligence/reports/{reportId}` | Get report detail |
| `POST` | `/api/v1/intelligence/reports/{reportId}/refresh` | Refresh report (no-op MVP) |
| `GET` | `/api/v1/intelligence/schema` | Get schema for query editor autocomplete |
| `GET` | `/api/v1/intelligence/segments` | List segments |
| `POST` | `/api/v1/intelligence/segments` | Create segment (manual) |
| `POST` | `/api/v1/intelligence/segments/import-from-query` | Import segment from query results |
| `GET` | `/api/v1/intelligence/segments/metrics` | Segments metrics |
| `DELETE` | `/api/v1/intelligence/segments/{segmentId}` | Delete segment |
| `GET` | `/api/v1/intelligence/segments/{segmentId}` | Get segment detail |
| `PUT` | `/api/v1/intelligence/segments/{segmentId}` | Update segment |
| `GET` | `/api/v1/intelligence/segments/{segmentId}/profiles` | List profiles in segment |
| `POST` | `/api/v1/intelligence/segments/{segmentId}/refresh` | Refresh segment stats |
| `POST` | `/api/v1/intelligence/segments/{segmentId}/use` | Mark segment used |
| `GET` | `/api/v1/intelligence/tools` | List the intelligence agent tool catalog (function-calling schemas) |
| `POST` | `/api/v1/intelligence/tools/run` | Execute one intelligence tool (read tools run; action tools need confirm:true) |

## audience  (61)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/audience/attributes` | List audience attribute keys (schema) |
| `GET` | `/api/v1/audience/attributes/keys` | List audience attribute keys (schema) |
| `GET` | `/api/v1/audience/attributes/{key}/values` | List distinct values for an attribute key |
| `GET` | `/api/v1/audience/automation/suggestions` | Automation suggestions (legacy alias) |
| `POST` | `/api/v1/audience/email-verification/run` | Verify the next batch of unverified contact emails (syntax/disposable/role/MX) — call until remaining=0 |
| `GET` | `/api/v1/audience/email-verification/status` | Org-wide email verification tallies |
| `POST` | `/api/v1/audience/export` | Start export job (legacy alias) |
| `GET` | `/api/v1/audience/export/download/{exportId}` | Download export file (legacy alias) |
| `GET` | `/api/v1/audience/export/options` | List available export options (legacy alias) |
| `GET` | `/api/v1/audience/export/recent` | Get recent exports (legacy alias) |
| `GET` | `/api/v1/audience/export/status/{exportId}` | Get export status (legacy alias) |
| `DELETE` | `/api/v1/audience/export/{exportId}` | Delete export (legacy alias) |
| `GET` | `/api/v1/audience/export/{exportId}` | Get export details (legacy alias) |
| `GET` | `/api/v1/audience/export/{exportId}/status` | Get export status (legacy alias) |
| `POST` | `/api/v1/audience/exports` | Create export job (CSV/JSON) |
| `GET` | `/api/v1/audience/exports/{jobId}` | Get export job status |
| `POST` | `/api/v1/audience/exports/{jobId}/cancel` | Cancel export job |
| `GET` | `/api/v1/audience/exports/{jobId}/download` | Download export file |
| `GET` | `/api/v1/audience/fields` | List available audience/profile fields for mapping (email, name, wallet, custom fields, tags) |
| `GET` | `/api/v1/audience/health-score` | Health score calculation details (legacy alias) |
| `POST` | `/api/v1/audience/import` | Import multiple profiles (legacy alias) |
| `GET` | `/api/v1/audience/import/recent` | List recent imports (legacy alias) |
| `GET` | `/api/v1/audience/import/sample/csv` | Download sample audience import CSV template |
| `GET` | `/api/v1/audience/import/sample/json` | Download sample audience import JSON template |
| `POST` | `/api/v1/audience/import/upload` | Upload import file (legacy alias) |
| `GET` | `/api/v1/audience/import/{id}` | Get import details (legacy alias) |
| `POST` | `/api/v1/audience/import/{id}/confirm` | Confirm import (legacy alias) |
| `GET` | `/api/v1/audience/import/{id}/errors` | Get import errors (legacy alias) |
| `POST` | `/api/v1/audience/import/{id}/map` | Map import columns (legacy alias) |
| `GET` | `/api/v1/audience/import/{id}/status` | Get import status (legacy alias) |
| `POST` | `/api/v1/audience/imports` | Create import job (CSV/JSON) |
| `GET` | `/api/v1/audience/imports/presets` | List platform import presets |
| `GET` | `/api/v1/audience/imports/{jobId}` | Get import job status |
| `POST` | `/api/v1/audience/imports/{jobId}/cancel` | Cancel import job |
| `GET` | `/api/v1/audience/imports/{jobId}/errors` | Download import error report (CSV) |
| `GET` | `/api/v1/audience/lists` | List selectable audience lists |
| `GET` | `/api/v1/audience/overview` | Get audience overview stats |
| `POST` | `/api/v1/audience/pii/backfill` | Backfill contact PII protection (blind index + at-rest ciphertext). Bounded; call until done=true. |
| `GET` | `/api/v1/audience/profiles` | List contacts/profiles |
| `POST` | `/api/v1/audience/profiles` | Create new contact |
| `DELETE` | `/api/v1/audience/profiles/{id}` | Delete contact |
| `GET` | `/api/v1/audience/profiles/{id}` | Get contact details |
| `PUT` | `/api/v1/audience/profiles/{id}` | Update contact |
| `GET` | `/api/v1/audience/profiles/{id}/activity` | Get contact activity timeline |
| `GET` | `/api/v1/audience/profiles/{id}/balances` | Get contact wallet balances (GoldRush-backed; cached) |
| `GET` | `/api/v1/audience/profiles/{id}/churn` | Get contact churn prediction |
| `GET` | `/api/v1/audience/profiles/{id}/contract-activity` | Get contact contract activity (GoldRush-backed) |
| `GET` | `/api/v1/audience/profiles/{id}/dapp-stats` | Get contact dapp/onchain stats (derived) |
| `GET` | `/api/v1/audience/profiles/{id}/emails` | Get contact email history |
| `POST` | `/api/v1/audience/profiles/{id}/enrich` | Trigger onchain enrichment refresh (background) |
| `GET` | `/api/v1/audience/profiles/{id}/health` | Get contact health score + breakdown |
| `PUT` | `/api/v1/audience/profiles/{id}/tags` | Add tags to contact |
| `DELETE` | `/api/v1/audience/profiles/{id}/tags/{tagName}` | Remove tag from contact |
| `GET` | `/api/v1/audience/profiles/{id}/transactions` | Get contact transactions (GoldRush-backed; cached) |
| `GET` | `/api/v1/audience/reengagement-count` | Get count of profiles needing re-engagement |
| `GET` | `/api/v1/audience/report` | Chart-ready audience report: totals, reachability, growth, engagement, top segments |
| `GET` | `/api/v1/audience/segments` | List selectable audience segments |
| `POST` | `/api/v1/audience/segments` | Create audience segment |
| `GET` | `/api/v1/audience/tags` | List tags |
| `POST` | `/api/v1/audience/tags` | Create tag |
| `POST` | `/api/v1/audience/verify-emails` | DNS-verify contact email domains (MX) and flag undeliverable addresses |

## automations  (49)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/automations` | List automations |
| `POST` | `/api/v1/automations` | Create automation (starts as draft) |
| `GET` | `/api/v1/automations/builder/actions` | List action node types for builder |
| `GET` | `/api/v1/automations/builder/actions/{actionType}` | Get action config schema |
| `GET` | `/api/v1/automations/builder/email-templates` | List backend-driven email templates for automation nodes |
| `GET` | `/api/v1/automations/builder/onchain/catalog` | List GoldRush-backed multichain event definitions supported by the automation builder |
| `GET` | `/api/v1/automations/builder/project-contracts` | Project settings' GoldRush-supported contracts/chains for the builder trigger picker |
| `GET` | `/api/v1/automations/builder/triggers` | List trigger types for builder |
| `GET` | `/api/v1/automations/builder/triggers/{triggerType}` | Get trigger config schema |
| `GET` | `/api/v1/automations/counts` | Automation tab counters |
| `GET` | `/api/v1/automations/metrics` | Automations metrics |
| `GET` | `/api/v1/automations/runtime/goldrush/status` | Inspect GoldRush automation stream status and configured sources |
| `POST` | `/api/v1/automations/runtime/triggers/email-opened` | Ingest an email_opened automation trigger event |
| `POST` | `/api/v1/automations/runtime/triggers/goldrush-event` | Ingest a GoldRush-decoded multichain automation trigger event |
| `POST` | `/api/v1/automations/runtime/triggers/goldrush-event/queue` | Queue a GoldRush-decoded automation trigger event for durable processing |
| `POST` | `/api/v1/automations/runtime/triggers/goldrush-events/batch` | Queue a batch of GoldRush-decoded automation trigger events |
| `POST` | `/api/v1/automations/runtime/triggers/health-threshold` | Ingest a health_threshold automation trigger event |
| `POST` | `/api/v1/automations/runtime/triggers/onchain-event` | Ingest an on-chain automation trigger event |
| `POST` | `/api/v1/automations/runtime/triggers/segment-entered` | Ingest a segment_entered automation trigger event |
| `GET` | `/api/v1/automations/search` | Search automations |
| `GET` | `/api/v1/automations/templates` | List automation templates (Plays) |
| `POST` | `/api/v1/automations/templates` | Create automation template |
| `DELETE` | `/api/v1/automations/templates/{templateId}` | Delete automation template |
| `GET` | `/api/v1/automations/templates/{templateId}` | Get single automation template |
| `PUT` | `/api/v1/automations/templates/{templateId}` | Update automation template |
| `POST` | `/api/v1/automations/templates/{templateId}/apply` | Apply template (fork into draft automation) |
| `GET` | `/api/v1/automations/triggers/available` | List available triggers (alias) |
| `DELETE` | `/api/v1/automations/{automationId}` | Delete automation |
| `GET` | `/api/v1/automations/{automationId}` | Get single automation |
| `PUT` | `/api/v1/automations/{automationId}` | Update automation |
| `GET` | `/api/v1/automations/{automationId}/builder` | Load automation for builder editing |
| `PUT` | `/api/v1/automations/{automationId}/builder` | Save automation builder flow |
| `POST` | `/api/v1/automations/{automationId}/builder/discard` | Discard builder changes back to the last saved graph |
| `PUT` | `/api/v1/automations/{automationId}/builder/draft` | Auto-save draft builder flow |
| `POST` | `/api/v1/automations/{automationId}/builder/reset` | Persistently reset the automation builder back to a blank draft |
| `POST` | `/api/v1/automations/{automationId}/builder/validate` | Validate automation builder flow |
| `POST` | `/api/v1/automations/{automationId}/duplicate` | Duplicate automation |
| `GET` | `/api/v1/automations/{automationId}/last-edited` | Get last edited timestamp (legacy) |
| `GET` | `/api/v1/automations/{automationId}/performance` | Automation performance (alias to stats) |
| `POST` | `/api/v1/automations/{automationId}/preview` | Preview audience match for trigger |
| `POST` | `/api/v1/automations/{automationId}/publish` | Publish/activate a draft |
| `GET` | `/api/v1/automations/{automationId}/stats` | Automation stats overview |
| `GET` | `/api/v1/automations/{automationId}/stats/entries` | Paginated entries (user journeys) |
| `GET` | `/api/v1/automations/{automationId}/stats/entries/{entryId}` | Single entry details |
| `GET` | `/api/v1/automations/{automationId}/stats/paths` | Automation path performance (MVP) |
| `GET` | `/api/v1/automations/{automationId}/stats/preview` | Projected stats preview (MVP) |
| `GET` | `/api/v1/automations/{automationId}/stats/revenue` | Revenue attribution (MVP stub) |
| `GET` | `/api/v1/automations/{automationId}/stats/time-series` | Automation time series stats |
| `PUT` | `/api/v1/automations/{automationId}/status` | Quick toggle status |

## campaigns  (40)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/campaigns` | List campaigns |
| `POST` | `/api/v1/campaigns` | Create campaign |
| `GET` | `/api/v1/campaigns/analytics/overview` | Org-wide campaign engagement overview |
| `GET` | `/api/v1/campaigns/calendar` | Get campaign calendar |
| `GET` | `/api/v1/campaigns/{campaignId}/goals` | List a campaign’s goals |
| `POST` | `/api/v1/campaigns/{campaignId}/goals` | Create a conversion goal for a campaign |
| `DELETE` | `/api/v1/campaigns/{campaignId}/goals/{goalId}` | Delete a goal |
| `PUT` | `/api/v1/campaigns/{campaignId}/goals/{goalId}` | Update a goal |
| `GET` | `/api/v1/campaigns/{campaignId}/goals/{goalId}/measure` | Measure conversions for a goal within its attribution window |
| `DELETE` | `/api/v1/campaigns/{id}` | Delete campaign |
| `GET` | `/api/v1/campaigns/{id}` | Get campaign details |
| `PUT` | `/api/v1/campaigns/{id}` | Update campaign |
| `GET` | `/api/v1/campaigns/{id}/analytics` | Campaign engagement analytics (opens, clicks, rates) |
| `GET` | `/api/v1/campaigns/{id}/audience` | Get campaign audience selection |
| `PUT` | `/api/v1/campaigns/{id}/audience` | Attach audience to campaign |
| `POST` | `/api/v1/campaigns/{id}/audience/estimate` | Estimate audience recipient count |
| `POST` | `/api/v1/campaigns/{id}/autosave` | Autosave campaign draft |
| `POST` | `/api/v1/campaigns/{id}/cancel` | Cancel scheduled campaign |
| `PUT` | `/api/v1/campaigns/{id}/channels` | Set smart campaign enabled channels |
| `PUT` | `/api/v1/campaigns/{id}/channels/{channel}/content` | Set smart campaign channel content |
| `GET` | `/api/v1/campaigns/{id}/content` | Get campaign email content metadata |
| `PUT` | `/api/v1/campaigns/{id}/content` | Update campaign email content metadata |
| `POST` | `/api/v1/campaigns/{id}/duplicate` | Duplicate campaign |
| `GET` | `/api/v1/campaigns/{id}/editor-session` | Get editor session token/config |
| `GET` | `/api/v1/campaigns/{id}/editor/content` | Get latest editor payload |
| `POST` | `/api/v1/campaigns/{id}/editor/saved` | Store editor saved payload |
| `GET` | `/api/v1/campaigns/{id}/email` | Get campaign email (content + headers) |
| `PUT` | `/api/v1/campaigns/{id}/email` | Update campaign email (content + headers) |
| `GET` | `/api/v1/campaigns/{id}/events` | Get campaign event timeline (paginated) |
| `POST` | `/api/v1/campaigns/{id}/launch` | Launch campaign |
| `POST` | `/api/v1/campaigns/{id}/preview` | Render campaign preview |
| `GET` | `/api/v1/campaigns/{id}/schedule` | Get schedule settings |
| `PUT` | `/api/v1/campaigns/{id}/schedule` | Save schedule settings |
| `POST` | `/api/v1/campaigns/{id}/send-inapp` | Send campaign as in-app push to wallet audience |
| `GET` | `/api/v1/campaigns/{id}/send-preflight` | Preflight a campaign send: effective sending limits, ETA, warnings, blocked flag |
| `POST` | `/api/v1/campaigns/{id}/send-test` | Send test email for campaign |
| `PUT` | `/api/v1/campaigns/{id}/template` | Attach template to campaign |
| `GET` | `/api/v1/campaigns/{id}/tracking` | Get campaign tracking settings |
| `PUT` | `/api/v1/campaigns/{id}/tracking` | Update campaign tracking settings |
| `POST` | `/api/v1/campaigns/{id}/validate` | Validate campaign for launch |

## billing  (28)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/billing` | Get billing info and usage |
| `PUT` | `/api/v1/billing/auto-optimize` | Toggle auto-optimize feature |
| `GET` | `/api/v1/billing/blockradar/history` | List past Blockradar (crypto) payments |
| `GET` | `/api/v1/billing/blockradar/transactions` | List all Blockradar transactions |
| `POST` | `/api/v1/billing/checkout/credits` | Create a crypto or card checkout that tops up the org PAYG wallet ($10–$1000) |
| `POST` | `/api/v1/billing/checkout/plan` | Create a crypto (Blockradar) or card (Stripe) checkout for an org plan, monthly or annual |
| `GET` | `/api/v1/billing/invoices` | List invoices |
| `GET` | `/api/v1/billing/invoices/{id}` | Get invoice details |
| `GET` | `/api/v1/billing/invoices/{id}/download` | Get signed download URL for PDF invoice |
| `GET` | `/api/v1/billing/invoices/{id}/pdf` | Stream invoice PDF |
| `POST` | `/api/v1/billing/payg/start` | Switch the active org to pay-as-you-go (one-time trial credit included) |
| `GET` | `/api/v1/billing/payg/wallet/{organizationId}` | PAYG wallet: balance, unit rates, recent ledger entries |
| `GET` | `/api/v1/billing/payment-method` | Get current payment methods |
| `PUT` | `/api/v1/billing/payment-method` | Update payment method |
| `DELETE` | `/api/v1/billing/payment-method/{id}` | Delete a payment method |
| `GET` | `/api/v1/billing/payment-methods` | List all saved payment methods (cards + crypto wallets) |
| `POST` | `/api/v1/billing/payment-methods` | Add new payment method (card or crypto address) |
| `PUT` | `/api/v1/billing/payment-methods/default` | Set default payment method |
| `DELETE` | `/api/v1/billing/payment-methods/{id}` | Remove a payment method |
| `GET` | `/api/v1/billing/plan` | Get current plan details + available upgrade options |
| `PUT` | `/api/v1/billing/plan` | Change subscription plan |
| `GET` | `/api/v1/billing/plan-usage/{organizationId}` | Current plan, tier limits, and live usage meters (contacts, emails, AI + GoldRush credits, seats, automations, API keys) |
| `GET` | `/api/v1/billing/plans` | List available plans |
| `POST` | `/api/v1/billing/upgrade` | Create upgrade checkout session |
| `POST` | `/api/v1/billing/upgrade/blockradar` | Create Blockradar stablecoin checkout (dynamic pricing) |
| `GET` | `/api/v1/billing/upgrade/blockradar/{reference}` | Check status of a Blockradar upgrade (polling support) |
| `POST` | `/api/v1/billing/upgrade/{reference}/cancel` | Cancel your own pending checkout (clears the waiting-for-payment state) |
| `GET` | `/api/v1/billing/usage` | Get detailed usage breakdown |

## auth  (24)

| Method | Path | Summary |
| --- | --- | --- |
| `DELETE` | `/api/v1/auth/account` | Delete your own account (and sole-member workspaces) |
| `GET` | `/api/v1/auth/debug` | Diagnostic endpoint echoing the resolved request URL/base path and headers. |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset |
| `POST` | `/api/v1/auth/passkey/disable-totp` | Disable TOTP if passkeys are enabled |
| `POST` | `/api/v1/auth/passkey/login/finish` | Finish passkey login |
| `POST` | `/api/v1/auth/passkey/login/start` | Start passkey login |
| `POST` | `/api/v1/auth/passkey/register/finish` | Finish passkey registration |
| `POST` | `/api/v1/auth/passkey/register/start` | Start passkey registration |
| `GET` | `/api/v1/auth/passkey/status` | Get passkey and 2FA status |
| `DELETE` | `/api/v1/auth/passkey/{id}` | Delete a passkey |
| `POST` | `/api/v1/auth/resend-verification` | Resend the email verification link |
| `POST` | `/api/v1/auth/reset-password` | Reset password with token |
| `POST` | `/api/v1/auth/sign-in/email` | Sign in with email |
| `POST` | `/api/v1/auth/sign-in/social` | Sign in with social provider |
| `POST` | `/api/v1/auth/sign-in/username` | Sign in with username |
| `POST` | `/api/v1/auth/sign-out` | Sign out |
| `POST` | `/api/v1/auth/sign-up/email` | Sign up with email |
| `POST` | `/api/v1/auth/social/google` | Google One-Click Auth (ID Token) |
| `GET` | `/api/v1/auth/verify-email` | Verify email address |
| `DELETE` | `/api/v1/auth/{path}` | Catch-all bridge between Express and the Better Auth (Fetch API) handler.

Reconstructs a standard `Request` from the incoming Express request:
resolves a trusted origin (preferring the configured base URL over
spoofable Host/X-Forwarded headers), copies headers and body, invokes
`auth.handler`, then mirrors the resulting status, headers, and (notably)
any Set-Cookie session headers back onto the Express response. Rate-limited. |
| `GET` | `/api/v1/auth/{path}` | Catch-all bridge between Express and the Better Auth (Fetch API) handler.

Reconstructs a standard `Request` from the incoming Express request:
resolves a trusted origin (preferring the configured base URL over
spoofable Host/X-Forwarded headers), copies headers and body, invokes
`auth.handler`, then mirrors the resulting status, headers, and (notably)
any Set-Cookie session headers back onto the Express response. Rate-limited. |
| `PATCH` | `/api/v1/auth/{path}` | Catch-all bridge between Express and the Better Auth (Fetch API) handler.

Reconstructs a standard `Request` from the incoming Express request:
resolves a trusted origin (preferring the configured base URL over
spoofable Host/X-Forwarded headers), copies headers and body, invokes
`auth.handler`, then mirrors the resulting status, headers, and (notably)
any Set-Cookie session headers back onto the Express response. Rate-limited. |
| `POST` | `/api/v1/auth/{path}` | Catch-all bridge between Express and the Better Auth (Fetch API) handler.

Reconstructs a standard `Request` from the incoming Express request:
resolves a trusted origin (preferring the configured base URL over
spoofable Host/X-Forwarded headers), copies headers and body, invokes
`auth.handler`, then mirrors the resulting status, headers, and (notably)
any Set-Cookie session headers back onto the Express response. Rate-limited. |
| `PUT` | `/api/v1/auth/{path}` | Catch-all bridge between Express and the Better Auth (Fetch API) handler.

Reconstructs a standard `Request` from the incoming Express request:
resolves a trusted origin (preferring the configured base URL over
spoofable Host/X-Forwarded headers), copies headers and body, invokes
`auth.handler`, then mirrors the resulting status, headers, and (notably)
any Set-Cookie session headers back onto the Express response. Rate-limited. |

## organization  (23)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/organization` | Get current organization details |
| `PUT` | `/api/v1/organization` | Update organization details |
| `GET` | `/api/v1/organization/branding` | Get organization branding |
| `PUT` | `/api/v1/organization/branding/colors` | Update brand colors |
| `POST` | `/api/v1/organization/branding/colors/reset` | Reset brand colors |
| `GET` | `/api/v1/organization/branding/email-builder` | Get email builder brand settings |
| `PUT` | `/api/v1/organization/branding/email-builder` | Update email builder brand settings |
| `DELETE` | `/api/v1/organization/branding/logo/dark` | Delete dark logo |
| `POST` | `/api/v1/organization/branding/logo/dark` | Upload dark logo |
| `DELETE` | `/api/v1/organization/branding/logo/favicon` | Delete favicon |
| `POST` | `/api/v1/organization/branding/logo/favicon` | Upload favicon |
| `DELETE` | `/api/v1/organization/branding/logo/primary` | Delete primary logo |
| `POST` | `/api/v1/organization/branding/logo/primary` | Upload primary logo |
| `POST` | `/api/v1/organization/create` | Create organization |
| `GET` | `/api/v1/organization/landing-pages` | List available landing page templates |
| `GET` | `/api/v1/organization/list` | List user organizations |
| `GET` | `/api/v1/organization/project-settings` | Get project settings used across billing, query, and messaging |
| `PUT` | `/api/v1/organization/project-settings` | Update project settings used across billing, query, and messaging |
| `GET` | `/api/v1/organization/project-settings/supported-chains` | List GoldRush-supported chains (with foundational/streaming capability flags) for project-settings pickers |
| `POST` | `/api/v1/organization/set-active` | Set active organization for current session |
| `GET` | `/api/v1/organization/settings/smart-sending` | Get org-wide Smart Sending settings (suppression window + default-on flag) |
| `PUT` | `/api/v1/organization/settings/smart-sending` | Update org-wide Smart Sending settings (windowHours 1-168, enabledByDefault) |
| `POST` | `/api/v1/organization/subdomain/validate` | Validate subdomain availability |

## domain  (13)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/domain` | List all domains for the current user |
| `POST` | `/api/v1/domain` | Register a new domain (Owned or Managed) |
| `GET` | `/api/v1/domain/azure/status` | Diagnostic: ARM management-plane config + live probe of the Email service (read-only) |
| `GET` | `/api/v1/domain/check` | Check if a domain is already registered |
| `DELETE` | `/api/v1/domain/{id}` | Delete a domain identity |
| `GET` | `/api/v1/domain/{id}` | Get domain details |
| `GET` | `/api/v1/domain/{id}/dns` | Get DNS records for domain verification |
| `POST` | `/api/v1/domain/{id}/dns/auto` | Automatically add DNS records via provider API |
| `POST` | `/api/v1/domain/{id}/recheck` | Retry domain verification and return the updated status |
| `POST` | `/api/v1/domain/{id}/senders` | Add a sender username to a verified domain |
| `GET` | `/api/v1/domain/{id}/status` | Check domain verification status |
| `POST` | `/api/v1/domain/{id}/sync` | Re-sync a verified domain: ensure default sender identity + Communication Service link (idempotent) |
| `POST` | `/api/v1/domain/{id}/verify` | Trigger domain verification in Azure |

## identity  (9)

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/api/v1/identity/bind` | Bind wallet to channel handle (encrypted) |
| `POST` | `/api/v1/identity/decrypt` | Decrypt PII for send workers (server-to-server) |
| `GET` | `/api/v1/identity/events` | Recent identity events (dashboard) |
| `GET` | `/api/v1/identity/group/{kind}/state` | Fetch identity group state for proof generation |
| `POST` | `/api/v1/identity/otp` | Issue OTP for channel binding |
| `GET` | `/api/v1/identity/protocol-salt` | Fetch per-protocol identity salt |
| `POST` | `/api/v1/identity/register` | Register wallet into the protocol identity system |
| `GET` | `/api/v1/identity/stats` | Identity overview stats (dashboard) |
| `GET` | `/api/v1/identity/status` | Get identity status for a wallet |

## user  (9)

| Method | Path | Summary |
| --- | --- | --- |
| `PUT` | `/api/v1/user/2fa` | Toggle 2FA |
| `POST` | `/api/v1/user/2fa/setup` | Setup 2FA (Get Secret) |
| `POST` | `/api/v1/user/2fa/verify` | Verify 2FA Setup |
| `PUT` | `/api/v1/user/email` | Request email change |
| `POST` | `/api/v1/user/email/verify` | Verify email change |
| `PUT` | `/api/v1/user/password` | Change password |
| `PUT` | `/api/v1/user/preferences/email` | Update email preferences |
| `GET` | `/api/v1/user/profile` | Get current user profile |
| `PUT` | `/api/v1/user/profile` | Update current user profile |

## email-templates  (8)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/email-templates` | List accessible templates (public + your private templates) |
| `POST` | `/api/v1/email-templates` | Create a private template (owned by you) |
| `DELETE` | `/api/v1/email-templates/{id}` | Delete template (owned private; public is admin-only) |
| `GET` | `/api/v1/email-templates/{id}` | Get template (public or owned private) |
| `PUT` | `/api/v1/email-templates/{id}` | Update template (owned private; public is admin-only) |
| `POST` | `/api/v1/email-templates/{id}/clone` | Clone a public template into your private workspace |
| `POST` | `/api/v1/email-templates/{id}/publish` | Publish a template to the shared public gallery, visible to all users (platform admin only) |
| `POST` | `/api/v1/email-templates/{id}/unpublish` | Remove a template from the public gallery (back to private; platform admin only) |

## integrations  (8)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/integrations/inapp/origins` | List allowed origins for SDK websocket connections |
| `POST` | `/api/v1/integrations/inapp/origins` | Add an allowed origin |
| `DELETE` | `/api/v1/integrations/inapp/origins/{originId}` | Remove an allowed origin |
| `GET` | `/api/v1/integrations/inapp/status` | In-app integration status for the active organization |
| `POST` | `/api/v1/integrations/inapp/test-push` | Send a test in-app push to a wallet |
| `GET` | `/api/v1/integrations/keys/secret` | List secret keys (masked) for the active organization |
| `POST` | `/api/v1/integrations/keys/secret` | Create a new secret key (returned once) |
| `DELETE` | `/api/v1/integrations/keys/secret/{keyId}` | Revoke a secret key |

## sender-identities  (8)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/sender-identities` | List sender identities |
| `POST` | `/api/v1/sender-identities` | Add sender identity |
| `PUT` | `/api/v1/sender-identities/default` | Set default sender identity |
| `GET` | `/api/v1/sender-identities/domains/authentication` | Get domain authentication overview |
| `DELETE` | `/api/v1/sender-identities/{id}` | Delete sender identity |
| `GET` | `/api/v1/sender-identities/{id}/dns` | Get DNS records for sender identity |
| `POST` | `/api/v1/sender-identities/{id}/dns/auto` | Automatically add DNS records for sender identity |
| `POST` | `/api/v1/sender-identities/{id}/recheck` | Recheck sender identity verification status |

## templates  (8)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/templates` | List templates |
| `POST` | `/api/v1/templates` | Create template |
| `POST` | `/api/v1/templates/clone` | Clone a public template into org templates |
| `GET` | `/api/v1/templates/public` | List public templates |
| `GET` | `/api/v1/templates/public/{id}` | Get public template details |
| `DELETE` | `/api/v1/templates/{id}` | Delete template |
| `GET` | `/api/v1/templates/{id}` | Get template details |
| `PUT` | `/api/v1/templates/{id}` | Update template |

## v2  (8)

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/api/v1/v2/automations/runtime/triggers/email-opened` | Ingest an email_opened automation trigger event (server-to-server using sk_*) |
| `POST` | `/api/v1/v2/automations/runtime/triggers/goldrush-event` | Ingest a GoldRush-decoded multichain automation trigger event (server-to-server using sk_*) |
| `POST` | `/api/v1/v2/automations/runtime/triggers/goldrush-event/queue` | Queue a GoldRush-decoded automation trigger event for durable server-to-server processing |
| `POST` | `/api/v1/v2/automations/runtime/triggers/goldrush-events/batch` | Queue a batch of GoldRush-decoded automation trigger events for durable server-to-server processing |
| `POST` | `/api/v1/v2/automations/runtime/triggers/health-threshold` | Ingest a health_threshold automation trigger event (server-to-server using sk_*) |
| `POST` | `/api/v1/v2/automations/runtime/triggers/onchain-event` | Ingest an on-chain automation trigger event (server-to-server using sk_*) |
| `POST` | `/api/v1/v2/automations/runtime/triggers/segment-entered` | Ingest a segment_entered automation trigger event (server-to-server using sk_*) |
| `POST` | `/api/v1/v2/channels/dispatch` | Channel dispatch (server-to-server using sk_*) |

## ai  (7)

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/api/v1/ai/feedback` | Submit feedback for an AI response |
| `GET` | `/api/v1/ai/health` | AI health check (vector store + embeddings + LLM) |
| `POST` | `/api/v1/ai/ingest/files` | Ingest uploaded files into the vector store (dashboard) |
| `POST` | `/api/v1/ai/ingest/web` | Ingest website content into the vector store (dashboard) |
| `GET` | `/api/v1/ai/metrics` | AI metrics snapshot (org admin) |
| `POST` | `/api/v1/ai/reindex` | Trigger incremental re-index for web sources (dashboard) |
| `POST` | `/api/v1/ai/v2/ingest/web` | Ingest website content into the vector store (secret key) |

## forms  (7)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/forms` | List capture forms |
| `POST` | `/api/v1/forms` | Create a capture form (returns embed code + submit URL) |
| `DELETE` | `/api/v1/forms/{id}` | Delete a capture form |
| `GET` | `/api/v1/forms/{id}` | Get a capture form (with embed code) |
| `PATCH` | `/api/v1/forms/{id}` | Update a capture form |
| `POST` | `/api/v1/forms/{id}/connect` | Connect the form to the API — auto-enables ZK encryption on captures |
| `POST` | `/api/v1/forms/{token}/ingest` | Ingest a capture via secret key (auto-connects the form, ZK forced) |

## onboarding  (7)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/onboarding/admin/summary` | Admin onboarding summary metrics |
| `POST` | `/api/v1/onboarding/complete` | Mark onboarding as completed |
| `GET` | `/api/v1/onboarding/progress` | Get onboarding progress for current user |
| `POST` | `/api/v1/onboarding/suggest-contracts` | Suggests which contracts to register and which events to listen on for a
protocol, from its name + sector (picked during onboarding). LLM-assisted
with deterministic sector defaults as the floor; every suggestion requires
human review before use. |
| `GET` | `/api/v1/onboarding/tasks` | List onboarding tasks for current user |
| `PUT` | `/api/v1/onboarding/tasks/{taskId}/complete` | Mark onboarding task as completed |
| `POST` | `/api/v1/onboarding/track` | Track onboarding step event |

## organizations  (7)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/organizations/{organizationId}/invites` | List pending invites |
| `POST` | `/api/v1/organizations/{organizationId}/invites` | Invite a user |
| `DELETE` | `/api/v1/organizations/{organizationId}/invites/{inviteId}` | Cancel a pending invite |
| `POST` | `/api/v1/organizations/{organizationId}/invites/{inviteId}/resend` | Resend a pending invite email |
| `GET` | `/api/v1/organizations/{organizationId}/members` | List organization members |
| `DELETE` | `/api/v1/organizations/{organizationId}/members/{userId}` | Remove member |
| `PATCH` | `/api/v1/organizations/{organizationId}/members/{userId}` | Update member role or status |

## email  (6)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/email/reputation` | Sender reputation for the active org (bounce/complaint/open rates + status) |
| `POST` | `/api/v1/email/send` | Queue an email for sending |
| `GET` | `/api/v1/email/sending-policies` | List domain sending policies + live usage (org-scoped; platform admin sees all) |
| `PUT` | `/api/v1/email/sending-policies/{domain}` | Update a domain sending policy (tier fields platform-admin only; pause/cap/notes for org admins) |
| `GET` | `/api/v1/email/sending-policies/{domain}/sending-status` | One domain: effective limits, warm-up day, live usage, 7-day reputation, tier-request readiness |
| `POST` | `/api/v1/email/sending-policies/{domain}/start-warmup` | Idempotently start the warm-up curve for a domain (auto-invoked on verification) |

## health  (6)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Primary readiness probe: always checks DB and cache, and additionally
requires fresh worker heartbeats for configured groups when Redis is enabled. |
| `GET` | `/api/v1/health/apis` | — |
| `GET` | `/api/v1/health/circuits` | Circuit-breaker states for external dependencies (e.g. the shared `goldrush`
circuit). `degraded` when any circuit is open or half-open probing, so ops
can spot a tripped upstream without reading logs. Cheap: an in-memory read. |
| `GET` | `/api/v1/health/mcp` | — |
| `GET` | `/api/v1/health/queues` | — |
| `GET` | `/api/v1/health/worker` | Worker readiness detail: heartbeat freshness per required group (skipped if Redis off). |

## indexing  (5)

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/api/v1/indexing/jobs` | Create indexing job |
| `GET` | `/api/v1/indexing/jobs/{jobId}` | Get indexing job |
| `POST` | `/api/v1/indexing/jobs/{jobId}/cancel` | Cancel indexing job |
| `POST` | `/api/v1/indexing/protocols/{protocolId}/reindex` | Reindex protocol (enqueue new job) |
| `GET` | `/api/v1/indexing/protocols/{protocolId}/status` | Get protocol indexing status |

## storage  (5)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/storage/files` | List uploaded files with metadata |
| `GET` | `/api/v1/storage/files/{id}` | Get file details and download URL |
| `POST` | `/api/v1/storage/provision` | Provision storage containers and configure CORS using Azure SDK |
| `POST` | `/api/v1/storage/upload/async` | Asynchronous upload via queue with retries |
| `POST` | `/api/v1/storage/upload/sync` | Synchronous upload to Azure Blob Storage with validation |

## query  (4)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/query/search` | Semantic search over ingested site content (no LLM) |
| `POST` | `/api/v1/query/text` | Process a text query through the RAG pipeline |
| `GET` | `/api/v1/query/text/stream` | Stream a text query response (SSE) |
| `POST` | `/api/v1/query/voice` | Process a voice (pre-transcribed) query through the RAG pipeline |

## assets  (3)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/assets` | List org assets (paginated, filter by kind) |
| `POST` | `/api/v1/assets` | Upload an image/font asset (hosted URL returned) |
| `DELETE` | `/api/v1/assets/{id}` | Delete an org asset |

## events  (3)

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/api/v1/events` | Ingest a custom app event (server-to-server, sk_*) |
| `POST` | `/api/v1/events/batch` | Batch-ingest custom app events (server-to-server, sk_*) |
| `GET` | `/api/v1/events/catalog` | Distinct app-event names (30d) for trigger autocomplete |

## help  (3)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/help/articles/{slug}` | Get a full help article by slug |
| `POST` | `/api/v1/help/ask` | Answer a how-to question from the help corpus |
| `GET` | `/api/v1/help/suggest` | Typeahead help suggestions for the search bar |

## inapp  (3)

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/api/v1/inapp/challenge` | Get a nonce to sign (publishable-key auth) |
| `POST` | `/api/v1/inapp/push` | Send an in-app push (server-to-server using sk_*) |
| `POST` | `/api/v1/inapp/verify` | Verify signed nonce and mint session token |

## notifications  (3)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/notifications` | List user notifications |
| `PUT` | `/api/v1/notifications/read-all` | Mark all notifications as read |
| `PUT` | `/api/v1/notifications/{id}/read` | Mark notification as read |

## observability  (3)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/observability/apis` | — |
| `GET` | `/api/v1/observability/failure-rate` | Compact, always-on failure-rate roll-up across HTTP (5xx), BullMQ queues,
and email delivery — for continuous polling by an uptime monitor. Result
is memoised a few seconds server-side, so polling every few seconds is
cheap. Optional `?window=<minutes>` sets the email lookback (default 60). |
| `GET` | `/api/v1/observability/modules` | — |

## t  (3)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/t/click` | Click-tracking redirect endpoint. Links in rendered emails are rewritten to
point here; this records an `email.click` DeliveryEvent (one per click) and
then 302-redirects to the original `url`. Only http/https targets are
accepted to prevent open-redirect abuse. |
| `GET` | `/api/v1/t/open` | Open-tracking pixel endpoint. The recipient's mail client loads this 1x1
GIF when the email is opened. Records a single `email.open` DeliveryEvent
(deduped per delivery) and always returns a no-cache transparent GIF so
subsequent opens still hit the server. |
| `GET` | `/api/v1/t/unsubscribe` | Unsubscribe endpoint hit from the email's unsubscribe link. Records a
one-time `email.unsubscribe` DeliveryEvent and flags the matching contact
as `emailUnsubscribed` in their metadata so future sends skip them (see
CampaignService.resolveCampaignRecipients). Optionally 302-redirects to a
validated `redirect` URL, otherwise returns a plain-text confirmation. |

## webhook  (2)

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/api/v1/webhook/blockradar` | Handle Blockradar payment webhooks |
| `POST` | `/api/v1/webhook/stripe` | Handle Stripe payment webhooks (card checkout) |

## (root)  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1` | Liveness greeting endpoint. |

## analytics  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/analytics/campaign-runs/{id}` | Per-run analytics across channels |

## campaign-types  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/campaign-types` | List allowed campaign types |

## channels  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/api/v1/channels/dispatch` | Channel router fanout entry point |

## dashboard  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/dashboard/home` | Dashboard home aggregated data |

## early-access  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/api/v1/early-access` | Public early-access / waitlist signup |

## email-builder  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/email-builder/config` | Get dynamic variable catalog for the email builder |

## invites  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/api/v1/invites/{token}/accept` | Accept invitation |

## metrics  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/metrics` | Prometheus scrape endpoint; emits metrics in text exposition format. |

## public  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/api/v1/public/forms/{token}/submit` | Public capture-form submission (embed / own-site form) |

## segments  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/segments/reachable` | Resolve reachable wallets by channel filter |

## test-db  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/test-db` | Smoke test that issues a trivial `SELECT 1` to verify the DB connection. |

## timezones  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `GET` | `/api/v1/timezones` | List supported timezones |

## webhooks  (1)

| Method | Path | Summary |
| --- | --- | --- |
| `POST` | `/api/v1/webhooks/azure/email-events` | Azure Event Grid: ACS email delivery/engagement reports |
