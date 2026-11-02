# Report rounds log

One entry per round of improvements to the audit report (`src/html-report.ts`),
newest first. Each round: who it's for, what it yielded, the full change list,
how to check it, and the decision. Branch: `omar/10-rounds`.

Status key: 🟡 staged, waiting for review · ✅ approved · ⏪ reverted

Rounds build on each other: each one starts from the previous round's code.
When a later round replaces part of an earlier one, the earlier entry says so
under **Changed later**, so each entry still matches what's live.

### Outside the rounds (same branch, same session)
- **Dependencies:** `npm install` at the repo root on 2026-11-01. `gsap` was in
  `package.json` but missing from `node_modules` on this branch, so `npm run
  build` failed before any round. No tracked file changed.
- **Pre-existing test failures:** 29 of the API tests in `tests/api`
  (audit-request and contact handlers) fail with or without these rounds.
  Not investigated.
- **Review tooling (not in the repo):** the before/after screenshots
  (`shot2.mjs`, `shot3.mjs`), section dumps (`sections.mjs`) and the duplicate
  audit (`dupes.mjs`, `dupes2.mjs`) live in the session scratchpad, with each
  round's patch (`round1-icp2-full.patch` … `round4-icp2.patch`). The "after"
  pages are `output/roundN-icp2-after.html`; `output/` is gitignored.
- **Not tested on a live run:** re-rendering a real buyer run from Supabase
  was blocked as a production read. Tested on the preview fixture
  (`npm run preview-report -- --path=tracking --fud --clarity --site --role=media_buyer --no-ar`)
  and the saved real Tharaa report.

---

## Round 12 — Media buyer (ICP2): visualize, breathe, carousels, margins, short sentences

**Status:** 🟡 staged, waiting for review. Builds on rounds 1–11.
**Reader:** ICP2, media buyer for the layout and visuals. The short-sentence
rule (5) also reaches every reader: shared checklist defaults and the AI prompts.
**Files:** `src/html-report.ts`, `src/buyer-verify.ts`, `src/checklist.ts`,
`src/audit-prompt.ts`, `src/translate-ar.ts`, `src/fud/judge.ts`.

### The brief (the user's five points)
1. Visualize what can be visualized. 2. Room to breathe. 3. Group relevant
points in carousels. 4. Decrease horizontal margins. 5. Short, clear, direct
sentences with a simple structure, everywhere (not just intros).

### Full change list
1. **Visualize:**
   - Page speed: the gauge cards became one bar chart. Each page shows a phone
     bar and a desktop bar on a 0–100 track tinted slow / okay / fast, slowest
     phone page first, with a legend (`speedBarsHtml`).
   - Clarity: the text list became stat tiles. Each tile has a big number,
     what it counts and one line on what it means; red edge plus "Worth a look"
     when flagged (`buyerClarityHtml`).
   - "What's holding your ROAS back": ROAS = CVR × AOV ÷ CPC drawn as tiles
     with the store's numbers (1.5%, EGP 1,100). It marks which parts the site
     owns and which part the ads own (`roasEquationHtml`).
   - Phone visit: the three facts (Add to Cart, WhatsApp, sold-out) became
     tiles with a coloured edge.
2. **Carousels** (`carouselHtml` + `CAROUSEL_SCRIPT`): each "After the click"
   stage and "Already working" is one swipeable row of full problem cards
   (all open, next card peeks in). The row has a counter ("1 / 3") and
   previous/next buttons. The Clarity tiles and phone-visit tiles swipe on
   phones and turn into a grid on 768px and up. Works in RTL (arrows mirror,
   the row starts on the right). Keyboard: the row is focusable, buttons have
   EN/AR labels. Print shows every card.
3. **Breathe** (buyer only, via `body.is-buyer`): sections 56 → 80px apart
   (56 on phones), lanes 44 → 72px, stage groups 32 → 64px, cards 12 → 16px
   apart, leads at line-height 1.65.
4. **Margins** (buyer only): page width 1200 → 1280px, gutter 24 → 20px a
   side, contents-to-text gap 72 → 48px, text column 780 → 960px (paragraphs
   keep their ~65-character line). Phones: 16 → 12px a side, tighter card
   padding.
5. **Short sentences:**
   - Report wording: 33 sentences rewritten, EN and Egyptian AR (headline,
     leads, phone visit, break-even, CTA, method, sources, "moved up" notes).
   - "Check it yourself" steps (`buyer-verify.ts`): all 22 rewritten as one
     action or one expectation per sentence.
   - Checklist defaults (`checklist.ts`): 44 `action` / `doneWhen` / `pass`
     texts split into short sentences, same meaning. `fires` was left alone
     because the audit prompt judges with it.
   - AI text in real runs: the audit prompt, the Arabic translation prompt and
     the friction judge now require one idea per sentence, about 14 words or
     fewer (split over 20), no semicolons, no clauses chained with "which" or
     "because".
   - Measured on the preview: flagged sentences **223 → 144**; report wording
     **43 → 15**. The 15 left are lists, money ranges, the address and "which"
     used as a question. The 129 left in finding text are preview sample data,
     plus `checklist-persona-data.ts`. That file is generated from
     `icp/research/selected/*.jsonl`, which isn't in the repo, so it wasn't
     hand-edited.
7. **Carousel redesign (asked after review: "extremely badly designed"):** the first version showed half-cut neighbour cards on both sides, a counter and arrows detached from the cards with no hint of what the other slides were, and every slide as tall as the tallest card. Now each problem group is one panel: a row of tabs on top (one per problem, status dot + the rule's short title, e.g. "Size help next to the size choice"), one full-width card at a time, and a footer attached to the panel (← progress segments · "2 of 3" · →). The panel takes the height of the card on show and resizes when it opens a detail. Swipe, tab clicks, arrow keys / Home / End on the tabs, and RTL all work. The small tiles (Clarity, phone visit) are plain grids now, 2 columns on phones for Clarity. Bug found in testing: `scroll-snap-stop: always` made a jump from card 3 to card 1 stop on card 2; removed.
6. **Bug caught in testing:** the wider desktop grid first overrode the phone
   one-column layout and squeezed the report into 184px on phones. Now
   scoped to 1024px and up.

### How to check it
`http://localhost:5173/audit-reports/local/round12-icp2-after.html` (before:
`round12-icp2-before.html`). Swipe "After the click" on a phone; switch to
عربي; look at Page speed, Clarity and the ROAS tiles.

### Verification
- `tsc --noEmit` clean; worker tests 104/104.
- Headless, desktop and phone, EN and AR: every carousel steps 1 → last and
  disables Next at the end; no page errors; no sideways scroll; text column
  is the full 366px on a 390px phone.
- Store owner report: same section order. It doesn't get the buyer class,
  carousels or carousel script; only the shared CSS is present.
- Sentence audit script: `sentences.mjs` (scratchpad).

### Known limits
- AI-written finding text follows the new rule only on new runs; saved
  reports keep their old wording.
- The generated persona checklist still has long defaults (source file not
  in the repo).
- Problem cards in a carousel are all open, so the row is as tall as its
  tallest card.

---

## Round 11 — Media buyer (ICP2): the whole report, ordered by what the buyer wants first

**Status:** ✅ approved 2026-11-01 (by moving on to round 12), staged, not committed. Builds on rounds 1–10.
**Reader:** ICP2, media buyer only. Store owner and marketing manager orders checked unchanged.
**Files:** `src/html-report.ts` only.

### The wow-factor scores
Each block was scored 1–10 on what a media buyer wants to see first: is it
about *their* money or *their* ads, is it surprising, can they act on it today.

| Block | Wow | Why | Was | Now |
|---|---|---|---|---|
| Summary: verdict, click to cash, scoreboard | 10 | Answers "ads or site?" with their own funnel in one screen | 1 | 1 |
| Is the number real? (+ bias meter, phone visit, pixel map) | 9.5 | "Your ROAS is probably wrong" is the biggest surprise; the pixel map is proof | 2 (inside a 5,300px section) | 2 |
| Can the algorithm learn? + tracking fixes for the developer | 6.5 | Real but slower-burning; the dev pack copies both tracking lanes | 2 (same section) | 2 (same section, ends it) |
| Break-even ROAS | 9 | Their money, interactive; scoreboard row 5 points here | 3, after ~6 screens of fixes | 3, right after the count |
| What's holding your ROAS back (ROAS = CVR × AOV ÷ CPC, site leaks, owner handover) | 8 | The site's share of ROAS, with money estimates | 2 (end of the long section) | 4, its own section |
| After the click (your ad, buy button, cart) | 7.5 | "Your ad, as you told us" is personal | 5 | 5 |
| Clarity (55.8% open in the FB/IG/TikTok app, errors, bots) | 7.5 | In-app browsing is a buyer-only surprise | 7 | 6 |
| Page speed | 6 | Row 1 of click to cash already shows the score; this is the detail | 6 | 7 |
| Your numbers (visits, revenue) | 2 | Two totals, no verdict; duplicated the ledger's context | 4 | **removed**: both totals now in the ledger subtitle |
| All checks map, GA4, GTM | 3–3.5 | Reference: passed checks and the rest | 8–10 | 8–10 |
| How it works, Data sources | 1.5–2.5 | Trust footnotes | 11–12 | 11–12 |
| Book a call band | 5 | Our ask; after the content, unchanged | end | end |

**Decision:** keep the overall shape (verdict → detail → reference); it was
right. Change three things: split the 5,300px "What's holding your ROAS back"
into the count (before break-even) and the site (after it), drop the numbers
section, and swap Clarity ahead of speed.

### Full change list
1. `mediaBuyerFirstHtml` now holds only the count: new h2 "Can you trust the
   numbers?" / «تقدر تثق في الأرقام؟» with a plain lead, lanes 1–2, the phone
   visit and the developer pack. Section height 5,284 → 3,530px.
2. New `buyerSiteHtml` (`#roas-leaks`): "What's holding your ROAS back" with
   the ROAS formula lead, lane 3 and "Send this to the store owner". Lane
   rendering moved to a shared `buyerLaneHtml`. Lane numbers 1/2/3 still match
   the scoreboard rows.
3. Order: summary → count → break-even → ROAS/site → after the click →
   Clarity → speed → all checks → GA4 → GTM → how it works → sources.
4. Navigation follows it: contents list, phone jump bar (Clarity added) and
   the guide stops ("Count: 9 to fix", "Site: 8 leaks", Clarity).
5. "Numbers" section removed for the buyer; the ledger subtitle reads
   "Your store, last 28 days: 20,000 visits, EGP 330K in sales."
6. "Moved up" notes in GA4/GTM link to whichever section(s) hold the moved
   problems; the "All checks" intro names both.
7. **Bug fix (round 8):** the "Next: see what we found on your cart" link
   pointed at `#ga4-followup`, which the buyer no longer has. It now goes to
   `#friction` for the buyer.

8. **Follow-up (asked after review):** the desktop and phone mockups of the store now sit right under the headline, before "From click to cash" (they had sat between the ledger and the scoreboard). They only show when the run has screenshots: the plain preview has none, so check with `--shots=<url>` (`round11-icp2-shots.html`, tharaa.shop).
9. **Follow-up:** the phone section bar is one row that scrolls sideways, with a fade at the far end. It had wrapped to 4 rows (about 200px, a third of a phone screen); now 61px. The wrap was added earlier for RTL scrolling; checked headless: the last chip is reachable in EN and AR, the current section chip stays in view, and the page doesn't scroll sideways.

### How to check it
`http://localhost:5173/audit-reports/local/round11-icp2-after.html` (before:
`round11-icp2-before.html`). Scroll the contents list top to bottom; tap each
scoreboard row; switch to عربي on a phone width.

### Verification
- `tsc --noEmit` clean; worker tests 104/104.
- Headless: no page errors; every `#` link on the page has a target (was 1
  broken); contents list, jump bar and guide stops are in the page order.
- Store owner and marketing manager section orders are the same as before.
- Shots: `shots/branch/r11-{before,after}-*.jpg`.

### Known limits
- Lane 3 now sits two sections after lanes 1–2; the numbers still match the
  scoreboard, so the gap reads as intended, but it's a judgement call.
- Wow scores are judgement from the ICP2 card, not tested with buyers.

---

## Round 10 — Media buyer (ICP2): "From click to cash" as one ledger

**Status:** ✅ approved 2026-11-01 (by moving on to round 11), staged, not committed. Builds on rounds 1–9.

**Changed later:**
- Round 11: the ledger subtitle also carries GA4 visits and sales (the buyer lost the "numbers" section).
**Reader:** ICP2, media buyer.
**Files:** `src/html-report.ts` only.

### What it yielded
The user's verdict on round 5's pipeline: "extremely useful but insanely
unorganized". The cause: three zones in three different shapes (a card, a
horizontal funnel strip with rates sitting *between* steps, two cards side by
side), so the eye had no fixed place to find a number, its meaning or its
verdict. Now every step is one row with the same five columns, read top to
bottom in order:

| # | Step | Number | What it means | Status |
|---|---|---|---|---|
| 1 | Page loads on a phone | 35 / 100 | Google speed score. Product page, your slowest page. | Slow |
| 2 | Product views | 15,000 | Visits that opened a product. | Start |
| 3 | Add to cart | 1,200 | 8% of product viewers · normal 8% | OK |
| 4 | Checkout | 492 | 41% of carts · normal 50% | Leak |
| 5 | Purchase | 369 | 75% of checkouts · normal 50% | OK |
| 6 | Sales counted in Ads Manager | Not right | 3 count extra sales / 4 miss real sales / 2 make ads learn less | Problem |
| 7 | Turns into cash | 81% (live from Break-even) | of orders turn into cash, at the COD rates in Break-even ↓ | Check |

### Full change list
1. **`clickToCashHtml` rewritten** as an ordered list (`.pl`), one `Row` shape:
   label, value, meaning, status word, optional link, funnel bar, leak flag.
   - Thin zone labels ("The click / The site / The count") are separators,
     not boxes.
   - Each conversion rate now sits on the step it leads to ("41% of carts"),
     not floating between two steps.
   - Funnel rows get a small bar (scaled by `count^0.35` so 369 of 15,000
     still shows).
   - A red row has a red edge, tint, number and status pill: never colour alone.
   - New footer: "Biggest leak: Checkout. See why ↓" (links `#friction`).
   - Column header row on desktop; on phones the row stacks
     (number + status on one line, then the value, then the meaning).
   - Arabic: every label, meaning and status in Egyptian Arabic; percentages
     wrapped `dir="ltr"` so "8%" doesn't flip to "%8".
2. **Break-even link kept:** the row is still `#pz-cash`; the calculator now
   writes `.pl-cash` / `.pl-cash-note` instead of `.pz-big` / `.pz-s`.
3. **Motion (`BUYER_MOTION`):** rows and zone labels rise in turn; count-ups
   unchanged (`data-n`); the money dot now runs down the rail through the step
   numbers (`.pl::before`), passing behind each number badge, and drops red
   beads at rows marked `data-leak` (slow speed, a below-normal step). Drops
   fall outward on the rail's side in both EN and AR. The catch-all reset
   lists the new selectors.
4. **CSS:** removed `.pipe-zones`, `.pz*`, `.pf*`, `.b-txt-*`, `leak-flow`;
   added `.pl-*`. Kept `.pipe`, `.pipe-head`, `dx-ping`, `leak-pulse` (now on
   the status pill).

### How to check it
`http://localhost:5173/audit-reports/local/round10-icp2-after.html` (before:
`round10-icp2-before.html`), section right under the summary. Toggle عربي;
narrow the window under 768px; change the COD rates in Break-even and watch
row 7.

### Verification
- `tsc --noEmit` clean; worker tests 104/104.
- Headless, motion on, desktop and phone: no page errors (one 404 for a
  fixture image, same on the before page); no row left hidden; count-ups end
  on the exact text (35, 15,000, 1,200, 8%, 492, 41%, 369, 75%); row 7 reads
  81% from Break-even; dot and drops present; no sideways scroll.
- Screenshots EN/AR, desktop/phone: `shots/branch/r10-{before,after}-{en,ar}-{desktop,mobile}.jpg`.

### Known limits
- A store with fewer than three funnel steps gets only the rows it has (no
  "GA4 didn't give a full funnel" note any more).
- The "Biggest leak" footer names the first leak in order, not the costliest.

**Changed earlier rounds:** replaces round 5's three-zone layout and round 7's
horizontal money track (see those entries).

---

## Round 9 — Media buyer (ICP2): what the audit collects but doesn't use, and what it misses

**Status:** ✅ approved 2026-11-01 (by moving on to round 10), staged, not committed. Builds on rounds 1–8.
**Reader:** ICP2, media buyer. First round that changes the audit run itself
(the phone visit) and the report API, not only the report.
**Files:**
- `src/fud/collect.ts`, `src/fud/evidence.ts`, `src/site-checks.ts` (+ new
  `src/site-checks.test.ts`), `src/types.ts`, `src/report-rows.ts`,
  `src/html-report.ts`, `src/preview-report.ts`, `package.json` (test list)
- `api/_lib/report-data.js`, `tests/api/report-access.test.js`

### The gap audit
The ICP2 card (`icp/media-buyer-full.md`) was compared against every field
the audit collects and every field the buyer report renders.

**Collected but thrown away or not shown (fixed this round):**
| Data | Where it was | What the card says buyers need | Now |
|---|---|---|---|
| Every GA4 / Meta / TikTok / Snap hit fired while each page loaded (up to 400, with event names) | Captured in `collect.ts` during the phone visit; all but the Add to Cart slice discarded | §8 #2, #14 and §14: which pixels fire where, duplicates, two pixel setups | **Pixel map** per page and platform, with flags |
| The Meta pixel ID and GA4 measurement ID on each hit | In the hit URL, never read | §14 "multiple pixels / duplicate containers → double counting" | Read; more than one ID is flagged |
| The ad headline/offer and coupon the buyer typed on the form | Stored in `audit_requests.ad_context`; given to the AI's prompt only | §9.7 "landing-page / campaign fit", §6.1 message match | Shown back: "Your ad, as you told us" |
| Clarity page errors | Collected; shown to the owner, not the buyer | §7.4 "Events don't fire… can't find the cause" | Shown: "an error can stop the pixel or the checkout" |

**Missing: not collected at all (for later rounds):**
| Need (card) | Why it matters | What it would take |
|---|---|---|
| Store orders vs GA4/Ads purchases (§7.4 #2, playbook §7 #11) | The #1 buyer pain: "Meta says 20, the store says 45" | A form question ("orders last 28 days?") or store API access |
| Server events / CAPI and Event Match Quality (§8 #11, #12) | 2026's main lever under Andromeda | Events Manager access; can't be seen from the browser |
| Checkout inside the FB / IG / TikTok in-app browser (§12) | 55.8% of visits in the sample open there | A second phone pass with an in-app user agent |
| The coupon actually working in the cart | A coupon in the ad that fails kills the sale | Type it into the cart during the visit |
| Each top campaign's landing page visited (§9.7) | Ads land there, not on the top product | Pass `focus.campaignLandingUrl` to the phone visit |
| COD order confirmation (§10, §12) | Refusals hide the real ROAS | Not visible from outside; ask on the form |
| Click-to-WhatsApp `ctwa_clid` (§8 #15) | WhatsApp orders invisible to ads | Not visible from outside |

### Full change list
1. **Audit run (`collect.ts`):**
   - Each hit is tagged with the page being loaded (home, collection,
     product), only during page loads: not during taps, the cart, search or
     the desktop pass.
   - `hitEvents` reads the GA4 `tid=` and the Meta pixel `id=`.
   - The evidence now carries `pageHits`.
2. **Bug fix (older than this branch):** a Meta event name kept a trailing
   line break when `ev=` was the last parameter ("PageView\n"). Found by the
   new test.
3. **`site-checks.ts`:**
   - New `pixelMapFrom()`: per page and platform, how many times each event
     fired on one load, plus the IDs seen. Stored as `siteChecks.pixelMap`.
   - The AI's prompt also gets it, so the GTM checks can quote it.
4. **Report, "What our phone visit saw":** new table "What each pixel sent
   while the page loaded". Flags in red:
   - an event sent twice on one load (e.g. Meta PageView ×2);
   - a product page with no product-view event on a platform the store uses
     (e.g. TikTok "no ViewContent");
   - more than one Meta pixel or GA4 ID.

   On phones each cell carries its platform name.
5. **Report, "After the click":** "Your ad, as you told us". It shows the
   headline, the coupon, a plain line on checking that the first screen and
   cart match the ad, and a link to the message-match check (MB-CRO-02) when
   the run has it.
6. **Report, Clarity:** the page-error line for the buyer.
7. **Plumbing for the ad:**
   - `AuditResult.adContext`, filled by `auditResultFrom` (worker) and
     `fromRows` (report page). Left out when empty, like the other optional
     fields.
   - `api/_lib/report-data.js` now selects `ad_context` from the request.
8. **Tests:**
   - New `site-checks.test.ts`: IDs read off hits, the map's grouping and
     repeat counts, null when nothing fired.
   - `report-access.test.js`: the request fixture now carries an ad, and the
     test checks it reaches the report page.
9. Dev only: the `--site` preview sample includes a pixel map and an ad.

### How to check it
`http://localhost:5173/audit-reports/local/round9-icp2-after.html` (before:
`round9-icp2-before.html`):
1. "What holds ROAS back" → "What our phone visit saw" → the new pixel table
   and its three red flags.
2. "After the click": "Your ad, as you told us" at the top.
3. Clarity: the page-error line.
4. عربي and phone width: the pixel table stacks, with platform names.

### Verification done
- Worker: types pass, 104/104 tests (3 new).
- API tests: 137 pass / 29 fail, the same 29 failures as before this branch;
  the changed test passes.
- Site build passes.
- Store owner, marketing manager and agency show none of the new parts.

### Known limits
- **Live runs:** the pixel map fills only on audits run after this change.
  Older reports don't show the table. Not yet tested on a live store visit;
  the unit tests cover the logic, and the next real audit will show it.
- **Pixels that send nothing:** they aren't listed (we see what fires, not
  what's installed). The table says so.
- **The "Missing" table:** needs form, access or audit-run decisions, so it's
  left for later rounds.

### Decision
✅ Approved 2026-11-01 (by moving on to round 10). Not committed yet.

---

## Round 8 — Media buyer (ICP2): the CRO section, made relevant to a media buyer

**Status:** ✅ approved 2026-11-01 (by moving on to round 9), staged, not committed. Builds on rounds 1–7.
**Reader:** ICP2, media buyer only. Other readers verified unchanged.
**Files:** `src/html-report.ts`.

**Changed later:**
- Round 10: the money dot runs down the ledger rail (`.pl`) instead of the horizontal track (`.pf::after`); drops at rows marked `data-leak`. Count-ups, scoreboard ping and bias meter unchanged.

### The question
Does "After the click" (the conversion review) give a media buyer relevant
and interesting points?

### What the audit found
- **Same rules for everyone.** The conversion review runs the same 33 rules
  (`src/fud/rules.ts`, `rules-cro.ts`) for every reader. Only the wording
  is per reader: the judge already writes the buyer's version in ROAS / CAC /
  paid-traffic terms (`judgeBusinessRule`, `src/audience.ts`).
- **Owner layout.** The buyer saw the findings grouped the owner's way
  (Quick win / Developer / Test first), not by where a paid visitor meets
  them.
- **One chip for every lever.** Every row had the same "ROAS ↑ · CAC ↓" chip.
  But order-value rules (M1–M3) raise ROAS at the same CAC, and retention
  rules (R1, R2) lower blended CAC over time. Those are different levers, and
  the buyer card's lever library (§10) is built on that difference.
- **Pages visited.** It visits the store's top product from GA4, not each
  campaign's landing page.

### How relevant the 33 rules are to a media buyer
| Relevance | Rules | Why |
|---|---|---|
| **High** | H1, H2, U1, L1 (first screen after the click) · A1, A3, L2 (cart cost and local payment) · A4 (COD / installments) · B1, B5, D1, P3 (at the buy button) · M1, M2, M3 (order value) | Decide whether a paid click becomes a sale, or how much it's worth |
| Medium | A2, B4, C1, C3, C4, C5, C6, D2, D3, P1, P2, P4, R1, R2 | Trust and product-page quality; retention lowers blended CAC |
| Low | N1, N2, D4, D5 | Menu, search and filters: browsing, not the ad's landing page |

**Missing for this reader (no rule checks it):**
- the ad's message against its landing page (it's in the buyer's own checklist
  points, not this pass);
- checkout inside the Facebook / Instagram / TikTok in-app browser;
- COD order confirmation (call or WhatsApp);
- a visit to each campaign's landing page.

These need changes to the audit run itself, so they're candidates for a later round.

### What changed
1. **Grouped by where the paid visitor is, in funnel order:**
   - The first screen after the click
   - Finding the product
   - At the buy button
   - In the cart
   - Bigger orders
   - Coming back

   Each stage opens with 1–2 plain sentences on why it costs paid traffic money.
   For example: "Your ad clicks land here. If people don't get it in 3 seconds,
   they leave. Meta sees that quick exit too, and it can make your clicks cost
   more."
2. **The GA4 leak sits on its stage.** The stage holding the store's weakest
   funnel step gets a red frame, "↑ Your biggest funnel leak is here" (a link
   to the funnel), and the likely cause. The separate GA4 box is gone for the
   buyer, so it isn't said twice.
3. **One chip per lever:**
   - "Fixing: CVR ↑ → ROAS ↑ · CAC ↓" (conversion)
   - "Fixing: AOV ↑ → ROAS ↑, same CAC" (order value)
   - "Fixing: repeat buyers ↑ → CAC ↓ over time" (retention)

   Effort (Quick win / Needs a developer) stays next to it.
4. **Lead:** "Ads Manager can't show you these… They're in the order a paid
   visitor meets them."
5. English and Egyptian Arabic throughout.

### How to check it
`http://localhost:5173/audit-reports/local/round8-icp2-after.html` (before:
`round8-icp2-before.html`), left menu → "After the click":
1. Stages in funnel order, each with its "why" line.
2. "In the cart" framed in red with "↑ Your biggest funnel leak is here".
   Click it.
3. Chips: CVR on most rows. On a real run, AOV and repeat-buyer chips appear
   on M1–M3 and R1–R2.
4. عربي and phone width.

### Verification done
Types pass, worker tests 101/101, site build passes. Store owner, marketing
manager and agency keep their layout (bands and GA4 box), with no stage
grouping and no lever chips.

### Known limits
- **Sample coverage:** the built-in sample has only 6 of the 33 rules, so the
  preview shows 2 stages. Real runs show up to 6.
- **Sample mismatch:** the sample's "31%" GA4 line comes from a different
  sample store than the sample funnel (41%). Real runs read the same GA4 data.
- **AI wording:** the "most likely cause" text is written by the audit's AI and
  still calls the section "Conversion review".
- **Missing checks:** the 4 buyer-critical checks above need audit-run changes,
  not report changes.

### Decision
✅ Approved 2026-11-01 (by moving on to round 9). Not committed yet.

---

## Round 7 — Media buyer (ICP2): motion — the money visibly leaks

**Status:** ✅ approved 2026-11-01 (by moving on to round 8), staged, not committed. Builds on rounds 1–6.
**Reader:** ICP2, media buyer only. Other readers verified unchanged.
**Files:** `src/html-report.ts`.

### What it yielded
The buyer report now moves with meaning:
- **The money leaks.** When "From click to cash" scrolls into view, its zones
  rise in order and every number counts up to the store's real value. A green
  dot then runs the funnel on its own track and loses **red drops exactly at
  the leak**, then loops while the diagram is on screen. Right to left in
  Arabic; down the side on phones.
- **The scrolling logo mark tells the buyer's story.** Its stops read "Ads or
  site? → 17 to fix → Break-even → 4 after the click → Phone speed 35/100 →
  26 passed → Let's fix it".
- **The scoreboard** rows slide in one by one and each verdict dot pings
  once. **The bias meter** marks drop in one per problem.
- **Break-even** numbers roll to their new value (2.88× → 2.84× on the Saudi
  preset), and the cash figure up in the diagram rolls with them.
- **The "Leak" label** pulses softly.

### Why GSAP and not Remotion
Remotion renders videos ahead of time. Each report is one page with one
store's numbers, so a video would need a server render per audit and would
add megabytes to every report. The report already ships GSAP + ScrollTrigger:
the motion is drawn live from the store's own numbers, stays sharp at any
size, and costs no extra download.

### Rules the motion follows
- It runs only when the report's motion layer is on (`js-motion`: GSAP and
  ScrollTrigger loaded, and the reader hasn't asked for reduced motion). Under
  reduced motion, in print, or if a script fails, the page is the plain
  document with every number already in place.
- It never changes what a number says, only how it arrives. Every count-up ends
  on the exact rendered text.
- If anything throws, a catch block puts every hidden start state back.
- The dot and drops never cover a number or label: they run on a separate
  "money track" (`.pf::after`).

### Full change list
1. `BUYER_MOTION` script (buyer only, after the existing motion scripts):
   - pipeline rise and count-up (`data-n` / `data-dec` / `data-suf` on the
     pipeline numbers; `rollAttrs()` writes them for percentages);
   - the money-flow loop with leak drops (paused off screen);
   - scoreboard stagger and ping;
   - bias-meter drop-in;
   - `window.__rollText` for rolling any number-in-text.
2. Break-even and the pipeline cash figure use `__rollText` when present,
   plain text otherwise.
3. The logo mark (`guideHtml`) uses `buyerGuideStops()` for the buyer; the
   markup moved to `guideMarkup()` (same output for every other reader).
4. CSS: `.pf-dot`, `.pf-drop`, the money track, `leak-pulse` and `dx-ping`
   keyframes (only under `prefers-reduced-motion: no-preference`), and none of
   it in print.

### How to check it
`http://localhost:5173/audit-reports/local/round7-icp2-after.html`. Open it
fresh (reload) so the animations start:
1. Scroll to "From click to cash": numbers count up; the green dot runs the
   bottom track; red drops fall at "Leak"; it loops.
2. On the right, the logo mark travels down the page: read its labels.
3. The scoreboard rows slide in; the dots ping.
4. Lane 1: the bias marks drop in.
5. Break-even: press Saudi. The numbers roll. Scroll up: the cash figure changed.
6. Arabic, then phone width: the flow runs right to left / down the side.
7. Turn on "reduce motion" in your OS: everything is static and complete.

### Verification done
Types pass, worker tests 101/101, site build passes, no page JS errors.
Headless run with motion on:
- count-ups end on the exact numbers;
- the dot and drops appear, then clear;
- zones and rows end at opacity 1;
- break-even rolls (2.88× mid → 2.84×) and cash follows (88%).

Store owner, marketing manager and agency: no buyer motion, their own logo
stops ("3 biggest leaks", "3 top priorities", "3 scope").

### Known limits
- The local dev server has no `favicon.ico` (a 404 that was already there
  before this round). Not part of the report.
- The motion needs the GSAP files the report already loads. If they don't
  load, the page shows everything statically, by design.

### Decision
✅ Approved 2026-11-01 (by moving on to round 8). Not committed yet.

---

## Round 6 — Media buyer (ICP2): simplification audit (plain words, labelled numbers)

**Status:** ✅ approved 2026-11-01 (by moving on to round 7), staged, not committed. Builds on rounds 1–5.
**Reader:** ICP2, media buyer. Two small display fixes reach every reader (see 6).
**Files:** `src/html-report.ts`.

### What it yielded
Every number now says what it is and whether that's good or bad. Every pointer is
a link with an arrow (↑ / ↓) to where it points. Our English copy was rewritten
in short, plain sentences, and the Egyptian Arabic was rewritten to match.
- **Reading grade** (Flesch-Kincaid, every English sentence our code writes):
  average 4.5 → **3.2**; sentences above grade 8: 17 → **8**. The 8 left are
  short labels where the formula over-scores names ("Google Analytics 4",
  dates, "Break-even ROAS").

### How the audit was done
Two scripts over the rendered page (session scratchpad):
1. `numbers.mjs` lists every visible number outside the AI-written finding text,
   with the words around it.
2. `grade.mjs` scores every English sentence our code writes.

AI-written finding text is not counted. The audit prompt writes it, not this
layout.

### Unclear numbers found (before → after)
| Where | Before | After |
|---|---|---|
| Pipeline, between steps | `8% vs 8%` | "8% go on · normal: 8%" |
| Pipeline, leak | `41% vs 50% Leak` | "41% go on · normal: 50% · Leak" (red) |
| Pipeline, click | `35/100` + "Page loads on a phone" | "Page speed on a phone (Google score) 35 / 100 · **Slow**" |
| Pipeline, count | `Off both ways` `▲ 3 · ▼ 4` `+ 2 signal gaps` | "Not right · 3 problems count extra sales · 4 problems miss real sales · 2 problems make ads learn less" |
| Pipeline, cash | "of orders become cash at these COD rates…" | "of orders turn into cash. Change the rates in Break-even ↓" |
| Scoreboard | "3 issues read too high, 4 too low" · "2 gaps in the signal" · "7 leaks after the click" · "1 place" | "3 problems count extra sales. 4 problems miss real sales." · "2 problems make your ads learn less." · "7 things lose buyers after the click." · "1 place sends visits that can't buy." |
| Bias meter (lane 1) | "Reads too high 3 / 4 Reads too low" | "Count extra sales 3 / 4 Miss real sales" |
| Phone visit | sold-out `3` | "3 products" |
| Your numbers | `330.0K` | `330K` |
| Score line | "Passed 26 of 50 checks and 2 of 6 conversion-review rules" | "26 of 50 checks passed · 2 of 6 site rules passed ↓" |

### Full change list
1. **Pipeline:** labels above, see table. A word for speed (Slow / Okay /
   Fast), a "go on" rate plus "normal:" under every gap, and the count as
   three plain lines instead of arrows.
2. **Scoreboard:** every note is a full short sentence. The "ads" row says
   "We can't see your ad account (CPM, CTR, creative). Fix rows 1 to 4 first.
   Then check Break-even." The hero lead is "Is it the ads or the site? …".
3. **ROAS section:**
   - The formula line says "cost per click", "% of visits buy" and "the
     average order is".
   - Each lane intro is rewritten in 2–3 short sentences, e.g. lane 1: "Ads
     Manager and GA4 count your sales. Here we check if that count is right.
     Too many sales: you may spend more on a losing ad…".
4. **After the click / Page speed / Break-even / Clarity / How it works:**
   - Long sentences split into short ones (speed: "Most ad clicks happen on
     phones… Under 50 is slow…").
   - The check-it-yourself is plainer, and the presets note is plainer.
   - The tracking warning reads "We found 3 tracking problems that count
     extra sales. So the ROAS in Ads Manager is probably too high."
   - Clarity says "visits", not "sessions", and drops the "Quick-backs" jargon.
   - The ranking paragraph is now "How we sorted the problems. First…".
5. **Pointers:**
   - GA4 box: "The numbers are at the top, in ↑ From click to cash".
   - "All 50 checks": "12 problems from this list are up in ↑ What's holding
     your ROAS back", and "Tap any square to jump to its check".
   - Cash node: "Break-even ↓"; score line: "↓".
6. **Every reader:**
   - `330.0K` → `330K` (the `compactMoney` decimal only when needed).
   - A space between the Clarity "Worth a look" tag and its sentence (it read
     "Worth a look55.8%" to screen readers and when copied).
7. All of the above in Egyptian Arabic, with "بيكمّلوا · الطبيعي:" in the
   pipeline.

### How to check it
`http://localhost:5173/audit-reports/local/round6-icp2-after.html` (before:
`round6-icp2-before.html`):
1. "From click to cash": read each number. Does each say what it is?
2. Scoreboard: is each line a plain sentence?
3. "What holds ROAS back": read the three lane intros.
4. Page speed, Break-even (presets note), Clarity, How it works.
5. Switch to عربي and repeat 1–2. Phone width too.

### Verification done
Types pass, worker tests 101/101, site build passes, no page JS errors.
Readability and number audits re-run (numbers above). Store owner, marketing
manager and agency get none of the buyer copy; they only get the two display
fixes in 6.

### Known limits
- AI-written finding text (titles, details, actions) is not covered. Its
  reading level is set by the audit prompt (`icp/media-buyer.md` voice rules).
  A good next step would be adding a "grade 5, short sentences" rule there.
- ROAS, CPA, CPM, CTR stay as they are: they're the buyer's own words.

### Decision
✅ Approved 2026-11-01 (by moving on to round 7). Not committed yet.

---

## Round 5 — Media buyer (ICP2): "From click to cash"

**Status:** ✅ approved 2026-11-01, staged, not committed. Builds on rounds 1–4.
**Reader:** ICP2, media buyer only. Other readers verified unchanged.
**Files:** `src/html-report.ts`, `src/preview-report.ts` (dev-only sample funnel).

**Changed later:**
- Round 10: the three-zone pipeline became one ledger (same rows, same columns). Presets, the live cash number and the removed funnel strip/KPI tiles stand.

### What it yielded
The buyer's whole question, ads or site, is now one picture at the top of the
report: **From click to cash**. Three zones carry the store's own numbers:
- **The click:** does the page load on a phone (slowest page and its score).
- **The site:** the funnel, each step with its drop against benchmark; the
  leak is in red and its line animates.
- **The count:** what Ads Manager counts (off both ways ▲3 ▼4, plus signal
  gaps) and what turns into cash.

The cash number is live: it's computed by the break-even calculator, so
changing the COD rates or picking a market preset changes the top of the
report. The break-even calculator gained Egypt / Saudi / UAE starting points
from published return-to-origin ranges.

### Research behind it
- **ICP card** `icp/media-buyer-full.md` §13 ("Ads or site?" flow: is the
  number real, did the site change, did the ads change) and §12 (COD is large
  in MENA; purchase events fire at order, not delivery).
- **What buyers praise in their own tools:** Triple Whale's top-10-by-any-
  metric in one click; Motion replacing thumbnail hunting for stakeholder
  reports. So the wow has to be one readable picture, not more text.
  Sources: triplewhale.com/blog/triple-whale-vs-northbeam,
  g2.com/products/motion-app/reviews.
- **2026 signal theme:** with Andromeda, delivery depends on the conversion
  signal. "Fix event ID before you touch bids"; EMQ target 7+. That's the
  "count" zone. Sources: utmgrabber.com/blog/meta-ads-event-id-dedupe-emq-april-2026,
  blotout.io/blog/meta-event-match-quality-score-what-it-means-and-how-to-improve-it.
- **COD return-to-origin by market:** Egypt 25–35%, Saudi 15–25%, UAE 10–18%.
  Logistics-vendor data, labelled as such in the report.
  Source: easysellapp.com/blogs/wiki/egypt-ecommerce-cod-market-entry-shopify-2026.
- **Design skill** (`frontend-design`): 4/8px spacing grid, type at 12/14/16
  plus one display size for numbers, every interactive part has hover, active
  and focus (the global focus ring), status never by colour alone, motion off
  under reduced-motion.

### Full change list
1. **"From click to cash"** (`clickToCashHtml`) in the buyer hero, between
   the status line and the scoreboard:
   - **The click:** slowest tested page's mobile score; red under 50, amber
     50–89; links to Page speed.
   - **The site:** product views → add to cart → checkout → purchase, from
     the store's GA4. Between steps: the rate against its benchmark, marked
     "Leak" when below, with a red animated dashed line (still under
     reduced-motion). Vertical on phones; right to left in Arabic.
   - **The count:** "Counted in Ads Manager" (verdict, ▲ over / ▼ under
     counts, signal gaps; links to lane 1) and "Turns into cash" (live from
     break-even; links to it).
2. **One home kept:**
   - The funnel numbers now live in this picture. The buyer's ROAS section
     drops the funnel strip and the conversion-rate/AOV tiles (the ROAS line
     states both).
   - "Your numbers" drops its funnel chart, purchases and conversion rate for
     the buyer. It keeps visits, revenue, channels and new vs returning.
   - The GA4 box in "After the click" now points to the picture.
3. **Break-even presets:** Egypt / Saudi / UAE buttons set the confirmation
   and delivery rates to the middle of the published RTO ranges, with the
   source stated under them; the pressed one is marked.
4. Dev only: the `--site` preview sample now includes a GA4 funnel that matches
   the sample's own GA4 facts (15,000 → 1,200 → 492 → 369).

### How to check it
`http://localhost:5173/audit-reports/local/round5-icp2-after.html` (before:
`round5-icp2-before.html`):
1. First screen: scroll a little to "From click to cash". The leak between
   add to cart and checkout is red and moving.
2. Click each box: speed, the count, cash. Each jumps to its home.
3. Break-even: press Egypt, then Saudi, then UAE. Scroll back up: "Turns into
   cash" changed (82% / 88% / 91%).
4. عربي: the funnel runs right to left. Phone width: it stacks.

### Verification done
Types pass, worker tests 101/101, site build passes, no page JS errors.
Presets drive the pipeline (81% → 82% / 88% / 91%; break-even 3.09× →
3.06× / 2.84× / 2.74×). Duplicate audit: still 1 exact repeat (link text).
Store owner, marketing manager and agency: no pipeline, no presets, funnel
chart and KPIs kept.

### Known limits
- Funnel numbers also appear inside AI-written finding text (e.g. GA4-01's
  sentence). That's for the audit prompt, not the layout.
- The click zone uses page speed as the proxy for "does the click land": the
  audit can't see link clicks vs landing page views. The Page speed section
  tells the buyer how to check it in Ads Manager.
- Saudi COD share is disputed in the sources (18–75%), so presets change only
  the confirmation and delivery rates, never the COD share.

### Decision
✅ Approved 2026-11-01. Not committed yet.

---

## Round 4 — Media buyer (ICP2): one home for everything (duplicate audit)

**Status:** ✅ approved 2026-11-01, staged, not committed. Builds on rounds 1–3.
**Reader:** ICP2, media buyer only. Other readers verified unchanged.
**Files:** `src/html-report.ts` (net −25 lines).

### What it yielded
Every finding now appears in exactly one place. Anywhere else, it's a link, not a copy.
- Exact duplicated texts on the page went from **17 to 1**; the one left is
  a section name used as link text.
- Numbers repeated in 3+ places went from **9 to 6**. The rest sit inside
  AI-written finding text or are coincidences.
- All 50 checks render once each (50 rows, 50 unique).
- The hero halved on phones (2,193px → 1,062px).

### How the audit was done
Two scripts over the rendered page (session scratchpad, `dupes.mjs` and
`dupes2.mjs`), every check opened:
1. Exact visible texts appearing in more than one section.
2. Sentence-level and number-level matches, with labels like "Change:",
   "Action:" and "Check it yourself:" stripped, so paraphrased copies show up.

### Duplicates found (before)
- **Every failed finding rendered in full twice:** in its ROAS lane and again
  in "All 50 checks" (title, chip, change, done when, check-it-yourself).
  That's 16 findings.
- Three fixes appeared a **third** time in "Send this to the store owner".
- The hero quoted lane findings word for word ("Key events: purchase,
  page_view", "Only the default audiences…", "Germany…").
- Verdicts appeared twice: the round-2 strip, then the 5 hero steps.
- Lane intros repeated the hero's consequence lines ("A weak signal means…").
- The funnel numbers (41% vs 50%) appeared in 4–5 places: the hero, a KPI
  tile, the funnel strip, the GA4 box in "After the click", and two GA4 checks.
  The money range appeared in 3.
- The in-app browser share (55.8%) appeared in the hero and in Clarity.

### Where each thing lives now
| Thing | Its one home | Elsewhere |
|---|---|---|
| Failed point that moves ROAS | Its lane, as the full check row (business + technical, change, done when, check it yourself); first row open, the rest one tap away | "All 50 checks" shows a note with a link instead |
| Failed point repeated by the funnel de-dup, passed points | "All 50 checks" | — |
| Verdicts | Hero scoreboard: question, verdict, count, link to its lane | Strip and long steps merged into it |
| Reads-too-high / too-low meter | Lane 1 | Not in the hero |
| Funnel step numbers | Funnel strip in "What holds ROAS back" | "Weakest step" KPI tile removed; the GA4 box points to it |
| In-app browser share | Clarity | Not in the hero |
| Store-owner handover | Copy button, with a fold-out preview | Not printed as a third copy |
| "We don't see your ad accounts" | How it works | Not in the hero |

### Full change list
1. Hero rebuilt as a 5-row scoreboard (question, verdict word + count, →
   link). The round-2 strip and the round-1 evidence paragraphs are gone.
2. The lanes render the real check rows (`checkRowHtml`) for every failed
   ROAS point, not capped at 4. The bias meter is in lane 1.
3. "All 50 checks" (buyer): each tool section starts with "N checks that need
   work here are in What's holding your ROAS back" (a link), then the rest.
   The status chips are removed (they counted rows that moved), and round 1's
   "Need work" default goes with them. Search and Technical details stay. The
   check-map squares still jump to every check wherever it lives.
4. Every buyer check row starts as one line (title + tags), passed ones
   included. "Stop revenue loss / Revenue gain" chips are dropped for the
   buyer; the ROAS chip carries the meaning, matching round 3's conversion
   review.
5. "Send this to the store owner": copy button plus a "Preview what gets
   copied" fold. The copy reads the open preview, so it copies one language.
6. GA4 box in "After the click": a pointer to the funnel instead of
   restating it.
7. KPI tiles (buyer): conversion rate and AOV only.

### How to check it
`http://localhost:5173/audit-reports/local/round4-icp2-after.html` (before:
`round4-icp2-before.html`):
1. Top: the 5-row scoreboard. Each row jumps to its lane.
2. "What holds ROAS back": each lane holds full rows; tap to open; the first is open.
3. Left menu → "Google Analytics 4": the note with the link, then only the
   rest. Pick any finding from a lane and confirm it isn't repeated here.
4. "Send this to the store owner": click Copy, paste. Open the preview.
5. In "All 50 checks", click a red square in the map: it opens the row up in
   its lane.

### Verification done
Types pass, worker tests 101/101, site build passes, no page JS errors.
Store owner, marketing manager and agency reports: answers kept, status
chips kept, nothing folded, no scoreboard.

### Known limits
- Each scoreboard question appears once more as the heading of its lane
  (navigation, on purpose).
- Page URLs appear in the speed cards and in Sources' "pages we checked".
- Some numbers repeat inside AI-written finding text (e.g. the GA4-01 summary
  mentions the other funnel steps). That's for the audit prompt, not the layout.
- Phone length is about flat (26.1k → 26.7k): passed checks that round 1's
  filter hid now show as one-line rows.

### Decision
✅ Approved 2026-11-01. Not committed yet.

---

## Round 3 — Media buyer (ICP2): the post-click sections, challenged

**Status:** ✅ approved 2026-11-01, staged, not committed. Builds on rounds 1–2.
**Reader:** ICP2, media buyer. One small fix applies to every reader (see 3).
**Files:** `src/html-report.ts`.

### What it yielded
The sections rounds 1–2 hadn't touched now speak to a media buyer:
- **Conversion review:** no longer lists the same findings twice, and every
  leak says what fixing it does to ROAS instead of store-owner tags.
- **Page speed:** moved up next to it and rewritten as "paid clicks that never
  see the page", with a one-minute Ads Manager check.
- **How it works:** says how findings were ranked instead of repeating the
  sources list.
- **Closing call ask:** says what happens on the call and that the buyer
  keeps the account.

### Problems found before the change
- Conversion review (3,675px on desktop): the GA4 box listed findings that
  appear again as full rows right below it (e.g. "Shoppers first see the
  shipping cost at checkout" twice).
- Its tags were store-owner language ("Stop revenue loss", "Trust & cost").
  "Stop revenue loss" even showed on rows marked Working, and none of the tags
  said what the fix does to ROAS.
- Internal ids reached the reader: "Follow-up from GA4-01", "(GA4-03)", and
  "Not confirmed this time: **A3**".
- Page speed was written for an owner, sat after the 50 checks, and never
  gave the buyer the one check they can run themselves (link clicks vs
  landing page views; ICP card §8 #16).
- "How this audit works" repeated the same source list as "Where this data
  came from" right below it.
- The closing ask never answered the buyer's objection ("will you steal my
  client?", ICP card §17) or said what happens on the call.

### Full change list
1. **GA4 box (buyer):**
   - Kicker "From your GA4 funnel".
   - Title "Paid visitors drop most at your cart".
   - No internal ids.
   - Instead of repeating the findings, it says "N to fix, N working: they're the
     first rows below".
   - Egyptian Arabic.
2. **Conversion review rows (buyer):**
   - Tags are now one ROAS chip ("Fixing: ROAS ↑ · CAC ↓ (est.)") plus effort
     (Quick win / Needs a developer). Working rows get no tags.
   - Status words, GA4 line and copy label in Egyptian Arabic.
   - Lead explains the score: "58/100 across the 6 rules we could check".
   - "Test before you change it" becomes "A/B test before you change it".
3. **Every reader:** "Not confirmed this time" names the rules ("Cart shows
   the full cost clearly"), not their ids ("A3").
4. **Page speed (buyer):**
   - Title "Page speed: paid clicks that never see the page".
   - Lead names the slowest page tested and its mobile score.
   - A "Check it yourself" box: Landing page views vs Link clicks in Ads
     Manager, 70–90% is typical.
   - Moved to right after the conversion review, in the page, the menu and the
     jump bar.
5. **How it works (buyer):** the duplicated source list is gone. It now says
   how findings were ranked (counting first, over-counting before
   under-counting, then signal, post-click, wasted clicks; privacy/security
   points stay in the checks). ICP playbook §1: state how you prioritised.
6. **Closing ask (buyer):** three numbered steps. We confirm which tracking
   issues are real, we size the post-click leaks against spend and break-even
   ROAS, and you leave with a fix order the owner can approve. "You keep the
   account and the credit."
7. **Menu and jump bar (buyer):** "Conversion review" becomes "After the
   click", matching the section heading.

### How to check it
`http://localhost:5173/audit-reports/local/round3-icp2-after.html` (before:
`round3-icp2-before.html`):
1. Left menu → "After the click":
   - The yellow GA4 box no longer lists findings.
   - The rows below have the ROAS chip, not "Stop revenue loss".
   - Working rows (bottom of the section) have no tags.
2. Left menu → "Page speed" (now right after it): the title, the slowest page
   named, and the blue "Check it yourself" box.
3. "How it works": one paragraph on ranking, no source list.
4. Scroll to the end: the three numbered call steps.
5. Switch to عربي and repeat 1 and 4.

### Verification done
Types pass, worker tests 101/101, site build passes, no page JS errors. Store
owner, marketing manager and agency reports have none of the buyer changes;
only the "Not confirmed" naming fix reaches them.

### Known limits
- Phone page length is about flat (26,082 → 26,108px): the conversion review
  is 334px shorter, and the speed lead adds about the same.
- The action box inside conversion-review rows ("الإجراء", "المسؤول",
  "يكتمل عندما") is still formal Arabic. It's shared with the other readers.
  Candidate for next round.

### Decision
✅ Approved 2026-11-01. Not committed yet.

---

## Round 2 — Media buyer (ICP2): proof and triage

**Status:** ✅ approved 2026-11-01, staged, not committed.
**Reader:** ICP2, media buyer. Builds on round 1.
**Files:** `src/html-report.ts`, `src/preview-report.ts` (dev-only `--site` sample).

**Changed later:**
- Round 4: the verdict strip was merged into the hero scoreboard.
- Round 4: folding now covers passed checks too, not only failed ones.
- Round 4: the store-visit panel and "Copy the tracking fixes" are unchanged.

### What it yielded
The report now shows the buyer proof from our own visit to the store: whether
tapping Add to Cart filled the cart, and which add-to-cart events actually went
out (store dataLayer, GA4, Meta, TikTok, Snap). A strip at the top gives all
five verdicts at a glance. One button copies every tracking fix as a
developer-ready ticket. The checks list folds to one line per check. The phone
page is 26% shorter (35,107px → 26,088px; the checks list 17,148px → 6,654px).

### Problems found before the change
- The store visit records the Add to Cart test, the events it sent, WhatsApp
  link validity, sold-out products up front and autoplay hero video
  (`site_checks`, saved per run). The report showed none of it. A real example
  (Tharaa): the tap left the cart empty, and GA4 sent only
  `sticky_atc_visible` while Meta sent only `SubscribedButtonClick`. No
  add-to-cart event fired.
- The buyer had no quick way to hand tracking work to a developer (ICP card
  §7.9: "a forwardable report that proves the problem").
- Even filtered to "Need work", every failed check rendered fully open, at
  450–750px each on a phone.
- The five verdicts took about 1,700px to scan on a phone.

### Full change list
1. **"What our phone visit saw"** (new block in the ROAS section, after lane 1):
   - Did Add to Cart fill the cart: Yes / No (marked unconfirmed: it can be
     our automated browser, so try it on your own phone first) / Not tested.
   - **What the tap sent:** a table per source (store dataLayer, GA4, and every
     pixel that sent something) showing whether the add-to-cart event was
     sent or missing, plus everything that was sent. It's only judged when
     the tap really filled the cart, matching the audit prompt's rule. Pixels
     that sent nothing aren't listed, because we can't tell installed from
     missing.
   - WhatsApp links: number broken vs working.
   - Sold-out products in the first screens (ads landing there waste clicks).
   - Autoplay video filling the first phone screen.
   - Platform and the pages visited.
   - Egyptian Arabic. On phones the event table stacks into rows.
2. **Verdict strip** under the headline: The number / The signal / After the
   click / Wasted clicks / The ads, each with its verdict word, linking to its
   step.
3. **"Copy the tracking fixes"** after lane 2: plain-text tickets for every
   tracking point (lanes 1–2) in the developer's words (technical voice): id,
   what's wrong, change, done when, how to check. Copies English or Arabic
   following the report language.
4. **Checks list folds failed checks** to their title, severity and ROAS chip
   for the buyer. Tap to open. Links from the opening and lanes still open
   the row.
5. Dev only: `npm run preview-report -- --site` adds a sample phone visit
   for previews.

### How to check it
`http://localhost:5173/audit-reports/local/round2-icp2-after.html` (before:
`round2-icp2-before.html`):
1. Under the headline, the 5-cell strip: tap one and it jumps to its step.
2. "What holds ROAS back" → after lane 1, "What our phone visit saw": read the
   Add to Cart result and the event table (GA4 missing, Meta sent in the sample).
3. After lane 2, "Copy the tracking fixes": paste into a note and check that
   a developer could work from it. Switch to عربي and copy again.
4. "All 50 checks": rows show as one line each; tap one to open it.
5. Phone width plus Arabic: the event table stacks.

### Verification done
Types pass, worker tests 101/101, site build passes, no page JS errors. Store
owner, marketing manager and agency reports render none of the new parts.

### Known limits
- The event table needs a run where the tap filled the cart. Runs where it
  didn't show a note instead.
- The phone jump bar still wraps to 2 rows on purpose (a code comment says
  sideways scrolling breaks in Arabic). Not changed.

### Decision
✅ Approved 2026-11-01. Not committed yet.

---

## Round 1 — Media buyer (ICP2): the ads-or-site check

**Status:** ✅ approved 2026-11-01, staged, not committed.
**Reader:** ICP2, media buyer ("Prove it's not my ads").
**Files:** `src/html-report.ts`, `src/buyer-verify.ts` (new).

**Changed later:**
- **Round 4, opening:** the five long steps with evidence paragraphs became a
  5-row scoreboard (question, verdict, count, link). The bias meter moved to
  lane 1. The hero no longer quotes findings, the in-app browser share or the
  "we don't see your ad accounts" line.
- **Round 4, lanes:** they now hold the full check rows for every failed ROAS
  point instead of up to 4 short items. "Check it yourself" now shows inside
  those rows.
- **Round 4, checks list:** "Opens on Need work" was removed together with
  the status chips, because the failed rows moved to the lanes.
- **Round 4, KPI tiles:** "Weakest step" was removed; the funnel strip holds
  those numbers.
- **Round 3:** page speed moved next to the conversion review; "How it
  works" lost its source list.
- **Unchanged since round 1:** the answers section is still removed for the
  buyer, the one honest count, the Egyptian Arabic, the break-even calculator,
  and "Check it yourself" (`buyer-verify.ts`).

### What it yielded
The media buyer report now opens by answering the buyer's actual question, "is
it the ads or the site?", as a five-step diagnosis. Before, it opened with two
lists of findings, then a "What you asked, answered" section whose verdicts
contradicted themselves. Tracking findings now tell the buyer how to confirm
them with their own tools. The report gives one consistent count. Buyer Arabic
is now Egyptian. The phone page is 16% shorter (41,852px → 35,107px).

### Problems found before the change
- Answers said "Are my ad numbers real? **Yes**: 2 problems found" and "Is it
  the ads or the site? **Yes**: 5 problems found". This was also seen in the real
  Tharaa buyer report (`output/tharaa-media-buyer-2822dc42.html`).
- "Is the number real?" was led by an audience-setup issue, not a counting
  issue; duplicate purchases sat lower.
- Counts disagreed: "Passed 28 of 56 checks" at the top vs "All 50 checks, 26
  passed" below.
- The same finding appeared up to 4 times (opening, answers, ROAS lanes,
  owner handover).
- Buyer Arabic was formal MSA; the brief (`icp/media-buyer.md`) asks for
  everyday Egyptian.
- No way to verify a tracking finding yourself (ICP card §7.9, §8).

### Full change list
1. **Opening: "The ads-or-site check"** (ICP card §13 diagnosis flow).
   - Headline is built from the results, e.g. "It's not only your ads: the
     numbers are off and the site leaks after the click."
   - Five numbered steps, each with a verdict word, the store's own evidence and a link:
     1. Is the number real? No/Yes, plus a bias meter: one mark per issue
        that makes reported ROAS read too high (amber) or too low (blue).
        Counted, never sized.
     2. Can the algorithm learn from your sales? Partly/Yes.
     3. Does paid traffic convert after the click? Shows the weakest funnel
        step vs benchmark, the GA4 money at stake, and the in-app browser
        share from Clarity (when 25% or more).
     4. Is budget buying clicks that can't buy? Only shown when there are some.
     5. Is it the ads? "Can't tell from here": the audit doesn't see ad
        accounts, so rule out 1–4 first, then check break-even ROAS.
   - Findings are sorted into steps by their ad effect (`ad-impact.ts`).
     Points with no honest ROAS/CAC effect (privacy, security, team filters)
     stay out of the diagnosis and remain in the checks.
   - One honest count: "Passed 26 of 50 checks and 2 of 6 conversion-review rules".
   - The separate "What you asked, answered" section and its TOC link are
     removed for the buyer only, because the opening now answers those questions.
2. **"What's holding your ROAS back"** rebuilt as three lanes matching the
   opening: the number, the algorithm's signal, after the click (with
   clicks that can't buy). Over-counting is listed first, as the costlier
   mistake. Up to 4 per lane, as a ruled list with who / change / done when.
   The ROAS formula line uses the store's own CVR and AOV.
3. **"Check it yourself"** on 22 tracking points (`src/buyer-verify.ts`):
   exact steps in Test Events, Pixel Helper, GA4 DebugView, Realtime,
   the Network tab, Google Ads and GA4 Admin, in English and Egyptian Arabic.
   They are instructions only, never claims about the store. `MB-*` points
   resolve through `PERSONA_SHARED_SOURCES`. They are shown in the lanes and
   on failed rows in the full checks list.
4. **Copy:** all buyer-specific Arabic rewritten in Egyptian (opening, lanes,
   ROAS line, TOC/jump labels, checks intro, lead).
5. **Checks list opens on "Need work"** for the buyer; passed checks are one tap
   away, and in-page links still open filtered rows.
6. **Break-even ROAS calculator** (the approved part): AOV from GA4. Margin,
   COD share, confirmation, delivery and shipping are sample inputs. It shows
   break-even ROAS, highest CPA, highest cost per delivered order, share of
   orders that turn into cash, and **real ROAS after COD losses** (new this
   round). If the buyer types their ROAS, it gives a loss/profit sentence and
   the +20% CVR effect. Has a "Copy for the store owner" button. Inputs are
   saved in the browser only.

### How to check it
Open `http://localhost:5173/audit-reports/local/round1-icp2-after.html`
(before: `round1-icp2-before.html`), then:
1. First screen: does the headline plus 5 steps tell a buyer, in 10 seconds,
   whether it's the ads, tracking or site?
2. Click the step-1 link and read 2–3 "Check it yourself" boxes.
3. Are findings in the right lane?
4. Switch to عربي: Egyptian tone, mirrored layout, bias meter labels.
5. "All 50 checks" opens on "Need work 24"; "Passed" still works.
6. Break-even: type ROAS 2.5 → real ROAS 2.02×.
7. Narrow the window to phone width.

### Verification done
Types pass, worker tests 101/101, site build passes. The store owner,
marketing manager and agency reports render unchanged. Screenshots are in the
session scratchpad (`shots/branch/R1-*`).

### Known limits
- Tested on the offline preview fixture and the saved real Tharaa report.
  Re-rendering a live buyer run from Supabase wasn't run (production read).
- 29 API tests (`tests/api`, audit-request and contact) fail with or without
  this change. Not investigated yet.

### Decision
✅ Approved 2026-11-01. Not committed yet.

---

## Before this branch (`feature/get-free-audit-tool`, reverted)

- **Attempt A — store owner (ICP1): booking dock + "No developer? We can make
  this change" + UTM-tagged booking links.** ⏪ Reverted. Wrong reader
  focus; the agency view and the "30-minute call" wording weren't checked.
- **Attempt B — media buyer: break-even ROAS calculator alone.** ⏪ Reverted
  on that branch, then re-applied as part of Round 1 here.
