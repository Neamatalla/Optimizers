# Brief: select and rewrite 25 points for one persona and one section

You get one candidate pool (one persona × one section). Pick the 25 best points
for that persona and rewrite each one in that persona's terms. Every agent
uses this brief, so the eight lists fit together.

## Read first
- Persona spec: `icp/research/icp-spec.md` (your persona's section + "Scoring hints").
- Persona brief: `icp/store-owner.md` or `icp/media-buyer.md`.
- Psychology map: `icp/research/psych-map.md` (your persona's top principles and the "Do not use" list).
- Format of today's points: `src/checklist.ts` lines 1–120 (types, `point()` helper, a few GA4 points), and the GA4 facts list in `icp/research/report-survey.md`.
- Your pool file (JSON lines). Fields: cand (candidate id), label, score (0–100 for this persona, null for current-tool points), I/A/M (impact, actionability, measurability 0–5), tested (CRO audits tested it), stores_fail, already_in_tool, reason, criteria, effect.

## What we can measure (hard limit)
GA4 Data API via OAuth (reports: funnel events, devices, channels, landing pages, campaigns, products, countries, hour/weekday, new vs returning, search terms, key events, admin settings); GTM container read via service account (tags, triggers, variables, versions); a headless phone + desktop visit of home, one collection, one product and the cart (DOM, network hits, dataLayer, screenshots; we add one product to the cart, never go past the cart); a public crawl (HTML source, robots, sitemap). **No ad accounts, no store admin, no checkout after the cart, no Clarity/Hotjar data.** A point we can't measure with these is dropped, not reworded.

## How to pick (Omar, 2026-10-20: highest priority and most value to the persona)
1. **Rank by value to this persona, highest first.** Value = how much the point changes this persona's goal (store owner: sales and money, things they can fix; media buyer: "is the number real?" and "does paid traffic convert?" — ROAS/CAC/CVR direction). Use the persona spec's rules and the pool's I score as the starting point. Take the 25 most valuable.
2. **Measurability is a gate, not a ranking factor.** A point we can't measure with the tools below is dropped. A measurable point is never ranked lower just because it is harder to check.
3. **Tie-breakers only** (use only between points of equal value): tested in CRO audits with real store failures, then already in the current tool (`cand` starts with `EXIST-`). Never keep a current-tool point over a more valuable new one.
4. No two points may measure the same thing. Merge duplicates into one point and list all source ids.
5. Store owner: developer-only tag internals score low unless they change a sales number the owner sees. Media buyer: CRO best-practice items with no measured leak score low.
6. Exactly 25 points. If the pool can't give 25 good, measurable points, return fewer and say why.

## Output
One Write call, JSON lines, to the path in your task. One object per point, in priority order (1 = most important for this persona):

```
{"id":"<SO|MB>-<GA4|GTM|WC|CRO>-01","rank":1,
 "title":"<short, in the persona's words>",
 "group":"<group key>","group_en":"<section heading>","group_ar":"<Arabic heading>",
 "severity":"critical|medium|low",
 "opportunity":"revenue_gain|revenue_loss|risk|benefit",
 "owners":["owner"|"dev"|"marketing"|"content"],
 "pass":"<what good looks like, checkable>",
 "fails":"<the common failure, concrete>",
 "validate":"<exactly how the worker checks it with the tools above>",
 "measured_by":"ga4_fact|ga4_report|gtm_read|browser|crawl",
 "fact":true|false,          // true = decided by code from GA4 numbers (like today's fact points)
 "new_fact":true|false,      // true = needs a new GA4 query or computation that doesn't exist yet
 "action":"<default action, in the persona's words>",
 "done_when":"<checkable done state>",
 "why_it_matters":"<one line: owner = sales effect in plain words; buyer = ROAS/CAC/CVR direction or data the platforms see>",
 "ad_effect":"performance|aov|cost|inflated|deflated|optimization|none",   // media buyer only; store owner writes "none"
 "psych":["#51","#44"],      // principle ids from psych-map.md that shape this point's copy
 "sources":["<cand ids merged into this point>"],
 "selected_because":"<one line>"}
```

Write the text fields in English. Arabic copy is generated later; only `group_ar` is Arabic here (Gulf Arabic for the store owner, Egyptian-friendly with Latin ad terms for the media buyer).

Rules for the text: no invented numbers or benchmarks; buyer text never states ROAS, CPA, CAC, CPC or spend values; no fear or hype words; owner text names the place in Salla/Zid/Shopify only if certain, otherwise plain words.

## Reply
Only: output path, number of points, and up to 3 lines on problems (for example "pool had only 18 measurable points"). No other text.
