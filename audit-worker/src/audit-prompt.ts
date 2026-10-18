import { countedCategories } from "./scoring.js";
import { extractJsonPayload, runClaudeHeadless } from "./claude.js";
import { GA4_CHECKLIST, GTM_CHECKLIST, WEBSITE_CHECKLIST, WEBSITE_CODE_CHECKLIST, type ChecklistPoint } from "./checklist.js";
import type { CategoryResult, CategoryFinding, ToolId, CategoryKey, Ga4Metrics, Ga4FunnelEvent, Ga4Facts, SiteChecks } from "./types.js";
import { buildAction, defaultProtect, repairActions, type RawAction } from "./actions.js";
import { ga4FactsPromptBlock, ga4MetricsFromOAuth } from "./ga4-facts.js";
import { siteChecksPromptBlock } from "./site-checks.js";
import { readerBrief, type AudienceRole } from "./audience.js";
import { READER_QUESTIONS } from "./reader-questions.js";
import { AD_EFFECT_PROMPT, AD_EFFECT_ROLES, adEffectOf, ensureAdDirection } from "./ad-impact.js";
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
  // Worker-computed GA4 facts (ga4-facts.ts) and our own visit to the store
  // (site-checks.ts). Null when there was no OAuth GA4 data / no visit.
  ga4Facts?: Ga4Facts | null;
  siteChecks?: SiteChecks | null;
  // "Your role" from the form. A role with a reader brief (icp/) rewrites the
  // business voice for that reader; the points and statuses never change.
  audienceRole?: AudienceRole | null;
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

function formatChecklist(category: CategoryKey, tools: ToolId[], role?: AudienceRole | null): string {
  const points = checklistFor(category, tools);
  if (points.length === 0) return "";
  // Readers judged on ROAS/CAC get each point's direction (ad-impact.ts), so
  // the business text and the report's chip say the same thing.
  const adLine = (id: string) => {
    const effect = role && AD_EFFECT_ROLES.has(role) ? adEffectOf(id) : null;
    return effect ? `\n    Ad effect when failing (direction only, never a ROAS/CAC value): ${AD_EFFECT_PROMPT[effect]}` : "";
  };
  return points
    .map(p => `  - [${p.id}, ${p.severity}, ${p.opportunity}${p.fact ? ", computed" : ""}] ${p.title}\n    Pass when: ${p.expectedState}\n    Fails when: ${p.commonFailure}\n    How to check it: ${p.validate}\n    Default action: ${p.action} (owner: ${p.owners.join(" + ")})\n    Done when: ${p.doneWhen}${adLine(p.id)}`)
    .join("\n");
}

// The reader-neutral half of the voice rules, used instead of the
// store-owner BUSINESS voice / READING LEVEL blocks when the form named a
// reader (audience.ts): the reader brief at the end of the prompt is then the
// only description of who reads the business voice, so the two never
// contradict each other (e.g. "say the tracking code, not pixel" against a
// media buyer who says pixel).
const ROLE_VOICE_RULES = `BUSINESS voice — for the reader described in WHO READS THIS REPORT at the
end of this prompt. Their terms, the metrics they are judged on and their
register come from that brief, and only from it:
- "summary": the same finding in that reader's words, landing on what it
  means for them.
- "detail": the CONSEQUENCE for that reader. Which decision gets made on
  wrong numbers, which spend can't be judged, which revenue is at risk, who
  feels it, and when they'd notice. Reach for the concrete: name the date,
  the page, the channel, the amount when you have it.
- Never restate severity as the impact ("this is critical"). Say what
  actually happens. Never moralize or sell; describe the consequence and
  stop. No "we recommend engaging our team".

WRITING RULES — both voices, every finding. The reader is reading a report
from an agency, so it has to read like a sharp person wrote it, not a
template:
- End on the last concrete fact or consequence. No closing line that just
  reassures or sums up ("The numbers reflect real shoppers.", "Reports can
  be trusted.", "There are no blind spots."). If the sentence would fit
  unchanged in another store's report, cut it or replace it with a number,
  name or date from THIS store.
- No "X, not Y" endings ("find buyers, not browsers", "clutter, not
  breakage", "trustworthy, not inflated"). State the positive fact once.
- Don't lean on the same adverbs: drop "actually", "exactly", "quietly",
  "silently", "simply", "truly" unless the sentence breaks without them.
- No setup phrases or reader guidance: "One thing to note:", "It is worth
  checking", "matters most", "which matters a lot", "the key point is".
  Say the thing.
- No em dashes in finding text. Use a full stop or a comma.
- Vary sentence openings across findings. Passed checks especially must not
  all follow the same "X is set up, so Y can be trusted" shape.
- Never use: delve, leverage, utilize, robust, seamless, streamline,
  empower, crucial, pivotal, testament, game changer.
- Short sentences, one idea each, in the active voice.
- The technical voice keeps the real names, values and identifiers, but
  also uses short sentences and plain connecting words.`;

export function buildPrompt(input: AuditPromptInput): string {
  const categories = countedCategories(input.tools);
  const ga4Candidates = dedupeUpper([...input.crawl.ids.ga4MeasurementIds, input.userProvidedGa4Id]);
  const gtmCandidates = dedupeUpper([...input.crawl.ids.gtmContainerIds, input.userProvidedGtmId]);


  const brief = readerBrief(input.audienceRole);
  // The reader's own questions (reader-questions.ts, from their ICP card).
  // The report answers each one from the findings behind it, so each
  // finding is written as part of that answer.
  const questions = input.audienceRole ? READER_QUESTIONS[input.audienceRole] : [];
  const questionBlock = brief && questions.length ? `
## THE READER CAME TO US WITH THESE QUESTIONS
The report opens with each question and answers it from the findings listed
under it. Write every finding behind a question as part of that answer: the
business summary should read as a direct reply to the question, in the
reader's terms, with this store's numbers.
${questions.map(q => `- "${q.en}"${q.points.length ? ` (answered by ${q.points.join(", ")})` : " (answered by every fix the reader can make without a developer)"}`).join("\n")}
` : "";
  const checklistBlocks = categories
    .map(c => `### ${c} checklist (evaluate every point below; report a finding only for points that are NOT clean)\n${formatChecklist(c, input.tools, input.audienceRole)}`)
    .join("\n\n");

  return `You are auditing a website for Optimizers, a CRO/analytics agency. Every
point in this audit is an ACTION POINT for ${brief ? "the reader named in WHO READS THIS REPORT at the end of this prompt" : "a non-technical business owner"}:
what was found, what it costs or protects, and exactly what to do about it,
who does it and how they'll know it's done. Each point is one of four types:
revenue_gain (more sales from current traffic), revenue_loss (money leaking
now: broken steps, wasted ad spend, sales reported wrong), risk (privacy,
security, account or data loss) or benefit (better decisions, findability,
cleaner data). Never just describe a metric or a config state: connect it to
the business and to the action, in plain language.
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

GA4 points marked as computed are decided by code: the "Computed GA4 facts"
section (when present) gives their numbers and status. Points that read our
own visit to the store use the "Browser facts" section (when present).

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

${brief ? ROLE_VOICE_RULES : `BUSINESS voice — for an owner or a marketing lead with no analytics
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
  moves like this, so a spike this size gets noticed weeks later, if at all.
  By then whatever caused it (a campaign, a press mention, a bot) is cold,
  and if it was a campaign that worked, nobody knows to run it again."
- Never restate severity as the impact ("this is critical") — say what
  actually happens. Never moralize or sell; describe the consequence and
  stop. No "we recommend engaging our team".

WRITING RULES — both voices, every finding. The reader is a store owner
reading a report from an agency, so it has to read like a sharp person
wrote it, not a template:
- End on the last concrete fact or consequence. No closing line that just
  reassures or sums up ("The numbers reflect real shoppers.", "Reports can
  be trusted.", "There are no blind spots."). If the sentence would fit
  unchanged in another store's report, cut it or replace it with a number,
  name or date from THIS store.
- No "X, not Y" endings ("find buyers, not browsers", "clutter, not
  breakage", "trustworthy, not inflated"). State the positive fact once.
- Don't lean on the same adverbs: drop "actually", "exactly", "quietly",
  "silently", "simply", "truly" unless the sentence breaks without them.
- No setup phrases or reader guidance: "One thing to note:", "It is worth
  checking", "matters most", "which matters a lot", "the key point is".
  Say the thing.
- No em dashes in finding text. Use a full stop or a comma.
- Vary sentence openings across findings. Passed checks especially must not
  all follow the same "X is set up, so Y can be trusted" shape.
- Never use: delve, leverage, utilize, robust, seamless, streamline,
  empower, crucial, pivotal, testament, game changer.

READING LEVEL — the business voice is read by a busy store owner who has
never opened GA4 or GTM. Write it at about a grade 6-8 reading level:
- Short sentences: one idea each, under 20 words. Split anything longer.
- Everyday words: "use" not "utilize", "about" not "approximately", "find
  out" not "determine", "show" not "indicate", "set up" not "implement",
  "help" not "facilitate", "before" not "prior to", "so" not
  "consequently", "because" not "due to the fact that".
- No analytics jargon in the business voice. Say "where a visit came from"
  not "attribution", "the tracking code" not "tag" or "pixel", "a sale
  counted twice" not "duplicate transaction", "visits" not "sessions",
  "people who bought" not "converters". If a tool must be named, explain it
  once in a few words ("Hotjar, a screen-recording tool").
- Exception: standard e-commerce/CRO metric names are NOT jargon — store
  owners know them, and a long paraphrase reads worse. Name them directly:
  "conversion rate" (never "share of visits that ended in a sale"),
  "average order value", "cart abandonment", "bounce rate", "add to cart",
  "checkout", "landing page", "funnel", "revenue". A few plain words after
  the first mention are fine ("your conversion rate, the share of visits
  that buy, is 1.2%"); replacing the term with a description is not.
- Talk about the shop: sales, orders, ad money, customers, the team's
  decisions. Use "you" and "your store" where it reads naturally.
- Active voice: "Google counts each order once", not "each order is
  counted once".
- The technical voice keeps the real names, values and identifiers, but
  also uses short sentences and plain connecting words.`}

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
(e.g. "GA4-03", "W-22") — never invent an id that isn't in the checklist,
never cite the same id twice, and never split one point across multiple
findings. Every checklistId you cite must come verbatim from the checklists
below.

ACTIONS — every point in this audit must be something the store can act on.
Each checklist point below comes with its Type, a default Action, Owner and
Done when. For every finding:
- "fail": also return "action": {"step", "owners", "doneWhen", "impact"}.
  - "step": one imperative sentence, 8-30 words, naming the exact thing to
    change for THIS store: the page URL, tag name, event, product, setting
    or link you found. Not "consider", "review" or "ensure". Start from the
    point's default Action and make it specific.
  - "owners": one or more of "dev", "marketing", "content", "owner".
  - "doneWhen": a checkable end state with a number, a named report or tool
    view, or an observable page state. Start from the point's default.
  - "impact": one short line on what changes for the business when it's
    done. Use the store's own numbers; never invent money figures (GA4 money
    ranges are added by code).
- "pass": also return "protect": one sentence on what to keep as it is and
  why, for example "Keep the cart drawer as it is while fixing product pages:
  52% of carts reach checkout."
A failed finding without a specific step and a checkable doneWhen is
rejected and rewritten.

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

1. Open a new page and navigate to ${input.website}. Wait for it to finish loading, then stay idle a few seconds before reading console/network state.
2. Network requests during that load+idle window: tracking requests really firing on home, product and cart (W-21), any firing twice for one event (W-24), ad pixels (W-25), failed first-party files (W-03), any request past ~3s (W-04), mixed content (W-31), leftover scripts from apps with no visible feature (W-16), third-party weight by domain (W-15).
3. Navigate to ${new URL(input.website).origin}/.env and ${new URL(input.website).origin}/.git/config and confirm each is a 404 (W-33). Read ${new URL(input.website).origin}/robots.txt and its sitemap (W-39). Load a made-up URL to see the 404 page (W-05).
4. If a cookie/consent banner is visible, compare requests before vs. after a choice — does it change what fires (W-29)? Read Set-Cookie flags and security headers (W-32; on Shopify, Salla or Zid that point passes as platform-managed).
5. Ecommerce dataLayer: read window.dataLayer on a product page, and use the Browser facts below for what our own Add-to-Cart click produced (W-22). Each ecommerce event's items carry item_id/item_name/price/quantity, with value/currency (W-23).
6. On the cart page: console errors or a failed load (W-02). On the product page: schema.org Product/Offer price + availability (W-40), whether they equal the visible price and stock (W-41), brand/GTIN (W-42).
7. Resource weight from the same load: render-blocking files before first paint (W-12), images far larger than their rendered size or not WebP/AVIF, and below-fold images loading eagerly (W-13), JS+CSS first-load transfer size naming the largest files (W-14), compression and cache headers (W-18), font-display on web fonts (W-19). Cite real byte numbers and URLs.
8. Core Web Vitals on the product page at a ~390x844 mobile viewport: LCP and CLS via PerformanceObserver (W-09, W-10), long tasks / TBT (W-11), horizontal overflow and tap-target sizes (W-20), price and button contrast (W-47), icon buttons without names (W-50), inputs without labels (W-49).
9. Every finding from what you saw in the browser gets dataSource "live"; anything from the static crawl stays "detection".
10. If the browser tools error out, don't fail the audit: write that point from the crawl signal, dataSource "detection".

` : ""}${input.siteChecks ? `## Browser facts (our own visit to the live store, analytics hits blocked)
These come from a separate phone-sized visit that clicked Add to Cart on a
real product. Use them for the points that cite "Browser facts"; they are
"live" evidence.
${siteChecksPromptBlock(input.siteChecks)}

` : ""}${categories.includes("GA4") ? `## GA4 data source
${input.ga4OAuthData
  ? `Pre-fetched via the visitor's own Google OAuth consent — already scoped to exactly their account, so this is authoritative and needs no ID-matching or MCP tool calls. Evaluate the GA4 checklist against it directly and mark every resulting finding dataSource "live":\n${JSON.stringify(input.ga4OAuthData, null, 2)}`
  : `No OAuth data for GA4 — fall back to the shared-service-account MCP tool (mcp__ga4-admin). That account is used by many different client businesses over time, so identification must be by EXACT ID MATCH ONLY, never by business name or any fuzzy signal. Candidate measurement IDs (crawled and/or visitor-typed, either source equally valid as a match key but never as proof of ownership on its own): ${JSON.stringify(ga4Candidates)}.

${ga4Candidates.length > 0
    ? `List accessible properties, find each one's web data stream(s), and ONLY use a property whose stream's measurementId is an EXACT string match to one of those IDs.`
    : `The candidate list is empty (GA4 often loads dynamically via GTM rather than a literal gtag.js snippet on the page). Try the cheap path first, before any property enumeration: if a GTM container matched below, inspect ITS tags for a GA4 Configuration tag's measurementId — that's just a second source for a candidate, still exact-match only, not a new matching rule. Do NOT list/enumerate every accessible property while the candidate list is empty — there is nothing for a full listing to match against, so it only burns time and turns for a guaranteed-empty result.`}

If nothing ever matches (empty candidate list with no GTM-tag hit either, or a non-empty list where no property's stream matches any candidate), there is no live GA4 property this run: evaluate every GA4 point against the crawl signal + general best practice and mark dataSource "detection", and do NOT attempt any run_report/run_realtime_report/admin_request calls. An exact match is the only condition under which you may mark dataSource "live".`}

${input.ga4Facts ? `## Computed GA4 facts (decided by code — quote, never recompute)
The worker computed these from the OAuth reports above. For every GA4 point
listed here:
- "status" MUST be exactly the status shown: PASS → "pass", FAIL → "fail".
  NO_DATA means the worker couldn't decide: judge that point yourself from
  the OAuth data above.
- Quote the numbers as written (same rounding). Never compute a different
  rate, total or money figure for these points.
- The OAuth reports' "conversions" metric counts EVERY key event (page views,
  add-to-carts, video plays when those are marked as key events), not sales.
  Never compute a conversion rate or sales figure from it. Sales are the
  purchase report, or "transactions" (the 3rd metric) where a report has it.
  A NO_DATA fact that says sales "can't be read" means exactly that: judge
  the point only from what can be read (visits, shares), say in the finding
  that sales by that split can't be measured until GA4-20 is fixed, and never
  state a sales rate for it.
- The money range ("Estimated gain") is added to the action by code; you may
  mention it in the business voice but never change it.

${ga4FactsPromptBlock(input.ga4Facts)}
` : `## GA4 points without OAuth data
Pull the data each point's "How to check it" line names (MCP route), with
the same thresholds stated in its "Common failure" line. When no property
matched, evaluate every GA4 point from the crawl signal and best practice,
dataSource "detection", without any data pulls.
`}

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
${categories.includes("GA4") ? `
## Store numbers for the report's charts ("ga4Metrics")
${input.ga4Facts ? `The worker already computed the store's numbers from the OAuth reports: set "ga4Metrics" to null.` : `Only when the GA4 property was a live exact match: also return the real
numbers you pulled for the funnel, channel and new-vs-returning points as
"ga4Metrics", so the report can chart them. Copy numbers straight from the
data calls, same 28-day window. Never estimate or fill a gap: leave a field
null or an array empty when no call returned it. When there was no live GA4
property, set "ga4Metrics" to null.`}
` : ""}
${brief ? `## WHO READS THIS REPORT (overrides the business voice and reading level above)
${brief}
${questionBlock}

Before you answer, check every business summary and detail against this
brief: the reader's terms and the metrics they are judged on. LANGUAGE:
write every finding, action and protect line in ENGLISH. The Arabic version
is produced afterwards by a separate translation step; never write Arabic
in this response. The technical voice, statuses, numbers, ids and the JSON
shape stay exactly as specified.

` : ""}Respond with ONLY a JSON object (no prose, no markdown fence) matching this
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
            "summary": "${brief ? "<one line, same fact in the voice of WHO READS THIS REPORT above>" : "<one line, same fact with the jargon removed — readable by someone who has never opened GA4>"}",
            "detail": "<a short paragraph: the real consequence — which decision this distorts, what it costs or protects, who feels it and when they would notice. Concrete over general. Stands alone without the technical voice>"
          },
          "dataSource": "<live|detection|public>",
          "severity": "<critical|medium|low — the checklist point's own severity>",
          "action": "<fail only> { \"step\": \"<imperative, names the exact thing>\", \"owners\": [\"dev|marketing|content|owner\"], \"doneWhen\": \"<checkable end state>\", \"impact\": \"<one line>\" }",
          "protect": "<pass only: what to keep as it is, and why>"
        }
      ]
    }
  ]${categories.includes("GA4") ? `,
  "ga4Metrics": null | {
    "periodDays": 28,
    "currency": "<property currency code, e.g. EGP, or null>",
    "sessions": <total sessions or null>,
    "conversions": <total key-event conversions or null>,
    "conversionRate": <purchase or key-event conversion rate in percent, e.g. 2.36, or null>,
    "revenue": <purchaseRevenue or null>,
    "funnel": [{ "event": "<page_view|view_item|add_to_cart|begin_checkout|add_shipping_info|add_payment_info|purchase>", "count": <eventCount> }],
    "channels": [{ "name": "<sessionDefaultChannelGroup as GA4 names it>", "sessions": <sessions or null>, "conversionRate": <percent> }],
    "segments": [{ "name": "<new|returning>", "sessions": <sessions or null>, "conversionRate": <percent> }]
  }` : ""}
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
  action?: RawAction;
  protect?: unknown;
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
export interface ComputeOptions {
  ga4Facts?: Ga4Facts | null;
  // Filled with the ids whose model-written action failed the actionability
  // rule (actions.ts), for the repair call.
  rejected?: Array<{ category: string; id: string }>;
}

export function computeCategoryResult(raw: RawCategoryResult, checklist: ChecklistPoint[], opts: ComputeOptions = {}): CategoryResult {
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
    const fact = raw.category === "GA4" ? opts.ga4Facts?.facts[point.id] : undefined;
    if (f) {
      // Defensive default for a stray response missing the field — "fail" is
      // the safer assumption than silently counting an unclassified finding
      // as a pass. A computed GA4 fact overrides the model either way.
      let status = f.status ?? "fail";
      if (fact && fact.status !== "no_data" && fact.status !== status) {
        console.warn(`[audit-prompt] ${point.id}: model said ${status}, computed fact says ${fact.status} — using the fact`);
        status = fact.status;
      }
      const finding: CategoryFinding = {
        checklistId: point.id,
        ...normalizeVoices(f, point, raw.category),
        dataSource: fact && fact.status !== "no_data" ? "live" : f.dataSource,
        severity: point.severity,
        status,
        opportunity: point.opportunity,
        criteria: point.expectedState,
      };
      if (status === "fail") {
        const { action, rejected } = buildAction(f.action, point, fact);
        finding.action = action;
        if (rejected) opts.rejected?.push({ category: raw.category, id: point.id });
      } else {
        finding.protect = typeof f.protect === "string" && f.protect.trim().split(/\s+/).length >= 5 ? f.protect.trim() : defaultProtect(point);
      }
      return finding;
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
      opportunity: point.opportunity,
      protect: defaultProtect(point),
      criteria: point.expectedState,
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
// too (see the GA4 data source section above).
//
// Despite that fix, a both-tools run on the SAME tharaa.shop input (still no
// GA4 candidate — that part of the input never changes) hit the 25min
// ceiling again on 2026-09-15 with zero diagnostic evidence: claude.ts's
// timeout handler used to discard the accumulated stdout/stderr entirely on
// reject, so there was no way to tell whether it was genuinely still
// working or actually stuck. Fixed there too (timeout now reports whatever
// was captured, plus a running heartbeat every 60s) — but that fix only
// gives US visibility into the NEXT occurrence, it doesn't explain this
// one. Bumped to match the browser route's ceiling as real headroom for
// that unexplained variance rather than re-guessing at a smaller number;
// pull it back down once the heartbeat/diagnostic logging actually shows
// what's consuming the time on a future slow run.
// CLAUDE_TIMEOUT_MS overrides both (see claude.ts).
const BROWSER_ROUTE_TIMEOUT_MS = 35 * 60 * 1000;
const API_ONLY_ROUTE_TIMEOUT_MS = 35 * 60 * 1000;

const FUNNEL_ORDER: Ga4FunnelEvent[] = ["page_view", "view_item", "add_to_cart", "begin_checkout", "add_shipping_info", "add_payment_info", "purchase"];

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null;
}

/**
 * Keeps only well-formed numbers from the response's ga4Metrics block, and
 * only when at least one GA4 finding is backed by live data: on the
 * detection route there was no property to pull from, so any numbers there
 * would be invented. Returns null when nothing chartable is left.
 */
export function sanitizeGa4Metrics(raw: unknown, categories: CategoryResult[]): Ga4Metrics | null {
  const ga4 = categories.find(c => c.category === "GA4");
  if (!ga4 || !ga4.findings.some(f => f.dataSource === "live")) return null;
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const rate = (v: unknown) => { const n = num(v); return n !== null && n <= 100 ? n : null; };
  // Rates over 100% mean "conversions" counted every key event, not sales:
  // drop the whole list rather than chart a mix of real and impossible rates.
  const sane = (list: unknown) => (Array.isArray(list) && list.every(x => num((x as Record<string, unknown>)?.conversionRate) === null || (num((x as Record<string, unknown>).conversionRate) as number) <= 100) ? list : []);
  r.channels = sane(r.channels);
  r.segments = sane(r.segments);
  const byEvent = new Map<Ga4FunnelEvent, number>();
  for (const step of Array.isArray(r.funnel) ? r.funnel : []) {
    const s = (step ?? {}) as Record<string, unknown>;
    const event = s.event as Ga4FunnelEvent;
    const count = num(s.count);
    if (FUNNEL_ORDER.includes(event) && count !== null && count > 0 && !byEvent.has(event)) byEvent.set(event, count);
  }
  const funnel = FUNNEL_ORDER.filter(e => byEvent.has(e)).map(event => ({ event, count: byEvent.get(event)! }));
  const channels = (Array.isArray(r.channels) ? r.channels : [])
    .map(c => (c ?? {}) as Record<string, unknown>)
    .filter(c => typeof c.name === "string" && rate(c.conversionRate) !== null)
    .map(c => ({ name: String(c.name).slice(0, 40), sessions: num(c.sessions), conversionRate: rate(c.conversionRate)! }))
    .slice(0, 10);
  const segments = (Array.isArray(r.segments) ? r.segments : [])
    .map(s => (s ?? {}) as Record<string, unknown>)
    .filter(s => (s.name === "new" || s.name === "returning") && rate(s.conversionRate) !== null)
    .map(s => ({ name: s.name as "new" | "returning", sessions: num(s.sessions), conversionRate: rate(s.conversionRate)! }));
  const metrics: Ga4Metrics = {
    periodDays: num(r.periodDays) ?? 28,
    currency: typeof r.currency === "string" && /^[A-Z]{3}$/.test(r.currency) ? r.currency : null,
    sessions: num(r.sessions),
    conversions: num(r.conversions),
    conversionRate: rate(r.conversionRate),
    revenue: num(r.revenue),
    funnel: funnel.length >= 2 ? funnel : [],
    channels: channels.length >= 2 ? channels : [],
    segments: segments.length === 2 ? segments : [],
  };
  const chartable = metrics.funnel.length > 0 || metrics.channels.length > 0 || metrics.segments.length > 0 || metrics.sessions !== null;
  return chartable ? metrics : null;
}

export interface AuditRunResult {
  categories: CategoryResult[];
  ga4Metrics: Ga4Metrics | null;
}

export async function runAudit(input: AuditPromptInput): Promise<AuditRunResult> {
  const prompt = buildPrompt(input);
  const allowedTools = buildAllowedTools(input);
  const usesBrowser = neededMcpServers({ tools: input.tools, ga4OAuthData: input.ga4OAuthData, gtmOAuthData: input.gtmOAuthData }).browser;
  const timeoutMs = usesBrowser ? BROWSER_ROUTE_TIMEOUT_MS : API_ONLY_ROUTE_TIMEOUT_MS;
  console.log(`[audit-prompt] claude -p budget: ${Math.round(timeoutMs / 60000)}min (${usesBrowser ? "browser route" : "API-only route"})`);
  const raw = await runClaudeHeadless({ prompt, mcpConfigPath: input.mcpConfigPath, allowedTools, timeoutMs, label: "audit" });
  const parsed = extractJsonPayload(raw) as { categories?: RawCategoryResult[]; ga4Metrics?: unknown };

  if (!parsed || !Array.isArray(parsed.categories)) {
    // The raw response is included (not just a generic message) for two
    // reasons: so result_error actually preserves something diagnosable
    // instead of a dead end, and so poll.ts's isRateLimitError can still
    // catch a usage-limit refusal that came back shaped like this (exit 0,
    // no categories) instead of misclassifying it as a permanent failure —
    // the same failure mode its own doc comment warns about, just in a path
    // that fix didn't cover.
    throw new Error(`Audit response missing a 'categories' array: ${raw.slice(0, 4000)}`);
  }

  const rejected: Array<{ category: string; id: string }> = [];
  const categories = parsed.categories.map(raw => computeCategoryResult(raw, checklistFor(raw.category, input.tools), { ga4Facts: input.ga4Facts, rejected }));
  if (rejected.length) {
    const fix = await repairActions(categories, rejected, `audit-${Date.now()}`);
    console.log(`[audit-prompt] ${rejected.length} action(s) failed the actionability rule; repaired ${fix.repaired}, checklist defaults kept for the rest${fix.error ? ` (repair error: ${fix.error})` : ""}`);
  }
  const fromOAuth = input.ga4Facts ? ga4MetricsFromOAuth(input.ga4OAuthData) : null;
  // Readers judged on ROAS/CAC: every failed point with an ad effect says
  // which way it moves them, in words (ad-impact.ts).
  const directed = ensureAdDirection(categories, input.audienceRole);
  if (directed) console.log(`[audit-prompt] Added the ROAS/CAC direction sentence to ${directed} findings`);
  return { categories, ga4Metrics: fromOAuth ?? sanitizeGa4Metrics(parsed.ga4Metrics, categories) };
}
