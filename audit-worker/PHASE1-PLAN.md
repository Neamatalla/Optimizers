# Phase 1: clean up the audit points, then decide in code what code can decide

Part of the 32h safety-net plan (ClickUp, Audit Feature list). Re-planned on 22 Nov 2026, after the inventory showed 731 overlapping points (about 280–360 items per report, three scores).

**Goal:** one master point list (`src/points/`) with one rule per point and role labels. Code decides every point it can decide with certainty. The AI writes only where judgement is needed. The report keeps its current structure: only the changes the new list forces.

## Steps

1. **Finish the list.** Done 22 Nov: 201 points (163 active, 38 parked), 217 old points dropped with reasons.
2. **Registry in code, no behaviour change.** Done 22 Nov: `src/points/` plus `points.test.ts`, which checks that every old id maps once.
3. **Code rules.** Done 22 Nov: all 81 code-decided points have a rule in `src/points/rules/` (one tested function each; a test fails if one is missing), run once on a real store visit with none erroring. New collector data is live (script errors, failed files, listing details, struck prices, page facts); the interaction probes and the 360px re-read run only with `COLLECT_PROBES=on`. The OAuth pull keeps Custom HTML up to 6,000 characters for the GTM parser (the prompt still sees 400). Not yet run per audit: `runNetChecks` (robots.txt, hreflang, links, 404) is built but not called from `poll.ts` (step 5). Thresholds are first drafts.
4. **Templates:** pass/fail text per point, English and Arabic, with role wording from `roleCopy`. Code fills in the numbers. The AI only covers code+ai and ai points.
5. **New results behind a flag.** One result per master point. Production keeps the old path until both are compared on saved reports. Needs one migration (a list-version column on findings): run only when asked, staging first.
6. **Wire the report** to read master points, keeping its sections. Old reports keep rendering from their old ids (`origin`).
7. **Retire the old list files** once everything in them lives in the registry (role data is already carried in `roleCopy`).

## Open, not decided here

- One score or three: Adham's call, before step 6.
- Unverified checks have no score cap (the skipped-check fix on `staging`). Adham decides.
- 6 old ids that reader questions point to are now dropped (GA4-01, GTM-14, W-06, W-34, W-35). The questions need remapping in step 6.
