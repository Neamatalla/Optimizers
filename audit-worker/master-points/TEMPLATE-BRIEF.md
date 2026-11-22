# Brief: write report templates for audit master points

You write the report text for some of Optimizers' audit master points, so the AI stops writing the same finding on every run. You work in your own git worktree on your own branch. First run `git reset --hard feature/deterministic-checks` if your worktree has no `audit-worker/` folder (it should then be at commit c76c85e or later), and link or install `audit-worker/node_modules` (`npm ci` in audit-worker/, or reuse `E:\Optimizers\Optimizers\audit-worker\node_modules`).

## Read first (all in audit-worker/)
- `src/points/templates/types.ts` (the format) and `render.ts` (how slots fill and fall back).
- The pilot templates as the style and quality bar: `templates/tracking.ts` (TRK-20, TRK-11), `buying-path.ts` (PATH-08), `product-page.ts` (PDP-01), `navigation.ts` (NAV-10), `speed.ts` (SPEED-01).
- Voice: `src/audit-prompt.ts` lines ~265-345 (TECHNICAL voice, BUSINESS voice, LENGTH, WRITING RULES, READING LEVEL); the reader briefs `icp/store-owner.md`, `icp/media-buyer.md`, `icp/marketing-manager.md`, `icp/agency.md`; Arabic registers in `src/audience.ts` (`arabicRegisterRule`).
- For each of your points: its entry in `src/points/registry.ts` (`rule` = what pass/fail means, `roleCopy` = the old role titles, why it matters and the media buyer's `adEffect`), and its code rule in `src/points/rules/*.ts` (search the id) to see the exact `facts` keys it returns and what its `reason` sentence says.

## What to write per point
- `en.default.pass` and `en.default.fail`: full Copy. `technical.summary` is `"{reason}"` (the rule's sentence with the store's values). `technical.detail`: the mechanism, may use the rule's facts slots. `business.summary` + `business.detail`: plain words, what it costs or protects. Fail: `step` (the fix, concrete, who does it) and `doneWhen` (checkable). Pass: `protect` (what keeps it clean).
- `en.store_owner` and `en.media_buyer`: `business` overrides for pass and fail (store owner: money-first, "your store", platform terms like Salla/Zid/Shopify only when sure; media buyer: every fail names the effect on ROAS, CPA/CAC, CVR or the signal, direction only, never a number, matching the point's `adEffect`; say who must fix it). `en.agency`: `business` overrides that call the store "the store" (they forward it to their client).
- `ar.default` (clear professional MSA, for the marketing manager), `ar.store_owner` (native Gulf/Saudi, توصيل not شحن, أضف للسلة), `ar.media_buyer` (Egyptian-friendly everyday Arabic, ad terms in Latin: ROAS, CAC, CPA, CVR, Pixel, CAPI, event_id, UTM…), `ar.agency` (neutral MSA, «المتجر», never as if the reader owns it). `ar.default` must be complete (pass and fail, both voices, step, doneWhen, protect); the role ones override `business` (and `step` when the wording differs). Arabic `technical.summary` cannot use `{reason}` (English): write a fixed sentence, with facts slots where useful.
- Slots: only the rule's real facts keys, or `{reason}` in English. Never invent a number, threshold or money figure the rule doesn't give.
- Length: pass details 1-2 sentences, fail details 2-3. No em dashes, none of the banned words (see the writing rules), Western digits only, no "X, not Y" endings, no reassuring closers, no selling.

## Files
Write ONLY your file(s) named in your task. Do not edit index.ts, render.ts, types.ts, the tests or package.json. Before finishing, in `audit-worker/`: `npx tsx --test src/points/templates/templates.test.ts` and `npm run build` must pass (the test checks completeness and the writing rules for every template). Commit on your branch with a short plain message, no Claude mention.

## Report back (short)
Branch, commit, points written, anything you couldn't phrase without a fact the rule doesn't give (name the missing fact).
