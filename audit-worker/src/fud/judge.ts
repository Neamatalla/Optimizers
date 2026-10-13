import { writeFile } from "fs/promises";
import path from "path";
import { extractJsonPayload, runClaudeHeadless } from "../claude.js";
import { buildMcpConfig } from "../mcp-config.js";
import type { FindingVoice, Ga4Metrics } from "../types.js";
import type { PageEvidence, StoreEvidence } from "./evidence.js";
import type { FudRule, SignalState } from "./rules.js";

/**
 * One `claude -p` call, no tools, no MCP servers: evidence in, one verdict
 * per rule out, in English AND Arabic. It never sees the browser — only the
 * text collect.ts captured — so it can't wander, and its run time is
 * bounded by the prompt, not by the store.
 */

const JUDGE_TIMEOUT_MS = 6 * 60 * 1000;

export interface JudgeVerdict {
  ruleId: string;
  applicable: boolean;
  status: "pass" | "warn" | "fail" | "unassessed";
  confidence: number;
  blockIds: string[];
  technical: FindingVoice;
  business: FindingVoice;
  recommendation?: string;
  exampleCopy?: { en: string; ar: string };
  ar?: { technical: FindingVoice; business: FindingVoice; recommendation?: string };
  E?: number;
  C?: number;
  T?: number;
}

function marketHint(website: string): string {
  const host = (() => {
    try {
      return new URL(website).hostname;
    } catch {
      return website;
    }
  })();
  if (/\.eg$/.test(host)) return "Egypt (prices likely in EGP)";
  if (/\.sa$/.test(host)) return "Saudi Arabia (prices likely in SAR)";
  if (/\.ae$/.test(host)) return "United Arab Emirates (prices likely in AED)";
  if (/\.kw$/.test(host)) return "Kuwait";
  if (/\.qa$/.test(host)) return "Qatar";
  return "Egypt or the GCC — infer the country and currency from the page text";
}

function pageBlock(p: PageEvidence): string {
  if (!p.loaded) return `### ${p.pageType.toUpperCase()} — NOT AVAILABLE (${p.note ?? "did not load"})\n`;
  const near = new Set(p.cta?.nearbyBlockIds ?? []);
  const lines = p.blocks.map(b => `[${b.id}${b.aboveFold ? "|fold" : ""}${near.has(b.id) ? "|cta" : ""}${b.tag === "img" ? "|img" : ""}] ${b.text}`);
  const meta = [
    `url: ${p.url}`,
    p.note ? `note: ${p.note}` : "",
    p.cta ? `primary button: "${p.cta.text}"${p.cta.disabled ? " (disabled)" : ""}; blocks marked |cta are within ~220px of it` : "primary button: none found",
    p.widgets.length ? `widgets detected in page code: ${p.widgets.join(", ")}` : "widgets detected in page code: none",
    p.jsonLd.types.length ? `schema.org: ${p.jsonLd.types.join(", ")}${p.jsonLd.ratingValue ? `; rating ${p.jsonLd.ratingValue} (${p.jsonLd.reviewCount ?? "?"} reviews)` : ""}${p.jsonLd.availability ? `; availability ${p.jsonLd.availability}` : ""}` : "",
    p.policyLinks.length ? `links: ${p.policyLinks.map(l => `${l.kind}="${l.text}"`).join(", ")}` : "links: none of shipping/returns/contact/about/faq found",
    p.variants ? `variants: ${p.variants.hasSize ? `sold in sizes, chosen via ${p.variants.control}` : "no size options"}${p.variants.groups.length ? ` (groups: ${p.variants.groups.join(", ")})` : ""}` : "",
    p.listing ? `product cards counted on this page: ${p.listing.cards}; with a price: ${p.listing.withPrice}; with a rating: ${p.listing.withRating}; with a quick-add button: ${p.listing.quickAdd}${p.listing.quickAddLabels.length ? ` (labels: ${p.listing.quickAddLabels.map(l => `«${l}»`).join(", ")})` : ""}; filter control: ${p.listing.hasFilter ? "yes" : "no"}; sort control: ${p.listing.hasSort ? "yes" : "no"}; category links above the grid: ${p.listing.pills}` : "",
    p.cart ? `cart source: ${p.cart.source}${p.cart.empty ? " — EMPTY, the item could not be added" : " — holds the added item"}` : "",
    ...factLines(p),
  ].filter(Boolean);
  return `### ${p.pageType.toUpperCase()}\n${meta.join("\n")}\nVisible text (in reading order; |fold = on the first phone screen, |img = image/icon label):\n${lines.join("\n")}\n`;
}

/** Layout facts measured in the browser (facts-js.ts), as plain sentences. */
function factLines(p: PageEvidence): string[] {
  const f = p.facts;
  const out: string[] = [];
  if (f) {
    out.push(`page language: lang="${f.lang || "none"}", direction ${f.dir || "unknown"}${f.langSwitch ? ", has a language switcher" : ""}${f.hreflang.length ? `, alternate languages: ${f.hreflang.join(", ")}` : ""}`);
    out.push(`H1 headings: ${f.h1Count}${f.h1.length ? ` (${f.h1.map(h => `«${h}»`).join(", ")})` : ""}`);
    if (p.pageType === "home") {
      out.push(`buttons on the first screen (outside the header): ${f.heroButtons.length ? f.heroButtons.map(b => `«${b}»`).join(", ") : "none"}`);
      if (f.hero) out.push(`largest first-screen visual: ${f.hero.kind} covering ${f.hero.coverPct}% of the screen${f.hero.alt ? `, alt text «${f.hero.alt}»` : ", no alt text"}${/unsplash|pexels|shutterstock|istock|getty|freepik|adobestock/i.test(f.hero.src) ? " — file comes from a stock-photo site" : ""}`);
      out.push(`search: ${f.search.present ? (f.search.visible ? "visible on the phone" : "present but not visible without opening the menu") : "none found"}`);
      out.push(`signup: email field ${f.capture.email ? "yes" : "no"}, phone field ${f.capture.phone ? "yes" : "no"}, account/login link ${f.capture.account ? "yes" : "no"}`);
    }
    if (p.pageType === "product") {
      out.push(`product media: ${f.media.images} distinct images near the top, video ${f.media.video ? "yes" : "no"}, zoom/lightbox ${f.media.zoom ? "yes" : "no"}`);
      out.push(`organised info: ${f.infoSections.details} expandable sections, ${f.infoSections.expanders} tabs/toggles`);
    }
  }
  if (p.sticky !== undefined) out.push(`sticky buy button after scrolling: ${p.sticky ? `yes («${p.sticky}»)` : "no"}`);
  if (p.popups) {
    out.push(
      p.popups.onLoad.length
        ? `overlays on arrival: ${p.popups.onLoad.map(o => `${o.kind} covering ${o.cover}% («${o.text.slice(0, 60)}»)`).join("; ")}; after pressing Escape ${p.popups.afterEscape} remained`
        : "overlays on arrival: none",
    );
  }
  return out;
}

/** Store-wide facts some rules need (menu, search test, order value). */
function storeBlock(e: StoreEvidence): string {
  const lines: string[] = [];
  const dHome = e.desktop?.find(p => p.pageType === "home" && p.loaded);
  const nav = dHome?.facts?.nav ?? e.pages.find(p => p.pageType === "home")?.facts?.nav ?? [];
  lines.push(`top menu labels (desktop): ${nav.length ? nav.map(n => `«${n}»`).join(", ") : "none found"} (${nav.length} items)`);
  if (e.searchTest) lines.push(`test search for «${e.searchTest.query}» (a word from the product's own name): ${e.searchTest.loaded ? `${e.searchTest.results} products in the results` : "results page did not load"}`);
  if (e.context?.aov) lines.push(`average order value from GA4: ${e.context.aov}${e.context.currency ? ` ${e.context.currency}` : ""}`);
  return lines.join("\n");
}

function funnelBlock(ga4: Ga4Metrics | null | undefined): string {
  if (!ga4 || ga4.funnel.length < 2) return "No GA4 funnel data for this store.";
  return `GA4 funnel, last ${ga4.periodDays} days (event counts): ${ga4.funnel.map(s => `${s.event}=${s.count}`).join(", ")}${ga4.conversionRate !== null ? `; conversion rate ${ga4.conversionRate}%` : ""}. Mention a figure only when it relates to the rule.`;
}

export function buildJudgePrompt(evidence: StoreEvidence, rules: Array<{ rule: FudRule; signal: SignalState }>, ga4: Ga4Metrics | null | undefined, brief = false): string {
  const ruleText = rules
    .map(({ rule, signal }) =>
      [
        `- ${rule.id} — ${rule.title.en} (page: ${rule.pageType})`,
        `  Question: ${rule.question}`,
        `  PASS: ${rule.pass}`,
        `  WARN: ${rule.warn}`,
        `  FAIL: ${rule.fail}`,
        `  Keyword detector says: ${signal} (present / elsewhere = found but not where it should be / absent / unknown). It is a hint, not the answer — read the text yourself.`,
        `  Default effort if this needs fixing: ease ${rule.E}/5, cost ${rule.C}/5, time ${rule.T}/5 (5 = easiest/cheapest/fastest).`,
      ].join("\n"),
    )
    .join("\n");

  const writing = brief
    ? `OUTPUT
This is a competitor benchmark: only the status matters. Return ONLY a JSON object, no prose, no markdown fence:
{"findings": [{"ruleId": "A1", "applicable": true, "status": "pass|warn|fail|unassessed", "confidence": 0.9, "blockIds": ["p12"], "note": "one short English sentence, under 15 words"}]}
Exactly one entry per rule listed above (${rules.map(r => r.rule.id).join(", ")}), in that order.`
    : "";
  if (brief) {
    return `You are a senior CRO consultant benchmarking an e-commerce store. Judge each rule from the evidence below (a real phone visit: homepage, one product page, the cart after adding one item, one collection page). Block ids are in brackets. Market: ${marketHint(evidence.website)}; cash on delivery, local installment providers and WhatsApp count as valid answers.

RULES
${ruleText}

HOW TO DECIDE
- PASS only with block ids that prove it; WARN when partly there, in the wrong place or unsure; FAIL only when clearly missing. "unassessed" when the needed page is NOT AVAILABLE or the cart is EMPTY. "applicable": false only when the rule doesn't apply to this product.
- Arabic and English text both count.

STORE FACTS
${storeBlock(evidence)}

EVIDENCE
${evidence.pages.map(pageBlock).join("\n")}

${writing}`;
  }

  return `You are a senior CRO consultant reviewing an e-commerce store for what stops shoppers buying: the fears, uncertainties and doubts (FUDs) at the moment of decision, and the layout, navigation and offer gaps that cost sales and order value. The store sells in ${marketHint(evidence.website)}. Shoppers there commonly expect cash on delivery, local installment providers (Tabby, Tamara, valU, Sympl, Souhoola), WhatsApp support, and Arabic or bilingual copy — treat these as valid answers to the rules.

Below is everything a real phone visit (390px wide) captured from the store's homepage, one product page, the cart after adding one item, and one collection page. Each text block has an id in brackets. You cannot browse; judge only from this evidence.

RULES TO JUDGE
${rules.length ? ruleText : "(none)"}

HOW TO DECIDE
- PASS only when you can cite the block id(s) that prove it. WARN when it's partly there, in the wrong place, vague, or you're unsure. FAIL only when the evidence clearly shows it's missing on the pages the rule covers.
- "unassessed" when the page the rule needs is NOT AVAILABLE or the cart is EMPTY for a cart rule. "applicable": false only when the rule genuinely doesn't apply to this product (e.g. size help for a product with no sizes).
- Text may be in Arabic, English or both. Missing English text is not a failure if the Arabic says it.
- confidence: 0-1, how sure you are of the status from this evidence alone.
- Never invent facts about the store, its policies or its numbers. Never write health, medical or legal claims in example copy.

WRITING
- Block ids are for the "blockIds" field only — never write them in any text. Describe locations in words instead ("in the cart drawer", "under the price", "in the footer").
- technical: for the developer — what was found, where on the page, the exact wording quoted, and the mechanism. summary = one line, detail = 2-4 sentences.
- business: for a busy store owner, no jargon — what the shopper experiences and what it costs or protects. summary = one line, detail = 2-4 sentences. Speak to the owner ("your cart", "your shoppers").
- recommendation: for warn/fail, one or two concrete sentences on exactly what to add and where (e.g. "Add a line under the Add to Cart button: …"). Omit for pass.
- exampleCopy: for warn/fail where copy is the fix, a short ready-to-paste line in English ("en") and natural Gulf/Egyptian-friendly Modern Standard Arabic ("ar"). Use the store's real currency and real numbers when the evidence shows them; otherwise use a clear placeholder like [X days]. Omit when copy isn't the fix.
- ar: the technical, business and recommendation texts in plain, professional Modern Standard Arabic for the same store owner. Short sentences, common words. Keep tool names and code identifiers in Latin script.
- E, C, T: only if this store's fix is clearly harder than the default, give that factor exactly one point lower; otherwise omit.

${funnelBlock(ga4)}

STORE FACTS
${storeBlock(evidence)}

EVIDENCE
${evidence.pages.map(pageBlock).join("\n")}
Add-to-cart attempt: ${evidence.addToCart.attempted ? (evidence.addToCart.ok ? "succeeded" : `failed (${evidence.addToCart.reason ?? "unknown"})`) : `not attempted (${evidence.addToCart.reason ?? "no product page"})`}.

OUTPUT
Return ONLY a JSON object, no prose, no markdown fence. It must be valid JSON: inside text values never use the double-quote character (") — quote the store's wording with « » or single quotes instead — and no line breaks inside strings.
{"findings": [{"ruleId": "A1", "applicable": true, "status": "pass|warn|fail|unassessed", "confidence": 0.9, "blockIds": ["p12"], "technical": {"summary": "", "detail": ""}, "business": {"summary": "", "detail": ""}, "recommendation": "", "exampleCopy": {"en": "", "ar": ""}, "ar": {"technical": {"summary": "", "detail": ""}, "business": {"summary": "", "detail": ""}, "recommendation": ""}}]}
Exactly one entry per rule listed above (${rules.map(r => r.rule.id).join(", ")}), in that order.`;
}

const isVoice = (v: any): v is FindingVoice => v && typeof v.summary === "string" && typeof v.detail === "string" && v.summary.trim().length > 0;

export function parseVerdicts(raw: unknown, brief = false): JudgeVerdict[] {
  const list = Array.isArray(raw) ? raw : (raw as any)?.findings;
  if (!Array.isArray(list)) throw new Error("judge response had no findings array");
  const out: JudgeVerdict[] = [];
  for (const v of list) {
    if (!v || typeof v.ruleId !== "string") continue;
    const status = ["pass", "warn", "fail", "unassessed"].includes(v.status) ? v.status : "warn";
    // Competitor benchmark answers carry one short note instead of the two voices.
    if (brief && !isVoice(v.business)) {
      const note = typeof v.note === "string" && v.note.trim() ? v.note.trim() : status;
      v.technical = { summary: note, detail: "" };
      v.business = { summary: note, detail: "" };
    }
    if (!isVoice(v.technical) || !isVoice(v.business)) continue;
    const num = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : undefined);
    out.push({
      ruleId: v.ruleId.trim().toUpperCase(),
      applicable: v.applicable !== false,
      status,
      confidence: Math.max(0, Math.min(1, num(v.confidence) ?? 0.5)),
      blockIds: Array.isArray(v.blockIds) ? v.blockIds.filter((b: unknown) => typeof b === "string").slice(0, 12) : [],
      technical: { summary: v.technical.summary.trim(), detail: v.technical.detail.trim() },
      business: { summary: v.business.summary.trim(), detail: v.business.detail.trim() },
      recommendation: typeof v.recommendation === "string" && v.recommendation.trim() ? v.recommendation.trim() : undefined,
      exampleCopy:
        v.exampleCopy && typeof v.exampleCopy.en === "string" && typeof v.exampleCopy.ar === "string" && v.exampleCopy.en.trim() && v.exampleCopy.ar.trim()
          ? { en: v.exampleCopy.en.trim(), ar: v.exampleCopy.ar.trim() }
          : undefined,
      ar:
        v.ar && isVoice(v.ar.technical) && isVoice(v.ar.business)
          ? {
              technical: v.ar.technical,
              business: v.ar.business,
              recommendation: typeof v.ar.recommendation === "string" && v.ar.recommendation.trim() ? v.ar.recommendation.trim() : undefined,
            }
          : undefined,
      E: num(v.E),
      C: num(v.C),
      T: num(v.T),
    });
  }
  return out;
}

/**
 * Escapes double quotes (and raw line breaks) that sit inside a JSON string
 * value. A quote is taken as the real end of a string only when what follows
 * it is JSON structure (, : } ] or the end); any other quote is content.
 * A heuristic, so the result still has to pass JSON.parse.
 */
export function repairJsonQuotes(text: string): string {
  const BACKSLASH = String.fromCharCode(92);
  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const code = text.charCodeAt(i);
    if (!inString) {
      out += ch;
      if (ch === '"') inString = true;
      continue;
    }
    if (ch === BACKSLASH) {
      out += ch + (text[i + 1] ?? "");
      i++;
    } else if (code === 10) {
      out += BACKSLASH + "n";
    } else if (code === 13) {
      // dropped
    } else if (code === 9) {
      out += BACKSLASH + "t";
    } else if (ch === '"') {
      let j = i + 1;
      while (j < text.length && text[j].trim() === "") j++;
      const next = text[j];
      if (next === undefined || next === "," || next === ":" || next === "}" || next === "]") {
        out += ch;
        inString = false;
      } else {
        out += BACKSLASH + '"';
      }
    } else {
      out += ch;
    }
  }
  return out;
}

function tryRepair(raw: string, brief = false): JudgeVerdict[] | null {
  try {
    const inner: unknown = JSON.parse(raw)?.result;
    if (typeof inner !== "string") return null;
    const start = inner.indexOf("{");
    const end = inner.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    const verdicts = parseVerdicts(JSON.parse(repairJsonQuotes(inner.slice(start, end + 1))), brief);
    return verdicts.length > 0 ? verdicts : null;
  } catch {
    return null;
  }
}

// Bilingual answers for 30+ rules in one call get long enough to time out
// or break; split the full review into batches of this size. The brief
// competitor benchmark (status only) always runs as one call.
const BATCH_SIZE = 16;

export interface JudgeOptions {
  brief?: boolean;
}

export async function runJudge(
  evidence: StoreEvidence,
  rules: Array<{ rule: FudRule; signal: SignalState }>,
  ga4: Ga4Metrics | null | undefined,
  jobId: string,
  opts: JudgeOptions = {},
): Promise<JudgeVerdict[]> {
  if (rules.length === 0) return [];
  if (opts.brief || rules.length <= BATCH_SIZE) return judgeOnce(evidence, rules, ga4, jobId, opts.brief ?? false, "");
  // Even halves, so neither batch is a lonely leftover.
  const batches = Math.ceil(rules.length / BATCH_SIZE);
  const size = Math.ceil(rules.length / batches);
  const out: JudgeVerdict[] = [];
  for (let i = 0; i < batches; i++) {
    out.push(...(await judgeOnce(evidence, rules.slice(i * size, (i + 1) * size), ga4, `${jobId}-b${i + 1}`, false, ` batch ${i + 1}/${batches}`)));
  }
  return out;
}

async function judgeOnce(
  evidence: StoreEvidence,
  rules: Array<{ rule: FudRule; signal: SignalState }>,
  ga4: Ga4Metrics | null | undefined,
  jobId: string,
  brief: boolean,
  labelSuffix: string,
): Promise<JudgeVerdict[]> {
  const mcp = await buildMcpConfig(`${jobId}-fud`, { ga4Admin: false, gtm: false, browser: false });
  const prompt = buildJudgePrompt(evidence, rules, ga4, brief);
  try {
    // One retry, and only for a malformed answer: a long bilingual JSON
    // occasionally breaks on a stray quote. Timeouts and rate limits are not
    // retried — the pass just ships without its section.
    for (let attempt = 1; ; attempt++) {
      const raw = await runClaudeHeadless({
        prompt,
        mcpConfigPath: mcp.configPath,
        allowedTools: [],
        timeoutMs: JUDGE_TIMEOUT_MS,
        effort: brief ? "low" : "medium",
        label: `fud-judge${brief ? " competitor" : ""} (${rules.length} rules)${labelSuffix}${attempt > 1 ? " retry" : ""}`,
      });
      try {
        return parseVerdicts(extractJsonPayload(raw), brief);
      } catch (err) {
        // Before paying for a second call, try the cheap fix: the usual
        // breakage is a bare double quote inside a text value.
        const repaired = tryRepair(raw, brief);
        if (repaired) {
          console.warn("[audit-worker] FUD judge JSON needed a quote repair; no retry needed.");
          return repaired;
        }
        if (process.env.FUD_DEBUG_DIR) {
          await writeFile(path.join(process.env.FUD_DEBUG_DIR, `fud-judge-raw-${jobId}-${attempt}.json`), raw, "utf8").catch(() => {});
        }
        if (attempt >= 2 || !/JSON|findings array/i.test(err instanceof Error ? err.message : String(err))) throw err;
        console.warn(`[audit-worker] FUD judge returned malformed JSON, retrying once: ${err instanceof Error ? err.message.slice(0, 160) : err}`);
      }
    }
  } finally {
    await mcp.cleanup();
  }
}
