# Psychology map: free audit report x ICP1 / ICP2

Source: `cro-psychology-ux-65-knowledge-base.md.txt` (kb id `cro-psychology-ux-65`, content_version 1.0.0, 2026-10-15). Profiles: `icp-spec.md`.

**How to read the evidence column.** The file gives **no evidence-strength grade**. It says so outright: `evidence_review_status` is "not a formal evidence-strength grade". Every application has the status `untested_local_hypothesis`, and `guaranteed_uplift: false`. The labels below are mine, built from what the file does give:
- **TSM-R**: `targeted_source_mapping` to a research source (S03-S07, S12-S17). Two of these come with caveats: S03 found a near-zero average effect for choice overload, and S04 says the IKEA effect needs successful completion.
- **TSM-P**: `targeted_source_mapping` to a practitioner source (S01 Cialdini; S02, S08-S11 and S19-S26 NN/G; S18 Baymard). These guide reviews. They "do not quantify conversion uplift".
- **CS**: `conceptual_summary_not_individually_source_reviewed`. The file says: do not call it established, and "obtain a targeted literature review before using it to justify a high-impact automated recommendation".

## Principle index

| # | Name | Cat | Evidence | What it means for a report UI |
|---|---|---|---|---|
| 1 | Reciprocity | 1 Persuasion | TSM-P S01 | Give the full report free and ungated. Keep the CTA separate. Never imply the reader owes us. |
| 2 | Social Proof | 1 Persuasion | TSM-P S01 | Only real, dated, permissioned client outcomes. Never counters or invented testimonials. |
| 3 | Authority Bias | 1 Persuasion | TSM-P S01 | Show the method, the data source, the scan date and who did the analysis. No implied certifications. |
| 4 | Liking Principle | 1 Persuasion | TSM-P S01 | A real named analyst and a plain human voice. No fabricated story. |
| 5 | Unity Principle | 1 Persuasion | TSM-P S01 | Use GCC-native context (Salla/Zid, mada, COD). Do not stereotype or set identity tests. |
| 6 | Scarcity Principle | 1 Persuasion | TSM-P S01 | Banned for the report: no countdowns, no "limited audit slots". |
| 7 | Mere Exposure Effect | 1 Persuasion | TSM-R S17 | Email and report should look and sound the same. For ICP2 it is also a finding type (ad-to-page match). |
| 8 | Anchoring Effect | 2 Pricing | CS | Use only GA4-derived reference numbers. No invented "you could earn" or inflated price anchors. |
| 9 | Framing Effect | 2 Pricing | TSM-R S15 | Money first, with the same denominator and period. No cherry-picked relative %. |
| 10 | Decoy Effect | 2 Pricing | CS | No fake or unusable pricing tiers to steer people toward the retainer. |
| 11 | Compromise Effect | 2 Pricing | TSM-R S12 | If tiers are shown, each must be real. No "most popular" label without data. |
| 12 | Contrast Effect | 2 Pricing | TSM-R S12 | Before/after re-scan comparison on the same units and the same GA4 window. |
| 13 | Endowment Effect | 2 Pricing | TSM-R S13 | "Your store's report", named and personal. Weak lever; implies no obligation. |
| 14 | Mental Accounting | 2 Pricing | CS | When pricing the paid tier, show the real charge and cadence as prominently as any monthly equivalent. |
| 15 | Zero Price Effect | 2 Pricing | TSM-R S07 | "Free" must mean free: no hidden email lock-in, no auto-renewal. |
| 16 | Price-Quality Heuristic | 2 Pricing | CS | Justify paid-tier value with specifics, not price signalling. Low relevance. |
| 17 | Transaction Utility | 2 Pricing | CS | No "save X%" against fictional prices. |
| 18 | Hick's Law | 3 Decision | CS | Few clear next actions (top 3 fixes, 1 CTA). It is not a conversion formula. |
| 19 | Choice Overload | 3 Decision | TSM-R S03 (null avg) | Shortlist the top fixes but keep the full list reachable. The meta-analysis shows a near-zero average effect. |
| 20 | Cognitive Load Theory | 3 Decision | TSM-P S11 | One money number per finding, short sentences, one next action per card. |
| 21 | Processing Fluency | 3 Decision | CS | Plain-language, document typography. Ease must not lend false credibility. |
| 22 | Recognition Over Recall | 3 Decision | TSM-P S10 | Keep the top-fix summary and its status visible. Card IDs the reader can quote back. |
| 23 | Chunking Principle | 3 Decision | TSM-P S11 | Group findings by task: checkout/payment, delivery, trust, tracking. |
| 24 | Progressive Disclosure | 3 Decision | TSM-P S09 | Summary line first, then expandable detail and how-to. Never hide the source or the caveats. |
| 25 | Default Effect | 3 Decision | CS | No pre-checked consent for monthly emails or WhatsApp reminders. |
| 26 | Status Quo Bias | 3 Decision | CS | Make the re-scan a one-tap repeat of the last setup. Do not auto-enrol. |
| 27 | Ambiguity Aversion | 3 Decision | CS | State plainly what was checked, what was not, and what is unavailable. |
| 28 | Satisficing | 3 Decision | CS | "Good enough" done-when checks per fix, so the reader knows when to stop. |
| 29 | Von Restorff Effect | 4 Attention | CS | One restrained primary CTA. Not neon, not colour-only. |
| 30 | Salience Effect | 4 Attention | CS | Make the SAR figure and the fix the most visible facts on a card. Never bury caveats. |
| 31 | Primacy Effect | 4 Attention | CS | Lead with the single most valuable finding's one-liner. Not a hero score. |
| 32 | Recency Effect | 4 Attention | CS | A closing recap of the top 3 fixes plus the next step at the end. |
| 33 | Picture Superiority Effect | 4 Attention | CS | Annotated real screenshots of the store's own page. No decorative imagery. |
| 34 | Gestalt Proximity | 4 Attention | CS | Keep each number next to its source label and its fix inside one card. |
| 35 | Gestalt Similarity | 4 Attention | CS | Consistent card anatomy. Severity shown by text label plus shape, not colour alone. |
| 36 | Figure-Ground Principle | 4 Attention | CS | Calm background and AA contrast. No overlays or modals over findings. |
| 37 | Information Scent | 4 Attention | TSM-P S08 | Email subject, links and CTAs name their real destination ("See your 3 fixes"). |
| 38 | Goal Gradient Effect | 5 Motivation | TSM-R S05 | Re-scan progress ("4 of 7 fixed"), using only verified re-scan results. |
| 39 | Present Bias | 5 Motivation | CS | Give an immediate quick win (a fix doable today). No exploitative urgency. |
| 40 | Fresh Start Effect | 5 Motivation | TSM-R S06 | Monthly re-scan tied to a real landmark (month start, Hijri month, payday). |
| 41 | Peak-End Rule | 5 Motivation | CS | End on a clear, helpful next step and a recap, not a hard sell. |
| 42 | IKEA Effect | 5 Motivation | TSM-R S04 | Owner ticks off fixes themselves. Only works if the fix is completable. |
| 43 | Sunk Cost Fallacy | 5 Motivation | CS | Never "you've already done 3, don't waste it". Saved progress is OK. |
| 44 | Implementation Intentions | 5 Motivation | TSM-R S16 | Each fix says who does it, where, and when it is done. Optional opt-in reminder. |
| 45 | Psychological Reactance | 5 Motivation | CS | No gates, no confirmshaming. The reader can fix it themselves or book a call. |
| 46 | Negativity Bias | 6 Trust | CS | Calm severity. Include passed checks so the report is not all alarm. |
| 47 | Regret Aversion | 6 Trust | CS | Reduce mismatch (clear scope). No "don't regret losing SAR X" copy. |
| 48 | Halo Effect | 6 Trust | CS | Polished document design boosts credibility. Must not stand in for evidence. |
| 49 | Confirmation Bias | 6 Trust | CS | Balanced verdicts: say when the evidence cuts against the reader's belief. |
| 50 | Affect Heuristic | 6 Trust | CS | No fear-based pressure. Use a neutral, reassuring tone. |
| 51 | Uncertainty Reduction | 6 Trust | TSM-P S18 | Every number shows its source, period and method. Estimates are labelled as estimates. |
| 52 | Expectation-Confirmation | 6 Trust | CS | Email promise = report content. "Money at stake" is not a promised gain. |
| 53 | Trust Transfer | 6 Trust | CS | "From your GA4 property" is OK. Do not imply that Google, Meta or Salla endorse us. |
| 54 | Jakob's Law | 7 UX | TSM-P S02 | Familiar document/report conventions: ToC, headings, page-like flow. |
| 55 | Fitts's Law | 7 UX | TSM-R S14 | Large tap targets for the CTA, expanders and language toggle at 375px. |
| 56 | Visibility of System Status | 7 UX | TSM-P S19 | Scan date, data freshness, checks run, and what was "not checked". |
| 57 | Match with the Real World | 7 UX | TSM-P S20 | Gulf Arabic, SAR, mada/Tabby/Tamara/COD, platform menu names, Western digits. |
| 58 | User Control & Freedom | 7 UX | TSM-P S21 | Language toggle, unsubscribe and opt-out of reminders that are easy to find. |
| 59 | Consistency & Standards | 7 UX | TSM-P S22 | The same card anatomy, terms and severity scale across EN/AR and across months. |
| 60 | Error Prevention | 7 UX | TSM-P S23 | Booking form: validate GCC phone formats. Do not reject valid Arabic names. |
| 61 | Error Recovery | 7 UX | TSM-P S26 | If GA4 fails, show an honest "unavailable" state plus how to reconnect. Keep the rest of the report. |
| 62 | Flexibility & Efficiency | 7 UX | TSM-P S24 | Jump links, skim mode, and a share/forward link per card. |
| 63 | Aesthetic & Minimalist Design | 7 UX | TSM-P S25 | Strip decoration, but never strip sources, caveats or contact routes. |
| 64 | Affordances & Signifiers | 7 UX | CS | Expanders and CTAs look and behave as controls, with names exposed to screen readers. |
| 65 | Help & Documentation | 7 UX | TSM-P S02 | "How to do this in Salla/Zid" help inside the card, plus a human route (WhatsApp). |

## Fit to store owner (ICP1)

ICP1 needs and pains: (N1) money first in SAR, from GA4; (N2) a believable, sourced number that cannot be disproved; (N3) help between "see" and "fix"; (N4) a reason to come back, via WhatsApp; (N5) plain Gulf Arabic, no hype; (N6) no time or skill.

1. **#51 Uncertainty Reduction** (TSM-P)
   - **Need:** N2.
   - **Where:** finding card plus a "How we got this number" footer.
   - **Do:** under each SAR figure, a muted line: "From your GA4, 1 Sep-30 Sep, checkout step: 1,240 sessions x 18% gap." If GA4 is missing: "Not available: GA4 not connected."
   - **Guard:** "Distinguish estimates from guarantees". Clarity can lower conversion when the terms are bad.
2. **#27 Ambiguity Aversion** (CS)
   - **Need:** N2, plus fear of being lied to.
   - **Where:** above the fold (scope strip) and on each card.
   - **Do:** a scope strip, "Checked: storefront, GA4 funnel. Not checked: checkout after payment, admin settings." Cards carry a "Confirm with owner" chip for COD share and payment config.
   - **Guard:** do not turn estimates into guarantees.
3. **#9 Framing Effect** (TSM-R)
   - **Need:** N1.
   - **Where:** card summary line.
   - **Do:** "This step is costing about SAR 14,200 a month," before any technical term. Same period and denominator on every card. One currency, Western digits.
   - **Guard:** no cherry-picked denominators or misleading relative %.
4. **#31 Primacy Effect** (CS)
   - **Need:** N1, N6.
   - **Where:** above the fold.
   - **Do:** open with a one-paragraph lede naming the single biggest money finding and its fix. Not a score dial.
   - **Guard:** the top claim's caveat must sit right there, not lower down.
5. **#20 Cognitive Load** (TSM-P)
   - **Need:** N6.
   - **Where:** finding card.
   - **Do:** each card has one money number, one "what the customer sees", and one "change this". Sentences of 20 words or fewer.
   - **Guard:** do not delete disclosures in the name of simplicity.
6. **#44 Implementation Intentions** (TSM-R S16)
   - **Need:** N3, the biggest gap.
   - **Where:** action plan.
   - **Do:** each fix has Who (you in the admin / your developer), Where (menu path only if certain, else plain words), and Done when ("mada logo shows under Add to cart on mobile"). Optional "Remind me on WhatsApp on [date]".
   - **Guard:** "No default reminders, invented commitments, or forced scheduling."
7. **#57 Match with the Real World** (TSM-P)
   - **Need:** N5.
   - **Where:** Arabic copy, all cards.
   - **Do:** Gulf Arabic (توصيل, أضف للسلة), mada/Apple Pay/STC Pay/Tabby/Tamara, "COD fee", "free-delivery threshold". Arabic-first, with no English on Arabic trust moments.
   - **Guard:** literal translations can still fail, so test with the audience. Do not use familiar terms to hide meaning.
8. **#24 Progressive Disclosure** (TSM-P)
   - **Need:** N6, N2.
   - **Where:** finding card.
   - **Do:** a collapsed card shows the summary line and the SAR figure. Expanded, it shows the customer's experience, the sales effect, how to fix, and the evidence screenshot.
   - **Guard:** never hide the source or caveats behind the expander. Expanders must be keyboard-operable.
9. **#23 Chunking** (TSM-P)
   - **Need:** N3, N6.
   - **Where:** report structure and action plan.
   - **Do:** sections Checkout & payment / Delivery & cost / Product page trust / Arabic & mobile. Action plan split into "You can do today" and "Needs a developer".
   - **Guard:** no magic chunk count. Over-grouping adds navigation.
10. **#30 Salience** (CS)
    - **Need:** N1.
    - **Where:** finding card.
    - **Do:** the SAR figure gets the strongest type weight on the card, with severity as a text label ("High impact"). No red alarm blocks.
    - **Guard:** "Do not use salience to bury fees or overemphasize trivial savings." The same applies to caveats.
11. **#46 Negativity Bias, used defensively** (CS)
    - **Need:** N5 (no fear).
    - **Where:** summary and passed-checks section.
    - **Do:** a "What's working, keep it" section listing passed points. Calm severity words only.
    - **Guard:** do not suppress real problems. Calm is not the same as hiding.
12. **#49 Confirmation Bias, used defensively** (CS)
    - **Need:** N2.
    - **Where:** finding card.
    - **Do:** "Why this might not apply to you" line on estimate-based findings. Show contrary evidence (e.g. mobile conversion is fine).
    - **Guard:** "Do not conceal disconfirming evidence."
13. **#1 Reciprocity** (TSM-P)
    - **Need:** trust before the ask.
    - **Where:** whole report, CTA.
    - **Do:** full findings visible with no login and no paywall on the top fixes. CTA: "Want us to do these for you? Book a 20-min call". Separate from the content.
    - **Guard:** "Do not imply a debt, conceal a sales pitch, or require unnecessary personal data."
14. **#3 Authority** (TSM-P)
    - **Need:** N2.
    - **Where:** footer/method box.
    - **Do:** a "How this audit works" box covering data sources (GA4 OAuth, headless visit, public crawl), scan date, named analyst, and what "estimated" means.
    - **Guard:** no implied certification or independent endorsement without substantiation.
15. **#38 Goal Gradient** (TSM-R S05)
    - **Need:** N4.
    - **Where:** re-scan loop.
    - **Do:** next month's report header reads "4 of 7 fixes confirmed by re-scan". The progress list is driven only by verified re-checks.
    - **Guard:** "Do not invent progress, move thresholds secretly."
16. **#40 Fresh Start** (TSM-R S06)
    - **Need:** N4.
    - **Where:** email and WhatsApp re-scan invite.
    - **Do:** "New month: your October re-scan is ready". Send at month start; localise to the reader's calendar.
    - **Guard:** "Avoid shame, unrealistic transformation claims, or invented deadlines." Initiation is not persistence, so track repeat opens.
17. **#52 Expectation-Confirmation** (CS)
    - **Need:** N2.
    - **Where:** email and the report lede.
    - **Do:** the email promises exactly what the report has ("3 fixes on your checkout, from your GA4 data"). Call it "money at stake", not "money you will gain".
    - **Guard:** do not misrepresent typical outcomes.
18. **#37 Information Scent** (TSM-P)
    - **Need:** N6.
    - **Where:** email and CTA.
    - **Do:** button labels name the outcome: "Open your report", "See the 3 fixes", "Book a 20-min call". The heading at the destination matches the label.
    - **Guard:** no clickbait or labels that over-promise.
19. **#45 Reactance** (CS)
    - **Need:** N5.
    - **Where:** CTA and email.
    - **Do:** two equal-dignity paths, "Fix it yourself (plan above)" or "Let us do it". No pop-ups and no confirmshaming opt-outs.
    - **Guard:** "Avoid confirmshaming, obstructed cancellation, repeated prompts."
20. **#65 Help & Documentation** (TSM-P)
    - **Need:** N3, N6.
    - **Where:** finding card ("How to" expander) and the closing section.
    - **Do:** step-by-step "In Salla" / "In Zid" notes only where we are certain of the path. A WhatsApp human route ("Stuck? Message us").
    - **Guard:** "Do not provide obsolete instructions". Keep the instructions current. Help opens are not success.

Also relevant (21-24): #53 Trust Transfer ("From your Google Analytics 4", without implying Google endorses us); #41 Peak-End and #32 Recency (end with the top-3 recap and one next step); #48 Halo (document polish, never a substitute for sources); #42 IKEA (the owner ticks off fixes, if the fixes are completable).

## Fit to media buyer (ICP2)

ICP2 needs: (Q1) is the number real; (Q2) does paid traffic convert; (M1) proof the owner will accept, which can be forwarded; (M2) direction only, no ROAS/CPA figure; (M3) a named owner for each change; (M4) their own vocabulary.

1. **#51 Uncertainty Reduction** (TSM-P)
   - **Need:** Q1.
   - **Where:** above the fold verdict and on tracking cards.
   - **Do:** a "Purchase fires 2x on thank-you refresh" card, with the evidence (network/dataLayer capture, timestamp, URL) attached.
   - **Guard:** do not offer certainty that the evidence does not support.
2. **#27 Ambiguity Aversion** (CS)
   - **Need:** Q1, M2.
   - **Where:** cards.
   - **Do:** label things we cannot see: "Not verifiable from audit: check in Events Manager" (EMQ, dedupe, match rate). Checkout steps beyond the cart: "Not checked".
   - **Guard:** do not omit unfavourable conditions.
3. **#9 Framing Effect** (TSM-R)
   - **Need:** M2.
   - **Where:** card summary.
   - **Do:** "Reported ROAS likely reads high (over-count)". For a fix that lowers the number: "This is the truth showing, not performance dropping".
   - **Guard:** no ROAS, CPA or spend numbers, and no misleading relative %.
4. **#3 Authority** (TSM-P)
   - **Need:** M1.
   - **Where:** card evidence block and the method box.
   - **Do:** each tracking card carries reproducible steps ("Open the thank-you page, refresh, see 2 Purchase hits in Pixel Helper"). Method and date are shown.
   - **Guard:** do not imply Meta or Google certification.
5. **#53 Trust Transfer** (CS)
   - **Need:** M1.
   - **Where:** forwardable card.
   - **Do:** a "Forward to owner" view that is self-contained, names who must change it (developer / GTM admin / store owner), and cites the platform's own tool as the check (Test Events, Tag Assistant).
   - **Guard:** platform logos are not product endorsement.
6. **#57 Match with the Real World** (TSM-P)
   - **Need:** M4.
   - **Where:** all copy, including Arabic.
   - **Do:** CAPI, event_id, fbclid/ttclid/ScCid, LPV, CVR, key events, kept as Latin terms inside Arabic sentences.
   - **Guard:** test terms with the audience. Literal translations fail.
7. **#23 Chunking** (TSM-P)
   - **Need:** Q1, Q2.
   - **Where:** report structure.
   - **Do:** two top sections, "Is the number real?" and "Does paid traffic convert?". Inside, cards are grouped by platform (Meta first, then Snap, TikTok, Google).
   - **Guard:** no arbitrary sub-grouping.
8. **#31 Primacy** (CS)
   - **Need:** "ads or site?"
   - **Where:** above the fold.
   - **Do:** a one-line verdict lede, e.g. "Tracking over-counts purchases; post-click, the checkout loses mobile buyers." No score gauge.
   - **Guard:** the caveat sits with the claim.
9. **#7 Mere Exposure / continuity** (TSM-R S17)
   - **Need:** Q2.
   - **Where:** finding content.
   - **Do:** a message-match finding: the ad promise vs the landing headline and offer, with screenshots side by side.
   - **Guard:** the file notes continuity also works through usability, so do not claim it as a psychological effect.
10. **#37 Information Scent** (TSM-P)
    - **Need:** Q2, M1.
    - **Where:** finding content and the report's navigation.
    - **Do:** card titles name the outcome ("Click IDs lost on redirect to Tabby"). Landing-page vs ad-promise checks.
    - **Guard:** labels must match their destinations.
11. **#44 Implementation Intentions** (TSM-R S16)
    - **Need:** M3.
    - **Where:** action plan.
    - **Do:** each card has an Owner (developer / GTM admin / store owner), a Fix, and a Done-when ("one Purchase per order in Test Events over 48h").
    - **Guard:** no forced scheduling or default reminders.
12. **#24 Progressive Disclosure** (TSM-P)
    - **Need:** M1, M4.
    - **Where:** card.
    - **Do:** collapsed, the card shows the verdict and the ad-effect line. Expanded, it shows the tag/trigger config, the payload and the repro steps.
    - **Guard:** the ad-effect caveat stays visible when collapsed.
13. **#49 Confirmation Bias** (CS)
    - **Need:** credibility of "ads or site".
    - **Where:** verdict and cards.
    - **Do:** if the site is clean, say so: "Site and tracking checks passed; look at targeting/creative." Do not always blame the site.
    - **Guard:** do not conceal disconfirming evidence.
14. **#62 Flexibility & Efficiency** (TSM-P)
    - **Need:** M1, time.
    - **Where:** navigation.
    - **Do:** jump links per section, a copy-link for each card, and a compact "evidence only" view for technicians.
    - **Guard:** more routes can confuse, so keep one standard reading path.
15. **#56 Visibility of System Status** (TSM-P)
    - **Need:** Q1, plus the re-scan loop.
    - **Where:** header and re-scan.
    - **Do:** "Scanned 20 Oct 2026; GTM container v42 read; GA4 last 30 days; checkout not observed." Next month: "Re-scan: Purchase now fires once (fixed)".
    - **Guard:** never report a fix as done before it is verified.

## Do not use / conflicts

- **#6 Scarcity**: fake countdowns, "only 3 audit slots left", reset timers. These break the no-fear/hype rule, and the file bans invented urgency and stock.
- **#8 Anchoring** (CS): invented "you could earn SAR X" or inflated agency-price anchors break the GA4-only money rule. The file says "never invent prior prices or inflate a reference".
- **#10 Decoy** (CS): a fake, unusable pricing plan to push the retainer. The file says "do not create unusable or fake plans".
- **#11 Compromise**: a "most popular" plan label with no data.
- **#17 Transaction Utility** (CS): "save 40%" against a fictional list price.
- **#14 Mental Accounting** (CS): showing a "per day" price that hides the real charge.
- **#16 Price-Quality** (CS): raising the price to signal quality. Unverified, and off-goal.
- **#15 Zero Price**: "free" with hidden strings (forced monthly emails, auto-paid tier) is banned. A truly free report is fine.
- **#2 Social Proof**: no "1,240 stores audited", fake logos, invented testimonials or activity counters. Use only real, permissioned, dated results, or nothing.
- **#46 Negativity Bias** (CS): red alarm blocks and "your store is bleeding money" break calm severity. Use it only as a reason to stay calm.
- **#47 Regret Aversion** (CS): "don't regret losing SAR X" is fear copy, and the file says "do not hide exclusions behind reassurance".
- **#50 Affect Heuristic** (CS): fear-based pressure is explicitly banned by the file and by our rules.
- **#39 Present Bias** (CS): exploitative "act now" urgency. Only a genuine quick-win fix is OK.
- **#43 Sunk Cost** (CS): "you've already started, don't waste it" guilt. The file calls this a bias "to protect customers from, not ... exploit".
- **#25 Default / #26 Status Quo** (CS): pre-checked WhatsApp or email consent, or auto-enrolment in the paid tier. The file says "no prechecked ... marketing consent".
- **#29 Von Restorff** (CS): conflicts with the no-neon rule if done as a glowing CTA. Allowed only as one restrained primary action, not colour-only.
- **#36 Figure-Ground** (CS): pop-up or modal overlays on top of findings are banned; they trap focus.
- **#63 Minimalism**: risky if "clean" means dropping sources, caveats or contact routes. The file forbids exactly that.
- **#18 Hick's Law** (CS): the file says it is not a formula for conversion. Do not cite it to justify cutting findings.
- **#19 Choice Overload** (TSM-R): the meta-analysis shows a near-zero average effect. Weak grounds for hiding findings; keep the full list reachable.
- **#4 Liking / #5 Unity**: no fabricated founder stories, and no "real Gulf merchants" identity cues that stereotype.
- **#13 Endowment / #42 IKEA**: weak fit. IKEA backfires when a fix cannot be completed, so do not list fixes the owner cannot actually do.
- **#48 Halo** (CS): polish must not imply certification. Our document design is fine; fake seals or "Google Partner" claims are not.
- **#53 Trust Transfer** (CS): platform or payment logos must not imply endorsement of the audit.
- **All CS entries (31 of 65)**: the file says do not label their evidence as established. Get a literature review before using them to justify high-impact automated recommendations.

## Experiment notes

1. Confirm the problem first: check funnel events, support themes and operational data. Rule out low traffic and stock issues, and test a competing explanation.
2. Fix eligibility before assignment. Randomise at the customer or stable anonymous ID, keep assignment sticky, and avoid cross-arm contamination. Re-scan cohorts must be qualified before assignment.
3. Pre-register one primary metric, the baseline, the smallest worthwhile effect, power, and the stopping rule. Fixed-horizon tests must not stop early on a dashboard peek.
4. Verify measurement: sample-ratio mismatch, bot/internal exclusion, event delivery. Analyse by intent to treat. COD: report confirmed and collected orders separately.
5. Report absolute and relative change, intervals and counts. Separate "inconclusive" from "no effect". A win does not prove the named mechanism. Segment findings are exploratory.
6. Shared guardrails for every test: purchase_rate, contribution per eligible customer, refunds, complaints, page performance, and accessibility task success. Set the thresholds before launch.
7. Common safeguards: genuine claims, accurate prices, voluntary choices, no fabricated reviews, urgency, endorsements or results.
8. The KB has no benchmarks, effect sizes or uplift %. Never generate them. Log principle IDs and kb_content_version 1.0.0 in each recommendation object.
9. For the report itself, outcomes such as the booking rate and re-scan return rate need their own event, numerator, denominator and window. The KB's metric registry is store-side only.
10. Repair broken or inaccessible things directly. Do not hold back an essential fix just to run a test.
