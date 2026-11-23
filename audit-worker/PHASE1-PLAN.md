# Phase 1: clean up the audit points, then decide in code what code can decide

Part of the 32h safety-net plan (ClickUp, Audit Feature list). Re-planned on 22 Nov 2026, after the inventory showed 731 overlapping points (about 280–360 items per report, three scores).

**Goal:** one master point list (`src/points/`) with one rule per point and role labels. Code decides every point it can decide with certainty. The AI writes only where judgement is needed. The report keeps its current structure: only the changes the new list forces.

## Update, 23 Nov afternoon — read this first

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
  `POINTS_PIPELINE=on COLLECT_PROBES=on CLAUDE_MODEL=claude-sonnet-5-5 npx tsx src/local-pipeline/run.ts regal-honey.com --form=output/form-regal-honey.com.json --role=media_buyer --ad="honey that makes a man"`
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
3. **Code rules.** Done 22 Nov for the 81 `code` points. **Not done: the code part of the 72 `code+ai` points** (next step 1 above). Thresholds are first drafts.
4. **Templates.** Done 23 Nov: all 163 active points have English and Arabic text (code points with slots; AI points with an `{observation}` slot).
5. **New results behind a flag.** Built 23 Nov (`POINTS_PIPELINE=on`), local only. Not compared on saved reports yet; no migration was needed.
6. **Wire the report.** Built 23 Nov: the report recognises master ids. The separate friction and checklist sections don't show in a master-point report (their points are inside the Website tab).
7. **Retire the old list files** once everything in them lives in the registry (role data is already carried in `roleCopy`).

## Open, not decided here

- One score or three: Adham's call. The flag currently gives one score (passes / points decided).
- Unverified checks have no score cap (the skipped-check fix on `staging`). Adham decides.
- Rules that can't yet say all they should: TRK-17 never returns fail (a missing hit is unverified). TRK-28 has no fact for "Conversions API detected", so its fail is hedged. GA4 rules don't hand over the campaign, page or product they name, the store's own rate, or the money currency, so templates only show them through the English `{reason}` (Arabic readers see none).
- 6 old ids that reader questions point to are now dropped (GA4-01, GTM-14, W-06, W-34, W-35). The questions need remapping.
