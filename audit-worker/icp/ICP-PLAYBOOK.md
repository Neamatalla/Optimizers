# ICP playbook: how the free audit serves each reader

How the four ICPs (ICP1–ICP4, the canonical cards in Downloads) should shape
the audit, pain by pain: what the report already does, what's missing, and
what to build next. Written 2026-10-15 from the ICP cards, the regal-honey
test runs, and outside research (sources at the end).

Status key: ✅ built and seen in a real run · 🟡 partly there · ❌ missing.

---

## 1. Principles that apply to every reader

These come from audit-reporting practice and consulting research, and they
decide *how* each pain gets answered.

1. **Layer the report.** Bottom line first, findings second, technical
   detail last. Executives won't open the appendix, and implementers need
   the exact settings. Mixed audiences: lead with business impact and keep a
   technical appendix. → We have this (first section → checks → Technical
   details toggle). Keep it.
2. **Every finding has the five audit parts.**
   - Condition: what we found.
   - Criteria: what good looks like.
   - Cause: why it happens.
   - Effect: what it costs.
   - Recommendation: what to do, aimed at the cause.

   Re-stating the condition as the cause is the classic weak finding. →
   🟡 We write condition (technical), effect (business) and recommendation
   (action). **Criteria is missing on screen.** Each checklist point has an
   "expected state", but the report never shows it. Cause is in the text
   only sometimes.
3. **Recommendations get done when they're specific, owned and followed
   up.** Roughly half of consulting recommendations are never implemented.
   The usual reasons: no owner, effort underestimated, nobody follows up. →
   ✅ owner + step + "done when" on every failed point. ❌ follow-up after
   delivery.
4. **Executives give a finding about 10 seconds.** The pattern is the
   business question, then the number, then the recommendation; the metric
   is evidence, not the headline. → 🟡 manager summary has numbers and
   priorities, but no headline sentence in that pattern.
5. **State how you prioritized.** ICE, PIE, PXL and RICE rank the same
   backlog differently, so agencies are told to name their method. → ❌ We
   rank by severity and money but never say so.
6. **A free audit sells when the follow-up cites the prospect's own
   findings.** Open the call with their biggest gap. → 🟡 client email
   lists the top 3 actions. ❌ The internal review email gives our team no
   talk track per reader.
7. **One wrong number discredits the whole report** (said in ICP1, ICP3 and
   ICP4). → ✅ money is one range with its source, capped at 10% of monthly
   revenue, never summed. ✅ every finding shows where its data came from.

---

## 2. How the ICPs are used in the tool (the six layers)

| Layer | What the role changes | Status |
|---|---|---|
| **Intake** | "Your role" on the form | ✅ one question. ❌ no follow-up question per role (see §7) |
| **Generation** | Reader brief in the audit prompt (`icp/*.md`), role-only voice rules, conversion-review voice, Arabic register | ✅ |
| **Priority** | Severity per reader (`roleSeverity`), ROAS/CAC direction per point (`ad-impact.ts`) | ✅ |
| **Presentation** | First section, highlighted numbers, chips, copy, call to action | ✅ |
| **Delivery** | Client email subject, intro, top 3 actions, closing | ✅ |
| **Sales follow-up** | What our team says on the call | ❌ |

The rule that keeps this maintainable: **the 50 points, their pass/fail and
the numbers never change by role.** Only voice, order, emphasis, framing
and follow-up change. One checklist, four views.

---

## 3. ICP1 — Store owner ("Fix it myself")

**Job:** "Tell me what's costing me sales and let me fix it myself."

| Pain or need (card) | What the report does | Status | Next |
|---|---|---|---|
| Doesn't know what's wrong or what it costs | Money hero, "What's costing you sales", top 3 by money | ✅ | — |
| Money must be believable and sourced | One range, source line, "an estimate, not a promise"; cap lowered | ✅ | Add a one-line "how we estimated this" under the hero |
| No help between seeing and applying the fix | Step with platform path ("Zid product editor", "Zid shipping settings"); paste-ready Arabic copy in the conversion review | 🟡 | Developer-only steps show raw GTM wording to the owner. Write those as "Send this to your developer:" plus the step |
| Fast wins, effort labels | "You can do this" / "Needs a developer" tags; "you can fix 7 yourself" | ✅ | — |
| Top fixes repeat themselves | Regal: #1 and #3 both said "3 in 100 add to cart" | ❌ | When GA4-01's worst step *is* product → cart, drop GA4-02 from the top 3 |
| Arabic-first, phone-first | Gulf register, Western digits; the report opens in Arabic for every reader | ✅ | Check the first section at 375px |
| GCC payment and COD leak | Free-delivery threshold, Tabby/Tamara credit, payment methods in the cart (conversion review) | 🟡 | No COD point in the 50 checks (by design, points don't change). Make the owner brief highlight COD, mada and Apple Pay wherever the conversion review sees them |
| Nothing brings them back | One free audit per site; email only | ❌ | A "check again" email 14 days later, with the 3 fixes and their "done when". WhatsApp is the owner's channel, not email |
| Afraid of a wrong finding | Data source label on each point | ✅ | — |

**Success for this reader:** they fix at least one top-3 item. Measure it
with the follow-up (§7).

---

## 4. ICP2 — Media buyer ("Prove it's not my ads")

**Job:** "Tell me if it's the ads or the site, and give me proof the owner
will accept."

| Pain or need (card) | What the report does | Status | Next |
|---|---|---|---|
| Ads or site? | Two lists (tracking / post-click), reported-ROAS verdict, ROAS line with the store's conversion rate | ✅ | — |
| Ad numbers don't match the store | Dedupe, purchase value, gateway credit, key-event checks; verdict counts over- vs under-counting | ✅ | We can't see ad-platform or store order counts. An optional "orders last 28 days" field would allow a GA4 vs store reconciliation, the #1 pain (~75 posts) |
| Speaks their language; ROAS/CAC direction | Buyer terms; a direction chip on every failed point; direction sentence added when the text lacks it | ✅ | — |
| Proof the owner will accept | Each point names who fixes it; "forward it as proof" | 🟡 | **The buyer forwards a report written in buyer language.** Add a short "For the store owner" summary block in owner words inside the buyer report (3 fixes, money, who does it) |
| ROAS looks good, business loses money | — | ❌ | **Break-even ROAS / delivered-CPA calculator** (most-requested sheet, 10+ asks). Inputs: margin %, COD confirmation and delivery rates. Output: break-even ROAS and how far the store's numbers sit from it. Runs in the page; no ad spend needed |
| Full funnel, not one step | Tiles: conversion rate, AOV, weakest step | 🟡 | A funnel strip, view_item → add_to_cart → begin_checkout → purchase, with each step against its benchmark (the data is already in GA4 facts) |
| Benchmarks | Step benchmarks only | 🟡 | Keep "benchmark" labelled as ours. Never present a niche benchmark we don't have |
| COD confirmation / delivery | — | ❌ | Covered by the calculator's delivery-rate input |
| Site wording that gets ads rejected | — | ❌ | Out of the 50 points. Could become a later conversion-review rule |

**Success:** the buyer forwards the report or books the "site side" call.

---

## 5. ICP3 — Marketing director / manager ("Show my CEO and team what to fix first")

**Job:** "Present a credible, data-driven audit so we prioritize the fixes
that boost sales."

| Pain or need (card) | What the report does | Status | Next |
|---|---|---|---|
| Credible outside view for the CEO | Executive summary: tiles, top 3 priorities, who owns what | ✅ | Add a **headline sentence in the CEO pattern**: business question → number → recommendation, e.g. "Product pages lose most buyers: 3 in 100 add to cart against 8; fixing the top 3 pages is worth an estimated SAR 241K–482K a month." |
| Hand the work to the team | "Who owns what": fixes per team with the first item | ✅ | A copyable or printable list per team |
| Defend every number | Data source per finding, estimate labels | ✅ | Show **criteria** ("what good looks like") per finding, from the checklist |
| KPIs: conversion by source, mobile vs desktop, ROAS/CAC, payments, compliance | Conversion rate, revenue, AOV tiles; direction chips; consent raised in severity | 🟡 | A mobile vs desktop tile (GA4-05 already computes it; store the two rates in GA4 facts). A channel table when sales by channel can be read |
| Bilingual team | Toggle; professional MSA | ✅ | — |
| Leadership one-pager | — | ❌ | Print stylesheet so the executive summary prints as one page (browser "Save as PDF") |

**Success:** the report goes to the CEO, or the team works through "who
owns what".

---

## 6. ICP4 — Agency / consultant ("A deliverable for my client")

**Job:** "A deliverable I can put in front of a merchant without burning my
credibility, that justifies an engagement."

| Pain or need (card) | What the report does | Status | Next |
|---|---|---|---|
| Client-safe, neutral | "The store", no selling inside findings; neutral call to action | ✅ | — |
| Defend every number | Data source per finding; "Findings from live account data: 48 / 50" tile | ✅ | Add **criteria** per finding (same as ICP3) and a short method note: how checks were run, how money was estimated (10–25% of the gap, capped at 10% of revenue) |
| Scope they can sell | Workstreams (tracking / conversion / tech) with counts and top 3 | ✅ | State how items are ranked (severity, then money, then effort), per §1.5 |
| White-label | Optimizers branding throughout | ❌ | Bigger build (agency name/logo, no Optimizers call to action). Do it only if agencies become a real channel |
| Show progress over time | One audit per site | ❌ | Same root as ICP1's re-check. Not for the free audit |
| "If the audit finds nothing, I won't take the client" | Tiles show checks passed and the biggest leak | 🟡 | One "engagement potential" line: failed checks by workstream plus money at stake |

**Success:** the agency forwards the report to a client or asks about
running more audits.

---

## 7. Cross-reader gaps worth building first

Ranked by how many readers they help and how cheap they are.

| # | Build | Helps | Size |
|---|---|---|---|
| 1 | **Criteria line** ("What good looks like") on each finding, from `expectedState` | ICP3, ICP4, ICP2 | Small (render only) |
| 2 | **Owner summary block inside the buyer report**, and "Send this to your developer" framing for dev steps in the owner report | ICP2, ICP1 | Small |
| 3 | **Dedupe the top 3** (GA4-01 vs GA4-02, GA4-02 vs GA4-10) | ICP1, ICP3 | Small |
| 4 | ~~Open in Arabic~~ already the default (corrected 2026-10-15) | ICP1 | — |
| 5 | **Funnel strip** with each step against its benchmark | ICP2, ICP3 | Small (data exists) |
| 6 | **Break-even ROAS / delivered-CPA calculator** | ICP2 (top ask), ICP3 | Medium (in-page, no data stored) |
| 7 | **CEO headline sentence** + one-page print | ICP3 | Small–medium |
| 8 | **Sales talk track per reader** in the internal review email: what to open the call with, which pain to press, which offer fits (buyer → you keep the account; agency → partner) | Our team, all readers | Small |
| 9 | **Method note** (how checks ran, how money was estimated, how items are ranked) | ICP4, ICP3 | Small |
| 10 | **14-day re-check email** citing the 3 fixes and their "done when" | ICP1, ICP2 | Medium (scheduled send) |
| 11 | Optional **second intake question** per role (buyer: "orders last 28 days?" for reconciliation; owner: "share of COD orders?") | ICP2, ICP1 | Medium |
| — | White-label, re-scan history, team seats | ICP4, ICP3 | Large; wait for real demand |

---

## 7b. Built on 2026-10-15

- **"What you asked, answered"** (`src/reader-questions.ts`): each role's questions from its ICP card, answered from the store's findings, linked; the same questions go into the audit prompt so findings are written as answers.
- **What good looks like** on every finding (criteria), translated.
- **Send this to the store owner** block in the buyer report; **Send this to your developer** on developer steps in the owner report.
- **Top 3 without repeats** (GA4-01 vs its own step point).
- **Funnel strip** with each step against its benchmark (buyer, manager).
- **Method note** in the agency summary.
- **Talk track per role** in the internal review email.

## 8. Checking each run against its reader

Per role, the scorecard used on the regal-honey runs. Run it after every
role audit; worth automating as a check script later.

- **Media buyer:**
  - every failed point answers "is the number real?" or "does paid traffic convert?"
  - direction stated, no invented ROAS/CAC values
  - their terms used
  - the campaign decision named
  - who has to fix it
  - how to check it themselves
  - leaks no checklist would catch
  - Egyptian Arabic with metric names in Latin script
- **Store owner:**
  - money first, sourced
  - plain words
  - where to fix it on their platform
  - do-it-yourself vs developer
  - GCC payments, delivery and WhatsApp
  - no hype
  - Gulf Arabic
  - top 3 not repeating
- **Manager:**
  - priority and payoff
  - the team that owns each fix
  - every number sourced
  - their KPIs
  - a CEO-readable headline
  - professional Arabic
- **Agency:**
  - neutral and client-safe
  - evidence per finding
  - each fix scoped as a task
  - workstreams
  - directions they can defend
  - no Optimizers selling inside findings

---

## Sources

- [MIT: Writing reports (layering for audiences)](https://live.ocw.mit.edu/courses/15-279-management-communication-for-undergraduates-fall-2012/f9832deb801447ad8638a5291c355bbf_MIT15_279F12_wrtngReports.pdf)
- [Hack The Box: security reports for techies and execs](https://hackthebox.com/blog/security-report-writing)
- [Zemith: technical reports that drive action](https://www.zemith.com/uk/blogs/how-to-write-technical-reports)
- [InfosecTrain: audit reporting techniques](https://www.infosectrain.com/blog/understanding-audit-reporting-and-communication-techniques)
- [IIA Internal Auditor: the five attributes approach](https://internalauditor.theiia.org/en/articles/2023/february/the-five-attributes-approach/)
- [IIA Internal Auditor: your work isn't done yet](https://internalauditor.theiia.org/en/voices/20192/your-work-isnt-done-yet/)
- [CIA prep: core elements of a finding](https://open-exam-prep.com/study-guides/cia-part3/findings-root-cause-recommendations/core-elements-finding-ccce)
- [Switas: ranking a CRO backlog when ICE, PIE, PXL and RICE disagree](https://www.switas.com/articles/cro-backlog-prioritization-ice-pie-pxl-rice)
- [Mida: test prioritization frameworks](https://mida.so/blog/test-prioritization-frameworks-ice-pie-pxl)
- [Growth Method: PIE framework](https://growthmethod.com/pie-framework/)
- [MarTech: marketing ROI the C-suite trusts](https://martech.org/how-to-demonstrate-marketing-roi-in-a-way-the-c-suite-trusts/)
- [Kamyar Shah: reporting marketing results to executives](https://kamyarshah.com/reporting-marketing-results-to-executives/)
- [Forrester: marketers operationally proficient but strategically stalled](https://www.forrester.com/press-newsroom/marketers-are-operationally-proficient-but-strategically-stalled)
- [Admiral Media: blended ROAS and MER](https://admiral.media/blended-roas-mer-mobile-apps/)
- [Echai: reading Meta metrics](https://echai.ventures/d2c/d2c-meta-ads-fundamentals/reading-the-metrics)
- [Think Insights: why clients don't implement recommendations](https://thinkinsights.net/consulting/why-clients-dont-implement-consulting-recommendations)
- [Seer Interactive: closing the implementation gap](https://www.seerinteractive.com/insights/turning-recommendations-into-results-closing-the-implementation-gap)
- [Consultant's Mind: why clients don't implement](https://www.consultantsmind.com/2023/01/15/why-clients-dont-implement/)
- [Insites: free audits as agency lead generation](https://insites.com/blog/how-agencies-use-a-free-white-label-seo-audit-tool-to-generate-leads-on-autopilot/)
- [The White Label Agency: white-label reporting](https://thewhitelabelagency.com/white-label-reporting/)
- [Meticulosity: quantified findings in audits](https://www.meticulosity.com/blog/boost-client-performance-with-expert-hubspot-portal-audits)

*Most outside sources are practitioner or vendor content; treat their
numbers as directional. The ICP cards' own evidence levels apply: ICP2 is
strongly evidenced; ICP1, ICP3 and ICP4 are mostly hypotheses to validate.*
