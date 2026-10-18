# FUD Pass — Design

Status: **implemented 2026-10-13** in `src/fud/` (rule set `fud-1.1.0`), switched off by default (`FUD_PASS=off`). Source:
`FUDs_Audit_Engine_PRD_Improved.md` (v2.0), cut down to what a free, URL-only audit can do reliably
without touching the existing 50-check engine. Where the build differs from the original draft it
is marked **As built**; §18 lists what is still open.

Try it: `npm run fud-run -- https://store.com`, then
`npm run preview-report -- --no-ar --fud=output/fud-<host>-result.json`.

FUD = Fears, Uncertainties and Doubts: the unanswered questions that stop a shopper from buying
("Will there be surprise shipping fees?", "What if it doesn't fit?", "Is this store real?").

## 1. Goal

Add a "Purchase friction" section to the audit report: the trust and cost doubts that stop a visitor
from buying, each with on-page evidence, a fix, and a PEXTI priority.

Hard constraint: **the existing audit must behave exactly as it does today.** No change to
`runAudit`, `audit-prompt.ts`, `checklist.ts`, `scoring.ts`, `overallScore`/`possiblePoints`, or the
50-check guarantee. If the FUD pass fails, times out, or is switched off, the report ships exactly
as it would have without it.

## 2. Where it runs

New stage **1b** in `poll.ts`'s `processRequest`, after stage 1 (audit) is saved and before stage 2
(translate):

```ts
// 1b. friction (FUD) pass — best-effort, same contract as screenshots and
// translation: never allowed to fail a run that produced 50 real findings.
if (fudPassEnabled(row) && progress.fud === undefined) {
  progress.fud = await runFudPass({
    website: row.website,
    discoveredPages: progress.discoveredPages ?? [],
    ga4Metrics: progress.ga4Metrics ?? null,
    jobId: row.id,
  }); // FudResult | { error: string } — never throws
  await save();
}
```

Why here:

- **After** the main audit, so it can't compete with it for the 20-minute `claude -p` budget
  (`claude.ts:186`) or for MCP/browser resources.
- It **reuses `discoveredPages`** (home/product/collection/cart, from `discover-pages.ts`) and
  **`ga4Metrics`** (the funnel) that stage 1 already produced. No extra crawl, no extra GA4 calls.
- `progress.fud` is saved like every other stage, so a retry resumes and doesn't re-run it.
  `progress` is JSONB, so no migration is needed.
- `{ error }` is stored instead of leaving the field undefined, so a failed pass isn't retried
  forever. The report just omits the section.

## 3. Architecture: collect deterministically, judge once

Two steps. The browser work is plain puppeteer, the judgement is a single tool-less Claude call.
Claude never drives a browser in this pass, which is what keeps it fast, cheap and predictable.

```
discoveredPages ──▶ collect.ts (puppeteer-core, mobile 390px)
                     │  per page: visible text + boxes, CTA region, widgets,
                     │  JSON-LD, policy links, element crops
                     ▼
                   signals.ts (regex EN+AR, widget fingerprints)
                     │  pre-computed facts: "threshold text found in cart: no"
                     ▼
                   judge.ts (one claude -p, no MCP, effort "medium", 6-min timeout)
                     │  evidence pack JSON in → per-rule JSON out
                     ▼
                   score.ts (deterministic: status gate, compliance, coverage, PEXTI)
                     ▼
                   FudResult ─▶ progress.fud ─▶ translate ─▶ html-report
```

### 3.1 New files (`src/fud/`)

| File | Responsibility |
|---|---|
| `rules.ts` | Rule definitions (§4): id, version, page types, applicability, default E/C/T/I, what counts as pass. |
| `collect.ts` | Opens each sampled page in puppeteer-core (reuses `findChrome()` from `screenshots.ts`; export it). Extracts an evidence pack. |
| `signals.ts` | Deterministic detectors: bilingual regex, widget/script fingerprints, currency parsing. |
| `judge.ts` | Builds the prompt from the rules + evidence pack, calls `runClaudeHeadless({ label: "fud-judge", effort: "medium", timeoutMs: 6 * 60_000, allowedTools: [] })`, parses with `extractJsonPayload`. |
| `score.ts` | Confidence gate, compliance score, coverage, PEXTI. Pure functions, unit-testable. |
| `index.ts` | `runFudPass()`: wires the above, wraps everything in try/catch, returns `FudResult \| { error }`. |

### 3.2 Page sample (v1)

Mobile viewport only (390×844, same profile as `screenshots.ts`). Most traffic is mobile, and one
viewport halves run time. Desktop comes in v2.

| Page | Source | Notes |
|---|---|---|
| Home | `discoveredPages[0]` | C1, C4, C5, D3 |
| Product (1) | first `pageTypeOf === "product"` | Core page: A1, A2, A4, B1, B4, B5, C1, C3, D1 |
| Cart / cart drawer | Click the PDP's Add-to-Cart, wait for a drawer or navigation; fall back to the `cart` URL | A1, A3, D2. If neither works, cart rules are **UNASSESSED** with that reason. |
| Collection (1) | first `collection` | v1.5. Product card essentials, quick-add consistency. |

Checkout is out of scope for v1. It's often hosted (Shopify checkout, payment gateways), and adding
real items there is the riskiest automated action.

Safety: the collector only clicks the primary Add-to-Cart button on the one PDP. No form fills, no
checkout, no login, no CAPTCHA handling. A blocked page is UNASSESSED.

### 3.2.1 Add-to-Cart (decided 2026-10-13: yes)

The collector **does** add one product to the cart, so the cart drawer / cart page can be audited
the way a real shopper sees it. Rules for that click:

- **One item, quantity 1.** If the product has variants, pick the first in-stock option (the
  first enabled size/colour pill or `<option>`). Never change quantity, never apply a coupon.
- **Fresh, throwaway browser context** (incognito-style) per audit: no cookies carried over, the
  cart session dies with the context. Nothing is ever submitted past the cart.
- **Don't pollute the client's analytics.** While the collector runs, intercept and abort
  analytics/ad *collection* requests so our bot's `view_item` / `add_to_cart` never land in the
  store's GA4, Meta, TikTok or Snap data:
  `*/g/collect*`, `*/j/collect*`, `*google-analytics.com/*collect*`, `*facebook.com/tr*`,
  `*analytics.tiktok.com/*`, `*tr.snapchat.com/*`, `*ct.pinterest.com/*`, `*clarity.ms/collect*`.
  The tag scripts themselves (gtm.js, gtag.js, fbevents.js) still load, so the page renders
  normally; only the hits are dropped. This also keeps the bot out of the client's retargeting
  audiences.
- **Identify ourselves** with a user-agent suffix (`OptimizersAudit/1.0`) so a store owner who
  sees the session in their platform can tell what it was.
- **How the cart is captured:** after the click, wait up to 8 s for either a drawer
  (`[role=dialog]`, `.cart-drawer`, `#CartDrawer`, `.mini-cart`, `.side-cart`, Woo's
  `.widget_shopping_cart`) or a navigation to a cart URL. Drawer → evidence from the drawer,
  plus a second capture of the full `/cart` page if one exists. Neither → open the `cart` URL from
  `discoveredPages` directly.
- **Failure modes are UNASSESSED, never FAIL:** ATC disabled/out of stock, variant can't be chosen,
  click opens a quick-view modal instead of adding, bot challenge, nothing appears in 8 s. The
  reason is stored (`atc_out_of_stock`, `atc_no_drawer`, …) and shown in Sources.
- An Add-to-Cart that visibly does nothing (no drawer, no navigation, no cart count change, console
  error on click) is *evidence* for the existing WEB-56 territory. The FUD pass only records it in
  `pagesSampled`; it does not raise its own finding, to avoid double-counting with the 50 checks.

Abandoned-cart flows (Klaviyo, Shopify abandoned checkout) are not triggered: they need an email or
a started checkout, and the collector never enters either.

### 3.3 Evidence pack (what `collect.ts` returns per page)

```ts
interface PageEvidence {
  url: string;
  pageType: PageType;
  loaded: boolean; error?: string;
  // Visible text blocks, in reading order, each with its box and an above-the-fold flag.
  blocks: Array<{ id: string; text: string; box: Box; aboveFold: boolean; tag: string }>;
  // Primary CTA (ATC / checkout) and every block within ~200px of it.
  cta?: { id: string; text: string; box: Box; nearbyBlockIds: string[] };
  widgets: string[];      // e.g. "judgeme", "loox", "trustpilot", "tabby", "tamara", "valu", "whatsapp", "tidio"
  jsonLd: unknown[];      // AggregateRating, Product offers, Organization
  policyLinks: Array<{ kind: "shipping" | "returns" | "contact" | "about" | "faq"; href: string }>;
  crops: Record<string, string>; // blockId → small JPEG data URI, only for candidate evidence
}
```

Text sent to the judge is capped (≈12k chars per page) so the prompt size stays bounded no matter
how heavy the store is.

### 3.4 Regional signals (Egypt / GCC)

The PRD's examples are US-centric. These are the signals that matter for our clients, and the regex
must match both languages:

- **Cash on delivery:** "الدفع عند الاستلام", "COD", "cash on delivery". Counts as risk reversal
  for B1 and as payment flexibility for A4. In Egypt it is often the strongest trust signal.
- **Installments:** Tabby, Tamara, valU, Sympl, Souhoola, Aman, Contact, plus Shop Pay Installments.
- **Shipping threshold:** "free shipping over/above", "شحن مجاني", "توصيل مجاني" + amount, with
  EGP / ج.م / SAR / ر.س / AED / د.إ / KWD / QAR currency parsing.
- **Delivery time:** "2–4 days", "خلال ٣ أيام" (Arabic-Indic digits normalised before matching).
- **Support:** WhatsApp widget or `wa.me` links count as a real human support path for D3/C5.
- **Returns:** "استرجاع", "استبدال", "return", "exchange", "refund" + a number of days.

## 4. Rules in v1

Only the storefront-detectable categories A–D. Category E (surveys, review mining, behavioural)
needs connectors we don't have (no Clarity/replay, no review API) and is **not run at all** in v1,
rather than shown as a block of UNASSESSED rows.

| ID | Check | Pages | v1 |
|---|---|---|---|
| A1 | Shipping threshold/fee visible before checkout (PDP + cart) | PDP, cart | ✅ |
| A2 | Price justification near price/CTA | PDP | ✅ |
| A3 | Cart shows subtotal, shipping estimate, discount entry | cart | ✅ |
| A4 | Installments / COD visible near price or in cart | PDP, cart | ✅ |
| B1 | Risk reversal (returns/guarantee/COD) near CTA, not contradicted by policy page | PDP | ✅ |
| B2 | Safety / side-effect reassurance | PDP | ⏸ review-only. Applicable to health/beauty only; never generates claims |
| B3 | Time/effort reassurance vs. reviews | PDP | ⏸ needs review text; off in v1 |
| B4 | Size/fit/variant clarity (pills, size guide near selector) | PDP | ✅ when the product has size variants, otherwise not applicable |
| B5 | Stock + delivery-time reassurance near CTA | PDP | ✅ |
| C1 | Social proof above the fold | home, PDP | ✅ |
| C2 | Evidence for bold claims | home, PDP | ⏸ review-only |
| C3 | Review provenance (verified, photos, platform) | PDP | ✅ |
| C4 | Trust seals / press logos verifiable | home | ✅ WARN-max (we can't verify a logo's claim) |
| C5 | Brand humanity (about, team, real contact details) | home + about | ✅ |
| D1 | Reassurance micro-copy at the CTA | PDP | ✅ |
| D2 | Cart trust (payment icons, returns, clear checkout action) | cart | ✅ |
| D3 | Accessible support (chat, WhatsApp, phone + expectations) | home, PDP | ✅ |

14 rules active in v1. Each rule carries a `version` (rule set `fud-1.0.0`), stored in the result.

## 5. Status, confidence, and the gate

The judge returns, per rule: `status`, `confidence` (0–1), the `blockIds` it relied on, the two
voices (`technical` / `business`, same as `CategoryFinding`), a `recommendation`, an optional
`exampleCopy` (EN + AR) and `pexti` factor suggestions.

`score.ts` then applies deterministic gates. **The judge proposes, code decides:**

1. A rule whose required page didn't load → **UNASSESSED** (reason: `page_unavailable`).
2. A rule not applicable to this store (B4 with no size variants) → excluded entirely.
3. **FAIL** is kept only if `confidence ≥ 0.85` **and** `signals.ts` agrees the thing is absent
   (no regex hit, no widget). Otherwise it is downgraded to **WARN**. This is the main protection
   against "you have no guarantee" claims on stores that do have one.
4. **PASS** needs at least one cited `blockId` that exists in the evidence pack and confidence
   ≥ 0.7. A PASS citing nothing, or a shaky one, is downgraded to WARN.
   **As built:** on live runs every FAIL also ships as WARN until `FUD_ALLOW_FAIL=true` (test runs
   always show real FAILs).
5. C4 can never be worse than WARN; B2/C2 (if enabled later) are always marked `needsReview`.

**As built — crops are per region, not per block:** the collector takes three fixed crops per
page while the browser is open (first screen, the area around the button, the cart) and each
rule names the region it is about. Cropping the exact cited block would need the browser kept
open through the multi-minute judge call. The same crop is shown once per report, on the
highest-priority finding that uses it, capped at 6.

## 6. Scoring

Separate from the 50-point score. Never added to it.

```
friction score = round(100 × (PASS + 0.5 × WARN) / assessed)
coverage       = assessed / applicable
```

- Shown as a sentence, not a gauge (`PRODUCT.md`: no hero score dials):
  *"Buyer confidence 64/100 — 11 of 13 checks assessed…"*
- **As built:** the score is called **Buyer confidence** (higher is better). A number under the
  heading "Purchase friction" read backwards — 80/100 friction sounds bad. The section keeps the
  title "Purchase friction".
- If coverage < 60% or fewer than 5 rules were assessed, **no score is shown**, only the findings.

## 7. PEXTI

Formula from the PRD:

```
S     = P + 0.8E + 0.6C + 0.6T + I        (each factor 1–5)
PEXTI = round(100 × (S − 4) / 16)
```

Where each factor comes from. Mostly deterministic, so the ranking can't drift between runs:

| Factor | Source |
|---|---|
| **P** Proof | 2 = judge only · 3 = judge + `signals.ts` agree · 4 = + GA4 funnel shows a drop at that step (e.g. cart→checkout for A1/A3/D2, view_item→add_to_cart for B1/B4/D1) |
| **E** Ease, **C** Cost, **T** Time | Static defaults per rule in `rules.ts` (e.g. A1 "add a shipping bar to the cart" = E4 C4 T5). The judge may lower them by 1 with a reason, never raise them. |
| **I** Impact | Rule default, +1 when GA4 shows the related funnel step below benchmark (uses `ga4Metrics.funnel`; nothing new to fetch) |

PASS findings get `pexti: null`. Bands: ≥75 Quick win · 50–74 Dev task · <50 Test first.

The GA4 tie-in is the triangulation from the blueprint deck: where the funnel leaks (GA4), why
(FUD finding), what's broken (evidence crop), all in one row.

## 8. Types

Additive only. `AuditResult` and `JobProgress` get one optional field each, so old results and old
reports render unchanged.

```ts
// types.ts
export type FudStatus = "pass" | "warn" | "fail" | "unassessed";

export interface FudFinding {
  ruleId: string;               // "A1"
  ruleVersion: string;          // "fud-1.0.0"
  pageUrl: string;
  status: FudStatus;
  unassessedReason?: string;
  confidence: number;
  technical: FindingVoice;
  business: FindingVoice;
  recommendation?: string;
  exampleCopy?: { en: string; ar: string };
  evidence: { blockIds: string[]; crop?: string };
  pexti: { score: number; P: number; E: number; C: number; T: number; I: number } | null;
  needsReview?: boolean;
  ar?: { technical: FindingVoice; business: FindingVoice; recommendation?: string };
}

export interface FudResult {
  ruleSetVersion: string;
  pagesSampled: Array<{ url: string; pageType: PageType; loaded: boolean }>;
  score: number | null;          // null when coverage is too low
  assessed: number;
  applicable: number;
  findings: FudFinding[];
}

// JobProgress
fud?: FudResult | { error: string };
// AuditResult
fud?: FudResult | null;
```

## 9. Translation

**As built:** the judge writes English and Arabic in the same call (`ar` on each finding, plus
`exampleCopy.en` / `.ar`). The FUD pass does **not** go through `translate-ar.ts`. That stage now
retries the whole request when findings are missing their Arabic (commit `0dfdd25`), and the
friction pass must never be able to trigger a retry or a failure of the main audit. A finding
that comes back without Arabic falls back to its English text, per row, like the 50 checks do.

## 10. Report (`html-report.ts`)

Current section order in `renderReport` (`html-report.ts:2595`):
overview → fix-first → screens → numbers → checks → speed → sources.

After:
overview → fix-first → screens → numbers → **friction** → checks → speed → sources.

- **New section `id="friction"`, "Purchase friction"**, placed after `#numbers` (the GA4 funnel) and
  before `#checks`, so the funnel drop and the doubts that explain it sit next to each other.
- Added to `tocHtml`, `jumpBarHtml` and `guideHtml` the same way `numbers` is: only when present.
- **`summaryHtml`** gains one line in `facts` ("Purchase friction 64/100"), only when a score
  exists. The headline, lead sentence and critical alert stay driven by the 50 checks.
- Section content:
  1. Opening sentence with score + coverage (§6) and which pages were scanned.
  2. **Up to 3 quick wins** (PEXTI ≥ 75), each with its evidence crop, the GA4 funnel figure when
     one applies, and example copy in EN + AR.
  3. Remaining WARN/FAIL rows using the **existing `checkRowHtml`-style row** (same summary/detail
     toggle, business/technical switch, EN/AR), sorted by PEXTI, labelled Quick win / Dev task /
     Test first instead of critical / medium / low. Status shows Warning as well as Pass/Fail.
  4. PASS rows collapsed under "What's already working".
- `#fix-first` stays tracking-only in v1. Mixing both lists is a v2 decision once we trust the
  friction findings.
- Section absent when `result.fud` is null/undefined or has no assessed findings, and then the
  report is identical to today's.
- `#sources` lists the sampled pages and the rule-set version.

Mock of the section:

```
Purchase friction
64/100 — 11 of 13 checks assessed on your home, product and cart pages (mobile).

What to fix first
 1. Shipping cost is hidden until checkout                  Quick win
    [cropped screenshot of the cart drawer]
    Free shipping over 500 EGP appears on the product page but not in the cart,
    so shoppers first see the shipping fee at checkout. Your GA4 shows 68% of
    carts never reach checkout.
    Suggested copy:  "Add 120 EGP more for free shipping"
                     "أضف ١٢٠ ج.م للحصول على شحن مجاني"
 2. No return or cash-on-delivery note under Add to Cart    Quick win
 3. No size guide next to the size selector                 Quick win

Other things to improve
 ▸ Reviews have no photos or "verified buyer" marks         Warning
 ▸ No WhatsApp or chat on the product page                  Warning

What's already working   (collapsed)
 ▸ Installments (Tabby) shown under the price
 ▸ Star rating visible above the fold
```

## 11. Review flow

v1 reuses the existing approve-the-whole-report link. Before approving, the reviewer sees the
friction section in the report like everything else, and any FUD FAIL is badged in the **internal
review email** so it gets a deliberate look.

Per-finding overrides with reason codes (PRD §12, story 3) are v2. They need a small `report/edit`
extension and an `audit_fud_overrides` table for calibration data.

**Test-mode caveat:** test runs skip review and email the report straight away, so in rollout phase 1
the pass runs **only** on test runs, and those go to us.

## 12. Switch and rollout

```
FUD_PASS=off | test | all      (default off)
```

| Phase | Setting | Exit criteria |
|---|---|---|
| 1 | `test` | 15–20 real client stores run through test mode (EG + GCC, Shopify + Woo + custom). Every finding hand-checked. FAIL precision ≥ 90%, no rule above 1-in-10 false FAILs. |
| 2 | `all`, FAIL shown as WARN in the client report | 2 weeks of live audits with no reviewer corrections on FAIL-worthy items |
| 3 | `all`, gate from §5 active | Add the collection page, then desktop |

A rule that misses the bar in phase 1 stays WARN-only (`rules.ts: autoFail: false`) rather than
holding up the others.

## 13. Budget and failure isolation

| Concern | Budget / behaviour |
|---|---|
| Collector | ~30–60 s (3 pages, mobile). Per-page timeout 25 s; a timed-out page is UNASSESSED. |
| Judge | One `claude -p`, no MCP servers, 6-min hard timeout, text-only input ≤ ~40k chars. |
| Total added | Target ≤ 5 min per audit. Logged under `fud-collect` / `fud-judge` in `run-metrics.ts`. |
| Rate limit during judge | Store `{ error: "rate_limited" }` and ship without the section. It must **not** bounce the whole row back to pending the way the main audit does. |
| Any exception | Caught in `runFudPass`, stored as `{ error }`, logged. Stages 2–4 continue unchanged. |
| Report size | Crops capped at ~6 per report, ~40 KB each. |

## 14. Testing

- `score.ts`: unit tests for the gate (§5), compliance/coverage and PEXTI maths, including null and
  low-coverage paths.
- `signals.ts`: fixture strings in EN + AR (Arabic-Indic digits, each currency) for every regex.
- `collect.ts` + `judge.ts`: run against saved HTML fixtures of 5–6 known stores (follow the
  `_regen-*.ts` / `test-run.ts` pattern).
- Add-to-Cart: against a test store with GA4 DebugView open, confirm zero `add_to_cart` /
  `view_item` hits arrive from the collector, and that the cart drawer is still captured.
- Regression: an existing audit with `FUD_PASS=off` must produce a byte-identical report to today's.
  An old saved result with no `fud` field must still render.

## 15. Open decisions

1. ~~Allow the Add-to-Cart click on client stores?~~ **Decided 2026-10-13: yes**, with the
   guardrails in §3.2.1.
2. Should FUD quick wins appear in the client email's summary sentence, or only inside the report?
3. Does the friction score go in the internal daily digest?
4. Who hand-labels the phase-1 stores, and where do those labels live (a sheet is fine for v1)?
5. B2/C2 (health and claims): keep them off permanently for the free audit, or enable them as
   review-only for paid audits later?

## 16. Out of scope for v1

Category E, desktop viewport, checkout steps, review-platform/replay connectors, per-finding
overrides, weighted scoring, merging friction items into `#fix-first`, and any change to the
existing 50-check audit.

## 17. Side note found while drafting

`BACKLOG.md` says `pagespeed.ts` was removed on 2026-09-09, but `poll.ts:141` still calls
`runPageSpeed` and the file is still in the branch. One## 18. Build notes and what is still open

### What was added after the first build (same day)

- **Cart drawer.** The first build missed tharaa.shop's drawer (`#t4s-mini_cart`) and silently used
  the cart page instead. Drawers are now found two ways: by known names, and generically as any large
  fixed panel that appears after the click and reads like a cart. Verified on tharaa.shop.
- **Analytics leak audit.** Every request that looks like analytics and was *not* blocked is recorded
  (`StoreEvidence.leakedHits`) and logged. On tharaa.shop it found two trackers the first blocklist
  missed (Google Ads audience pings, Clarity's sync pixel); both are now blocked, along with Shopify's
  own analytics (monorail), server-side GA4 endpoints and other common pixels. Current run: ~200–300
  hits blocked, 0 not blocked.
- **Collection page** (was v1.5): rules C6 (cards show price and rating), D4 (filter/sort/pills,
  only for 12+ products) and D5 (quick-add labels consistent), from card counts taken in the browser.
- **Desktop.** Home and product are also visited at 1440px. The judge still reads the phone visit;
  for layout-dependent rules the detectors compare the two and the report adds one line ("On desktop:
  the same gap" / "mainly a phone problem"). Detector-based, labelled as such in the types.
- **Reviewer overrides:** `npm run fud-override` (status change or hide, original status kept,
  score recomputed, report republished).
- **Client email:** up to two quick wins, taken from the saved result so overrides are respected.
- **Calibration tooling:** `npm run fud-calibrate` writes a labelling sheet and `--score` reports
  precision per rule.
- **Judge JSON:** a quote-repair step runs before the single retry.
- **Gate change:** a judge PASS the gate will not accept is no longer turned into a WARN. That put
  good-news text under a "needs work" label. It now stays a PASS only when the detectors agree,
  otherwise it is "not confirmed" and left out of the score and the issue list.
- **Queue stage** is `runFrictionStage()` in `fud/index.ts`, unit-tested for gating, run-once,
  error storage and the live/test FAIL policy. `poll.ts` only calls it.

### Still open

- **Calibration is not done.** The tooling exists; the hand-labelling of 15–20 stores is human work
  and has not happened. Until `--score` shows 90%+ FAIL precision, keep `FUD_ALLOW_FAIL=false`.
- **Judge variance.** The same evidence judged twice gave D1 as WARN once and PASS once (B1 and D1
  overlap on "reassurance by the button"). Watch for this while labelling; merging the two rules is
  an option.
- **A real queued audit** through `poll.ts` with `FUD_PASS=test` has not been run end to end
  (it costs a full 20-minute audit and sends an email). Steps are in the README; the stage itself is
  unit-tested.
- **GA4 side.** The leak audit proves nothing analytics-shaped left the browser un-blocked. Nobody
  has yet opened GA4 Realtime/DebugView during a run to confirm it from Google's side.
- **Desktop findings are detector-only.** No desktop crops and no separate desktop verdicts.
- **Checkout steps** remain out of scope, as do review-platform and replay connectors (category E).
- §15 questions 3 and 5 (daily digest, health/claims rules) are still undecided.

## 19. Rule set fud-2.0.0: the wider CRO review (2026-10-13)

Added on top of the trust/cost rules, from the CRO framework the audit is based on:

| Group | Rules | Measured by |
|---|---|---|
| Homepage | H1 3-second clarity, H2 one clear next step | first-screen text, buttons, hero image (stock-photo flag) |
| Product page | P1 photos/video/zoom, P2 option buttons, P3 sticky buy button, P4 organised details | image count, variant control, a scroll test, expandable sections |
| Navigation | N1 short, specific menu; N2 search visible and working | desktop menu labels; a live search for a word from the product name |
| Order value | M1 bundles/quantity offers, M2 add-ons on product page and in cart, M3 free-shipping threshold vs average order value | text detectors; threshold parsed from the page, AOV from GA4 |
| Repeat purchases | R1 signup with a reason, R2 loyalty/subscription/account | form fields, popups, text detectors |
| Local market | L1 Arabic, right-to-left, natural; L2 local payments and delivery coverage | lang/dir/hreflang, text detectors |
| Popups | U1 nothing blocking the first visit | overlays measured before and after Escape |

All of these are opportunity rules (`autoFail: false`) except H2, P3 and N2. 31 rules in total; the
judge runs them in two batches of about 16 so the bilingual answer stays short enough to be reliable.
The report section is now titled "Conversion review" and the score "Conversion score".

**Where the money is** (`fud/insights.ts`): built from the GA4 reports the OAuth callback already
fetched (a `deviceCategory` report was added to `api/_lib/google-oauth.js` for conversion by device),
falling back to the audit's GA4 summary. Revenue range = closing 25-50% of the gap to step benchmarks,
capped at 30% of current revenue. A step far below its benchmark is reported as a probable tracking
gap, not money. A healthy funnel gets a "no broken step" line instead of an invented figure.

First full run (tharaa.shop with its own GA4 data): 31/31 checks assessed, conversion score 79, 364
analytics hits blocked and 0 not blocked. Run time added per audit: roughly 6-8 minutes.

A competitor benchmark (same checks on a store the visitor names, shown as "You vs them") was built
and then removed on 2026-10-13 at the owner's request.
