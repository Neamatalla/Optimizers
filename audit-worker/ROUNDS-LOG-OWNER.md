# Report rounds log: store owner (ICP1)

One entry per round of improvements to the **store owner** report
(`src/html-report.ts` and what feeds it), newest first. Same shape as the media
buyer's log (`ROUNDS-LOG.md`), which is the scale reference. Branch:
`feature/store-owner-icp`. Plan and rules: `OWNER-ROUNDS-PLAN.md`.

Status key: 🟡 staged, waiting for review · ✅ approved · ⏪ reverted

Rounds build on each other: each one starts from the previous round's code.
When a later round replaces part of an earlier one, the earlier entry says so
under **Changed later**, so each entry still matches what's live.

---

## Round 8 — Store owner (ICP1): what the Ministry checks

- New shared detector `src/fud/ministry-checks.ts` (+ `ministry-checks.test.ts`, in `npm test`): SBC/Maroof badge, CR, VAT (15-digit 3…), phone, email, returns/exchange, terms, privacy, delivery time before purchase (Round 7 `PATTERNS.deliveryTime`), complaint channel. Reads loaded pages' text, policy links and widgets. `null` when no page loaded (never "missing" unseen). `saudi` = SAR / `.sa` / SAR text.
- Stored as optional `FudResult.ministryChecks` (types.ts), filled in `fud/index.ts`; sample (`fud/sample.ts`) shows a mix: SBC, delivery time, complaints not seen.
- Owner block `#owner-ministry` (`ownerMinistryHtml`, `.is-owner`, owner only, after "What your customer pays"): ✓ / not seen, one rule line (Salla obligations, research §3), fix and admin path (policies/shipping) when not seen; "check with your accountant or lawyer" on CR/VAT; non-Saudi note "Saudi rules: may not apply to your country". Media buyer report unchanged.
- Note: research file has no "Q3" section; rules taken from §0 fact 5 and §3 table.
- Checks: tsc clean, tests 168/168, `\b` grep 0, render + shot OK. Screenshot `output/owner-round8-ministry-390.png`; render `output/owner-round8-after.html`; patch `output/owner-patches/round8.patch`.
- Untracked (new): `src/fud/ministry-checks.ts`, `src/fud/ministry-checks.test.ts`.

## Round 7 — Store owner (ICP1): what your customer pays and how they can pay

**Status:** 🟡 staged (not committed)

- New shared detection `src/fud/cost-signals.ts` (+ `cost-signals.test.ts`, in `npm test`): from product/cart/checkout text, payment methods seen (mada, Apple Pay, STC Pay, Tabby, Tamara, COD), and before checkout (product + cart) whether the delivery fee, COD fee and "VAT included" show, the delivery-time promise and a free-delivery threshold amount. `null` when those pages weren't visited. Saved on `FudResult.costSignals` (fud/index.ts; optional, older runs lack it); sample in `fud/sample.ts`.
- New owner-only section `#owner-pay` (`ownerPayHtml`, after `#owner-visit`): method chips ✓ / "not seen"; rows ✓ / ✗ / "not seen" for delivery fee, COD fee (only when COD seen), VAT, delivery promise. Each ✗ has a one-line fix and "Where in your admin" (`adminPathFor`).
- Free-delivery calculator: GA4 AOV + typed delivery cost (localStorage `owner-delivery:<host>`, try/catch; empty on real audits, 25 only with `sampleInputs`) → threshold ~1.3× AOV (range 1.2–1.4×, rounded), cost per free order, and built-into-price % option. Compares a detected site threshold with AOV. Tabby Nov 2025 research line. No AOV: says GA4 is needed.
- Buyer report unchanged (gated on owner). Checks: tsc, 165 tests, backspace grep 0, render + shot OK, calculator typed in puppeteer (no page errors).
- Files: `output/owner-round7-after.html`, `output/owner-round7-ar.png`, `output/owner-patches/round7.patch` (tracked files only).
- **New untracked files:** `src/fud/cost-signals.ts`, `src/fud/cost-signals.test.ts`.

## Round 6 — Store owner (ICP1): what our phone visit saw

- New owner-only section `#owner-visit` (`ownerVisitHtml`, after the action plan): tiles from `siteChecks` for Add to Cart, broken WhatsApp links (shows the number), sold-out products up front, checkout log-in wall (`signal.checkoutLogin` or the checkout note), autoplay hero video, pages visited. Only tiles with data.
- Each tile: what we saw, one line on why it costs sales, who fixes it (`LANE_LABEL`), plus "Where in your admin" for WhatsApp when the platform path is known.
- "Send to your developer" button: plain-text tickets (what's wrong, the change, done when, how to check) for dev-lane failed points, in the current report language. Same copy script as the buyer's dev pack, no internal ids.
- "What we can't see yet": real orders vs GA4, COD refusals, delivery times by city, admin settings.
- Bug fix: `ownerMoney` puts both ends in the high end's unit ("5.3K–11.3K", never "5,250–11.3K") inside an LTR isolate; `ownerLtr()` turns it into `<span dir="ltr">` over the owner body, so AR keeps low–high order. Same notation in EN and AR.
- Buyer report unchanged (all new code gated on the owner persona). Checks: tsc, 161 tests, backspace grep 0, render + shot OK.
- Files: `output/owner-round6-after.html`, `output/owner-round6-ar.png`, `output/owner-patches/round6.patch`.

## Round 5 — Store owner (ICP1): from visit to order

**Status:** 🟡 staged (not committed)

**Changes:** New `ownerLedgerHtml` replaces "Your numbers" for the owner (`#numbers`, owner-scoped `.ol-*` CSS). Steps in Salla names: Visits → Add to cart → Cart view (says "Not in GA4", no number) → Checkout started → Order completed; each rate vs "typical stores" (`STEP_BENCHMARKS`); very low rates flagged as a likely tracking gap. Money lost per weak step as a range, "estimate, from your GA4", never summed. Add-to-cart rate labelled as taps per product view, not people (C4). Typed "Orders in your store admin" input (localStorage per host, try/catch) → "GA4 sees X of your Y orders", ok/warn/bad. No GA4: says what's missing and how to connect. `ownerMoney` now uses the compact notation (`moneyRangeShort`/`compactMoney`): opening, plan tags and ledger share one notation.

**How to check:** tsc clean; `npm test` 161 pass; `\b` grep 0; owner tracking preview + `shot.mjs` OK (height 50,221); owner website preview shows the no-GA4 message; buyer text identical to `output/owner-round5-buyer-before.html` (rendered from this code with owner edits off: 0 diffs, 15/15 ids); root `npm run build` OK. Phone shot AR: `output/owner-round5-ledger-390.png`, section ~740px. Render: `output/owner-round5-after.html`; patch: `output/owner-patches/round5.patch`.

**Limits and decisions:** Per-step money uses the insights formula per step (25–50% of the gap, capped at +30%), so it can differ from the opening's biggest-finding figure; same notation, neither is a total. Arabic range keeps "K" and Western digits, and RTL can visually flip a range; values under 10K print in full ("6,174–12.3K"). Cart view skipped: GA4 has no such event. Typed orders stay in the browser only.

**New untracked files:** none this round (earlier rounds: `src/owner-admin-paths*.ts`, `src/owner-causes*.ts`, `src/preview-owner*.ts`, plan/log/research md).

---

## Round 4 — Store owner (ICP1): who does it and where in your admin

**Status:** 🟡 staged (not committed)

**Changes:** New `src/owner-admin-paths.ts` (+ test): platform detection (Salla, Zid, Shopify, WooCommerce, other) from HTML markers or `SiteChecks.platform`; three owners ("You, in your store admin" / "Whoever runs your ads" / "Your developer"); confirmed admin paths per topic (free delivery, COD, Tabby/Tamara, payments, reviews, WhatsApp, policies, SEO, GA4, shipping) with plan gates. `crawl.ts` guesses Salla/Zid before Shopify. `ga4-facts.ts` treats Salla `/slug/p123456` as a product page (old `/products/` match kept). Owner plan now has three groups; GA4/GTM/ads tasks moved out of "you". The opening "fix yourself" count, the hero line, the reader question and the lead all count admin-only fixes. Owner plan items show "Where in your admin" (owner CSS only). `icp/store-owner.md`: menu paths only from the confirmed list.

**How to check:** `npx tsc --noEmit -p .`; `npm test` (161 pass); `\b` grep = 0; preview `--path=tracking --role=store_owner ...` then `node output/shot.mjs` (height 50116). Render: `output/owner-round4-after.html`; patch: `output/owner-patches/round4.patch`.

**Limits and decisions:** Unknown topic or unconfirmed path (e.g. Salla WhatsApp button, Shopify COD fee) shows no line, never a guess. The tracking preview is all GA4/GTM work on a "Shopify" stub, so it shows no admin group and no path line; the path line shows on admin-lane fixes only. Lane is keyword + owner based, so a mis-tagged point can land in the wrong group. Media buyer report unchanged.

**New untracked files:** `src/owner-admin-paths.ts`, `src/owner-admin-paths.test.ts`.

---

## Round 3 — Store owner (ICP1): one home for everything

**Status:** 🟡 staged

- GA4/GTM check rows fold for the owner (one line, tap to open), same `folded` logic as the buyer. The check row is each finding's one full home.
- Action plan (`ownerPlanHtml`) items are now short links (title + severity + money) to their row; step / done-when live only in the row. Lead says "tap one to see...".
- "How this audit works" no longer lists sources for the owner; "Data sources" is their one place.
- "What's working: keep it" rebuilt: max 4 one-liners, live passes only, and a pass is dropped when a failed finding shares its topic (purchase, checkout, refund, consent, key event, ...) (C6).
- Phone height: 88,377px → 50,088px.
- Check: `http://localhost:5173/audit-reports/local/owner-round3-after.html`. Patch: `output/owner-patches/round3.patch`.
- Limits / decisions: C6 topic match is a keyword list, not a fact map. A pass of a negative check reads oddly in "keep it" ("Paid campaign that brings visits but no sales: in place"). Hero still names sources once; CRO checklist (~32k px) is untouched and now the biggest block.

## Round 2 — Store owner (ICP1): answer the owner's question first, "What's costing me sales?"

**Status:** 🟡 staged, waiting for review.
**Reader:** ICP1, store owner. Media buyer, marketing manager and agency
reports unchanged (checked, see Verification).
**Files:**
- `src/owner-causes.ts` (new): the root-cause catalogue (16 causes + "other"),
  every owner point (`SO-*`, shared ids, buyer ids through
  `PERSONA_SHARED_SOURCES`) and page-review rule mapped to one cause, the
  evidence chain per cause, the opening's answer and the numbers verdict.
  Pure, no HTML.
- `src/owner-causes.test.ts` (new): 7 tests, added to `npm test`.
- `src/html-report.ts`: the owner opening rebuilt; owner-only labels and
  contradiction fixes in the plan, friction, follow-up box, checklist, numbers,
  Clarity, speed, method, sources, contents, jump bar and guide;
  `OWNER_STYLES` for the opening.
- `src/preview-owner.ts`: the fixture's weakest-step title no longer says
  "Most sales are lost…".
- `icp/store-owner.md`: one rule so real AI text keeps "biggest" for the one
  money figure.
- `package.json`: the new test file in `test`.
- Untracked new files (not in the patch): `src/owner-causes.ts`,
  `src/owner-causes.test.ts`. Patch: `output/owner-patches/round2.patch`.

### The ask / what it yielded
The opening now answers the owner's own question. Before, it said "Bayt Al Oud
is losing about SAR 5,250–SAR 11,300 a month" (the phone gap, read as a total),
listed 3 fixes, and a second section answered five generic questions
backwards ("Does my store work well on phones? Yes: 1 problem found"). Now:

1. **The question and a verdict built from the results:** "What's costing Bayt
   Al Oud sales?" → "The phone experience first, then product pages that don't
   convince." (the two top sales causes, in money order).
2. **One "biggest":** "The biggest single figure: about SAR 5,250–11,300 a
   month, from the phone experience", with a source line that says what that
   figure compares (phones vs computers here; a page vs the store average, a
   product vs the other products, or a step vs a typical store elsewhere).
3. **Two short answers that read the right way round:** "Can you trust your
   sales numbers? **No** · 10 problems in how your sales are counted" and "What
   can you fix yourself? **8 of 27** fixes need no developer: 7 in your action
   plan, 1 in what stops your shoppers buying."
4. **Every problem grouped by root cause (M8):** "Where your sales go: 11
   causes", biggest money first, the first 2 open. Each cause: what we saw
   (each line linked to its row, with its source: your Google Analytics / Tag
   Manager / your store's pages / our phone visit, plus Google's speed test
   and Clarity as context for "phones"), what it costs (its own largest GA4
   range and what it compares, or why there's no money figure), what to do
   first (+ who), how sure we are (very sure / fairly sure / check it first,
   from its sources).
5. **One honest count:** "We ran 58 checks: 50 on Google Analytics and Google
   Tag Manager, and 8 on your pages during our phone visit. 27 need work.
   Above, they're grouped into 11 causes. The full CRO checklist further down
   is a separate, longer list (193 points) with its own score." Every other
   number now says what it counts.
6. **"What you asked, answered" is gone for the owner** (as buyer round 1 did
   for the buyer): the opening answers those questions.

| Visible business text (EN+AR, technical voice excluded) | Before | After |
|---|---|---|
| "Yes: N problems found" | 4 | 0 |
| "Conversion score", "Checklist score", "Passed N of M", "N / 25 passed" | 1 / 1 / 1 / 2 | 0 / 0 / 0 / 0 |
| Scores in the contents (`toc-n`) | 3 | 0 |
| Money as "SAR x–SAR y" | 27 | 0 |
| "Biggest leak" / «أكبر تسرب» (the hero's own "losing about" headline aside) | 1 / 1 | 0 / 0 ("biggest single figure" once) |
| "Phone shoppers buy three times less…" (top finding) | 5 | 3 (cause line, plan, GA4 row) |
| Sections before the action plan | 2 (hero, answers) | 1 |

### Problems found before the change
The gap audit's [code] contradictions, as the faithful preview showed them:
- C1: seven scores (hero "Passed 31 of 58", guide 30/50, "Conversion score
  50/100", checklist 60%, GA4 13/25, GTM 17/25, speed average), all unlabelled.
- C2: two "biggest" (hero phones SAR 5,250–11,300; plan, follow-up box and GA4
  row "Biggest leak: cart to checkout", SAR 2,470–6,174).
- C3: the numbers tiles took purchases from the funnel's purchase events and
  the rate from GA4's purchases (agree in the fixture since round 1, not by code).
- C5: the page-review card's GA4 line used its own rate, not the follow-up box's.
- C7: WhatsApp could show under "Already working" while the visit had a broken
  WhatsApp link.
- C8: scope said "Checkout after the cart" wasn't checked even when the visit
  opened the first checkout screen; sources showed "fud-2.1.0".
- C9/C10: "No problem found… 9 checks behind this answer" on routes where those
  checks never ran; "Yes: N problems found".
- C12: a "do it yourself" page-review card that said "Send this to your developer".
- C13: "Money figures come only from… the gap between a funnel step and its
  benchmark" (wrong for 3 of 4 figures).
- C14: Clarity and GA4 visit counts side by side, unexplained.
- C15: checklist "2 critical points failing" vs "Critical: fix these first 9";
  tab bars vs group counts (7 of 11 tabs disagreed).
- C17: "SAR 5,250–SAR 11,300" vs "SAR 2,470–6,174" vs "SAR 105K".
- C18: "Connect Google Analytics on your next audit" (one audit per site).
- "Where the money is" (page review, real runs) would add a second,
  multi-step money total next to the opening's figure.

### Full change list
1. **Root causes** (`owner-causes.ts`): 12 sales causes (broken buying steps,
   delivery cost and total in the cart, phones, payment, product pages, visits
   that don't sell, trust, WhatsApp, homepage, finding products, Arabic,
   repeat buyers), 3 "wrong numbers" causes (counting, credit, ad platforms),
   1 "risk" (customer data and old scripts), and "other" (last). The weakest
   step (SO-GA4-01) joins the cause behind its step (product / cart /
   payment). The visit adds "WhatsApp link doesn't open" and "Add to cart
   didn't work" when no rule already says so. Causes rank by their largest
   money range, then worst severity, then sales before numbers before risk.
   Money is never summed.
2. **Opening** (`ownerHeroHtml`): question, verdict, one money figure with
   what it compares, two answers (verdict word as text, not colour alone),
   up to 10 causes as `<details>` (first 2 open, the rest one tap; 11+ under
   "N smaller causes"), scope, the count line. Without GA4: "Google Analytics
   wasn't connected, so this report has no money figures. Connect it to your
   store (it's free)…" (no "next audit"). No money but GA4: "Your Google
   Analytics didn't give a money figure…". "Most serious first" when nothing
   has money.
3. **Answers section** not rendered for the owner; its contents link and
   `#answers` gone. Other readers keep it.
4. **Labels on every other number (owner only):** GA4/GTM header "13 of the
   25 checks in this list passed"; page review lead "8 rules gave a clear
   answer: 7 to fix, 1 working" (no "Conversion score"); checklist "Score for
   these 193 points only… separate from the count at the top"; speed
   "Average speed score (out of 100)"; desktop guide stops all "N to fix";
   contents without scores.
5. **Contradictions:**
   - C2: the follow-up box says "Your weakest buying step against a typical
     store: from cart to checkout. 41% of shoppers go on, where a typical
     store keeps about 50%", kicker "From your Google Analytics" (no GA4-01,
     no "(GA4-03)"). Fixture title "Your weakest buying step: from cart to
     checkout". Brief rule for real AI text.
   - C3: owner "Purchases" tile = GA4's purchases (the rate's basis); if the
     funnel's purchase events differ by over 2%, a line says so.
   - C5: the card's GA4 line uses the follow-up box's rate for the same step.
   - C7: a passing WhatsApp rule is dropped from "Already working" when the
     visit saw a broken WhatsApp link; a note points to the cause.
   - C8: scope adds "The first checkout screen, on a phone" and says
     "Paying and placing an order" wasn't checked when the visit opened it;
     sources: "plus the first checkout screen", no rule-set version.
   - C12: a quick win whose owners include the developer sits in "Needs your
     developer".
   - C13: method: "Each one compares one part of your store with a better
     one: phones with computers, a page or product with your average, or a
     buying step with a typical store."
   - C14: Clarity line: "Clarity counts visits its own way (bots included, 3
     days only)… compare your pages with each other here".
   - C15: owner tile "critical points to fix" = the Critical group's count;
     each tab group "N to fix (M of them in Critical, above)" = its bar.
   - C17: owner notation `ownerMoney`: "SAR 5,250–11,300" / "5,250–11,300 ر.س"
     in the opening, plan tags ("About … a month at stake") and the action
     block's Impact line.
   - "Where the money is": its multi-step total is not shown to the owner
     (segment lines stay).
6. **Plan lead:** "20 fixes from your Google Analytics and Google Tag
   Manager checks, most money first. 7 need no developer… The 7 problems from
   our phone visit are in 'What stops your shoppers buying'." The plan lists
   every failed point, so its count is the opening's.
7. **Jump bar:** "Conversion" → "Shoppers"; contents "Conversion review" →
   "What stops your shoppers".

### Section inventory (owner, tracking route) vs round 1's baseline
| Section | R1 phone EN | **R2 phone EN** | R2 phone AR | R2 desktop 1440 |
|---|---|---|---|---|
| Opening `#overview` | 1,678 | **3,544** | 3,031 | 2,550 |
| What you asked, answered `#answers` | 1,732 | **—** | — | — |
| *Opening + answers* | *3,410* | ***3,544*** | *3,031 (R1 2,932)* | *2,550 (R1 2,373)* |
| Your action plan `#fix-first` | 4,891 | **5,085** | 4,282 | 3,712 |
| Your numbers | 924 | 924 | 900 | 654 |
| What stops your shoppers buying | 4,082 | **3,371** | 3,032 | 2,367 |
| Full CRO checklist | 41,478 | 41,496 | 38,471 | 32,797 |
| Clarity | 549 | 706 | 572 | 461 |
| Keep it / All 50 checks | 620 / 878 | 620 / 878 | 513 / 827 | 455 / 612 |
| GA4 / GTM | 13,841 / 13,064 | 13,933 / 13,064 | 11,306 / 9,941 | 9,987 / 9,155 |
| Speed / method / sources | 1,331 / 650 / 564 | 1,331 / 696 / 564 | 1,303 / 603 / 506 | 664 / 603 / 430 |
| **Whole page** | **88,487** | **88,377 (105 screens)** | **77,349** | **66,004** |

The opening grew by 134px against hero + answers together, and holds what
they held plus the root causes; the friction section lost 711px (its
"Conversion score" and the follow-up box's long fact sentence). Website route
(`--path=website`): 84,574px (R1 84,044); opening 3,186 replaces hero 1,624 +
answers 1,307. Real tharaa run in the owner layout: 44,633px (R1 45,131).

### How to check it
`http://localhost:5173/audit-reports/local/owner-round2-after.html` (before:
`owner-round2-before.html`). Also `owner-round2-web-after.html` (no GA4/GTM)
and `owner-real-tharaa.html` (real run, buyer text).
1. First screen (EN and عربي): the question, the answer line, "The biggest
   single figure", the two answers. Does it tell an owner in 10 seconds where
   the sales go?
2. Open cause 4 ("Shoppers can't see the delivery cost…"): five problems from
   three sources in one chain. Tap a "What we saw" line: it jumps to its row.
3. Read the count line under the scope; then scroll: GA4 header, page-review
   lead, checklist score: each says what it counts.
4. "What stops your shoppers buying" → the follow-up box: "weakest step", no
   "biggest leak", no GA4-01.
5. Desktop: the contents list has no scores; the guide stops say "N to fix".
6. Regenerate: the plan's owner preview command, unchanged.

### Verification
1. `npx tsc --noEmit -p .`: clean.
2. `npm test` (worker): 158/158 (7 new in `src/owner-causes.test.ts`: every
   owner point and rule has a cause; the weakest step and shared ids resolve;
   each problem in exactly one cause and money = the cause's largest range;
   the answer and the numbers verdict; the owner page has one count, one
   "biggest", no answers section, no "Yes: N problems", no conversion score,
   no contents scores, one money notation; WhatsApp never "working" with a
   broken link; without GA4 no money, no "next audit", no false all-clear).
3. `npm run build` at the root: passes.
4. Owner preview at 390 and 1440, EN and AR: no page errors, no sideways
   scroll (scrollWidth 390 / 1440); website route and the real-run render
   too. Screenshots looked at: phone EN opening (3 screens), phone AR opening
   and the friction follow-up box, desktop EN opening.
5. Buyer unchanged: `owner-round2-buyer-before.html` vs `-after.html`
   (tracking) and the website route: same 15 / 13 section ids, 10,546 / 9,685
   visible text lines, 0 differences. Marketing manager and agency (tracking):
   same 11 ids, 9,621 / 9,647 lines, 0 differences. The raw HTML differs only
   by one whitespace line (the checklist tile is now a conditional).
6. `grep -c $'\b' src/html-report.ts`: 0.

### Known limits
- **Technical voice** (behind "Technical details") still shows `ga4-facts.ts`'
  own sentences: "Biggest leak: cart to checkout…", "This is the biggest leak
  (GA4-01)", "Estimated gain: SAR 2,470–SAR 6,174". Changing them is a shared
  engine change (it feeds every reader's AI prompt); left for Round 13.
- **C4** (event-level 8% vs item-level product average, unlabelled) is not
  done: it belongs with the money ledger (Round 5).
- **C6** ("keep it" can list drop-offs and privacy passes) and **C11** (the
  DIY group holds GA4/Ads tasks) are untouched: Rounds 3 and 4. The "What
  can you fix yourself?" count uses today's `isDiy`, so it inherits C11.
- Code-written Arabic I didn't touch stays MSA/Egyptian (follow-up "not
  checked" rule titles, checklist card labels, numbers section): Round 13.
- Some findings still show in two or three places (cause line, plan, GA4
  row): Round 3 ("one home").
- Internal ids remain in the rows' meta (`SO-GA4-01`, `CP-001`): Round 13.
- The preview's `--path=website` fixture keeps the GA4 totals (the numbers
  section shows), so its opening says "Your Google Analytics didn't give a
  money figure" instead of "wasn't connected". The test covers the real
  no-GA4 case (no `ga4Metrics`). A fixture item for Round 5.
- The real-run render (buyer ids `MB-*`) maps through the shared ids; 4 of
  its 13 problems fall under "Other things to fix".
- Cause "What to do first" names who from the point's owners (developer or
  "you, in your store admin"); the three-owner split is Round 4.

### Decision needed
- **Ranking:** causes rank by money first, so a critical cause without a GA4
  range (here: the cart, 5 problems incl. the critical weakest step) can sit
  4th behind smaller-severity causes with money. Alternative: severity first.
- **Open by default:** the first 2 causes open (3 open made the opening
  ~550px taller on a phone). Relied on the plan defaults otherwise (GTM 25,
  one audit per site, no form/database change, D3).

### Decision
Pending review.

---

## Round 1 — Store owner (ICP1): owner-faithful preview and the owner scaffold

**Status:** 🟡 staged, waiting for review.

**Changed later:**
- **Round 2, opening:** the "Bayt Al Oud is losing about SAR …" headline, "Fix
  these 3 first" and the "Passed N of M checks" line are replaced by the
  question, a verdict, one labelled money figure, two answers, the root
  causes and one count line. The "What you asked, answered" section is no
  longer rendered for the owner.
- **Round 2, fixture:** SO-GA4-01's title is "Your weakest buying step: from
  cart to checkout" (was "Most sales are lost between the cart and
  checkout").
- **Round 2, plan:** lists every failed point (no funnel de-dup), lead names
  where its count comes from.
- The baseline inventory below stays as round 1 measured it.
**Reader:** ICP1, store owner. Media buyer, marketing manager and agency
reports unchanged (checked, see Verification).
**Files:**
- `src/preview-owner.ts` (new, dev-only): the owner fixture. Owner points,
  owner-voice EN + Gulf AR finding text, the owner page review (FUD) sample,
  the checklist rewording.
- `src/preview-owner-data.ts` (new, dev-only): the Saudi Salla store's GA4
  pull, GA4 totals, Clarity snapshot and the cart line our visit read.
- `src/preview-owner.test.ts` (new): 7 tests, added to `npm test`.
- `src/preview-report.ts`: `--role=store_owner` uses the owner fixture; every
  other role runs the old code path unchanged.
- `src/fud/sample.ts`: `buildSampleFud(website, drafts)` exported (the old
  `sampleFudResult` calls it; same output).
- `src/html-report.ts`: `body.is-owner`, `OWNER_STYLES`, `OWNER_SCRIPT`.
- `package.json`: the new test file in `test`.
- Dev-only, gitignored: `output/render-owner.ts`, `output/inv.mjs`,
  `output/cmp-text.mjs`, `output/owner-patches/round1.patch`.
- Untracked new files (not in the patch): the three `src/preview-owner*`
  files above.

### The ask / what it yielded
The owner preview showed a media-buyer-era fixture: shared `GA4-xx` checks,
an Egyptian store in EGP, shared English finding text, and a CRO checklist
written for a media buyer in Egyptian Arabic. Nothing on it could be judged as
"what an owner gets". Now `--role=store_owner` renders what a real owner audit
produces, through the real code (`personaChecklistFor` →
`computeCategoryResult` → `ga4-facts`):

| | Before | After |
|---|---|---|
| Owner's own points on the page (`SO-*` rows) | 0 | 50 (25 GA4 + 25 GTM) |
| Store | "Nour Home & Living", Egypt, `example.com` | "Bayt Al Oud", Saudi, Salla, `baytaloud.example` |
| Money amounts in EGP / LE | 286 | 2 (shared checkpoint text in code, see Known limits) |
| Money amounts in SAR | 0 | 230 |
| Arabic-Indic digits (٠–٩) | 251 | 0 |
| Egyptian markers in AI-style text (دلوقتي / ده) | 132 / 146 | 0 / 0 |
| "Purchases 369" next to "1.50%" | yes | no: 300 purchases, 1.50%, everywhere |

### Problems found before the change
- Every [fixture] item in `icp/research/owner-gap-audit.md` traced to the
  sample data:
  - C3: purchases 369 (funnel users) vs 300 conversions;
  - C4: add-to-cart 8% (funnel) vs 6.5% (products);
  - C5: the page review said 31% cart → checkout, GA4 said 41%;
  - C14: Clarity 96.5% phones and ~63,500 visits a month vs GA4 85% and 20,000;
  - C16: "free-shipping threshold unknown" because no visit evidence was passed;
  - C17 (part): EGP, LE, ج.م and Arabic-Indic digits in one page.
- The page review sample said "Working: WhatsApp from any page" while the
  same fixture's phone visit had a broken WhatsApp number.
- Finding text was shared fixture English, so Arabic mode showed English.

### Full change list
1. **Owner fixture store** (`preview-owner-data.ts`): Bayt Al Oud, oud and
   perfume, Salla, SAR, Asia/Riyadh. Channels Snapchat, Instagram, TikTok,
   Google, WhatsApp. Countries Saudi Arabia, UAE, India (no delivery). The
   numbers are chosen to agree (stated at the top of the file and tested):
   300 purchases of 20,000 visits = 1.50%; 8% add-to-cart both ways; 41%
   cart → checkout in GA4 and the page review; Clarity 3 days = 2,150 visits,
   86% phones; free delivery from SAR 600 with a SAR 350 cart ("SAR 250 more").
2. **Owner checklist results** (`ownerActionCategories`): the route's own
   points (`SO-GA4`/`SO-GTM` on tracking, `SO-GA4` + `SO-WC` on single,
   `SO-WC` + `SO-CRO` on website). GA4 status comes from the computed facts;
   the rest from a fixed fail list. 34 failed points have owner-voice
   English (short headline + 1–3 short sentences) and Gulf Arabic (summary,
   detail, action, done when). Passed points: title + "in place" / «تمام».
   Every one of the 103 owner points has a Gulf Arabic title
   (`OWNER_AR_TITLE`).
3. **Owner page review sample** (`ownerSampleFud`): 8 rules, Gulf Arabic,
   Western digits, SAR; WhatsApp is a warning (one broken link), matching the
   visit.
4. **Owner phone visit sample** (`ownerSiteChecks` in `preview-report.ts`):
   platform Salla, Saudi WhatsApp numbers, Snapchat pixel twice, SAR values.
   No `adContext` (the owner form doesn't ask for an ad).
5. **CRO checklist in owner register** (`ownerChecklistFixture`): the saved
   tharaa.shop run is reworded at preview time: Egyptian → Gulf word swap
   (~70 words, whole words only, longest first), Western digits, EGP/LE/ج.م
   → SAR/ر.س, and English sentences about ad spend / paid visitors / ROAS
   dropped. Crops and URLs untouched. The plan's command line stays the same.
6. **Owner scope in the report** (`html-report.ts`): `<body class="is-owner">`
   for the store owner only; `OWNER_STYLES` (brand tokens, visible focus ring)
   and `OWNER_SCRIPT` (`window.__owner.ready(fn)`, `window.__owner.motion` is
   true only under `prefers-reduced-motion: no-preference`) are emitted only on
   the owner page. Later rounds add owner CSS under `.is-owner` and owner
   behaviour through `__owner.ready`.
7. **Real run as an owner** (`output/render-owner.ts`, dev-only): re-renders
   the saved real tharaa.shop run (`pipeline-tharaa-shop-progress.json`)
   through rows → renderer with `audience_role: store_owner`. A coral banner
   says "buyer-voice text, buyer checklist points. Layout and numbers only."
   Output: `output/owner-real-tharaa.html`.

### Baseline section inventory (owner, tracking route, phone 390px)
Measured with `output/owner-dump.mjs` (reduced motion) and `output/inv.mjs`.
Sticky chrome: top bar 61 + jump bar 61 = 122px. **Later rounds measure
against the "after" column.**

| Section | Before EN | **After EN (baseline)** | After AR | After desktop 1440 |
|---|---|---|---|---|
| Hero `#overview` | 1,770 | **1,678** | 1,476 | 1,236 |
| What you asked, answered `#answers` | 1,937 | **1,732** | 1,456 | 1,137 |
| Your action plan `#fix-first` | 5,055 | **4,891** | 4,226 | 3,656 |
| Your numbers `#numbers` | 953 | **924** | 900 | 654 |
| What stops your shoppers buying `#friction` | 5,205 | **4,082** | 3,572 | 2,949 |
| Full CRO checklist `#cro-checklist` | 41,723 | **41,478** | 38,449 | 32,734 |
| Clarity `#clarity` | 523 | **549** | 467 | 383 |
| What's working: keep it `#keep` | 726 | **620** | 513 | 455 |
| All 50 checks `#checks` | 878 | **878** | 827 | 612 |
| Google Analytics 4 `#sec-ga4` | 14,091 | **13,841** | 11,189 | 9,894 |
| Google Tag Manager `#sec-gtm` | 11,832 | **13,064** | 9,941 | 9,155 |
| Page speed `#speed` | 1,331 | **1,331** | 1,303 | 664 |
| How this audit works `#method` | 650 | **650** | 580 | 580 |
| Where this data came from `#sources` | 564 | **564** | 506 | 430 |
| CTA band | 535 | **535** | 433 | 417 |
| Footer | 947 | **947** | 947 | 376 |
| **Whole page** | **89,440 (106 screens)** | **88,487 (105 screens)** | **77,507** | **66,154** |

Other routes, after (phone EN):
- No GA4/GTM (`--path=website`): 84,044px. Hero 1,624, answers 1,307, plan
  4,261, numbers 924, friction 3,346, CRO checklist 41,478, checks intro 811,
  "Website Code & DevTools" `#sec-website` 25,831 (SO-WC 25 + SO-CRO 25, all
  open), speed 1,331, method 541, sources 506.
- Real tharaa.shop run in the owner layout (`owner-real-tharaa.html`, buyer
  text): 45,131px. Hero 1,996, answers 1,604, plan 4,443, numbers 2,502, keep
  673, checks 878, GA4 14,795, GTM 13,640, speed 1,353, method 595, sources
  474. No friction, CRO checklist or Clarity (the saved run has none of them).

The page barely got shorter: Round 1 changes data, not layout. The CRO
checklist (47% of the page) and the open GA4/GTM rows (31%) are untouched.

### What the faithful preview now shows (for Round 2 onward)
These are **code**, not fixture, and still on the page:
- Two "biggest" figures: hero = phones, SAR 5,250–11,300; plan, friction box
  and GA4 row = "Biggest leak: cart to checkout", SAR 2,470–6,174 (C2).
- Seven scores: hero "Passed … of 62", guide 30/50, "Conversion score 50/100",
  checklist 60%, GA4 13/25, GTM 17/25, speed average (C1).
- "What you asked, answered" still reads "Yes: N problems found" (C10).
- Internal ids: "Follow-up from GA4-01", "متابعة من GA4-01", checklist
  `CP-001 · …` codes, "fud-2.1.0" (G12).
- Code-written Arabic: MSA in the friction box («لماذا يغادر المتسوقون»),
  numbers («مأخوذة من حساب تحليلات جوجل الخاص بك»), sources; Egyptian in the
  CRO checklist labels («إزاي تصلحها» ×158, «نقطة معمولة كويس»).
- Money format "SAR 5,250–SAR 11,300" with the Latin code in Arabic mode.
- The DIY group still holds GA4 Admin / ads work (C11).
- The business name shows in Latin in the Arabic hero (`businessName` is
  whatever the form got).

### How to check it
`http://localhost:5173/audit-reports/local/owner-round1-after.html` (before:
`owner-round1-before.html`). Also `owner-round1-web-after.html` (no GA4/GTM)
and `owner-real-tharaa.html` (real run, owner layout, buyer text).
1. First screen, عربي: "Bayt Al Oud يضيّع نحو SAR 5,250–SAR 11,300 شهريًا",
   fix 1 in Gulf Arabic («عملاء الجوال يشترون أقل بثلاث مرات…»).
2. "Your numbers": 20,000 visits, 300 purchases, 1.50%, funnel ending at 300.
3. "What stops your shoppers buying": 41% in the box and the cards; copy
   «أضف 250 ر.س وخذ التوصيل مجانًا»; WhatsApp listed as a warning.
4. GA4 rows: owner headlines ("Most sales are lost between the cart and
   checkout"), SAR, no `GA4-xx` row ids (rows are `SO-GA4-xx`).
5. CRO checklist cards in Arabic: «الحين», «كيف», «توصيل», no ٠–٩ digits.
6. Regenerate: the plan's owner preview command, unchanged.

### Verification
1. `npx tsc --noEmit -p .`: clean.
2. `npm test` (worker): 151/151 (7 new in `src/preview-owner.test.ts`:
   routes use exactly the owner's points; Arabic on every finding and title;
   SAR only, Western digits, no internal ids in owner text; GA4 owner text
   quotes only the computed numbers; the sample's numbers agree; the checklist
   rewording; `is-owner` / `__owner` only on the owner page, not for buyer,
   manager or agency).
3. `npm run build` at the root: passes.
4. Owner preview at 390 and 1440, EN and AR: no page errors, no sideways
   scroll (scrollWidth 390 / 1440). Screenshots looked at: phone EN/AR top,
   friction AR, checklist AR, GA4 EN, desktop AR numbers.
5. Buyer unchanged: `owner-round1-buyer-before.html` vs `-after.html`
   (tracking) and the website route: same 15 / 13 section ids, 10,546 / 9,685
   visible text lines, 0 differences (`output/cmp-text.mjs`). The raw HTML
   differs only by two empty lines where the owner-only style and script
   tags render as nothing.
6. `grep -c $'\b' src/html-report.ts`: 0.

### Known limits
- The checklist rewording is a word swap, not real Gulf writing: a few
  Egyptian words outside the list remain (e.g. «عايز» ×6), and the Arabic
  still carries some ad framing (only English ad sentences are dropped). The
  store's own quoted copy is tharaa's. Real owner Arabic is checked in Round 21.
- Checklist prices are tharaa's numbers relabelled SAR (e.g. "SAR 1,399").
- "Save 120 EGP" / "Add 120 EGP more" (2) come from the shared checkpoint
  text in `src/fud/manual-checklist-data.ts`, which every reader sees:
  a code item for Round 10/13.
- Passed points' text is generic («تمام. شغّال عندك الحين»); a real run
  writes specific text.
- `pageTypeOfPath` (`ga4-facts.ts`) knows `/products/…` and `/collections/…`
  only. The fixture uses those paths. If Salla product URLs don't follow them
  (to confirm), GA4's per-product and landing-page facts return "no data" on
  Salla stores: check in Round 4 (platform detection).
- `--empty-inputs` renders the same page today: the owner has no typed inputs
  yet (Rounds 5, 7, 18 add them).

### Decision needed
- None new. Relied on the plan defaults: owner GTM stays 25 checks; one audit
  per site; no form or database change; WhatsApp contact number unknown (D3).

### Decision
Pending review.

---

## Round 0 — Housekeeping before the rounds

**Status:** 🟡 staged, waiting for review.
**Files:** `icp/research/selected/media-buyer-GA4.jsonl`,
`icp/research/new-fact-map.json`, `OWNER-ROUNDS-PLAN.md` (new),
`ROUNDS-LOG-OWNER.md` (new).

- The three media buyer GA4 points changed by hand on staging (commit
  5618c1e: "Same order counted twice in GA4", refund tracking MB-GA4-26 in
  place of MB-GA4-17, the key-events wording) are now in the generator's
  source list. `node icp/research/gen-persona-checklist.mjs` reproduces
  `src/checklist-persona-data.ts` byte for byte, so later rounds can
  regenerate safely.
- Research for the plan, by two agents: `icp/research/owner-gap-audit.md`
  (the owner report today) and `icp/research/owner-market-research.md`
  (what benefits a GCC store owner).
