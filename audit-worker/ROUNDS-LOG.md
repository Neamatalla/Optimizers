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
- **Review tooling (not in the repo):** in the session scratchpad.
  - Screenshots: `shot2.mjs`, `shot3.mjs`; section dumps `sections.mjs`,
    `blocks.mjs` (section → child blocks with heights).
  - Audits: duplicates `dupes.mjs`, `dupes2.mjs`; grade `grade.mjs`; numbers
    `numbers.mjs`; sentence length `sentences.mjs` (round 12); links and nav
    order `nav11.mjs` (round 11); phone section bar `jump.mjs` (round 11);
    motion `motion10.mjs` (round 10); carousels `car13.mjs` (round 12).
  - Every round's patch: `round1-icp2-full.patch` … `round11b-icp2.patch`,
    `round12-icp2.patch`, `round12b-carousel.patch`; edit scripts in `code/`.
  - The "after" pages are `output/roundN-icp2-after.html`; `output/` is
    gitignored. With store screenshots: `round11-icp2-shots.html` (preview
    with `--shots=https://tharaa.shop`).
- **Not tested on a live run:** re-rendering a real buyer run from Supabase
  was blocked as a production read. Tested on the preview fixture
  (`npm run preview-report -- --path=tracking --fud --clarity --site --role=media_buyer --no-ar`)
  and the saved real Tharaa report.

---

## Round 20 — Where your ads land: the landing page against the ad

**Status:** 🟡 staged, waiting for review. Builds on rounds 1–19.
**Reader:** media buyer. It replaces the "Your ad, as you told us" box at the top of "After the click" (#friction), and the guide gets an "Ad landing" stop.
**Files:**
- `src/ad-match.ts` (new): the matcher. `src/ad-match.test.ts` (new, 7 tests).
- `src/site-checks.ts`, `src/types.ts`: `SiteChecks.landing` (per landing page: first-screen text, page text, price and buy button on the first screen, H1, first-screen crop) and `SiteChecks.checkout` (coupon field on the first screen).
- `src/html-report.ts`: `yourAdHtml` rewritten as "Where your ads land" (#ad-landing), `landingCardHtml`, CSS, guide stop.
- `src/fud/manual-checklist.ts`, `src/fud/index.ts`: the typed ad goes to the landing-page checkpoints, as a parameter.
- `src/poll.ts`: **round-19 fix**, see below.
- `src/preview-report.ts`: `--signal=` also fills landing and checkout; `--ad="text|coupon"`.

### Round-19 bug found and fixed
Production collects the store visit in `poll.ts`, not in `runFudPass`, and that call didn't pass the GA4 landing URLs. Real audits would never have opened an ad landing page; only the dev runner did. `poll.ts` now passes `collectorLanding(focus)`. Signal quality also gets the store currency from GA4 there, so the currency check runs in real audits.

### What changed
For each page GA4 says paid traffic lands on (up to two), a card shows:
- the **first phone screen** as the visit saw it (390×844 crop);
- where it came from ("Most paid visits in GA4"), the path, the H1;
- ✓/✗ **price in the first screen**, ✓/✗ **buy button in the first screen** (with its label).

When the reader typed the ad on the form, the card also scores how much of the ad the first screen repeats. Plain text maths, no AI:
- each **offer** in the ad (30%, "4 for 3", 1399) is found in the first screen, lower on the page, or not on the page. Arabic digits, ٪, thousands separators and "N … بسعر M" are handled;
- each **ad word** (filler, offer and currency words dropped) is found in the first screen or not. Arabic prefixes match (لتساقط = تساقط);
- the **coupon**: on the page or not, and whether checkout's first screen has a field to type it.

Score: an offer in the first screen counts 2 (lower down 1), ad words 2 in total, coupon 1. The footnote says it matches words and numbers, not meaning, and to look at the screenshot.

With no ad typed, the cards still show the first screen and the two facts, and the lead asks for the ad next time. With no landing page (no GA4), the old ad box text stays.

The landing-page checklist prompt now includes the typed ad ("THE AD THAT SENDS TRAFFIC…"). Other tabs don't get it.

### Verification
- Tests 132/132 (7 new). `tsc` clean.
- On the real tharaa.shop visit (run 4) with an ad written like Tharaa's November offer ("٤ منتجات بسعر ٣ على زيت الروزماري لتساقط الشعر", coupon NOV30):
  - hair-loss collection: 73%. The 4-for-3 offer is in the first screen; NOV30 is not on the page; checkout has a coupon field; "الشعر" is missing from the first screen;
  - product page: 60%. The buy button is only after scrolling.
- The preview's sample abaya ad against Tharaa scores 0%, as it should.
- Checked at 1440px (EN) and 390px (AR): no sideways scroll.

### How to check
`npm run preview-report -- --path=tracking --fud --clarity --site --role=media_buyer --no-ar --signal=output/fud-tharaa.shop-evidence.run4.json "--ad=عروض نوفمبر: ٤ منتجات بسعر ٣ على زيت الروزماري لتساقط الشعر|NOV30"`, then "After the click" → "Where your ads land".

### Known limits
- Word and number matching, not meaning: a synonym on the page counts as missing.
- Only the first checkout screen is read for the coupon field.
- A real audit opens landing pages only with GA4 connected.

---

## Round 19 — Pixel signal quality, ad landing pages and the first checkout screen

**Status:** ✅ approved (by moving on to round 20), staged, not committed. Builds on rounds 1–18.
**Reader:** media buyer first (signal quality sits in "Can you trust the numbers?"); the two new checklist tabs serve every reader.
**Files:**
- `src/fud/collect.ts`: hit parameters, retry dedupe, landing + checkout capture, waits for late pixels.
- `src/fud/evidence.ts`: `HitParams`, `PageEvidence.landing`, `StoreEvidence.atcHits`, `pageHits[].q`.
- `src/signal-quality.ts` (new): the grader. `src/signal-quality.test.ts` (new, 9 tests).
- `src/site-checks.ts`, `src/types.ts`: `SiteChecks.signal`; `FudPageType` gains `landing` and `checkout`; `Ga4Focus.paidLandingUrls`.
- `src/ga4-facts.ts`: `paidLandingUrls`, `collectorLanding`. `src/fud/index.ts`: passes them to the visit.
- `src/fud/manual-checklist-score.ts`: Checkout and Landing Pages tabs now run.
- `src/fud/judge.ts`: the rule judge still only reads home, product, cart, collection.
- `src/html-report.ts`: `signalQualityHtml` (#signal), guide stop, page labels, CSS.
- `src/checklist-run.ts`: `--pages=` and `--merge=`. `src/fud-run.ts`: `--landing=`. `src/preview-report.ts`: `--signal=` and a sample signal for `--site`.

### What changed

**(b) Pixel signal quality.** Before, the visit kept only each hit's event name. Now it reads what each hit carried:
- value, currency, number of products, event ID (Meta `eid`, TikTok `event_id`), and whether customer data was sent (never the data itself);
- from GA4 batches (one event per body line), Meta query/form/multipart bodies, and TikTok JSON.

The new section "What your pixels tell the ad platforms" grades each platform at three steps:
- viewed a product (product-page load);
- added to cart (our tap);
- started checkout (checkout load).

Each cell shows:
- Sent / Sent ×N / Missing / Not tested;
- the event, its value and currency;
- pills for value, currency, product IDs and event ID (a struck-through red pill means missing).

Around the table:
- a score per platform and overall;
- one card per problem, worst first: missing event, double fire, value mismatch, no value, currency mismatch, no product IDs, no currency, no event ID. Each card is bilingual fixed copy saying what it breaks for the buyer (optimization, retargeting, value bidding, catalog ads, CAPI dedup) and how to fix it;
- "Bought" is a row that says plainly it is never tested: we place no orders.

**(a) New pages.**
- *Ad landing pages:* the two pages with the most paid visits, from GA4's paid landing report (or the top paid campaign's page). A URL already visited is reused, not reloaded.
- *First checkout screen:* opened from the cart's checkout link (or Shopify's `/checkout`). Nothing typed, chosen or submitted. A log-in wall is noted.
- The checklist's Checkout tab (16 points) and Landing Pages tab (106 points) now run on these pages. Thank-you pages still never run.

### Accuracy work (found on 4 live visits to tharaa.shop)
1. **Big request bodies were invisible.** Chrome leaves large bodies out of the request. GA4 batches looked empty: "no value, no currency, no items". Fixed: the body is fetched before the hit is blocked.
2. **Blocked hits get retried.** When we block a GA4 hit, gtag resends it, so one event looked like two. Fixed: a retry has the same sequence number (`_s`) or event ID and the same payload, and is counted once. Two tags that send different payloads still count as two.
3. **Shopify app pixels fire late.** The full `view_item` arrived after the Add-to-Cart tap. `add_to_cart` and `begin_checkout` arrived on the next page. Fixed:
   - a step's own events count for it even when they arrive during a later step;
   - waits added: product page 3s, after the tap 2s, checkout 6s.
4. **A pixel that hasn't loaded is not a missing event.** In one visit Meta sent nothing at all on home and product. That step is now "Not tested" for that platform ("sent nothing during our visit here"), never "Missing".

### Verification
- Tests: 125/125 (9 new). `tsc` clean.
- Live tharaa.shop visits with the final grader: runs 1, 2 and 4 give the same result, 92%:
  - Meta 100%: all three events with value, currency, IDs and event ID;
  - GA4 83%: `view_item` and `add_to_cart` reach GA4 twice, one full and one bare (a second tag);
  - TikTok 92%: ViewContent and AddToCart carry no value.
- Run 3 was captured before the waits existed. It shows no false claim, but it misses the GA4 double fire.
- 466–495 hits blocked per visit, 0 leaked. Checkout opened every time on the first screen (Shopify, `ar-eg`). Nothing was typed.
- Report checked at 1440px (EN) and 390px (AR):
  - no sideways page scroll;
  - on phones the table stacks per platform.
- New copy passes the 14-word sentence check.
- Checklist on the new pages (`checklist-run --pages=checkout,landing --merge=…`, 193s, 0 failed calls):
  - 122 points ran: Checkout 16, Landing Pages 106;
  - 27 shown, all failing ones written up: **Checkout 76%** (11 judged: 6 to fix, 5 done well), **Landing Pages 52%** (16 judged, 1 critical failing);
  - 95 dropped as "doesn't apply" or "can't tell" (most landing points need the ad itself to compare).
  - Whole checklist now 60% over 193 points.
  - Sample cards: no one-tap payment buttons at the top of checkout; address form has no building number or landmark field; free shipping shown with no delivery time or courier.
- Note: `checklist-run` names its file after the evidence host, so a `www.` capture writes `checklist-www.<host>.json`.

### How to check
- `npm run preview-report -- --path=tracking --fud --clarity --site --role=media_buyer --no-ar --signal=output/fud-tharaa.shop-evidence.run4.json`
- Open "Can you trust the numbers?", then go below the pixel map.
- Live: `npx tsx src/fud-run.ts <store> --collect-only --landing=<url>`

### Known limits
- Purchase is never tested (no orders).
- A pixel that fires more than ~6s after checkout opens, and before the next page, can still be missed. It shows as "Missing" only if that platform sent something else at that step.
- Two tags with an identical payload and the same sequence number count once (conservative).
- Snap is graded on event names only.
- Landing pages need GA4. Without it, no landing page is opened and that tab shows no cards.

---

## Round 18 — The full CRO checklist: all 377 points of the agency's manual audit, as checks (redo)

**Status:** ✅ approved (by moving on to round 19), staged, not committed. Builds on rounds 1–17.
**Reader:** every reader. A new section right after the CRO findings.
**Files:**
- New: `src/fud/manual-checklist-data.ts` (all 377 checkpoints, word for word
  from "Optimizers - CRO Manual Audit Checklist.xlsx": ID, tab, section,
  checkpoint, why, how, pass, reference, importance).
- New: `src/fud/manual-checklist-score.ts` (page mapping, the sheet's
  scoring; no Node, so the report page can use it).
- New: `src/fud/manual-checklist.ts` (the two reviewer passes).
- New: `src/fud/manual-checklist.test.ts` (7 tests).
- New: `src/checklist-run.ts` (dev runner on saved evidence).
- `src/fud/index.ts`: runs after the rule review, never fatal,
  `CRO_CHECKLIST=off` turns it off.
- `src/fud/judge.ts`: exports the page and store text helpers.
- `src/types.ts`: `FudResult.checklist`, `ManualChecklistResult`,
  `ManualExplain`.
- `src/html-report.ts`: the section, nav, guide stop, styles.
- `src/preview-report.ts`: `--checklist=<file>`.
- `package.json`: test list.

### The ask (after rewinding the first round 18)
"Implement them all as checks for the CRO section. If a check wasn't
applicable for the website, don't add the point as a card at all. The
explanation and description of each point must be long, so the user
understands what it says, what it means, what the issue is and how to fix
it."

### What changed from the rewound version
| Rewound round 18 | This one |
|---|---|
| "Can't tell" items shown as cards with no reason | **"Doesn't apply" and "can't tell" are dropped before saving.** They never become a card and never count in the score. |
| One-line notes (18 words or fewer) | **A full write-up for every point not done well**, in EN and AR: headline, What we found, What this means, The problem, How to fix it (3–6 steps), Done when. Plus the sheet's own "Check it yourself". |
| Screenshot "spots" | Left out (not asked for). |

### How it works
1. **Scope:**
   - All 377 checkpoints are in the engine.
   - A checkpoint runs when its tab's page was captured: Sitewide (any
     page), Homepage, Collection, Product, Cart, Mobile, Trust, Pricing, Copy.
   - Checkout (16), Thank-you (6) and Landing pages (106) have no captured
     page today, so they produce no cards rather than "couldn't check" ones.
2. **Pass 1 (verdicts):**
   - About 40 checkpoints per AI call, 3 calls at a time.
   - The verdict codes: W well / A adequately / B badly / N not implemented
     / X doesn't apply / U can't tell.
   - Each comes with a one-line note (EN and AR) and a short Arabic title.
   - The prompt tells the reviewer to use X freely when a point makes no
     sense for this store, and U rather than guessing.
3. **Pass 2 (write-ups):** every A, B and N, 6 per call, 3 at a time.
   - The prompt carries the agency's why / how / pass / reference and the
     captured pages.
   - It asks for plain words, short sentences, terms explained on first
     use, the store's own words quoted, no invented facts.
   - The Arabic follows the reader's register rule (Egyptian for buyers,
     Gulf for owners…).
   - A write-up is kept only if every field is there. If a call fails, the
     point shows its one-line note, the sheet's "why" and "pass" instead.
4. **Score:** the sheet's own, well 3 / adequately 2 / badly 1 / missing 0,
   over judged points only.

### The section
- **Title:** "The full CRO checklist". It says how many of the 377 points
  apply to this store.
- **Scorecard:** total score, "points to fix", "critical points failing",
  "points done well", and one bar per area linking to its group.
- **Filter:** All / Critical / High / Medium / Low.
- **Per area:** cards for the points to fix, Critical first and then the
  worst verdict. Critical cards open by default. "Done well (N)" is folded
  underneath.
- Bilingual. Restyled by the round 16 panel layer for the buyer.

### How to check it
- Preview with a real run:
  `npm run preview-report -- --path=tracking --fud --clarity --site --role=media_buyer --no-ar --checklist=output/checklist-tharaa.shop.json`
- Real run on saved evidence:
  `npx tsx src/checklist-run.ts output/fud-tharaa.shop-evidence.json media_buyer`

### Verification
- `tsc --noEmit` clean; worker tests 116/116 (7 new):
  - 377 unique checkpoints with text and importance;
  - scope (no checkout/landing without pages);
  - verdict parsing, and n/a and can't-tell dropped and not scored;
  - write-ups all-or-nothing, long fields kept;
  - the sheet's scoring, critical count;
  - batching.
- Root `npm run build` passes.
- Layout checked with a hand-made result (EN desktop, AR phone, an open
  card, the importance filter).
- **Bug fixed during the round:** the Arabic steps showed in English mode.

### Known limits
- **Cost and time:** about 7 verdict calls plus about 1 write-up call per 6
  failing points, 3 at a time. That adds several minutes and a real share of
  the account's usage to each audit. `CRO_CHECKLIST=off` disables it.
- **Overlap:** some checklist points overlap the 48 CRO rules above (e.g.
  shipping cost in the cart). The rules stay the prioritized summary; the
  checklist is the complete list.
- **The sheet's own text is English only.** Arabic readers get the AI's
  Arabic headline, findings and steps, with the sheet's checkpoint and
  "check it yourself" in English.

### Decision
Pending review.

---

## Round 17 — CRO engine: 15 new rules from the landing-page framework (fud-2.1.0)

**Status:** ✅ approved 2026-11-02 (by moving on to round 18), staged, not committed. Builds on rounds 1–16.
**Reader:** every reader. The conversion review engine is shared, so all
reports get the new rules. In the buyer report they also slot into the
paid-visitor stages.
**Files:**
- `src/fud/rules-cro.ts`: 15 rules.
- `src/fud/signals.ts`: 11 text patterns, EN and Egyptian/Gulf AR.
- `src/fud/rule-actions.ts`: owner and "done when" for each rule.
- `src/fud/rules.ts`: `RULE_SET_VERSION` fud-2.0.0 → **fud-2.1.0**.
- `src/fud/sample.ts`: 6 preview findings.
- `src/fud/fud4.test.ts`: new tests.
- `package.json`: test list.
- `src/html-report.ts`: buyer stages.

### Reference material (user-supplied)
- **Wireframes zip:**
  - mobile and desktop wireframes for homepage, product page, collection,
    sales, listicle, top-X, advertorial, quiz, lead-gen, webinar, SaaS,
    service and single-product homepage;
  - a "Page layouts" deck (AIDA → ATIDCOA: Attention, Transformation,
    Interest, Desire, Comparison, Objections, Action);
  - a landing-page case study (2% → 7% CVR);
  - before/after examples for home, product page and cart.
- **Assets zip:**
  - the ATIDFA framework (Attention, Transformation, Interest, Desire, FAQ,
    Action);
  - high-converting homepage layouts.
- Read with PDF.js installed in the session scratchpad, outside the repo,
  since no PDF renderer was installed. Wireframes were rendered to images
  and read section by section.

### Coverage before → after
The 33 rules covered trust and cost (shipping, COD, returns, size, stock,
reviews, badges, contact), homepage clarity, product page basics,
navigation, collection cards, order value, repeat buying, Arabic and
popups. Missing were most of the framework's page structure. Added:

| ID | Page | Rule | Framework source |
|---|---|---|---|
| H3 | Home | An offer bar at the very top | Before/after #1 (free-shipping bar) |
| H4 | Home | A rating on the first screen | "Rated 5/5 by 15,000+", homepage wireframe |
| H5 | Home | Three benefits under the headline | Hero ✓ points |
| H6 | Home | The main button says what happens | "Shop bestsellers" vs "Shop now" |
| P5 | Product | The product headline sells a benefit | "Value proposition featuring benefit" + ✓ points |
| P6 | Product | What happens after you order, in steps | Transformation |
| P7 | Product | Benefits come before features | Interest: benefits, then features |
| P8 | Product | Customer photos or videos | Desire: UGC and social proof |
| P9 | Product | A comparison with the alternative | Comparison table (ATIDCOA) |
| P10 | Product | An FAQ answers the last doubts | FAQ (ATIDFA) / Objections |
| P11 | Product | The page ends with a reason and a buy button | Repeated action |
| P12 | Product | Says what's included | "What's included?" |
| K1 | Cart | The cart shows what they saved | Cart before/after #4 "You saved" |
| G1 | Collection | Opens with a promise and a rating | Collection wireframe header |
| G2 | Collection | Badges help shoppers choose | "Selling fast" badges |

**33 → 48 rules.** All new rules are WARN at most (`autoFail: false`):
they're opportunities, so a store is never failed on them.

### Full change list
1. **Rules** have a judge question, pass/warn definitions, PEXTI defaults,
   funnel step and layout flag. Each gets a deterministic second opinion from
   page evidence:
   - text near the top of the page (offer bar);
   - first-screen ratings and check-marked points;
   - generic hero button labels;
   - how-it-works / FAQ / comparison / UGC / what's-included text;
   - a FAQ link only (gives "elsewhere");
   - photo-review apps (Loox, Okendo);
   - a "You saved" line in the cart, checked only when the product is
     discounted;
   - collection badges.
   P7 and P11 are judgement only.
2. **Patterns:** `offer`, `ratedBy`, `checkMark`, `genericCta`, `howItWorks`,
   `whatsIncluded`, `ugc`, `comparison`, `faq`, `savings`, `merchBadge`.
   They use the normalized Arabic spelling.
3. **Actions:** owner and "done when" in EN/AR for all 15.
4. **Buyer report stages:**
   - H3–H6 → "The first screen after the click";
   - G1–G2 → "Finding the product";
   - K1 → "In the cart";
   - product rules → "At the buy button".
5. **AI cost:** the judge reviews 16 rules per call, so 33 rules took 3 calls
   and 48 still take 3 calls, each fuller.
6. **Version:** bumped to fud-2.1.0, so new findings are told apart from
   older runs.

### How to check it
`http://localhost:5173/audit-reports/local/round17-icp2-after.html#friction`
(before: `round17-icp2-before.html`). New stage "The first screen after the
click" (H5). "At the buy button" now holds 7 problems (P6, P8, P9, P10
added); "In the cart" has the "You saved" tab (K1).

### Verification
- `tsc --noEmit` clean; worker tests **109/109** (5 new in `fud4.test.ts`):
  - 48 unique rules, version fud-2.1.0;
  - every rule has an action, and every new rule is WARN at most;
  - patterns read EN and Egyptian AR;
  - each detector flags the good case and the bare case (incl. FAQ link-only
    → elsewhere, K1 only for discounted products, H6 generic "تسوقي الآن").
- The preview renders with no errors.

### Known limits
- **Not run against a live store in this round.** The judge's wording for
  the new rules comes from a real AI call. The preview findings are written
  samples.
- Detectors read text and layout; they can't see images. The AI judge sees
  the screenshots and decides; the detectors are the second opinion.
- The 'sales', 'listicle', 'advertorial', 'quiz', 'lead-gen', 'webinar' and
  'SaaS' wireframes describe page types the audit doesn't visit (it visits
  home, a collection, a product and the cart). They're kept for a later
  landing-page audit.

### Follow-ups
- **Round 18 rewound by the user** (`/rewind`). The rewind restored files changed with the file-edit tools but left round 18 staged in git, plus files it created or changed by script: `manual-checklist*.ts`, `spot*.ts`, `checklist-run.ts`, and edits in `fud/index.ts`, `judge.ts`, `supabase.ts`, `evidence.ts`, `preview-report.ts` and `package.json`.
  - Put back to the round 17 state: the four fud/supabase files from the last commit; only round 18's lines taken out of `preview-report.ts` and `package.json`; created files moved out and unstaged.
  - Every version (staged and on disk) is kept in the session scratchpad under `round18-backup/`.
  - Checked: no round 18 trace left; staged files match the end of round 17; tsc clean; 109/109.
- **Scroll guide stopped early (user report), a round 12 regression.** The guide draws its rail only with ~190px free right of the text (`measure()`). Round 12 widened the page to 1280px and the text to 960px, leaving ~168px at 1440px, so it fell back to the small dot.
  - Page is now 1240px and text 860px: rail back at 1440px and 1366px.
  - It also re-measures when the content changes height (a `ResizeObserver` on `.content`). Carousels settling, results opening and tiles sizing had left the path ending ~175px short.
  - Path now ends at 29,858 against the button at 29,861.
  - Carousels and Budget check maths re-checked.

### Decision
Approved 2026-11-02: the user moved on to round 18.

---

## Round 16 — Media buyer (ICP2): design overhaul, "the media buyer's instrument panel"

**Status:** ✅ approved 2026-11-02 (by moving on to round 17), staged, not committed. Builds on rounds 1–15.
**Reader:** ICP2, media buyer only. Everything sits under `body.is-buyer`; the
store owner and other readers are unchanged (checked).
**Files:** `src/html-report.ts`.

### The ask
"A new overhaul with the design. Don't remove anything, but overhaul
everything: curves, radii for containers, more animations, things that dazzle,
based on the ICP. Massive."

### Design plan
- **Concept: an instrument panel for a media buyer.** The modules they work
  with (click to cash, scoreboard, Break-even, Budget check, learning phase,
  carousels, dev pack, owner handover, the ad box) are panels. Findings,
  campaigns, tiles and equation parts are cards inside them.
- **Radius hierarchy, not one radius everywhere:**
  - panels 28px (22px on phones);
  - cards 20px;
  - inputs and buttons 12px;
  - chips fully round.
- **Surfaces:**
  - smoked glass (a faint top-down gradient);
  - a hairline top highlight and a deep soft shadow;
  - status edges on cards are thin glowing rails: mint for winners, coral
    for leaks, amber to watch.
- **Brand kept:** black page, mint #6AE499 = profit/signal, coral #FF6B57 =
  leak/loss, amber = watch; Sora headings, Inter body, Noto Sans Arabic. Solid
  white headings (gradient text was tried and dropped as decoration).
- **One memorable element: the break-even dial** (below). Motion elsewhere is
  only for data moving or the reader's input changing something, not
  fade-ups on every section.

### Full change list
1. **Break-even dial** in the calculator, under the break-even number:
   - **Arc:** coral below break-even, mint above, with a glowing white
     notch at the store's break-even ROAS.
   - **Needle:** swings to the ROAS the buyer types and settles with a small
     overshoot, like a real gauge. It glows coral or mint.
   - **Readout:** "Your 2.50× is 0.59× under break-even." / "Your 4.20× is
     1.11× above break-even." (EN/AR).
   - **The scale fits the numbers** (e.g. 0–7×).
   - **Empty states:** "Fill in your margin and COD rates to draw your
     break-even." / "Type your Ads Manager ROAS to place the needle."
   - The calculator now also publishes the typed ROAS (`window.__beUser`).
2. **ROAS meter on every campaign card** once spend is typed: a bar to the
   campaign's ROAS with a "break-even" notch. Mint glowing when profitable,
   coral when losing. It fills from the right in Arabic.
3. **Panels and cards:** every module above restyled with the radius scale
   and glass surfaces.
   - **Scoreboard:** rows on a panel; verdicts become tinted pills; numbers
     glow by status; arrows nudge on hover.
   - **Campaign cards:** a glowing side rail. The winner's pill shimmers, the
     leaking pill breathes, and the winner card has a mint under-glow.
   - **Budget check:** a mint-lit panel.
   - **"Your ad" box:** a warm highlight.
   - **ROAS equation:** the result tile glows.
4. **Tables** (what the tap sent, pixel map, unpaid traffic): rounded
   containers, header band, hover rows.
5. **Controls:** 44px inputs with a mint focus ring; presets light up when
   chosen; 12px buttons.
6. **Hero:**
   - the date and site line and the "what we checked" line become pill chips
     with status dots (grey for "Checkout: not observed");
   - a faint chart-paper grid behind the headline;
   - grain over the page;
   - a bigger, tighter headline.
7. **Section heads:** larger (up to 42px) with a short mint signal line that
   draws in when the section arrives. Lane numbers become glowing mint discs.
8. **Data motion** (only when motion is allowed): speed, learning-phase and
   ledger bars grow from zero in sequence; big figures count up to their exact
   value; the ROAS equation assembles tile by tile; a live result slides open
   when spend is typed; profit figures flash when the buyer's input changes
   them.

### How to check it
`http://localhost:5173/audit-reports/local/round16-icp2-after.html` (before:
`round16-icp2-before.html`).
- Scroll slowly from the top.
- In Break-even, type a ROAS (2.5, then 4.2) and watch the dial.
- In Your campaigns, type spends.
- Switch to عربي, and try a phone width.

### Verification
- `tsc --noEmit` clean; worker tests 104/104.
- **Motion on, scrolled with the mouse wheel**, desktop and phone, EN and AR
  (`r16test.mjs`):
  - all 30 counted figures end on their exact text;
  - no bar or tile left hidden;
  - every section reached on desktop;
  - no page errors, no sideways scroll.
- **Dial:** 2.5 → coral, "0.59× under"; 4.2 → mint, "1.11× above".
- **Meter:** 87% fill, notch at 27%.
- **Still passing:** carousels (`car13.mjs`), Budget check maths
  (`cp15.mjs`: −5,224 / −1,513), and the empty-fields real audit (dial empty
  state, then 3.09× / 81% / −1,513 once typed).
- The store-owner report has no buyer class, dial or new script.
- **Bug fixed during the round:** section triggers first needed 5% of a
  section visible, which a phone section taller than 20 screens can never
  show. Now any part counts.
- **A test artifact, not a site bug:** repeated programmatic smooth-scrolls
  stall in headless phone emulation. Real wheel/touch scrolling passes
  through the whole page.
- Shots: `shots/branch/r16-*.jpg`, section set in `r16after/`.

### Known limits
- **Design hook findings:** gradient text was removed and the meter now
  animates with transforms. **The needle's overshoot easing was kept on
  purpose:** an analog gauge settling is the motion being drawn.
- Grain and glass add a little paint cost. Grain is one fixed layer; there is
  no blur on scroll.
- Print hides the grain and the grid; bars print full.

### Decision
Approved 2026-11-02: the user moved on to round 17.

---

## Round 15 — Media buyer (ICP2): spend in, real money out (per-campaign profit and budget moves)

**Status:** ✅ approved 2026-11-02 (by moving on to round 16), staged, not committed. Builds on rounds 1–14.
**Reader:** ICP2, media buyer only.
**Files:** `src/html-report.ts`.

### What it yielded
Round 14 showed what each campaign brings (GA4 revenue, sales, visits). The
buyer knows the other half: what each one cost. Now they type it in, and the
report answers the question they're paid to answer: **is this campaign making
or losing money, and where should the budget go?**
- **On every campaign card, a spend box.** Live result:
  - **Figures:** GA4 ROAS, CPA, the CPC they actually pay, and profit after
    ads.
  - **A plain verdict.** Example (reels, spend EGP 6,000): "Losing about EGP
    5,224 at this spend. ROAS 0.40× is under break-even 3.09×. You pay EGP
    2.31 a click. A click is worth EGP 0.30 to you. Fix the leak above, or cut
    the budget."
- **"Budget check" panel at the top of the section:**
  - **Totals:** spend entered, GA4 revenue, blended ROAS, profit after ads.
  - **Moves, ranked:** each losing campaign with what it loses, then the best
    return with "move part of the EGP X there, in steps: ROAS drops as you
    scale".
- **One break-even for everything.** The Break-even calculator now publishes
  its break-even ROAS (`window.__beRoas`, event `be:change`). The campaign
  cards use the same number, so margin, COD confirmation, delivery and
  shipping all flow in. Changing the margin from 40% to 60% moved break-even
  from 3.09× to 2.06× and flipped a campaign from loss to profit, live.
- **Break-even CPC changed definition:** it was RPV × margin (round 14), and is
  now RPV ÷ break-even ROAS. That includes COD losses and shipping, so it's
  stricter and more honest.
- **The GA4-vs-Ads-Manager point:** GA4 credits the last click and Ads Manager
  counts views and older clicks, so Ads Manager shows a higher ROAS. A gap
  over 2× usually means a counting problem, with a link to the tracking
  section (this ties the money back to the tracking/CRO findings).

### Full change list
1. **Calculator:** `be` is hoisted, exposed as `window.__beRoas`, and fires a
   `be:change` event on every recalculation.
2. **Campaign card:**
   - It now carries data attributes (key, name, revenue, sales, visits,
     verdict).
   - New spend input and live block: ROAS (GA4), CPA, CPC you pay, profit
     after ads, and the verdict sentence (EN/AR).
3. **Section:** new "Budget check" panel with an empty state, totals, ranked
   moves and the last-click note. The lead now invites typing the spend.
4. **`CAMPAIGN_SCRIPT`:**
   - Maths: profit after ads = GA4 revenue ÷ break-even ROAS − spend.
   - Spend is saved per report in this browser only.
   - Re-runs on typing, on `be:change`, and on a language switch.
   - Campaign names are inserted as text, never HTML.
5. **Arabic fix:** metric values align under their labels in RTL.
6. **Follow-up (user: "how is that a losing when the budget is 20k and the revenue is 57k?"):** the maths was right but invisible. Revenue is sales, not money kept: with the calculator's sample 40% margin and COD rates, only 81% of orders are paid and 40% of that is left, so EGP 57,200 leaves EGP 18,487 before ads. Each card and the Budget check panel now show the waterfall: "Sales EGP 57,200 → paid after COD returns EGP 46,218 (81%) → after product cost EGP 18,487 (40% margin) → after EGP 20,000 of ads: −EGP 1,513", plus "Margin and COD rates come from the Break-even calculator above. Put in your own." The calculator now also publishes its inputs (`window.__beParts`). Each campaign's profit uses its own order count for shipping, and its own break-even ROAS (equal to the store's when shipping is 0).
7. **Follow-up (user: keep them empty in actual audits, keep numbers for the one we test):** the Break-even calculator's margin, COD share, confirmed, delivered and shipping fields used to start pre-filled with sample numbers I chose in round 1 (40 / 60 / 85 / 80 / 0). Those gave the 81% paid share and the 3.09× break-even. **Real audits now start with these fields empty.** Only AOV comes from GA4. Until the reader types them, no profit or loss shows anywhere: cards and the Budget check say "Fill in the Break-even calculator above…", and ROAS (revenue ÷ spend) still shows. The note under the fields reads "Type the store's margin and COD rates. Only the order value comes from GA4." **The dev preview keeps the sample numbers.** New `ReportAssets.sampleInputs`, set only by `preview-report.ts` through `buildAuditHtmlReport(result, { sampleInputs: true })`. `--empty-inputs` renders the preview the way a real audit looks (`output/round15-icp2-real.html`). Files: `src/html-report.ts`, `src/html-report-node.ts`, `src/preview-report.ts`. Checked headless: empty → no numbers invented; after typing 40/60/85/80 → 3.09×, 81%, −EGP 1,513, no errors.

### How to check it
`http://localhost:5173/audit-reports/local/round15-icp2-after.html#campaigns`.
Type spends: ramadan 20000, reels 6000, retargeting 5000. Then change the
margin in Break-even and watch the cards and the panel move.

### Verification
- `tsc --noEmit` clean; worker tests 104/104.
- Headless (`cp15.mjs`), desktop and phone, EN and AR. The maths matches a
  hand check:
  - reels −5,224;
  - ramadan CPA 385, CPC 3.85, −1,513;
  - panel +4,164;
  - margin 60 → break-even 2.06×.
- Spend survives a reload; no errors; no sideways scroll. Carousels still
  pass.
- Shots: `shots/branch/r15-{plan,card}-{desktop,mobile}-{en,ar}.jpg`.

### Known limits
- GA4 last-click revenue undercounts what Ads Manager credits, so the profit
  figure is conservative. Said on the page.
- Spend is typed by hand. The audit never sees ad accounts.
- The "move budget" line assumes the best campaign's ROAS holds. The page
  says ROAS drops as you scale.

### Decision
Approved 2026-11-02: the user moved on to round 16.

---

## Round 14 — Media buyer (ICP2): "Your campaigns, one by one"

**Status:** ✅ approved 2026-11-02 (by moving on to round 15), staged, not committed. Builds on rounds 1–13.
**Reader:** ICP2, media buyer. Other readers don't see the section; the extra
GA4 metric is pulled for every audit.
**Files:**
- `api/_lib/google-oauth.js`: `purchaseRevenue` added to the trafficSources report.
- `src/types.ts`: new `Ga4CampaignRow`, optional `Ga4Facts.campaigns`.
- `src/ga4-facts.ts`: rows carried into the facts, top 40 by visits.
- `src/preview-actions.ts`: sample campaigns, dev only.
- `src/html-report.ts`: the section.

### The ask
One section with every campaign type, its UTMs, numbers, RPV, AOV and CVR, and
a comment per campaign in the buyer's terms ("that's why your ads are
leaking"). Edit an existing section if one exists. **None did:** the only
campaign view was one finding row (GA4-07, the single worst campaign), and the
unpaid channel chart was removed from the buyer report in round 11. So it's
new, placed right after Break-even ROAS.

### Full change list
1. **Data:**
   - The GA4 trafficSources report now also asks for `purchaseRevenue`. It's
     appended last, so every existing reader of that report is unchanged.
   - `computeGa4Facts` saves the rows (channel, source, medium, campaign,
     visits, engaged visits, cart adds, sales, revenue) in `ga4Facts.campaigns`.
     They're stored with every report, so `report-rows`/Supabase needed no
     change.
2. **Section `#campaigns`:**
   - **Top tiles:** store CVR, AOV and RPV. "X% of paid visits go to N leaking
     campaigns."
   - **Tracking warning:** shown when sales are counted twice ("every CVR here
     may be too high").
   - **Paid groups:** grouped by type (Paid Social, Paid Search, Shopping,
     Video, Display…), each with its totals. One card per campaign, with:
     - platform chip (Meta, TikTok, Snapchat, Google…), name, and the three
       UTM tags;
     - Visits, Add to cart, CVR, Sales, Revenue, AOV, RPV and Break-even CPC;
       green ↑ / red ↓ against the store;
     - a verdict: Winner / Average / Below average / Leaking / Too early /
       No name.
   - **"That's why it leaks":** follows the step where the campaign breaks:
     - low engagement → landing page, speed, ad match;
     - low add-to-cart → offer, price, product page;
     - carts that don't buy → checkout, shipping, COD, trust;
     - else → audience.
   - **Winners:** "scale this one first". Warm/retargeting names get "judge it
     on new buyers".
   - **Order size:** a small/big-order note on AOV.
   - **Untagged campaigns:** "add utm_campaign".
   - **Under 100 visits:** "too early to judge".
   - **Break-even CPC** = RPV × gross margin, live from the Break-even
     calculator's margin field.
   - **Unpaid traffic** (organic, direct, email…) in one comparison table.
   - Top 8 campaigns per type; the rest fold under "N more campaigns".
3. Contents list, phone bar and guide stop added. EN and Egyptian AR, short
   sentences.

### How to check it
`http://localhost:5173/audit-reports/local/round14-icp2-after.html#campaigns`
(before: `round14-icp2-before.html`). Change the margin in Break-even and
watch every Break-even CPC update.

### Verification
- `tsc --noEmit` clean; worker tests 104/104. Root tests 137 pass / 29 fail,
  the same 29 as before the rounds.
- Headless: no page errors, no broken links. Shots:
  `shots/branch/r14-after-{en,ar}-{desktop,mobile}.jpg`.

### Known limits
- **The per-campaign comments are written by rules from the numbers, not by
  the AI.** They're consistent and checkable. An AI-written note per campaign
  would need a new step in the audit run (not built).
- Only new audits have campaign data. Saved reports, and audits through the
  shared GA4 account rather than the OAuth popup, don't show the section.
- GA4 last-click attribution. Ads Manager will credit campaigns differently.
- Platform comes from `utm_source`; an unusual source shows as itself.

### Decision
Approved 2026-11-02: the user moved on to round 15.

---

## Round 13 — Media buyer (ICP2): "What your numbers can run" (learning phase and audiences)

**Status:** ✅ approved 2026-11-02 (by moving on to round 14), staged, not committed. Builds on rounds 1–12.
**Reader:** ICP2, media buyer only. Other readers unchanged.
**Files:** `src/html-report.ts`.

### What it yielded
The report diagnosed, but didn't say what to set up in Ads Manager. Two
answers an expert buyer checks first can be worked out from the store's own GA4
funnel, so a new section now gives them, right after Break-even ROAS:
- **Learning phase.** Meta and TikTok need about 50 optimization events per ad
  set in 7 days to leave learning. Weekly events ÷ 50 = how many ad sets each
  event can feed. On the preview: Purchase 92/week → 1 ad set; InitiateCheckout
  123 → 2; AddToCart 300 → 6; ViewContent is marked "traffic signal only".
  Our call: "Optimize for Purchase. 92 a week feeds 1 ad set. … keep the
  structure tight." With too few purchases, it names the deepest event that
  can still learn.
- **Audiences you can build today.** Up to 13,800 viewed a product with no cart;
  831 carted without buying; 123 started checkout without buying; 369
  bought. Each tile has one line on how to use the pool. Buyers get "big
  enough to seed a lookalike (100+)" when they are.
- **Tied to the tracking verdict** (the CRO/tracking identity): "Careful: 3
  tracking problems count extra sales. Real numbers are lower, so plan for
  fewer ad sets. See the count ↑". Missed sales say the numbers go up after
  the fix.

### Full change list
1. New `adSetupHtml` (`#ad-setup`):
   - Learning-phase bars on a log scale, with a marker at 50 a week.
   - Weekly count per event, the ad sets it can feed (10+ caps), and a
     highlighted pick.
   - "Our call" line and a tracking-trust warning linking to lane 1.
   - Audience tiles, labelled "up to", with the event maths under each
     (e.g. `AddToCart − Purchase`).
2. Placed after Break-even in the page, the contents list, the phone bar ("Ad
   setup") and the guide stops.
3. EN and Egyptian AR; short sentences (round 12 rule).

### How to check it
`http://localhost:5173/audit-reports/local/round13-icp2-after.html#ad-setup`
(before: `round13-icp2-before.html`). Switch to عربي; phone width.

### Verification
- `tsc --noEmit` clean; worker tests 104/104.
- Headless: no page errors, no broken links, no sideways scroll; carousels
  still pass (`car13.mjs`, desktop/phone × EN/AR).
- Shots: `shots/branch/r13-after-{en,ar}-{desktop,mobile}.jpg`.

### Known limits
- GA4 funnel counts are events. Meta optimizes on events too, so the
  learning maths fits. Audiences are people, so the tiles say "up to", and Meta
  will match fewer.
- The 50-a-week rule is Meta's and TikTok's published guide. Google Ads bidding
  isn't modelled.
- Needs the GA4 funnel; without GA4 the section doesn't show.

### Decision
Approved 2026-11-02: the user moved on to round 14.

---

## Round 12 — Media buyer (ICP2): visualize, breathe, carousels, margins, short sentences

**Status:** ✅ approved 2026-11-02 (by moving on to round 13), staged, not committed. Builds on rounds 1–11.
**Reader:** ICP2, media buyer for the layout and visuals. The short-sentence
rule (5) also reaches every reader: shared checklist defaults and the AI prompts.
**Files:** `src/html-report.ts`, `src/buyer-verify.ts`, `src/checklist.ts`,
`src/audit-prompt.ts`, `src/translate-ar.ts`, `src/fud/judge.ts`.
**Patches (scratchpad):** `round12-icp2.patch` (first pass), `round12b-carousel.patch` (with the redesign).

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
2. **Carousels, first version** (replaced by item 7) (`carouselHtml` + `CAROUSEL_SCRIPT`): each "After the click"
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
- Redesigned carousels (`car13.mjs`): Next steps 1 → 2 → 3, the card on show
  is fully in view, the panel height matches the card, tab 1 jumps back to
  card 1, Next disables at the end. All four (desktop/phone × EN/AR) pass.
- Screenshots: `shots/branch/r12-car2-{desktop,mobile}-{en,ar}.jpg`.
- Store owner report: same section order. It doesn't get the buyer class,
  carousels or carousel script; only the shared CSS is present.
- Sentence audit script: `sentences.mjs` (scratchpad).

### Known limits
- AI-written finding text follows the new rule only on new runs; saved
  reports keep their old wording.
- The generated persona checklist still has long defaults (source file not
  in the repo).
- In a carousel, a card with a tall screenshot pushes the footer arrows
  below the screenshot. The tabs on top stay in reach.

### Decision
Approved 2026-11-02: the user moved on to round 13 after the carousel redesign (item 7).

---

## Round 11 — Media buyer (ICP2): the whole report, ordered by what the buyer wants first

**Status:** ✅ approved 2026-11-01 (by moving on to round 12), staged, not committed. Builds on rounds 1–10.
**Reader:** ICP2, media buyer only. Store owner and marketing manager orders checked unchanged.
**Files:** `src/html-report.ts` only.

**Changed later:**
- Round 12: the ROAS formula lead became equation tiles with the store's numbers; the "moved up" note and All-checks intro were shortened. Section order unchanged.

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

### Decision
Approved 2026-11-01: the user moved on to round 12. Two follow-ups were asked and done inside this round (items 8 and 9: mockups under the headline, one-row phone section bar).

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

### Decision
Approved 2026-11-01: the user moved on to round 11 without changes.

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

**Changed later:**
- Round 12: the Clarity page-errors line is now one of the stat tiles.

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
- Round 12: each stage's problems are a tabbed carousel (one card at a time) instead of a vertical list. The stage grouping, the leak marker and the cause line are unchanged.

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

**Changed later:**
- Round 11: the "moved up" notes link to whichever section holds each problem (the count or the site), since "What's holding your ROAS back" was split.
- Round 12: the "moved up" note and the All-checks intro were shortened.

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

**Changed later:**
- Round 11: speed moved after Clarity in the buyer report.
- Round 12: the speed gauge cards became one bar chart; the "Google scores each page…" line became the chart's legend. The buyer's Clarity list became stat tiles.

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
- Round 12: the phone-visit facts (Add to Cart, WhatsApp, sold-out) are tiles instead of a list, and their sentences are shorter. The events table and the developer pack are unchanged.

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
- Round 12: every "Check it yourself" step (`buyer-verify.ts`) rewritten as short sentences, one action or one expectation each, EN and AR.

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

**Real run (tharaa.shop, media_buyer, 2026-11-02):** 249 run, 166 shown, 83 dropped, 128 written up, score 59%. No "doesn't apply"/"can't tell" cards. EN write-ups average: found 45 words, means 50, problem 37, fix 76, done 18. 2 write-up calls timed out at 8 min. Fix: EXPLAIN_BATCH 6 to 4, TIMEOUT_MS 8 to 12 min. The 9 missing write-ups were then filled by a dev-only script (output/fill-explains.ts, gitignored): 3 calls of about 75s each, 9 of 9 written. Now all 137 failing cards have a full write-up. Checked at 1440px: no sideways scroll; EN and AR both render. Tests 116/116.
