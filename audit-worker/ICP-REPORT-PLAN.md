# ICP-tailored reports: plan (draft for approval, 2026-10-20)

Goal: the store owner (ICP1) and the media buyer (ICP2) each get a report
built for them: their own above-the-fold, order, copy and design. Driven by
the ICP cards, the ranked audit points and the CRO psychology knowledge base.
Then the same treatment for the other audit features (Conversion review,
emails, the form).

Status: **waiting for approval.** No report code has been changed yet.

## Inputs (all copied into `icp/research/` so every session can read them)

| File | What it is |
|---|---|
| `icp/store-owner.md`, `icp/media-buyer.md`, `icp/media-buyer-full.md` | Tool briefs |
| `Downloads/ICP1-Self-Serve-GCC-Store-Owner.md`, `Downloads/ICP2-Media-Buyer.md` | Canonical cards (human source) |
| `icp/research/icp-spec.md` | Condensed scoring spec for both readers, with the conflicts between sources |
| `icp/research/rank-store-owner.tsv`, `rank-media-buyer.tsv` | 402 ranked points per reader (draft, see §6) |
| `icp/research/clusters.jsonl`, `joined.jsonl`, `SCHEMA.md` | The merged 1,963 source points from CRO benchmark (5 stores), DataHash, Master Tracking Audit Checklist and Framework |
| `icp/research/psych-map.md` | The 65 psychology principles indexed; top 20 for ICP1, top 15 for ICP2, and the ones we must not use |
| `icp/research/report-survey.md` | How `html-report.ts` renders today, line numbers, risks |
| `Downloads/cro-psychology-ux-65-knowledge-base.md.txt` | The full knowledge base (6,562 lines) |

## Phase 0 (first): revamp the points per persona

Decided 2026-10-20 by Omar. **This replaces the ICP-PLAYBOOK §2 rule "one
checklist, four views".** Each persona gets its own checklist:
`STORE_OWNER_CHECKLIST` and `MEDIA_BUYER_CHECKLIST`, each covering GA4, GTM,
website code and CRO points. The report work (§2 onward) builds on them.

Steps:
1. **Fix the rankings** (§6) so the selection starts from clean lists.
2. **Select points per persona and per route.** Default: keep the three routes
   and the 50-point scale (GA4+GTM 25+25 · one tool 25 + 25 website · neither
   50 website), so scoring and the report keep working. Source pool: the 402
   ranked clusters plus the 100 current points. CRO points (today in the FUD
   pass) can move into a persona's 50 where they rank high.
3. **Rewrite every selected point for that persona**: title, pass state,
   common failure, action, who does it, done-when, and (buyer only) the ad
   effect. Owner: money and "where to fix it in Salla/Zid". Buyer: "is the
   number real?" / "does paid traffic convert?".
4. **Mark how each point is measured**: GA4 fact (code), GTM read, browser
   visit, or crawl. Points we can't measure are dropped, not faked.
5. **Review doc** `icp/PERSONA-POINTS-PROPOSAL.md` (both lists side by side,
   with the reason each point made the cut). Omar approves before code.
6. **Implement**: role-keyed lists in `checklist.ts` (old lists stay in
   `checklist-legacy.ts` style for old reports), GA4 facts for new GA4 points,
   prompt and tests updated. Requests with no role fall back to today's list.

Consequences to accept: two audits of the same store by different roles get
different scores; the four-role views for manager and agency keep today's list
until they get their own revamp.

## Rules that do not change

- Within one persona, pass/fail and numbers come from the data, never from
  the wording. Rewriting a point for a persona must not change what it measures
  unless the point is replaced on purpose.
- Money comes from GA4 only (ICP1 card §9). No GA4 → an honest
  "unavailable" state, never an estimate. Never sum money ranges.
- The media buyer never sees a ROAS, CPA, CAC, CPC or spend figure. Direction only.
- PRODUCT.md design rules: document-like, typography-led, calm severity,
  no hero score dial, no neon, no pill-badge flood, WCAG 2.2 AA, EN and AR equal.
- No principle from the "Do not use" list in `psych-map.md` (fake scarcity,
  invented anchors, fake social proof, fear copy, pre-checked consent, modals over findings).
- COD share is not quoted anywhere until the two card figures (10–30% vs 45–70%) are resolved.

---

## 1. ICP1, the 20 points, and where each one lands

R = shown in the report · C = shapes copy/design · B = business only (not in the report).

| # | Point | Use | How it shows up |
|---|---|---|---|
| 1 | مين هو | C | Gulf Arabic default, phone-first layout, no code words |
| 2 | نقاط الملاءمة | R | Platform-specific "where to fix" (Salla/Zid/Shopify); honest note when GA4 is missing |
| 3 | عايز إيه | R | Above the fold answers "what is costing me sales" in one sentence |
| 4 | اللي بيوجعه | R | Order of the report follows the ranked pains: fix steps first, sourced money, a reason to come back, payments, copy |
| 5 | إيه اللي يخليه يشتري | R | The money number is the lede; seasonal note (White Friday 27 Nov) |
| 6 | إيه اللي يخليه يمشي | R+C | One currency, one numeral system, no English on Arabic trust moments, no disprovable finding (ZATCA gate), no false regression |
| 7 | الأسعار | B | Not in the report. CTA stays free call; pricing is a separate decision |
| 8 | محتاج إيه من الأداة | R | Paste-ready fix per finding, "who does it", done-when, 375px |
| 9 | إزاي نكلّمه | C | Voice rules already in `store-owner.md`; source line under every number |
| 10 | مين مش هو | R | Low-fit notice when there is no store or no traffic |
| 11 | النجاح | R | "Done when" on each fix; re-check invite (see §5, open decision D1) |
| 12 | درجاته | B | Not shown |
| 13 | لسه مطلوب | R | Fix → re-check loop; 375px; one currency; merged duplicate findings |
| 14 | اللي بيحبه | R | Keep: SAR money hero, GCC checks, honest "unavailable", before/after crops |
| 15 | Elevr | R | Eight new owner checks (§3) |
| 16 | فحوصات نضيفها | R | Same eight + ZATCA only above SAR 31K/month GA4 revenue; SBC badge, not Maroof |
| 17 | حجم السوق | B | Not shown |
| 18 | الدفع والسلات المتروكة | R | Payment-method visibility; payment-step drop from GA4; abandoned cart framing using GA4 cart → purchase |
| 19 | المنافسين | C | Differentiate on money + checkout, never SEO meta; SEO checks move down for this reader |
| 20 | نوصله إزاي وإمتى | C+R | WhatsApp as the contact route in the CTA; pre-season line before White Friday / Ramadan |

ICP2 gets the same treatment from its card in session S4 (two questions,
forward-to-owner proof, platform vocabulary, Snap/TikTok, not only Meta).

---

## 2. Above the fold (the main ask)

Today every role sees the same block ("X passed N of 50" + category bars).
The owner's money hero is 2+ screens down. New ATF per reader, phone first (375px):

**Store owner**
1. One-line lede (Primacy #31, Framing #9): the biggest money finding and its fix.
   "Your checkout loses about SAR 14,200 a month: payment methods aren't shown before checkout."
2. Source line directly under it (Uncertainty Reduction #51, Trust Transfer #53):
   "From your Google Analytics, 21 Sep – 20 Oct, checkout step: 1,240 sessions."
3. Scope strip (Ambiguity Aversion #27): what we checked, what we couldn't.
4. "Fix today" block: top 3 fixes, each with who (you / your developer),
   where in Salla/Zid, and done-when (Implementation Intentions #44, Chunking #23).
5. One primary action plus a calm secondary: "See your 3 fixes" and
   "WhatsApp us" (Information Scent #37, Reactance #45).
No GA4: the lede leads with the biggest storefront finding and says money is
unavailable and how to connect.

**Media buyer**
1. Verdict lede (Primacy #31): "Tracking over-counts purchases; after the
   click, mobile checkout loses buyers." Or, when clean: "Site and tracking
   passed; look at targeting and creative" (Confirmation Bias #49).
2. Two-column split: "Is the number real?" / "Does paid traffic convert?",
   top 2 each, with the ad-effect direction (Chunking #23, Framing #9).
3. Evidence status line (Visibility of System Status #56): "GTM v42 read ·
   GA4 last 30 days · checkout not observed".
4. Primary: "Forward the owner summary" (Trust Transfer #53). Secondary: book a call.

---

## 3. New data, to cover the 20 points

**GA4 (OAuth, already connected)**
- Device array (mobile/desktop sessions, CR, revenue) as structured data,
  not only the GA4-05 sentence.
- Landing pages table (top 10 by sessions, CR, revenue).
- Payment-step drop (add_payment_info → purchase) where the event exists.
- Revenue per month, to gate ZATCA and the seasonal line.
- Week-day and salary-week pattern (S7#287: dip from the 11th, recovery ~20th).

**Storefront visit (headless, already running)**, the Elevr owner checks as FUD rules:
1. Tamara / Tabby / mada / Apple Pay visible on product page and cart.
2. Currency and language switch (by IP / selector).
3. Arabic product titles.
4. WhatsApp button visible on mobile.
5. Free-delivery threshold shown and explained.
6. COD fee disclosed before checkout.
7. Salla/Zid tracking duplication (platform collector + own pixel).
8. Coupon on the ad vs price at checkout (needs the ad's coupon; prompt the buyer for it, otherwise skipped).

**Clarity (new connector, decision D2)**: Microsoft Clarity's Data Export API
with a project token the visitor pastes. Rage clicks, dead clicks,
quick-backs and scroll depth by page and device, last 3 days. Fills
"what the customer experiences" with their own data.

**Hotjar**: no comparable data API for this. Detection only, as today.

---

## 4. Sessions

Each session is started by you on **Opus 5.5, medium effort**, and stops at
about 300K tokens. It ends by updating the status log below and writing a
handoff note at the bottom of this file. The next session starts by reading
this file.

| Session | Name | Scope | Done when |
|---|---|---|---|
| S0a | `persona-points-select` | Phase 0 steps 1–5: ranking fixes, selection per persona and route, rewrite, review doc | `icp/PERSONA-POINTS-PROPOSAL.md` approved |
| S0b | `persona-points-implement` | Phase 0 step 6: role-keyed checklists, GA4 facts, prompt, tests | `npm test` passes; previews render for both roles and for no role |
| S1 | `icp-report-foundations` | Full AuditResult preview fixture with ga4Metrics, device array and role-correct text; fix the draft rankings (§6); screenshot the current store-owner and media-buyer previews at 375px and 1280px as the baseline | Baseline screenshots saved in `output/baseline/`; previews render all sections |
| S2 | `icp1-owner-above-fold` | Owner ATF (§2), first section, finding card anatomy (one number, what the customer sees, change this, source), Arabic copy | Owner ATF works at 375px EN/AR, print, legacy |
| S3 | `icp1-owner-body` | Owner order by ranking; Elevr FUD rules (§3); "What's working, keep it"; action plan split "you today / your developer"; method box; CTA with WhatsApp; owner email; screenshot compare and map every addition back to §1's 20 points | Comparison doc with screenshots, every R point checked |
| S4 | `icp2-buyer-report` | Buyer ATF, the two-question structure, forward-to-owner view, repro steps on tracking cards, platform grouping (Meta, Snap, TikTok, Google), buyer email, screenshot compare | Same as S3 for ICP2 |
| S5 | `clarity-connector` | Form field, token storage, Clarity fetch, facts, render in both reports | Real Clarity data in a test report |
| S6 | `other-audit-features` | Same principles on the Conversion review section, internal review email (talk track), the form copy in `GetFreeAudit.tsx`, the re-check email | Each feature checked against `psych-map.md` |

S5 can move earlier or be dropped depending on D2.

## 5. Decisions needed from you before S1

- **D1. Monthly use vs one audit per site.** You want the tool to be part of the
  owner's monthly budget, with a re-check loop. Today the intake allows one audit
  per website, ever (unique index). Options: (a) allow a monthly re-check for the
  same site, (b) keep one audit and only add a 14-day "check again" email,
  (c) leave it for later. Recommend (a) limited to the same email, once a month.
- **D2. Clarity connector.** Build it (S5), or keep Clarity as detection only.
  Recommend build: it's free for owners, and it's on Salla's app store.
- **D3. WhatsApp contact route.** Which number goes on the CTA.

## 6. Ranking fixes (done in S1)

The draft rankings in `icp/research/` have known problems:
1. Developer-only tag items rank high for the store owner. Apply the spec rule: impact ≤ 1 for this reader.
2. Points tested on zero stores sit above tested ones. Split each list into "tested in CRO audits" and "checklist only".
3. Add a platform column (GA4 / GTM / Website).
4. CRO-pE results are mostly unusable (Cloudflare challenge page). Frequency comes from 4 stores, not 5.

## Status log

| Date | Session | What changed |
|---|---|---|
| 2026-10-20 | planning | Inputs gathered and copied into `icp/research/`; plan drafted. No code changed. |
| 2026-10-20 | planning | Omar: points come first. Added Phase 0 (per-persona checklists) and sessions S0a/S0b. |
| 2026-10-20 | S0a (in the planning session) | Steps 1–5 done: 8 lists × 25 selected by value to the persona, rewritten, deduped across sections (owner 13, buyer 17). Review doc `icp/PERSONA-POINTS-PROPOSAL.md` waiting for Omar. No code changed. |
| 2026-10-20 | D2 decided: build Clarity | Connector built: form panel, `api/clarity/connect.js`, `api/_lib/clarity.js`, migration `2026-10-20-add-clarity-data.sql` (not applied yet), worker `clarity-facts.ts` → prompt. The 17 checklist Clarity points are setup checks the API can't see; 3 behaviour points per persona added to the proposal instead. Report rendering of Clarity comes with S0b/S1. |
| 2026-10-20 | S0b + S2/S3/S4 (first pass) | Persona checklists live (`checklist-persona-data.ts` generated by `icp/research/gen-persona-checklist.mjs`, `persona-checklist.ts`), 28 GA4 facts reused, ad effects and lanes per point, reader questions mapped via source points. Report: own opening per persona (owner: money headline + GA4 source + 3 fixes with who/change/done + scope strip + two paths; buyer: ROAS verdict + scan status + two-question columns + forward-to-owner), owner action plan split you/developer, "keep it", Clarity section, "how this audit works". Not yet: Conversion review still on its own rules, 18 new GA4 queries, owner GTM cut to 18, ad-text form field, before/after comparison doc. |
| 2026-10-20 | remaining items | Omar: keep owner GTM at 25. Done: 17 new GA4 facts (GA4-P01..P17, new report pulls in google-oauth.js) deciding 18 persona GA4 points (46 code-decided in all); ad text + coupon fields for the buyer (`ad_context`, migration 2-…); persona Conversion review (grouped by who acts, persona copy); persona client emails and talk tracks; duplicate check no longer counts test rows; `icp/comparison/COMPARISON.md` with before/after screenshots. Open: WhatsApp number (D3), season line, ZATCA/SBC owner points, MB-GA4-10/16 and the 6 buyer CRO points still model-judged. |
| 2026-10-20 | D1 decided | Omar: no re-check. One free audit per site, ever. The re-check code, migration 3 and the report progress line were removed; the unique index stays. The duplicate check still skips test rows. |

## Handoff

(Each session appends its handoff here.)
