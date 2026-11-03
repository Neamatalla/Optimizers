# PRD — Optimizers Free Audit Tool

> Checkpoint document for the free tracking, CRO and paid-media audit tool.
> It records what the tool is, who it serves, what it does today, and where it goes next.
> Facts about the current build come from the code on branch `omar/10-rounds` (rounds 1–21, see `audit-worker/ROUNDS-LOG.md`).
> Anything planned is marked **Planned**.

---

## 9. Metadata

*(Listed first so readers know which version they hold. The other sections follow the requested order.)*

| Field | Value |
|---|---|
| Document | PRD — Optimizers Free Audit Tool |
| Version | 1.0 (checkpoint after rounds 1–21) |
| Status | Draft for review |
| Date | 2026-11-03 |
| Product owner | Omar (Optimizers) |
| Dev team | Omar, Adham |
| Reviewer of audits | Omar (`AUDIT_REVIEWER_EMAIL`, default omar@optimizers.agency) |
| Repository | `Optimizers` (site + API) and `Optimizers/audit-worker` (audit worker) |
| Branch at checkpoint | `omar/10-rounds`, 21 rounds staged, not committed |
| Environments | Production: optimizers.agency (Vercel) + production Supabase + Railway worker. Staging: optimizers-env-staging-neamatalla.vercel.app + testing Supabase project + Railway staging worker. Local: Vite dev server :5173 + local worker |
| Related docs | `audit-worker/README.md`, `audit-worker/PRODUCT.md` (design principles), `audit-worker/ROUNDS-LOG.md`, `audit-worker/FUD-PASS-DESIGN.md`, `audit-worker/ICP-REPORT-PLAN.md`, `audit-worker/icp/*.md` (ICP cards and playbook), `audit-worker/ACTION-POINTS-PROPOSAL.md`, `CLAUDE.md` |
| Change log | 1.0 — first PRD, written from the code and the round 21 end-to-end trial. 1.0.1 — Omar's role corrected: product, dev, reviewer; no client contact (sales/account team owns that). 1.0.2 — Connector roadmap rewritten for all four ICPs (per-ICP value table, breadth-first order). |

---

## 1. Product description and purpose

### What it is
A free, automated audit of an e-commerce store's **tracking, conversion (CRO) and paid-media readiness**.

**The visitor side.** A visitor fills "Get a Free Audit" on optimizers.agency, gives the store URL and their role, and can optionally:
- connect Google (GA4 and GTM, read-only);
- connect Microsoft Clarity;
- type the ad they run and its coupon.

**The worker side.** A background worker then:
- reads the store's GA4/GTM setup and data;
- opens the store on a phone like a real shopper (without polluting its data);
- runs 50 AI-judged checks, 48 purchase-friction rules and the agency's 377-point manual CRO checklist;
- measures page speed;
- writes a bilingual (English and Egyptian/Gulf Arabic) report shaped for the reader's role.

**The delivery side.** Omar reviews each audit before it goes out. The client receives it 2 days after approval.

### Why it exists
- **For the store side:**
  - Prove, with the store's own numbers, what is broken in tracking and on the site.
  - Show what it costs and what to fix first.
  - Answer the media buyer's question: *is it the ads or the site?*
- **For Optimizers:** a lead engine. A report that cites the prospect's own gaps earns trust and opens a sales call ("Book a call" on every report). One wrong number destroys that trust, so accuracy beats volume.

### Success looks like
- The reader trusts the findings: no invented numbers, and every number names its source.
- The reader knows their top 3 fixes and who owns each.
- The reader books a call, or applies the fixes and comes back.
- Omar can approve an audit in minutes, not rewrite it.

---

## 2. Stakeholders

| Stakeholder | Role | What they need from the tool |
|---|---|---|
| **Omar** | Product owner, developer, reviewer. Does not talk to clients. | Audits accurate enough to send without rewriting. Fast review. Low cost per audit. A roadmap he controls. |
| **Adham** | Developer | A clear architecture, tests that catch regressions, a local way to run the real pipeline, documented decisions. |
| **The reviewer (Omar today)** | Quality gate before any client sees a report | An internal review email with the top findings and friction fails. An approve link. A report-edit API to fix a finding without a re-run. |
| **End users (the four ICPs, §3)** | Read the report | A report written for their role, in their language, with their store's own data. |
| **Optimizers sales / account team** (not Omar) | The only people who talk to clients; follow up the lead | The client's biggest gaps as an opening line. Role-specific talk tracks. A daily digest of what's due. |
| **Third parties the tool depends on** | Google (GA4, GTM, OAuth, PageSpeed), Microsoft (Clarity), Anthropic (Claude), Supabase, Vercel, Railway, Resend, Intellia (store-platform check) | Keep within their terms, quotas and verification rules (for example the Google OAuth consent-screen verification). |

---

## 3. Users (ICPs)

All four read the same audit engine. The role picked on the form changes the voice, what comes first, and, for two roles, the checklist itself. Canonical cards: `audit-worker/icp/*.md`. How each ICP's pains map to features: `icp/ICP-PLAYBOOK.md`.

| # | ICP | Who | Their job, in their words | Report today |
|---|---|---|---|---|
| ICP1 | **Store owner** (`store_owner`) | Owner/operator in the GCC (mostly KSA, on Salla, Zid or Shopify), team of 1–5. At home in the store admin, not in code. Reads on a phone. | "Tell me what's costing me sales and let me fix it myself." | Own persona checklist (GA4 25, GTM 25, Website 25). Money first. Fixes with platform menu paths. "You can do this / needs a developer." |
| ICP2 | **Media buyer** (`media_buyer`) | Runs the paid ads (Meta, then TikTok, Snapchat in KSA, and Google). Often Egyptian, running GCC accounts as a freelancer, agency employee or in-house. Controls budgets, audiences, creatives and bids, not the site or tracking. | "Tell me if it's the ads or the site, and give me proof the owner will accept." | Own persona checklist. Dedicated media-buyer report: trust-the-numbers lanes, break-even ROAS calculator, campaigns, ad setup, pixel signal quality, ad landing pages, ROAS leaks, CRO stages with ROAS/CAC direction. |
| ICP3 | **Marketing director / manager** (`marketing_manager`) | Mid-size store or brand in KSA/UAE/Egypt, between the CEO and a team. Non- to mid-technical. | "Present a credible, data-driven audit so we can prioritize the fixes that boost sales." | General checklist with a manager voice. Priority and payoff, owner per finding, defensible sources. |
| ICP4 | **Agency / consultant** (`agency`) | Performance, CRO or growth agency or freelancer, often Cairo-based serving GCC clients. Data-literate. | "A deliverable I can put in front of a merchant without burning my credibility, that justifies an engagement." | General checklist with an agency voice. Client-safe, scoped as workstreams. |
| — | **No role given** | Older forms or skipped field | — | General store-owner voice. |

Shared traits across ICPs:
- **Market.** GCC and Egypt; cash on delivery; mada, Apple Pay, STC Pay, Tabby and Tamara; Salla, Zid and Shopify.
- **Reading habits.** Mostly on phones, often in Arabic.
- **Trust.** Low tolerance for one wrong number.

---

## 4. Dev team

| Person | Area today | Notes |
|---|---|---|
| **Omar** | Product, audit worker, report, prompts, ICP work, review | Also the reviewer. No client contact. Works with Claude Code. |
| **Adham** | Development | Area ownership to be agreed (see Open questions). |

How the team works:
- **Branches.** Feature branches → `staging` → `main`.
- **Staging first.** Changes are staged and reviewed in rounds (`ROUNDS-LOG.md`): before/after, how to check, decision.
- **Migrations.** Applied to staging first; logged in `supabase/migrations` and the migration log commits.
- **Tests.**
  - Worker: `cd audit-worker && npm test`, 136 offline tests.
  - Site and API: `npm test` in the root.
- **Local end-to-end.** `npx tsx src/local-pipeline/run.ts <site> --role=… --tools=GA4,GTM` runs the real production job with database and email swapped for files (round 21).

---

## 5. Functional requirements (all features)

IDs are stable so stories, tests and issues can cite them. **Status:**
- ✅ built and seen in a real run;
- 🟡 built, not yet proven on real data;
- ⬜ planned.

### 5.1 Intake (site + API)
| ID | Requirement | Status |
|---|---|---|
| FR-IN-01 | "Get a Free Audit" form (`src/imports/GetFreeAudit.tsx`): email, website, business name, tools (GA4, GTM), role, optional GA4/GTM IDs. | ✅ |
| FR-IN-02 | Tracking detection prefills GA4/GTM IDs from the live site (`api/detect-tracking.js`). | ✅ |
| FR-IN-03 | Google OAuth (read-only) fetches the visitor's GA4 properties, GTM containers and GA4 reports at intake (`api/oauth/google/*`, `api/_lib/google-oauth.js`), including the traffic-sources report with revenue. Stored as `ga4_oauth_data` / `gtm_oauth_data`. | ✅ (staging needs the redirect URI and env var for its domain) |
| FR-IN-04 | Clarity connect: a snapshot of the store's Clarity data, matched to the site (`api/clarity/connect.js`). | ✅ |
| FR-IN-05 | Media-buyer ad context: ad headline/offer and coupon (`ad_context`). | ✅ |
| FR-IN-06 | Validation, blocked domains, one audit per site (except test mode), ownership verification recorded (`verification_methods`). | ✅ |
| FR-IN-07 | Test mode: a `-` prefix on email and website runs the whole pipeline, emails the requester directly, and stores the report in the test bucket. | ✅ |
| FR-IN-08 | Store platform via Intellia (`store_platform`), when configured. | 🟡 (not configured locally) |

### 5.2 Worker pipeline (`audit-worker/src/poll.ts`)
| ID | Requirement | Status |
|---|---|---|
| FR-WK-01 | Poll `audit_requests` and claim with a lease (10 min heartbeat), up to 3 attempts. Reclaim stale leases. | ✅ |
| FR-WK-02 | Resumable stages: audit → friction → translate → publish → deliver. Progress is saved after each, so a retry skips what's done. | ✅ |
| FR-WK-03 | Rate-limit aware: a Claude usage limit gives the attempt back and waits for the reset. | ✅ |
| FR-WK-04 | Claude login check before claiming. A one-time alert email when logged out. | ✅ |
| FR-WK-05 | Run metrics and usage logging per Claude call (tokens, 5-hour window). | ✅ |

### 5.3 Data collection
| ID | Requirement | Status |
|---|---|---|
| FR-DC-01 | Crawl the homepage: security headers, GA4/GTM IDs, Clarity/Hotjar, structural signals. Detects IDs in Google's snippets and in platform settings objects (Zid). 45s timeout. | ✅ |
| FR-DC-02 | Page discovery: home, product, collection, cart. | ✅ |
| FR-DC-03 | PageSpeed for the discovered pages, phone and desktop. | ✅ |
| FR-DC-04 | Report mockups: desktop and phone screenshots. Arrival pop-ups closed, 45s load, one retry. | ✅ |
| FR-DC-05 | **Store visit** (`fud/collect.ts`), a phone visit like a shopper: home, product, cart (drawer or page), collection, search test, desktop home and product. Every analytics hit is blocked, so the client's data stays clean (0 leaked in trials). | ✅ |
| FR-DC-06 | Add-to-cart attempt; the events the tap sent (dataLayer, GA4, pixels). | ✅ |
| FR-DC-07 | **First checkout screen** with the item in cart. Nothing typed or submitted. A log-in wall is detected and noted. | ✅ |
| FR-DC-08 | **Ad landing pages**: the top 2 paid landing pages from GA4, opened as "landing". | 🟡 (wired in production in round 21; needs a GA4 OAuth run to prove) |
| FR-DC-09 | **Pixel hit parameters**: value, currency, product IDs, event ID, customer-data flag. Read from GA4 batches (URL plus body), Meta (query, form, multipart) and TikTok JSON. Retries deduped. Late Shopify app-pixel events attributed to their step. | ✅ |
| FR-DC-10 | GA4 facts from OAuth data: funnel, channels, campaigns (with revenue), landing pages, attribution, data-quality facts, focus page. | ✅ (data path); 🟡 media-buyer sections not yet seen on real OAuth data after rounds 13–21 |
| FR-DC-11 | Clarity facts: rage and dead clicks, scroll, quick-backs, per page/device. | ✅ |

### 5.4 Analysis
| ID | Requirement | Status |
|---|---|---|
| FR-AN-01 | **50-check AI audit** (`audit-prompt.ts`, `claude -p` with MCP):<br>• both tools: GA4 25 + GTM 25;<br>• one tool: that tool's 25 + Website-code 25;<br>• neither: Website 50.<br>Store owner and media buyer get their own persona lists. Every point gets a verdict; a base id is matched to the reader's renamed point (round 21 fix). | ✅ |
| FR-AN-02 | Computed GA4 facts override the model where they disagree. Money ranges come from code, never the model, capped and sourced. | ✅ |
| FR-AN-03 | Action per failed point: step, owner, "done when". Actionability repair pass. | ✅ |
| FR-AN-04 | **Friction (FUD) rules**: 48 rules (`fud-2.1.0`; home 14, product 23, cart 6, collection 5). AI judge plus signal detectors, PEXTI score, quick win / dev task / test first bands, focus page from the GA4 funnel. | ✅ |
| FR-AN-05 | **Manual CRO checklist**: the agency's 377 checkpoints in 12 tabs. Each is judged from the visit:<br>• "doesn't apply" and "can't tell" are dropped;<br>• every failure gets a long bilingual write-up (found / means / problem / fix steps / done when);<br>• scored well 3 / adequate 2 / badly 1 / missing 0.<br>Checkout and Landing Pages tabs run on the new pages. The typed ad goes to landing checkpoints. Thank-you pages are never run. | ✅ |
| FR-AN-06 | **Pixel signal quality** (`signal-quality.ts`): per platform (Meta, GA4, TikTok, Snap) and step (view, cart, checkout):<br>• the event is sent, sent ×N, missing, or not tested;<br>• fields: value, currency, product IDs, event ID;<br>• value and currency mismatches;<br>• a silent pixel or a log-in wall is "not tested", never "missing";<br>• Purchase is never tested (no orders). | ✅ |
| FR-AN-07 | **Ad → landing match** (`ad-match.ts`): the ad's offers, words and coupon against the landing first screen (Arabic-aware). Also: price and buy button on the first screen, and a coupon field at checkout. | 🟡 (proven on saved evidence, not yet on a GA4-picked landing page) |
| FR-AN-08 | Ad impact direction (ROAS/CAC ↑↓) per finding for the media buyer and agency. | ✅ |
| FR-AN-09 | Arabic translation of all 50 findings; English fallback only on the last attempt. | ✅ |

### 5.5 Report (`audit-worker/src/html-report.ts`, one self-contained HTML)
| ID | Requirement | Status |
|---|---|---|
| FR-RP-01 | Bilingual EN/AR toggle (CSS only), RTL designed, phone first, prints and saves as PDF. | ✅ |
| FR-RP-02 | Hero: verdict sentence, data chips, desktop and phone mockups, guide rail with section stops. | ✅ |
| FR-RP-03 | Role-shaped order. **Media buyer:** hero → "Can you trust the numbers?" (lanes, phone-visit results, pixel map, signal quality) → break-even ROAS calculator → campaigns → ad setup → ROAS leaks → After the click (ad landing pages, CRO stages) → CRO checklist → Clarity → speed → checks → method → sources. Others: the general order. | ✅ (campaigns, ad setup, ad landing: 🟡 need OAuth) |
| FR-RP-04 | Break-even ROAS calculator (margin, delivery rate, shipping, ad cost) with a waterfall. Empty inputs in real audits, sample inputs in previews. | ✅ |
| FR-RP-05 | Campaigns section: per campaign, UTMs, sessions, CVR, AOV, RPV, revenue, an AI comment, spend inputs and a budget panel. | 🟡 |
| FR-RP-06 | CRO checklist section: score board, per-tab bars, importance filter, cards, "done well" lists. | ✅ |
| FR-RP-07 | Every number names its source. Sources section. "How it works" method section. | ✅ |
| FR-RP-08 | Live page `/audit-reports/:slug` renders from saved rows (`api/audit-report.js` + `src/audit-report/main.ts`). | ✅ |
| FR-RP-09 | "Book a call" CTA throughout. | ✅ |

### 5.6 Review and delivery
| ID | Requirement | Status |
|---|---|---|
| FR-DL-01 | Publish: rows in `audit_reports` / `audit_findings`, images in the `audit-images` bucket (screenshots, rule crops, landing crops), slug in `report_pages`. | ✅ |
| FR-DL-02 | Internal review email to the reviewer: top actions, friction fails, role talk track, approve link (token). | ✅ |
| FR-DL-03 | Approve → scheduled → client email 2 days later (`audit-approve.js`, `APPROVAL_DELAY_MS`). | ✅ |
| FR-DL-04 | Client email: role-aware subject and verdict, top 3 actions, report link. | ✅ |
| FR-DL-05 | Report edit API (`/api/report/edit`, `REPORT_EDIT_API_KEY`): fix one finding row without a re-run. Friction override tool (`fud-override`). | ✅ |
| FR-DL-06 | Daily digest email of scheduled sends. Audit-failed email. API 5xx alert email (max once per route per 15 min). | ✅ |

### 5.7 Planned features (roadmap detail in §6)
| ID | Requirement | Status |
|---|---|---|
| FR-PL-01 | **Ad platform connectors** (read-only): Meta Ads, Google Ads, TikTok Ads, Snapchat Ads. Spend, CPA, ROAS, purchases per campaign, event match quality, CAPI health, platform-vs-GA4 reconciliation. | ⬜ |
| FR-PL-02 | **CMS / store connectors** (read-only): Shopify, Salla, Zid, WooCommerce. Real orders, revenue, AOV, refunds and returns, COD vs prepaid, delivered vs placed. That feeds true ROAS and break-even with real numbers. | ⬜ |
| FR-PL-03 | **Behavioral tools**: deeper Clarity (recordings sample, heatmaps per landing page), Hotjar, others as needed. | ⬜ |
| FR-PL-04 | Per-role follow-up question on the form, and post-delivery follow-up (did they fix it, re-audit). | ⬜ |
| FR-PL-05 | Personas for the marketing manager and agency (own checklists like ICP1/ICP2). | ⬜ |
| FR-PL-06 | Re-audit and monitoring: compare against the last audit, flag regressions. | ⬜ |
| FR-PL-07 | Agency white-label / client-safe export. | ⬜ |

---

## 6. Product roadmap

### Now: ship what is built (this week)
1. **Merge the 21 staged rounds.** Commit in reviewed slices; deploy the worker and site to staging, then production.
2. **Prove the GA4-driven media-buyer sections on real OAuth data.**
   - Sections: campaigns, ad setup, ad landing pages, break-even with real AOV.
   - How: one test-mode audit through the real form on staging, with Google connected and our code deployed.
3. **Staging access.** Turn off Vercel Deployment Protection for previews, or invite reviewers.
4. **Finish the Google OAuth setup for staging.** Redirect URI on the OAuth client, `GOOGLE_OAUTH_REDIRECT_URI` on Vercel, test users if the consent screen is in Testing mode.
5. **Re-run role-based audits sent before round 21.** Their GA4/GTM checks may be generic passes (the id mismatch bug).
6. Rotate secrets that were pasted into chat (Resend, PageSpeed keys, report edit key).

### Next: more data (connectors), for every ICP

Every connector is read-only, optional on the form, and feeds **all four reports**. What changes per ICP is how the data is shown, not whether they get it.

**What each connector gives each ICP**

| Connector | Data | ICP1 Store owner | ICP2 Media buyer | ICP3 Marketing manager | ICP4 Agency |
|---|---|---|---|---|---|
| **Store platform:** Shopify Admin API, Salla, Zid (WooCommerce later) | Orders, revenue, AOV, refunds/returns, COD vs prepaid, delivered vs placed, top products, discount use | Real sales lost per fix, in their currency. "Is my COD rate killing me?" | Break-even ROAS with no manual inputs. Ad-reported vs store-recorded purchases. | Revenue impact per finding the CEO will accept. Mobile vs desktop sales. | Client-safe baseline numbers. Before/after proof for the engagement. |
| **Meta Ads** | Spend, results, CPA, purchase ROAS and frequency per campaign. Events Manager: event match quality, CAPI vs browser share, dedup. | Where the ad money goes and what it returns, in plain words. | "Is it the ads or the site?" with both sides' numbers. Joins with pixel signal quality and GA4 campaigns. | Channel ROAS/CAC for budget decisions. | Ad-account health as a sellable workstream. |
| **TikTok Ads, Snapchat Ads** | Same shape as Meta: spend, conversions, pixel/CAPI health. Snapchat matters in KSA. | Same as Meta, per platform. | Cross-platform comparison. Which pixel lies. | Budget split across channels. | Multi-platform audit scope. |
| **Google Ads** | Campaigns, conversions, enhanced conversions, GA4 link (the GA4 Ads link check already exists). | Whether Google ads count sales at all. | Search/PMax vs social. Conversion import health. | Full paid picture in one report. | Google Ads workstream. |
| **Behavioral:** Clarity depth (per landing page and device, heatmaps, recordings sample), Hotjar as an alternative | Where shoppers click, stall and leave | "Show me where people get stuck" on their own pages. | Behavior of paid traffic on landing pages. | Visual proof for the team and the CEO. | Evidence that ties friction findings to observed behavior. |

**Proposed order** (breadth first: the connector that improves all four reports most comes first):
1. **Store platform data** (Shopify, Salla, Zid): real money numbers in every report, and the break-even calculator fills itself.
2. **Meta Ads**: the largest ad channel for all four ICPs in the region.
3. **Behavioral depth** (Clarity, then Hotjar): visual proof every reader understands.
4. **TikTok Ads and Snapchat Ads.**
5. **Google Ads.**

**Alongside:** cost control. The checklist write-ups are about 60% of tokens; write up only high/critical failures in full, or batch more. More connectors add AI calls, so this lands before or with the first connector.

### Later
- Monitoring and re-audits (scheduled re-runs, regression alerts, before/after).
- Personas for the marketing manager and agency; agency white-label.
- Self-serve paid tier (deeper audit, more pages, more connectors). Pricing is an open question.
- WooCommerce and other CMSs; more markets beyond the GCC and Egypt.

---

## 7. User stories

Acceptance criteria are short. Each story cites the FR it depends on.

### Store owner (ICP1)
- **US-SO-1.** As a store owner, I want to know what is costing me sales, in my currency, so I fix the most expensive thing first.
  - *Accept:* the first screen names the top fixes with a money range and its source (FR-AN-02, FR-RP-02).
- **US-SO-2.** As a store owner, I want each fix to say where to change it in Salla, Zid or Shopify and whether I can do it myself.
  - *Accept:* failed findings carry step, owner, done-when and a menu path only when sure (FR-AN-03).
- **US-SO-3.** As a store owner reading on my phone in Arabic, I want the report to read naturally.
  - *Accept:* the AR toggle, RTL layout, no sideways scroll at 390px (FR-RP-01).
- **US-SO-4.** As a store owner, I want to see my store the way a shopper meets it (pop-ups, cart, checkout).
  - *Accept:* phone-visit results and checklist cards quote what was seen (FR-DC-05/07, FR-AN-05).
- **US-SO-5 (planned).** As a store owner, I want the money per fix to come from my real orders in Salla, Zid or Shopify, not estimates.
  - *Accept:* the store-platform connector feeds the money ranges and COD/return rates (FR-PL-02).

### Media buyer (ICP2)
- **US-MB-1.** As a media buyer, I want to know whether my reported ROAS is real before I change budgets.
  - *Accept:* "Can you trust the numbers?" lists counting problems, with inflated or deflated direction (FR-AN-01/08).
- **US-MB-2.** As a media buyer, I want to see what each pixel tells each platform at each step, so I can prove a tracking problem to the owner.
  - *Accept:* the signal quality table; a missing event never gets reported when the pixel simply didn't load (FR-AN-06).
- **US-MB-3.** As a media buyer, I want my break-even ROAS and CPA from the store's margin, COD rate and shipping.
  - *Accept:* the calculator; empty inputs in real audits (FR-RP-04).
- **US-MB-4.** As a media buyer, I want every campaign's sessions, CVR, AOV, RPV and revenue with a comment on why it leaks.
  - *Accept:* the campaigns section on real OAuth data (FR-RP-05, FR-DC-10).
- **US-MB-5.** As a media buyer, I want to know if my landing page keeps my ad's promise.
  - *Accept:* the ad → landing match per GA4 landing page (FR-AN-07, FR-DC-08).
- **US-MB-6.** As a media buyer, I want leaks after the click ranked by their effect on ROAS and CAC.
  - *Accept:* CRO stages with the ROAS/CAC chip (FR-AN-04, FR-RP-03).
- **US-MB-7 (planned).** As a media buyer, I want Ads Manager numbers next to GA4 and store numbers, so the gap is visible.
  - *Accept:* the connector reconciliation table (FR-PL-01/02).

### Marketing manager (ICP3)
- **US-MM-1.** As a marketing manager, I want findings ranked by payoff with an owner each, so I can brief my team.
  - *Accept:* priority and owner per finding (FR-AN-03).
- **US-MM-2.** As a marketing manager, I want every number sourced, so I can defend it to the CEO.
  - *Accept:* the sources section and per-number source (FR-RP-07).
- **US-MM-3 (planned).** As a marketing manager, I want ROAS and CAC per channel (Meta, TikTok, Snapchat, Google) next to store revenue, so I can defend budget splits.
  - *Accept:* the ad-platform and store connectors combined in one channel table (FR-PL-01/02).

### Agency (ICP4)
- **US-AG-1.** As an agency, I want a client-safe report I can forward without editing.
  - *Accept:* no invented numbers; inferred vs measured is labelled (FR-AN-02, FR-RP-07).
- **US-AG-2.** As an agency, I want findings grouped into workstreams I can scope and sell.
  - *Accept:* the workstream label per finding (FR-AN-03; persona planned FR-PL-05).
- **US-AG-3 (planned).** As an agency, I want ad-account health, store numbers and behavior recordings in one report, so I can scope a full engagement from one audit.
  - *Accept:* every connected source appears with its own section and source label (FR-PL-01/02/03).

### Reviewer (Omar)
- **US-RV-1.** As the reviewer, I want an email with the top findings and an approve link, so I can approve in minutes.
  - *Accept:* the review email; one-click approve schedules the send for 2 days later (FR-DL-02/03).
- **US-RV-2.** As the reviewer, I want to fix one wrong finding without re-running the audit.
  - *Accept:* the report edit API / fud-override (FR-DL-05).
### Sales / account team
- **US-SL-1.** As the person who calls the lead, I want a talk track for their role, so the call opens with their store's biggest gap.
  - *Accept:* the talk track in the internal review email, passed to the sales team (FR-DL-02).
- **US-SL-2.** As the sales team, I want a daily list of reports going out, so I can follow up on time.
  - *Accept:* the daily digest email (FR-DL-06).

### Dev team (Omar, Adham)
- **US-DV-1.** As a developer, I want to run the real production pipeline locally without touching the database or sending email.
  - *Accept:* `src/local-pipeline/run.ts` writes the report, rows, progress and email to `output/` (round 21).
- **US-DV-2.** As a developer, I want offline tests that catch regressions in parsing, scoring and rendering.
  - *Accept:* `npm test` green (136 tests at checkpoint).
- **US-DV-3.** As a developer, I want previews with sample or saved data to iterate on the report fast.
  - *Accept:* `npm run preview-report -- …` with `--signal=`, `--checklist=`, `--ad=`.
- **US-DV-4.** As a developer, I want every round documented with what changed, how to check and the decision.
  - *Accept:* `ROUNDS-LOG.md`.

---

## 8. Non-functional requirements

### Cost
| ID | Requirement |
|---|---|
| NFR-CO-01 | Claude runs on the Claude subscription via `claude -p`. A full media-buyer audit with the CRO checklist takes about 52 calls and about 1.1M output tokens: about 20 points of the 5-hour usage window (measured on regal-honey.com, 2026-11-02). |
| NFR-CO-02 | If moved to the API, the estimated list price is about $15–25 per audit on Sonnet and $70–100 on Opus. The CLI's own "$" figure under-reports and must not be used for pricing. |
| NFR-CO-03 | The checklist write-ups are about 60% of tokens. Any cost cut starts there (FR roadmap "Cost control"). |
| NFR-CO-04 | PageSpeed uses a rotated pool of API keys. Supabase, Vercel, Railway and Resend stay on their current plans. Volume limits to be set (see Open questions). |

### Performance and time
| ID | Requirement |
|---|---|
| NFR-PF-01 | End-to-end time: about 40 minutes for a full media-buyer audit (audit about 5 min, store visit about 2 min, friction and checklist about 30 min, translation about 3–4 min). The client never waits on it: delivery is by email after review. |
| NFR-PF-02 | Network limits: crawl 45s, screenshots 45s plus one retry, store visit 230s total, Claude audit budget 35 min, checklist calls 12 min each. |
| NFR-PF-03 | The report is one self-contained HTML (about 3.5–4 MB with mockups). It opens offline, prints, and works on a 390px phone with no sideways scroll. |
| NFR-PF-04 | The live report page loads rows from `api/audit-report.js`; images come from the public bucket with long cache headers. |

### Reliability
| ID | Requirement |
|---|---|
| NFR-RL-01 | Stages are resumable. Max 3 attempts. Leases with heartbeat; stale leases are reclaimed. |
| NFR-RL-02 | The friction pass and checklist can never fail the audit: a failure is saved as `{ error }` and the section is left out. |
| NFR-RL-03 | Translation is incomplete → retry; the English fallback only on the last attempt. |
| NFR-RL-04 | Every external dependency is best-effort with a logged reason: screenshots, PageSpeed, Clarity, Intellia. |

### Security and privacy
| ID | Requirement |
|---|---|
| NFR-SC-01 | Google access is read-only OAuth, used once at intake and not kept as a refresh token. Service accounts are used only where the visitor didn't connect. |
| NFR-SC-02 | The store visit never pollutes client data: every analytics/pixel hit is aborted and leaks are logged. It never types, submits or places an order. Customer-data presence is recorded, never its value. |
| NFR-SC-03 | Secrets live in Vercel/Railway env and local `.env` (gitignored), and are never committed. Production and testing Supabase projects are separated. Secrets pasted into chats or tickets must be rotated. |
| NFR-SC-04 | The approve link is a one-time random token. The report edit API requires `REPORT_EDIT_API_KEY`. Local report serving accepts only `[a-zA-Z0-9_-]+.html`. |
| NFR-SC-05 | Staging is behind Vercel Deployment Protection; opening it to reviewers is a deliberate decision. |
| NFR-SC-06 | The Google OAuth consent screen and authorized domains are kept current per environment. Sensitive GA4 scopes may need Google verification for public use. |

### Accuracy (product-critical)
| ID | Requirement |
|---|---|
| NFR-AC-01 | Never invent a number. Every number names its source (GA4, the visit, GTM, Clarity). Money ranges are computed by code and capped. |
| NFR-AC-02 | "Not tested" is never shown as "missing" or "fail". Doesn't-apply and can't-tell checklist points are dropped, never shown. |
| NFR-AC-03 | Every checklist point gets a real verdict. A generic-pass fallback is a bug to alert on (round 21). |

### Accessibility, language, design
| ID | Requirement |
|---|---|
| NFR-UX-01 | WCAG 2.2 AA: contrast, visible focus, severity never by color alone, `prefers-reduced-motion` respected. |
| NFR-UX-02 | English and Arabic are equal citizens. Egyptian Arabic for the media buyer. Short sentences (≤14 words, no semicolons) in report copy. |
| NFR-UX-03 | Design principles in `audit-worker/PRODUCT.md`: reads like a document, leads with the answer, calm severity. |

### Observability
| ID | Requirement |
|---|---|
| NFR-OB-01 | JSON-line logs in the Vercel and Railway dashboards. The same `auditId` appears in both. |
| NFR-OB-02 | API 5xx emails the reviewer (max once per route per 15 min). Claude logout and audit failures email the reviewer. |

---

## 10. Tech stack

| Layer | Tech |
|---|---|
| Site | React 18 + TypeScript, Vite 6, Tailwind CSS v4, motion / GSAP, Radix (accordion, slot), TanStack Query, Sonner, react-calendly. EN/AR i18n via `LanguageContext` (DOM MutationObserver translation). |
| API | Vercel serverless functions in `api/` (Node): `audit-request`, `detect-tracking`, `oauth/google/{authorize,callback}`, `clarity/connect`, `audit-report`, `audit-approve`, `report/edit`, `contact`. Shared code in `api/_lib/`, wrapped in `withLog`. |
| Report page | `audit-report.html` → `src/audit-report/main.ts`, rendering rows with `audit-worker/src/html-report.ts`. |
| Worker | Node 24 + TypeScript (tsx in dev, `dist/` in prod), Docker on Railway (`node:24-bookworm-slim`, Google Chrome stable, tini, Claude Code CLI). |
| AI | Claude via `claude -p` (headless Claude Code) with MCP servers: GA4 Admin (service account), GTM, chrome-devtools (browser checks), Clarity. Prompts in `audit-prompt.ts`, `fud/judge.ts`, `fud/manual-checklist.ts`, `translate-ar.ts`. |
| Browser automation | puppeteer-core + Chrome (store visit, screenshots); chrome-devtools-mcp (live browser checks in the audit). |
| Database | Supabase Postgres:<br>• `audit_requests` (queue and progress);<br>• `audit_reports` + `audit_findings` (report rows);<br>• `report_pages` (slugs);<br>• `checklist_points`;<br>• `audit_digest_log`.<br>Migrations in `supabase/migrations`. |
| Storage | Supabase Storage: `audit-reports`, `audit-reports-test`, `audit-images` (public). |
| Email | Resend (client email, review email, digest, alerts). |
| External data | Google OAuth + GA4 Data/Admin APIs + GTM API, PageSpeed Insights API, Microsoft Clarity, Intellia store check. |
| Hosting | Vercel (site, API, `/blog` proxy to WordPress, `/apps/*` to other Vercel apps), Railway (worker), Supabase. |
| Tests | Node test runner via tsx (`audit-worker`: 136 tests), root `npm test` for the API. |
| Key config | Worker: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `PUBLIC_SITE_URL`, `AUDIT_REPORTS_BUCKET`, `AUDIT_REPORTS_TEST_BUCKET`, `GA4_*`/`GTM_*` MCP paths, `CLAUDE_BIN`, `CLAUDE_TIMEOUT_MS`, `CHROME_PATH`, `POLL_INTERVAL_MS`, `AUDIT_REVIEWER_EMAIL`, `DAILY_DIGEST_HOUR_UTC`, `REPORT_EDIT_API_KEY`, `REPORT_PREVIEW_SECRET`, `FUD_PASS` (off/test/all), `FUD_ALLOW_FAIL`, `CRO_CHECKLIST` (off to skip). Site: `SUPABASE_*`, `GOOGLE_OAUTH_CLIENT_ID/SECRET/REDIRECT_URI`, `VITE_GOOGLE_OAUTH_ENABLED`, `INTELLIA_*`, `REPORT_EDIT_API_KEY`. |

**Planned additions:**
- Meta Marketing API, Google Ads API, TikTok Marketing API and Snapchat Marketing API (all read-only OAuth).
- Shopify Admin API, Salla and Zid partner APIs.
- Hotjar API and a deeper Clarity export.
- Each needs an OAuth app or partner registration, scope review, and token storage rules (see §11).

---

## 11. Open questions and decisions

### Decisions taken (keep)
| # | Decision | Why |
|---|---|---|
| D-1 | Human review before any client sees a report; send 2 days after approval. | One wrong number discredits the whole report. |
| D-2 | The store visit blocks all analytics hits, never places orders, and never types. | Client data stays clean; legally and ethically safe. |
| D-3 | Money numbers come from code and data, never from the model. | Accuracy. |
| D-4 | "Not tested" ≠ "missing"; can't-tell and doesn't-apply points are dropped. | Trust. |
| D-5 | Reports are self-contained HTML, rendered from rows in production. | Offline, printable, editable per finding. |
| D-6 | Test mode via the `-` prefix runs the full pipeline and skips review. | Safe end-to-end testing. |

### Open questions (need an owner and a date)
| # | Question | Options / notes | Owner |
|---|---|---|---|
| Q-1 | How do we merge the 21 staged rounds safely? | One commit per round vs grouped by area; staging soak period. | Omar + Adham |
| Q-2 | Who owns which area (site, API, worker, report, prompts, connectors)? | Needed before connector work splits. | Omar + Adham |
| Q-3 | Which connector first? | Proposal (serves all four ICPs): store platform (Shopify/Salla/Zid) → Meta Ads → behavioral depth → TikTok/Snap → Google Ads. | Omar |
| Q-4 | Google OAuth app status: is the consent screen in Testing or Production? Verification for GA4 scopes, and branding verification (currently not shown). | Testing caps the number of users and needs test users; Production needs verification. | Omar |
| Q-5 | Staging access for outside reviewers. | Turn off Vercel Deployment Protection for previews, or invite them. | Omar |
| Q-6 | Cost ceiling per audit and monthly volume. | ~20 points of the 5h window per full audit; decide a write-up scope (high/critical only?) and daily caps. | Omar |
| Q-7 | Stay on the subscription CLI or move to the API at scale? | Subscription: no per-call bill but window limits. API: predictable cost, $15–100 per audit depending on model. | Omar |
| Q-8 | Data retention and privacy compliance (KSA PDPL, Egypt data law, GDPR for EU visitors). | How long we keep OAuth data, reports, crops; deletion on request. | Omar |
| Q-9 | Do we re-run role-based audits sent before round 21 (possible generic passes in GA4/GTM)? | List affected rows in production, re-run, re-send or not. | Omar |
| Q-10 | Normalizing custom GA4 event names (e.g. Zid's `OZ_*` via server-side GTM) | Report as a finding only (current) or map them for the funnel. | Dev team |
| Q-11 | Personas for the marketing manager and agency | Build own checklists like ICP1/ICP2, or keep the voice-only approach. | Omar |
| Q-12 | Paid tier and white-label | Scope, pricing, what stays free. | Omar |
| Q-13 | The local dev form route (no DB) runs `test-run.ts`, which skips most of the pipeline | Point it at `local-pipeline/run.ts` and pass the OAuth data through. | Dev team |
| Q-14 | Zid/Salla platform detection in the crawler (shows "unknown" today) | Add platform fingerprints. | Dev team |

---

*End of PRD v1.0. Update the Metadata change log when this document changes.*
