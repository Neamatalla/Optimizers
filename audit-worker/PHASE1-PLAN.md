# Phase 1: clean up the audit points, then decide in code what code can decide

Part of the 32h safety-net plan (ClickUp, Audit Feature list). Re-planned on 22 Nov 2026, after the inventory showed 731 overlapping points (about 280–360 items per report, three scores).

**Goal:** one master point list (`src/points/`) with one rule per point and role labels. Code decides every point it can decide with certainty. The AI writes only where judgement is needed. The report keeps its current structure: only the changes the new list forces.

## Update, 24 Nov evening — Phase 1 closed (read this first)

**Phase 1's goal is met:** every active point has one owner. Code decides every side it can prove (81 code points, plus a code rule for all 39 code+ai points); the AI decides only the rest.
- **`rules/mixed.ts`:** 31 new rules for the code+ai page points. Each settles only what the visit proves, mostly the pass (the words are there, next to the button) or n/a (no options, no Arabic pages). A few clear fails: Arabic page laid out left-to-right (NAV-08), open discount field in the cart (OFFER-17, per its guide), main menu on the landing page (LAND-03), "Submit"-style landing buttons (LAND-09), currency not in 3 capitals (TRK-44), staging/dev hostname in GA4 (TRK-26). A missing match is never a fail: it goes to the AI with what the code saw.
- **Relabelled ai:** 32 points with no sure code side (e.g. HOME-01 "says what you sell", TRUST-03 "reviews look real", PDP-03 photo quality, PATH-10 express pay that loads in frames). Counts now: 162 active = code 81, code+ai 39, ai 42.
- **LAND-01 parked:** it needs add-to-cart by campaign and landing page, which GA4 isn't asked for. Nothing could decide it without guessing. TRK-21 and LAND-02 still cover paid landing pages.
- **Reader questions:** no remap needed. The dropped ids in them (GA4-01, GTM-14, W-06, W-33, W-34, W-35) were cut on purpose; each question keeps 2-18 live points. A test now guards that.
- **Checked against Regal's saved visit** (run 34 evidence, no AI cost): every code pass quotes the text that proves it. Three wrong passes found and fixed before commit: a secure-payment badge counted as a guarantee, "quick view" counted as quick add, "متابعة الطلب" not read as checkout wording.
- **Regal runs 35 and 36 (live):** code decides 83-85 points (was 72-74), the AI judges 69-71 (was 81-83). **0 pass↔fail flips** against run 34 and between 35 and 36; only 5 points changed between 35 and 36 (was about 13 per pair), all decided↔unchecked. Result: 75 pass, 50 fail, 27 unchecked, 7 n/a (run 34: 72 / 47 / 34 / 7).
- **Cost went up, not down: about $0.67 per audit (run 34: about $0.53).** The text call is the same ($0.29), but the picture call stopped reading the text call's cached evidence: it writes about 100K tokens again instead of about 40K ($0.32 vs $0.17), on both runs. The shared prefix (`buildSharedPrompt`) and the call timing look unchanged; the cause isn't found yet. First item for Phase 2.

**Moved to Phase 2 (not Phase 1's goal):** cost per audit (send each AI point only its evidence), remaining decided↔unchecked swings, one finding for "checkout behind log-in", TRK-17 / TRK-28 rule gaps, GA4 rules handing over names for Arabic templates, retiring the old list files (they still run when the flag is off, so they go when the flag becomes the default).

**Waiting on Adham:** one score or three; whether unchecked points cap the score; when to turn `POINTS_PIPELINE=on` on staging.

## Update, 24 Nov morning

- **Probes on with the new audit:** `POINTS_PIPELINE=on` turns on the extra visit probes (TRK-19, TRK-23, TRK-31, TRK-32, PATH-15, PDP-12) unless `COLLECT_PROBES=off`. Visit budget 360 s. On Regal they settled TRK-23, TRK-31 and TRK-32 when they got time.
- **Probes run last, on the time left.** When Regal is slow (it is at random: one landing page took 200 s, the desktop step hung), they get skipped and their points stay unchecked with that reason. Each landing page is now capped at 45 s and desktop at 70 s, so one slow page can't take all their time.
- **Visit log line:** after the visit the worker logs its time, pages loaded, skipped probes and seconds per step, e.g. `[launch 1s, home 15s, ... landing /ar-sa 10s, desktop 34s, probes 84s]`. Visible in Railway.
- PATH-15 and PDP-12 stay unchecked on Regal for real reasons: the empty cart only links home (not proof, the read can miss links), and the product only has size options.

## Update, 24 Nov early

**Flips fixed.** Regal runs 28→29 and 29→30: **0 pass↔fail** (before: 2-3 per pair). What changed:
- **LAND-11 is decided by code** where it can be measured (button on the first phone screen, or a buy bar that follows → pass; past 2 screens with no bar → fail). The visit now checks for a following buy bar on landing pages too. Only the screen-2 case goes to the AI, with a word-count guide.
- **TRK-32:** a hit within 20% (min 1 s) of the LCP is too close to call → unchecked.
- **`facts.final`:** when a code rule saw the evidence and still can't decide (TRK-17 missing hit, TRK-32 too close), the AI isn't asked. It had failed TRK-17 from the same missing hit.
- **Guides** (`ai-guides.ts`) for PDP-19 (size, never colour), LAND-08 (only the page's own product's buttons), OFFER-17 (an open field fails, whatever its size: the rule says collapsed or behind a link), COL-01 (search the full name, fail only when the box shows it exactly), PATH-05 (guest option on the sign-in page), NAV-03 (offer pages are shopping links), TRUST-08 (a floating WhatsApp button counts).
- **Visit hang:** the desktop step has its own 70 s cap. A hang there had timed out the whole visit 4 runs in a row (121 unchecked). The timeout error now names the step.
- Still swinging between decided and unchecked: about 13 points per run pair (mostly picture and judge points). TRK-32 is unchecked when the extra probes don't get time (production doesn't run them).
- The COL-01 "fail only when the box shows the full name" line was added after the last runs; not run-tested yet.

## Update, 23 Nov night

Rule (Adham): cost cuts never lower quality; credibility is the product.
- **Cost, commit `902278c`:** 5-minute cache pinned (the API key's default; local runs used 1 hour and looked cheaper than production). The picture call now waits for the text call's answer to start, so it reads the cached evidence instead of writing it again (97K → 25-39K tokens written). Browser points run in batches of 5. Regal: **$0.50-0.57** per audit, against $0.64-0.67 for the same code before the fix.
- **Quality held:** unchecked 31-33 (baseline 30), browser settled 3-4 (baseline 4).
- **Still open, credibility:** 2-3 pass↔fail flips between any two runs, not from these changes: LAND-11 (same facts, judged both ways), OFFER-17 ("quiet" coupon field judged both ways), COL-01 (browser searched different names), TRK-32 (timing measured near the line), PATH-05 (Zid sent one run straight to a log-in page).

## Update, 23 Nov late

Branch pushed to GitHub (`origin/feature/deterministic-checks`); not on staging or main.
- **Report fixes for the other readers:** "What you asked, answered" (owner, manager, agency) matched old ids only, so on a master-point report every question said "No problem found". It now reads each old id through its master point, and says so when nothing behind a question could be checked. Reader lanes and role severity (`audience.ts`) read master ids too; before, the media buyer saw every master point one step lower.
- **Arabic titles** for all 163 active points (`points/titles-ar.ts`), used in the unchecked list.
- **Where the $0.62 goes (Regal, run 16):** about 60% is writing the store's evidence into Claude's cache on Sonnet (text call ~60K tokens, picture call ~38K, at the CLI's 1-hour cache price); about 25% is Sonnet's answers (~11K + 5K tokens); browser + Arabic on Haiku about $0.05. The browser call once cost $0.25: a Haiku prompt over 100K tokens is billed at 5× (long page snapshots).

## Update, 23 Nov evening

Commits up to `183bc53` (local, not pushed). On top of the afternoon work below:
- **Visit evidence:** page text marks where each phone screen starts; closed tab and accordion text is read from the page code (`hiddenSections`); the main menu is counted with the phone drawer (`menuLinks`, `menuIcon`).
- **Browser step:** up to 10 points, judged on the exact pages the visit used (it had judged PDP-14 on another product).
- **Arabic:** one writer call translates the code's English sentences (about 70, $0.01), so Arabic readers see the store's details.
- **Quote check:** an AI pass or fail that quotes text not in the evidence becomes unchecked (`checkQuotes`). On Regal it drops 1–2 points, both text read off a hero picture.
- **Regal, runs 15 vs 16:** 9 points change, **0 pass↔fail**; all changes are decided↔unchecked. Cost about **$0.62** (text $0.32, pictures $0.24, browser $0.05, Arabic $0.01). 74 pass, 49 fail, 30 unchecked.
- Local runs: the extra tracking probes (`COLLECT_PROBES=on`) sometimes don't run when the visit is slow; production doesn't run them at all.
- **Next:** review the report with Adham (how unchecked points show), then staging.

## Update, 23 Nov afternoon

Commits `644fea7`, `3a6d0a9`, `a86320c`, `4ba91b2` (local, not pushed). Adham's rule: code decides only what it can detect for sure; anything that could fail wrongly goes to the AI, which must never invent and gets a browser to check.

- **Tracking:** code rules for 7 code+ai points (`rules/tracking.ts`). A code+ai point the code settles no longer goes to the AI.
- **Checkout log-in:** when the visit lands on a log-in page instead of checkout, PATH-11/12/13/16 stay unchecked with one reason, and the AI isn't asked (`pipeline.ts` CHECKOUT_FORM_POINTS).
- **Stricter judge:** unverified unless every part of the rule is shown; decision guides for the points that flipped (`ai-guides.ts`).
- **Browser step:** open points on a short list (`BROWSER_POINTS`) go to a Haiku call with a real headless browser: look, tap, type only in the store's search box, never fill or submit. Max 5 points, ~30 tool calls. A fail needs proof; a tap that didn't work is unverified.
- **Cost:** tool-less Claude calls no longer carry the CLI's built-in tool definitions (33K tokens). The judge keeps them so its two calls share the cached evidence (dropping them there broke the sharing).
- **Regal now (run 11):** about **$0.57** per audit (text $0.32 + pictures $0.21 + browser $0.04), vs $0.79 on 15 Nov. Between two runs about 10 points change, only 1 pass↔fail; the rest move between decided and unchecked. 71 pass, 45 fail, 38 unchecked.
- **Open:** the remaining flips (mostly decided↔unchecked on visual points and on which browser points get settled); unchecked count is still ~35.

## Where we are (23 Nov 2026, morning)

Branch `feature/deterministic-checks` (not on staging, not merged). Last commit `ba9b874`. Tests and builds pass.

**Result so far: Adham judged it a failure.** The new pipeline works end to end, but:
- **Cost barely dropped:** Regal (media buyer, GA4+GTM) costs about **$0.56** vs **$0.79** for the old run on 15 Nov (`audit_run_metrics`, request `dc0d17f4`: Sonnet main audit $0.47 + Haiku rest $0.32).
- **More "not checked"** (24 to 32 of 160 points) than the old report gave, and AI verdicts change between runs.
- Time: about 4–5 min vs 24 min before. That part is a win.

### What's wrong (diagnosis)

1. **The "code+ai" points never got their code part.** Only the 81 `code` points have rules. The 72 `code+ai` points (code should settle one side, AI the rest) go 100% to the AI, so the AI still judges about 90 points per audit.
2. **Cheap work moved to an expensive model.** The old friction judge and checklist ran on Haiku. Now Sonnet judges ~90 points against the whole store's evidence (all pages, GA4, GTM, pictures) in every call.
3. **"Not checked" is more honest, but looks worse.** The AI is told never to guess. The old report gave verdicts on 23 points the new one leaves unchecked; many were guesses (e.g. it passed checkout points it never saw: Regal's checkout is behind a Zid WhatsApp log-in).
4. **The point split was too optimistic.** Many `code+ai` points are really subjective (e.g. "description covers key benefits", "reviews look real"), and some need data the visit can't get (checkout behind log-in).

### Next steps (agreed direction, not started)

1. **Build the code part of the 72 `code+ai` points.** Code decides where it can (present/absent, counts, positions); the AI gets fewer, narrower points. Go category by category and show Adham each category's split before building it ([[understand-before-building]]).
2. **Send each AI point only the evidence it needs** (product page for product points, GTM for tracking...), not the whole store every call.
3. **Separate "can't access" from "not checked":** checkout behind a log-in becomes one clear finding, not 5 unchecked points.
4. Then steady the AI verdicts (variance between runs) and re-measure on Regal.

Target after 1–2: about $0.25–0.35 per audit, steadier verdicts, far fewer "not checked".

### How to test locally (Regal benchmark)

- Google sign-in is saved in `audit-worker/output/form-regal-honey.com.json` (gitignored). Root `.env` (gitignored) holds the Google OAuth keys and `LOCAL_AUDIT=off`, and has no Supabase keys, so the local form never queues to staging.
- Run: `cd audit-worker`, then
  `POINTS_PIPELINE=on CLAUDE_MODEL=claude-sonnet-5-5 CLAUDE_WRITER_MODEL=claude-haiku-5-5 npx tsx src/local-pipeline/run.ts regal-honey.com --form=output/form-regal-honey.com.json --role=media_buyer --ad="honey that makes a man"`
  (add `POINTS_DEBUG_DIR=output` to keep the AI's raw answers). The report: `npm run dev` in the root, then `http://localhost:5173/audit-reports/local/pipeline-regal-honey-com.html`. Per-call cost is in the `[claude-usage]` log lines.
- Compare with the 15 Nov report: `npx tsx output/compare-regal.ts output/pipeline-regal-honey-com-progress.json` (writes `output/compare-regal.md`); all points as CSV: `npx tsx output/points-list.ts` (`output/regal-points.csv`). Both scripts are local only (output/ is gitignored).
- The `claude` CLI on this machine bills to whatever account is logged in (`claude auth login`); a 5-hour limit shows as "You've hit your 5-hour limit".

### What was built on 23 Nov (steps 5–6, behind `POINTS_PIPELINE=on`)

- `src/points/pipeline.ts`: runs net checks + the 81 code rules, sends AI points (and code points the rule couldn't settle) to the AI, merges results, and maps them into the existing report shape (GA4 / GTM / Website tabs, grouped by point category). No migration needed: rows carry master ids. With the flag on, the old main audit, friction pass, checklist and translation stages don't run.
- `src/points/ai-judge.ts`: our own system prompt (replaces Claude Code's ~28K-token default via `--system-prompt-file`), shared evidence cached across calls, one text call plus one call for the 20 visual points that also reads the visit's screenshots. Verdict is one of pass/fail/unverified/n/a plus a 1–2 sentence observation in English and Arabic; everything else is template text. Haiku was tried for the text call and was worse (7× the output, slower, no shared cache).
- Visit (`src/fud/collect.ts`): opens the real `/cart` page when the cart is a drawer, taps "read more", tests cart +/−, taps the phone menu (Regal's doesn't open in headless: reported as unclear), reads returns/shipping policy pages, waits 6 s for tracking after add to cart. Zid/WooCommerce/Salla collection URLs are found. Screenshots have a 90 s cap per shot (a hang once stalled a run 12+ min). GCC currencies convert at fixed pegs for OFFER-04.
- Regal facts found: product description tab is empty; shipping policy page is empty; checkout is behind a WhatsApp log-in.

## Steps

1. **Finish the list.** Done 22 Nov: 201 points (163 active, 38 parked), 217 old points dropped with reasons.
2. **Registry in code, no behaviour change.** Done 22 Nov: `src/points/` plus `points.test.ts`, which checks that every old id maps once.
3. **Code rules.** Done 22 Nov for the 81 `code` points; done 24 Nov for all 39 `code+ai` points (the other 33 relabelled ai or parked). Thresholds are first drafts.
4. **Templates.** Done 23 Nov: all 163 active points have English and Arabic text (code points with slots; AI points with an `{observation}` slot).
5. **New results behind a flag.** Built 23 Nov (`POINTS_PIPELINE=on`), local only. Not compared on saved reports yet; no migration was needed.
6. **Wire the report.** Built 23 Nov: the report recognises master ids. The separate friction and checklist sections don't show in a master-point report (their points are inside the Website tab).
7. **Retire the old list files** once everything in them lives in the registry (role data is already carried in `roleCopy`). Moved to Phase 2: they still run while the flag is off.

## Open, not decided here

- One score or three: Adham's call. The flag currently gives one score (passes / points decided).
- Unverified checks have no score cap (the skipped-check fix on `staging`). Adham decides.
- Rules that can't yet say all they should: TRK-17 never returns fail (a missing hit is unverified). TRK-28 has no fact for "Conversions API detected", so its fail is hedged. GA4 rules don't hand over the campaign, page or product they name, the store's own rate, or the money currency, so templates only show them through the English `{reason}` (Arabic readers see none).
- 6 old ids that reader questions point to are now dropped (GA4-01, GTM-14, W-06, W-34, W-35). The questions need remapping.
