# Audit Tool: non-functional scenarios

Testable scenarios for the 27 non-functional requirements (NFRs) in [PRD section 8](PRD-audit-tool.md#8-non-functional-requirements). Each has a threshold and a status for the code as of **22 Nov 2026** (branch `feature/deterministic-checks`).

## How to read it

**Status**

| Status | Meaning |
|---|---|
| Automated | A test in the suite checks it. The test is named. |
| Partial | A test covers part of it. The gap is said. |
| Manual | Verified by code reading or a manual run only. No test. |
| Not covered | Nothing checks it today. |
| Not verifiable yet | Needs data or work that doesn't exist yet. |
| Unknown | I could not tell from the code. Needs a person or a real run. |

**P1** = overlaps the Phase 1 safety-net work (probabilistic → deterministic, `audit-worker/PHASE1-PLAN.md`). "Closes" means the finished work would make the scenario pass or testable. "Touches" means Phase 1 changes the area, so re-check it after.

**What I ran for this list (22 Nov):** `npm test` (API): 166 pass. `cd audit-worker && npm test`: 282 pass. `npm run build` (site) and `npm run build` in `audit-worker` (tsc): both pass. Test names below are from `tests/api/` and `audit-worker/src/`. "Manual" means I read the code, not that anyone ran it live. No real audit was run.

**Not tested live by anyone in this pass:** timings, token and dollar figures, WCAG, phone layout, Vercel/Google/Railway settings. Those need a real run or a person.

## Summary

| Status | Scenarios |
|---|---|
| Automated | 12 |
| Partial | 14 |
| Manual | 6 |
| Not covered | 13 |
| Not verifiable yet | 0 |
| Unknown | 5 |
| **Total** | **50** (for 27 NFRs) |

## Top gaps

1. **Job handling and retries (RL-01).** Leases, heartbeat, reclaim, 3 attempts and backoff live in `poll.ts` and `supabase.ts` and have **no test at all**. This is the known unplanned gap. A bug here loses or double-runs a paid audit. Not in Phase 1.
2. **AC-03 has no alert.** A point the model skips is now recorded as `unassessed` (tested), not a generic pass. But it only logs a warning. Nothing alerts, which the PRD asks for. Also the report shows `unassessed` points as "needs a manual look", which sits awkwardly with AC-02 ("can't-tell is never shown"). Adham to decide which is right.
3. **AC-01 money caps.** Money ranges come from code, but no test shows a cap, and no test scans the finished report for numbers with no source.
4. **Translation retry (RL-03)** has no test, though the logic is clear in `poll.ts`.
5. **Costs and times (CO, PF)** are measured numbers from one run (regal-honey.com, 2 Nov). Nothing checks them again. `audit_run_metrics` records every run, but no one has set an alert threshold.
6. **Accessibility and phone layout (UX-01, PF-03)** have no automated check.
7. **SC-05, SC-06, SC-03 (separation)** are settings in Vercel, Google and Supabase. They cannot be checked from the repo.

## Scenarios

### Cost

| ID | Scenario | Pass threshold | Status | Evidence / gap | P1 |
|---|---|---|---|---|---|
| CO-01a | **Given** a finished audit **when** its `audit_run_metrics` row is read **then** calls, output tokens, model and billing source are there. | One row per attempt; zeros (not a missing row) when no Claude call ran. | Automated | `claude.test.ts`: "a call's metrics are read from its stream", "a finished run becomes one audit_run_metrics row", "a run with no Claude calls still makes a row". The row is saved by `saveRunMetrics` (`supabase.ts`). | |
| CO-01b | **Given** a full media-buyer audit on a reference store **when** it finishes **then** calls ≈ 52 and output tokens ≈ 1.1M. | Within ±25% of the baseline (my suggested bound, not in the PRD). | Not covered | The baseline is one measurement (2 Nov). CLAUDE.md says the worker is billed to `ANTHROPIC_API_KEY`, so NFR-CO-01's subscription wording ("20 points of the 5-hour window") looks out of date. I left the PRD requirement as is for Adham to decide. Needs a real run. | Touches: fewer AI calls expected |
| CO-02 | **Given** an audit's token counts **when** the cost is estimated **then** the figure uses the list price per model, never the CLI's own "$". | Estimate within $15–25 (Sonnet). | Partial | The metrics row stores the estimate (`run-metrics.ts`). The `claude.test.ts` row test checks the row shape, not the price table. No test that the CLI's "$" is ignored. | |
| CO-03 | **Given** a run **when** tokens are split by stage **then** checklist write-ups are the largest share and a cut is measurable against ~60%. | Stage times and tokens per stage are in the row. | Partial | Stage times are saved. A per-stage token split is not confirmed: unknown whether the row has it. | **Touches**: Phase 1 moves code-decided points out of the AI, which is the cost cut this NFR asks for. Re-measure after step 5. |
| CO-04 | **Given** a PageSpeed 429 or 5xx **when** the call runs **then** it retries once on the next key. | Exactly one retry, on another key. | Not covered | Retry logic in `pagespeed.ts:62`. No test. Volume limits are an open PRD question. | |

### Performance and time

| ID | Scenario | Pass threshold | Status | Evidence / gap | P1 |
|---|---|---|---|---|---|
| PF-01 | **Given** a full media-buyer audit **when** it runs end to end **then** it takes ≈ 40 min, and the client sees nothing before review. | ≤ 60 min (my bound); client never waits (delivery by email). | Partial | Stage times are recorded per run (`run-metrics.ts`). No test or alert on duration. Delivery-by-email is by design (`poll.ts`). | Touches |
| PF-02a | **Given** a slow site **when** it is crawled **then** the request aborts at 45 s. | Abort at 45 s. | Manual | `crawl.ts:186` (`AbortSignal.timeout(45_000)`). No test. | |
| PF-02b | **Given** a slow page **when** a screenshot is taken **then** it stops at 45 s and retries once. | 45 s, one retry, reason logged. | Manual | `screenshots.ts:172, 211`. No test. | |
| PF-02c | **Given** a store visit **when** it runs **then** it ends by 230 s. | ≤ 230 s total. | Unknown | I did not find where the 230 s cap is enforced in `fud/collect.ts`. Needs a check or a test. | Touches: probes add visit time |
| PF-02d | **Given** the Claude audit **when** it runs **then** it is cut at 35 min, checklist calls at 12 min. | Timeouts as stated; `CLAUDE_TIMEOUT_MS` overrides. | Manual | `claude.ts:252–258`. No test. | |
| PF-03a | **Given** a finished report **when** it is opened offline **then** it renders with no network. | No external fetch for the report to render. | Not covered | PRD says self-contained HTML, but production reads rows from the API (PF-04). Needs a manual or browser check. | |
| PF-03b | **Given** a report **when** viewed at 390 px **then** nothing scrolls sideways. | `scrollWidth ≤ 390`. | Partial | CSS has `overflow-x:clip` on html/body (`html-report.ts:4536`). No test measures it. | |
| PF-03c | **Given** a report **when** printed **then** it prints. | Print rules exist and content is not cut. | Partial | There is an `@media print` rule (`html-report.ts:4693`), but it only hides some dots. No visual check. | |
| PF-04 | **Given** the report page **when** it loads **then** rows come from `api/audit-report.js` and images carry a long cache header. | Rows endpoint answers; image upload has `cacheControl: 31536000`. | Automated | `tests/api/report-endpoints.test.js`, `report-access.test.js` (rows, bad slug, due-time rules). Image cache set in `supabase.ts:213` (code only). | |

### Reliability

| ID | Scenario | Pass threshold | Status | Evidence / gap | P1 |
|---|---|---|---|---|---|
| RL-01a | **Given** a worker that dies mid-audit **when** its lease (10 min, `LEASE_MS`) expires **then** another worker reclaims the row and skips finished stages. | Row reclaimed once; progress kept; no double run. | **Not covered** | `claimNextRequest`, `heartbeat`, `saveProgress` in `supabase.ts`. No test imports them. | |
| RL-01b | **Given** a worker that lost its lease **when** it tries to save **then** it stops without touching the row or emailing. | `LostLeaseError`, no write. | **Not covered** | `supabase.ts:106–116`, `poll.ts:138`. No test. | |
| RL-01c | **Given** an attempt fails **when** attempts < 3 **then** it retries after 2/10/30 min; on attempt 3 it is marked failed and the reviewer is emailed. | Exactly 3 attempts. `markRequestFailed` once. Email sent. | **Not covered** | `poll.ts:50–52, 460–490`. No test. Rate-limit path (`markRequestRateLimited`) gives the attempt back: also untested. | |
| RL-01d | **Given** a resumed audit **when** stages are skipped **then** results match a single full run. | Same rows. | **Not covered** | `poll.ts:116–` (progress object). No test. | |
| RL-02 | **Given** the friction pass throws **when** the stage runs **then** the audit still finishes, `{ error }` is saved and the section is left out. | No throw; error saved. | Partial | Friction: `fud4.test.ts` "queue stage: gated by FUD_PASS, runs once, saves the result or the error, never throws". Checklist side: not found in a test, unknown. | |
| RL-03 | **Given** a translation with missing findings **when** it is not the last attempt **then** the attempt fails and retries; on the last attempt it ships English. | Retry on attempts 1–2; English only on 3. | Not covered | `poll.ts:247–262`. `translate-ar.ts` has no test file. | Touches (Arabic templates, step 4) |
| RL-04 | **Given** screenshots, PageSpeed, Clarity or Intellia fail **when** the audit runs **then** it continues and the reason is logged. | Audit completes; logged reason. | Partial | Clarity and tracking detection: `tests/api/clarity.test.js`, `detect-tracking.test.js`. Screenshots (one retry with a reason): code only. PageSpeed: code only. Intellia: no test found. | Touches: `runNetChecks` joins this list in step 5 |

### Security and privacy

| ID | Scenario | Pass threshold | Status | Evidence / gap | P1 |
|---|---|---|---|---|---|
| SC-01a | **Given** the OAuth start **when** the URL is built **then** scopes are read-only and `access_type=online`. | Only `analytics.readonly`, `tagmanager.readonly`; no refresh token. | Partial | `api/_lib/google-oauth.js:23–62`. `oauth.test.js` tests state/cookie, not the scopes. | |
| SC-01b | **Given** a bad or missing OAuth state **when** the callback runs **then** Google is not called. | Refused. | Automated | `oauth.test.js` "state that doesn't match the cookie is refused before talking to Google", "no cookie at all…". | |
| SC-02a | **Given** a store visit **when** analytics/pixel hits fire **then** they are aborted and leaks are logged. | Blocked list aborts; leaks listed. | Automated | `fud.test.ts` "only analytics collection hits are blocked, not the tag scripts"; `fud2.test.ts` "trackers found by the leak audit are blocked; cart and tag scripts are not". The live interception (`collect.ts:749–833`) has no test. | Touches: new probes and the 360 px re-read |
| SC-02b | **Given** a visit **when** it runs **then** it never types, submits or orders. | No typing, no submit, no order. | Manual | No `.type(` call in `collect.ts`; checkout stops at the first screen (`collect.ts:1097`). The variant probe does click options. No test fails if a click is added later. | **Touches**: `COLLECT_PROBES=on` adds interaction. Needs a test or review before it is enabled. |
| SC-02c | **Given** customer-data fields **when** found **then** only presence is stored, never the value. | No value in evidence. | Partial | `signal-quality.test.ts` "Meta hits: … user data values are not kept". Other fields: unknown. | |
| SC-03 | **Given** the repo **when** scanned **then** no secrets are committed, `.env` is ignored and prod/test Supabase are separate. | No secret in git; separate projects. | Manual | `.gitignore` lines 9–11. Separation lives in Supabase/Vercel settings, not checkable here. No secret scan in CI. | |
| SC-04a | **Given** an approve link **when** the token is wrong, missing or reused **then** it is refused and nothing leaks. | 401/400/404/409 as listed. | Automated | `audit-approve.test.js` (8 tests: wrong token 401, no token, already handled, not ready 409, no client email in errors). | |
| SC-04b | **Given** the edit API **when** the key is wrong or unset **then** it refuses. | Exact match only. | Automated | `report-edit.test.js` "only an exact match passes", "nobody passes when no key is configured". | |
| SC-04c | **Given** the local report server **when** a path other than `[a-zA-Z0-9_-]+.html` is asked **then** it is refused. | 404 for `..` or other names. | Not covered | Rule stated in `local-pipeline/fake-supabase.ts:18`; the server is in dev code. No test found. | |
| SC-05 | **Given** the staging URL **when** opened without a Vercel login **then** it is blocked. | Login wall. | Unknown | A Vercel setting. Cannot check from the repo. | |
| SC-06 | **Given** each environment **when** OAuth runs **then** the redirect and domain are authorised. | Consent works on staging and prod. | Unknown | A Google console setting. Public use of GA4 scopes may need Google verification: status unknown. | |

### Accuracy (product-critical)

| ID | Scenario | Pass threshold | Status | Evidence / gap | P1 |
|---|---|---|---|---|---|
| AC-01a | **Given** money figures **when** a report is built **then** they come from code and are capped, never from the model. | Range computed in code, upper cap applied. | Partial | `ad-impact.test.ts` "size is a band from the money range against monthly revenue"; `actions.test.ts`, `fud3.test.ts` touch money. No test for the cap itself. | **Touches** |
| AC-01b | **Given** a finished report **when** every number is checked **then** each names a source. | 0 unsourced numbers. | Not covered | No scan of finished text. Closest: `prompt-data.test.ts` ("keeps every value, with column names") and `signal-quality.test.ts`. The model can still write a number into prose. | **Closes in part**: code-decided points get their text from templates with facts (steps 3–5). AI-written points stay open. |
| AC-01c | **Given** a data source is missing **when** a metric needs it **then** it shows "no data", not a guess. | No figure. | Partial | `ga4-facts-persona.test.ts` "GA4 facts: an untracked step is a tracking gap, never a page problem", "polluted key events never become sales". Other sources: unknown. | |
| AC-02a | **Given** a step the visit never reached **when** signal quality is scored **then** it is "untested", never "missing" or "fail". | Status = untested. | Automated | `signal-quality.test.ts` "steps the visit didn't reach are untested, not failed", "a pixel silent during a step is not tested there, never 'missing'". | **Closes** for code points once rules return a tri-state (`points/rules`). |
| AC-02b | **Given** a checklist point that doesn't apply or can't be told **when** the report renders **then** it is dropped, not shown. | Not in the report. | Partial | `unassessed` points are kept and shown as "needs a manual look" (`audit-ids.test.ts`, `audit-prompt.ts:767–787`). That differs from the PRD wording. Decide which is right, then test it. | **Touches** (step 5 gives each point one result) |
| AC-03a | **Given** the model skips a checklist point **when** results are built **then** it is `unassessed`, not a pass, and out of the score. | Status `unassessed`; tally and score exclude it. | Automated | `audit-ids.test.ts` "a check the model leaves out is unassessed: not a pass, out of passed and the score". | **Closes** for the 81 code points: code always gives a verdict. |
| AC-03b | **Given** the model cites a renamed or unknown id **when** results are built **then** a renamed id maps; an unknown id is dropped. | No lost answers. | Automated | `audit-ids.test.ts` "a base id (GA4-07) is matched to the reader's renamed point". The unknown-id drop is code only. | |
| AC-03c | **Given** a skipped point **when** it happens **then** an alert fires. | Reviewer alerted. | **Not covered** | Only `console.warn` (`audit-prompt.ts:767`). The PRD asks for an alert. | **Closes** for the 81 code points. Remaining AI points still need the alert. |
| AC-03d | **Given** the 201-point master list **when** old ids are mapped **then** each maps to one point or is dropped. | 0 unmapped. | Automated | `points/points.test.ts`, `points/rules/rules.test.ts` (a test fails if a rule is missing). | **Closes** (Phase 1 steps 2–3) |

### Accessibility, language, design

| ID | Scenario | Pass threshold | Status | Evidence / gap | P1 |
|---|---|---|---|---|---|
| UX-01a | **Given** a report **when** run through an AA checker **then** no contrast or focus failures. | 0 AA failures. | Not covered | Focus rings and reduced-motion CSS exist (`html-report.ts:4535, 4543`). Contrast is unchecked. | |
| UX-01b | **Given** a finding **when** severity is shown **then** it isn't by colour alone. | Text or icon with every colour. | Unknown | Not checked. | |
| UX-02a | **Given** report copy **when** written **then** sentences are ≤ 14 words with no semicolons. | 0 violations. | Partial | Enforced by prompt rules and by the actionability check (`actions.test.ts`). No test over finished copy. Template text (step 4) has no such test either. | **Touches**: step 4 templates in EN/AR, Egyptian. 6 of 81 written. |
| UX-02b | **Given** a finding **when** the report is Arabic **then** every finding has Arabic. | 0 missing (or English only on last attempt). | Partial | Same logic as RL-03, untested. Known gap: GA4 rule text can't quote numbers in Arabic yet (PHASE1-PLAN step 4). | **Touches** |
| UX-03 | **Given** `PRODUCT.md` **when** the report is reviewed **then** it follows the principles. | Human review. | Manual | No automated check is possible; review only. | |

### Observability

| ID | Scenario | Pass threshold | Status | Evidence / gap | P1 |
|---|---|---|---|---|---|
| OB-01a | **Given** an audit **when** it logs **then** lines are JSON and carry the same `auditId`, even with two audits at once. | `auditId` on every line. | Automated | `log-context.test.ts` (4 tests incl. "two audits running at once keep their own IDs", "jsonLine is what Railway reads"); `tests/api/log.test.js`. | |
| OB-01b | **Given** one audit **when** searched in Vercel and Railway **then** the same id appears in both. | Same `audit_requests.id`. | Unknown | Needs a real run in both dashboards. | |
| OB-02a | **Given** an API 5xx or crash **when** it happens in production **then** the reviewer is emailed, at most once per route per 15 min. | 1 email per route per 15 min; 4xx none; not outside prod. | Automated | `error-alert.test.js` (6 tests). | |
| OB-02b | **Given** Claude logout, API-key problems or an audit that fails 3 times **when** they happen **then** the reviewer is emailed. | Email sent once per outage. | Not covered | `poll.ts:324–392, 475–490`. No test. | |

## Phase 1 view

What the Phase 1 work closes or changes, so Adham can see it at a glance:

- **Closes:** AC-02a, AC-03a, AC-03c (for code points), AC-03d. Part of AC-01b.
- **Touches (re-check after):** CO-01b, CO-03, PF-01, PF-02c, RL-03, RL-04 (`runNetChecks`), SC-02a, SC-02b, UX-02a, UX-02b, AC-01a, AC-02b.
- **Not touched, still open:** all of RL-01, OB-02b, SC-04c, PF-03, UX-01.
- **Before enabling `COLLECT_PROBES=on` in production:** SC-02b needs a test or review. The PRD's "never types, never submits" is only a code habit today.

## Suggested order for closing gaps

1. RL-01 tests (lease, reclaim, 3 attempts, backoff). They need a fake Supabase; `local-pipeline/fake-supabase.ts` may be reusable.
2. AC-03c alert, then decide AC-02b (show or drop `unassessed`).
3. RL-03 and OB-02b tests.
4. AC-01a/b: a cap test, and a scan that every number in a finished report has a source.
5. SC-02b guard test before probes go on.
