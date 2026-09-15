import { countedCategories } from "./scoring.js";
import { extractJsonPayload, runClaudeHeadless } from "./claude.js";
import { GA4_CHECKLIST, GTM_CHECKLIST, WEBSITE_CHECKLIST, WEBSITE_CODE_CHECKLIST, type ChecklistPoint } from "./checklist.js";
import type { CategoryResult, CategoryFinding, ToolId, CategoryKey } from "./types.js";
import type { CrawlFindings } from "./crawl.js";

import { neededMcpServers } from "./mcp-config.js";

export interface AuditPromptInput {
  website: string;
  tools: ToolId[];
  // Every page the deterministic discovery pass (discover-pages.ts) found,
  // homepage included/first — not just the one URL the visitor typed in.
  // The browser checks that need a specific page type (WEB-54/55/56:
  // cart/checkout, a product page) pick from this list instead of guessing
  // at URLs. Carried a full PageSpeed sweep result per page until
  // 2026-09-09; now just the URLs.
  discoveredPages: string[];
  crawl: CrawlFindings;
  mcpConfigPath: string;
  businessName: string | null;
  // Visitor-typed IDs — merged with crawl.ids as additional exact-match
  // candidates, never a shortcut around the exact-match requirement. Typing
  // an ID grants no new access: if the service account can't see a matching
  // property/container, it still falls back to detection-only.
  userProvidedGa4Id: string | null;
  userProvidedGtmId: string | null;
  // Pre-fetched by api/oauth/google/callback.js during the OAuth popup flow.
  // Already scoped to exactly what the visitor's own Google login consented
  // to — no shared-identity cross-contamination is possible, so this skips
  // the exact-ID-match requirement entirely and is used directly as live
  // data. null when the visitor used the manual invite-flow instead.
  ga4OAuthData: unknown;
  gtmOAuthData: unknown;
}

function dedupeUpper(ids: (string | null | undefined)[]): string[] {
  return Array.from(new Set(ids.filter((id): id is string => Boolean(id)).map(id => id.trim().toUpperCase())));
}

function buildAllowedTools(input: AuditPromptInput): string[] {
  // Claude Code grants all of an MCP server's tools when the server name
  // itself is allowlisted. Verify against `claude --help` / current docs if
  // this stops working after a CLI upgrade — the flag's exact matching
  // semantics aren't pinned to a specific version here.
  //
  // Sourced from the same neededMcpServers() the MCP config itself is built
  // from (mcp-config.ts) — a run only gets allowlisted for a server the
  // config file actually includes, never more.
  const needed = neededMcpServers({ tools: input.tools, ga4OAuthData: input.ga4OAuthData, gtmOAuthData: input.gtmOAuthData });
  const allowed: string[] = [];
  if (needed.ga4Admin) allowed.push("mcp__ga4-admin");
  if (needed.gtm) allowed.push("mcp__google-tag-manager-mcp-server");
  if (needed.browser) allowed.push("mcp__chrome-devtools");
  return allowed;
}

/**
 * "Website" isn't a single fixed list any more — it's the full 50-item
 * WEBSITE_CHECKLIST on the "visitor has neither GA4 nor GTM" route, but the
 * 25-item curated WEBSITE_CODE_CHECKLIST on the "visitor has exactly one of
 * GA4/GTM" route (see scoring.ts's countedCategories and checklist.ts's own
 * doc comment for why). GA4/GTM are each always the one fixed
 * list regardless of route. "Website" is never included at all on the
 * "visitor has both" route, so `tools.length` here is always 0 or 1
 * whenever this is asked for "Website".
 */
function checklistFor(category: CategoryKey, tools: ToolId[]): ChecklistPoint[] {
  if (category === "GA4") return GA4_CHECKLIST;
  if (category === "GTM") return GTM_CHECKLIST;

  return tools.length === 0 ? WEBSITE_CHECKLIST : WEBSITE_CODE_CHECKLIST;
}

function formatChecklist(category: CategoryKey, tools: ToolId[]): string {
  const points = checklistFor(category, tools);
  if (points.length === 0) return "";
  return points
    .map(p => `  - [${p.id}, ${p.severity}] ${p.title}\n    Expected: ${p.expectedState}\n    Common failure: ${p.commonFailure}\n    How to check it: ${p.validate}`)
    .join("\n");
}

function buildPrompt(input: AuditPromptInput): string {
  const categories = countedCategories(input.tools);
  const ga4Candidates = dedupeUpper([...input.crawl.ids.ga4MeasurementIds, input.userProvidedGa4Id]);
  const gtmCandidates = dedupeUpper([...input.crawl.ids.gtmContainerIds, input.userProvidedGtmId]);


  const checklistBlocks = categories
    .map(c => `### ${c} checklist (evaluate every point below; report a finding only for points that are NOT clean)\n${formatChecklist(c, input.tools)}`)
    .join("\n\n");

  return `You are auditing a website for Optimizers, a CRO/analytics agency. Write
findings as BUSINESS INSIGHTS for a non-technical business owner — for every
finding, state what the problem is, which tool/area it's in, and how it
concretely hurts the business (lost revenue, blind spots in decision-making,
wasted ad spend, compliance/legal exposure, etc). Never just describe a
metric or a technical config state — always connect it to business impact,
in plain language a business owner (not an analyst) would understand.
${input.businessName ? `Address the report to "${input.businessName}" by name where natural — this is purely for tone/personalization, never a signal for picking which GA4 property or GTM container to query (see below, exact ID match only).` : ""}

Website: ${input.website}

Tools the visitor says they have: ${input.tools.length ? input.tools.join(", ") : "none"}

Public crawl signal (script presence, not live account data):
${JSON.stringify(input.crawl.detected, null, 2)}

Response headers from that same crawl fetch (only headers actually present are
included — an absent key means the header genuinely wasn't sent, not that it
wasn't checked):
${JSON.stringify(input.crawl.headers, null, 2)}

Structural signals computed from that same crawl's raw page source (a single
static HTML string, no JS execution — each is a real, deterministic
computation, not a guess, but a null value means the underlying pattern
genuinely wasn't found, not that it failed; looksLikeSpaShell/cmsPlatformGuess
are explicitly best-effort heuristics, treat them as a signal to reason about,
not a certainty):
${JSON.stringify(input.crawl.structuralSignals, null, 2)}

Pages discovered on this site (homepage first, then one representative page
per commerce-relevant type — product, collection, cart, blog — taken from the
site's own sitemap.xml or, absent one, its homepage links). Deterministically
computed in code, not guessed: these are real URLs that exist. Use them for
any check that needs a specific page type rather than inventing a URL:
${JSON.stringify(input.discoveredPages, null, 2)}

## Checklists

Each included category below has a fixed, curated set of checks — drawn from
Optimizers' own internal audit methodology (a 203-point framework built from
real production audits), not generic advice. Each point includes its own "How
to check it" line — that's the real validation step from the full methodology,
but it sometimes names a system this run genuinely does not have access to
(BigQuery, an ad platform's own Events Manager/dedupe tab, Screaming Frog or
another third-party site crawler, GTM's own Preview/DebugView web UI, a
finance/ERP system). This run's actual access is: GA4 Admin/Data API and/or
GTM API (live, when granted this run — see the data-source sections below), a
JS-free static crawl of the page source, the discovered-pages list above,
and — only when noted in a section below — a real headless browser. There is
no PageSpeed Insights / Lighthouse data in this run at all: anything that
sounds like a Lighthouse audit id is measured in the browser instead.

One exception to "fixed, curated": GA4-D1 through GA4-D15, if GA4 is
included this run, are deliberately open analysis slots rather than
individually pre-written checks — their "How to check it" line below just
points to the "GA4 deep-analysis slots" section further down, which has
their real instructions.

Work through EVERY point in EVERY included category's list and give EVERY
single one of them a real result — this run must always account for exactly
50 checks total, no exceptions, no gaps. There is no "skip" or "not
evaluable" option any more: if a point's primary "How to check it" step needs
something this run genuinely doesn't have access to, don't leave it
unaccounted for — fall back to whatever signal you DO have (the public crawl
signal, the browser, general best-practice reasoning for a business like
this one) to reach a real pass/fail conclusion anyway, exactly the same
fallback discipline already described for GA4/GTM exact-match misses below,
just applied to every point, not only the account-access ones. Mark the
resulting finding's dataSource "detection" or "public" instead of "live" when
you had to fall back like this — the READER should be able to tell the
evidence tier, but the point itself still gets a real, counted answer.
Every single point gets EXACTLY ONE finding in that category's "findings"
array — there is no implicit pass any more. A clean result still needs a
real, written finding, the same way a broken one does. And every finding,
pass or fail, is written TWICE — once for the engineer who would fix it,
once for the person deciding whether it's worth fixing:

  "technical": { "summary": ..., "detail": ... }
  "business":  { "summary": ..., "detail": ... }

These are the SAME fact at two altitudes, not a long version and a short
version. The reader toggles between them in the report, so each one has to
stand completely on its own — never write a business line that only makes
sense if you've already read the technical one, and never write "see above".

TECHNICAL voice — for someone who will open the account and fix it:
- State the literal state you found, with the real values that prove it:
  property/stream/tag/variable/trigger names, metric numbers, config flags,
  header values, event names, IDs. Jargon is correct here; precision beats
  readability.
- "detail" adds the mechanism — why the configuration produces this result,
  or what exactly the data shows.

BUSINESS voice — for an owner or a marketing lead with no analytics
background:
- "summary": the same finding with the jargon removed. Not "sessionDefault
  ChannelGroup is 38% Unassigned" but "for about 4 in 10 visits, nothing
  records where the visitor came from."
- "detail": the CONSEQUENCE — what this costs, distorts, or protects. Which
  decision gets made on wrong numbers, which spend can't be judged, which
  revenue is at risk, who feels it, and when they'd notice. Reach for the
  concrete: name the date, the page, the channel, the amount when you have
  it.
- Worked example of the register, for a real traffic spike found in the
  data: business summary = "Visits jumped sharply on 14 August and nothing
  in the setup flags it." business detail = "Nobody is told when traffic
  moves like this, so a spike this size gets noticed weeks later, if at all
  — and by then whatever caused it (a campaign, a press mention, a bot) is
  cold. The 14 August jump goes unexplained until somebody digs through the
  data by hand, which usually means it never gets explained at all, and the
  thing that worked never gets repeated."
- Never restate severity as the impact ("this is critical") — say what
  actually happens. Never moralize or sell; describe the consequence and
  stop. No "we recommend engaging our team".

1. It's clean → "status": "pass". The technical voice states what you
   actually checked and the real result (e.g. "Property timezone is
   Asia/Dubai, currency AED — matches the business's real UAE market", or
   "Realtime activeUsers returned 14, plausible for a live site"). The
   business voice says, in plain words, what's working and what that
   protects — a pass is not "no issue found", it's "this part is load-
   bearing and it's holding". Never a generic restatement of the checklist
   point's own title, never "N/A".
2. It's NOT in the expected state → "status": "fail". Same two voices: what
   is wrong with real evidence, and what it costs.

In both cases: "checklistId" is that point's EXACT id from the list below
(e.g. "GA4-15", "WEB-23") — never invent an id that isn't in the checklist,
never cite the same id twice, and never split one point across multiple
findings. Every checklistId you cite must come verbatim from the checklists
below.

You do NOT assign or return a numeric score anywhere in your response — the
report's checks-passed count is computed deterministically outside this
response, directly from each finding's own "status" field — every one of the
50 checklist ids across this run's included categories counts toward that
tally, always.

${checklistBlocks}

${input.tools.length === 1 ? `## Why a website-code audit runs alongside ${input.tools[0]} this time
The visitor only has ${input.tools[0]}, not both GA4 and GTM. The other tool is NOT evaluated this run at all — don't try to check it, don't guess about it from the crawl signal, it's simply not part of this audit. Instead, its 25 points are replaced by a real, fully-evaluable website-code audit: the ${WEBSITE_CODE_CHECKLIST.length}-item "Website" checklist below (a curated slice, not the full Website checklist) — ${input.tools[0]} (25) + Website (${WEBSITE_CODE_CHECKLIST.length}) = 50 total. This is deliberate: a real check of the site's own code (image weight, dataLayer/ecommerce implementation, duplicate tag/event firing, consent mode, network anomalies, console errors, resource weight) is more useful to the business than a weak "probably not configured" guess about a tracking tool they don't even use.

` : ""}${input.tools.length < 2 ? `## Live browser inspection (chrome-devtools MCP)
${input.tools.length === 0 ? "The visitor has none of GA4/GTM, so there's no live account data to audit — this run instead has" : `The visitor's Website checklist above (the ${WEBSITE_CODE_CHECKLIST.length}-item curated slice) needs real runtime behavior to evaluate, so this run also has`}
a real headless Chrome browser via the
mcp__chrome-devtools tools, which backs a large share of the Website
checklist above (every point whose "How to check it" line says "only
evaluable when browser access is granted"). Work through these in order —
each maps to specific checklist points, cited so you don't have to
re-derive which finding ID a given observation belongs to. Only cite an id
that's actually present in the Website checklist above this run — some
steps below reference ids that only exist in the FULL 50-item checklist and
won't be present when this run is on the 25-item curated slice instead; skip
citing those, the general observation just isn't a scored point this run:

1. Open a new page and navigate to ${input.website}. Wait for it to finish loading, then stay idle a few seconds before reading console/network state — some errors and duplicate fires only show up after initial load settles.
2. Console messages: distinct JS errors (WEB-15), unhandled promise rejections (WEB-18), any error repeating many times in the observation window (WEB-21), and mixed-content warnings (WEB-22).
3. Network requests during that same load+idle window: tracking-looking requests actually firing vs. just being present in source (WEB-16), any firing more than once for one logical event (WEB-17), first-party 404s on JS/CSS/image/font assets (WEB-23), non-GA4/GTM trackers firing (Meta/TikTok/Snapchat Pixel, Hotjar, Clarity — WEB-24), any request past ~3s in the critical path (WEB-26), blocked/insecure mixed-content requests specifically at the network level (WEB-27), and any .js.map file requested (WEB-30).
4. Navigate directly to a couple of common leak paths — ${new URL(input.website).origin}/.env and ${new URL(input.website).origin}/.git/config — and confirm each is a real 404, not a 200 (WEB-31). Also navigate to ${new URL(input.website).origin}/robots.txt to read its actual content directly (WEB-38).
5. If a cookie/consent banner is visible, compare network requests before vs. after accepting or declining it — does the visitor's choice actually change what fires (WEB-50)? Also check Application/cookies for Secure/HttpOnly/SameSite flags on first-party cookies (WEB-34).
6. Ecommerce dataLayer (WEB-57/58/59): trigger the real journey — view a product, add to cart, begin checkout if reachable — and read window.dataLayer directly. Are the standard event names present at all (WEB-57)? Does each event's ecommerce.items carry item_id/item_name/price/quantity, with currency/value at the event root (WEB-58)? Push two different ecommerce events in sequence and confirm the second's items array doesn't still contain the first's (WEB-59) — this works whether or not GA4/GTM ever actually consumes these events, since it's about what the site itself pushes.
7. If the discovered-pages list above includes a cart/checkout-looking URL, navigate there specifically and repeat the console-error check (WEB-54), and inspect the DOM for the primary Add-to-Cart/checkout CTA — present, visible, not disabled (WEB-56). If it includes a product URL, read that page's schema.org Product/Offer markup for price + availability (WEB-55).
8. Resource weight and delivery (WEB-60 through WEB-63), all from that same load's network list plus the DOM: render-blocking scripts/stylesheets resolving before first paint (WEB-60), any image response over ~200KB and any image whose naturalWidth/naturalHeight far exceeds its rendered clientWidth/clientHeight (WEB-61), missing gzip/brotli content-encoding on the document and the largest CSS/JS responses (WEB-62), and the summed transfer size of all script+stylesheet responses on first load, naming the largest individual offenders (WEB-63). Cite real byte numbers and real URLs, not estimates — these four replaced a PageSpeed-Insights-backed category precisely so the numbers come from a real load.
9. Core Web Vitals and mobile layout, on the same page: measure LCP and CLS in-page via a PerformanceObserver on the "largest-contentful-paint" and "layout-shift" entry types, and read PerformanceNavigationTiming for domContentLoaded/load, comparing against when the tracking requests resolved (WEB-8, WEB-13). Then emulate a ~390x844 mobile viewport and check document.scrollWidth against the viewport width for horizontal overflow, plus the primary CTA's rendered box size (WEB-14).
10. This browser is your only source of real runtime behavior this run — the static crawl signal above is HTML-only, and there is no PageSpeed/Lighthouse data at all any more. Every finding based on what you directly observed in the browser gets dataSource "live"; anything inferred from the static crawl instead stays "detection".
11. If the browser tools error out or a page fails to load, don't fail the whole audit — note it as a low-severity WEB finding ("couldn't run a live browser check this time") and continue with the static crawl signal alone for whatever that leaves uncovered.

` : ""}${categories.includes("GA4") ? `## GA4 data source
${input.ga4OAuthData
  ? `Pre-fetched via the visitor's own Google OAuth consent — already scoped to exactly their account, so this is authoritative and needs no ID-matching or MCP tool calls. Evaluate the GA4 checklist against it directly and mark every resulting finding dataSource "live":\n${JSON.stringify(input.ga4OAuthData, null, 2)}`
  : `No OAuth data for GA4 — fall back to the shared-service-account MCP tool (mcp__ga4-admin). That account is used by many different client businesses over time, so identification must be by EXACT ID MATCH ONLY, never by business name or any fuzzy signal. Candidate measurement IDs (crawled and/or visitor-typed, either source equally valid as a match key but never as proof of ownership on its own): ${JSON.stringify(ga4Candidates)}.

${ga4Candidates.length > 0
    ? `List accessible properties, find each one's web data stream(s), and ONLY use a property whose stream's measurementId is an EXACT string match to one of those IDs.`
    : `The candidate list is empty (GA4 often loads dynamically via GTM rather than a literal gtag.js snippet on the page). Try the cheap path first, before any property enumeration: if a GTM container matched below, inspect ITS tags for a GA4 Configuration tag's measurementId — that's just a second source for a candidate, still exact-match only, not a new matching rule. Do NOT list/enumerate every accessible property while the candidate list is empty — there is nothing for a full listing to match against, so it only burns time and turns for a guaranteed-empty result.`}

If nothing ever matches (empty candidate list with no GTM-tag hit either, or a non-empty list where no property's stream matches any candidate), there is no live GA4 property this run: evaluate GA4-1..GA4-13 against the crawl signal + general best practice and mark dataSource "detection" — and just as importantly, do NOT attempt any GA4-D1..D15 real data pull either (no run_report/run_realtime_report/admin_request calls). Write all 15 GA4-D slots the same way, from the crawl signal + general best-practice reasoning for a business like this one, dataSource "detection". This isn't a shortcut around "GA4-D MUST come from real data" below — it's the same "no property, no data pull, use whatever signal you DO have" fallback already established for every point in this audit, spelled out here explicitly because these 15 slots are the ones most likely to otherwise burn most of this run's time budget attempting real API calls against a property that was never matched. An exact match is the only condition under which you may mark dataSource "live".`}

## GA4 deep-analysis slots (GA4-D1 through GA4-D15)
GA4-1 through GA4-13 above (minus the ones GA4-D covers) are fixed
CONFIGURATION checks — property settings, data stream setup, industry
category, service level, retention, Google Ads link presence, key-event
counting method, and similar Admin API metadata. GA4-D1 through GA4-D15 are
NOT a second round of that — every one of these 15 MUST come from actually
pulling and reasoning about real DATA via the GA4 Data API (run_report /
run_realtime_report), or a real activity log (change-history / access
report), never from Admin API config/settings fields alone. A finding whose
only evidence is a config value (property display name, industry category,
service level, timezone, currency, data-stream URL, a Google Ads link's
creator email/personalization flag, key-event counting method, property
type, retention window, etc.) does NOT belong in a GA4-D slot — that's
GA4-1..13's job, and repeating it here doesn't count as one of the 15.

Each slot below names the specific real-data pull that's REQUIRED for it —
what you conclude from that data (is it fine, is it a problem, how severe)
is entirely your own judgment, not a fixed pass/fail bar; that's what makes
these "open" rather than individually pre-written checks like GA4-1..13.

- GA4-D1: run_realtime_report (metrics=[activeUsers]) — is the real number
  plausible for a site that's live right now?
- GA4-D2: run_report, last 28 days, dimensions=[eventName]
  metrics=[eventCount] — sum the real totals; is historical volume healthy
  or near-dead?
- GA4-D3: run_report TWICE — dateRanges [7daysAgo,today] and
  [14daysAgo,8daysAgo], metrics=[sessions,eventCount] — compare the two real
  totals for an unexplained cliff or spike.
- GA4-D4: run_report, last 28 days, dimensions=[sessionDefaultChannelGroup]
  metrics=[sessions] — what real share is Unassigned?
- GA4-D5: run_report, last 28 days, real sessions vs. real key-event
  completions — is the actual conversion rate plausible for this business?
- GA4-D6: run_report, last 28 days, metrics=[eventCount,purchaseRevenue,
  transactions] on the purchase key event — do real purchase counts and real
  revenue/transactions actually move together?
- GA4-D7: run_report, last 28 days, dimensions=[landingPage]
  metrics=[sessions,conversions], ordered by sessions — any real
  high-traffic page with real zero conversions?
- GA4-D8: run_report, last 28 days, dimensions=[country] AND separately
  dimensions=[deviceCategory], metrics=[sessions] — does the real
  distribution look like genuine traffic or a bot/invalid-traffic pattern?
- GA4-D9: run_report, last 28 days, metrics=[sessions,engagedSessions,
  averageSessionDuration] — does real engagement look human?
- GA4-D10: run_report, last 28 days, a new-vs-returning-user dimension with
  metrics=[sessions,conversions] — real behavior/conversion difference
  between the two?
- GA4-D11: run_report, last 28 days, sessions+conversions split
  paid-vs-organic channels — real conversion-rate gap between them (ad-spend
  efficiency signal)?
- GA4-D12: list_data_streams, cross-checked against the crawl's real
  detected measurement ID(s) (crawl.ids.ga4MeasurementIds) — does the
  connected property actually match what's live on the site right now?
- GA4-D13: admin_request POST :searchChangeHistoryEvents (v1alpha), a
  recent real date range — any high-risk change actually in the real log?
- GA4-D14: run_access_report, a recent real date range — anyone
  unexpected actually shown querying report data?
- GA4-D15: OPEN — one more real, data-driven insight of your own choosing
  from anything you pulled above or a related run_report call not listed —
  state exactly which real data call backed it. Still no config/settings-only
  findings here either.

Map insights to these exact slot numbers, in this exact order — never skip
one, never split one insight across two slots, never duplicate something
already covered by a GA4-1..GA4-13 finding or by another GA4-D slot. Every
slot still needs a real "status": "pass" finding when its data comes back
clean (see "no implicit pass" above) — ground it in the actual real numbers
you pulled for that slot (e.g. "GA4-D9: real engagedSessions/sessions ratio
is 0.71 with avg duration 94s — looks human, no bot signal") — never a
fabricated issue, never the placeholder checklist text below verbatim, and
never a settings/config fact standing in for the required data pull.

For GA4-D findings only: set "severity" to your own honest judgment of that
specific insight's real business impact (critical/medium/low) based on what
you actually found — ignore the placeholder "medium" severity shown on the
GA4-D entries in the checklist below, that's a scoring artifact (every
checklist point needs some literal severity value), not a real assessment.

` : ""}${categories.includes("GTM") ? `## GTM data source
${input.gtmOAuthData
  ? `Pre-fetched via the visitor's own Google OAuth consent — already scoped to exactly their account, so this is authoritative and needs no ID-matching or MCP tool calls. Evaluate the GTM checklist against it directly and mark every resulting finding dataSource "live":\n${JSON.stringify(input.gtmOAuthData, null, 2)}`
  : `No OAuth data for GTM — fall back to the shared-service-account MCP tool (mcp__google-tag-manager-mcp-server), same exact-ID-match discipline as GA4 above. Candidate container IDs: ${JSON.stringify(gtmCandidates)}. ONLY use a container whose public container ID is an EXACT string match to one of those IDs; otherwise evaluate the GTM checklist against the crawl signal + general best practice and mark dataSource "detection".`}

` : ""}## How scoring works
This is NOT a weighted point scale — it's a flat count of checks. Every
checklist item across every included category above is exactly one check;
it either passes or it's broken and needs fixing, and every one of them gets
counted (see "there is no skip option" above — this is the same rule
restated for the scoring math specifically). That's why every one of the
three possible audit routes totals exactly 50 checks: GA4+GTM together (25
each) when the visitor has both, ${categories.length === 2 ? `that one tool (25) + Website (${WEBSITE_CODE_CHECKLIST.length}) when they have exactly one (see "Why a website-code audit runs alongside ${input.tools[0] ?? ""} this time" above)` : `Website (${WEBSITE_CHECKLIST.length}) when they have neither`}.
This is informational context only. You don't compute or report any score
yourself, at any level — that all happens deterministically outside this
response, from a straight count of each finding's own "status" field
(pass/fail) — see above.

Produce EXACTLY these categories in your output, no more, no fewer: ${categories.join(", ")}

Respond with ONLY a JSON object (no prose, no markdown fence) matching this
shape exactly:
{
  "categories": [
    {
      "category": "<one of: ${categories.join(" | ")}>",
      "findings": [
        {
          "checklistId": "<the EXACT id of the checklist point this finding is about, e.g. GA4-15 — must be copied verbatim from that category's checklist above, and every point gets exactly one of these, pass or fail>",
          "status": "<pass|fail>",
          "technical": {
            "summary": "<one line, engineer register: the literal state found, with the real value/name/number that proves it. Never a restatement of the checklist point's own title/expectedState>",
            "detail": "<a short paragraph: the mechanism behind that result, or what exactly the data shows>"
          },
          "business": {
            "summary": "<one line, same fact with the jargon removed — readable by someone who has never opened GA4>",
            "detail": "<a short paragraph: the real consequence — which decision this distorts, what it costs or protects, who feels it and when they would notice. Concrete over general. Stands alone without the technical voice>"
          },
          "dataSource": "<live|detection|public>",
          "severity": "<critical|medium|low — from the checklist point's own severity for a fixed checklist point (a finding on a critical-severity point is a critical finding), EXCEPT for a GA4-D1..GA4-D15 finding, where you set severity yourself based on that insight's real business impact — see \"GA4 deep-analysis slots\" above>"
        }
      ]
    }
  ]
}`;
}

interface RawFindingVoice {
  summary?: string;
  detail?: string;
}

interface RawCategoryFinding {
  technical?: RawFindingVoice;
  business?: RawFindingVoice;
  // Pre-2026-09-09 single-voice shape. Still parsed so a response that
  // ignores the two-voice contract degrades into a readable report instead
  // of throwing — normalizeVoices() below maps issue -> technical and
  // businessImpact -> business rather than dropping the text on the floor.
  issue?: string;
  businessImpact?: string;
  dataSource: CategoryFinding["dataSource"];
  severity: CategoryFinding["severity"];
  status?: CategoryFinding["status"];
  checklistId: string;
}

/**
 * Guarantees both voices exist on every finding, whatever the model actually
 * returned — html-report.ts renders both unconditionally, and a missing one
 * would show up as an empty row in the toggled view rather than as an error
 * anyone would notice.
 *
 * Precedence per voice: the real two-voice field, then the legacy
 * single-voice field it replaced (issue -> technical, businessImpact ->
 * business), then a last-resort line naming the checklist point so the row
 * is still identifiable. A voice that had to fall back is logged: it means
 * the response drifted from the contract, which is worth seeing in the
 * worker log rather than silently shipping a thinner report.
 */
function normalizeVoices(
  f: RawCategoryFinding,
  point: ChecklistPoint,
  category: CategoryKey,
): Pick<CategoryFinding, "technical" | "business"> {
  const warn = (voice: string, source: string) =>
    console.warn(`[audit-prompt] ${category}: ${point.id} had no ${voice} voice, fell back to ${source}`);

  let technical = f.technical;
  if (!technical?.summary) {
    if (f.issue) {
      warn("technical", "the legacy `issue` field");
      technical = { summary: f.issue, detail: technical?.detail || "" };
    } else {
      warn("technical", "the checklist point's own title");
      technical = { summary: point.title, detail: "" };
    }
  }

  let business = f.business;
  if (!business?.summary) {
    if (f.businessImpact) {
      warn("business", "the legacy `businessImpact` field");
      business = { summary: f.businessImpact, detail: business?.detail || "" };
    } else {
      warn("business", "the technical voice");
      business = { summary: technical.summary, detail: technical.detail || "" };
    }
  }

  return {
    technical: { summary: technical.summary ?? point.title, detail: technical.detail ?? "" },
    business: { summary: business.summary ?? point.title, detail: business.detail ?? "" },
  };
}

interface RawCategoryResult {
  category: CategoryKey;
  findings: RawCategoryFinding[];
  // No longer part of the contract we ask Claude for (see buildPrompt's "no
  // skip option" instructions) — kept optional here only so a stray legacy
  // response that still includes it doesn't fail to parse. It is NEVER used
  // in the tally math below any more; see `evaluated` there.
  skippedPointIds?: string[];
}

/**
 * Turns Claude's raw per-category output into the deterministic tally this
 * module's own doc comment promises: a flat count of checks, not a weighted
 * point scale. `evaluated` is ALWAYS the category's full checklist length —
 * 25, 25, or 50, whichever checklist this category's route uses —
 * never shrunk by a skipped/not-evaluable item, even if Claude's raw
 * response still includes a `skippedPointIds` array (that field is parsed
 * only to log a warning that it showed up despite the prompt no longer
 * asking for or honoring it — see buildPrompt). This is a hard guarantee
 * enforced in code, not just a prompt instruction: every run must always
 * account for the category's full checklist, so the run-wide total is
 * always exactly 50, regardless of what the model does.
 *
 * The returned `findings` array is built by iterating the CANONICAL
 * checklist array, not Claude's raw response — this guarantees exactly
 * `checklist.length` entries, one per point, in checklist order, always
 * (2026-09-06 rewrite: every point needs a real pass/fail finding now, see
 * buildPrompt's "no implicit pass" instruction and types.ts's FindingStatus
 * doc comment — this fixed html-report.ts previously falling back to
 * checklist.ts's own generic expectedState/commonFailure placeholder text
 * for a passed point, most visible on the open GA4-D slots). A finding that
 * cites an id outside this category's real checklist (a hallucination — the
 * point ids are a fixed, closed set) or repeats an id already seen is
 * logged and dropped; a point Claude never cited at all falls back to a
 * generic pass note (also logged) rather than being silently absent.
 */
export function computeCategoryResult(raw: RawCategoryResult, checklist: ChecklistPoint[]): CategoryResult {
  const validIds = new Set(checklist.map(p => p.id));

  if (raw.skippedPointIds && raw.skippedPointIds.length > 0) {
    console.warn(`[audit-prompt] ${raw.category}: response included skippedPointIds ${JSON.stringify(raw.skippedPointIds)} despite the prompt no longer asking for it — ignored, every checklist item still counts toward this category's total`);
  }

  const byId = new Map<string, RawCategoryFinding>();
  for (const f of raw.findings ?? []) {
    if (!validIds.has(f.checklistId)) {
      console.warn(`[audit-prompt] ${raw.category}: a finding cited unknown checklist id "${f.checklistId}", dropped`);
      continue;
    }
    if (byId.has(f.checklistId)) {
      console.warn(`[audit-prompt] ${raw.category}: checklist id "${f.checklistId}" was cited more than once — keeping the first, dropping the duplicate`);
      continue;
    }
    byId.set(f.checklistId, f);
  }

  const findings: CategoryFinding[] = checklist.map(point => {
    const f = byId.get(point.id);
    if (f) {
      return {
        checklistId: point.id,
        ...normalizeVoices(f, point, raw.category),
        dataSource: f.dataSource,
        severity: f.severity,
        // Defensive default for a stray response missing the field —
        // "fail" is the safer assumption than silently counting an
        // unclassified finding as a pass.
        status: f.status ?? "fail",
      };
    }
    console.warn(`[audit-prompt] ${raw.category}: no finding returned for checklist id "${point.id}" — the model should cite every point, pass or fail; falling back to a generic pass note`);
    return {
      checklistId: point.id,
      technical: {
        summary: "No specific finding was reported for this check this run.",
        detail: `The model returned no entry for ${point.id} (${point.title}). Treated as a pass so the run still accounts for all 50 checks, but there is no evidence behind it either way.`,
      },
      business: {
        summary: "This check came back without a result.",
        detail: "Nothing was reported for this item, so treat it as unverified rather than confirmed — worth a manual look before relying on it.",
      },
      dataSource: "detection",
      severity: point.severity,
      status: "pass",
    };
  });

  const total = checklist.length;
  const evaluated = total;
  const passed = findings.filter(f => f.status === "pass").length;
  const score = Math.round((passed / total) * 100);

  return {
    category: raw.category,
    score,
    checklistTally: { total, evaluated, passed },
    findings,
  };
}

// How long claude -p gets, by route. The browser routes (tools.length < 2 —
// see mcp-config.ts's neededMcpServers.browser) launch real headless Chrome
// and drive it across several discovered pages before writing anything, so
// they need materially more wall clock than the both-tools route, which only
// makes API calls. Measured: a both-tools GA4+GTM run with a matched GA4
// property lands around 12 minutes; a GA4-only run with the browser pass
// blew past 15 and was killed mid-flight, which is what these numbers exist
// to prevent. A both-tools run where GA4 has NO crawled/typed candidate
// (2026-09-13, tharaa.shop) used to blow the 20min ceiling entirely — the
// prompt's GA4 data-source section required a real GA4-D1..D15 data pull
// unconditionally, an impossible ask once no property ever matched. Fixed by
// making that section fall back to dataSource "detection" for the D-slots
// too (see the GA4 data source section above); this ceiling is kept a little
// above the measured 12min baseline as headroom, not because that failure
// mode is expected to recur.
// CLAUDE_TIMEOUT_MS overrides both (see claude.ts).
const BROWSER_ROUTE_TIMEOUT_MS = 35 * 60 * 1000;
const API_ONLY_ROUTE_TIMEOUT_MS = 25 * 60 * 1000;

export async function runAudit(input: AuditPromptInput): Promise<CategoryResult[]> {
  const prompt = buildPrompt(input);
  const allowedTools = buildAllowedTools(input);
  const usesBrowser = neededMcpServers({ tools: input.tools, ga4OAuthData: input.ga4OAuthData, gtmOAuthData: input.gtmOAuthData }).browser;
  const timeoutMs = usesBrowser ? BROWSER_ROUTE_TIMEOUT_MS : API_ONLY_ROUTE_TIMEOUT_MS;
  console.log(`[audit-prompt] claude -p budget: ${Math.round(timeoutMs / 60000)}min (${usesBrowser ? "browser route" : "API-only route"})`);
  const raw = await runClaudeHeadless({ prompt, mcpConfigPath: input.mcpConfigPath, allowedTools, timeoutMs });
  const parsed = extractJsonPayload(raw) as { categories?: RawCategoryResult[] };

  if (!parsed || !Array.isArray(parsed.categories)) {
    throw new Error("Audit response missing a 'categories' array");
  }

  return parsed.categories.map(raw => computeCategoryResult(raw, checklistFor(raw.category, input.tools)));
}
