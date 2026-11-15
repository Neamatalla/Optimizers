# Store owner (ICP1) rounds: plan and rules

21 rounds of improvements to the **store owner** version of the audit report,
on branch `feature/store-owner-icp` (from `staging`, 2026-11-12). The scale
reference is the media buyer's 21 rounds (`ROUNDS-LOG.md`): each owner round
should be as substantial as a buyer round, and mirror one where it fits.
Each round is done by its own agent, one after another. Every round is logged in
`ROUNDS-LOG-OWNER.md`.

Research behind the plan:
- `icp/research/owner-gap-audit.md`: the owner report today, scored and audited.
- `icp/research/owner-market-research.md`: what benefits a GCC store owner, with sources.
- The reader: `icp/store-owner.md` (the AI's brief) and the canonical card
  `C:\Users\Omar Maged\Downloads\ICP1-Self-Serve-GCC-Store-Owner.md`.

---

## FAST MODE (from Round 3 on: these override the longer rules below)

**Target: 5–7 minutes per round.** Your brief already contains your spec and
the rules you need: don't read this plan, the research or old log entries
unless you're stuck on a specific fact. Go straight to the code
(`src/html-report.ts`: search for the function names, read only those parts).
- **Checks every round:** `npx tsc --noEmit -p .`, `npm test` (audit-worker),
  `grep -c $'\b' src/html-report.ts` = 0, and one owner preview render with no
  page errors (`node output/shot.mjs output/preview-tracking-store_owner.html`
  lists sections; that's enough). No screenshots unless something looks wrong.
- **Buyer check and root build:** only on rounds 5, 10, 15 and 20.
- **Log:** ~10 lines: title, what changed (bullets), how to check, known
  limits / decisions needed. Patch: `git diff > output/owner-patches/round<N>.patch`.
- Don't re-verify earlier rounds; trust the log.

## Rules for every round (read all of them before you start)

### Git
- Work on `feature/store-owner-icp`. Never switch branches, never commit,
  never push, never stash. Rounds stay as uncommitted changes in the working
  tree, building on each other (like the buyer rounds).
- After the round, save the cumulative diff:
  `git diff > audit-worker/output/owner-patches/round<N>.patch` (create the
  folder; `output/` is gitignored). Untracked new files: also list them in the
  log entry.

### Scope
- **Store owner only.** `result.audienceRole === "store_owner"`
  (`persona === "store_owner"` in `renderReport`). Owner-only CSS goes under a
  body class: if `<body>` has no owner class yet (it has `is-buyer` for the
  buyer, around `renderReport`'s `<body${...}>`), add `is-owner` the same way
  and scope owner CSS and scripts under `.is-owner`.
- **The media buyer report must not change.** Before your first edit, render
  the buyer preview and keep it as `output/owner-round<N>-buyer-before.html`.
  After the round, render it again and compare the visible text and section
  ids (strip `<style>`/`<script>`, compare text). Any difference must be a
  deliberate shared fix, explained in the log. Marketing manager / agency
  readers: same rule if you touch shared code.
- Shared engines (CRO rules, checklist, GA4 facts, store visit) serve every
  reader. Change them only when the round spec says so, keep them
  backward-compatible, and add tests.

### Data honesty (the reader's #1 trust rule)
- Never invent a number. Money comes only from the store's own data (GA4, our
  phone visit, what the owner types) and says where it came from. Estimates are
  labelled as estimates, shown as ranges, never summed across findings.
- Sample numbers exist only in dev previews (`ReportAssets.sampleInputs`).
  Real audits start empty where the reader must type.
- When data is missing (no GA4, no Clarity), say so plainly and say how to get
  it; never show a blank or a zero as if it were real.

### Language
- Bilingual on every string: `bi(en, ar)` / `biHtml(enHtml, arHtml)`.
- English: plain, short sentences (about 14 words or fewer, one idea each),
  "your store / your customers / your sales". Shop words are fine (add to cart,
  checkout, delivery, conversion rate). Explain any other term on first use.
  No fear or hype words.
- Arabic: **Gulf/Saudi**, plain and practical: not formal MSA, no Egyptian
  words (the buyer's Arabic is Egyptian: don't copy it). توصيل for delivery,
  أضف للسلة for add to cart. Western digits. Money in the store's currency.
- No internal ids (GA4-07, SO-CRO-03, A3) in reader-facing text.

### Design
- Phone first: check at 390px and 1440px, English and Arabic (RTL). No
  sideways scroll. Visible keyboard focus. Status never by colour alone.
  Motion only under `prefers-reduced-motion: no-preference`, and the page is
  complete without it.
- The owner's look should be its own, not a copy of the buyer's "instrument
  panel" (round 16). Keep the brand: black page, mint #6AE499, coral #FF6B57,
  amber; Sora / Inter / Noto Sans Arabic.

### Code gotchas in this repo
- `html-report.ts` builds HTML and inline `<script>`s inside TS template
  literals. A backslash in a template literal is eaten (`\b` becomes a
  backspace character, `\/` becomes `/`). In inline scripts avoid regexes with
  backslashes or double them, and after editing run
  `grep -c $'\b' src/html-report.ts` (must be 0).
- Use the Edit/Write tools for code. In Bash, never `cat > file` without a
  heredoc (it waits on stdin and hangs). Don't put big edits through
  `node -e` with nested quotes; write a script file instead.
- In-page links: the report has one link handler (`goTo`) and, for the buyer,
  a side drawer (`DRAWER_HTML`, links open related points in a side panel).
  The owner can reuse the drawer when a round calls for it.
- Owner checklist points (`SO-*`) live in `icp/research/selected/store-owner-*.jsonl`.
  Edit those and run `node icp/research/gen-persona-checklist.mjs`. Never
  hand-edit `src/checklist-persona-data.ts`. The 25-per-section counts are
  enforced by tests.
- The AI's voice for real audits is set by `icp/store-owner.md` and the
  prompts (`src/audit-prompt.ts`, `src/translate-ar.ts`, `src/fud/judge.ts`).
  Previews show fixture text, not AI text.

### Tools and limits
- **No paid AI calls** (`claude -p`, the local pipeline, checklist-run,
  fud-run without `--collect-only`) unless the round spec explicitly allows it.
  Live store visits without AI (`npx tsx src/fud-run.ts <store> --collect-only`)
  are fine when the round needs real evidence.
- Never read the production Supabase database. No writes to any service.
- Don't start dev servers (the machine is short on memory). Look at pages
  with `node output/shot.mjs` (puppeteer-core, local Chrome):
  `node output/shot.mjs <file.html>` lists sections; `node output/shot.mjs
  <file.html> <out.png> <width> <selector-or-y> <height>` takes a shot. Read
  the PNGs. For English, set `#i18n-en` checked (Arabic is the default).
- Disk space is tight (~8 GB): don't create large files; delete your temp
  shots when done.

### Renders
From `audit-worker/`:
- Owner preview: `npx tsx src/preview-report.ts --path=tracking --role=store_owner --site --fud --clarity --no-ar --checklist=output/checklist-tharaa.shop.json`
  → `output/preview-tracking-store_owner.html`. Copy it to
  `output/owner-round<N>-before.html` before your edits and
  `output/owner-round<N>-after.html` after.
- Buyer preview: same with `--role=media_buyer`.
- Also try `--path=website` (no GA4/GTM) and `--empty-inputs` when your round
  touches what shows without data.
- Real data available offline: `output/form-www.tharaa.shop.json` (real GA4/GTM
  report data from a 2026-11-09 Google sign-in, media buyer role) and
  `output/pipeline-tharaa-shop-progress.json` (a full real media-buyer run).
  Useful for checking numbers on real data; the finding text there is buyer voice.

### Verification (every round)
1. `npx tsc --noEmit -p .` in `audit-worker/` clean.
2. `npm test` in `audit-worker/`: all pass. Add tests for new logic (and add
   new test files to the `test` script in `audit-worker/package.json`).
3. `npm run build` at the repo root passes. (`npm test` at the root has 29
   API test failures that predate this branch: don't chase them.)
4. Owner preview renders with no page errors (puppeteer `pageerror`), at
   390px and 1440px, EN and AR. Look at the screenshots.
5. Buyer report unchanged (see Scope).
6. `grep -c $'\b' src/html-report.ts` is 0.

### Logging
Prepend an entry (newest first) to `audit-worker/ROUNDS-LOG-OWNER.md`, in the
same shape as `ROUNDS-LOG.md`:
`## Round N — Store owner (ICP1): <title>`, then **Status:** 🟡 staged,
waiting for review · **Reader** · **Files** · **The ask / what it yielded** ·
**Problems found before the change** · **Full change list** · **How to check
it** (`http://localhost:5173/audit-reports/local/owner-round<N>-after.html`,
before: `owner-round<N>-before.html`, plus what to click) · **Verification** ·
**Known limits** · **Decision:** pending review. When your round replaces part
of an earlier round, add a **Changed later** note to that earlier entry.
Also tick your round in the table at the end of this plan.

### Your reply
When done, reply in under 300 words: what changed, verification results, and
anything the next round must know. If you couldn't finish something, say so
plainly.

---

## The 21 rounds

Each spec says what the round must deliver, the buyer round it mirrors (for
scale), and the research items it covers (G = `owner-gap-audit.md` ranked list,
M = `owner-market-research.md` ranked list). Read the research sections behind
your round before you start. If something in a spec turns out wrong or
impossible, do the closest honest thing and say so in the log.

**Defaults for open decisions** (flag each one you rely on in your log entry
under "Decision needed"): owner GTM stays 25 checks (Omar, 2026-10-20); one
audit per site, no re-scan (Omar, 2026-10-20); no form or database changes;
WhatsApp contact number unknown (D3) so anything needing it is built behind a
setting and hidden when unset.

### Round 1 — Owner-faithful preview and the owner scaffold (G1; mirrors buyer R21's tooling)
The owner preview today renders shared GA4-xx checks, EGP, buyer-written
checklist text and English AI text in Arabic mode, so nothing after it can be
judged. Make previews show what a real owner gets:
- `preview-report.ts --role=store_owner`: fixture findings use the owner's
  own `SO-*` ids for the route (`personaChecklistFor`), owner-voice EN and
  Gulf AR fixture text, SAR currency, a GCC store (Saudi, Salla) and a
  checklist fixture with owner-register Arabic. Keep `--role=media_buyer`
  output exactly as it is.
- A way to re-render the saved real run (`output/pipeline-tharaa-shop-*.json`)
  as an owner for layout checks (dev-only script in `output/`, like
  `render-buyer.ts`), clearly marked "buyer-voice text".
- Add the `is-owner` body class and an owner CSS/script scope.
- Fix the fixture-only contradictions the gap audit marked [fixture] (e.g.
  369 purchases vs 1.50%) so later rounds aren't fooled by them.
Log the before/after section inventory (heights on phone) as the baseline
for every later round.

### Round 2 — Answer the owner's question first: "What's costing me sales?" (G2, G3, G8; M8; mirrors buyer R1)
- Opening rebuilt around the owner's own question with a verdict built from
  the results. Not five generic answers that read backwards ("Does my store
  work on phones? Yes: 1 problem found").
- Fix or drop "What you asked, answered": every answer must agree with its
  evidence. No "No problem found… 9 checks behind this answer" when those
  checks never ran.
- **One honest count**: kill the seven different scores (hero 28/62, guide
  26/50, conversion 54/100, checklist 60%, 10/25, 16/25…). Decide one headline
  measure, and label every other score with what it counts.
- Remove every contradiction in the gap audit [code] list. That includes
  WhatsApp shown as "Working" when the visit found a broken link, two
  different "biggest leak" figures, and the money stated two ways.
- Group findings by root cause (about 10 on the first screens), each with its
  evidence chain (M8).

### Round 3 — One home for everything (G4, G10, G15; mirrors buyer R4)
- Each finding renders in full exactly once; everywhere else it's a link
  (count exact duplicate texts before/after like buyer R4: today each top fix
  shows 5–6 times, sources 3 times).
- Fold the GA4/GTM lists for the owner (one line per check, tap to open);
  they're 31 phone screens today.
- Rebuild "What's working: keep it" so it's short and owner-relevant.
- Phone length before → after in the log.

### Round 4 — "Who does it" and "where in your admin" (G6, G7; M paths section; mirrors buyer R3's tagging work)
- Detect the store platform (Salla, Zid, Shopify, WooCommerce, other) from
  the crawl/visit (shared, additive, tested). Today the code can't tell Salla
  or Zid.
- Three owners in plain words: "You, in your store admin" / "Whoever runs
  your ads" / "Your developer". Fix the "You can do these yourself… No code"
  group that's mostly Google Analytics and Google Ads tasks.
- "Where in your admin" lines per fix, for Salla, Zid and Shopify, **only**
  from the paths confirmed in `owner-market-research.md` (with plan gates).
  Unknown → plain words, never a guessed menu path.
- Update `icp/store-owner.md` so real AI text follows the same rule.

### ✅ Round 5 (done, staged) — "From visit to order": the owner's money ledger (G17, G18; M7, M15; mirrors buyer R5 + R10)
- One ledger like the buyer's "From click to cash", in the owner's terms,
  using **Salla's funnel step names** (Visits → Add to cart → Cart view →
  Checkout started → Order completed) so owners can match it to their
  dashboard; GA4 numbers mapped to them honestly.
- Money lost per step in the store currency, labelled an estimate with its
  source. **One money notation and one total** across the report.
- Optional typed input "orders in your store admin, last 28 days" (saved in the
  browser only) → "GA4 sees X of your Y orders" tracking-health line (M15).
- Replaces "Your numbers" for the owner. Without GA4: say what's missing and
  how to connect it.

### ✅ Round 6 (done) — What our phone visit saw, as proof (G16, G collected-but-unused; mirrors buyer R2 + R9)
- Owner tiles from the store visit: did Add to Cart work, broken WhatsApp
  links (which one), sold-out products shown up front, checkout log-in wall,
  autoplay video, pages visited. All of these are collected today but not shown
  to the owner.
- Each tile: what we saw, why it costs sales, who fixes it, where in admin.
- "Send to your developer": copy button with developer-ready tickets for the
  dev items (like buyer R2's tracking tickets), one language at a time.
- List what the owner card needs that the audit doesn't collect (like buyer R9's
  missing table), for later.

### ✅ Round 7 (done) — What your customer pays and how they can pay (M1, M2, M3; G5 partly)
- A "total cost and payments" panel from the visit: payment methods seen
  (mada, Apple Pay, STC Pay, Tabby, Tamara, COD) on product/cart/checkout,
  whether delivery fee, COD fee and VAT-inclusive price show **before**
  checkout, delivery time promise. Use existing signals/rules (`src/fud/`)
  where they exist; add detection (shared, tested) where they don't.
- **Free-delivery threshold calculator**: from the store's own AOV (GA4) and
  the owner's typed delivery cost, suggest a threshold and show the trade-off;
  research-backed copy (purchase intent doubles when delivery is built into the
  price). Typed inputs saved in the browser only; preview samples only.

### ✅ Round 8 (done) — "What the Ministry checks": Saudi trust and legal basics (M4; G25)
- New checks from public pages (crawl + visit text, shared and tested):
  Saudi Business Center authentication badge/link, CR number, VAT number,
  phone and email, returns/exchange policy (7 days), terms and privacy pages,
  delivery time before purchase, complaint channel. Only for Saudi stores (or
  say which apply elsewhere when unsure). Source each rule to the Salla
  obligations article in the research.
- An owner block with ✓/✗ per item, what the law says in one line, the fix
  and where in admin. No legal advice tone; "check with your accountant/lawyer"
  where it matters.

### Round 9 — The owner's own GCC checks run on every route (G5)
- Today the 25 owner GCC CRO points (mada, Tabby/Tamara, COD fee, delivery,
  WhatsApp, Arabic titles) only run when GA4 and GTM are both missing. Make an
  owner "Store basics" set run for store owners on every route, **outside**
  the 50 tracking checks (the way Clarity runs outside the 50), so the GTM 25
  stay. Change `persona-checklist.ts` / the audit prompt routing with tests;
  the media buyer routing must not change. Log the extra AI cost per audit.
- Report: its own owner section, deduplicated with rounds 6–8 (one home).

### Round 10 — The CRO checklist, made for the owner (G9; mirrors buyer R8)
- It's 49 phone screens (47% of the page, 158 to-dos). For the owner: group by
  the shopper's path (homepage → collection → product → cart → checkout),
  "you can do this in your admin" vs "developer", the critical ones first,
  everything else one tap away, merged with the CRO rule findings so no point
  appears twice. Target: under 15 phone screens by default with nothing lost.
- Gulf Arabic labels (the checklist's labels are Egyptian today).
- **CRO tests to run (added by Omar's ask):** a "Tests worth running" block for
  the owner, built from the CRO findings that are judgement calls (the page
  review's "test first" / PEXTI-banded items, checklist points marked
  adequate, the WARN-only CRO rules). Each test: what to change (A vs B), why
  (the finding and its evidence), the one number to watch (add-to-cart rate,
  checkout start, conversion), how long to run it given the store's own GA4
  traffic (minimum ~2 weeks and enough visits per side, said in plain words;
  "not enough traffic to test: just make the change" when the store is too
  small), and how to run it on their platform (a simple before/after with
  dates when no A/B tool is available; never claim a platform has a built-in
  A/B feature unless the research confirms it). Ranked by expected impact ×
  ease. Owner only; reuse the page review's existing "test first" data.

### Round 11 — Your fix list, with progress (M10; mirrors buyer R2's developer pack)
- Each item marked **"just fix it"** or **"test it first"** (the Round 10
  tests), so the owner knows which changes need an A/B test.
- One owner to-do list built from all findings: ordered by money/effort, each
  with who, where in admin, rough time, done-when. Checkboxes saved in the
  browser (per store), a progress bar, "copy this week's list" for WhatsApp,
  print-friendly. No re-scan promise (one audit per site).

### Round 12 — Annotated phone screenshots (M9; the buyer's deferred item)
- In the store visit (shared collector, additive, tested), record element
  boxes for what findings point at (buy button, price, delivery text, payment
  logos, WhatsApp button, reviews, offer bar) on the first-screen crops.
- Draw numbered highlight boxes on the owner's finding crops and a legend.
  Graceful when no box exists. Live visit allowed with `--collect-only` to
  test on tharaa.shop.

### Round 13 — Plain words, Gulf Arabic, no internal ids (G11, G12, G13; mirrors buyer R6)
- Gulf/Saudi Arabic pass on every owner code string (formal MSA and Egyptian
  out, شحن→توصيل, Western digits including the ready-to-paste copy).
- Remove all internal ids and version strings from owner-facing text (156
  today).
- Every number labelled with what it is and whether it's good; reading-grade
  audit like buyer R6, before → after.
- Owner Arabic rule in `translate-ar.ts` / `icp/store-owner.md` for real runs.

### Round 14 — Visualize, breathe, short sentences (G14; mirrors buyer R12)
- Visualize what can be (bars, tiles, simple charts) in owner sections.
- Short-sentence pass on owner code strings (measure before → after), owner
  spacing, phone margins.

### Round 15 — Ordered by what the owner wants first (G23; mirrors buyer R11)
- Score every owner section 1–10 for this reader, reorder, merge or drop the
  low ones, phone navigation cleanup (contents, jump bar, guide stops follow
  the new order), mockups placement. Table of wow scores in the log.

### Round 16 — Your products, one by one (G collected-but-unused: best-sellers, search terms; mirrors buyer R14)
- From GA4's item and page data already pulled: best-sellers, products with
  views but few adds to cart, what shoppers search for and find/don't find.
  One card per product with its numbers vs the store, a rule-based reason in
  the owner's words and the fix. Without the data: honest empty state.

### Round 17 — Where your sales come from (channels, trend; mirrors buyer R14/R15)
- Channels in owner words (Instagram, TikTok, Snapchat, Google, direct,
  WhatsApp, other): visits, orders, sales, conversion vs the store; which
  bring buyers vs browsers; the 90-day trend (collected, unused); in-app
  browser share from Clarity where present. Rule-based notes, no invented
  causes.

### Round 18 — The season card and profit per order (M11, M16, M21; mirrors buyer R13/R15)
- Season card: next season from today's date (White Friday Fri 27 Nov 2026,
  Ramadan ~8 Feb–8 Mar 2027, Founding Day 22 Feb, National Day 23 Sep, Eids),
  fix-by dates, what to prepare, the discount-licence reminder. No promised
  sales jumps.
- "Profit per order" calculator: margin, delivery cost, COD fee (Aramex-via-Salla
  SAR 8 + 1% as a labelled default the owner can change), payment fees →
  what one order leaves. Typed, saved in the browser, empty in real audits.

### Round 19 — Clarity and speed in money terms (G21, G22; M18, M19)
- Clarity tiles each with one action tied to a page element; speed tied to
  sales in plain words (and real-user data where present), not a lecture.

### Round 20 — The owner's design (mirrors buyer R16 + R7)
- A distinct visual identity for the owner report (not the buyer's
  instrument panel): use the frontend-design guidance in this session's skills,
  plan → critique → build. Meaningful motion only (the ledger, the fix-list
  progress). All earlier sections restyled, nothing removed.

### Round 21 — Real end-to-end owner trial, and the contact route (G1, G20; M24; mirrors buyer R21)
- **Paid AI allowed this round only**: one real run with the local pipeline as
  store owner on tharaa.shop using the saved form
  (`npx tsx src/local-pipeline/run.ts https://www.tharaa.shop/ --form=output/form-www.tharaa.shop.json --role=store_owner`).
  If it hits a usage limit, stop and log it; don't retry in a loop.
- Read the real owner report end to end: fix the bugs it finds (like buyer
  R21), check the AI text against `icp/store-owner.md`.
- WhatsApp contact route and owner email: behind a setting, hidden when no
  number is set (D3).
- Close the plan: final section inventory (phone heights) vs round 1's
  baseline, and a "not done / needs a decision" list.

**Pairs (one agent each, in fast mode):** 13+14, 16+17, 18+19.

### Progress

| Round | Status |
|---|---|
| 1 | 🟡 staged |
| 2 | 🟡 staged |
| 3 | 🟡 staged |
| 4 | 🟡 staged |
| 5 | ⬜ |
| 6 | ⬜ |
| 7 | ⬜ |
| 8 | ⬜ |
| 9 | ⬜ |
| 10 | ⬜ |
| 11 | ⬜ |
| 12 | ⬜ |
| 13 | ⬜ |
| 14 | ⬜ |
| 15 | ⬜ |
| 16 | ⬜ |
| 17 | ⬜ |
| 18 | ⬜ |
| 19 | ⬜ |
| 20 | ⬜ |
| 21 | ⬜ |
