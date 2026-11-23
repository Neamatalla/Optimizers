# Phase 1: clean up the audit points, then decide in code what code can decide

Part of the 32h safety-net plan (ClickUp, Audit Feature list). Re-planned on 22 Nov 2026, after the inventory showed 731 overlapping points (about 280–360 items per report, three scores).

**Goal:** one master point list (`src/points/`) with one rule per point and role labels. Code decides every point it can decide with certainty. The AI writes only where judgement is needed. The report keeps its current structure: only the changes the new list forces.

## Steps

1. **Finish the list.** Done 22 Nov: 201 points (163 active, 38 parked), 217 old points dropped with reasons.
2. **Registry in code, no behaviour change.** Done 22 Nov: `src/points/` plus `points.test.ts`, which checks that every old id maps once.
3. **Code rules.** Done 22 Nov: all 81 code-decided points have a rule in `src/points/rules/` (one tested function each; a test fails if one is missing), run once on a real store visit with none erroring. New collector data is live (script errors, failed files, listing details, struck prices, page facts); the interaction probes and the 360px re-read run only with `COLLECT_PROBES=on`. The OAuth pull keeps Custom HTML up to 6,000 characters for the GTM parser (the prompt still sees 400). Not yet run per audit: `runNetChecks` (robots.txt, hreflang, links, 404) is built but not called from `poll.ts` (step 5). Thresholds are first drafts.
4. **Templates.** In progress. Done: format, renderer and tests in `src/points/templates/` (commit c76c85e), a 6-point pilot (TRK-20, TRK-11, PATH-08, PDP-01, NAV-10, SPEED-01), and on 23 Nov all 27 other tracking points (`tracking-2.ts`, `-3`, `-4`). Left: 48 points in COL, HOME, NAV, TRUST, OFFER, LAND, SPEED, SEO, RISK, PATH and PDP, one file per category (brief for the writers: `master-points/TEMPLATE-BRIEF.md`; in short: English default plus store owner, media buyer and agency voices; Arabic MSA, Gulf, Egyptian-friendly and neutral). Known gap: GA4 rules only hand over an English sentence, so Arabic text for GA4 points can't quote numbers until GA4 facts carry structured values.
5. **New results behind a flag.** One result per master point. Production keeps the old path until both are compared on saved reports. Needs one migration (a list-version column on findings): run only when asked, staging first.
6. **Wire the report** to read master points, keeping its sections. Old reports keep rendering from their old ids (`origin`).
7. **Retire the old list files** once everything in them lives in the registry (role data is already carried in `roleCopy`).

## Open, not decided here

- One score or three: Adham's call, before step 6.
- Unverified checks have no score cap (the skipped-check fix on `staging`). Adham decides.
- Registry text that disagrees with the code (found writing the tracking templates; the templates follow the code): TRK-25 doneWhen says Unassigned under 5%, the code fails above 10%. TRK-01, 02, 03, 21, 22 doneWhen use 14 days or "half the average", the code uses 28 days and its own benchmarks. TRK-32 lists home and product pages, the rule checks home only. Align the registry, or change the code.
- Rules that can't yet say all they should: TRK-17 never returns fail (a missing hit is unverified). TRK-28 has no fact for "Conversions API detected", so its fail is hedged. GA4 rules don't hand over the campaign, page or product they name, the store's own rate, or the money currency, so templates only show them through the English `{reason}` (Arabic readers see none).
- 6 old ids that reader questions point to are now dropped (GA4-01, GTM-14, W-06, W-34, W-35). The questions need remapping in step 6.
