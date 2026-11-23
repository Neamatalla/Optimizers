import { mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { extractJsonPayload, runClaudeHeadless } from "../claude.js";
import { buildMcpConfig } from "../mcp-config.js";
import { ga4FactsPromptBlock } from "../ga4-facts.js";
import { marketHint, pageBlock, repairJsonQuotes, storeBlock } from "../fud/judge.js";
import { arabicRegisterRule, type AudienceRole } from "../audience.js";
import type { StoreEvidence } from "../fud/evidence.js";
import type { Ga4Facts, SiteChecks } from "../types.js";
import type { AuditPoint } from "./types.js";
import type { RuleResult } from "./rules/types.js";
import { parseGtm } from "./gtm.js";
import { AI_GUIDES } from "./ai-guides.js";

/**
 * The AI-judged points (decidedBy "code+ai" or "ai"): Claude reads what our
 * own visit captured plus the GA4 and GTM facts code already pulled, and
 * returns per point a status and one short observation in English and
 * Arabic. No tools, no browsing. The rest of the report text is fixed
 * (templates, {observation} slot).
 */

const TIMEOUT_MS = 8 * 60 * 1000;
// Text points per call: one call for all of them, normally (the follow-up
// call picks up any it leaves out). The visual points get their own call.
const BATCH = 90;
const NL = "\n";
// How long later batches wait for the first to write the shared evidence to
// the prompt cache (it is readable once the first answer starts).
const STAGGER_MS = Number(process.env.POINTS_STAGGER_MS ?? 12_000);

export interface JudgeContext {
  website: string;
  evidence: StoreEvidence | null;
  ga4: Ga4Facts | null;
  gtm: unknown;
  siteChecks: SiteChecks | null;
  role: AudienceRole | null;
  adContext?: { text: string | null; coupon: string | null } | null;
  // Code points the rule couldn't settle: why, so the AI knows what's missing.
  hints?: Record<string, string>;
  // The returns and shipping policy pages' text (pipeline.ts fetchPolicies).
  policies?: Array<{ kind: string; url: string; text: string }>;
}

function gtmBlock(raw: unknown): string {
  const g = parseGtm(raw);
  if (!g) return "No GTM container access for this store.";
  const tag = (t: (typeof g.tags)[number]) => JSON.stringify(t);
  return [
    `GTM container: ${g.tags.length} tags.`,
    ...g.tags.slice(0, 80).map(tag),
    g.unreadable.length ? `Custom HTML tags we could not read: ${g.unreadable.join(", ")}` : "",
  ].filter(Boolean).join("\n");
}

function trackingBlock(s: SiteChecks | null): string {
  if (!s) return "No tracking data from the visit.";
  const lines: string[] = [];
  if (s.pixelMap) {
    lines.push(`IDs seen: ${Object.entries(s.pixelMap.ids).map(([k, v]) => `${k}=${v.join("/")}`).join(", ") || "none"}`);
    for (const p of s.pixelMap.pages) lines.push(`${p.pageType}: ${p.hits.map(h => `${h.vendor}:${h.name}×${h.count}`).join(", ") || "no hits"}`);
  } else lines.push("No pixel hits recorded.");
  if (s.atcEvents) lines.push(`after Add to cart: dataLayer [${s.atcEvents.dataLayer.join(", ")}], GA4 [${s.atcEvents.ga4.join(", ")}], pixels [${s.atcEvents.pixels.join(", ")}]`);
  lines.push(`add to cart: ${s.addToCart.attempted ? (s.addToCart.ok ? "worked" : `failed (${s.addToCart.reason ?? "?"})`) : "not attempted"}`);
  lines.push(`platform guess: ${s.platform ?? "unknown"}`);
  return lines.join("\n");
}

function paidBlock(ga4: Ga4Facts | null): string {
  if (!ga4?.campaigns?.length) return "";
  const rows = ga4.campaigns.slice(0, 15).map(c => `${c.channel} | ${c.source} / ${c.medium} | ${c.campaign} | visits ${c.sessions}, cart adds ${c.adds}, sales ${c.sales}`);
  return `GA4 traffic by channel / source / medium / campaign (top 15):\n${rows.join("\n")}`;
}

/**
 * The part every batch shares: instructions and all the evidence. It goes in
 * the system prompt (a file), so the second call reads it from the prompt
 * cache instead of paying to write it again.
 */
export function buildSharedPrompt(ctx: JudgeContext): string {
  const e = ctx.evidence;
  const ad = ctx.adContext?.text || ctx.adContext?.coupon ? `The reader's ad: headline/offer «${ctx.adContext?.text ?? ""}»${ctx.adContext?.coupon ? `, coupon «${ctx.adContext.coupon}»` : ""}.` : "";

  return `You are a senior CRO and tracking auditor. You judge audit points for one e-commerce store, from the evidence below only. The store sells in ${marketHint(ctx.website)}. Shoppers there expect cash on delivery, local instalments (Tabby, Tamara, valU), WhatsApp support and Arabic or bilingual copy: treat these as valid answers.

You cannot browse. The evidence is what our own phone visit (390px) captured, plus the GA4 facts and the GTM container that code pulled from the store's accounts.

HOW TO DECIDE
- "pass": the evidence shows the rule is met. "fail": the evidence clearly shows it is not met.
- "unverified": the page or data the point needs is missing, or the evidence can't settle it. Never guess a pass or a fail.
- Every part of the PASS line must be shown by the evidence. If you can see one part but not another (for example the price but not its change per variant), answer unverified. Never pass on the part you can see.
- A point you can't prove either way is unverified. That is a good answer, not a failure: a browser step may test it next.
- "n/a": the point genuinely doesn't apply to this store (for example no sizes, no paid traffic for a paid-traffic point).
- Text may be Arabic, English or both. Missing English is not a fail if the Arabic says it.
- Never invent facts, numbers or policies.

WRITING
- en: one or two short sentences (max 30 words) saying what you saw on THIS store that decides it: where, and the exact wording or value. Plain words. No advice, no "should": the fix is written elsewhere.
- ar: the same in plain Modern Standard Arabic. Keep tool names in Latin script.${arabicRegisterRule(ctx.role) ? ` ${arabicRegisterRule(ctx.role)}` : ""}
- Never write block ids in the text. Quote store wording with « ».

OUTPUT
Return ONLY a JSON object, no prose, no markdown fence. Valid JSON: never use the double-quote character inside text values, no line breaks inside strings.
{"points": [{"id": "PATH-01", "status": "pass|fail|unverified|n/a", "en": "", "ar": ""}]}
Exactly one entry per point you are asked about.
${ad ? `
${ad}
` : ""}
GA4
${ctx.ga4 ? ga4FactsPromptBlock(ctx.ga4) : "No GA4 access for this store."}
${paidBlock(ctx.ga4)}

GTM
${gtmBlock(ctx.gtm)}

TRACKING SEEN DURING THE VISIT
${trackingBlock(ctx.siteChecks)}

STORE FACTS
${e ? storeBlock(e) : "No store visit."}

POLICY PAGES
${ctx.policies?.length ? ctx.policies.map(p => `### ${p.kind.toUpperCase()} POLICY (${p.url})${NL}${p.text}`).join(NL + NL) : "Not opened (no returns or shipping link found, or the page didn't load)."}

PAGES
${e ? e.pages.map(pageBlock).join(NL) : "No pages: the store visit failed."}${e?.cartDrawer ? `${NL}CART DRAWER (what opened right after Add to Cart, before the full cart page above):${NL}${pageBlock(e.cartDrawer)}` : ""}`;
}

/** The part each batch asks: its own points. */
export function buildPointsAsk(points: AuditPoint[], hints: Record<string, string> = {}, pictures: Picture[] = []): string {
  const list = points.map(p => [
    `- ${p.id} — ${p.title} (pages: ${p.pages.join(", ")}; needs: ${p.needs.join(", ")})`,
    `  PASS when: ${p.rule}`,
    p.note ? `  Note: ${p.note}` : "",
    AI_GUIDES[p.id] ? `  How to decide: ${AI_GUIDES[p.id]}` : "",
    hints[p.id] ? `  Our code check could not settle it: ${hints[p.id]} Judge it from the evidence and the pictures if you can; otherwise unverified.` : "",
  ].filter(Boolean).join(NL)).join(NL);
  const look = pictures.length
    ? `These points depend on how the pages look. FIRST open every picture below with the Read tool, all in one go, then judge from the pictures and the text together (layout, colours, contrast, button styling, what sits on the first screen).${NL}${pictures.map(p => `- ${p.file}: ${p.what}`).join(NL)}${NL}${NL}`
    : "";
  return `${look}Judge these audit points from the evidence in your instructions.

POINTS TO JUDGE
${list}

Return the JSON object, exactly one entry per point (${points.map(p => p.id).join(", ")}).`;
}

const STATUSES = new Set(["pass", "fail", "unverified", "n/a"]);

export function parsePointVerdicts(raw: unknown, ids: string[]): Record<string, RuleResult> {
  const arr = (raw as any)?.points;
  if (!Array.isArray(arr)) throw new Error("AI points answer has no points array (JSON)");
  const out: Record<string, RuleResult> = {};
  const want = new Set(ids);
  for (const v of arr) {
    if (!v || typeof v.id !== "string" || !want.has(v.id) || !STATUSES.has(v.status)) continue;
    const en = typeof v.en === "string" ? v.en.trim() : "";
    const ar = typeof v.ar === "string" ? v.ar.trim() : "";
    out[v.id] = { status: v.status, reason: en || "Judged by AI from the visit.", observation: { ...(en && { en }), ...(ar && { ar }) } };
  }
  return out;
}

async function judgeBatch(points: AuditPoint[], systemPromptFile: string, jobId: string, label: string, hints: Record<string, string> = {}, pictures: Picture[] = []): Promise<Record<string, RuleResult>> {
  const picturesDir = pictures.length ? path.dirname(pictures[0].file) : null;
  const mcp = await buildMcpConfig(`${jobId}-points`, { ga4Admin: false, gtm: false, browser: false });
  const prompt = buildPointsAsk(points, hints, pictures);
  const ids = points.map(p => p.id);
  // Sonnet for every batch by default: on Regal (23 Nov) Haiku wrote 7x the
  // output for the text points, took 2.5 min, and can't share Sonnet's cache.
  // POINTS_AI_MODEL=writer moves every batch to CLAUDE_WRITER_MODEL.
  const model = process.env.POINTS_AI_MODEL === "writer" ? "writer" : "main";
  try {
    for (let attempt = 1; ; attempt++) {
      const raw = await runClaudeHeadless({
        prompt,
        mcpConfigPath: mcp.configPath,
        // Read only, and only for the pictures folder.
        allowedTools: picturesDir ? ["Read"] : [],
        // Keep the CLI's built-in tool definitions on both calls, so the
        // picture call reads the evidence the text call cached. Dropping them
        // on the text call alone broke that sharing (Regal, 23 Nov: +$0.13),
        // and on the picture call it cost 8x.
        builtinTools: null,
        ...(picturesDir && { addDirs: [picturesDir] }),
        timeoutMs: TIMEOUT_MS,
        effort: "low",
        model,
        systemPromptFile,
        label: `points-judge (${points.length} points)${label}${attempt > 1 ? " retry" : ""}`,
      });
      // POINTS_DEBUG_DIR: keep Claude's raw answer, to see why a point got no verdict.
      if (process.env.POINTS_DEBUG_DIR) await writeFile(path.join(process.env.POINTS_DEBUG_DIR, `points-judge-${jobId}-${attempt}.json`), raw, "utf8").catch(() => {});
      try {
        return parsePointVerdicts(extractJsonPayload(raw), ids);
      } catch (err) {
        // The cheap fix first: a bare double quote inside a text value.
        try {
          const inner: unknown = JSON.parse(raw)?.result;
          if (typeof inner === "string") {
            const s = inner.indexOf("{"), end = inner.lastIndexOf("}");
            if (s >= 0 && end > s) return parsePointVerdicts(JSON.parse(repairJsonQuotes(inner.slice(s, end + 1))), ids);
          }
        } catch {
          // fall through to one retry
        }
        if (attempt >= 2) throw err;
        console.warn(`[audit-worker] Points judge returned malformed JSON, retrying once: ${err instanceof Error ? err.message.slice(0, 160) : err}`);
      }
    }
  } finally {
    await mcp.cleanup();
  }
}

/**
 * Judges the given points. A batch that fails leaves its points unverified
 * with the error, so the run still ships.
 */
export async function judgePoints(points: AuditPoint[], ctx: JudgeContext, jobId: string): Promise<Record<string, RuleResult>> {
  if (!points.length) return {};
  // The points that depend on how the page looks get their own batch, the
  // only one that opens the visit's pictures (each picture costs turns and
  // tokens). The rest are split into batches of up to BATCH.
  const visual = points.filter(p => VISUAL_POINTS.has(p.id));
  const rest = points.filter(p => !VISUAL_POINTS.has(p.id));
  const n = Math.ceil(rest.length / BATCH);
  const size = Math.ceil(rest.length / Math.max(n, 1));
  const batches = Array.from({ length: n }, (_, i) => rest.slice(i * size, (i + 1) * size));
  // The shared evidence, written once. Later batches start STAGGER_MS after
  // the first, once it has written the prompt cache, so they read it.
  const dir = await mkdtemp(path.join(os.tmpdir(), "points-judge-"));
  const shared = path.join(dir, "evidence.md");
  await writeFile(shared, buildSharedPrompt(ctx), "utf8");
  if (process.env.POINTS_DEBUG_DIR) await writeFile(path.join(process.env.POINTS_DEBUG_DIR, `points-prompt-${jobId}.md`), buildSharedPrompt(ctx), "utf8").catch(() => {});
  try {
    const pictures = visual.length ? await writePictures(ctx.evidence, dir) : [];
    const all = visual.length ? [...batches, visual] : batches;
    return await judgeAll(points, all, shared, jobId, ctx.hints ?? {}, visual.length ? { index: all.length - 1, pictures } : null);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

// Points judged from the pictures as well as the text (how the page looks).
export const VISUAL_POINTS = new Set([
  "PATH-04", "PATH-17", "PDP-03", "PDP-04", "PDP-14", "PDP-19", "HOME-01", "HOME-04", "HOME-07", "HOME-08",
  "NAV-08", "TRUST-03", "TRUST-14", "TRUST-21", "OFFER-12", "LAND-04", "LAND-08", "RISK-05", "RISK-08", "RISK-11",
]);

interface Picture { file: string; what: string }

const CROP_LABEL: Record<string, string> = { fold: "first phone screen", cta: "around the main buy button", cart: "the cart after adding one item" };

/** The visit's page crops (data URIs) as JPEG files the AI can open. */
async function writePictures(e: StoreEvidence | null, dir: string): Promise<Picture[]> {
  const out: Picture[] = [];
  for (const p of e?.pages ?? []) {
    for (const [kind, uri] of Object.entries(p.crops ?? {})) {
      const m = typeof uri === "string" ? /^data:image\/(jpeg|png);base64,(.+)$/.exec(uri) : null;
      if (!m) continue;
      const file = path.join(dir, `${p.pageType}-${kind}.${m[1] === "png" ? "png" : "jpg"}`);
      await writeFile(file, Buffer.from(m[2], "base64"));
      out.push({ file, what: `${p.pageType} page, ${CROP_LABEL[kind] ?? kind}` });
    }
  }
  return out;
}

async function judgeAll(points: AuditPoint[], batches: AuditPoint[][], shared: string, jobId: string, hints: Record<string, string>, visual: { index: number; pictures: Picture[] } | null): Promise<Record<string, RuleResult>> {
  const n = batches.length;
  const settled = await Promise.allSettled(batches.map(async (b, i) => {
    if (i > 0) await new Promise(r => setTimeout(r, STAGGER_MS));
    const pics = visual?.index === i ? visual.pictures : [];
    return judgeBatch(b, shared, `${jobId}-b${i + 1}`, `${n > 1 ? ` batch ${i + 1}/${n}` : ""}${pics.length ? ` with ${pics.length} pictures` : ""}`, hints, pics);
  }));
  const out: Record<string, RuleResult> = {};
  settled.forEach((s, i) => {
    if (s.status === "fulfilled") Object.assign(out, s.value);
    else console.warn(`[audit-worker] Points judge batch ${i + 1} failed: ${s.reason instanceof Error ? s.reason.message : s.reason}`);
  });
  // One more call for the points an answer left out (a long answer can stop
  // early), unless a whole batch failed for a reason a retry won't fix.
  const left = points.filter(p => !out[p.id]);
  if (left.length && left.length < points.length) {
    console.warn(`[audit-worker] Points judge left out ${left.length} points (${left.map(p => p.id).join(", ")}); asking again for those`);
    try {
      Object.assign(out, await judgeBatch(left, shared, `${jobId}-missing`, " missing", hints, left.some(p => VISUAL_POINTS.has(p.id)) ? visual?.pictures ?? [] : []));
    } catch (err) {
      console.warn(`[audit-worker] Points judge follow-up failed: ${err instanceof Error ? err.message : err}`);
    }
  }
  for (const p of points) out[p.id] ??= { status: "unverified", reason: "The AI gave no verdict for this point." };
  return out;
}

// ---- Browser step ----
// The points the evidence couldn't settle go to one more call that has a real
// headless browser (chrome-devtools MCP). It may look, scroll, tap and read
// the page code. It may type only a product name into the store's own search
// box. It may not fill any other field or submit anything, so it can't create
// an account, send a message or place an order.
const BROWSER_TOOLS = [
  "navigate_page", "new_page", "list_pages", "select_page", "close_page", "take_snapshot", "take_screenshot",
  "click", "hover", "press_key", "wait_for", "resize_page", "emulate", "evaluate_script", "get_css_styles",
  "list_network_requests", "get_network_request", "handle_dialog", "fill", "type_text",
].map(t => `mcp__chrome-devtools__${t}`);
// Points per browser call, most severe first. Each one costs browsing turns.
// 15 at effort low tried about one action per point (Regal, 23 Nov).
// 8 points on Sonnet cost about $0.60 and settled 1 to 4 (Regal, 23 Nov).
// 5 on the writer model cost about $0.04 (Regal, 23 Nov), so every open
// point on the list can get a try.
export const BROWSER_MAX_POINTS = Number(process.env.POINTS_BROWSER_MAX ?? 10);
const BROWSER_TIMEOUT_MS = 10 * 60 * 1000;

export function browserStepOn(): boolean {
  return (process.env.POINTS_BROWSER ?? "on").trim().toLowerCase() !== "off";
}

// The points a few taps can settle. Regal (23 Nov) runs 3-5: the browser
// never settled landing-page points (it can't find the landing page),
// leftover scripts or checkout, and spent most of its turns there.
export const BROWSER_POINTS = new Set([
  "OFFER-02", "PDP-03", "PDP-04", "PDP-13", "PDP-14", "COL-01", "COL-07", "PATH-09", "PATH-10", "PATH-14", "PATH-17",
  "NAV-03", "NAV-12", "TRUST-05", "TRUST-06", "TRUST-08", "TRUST-10", "OFFER-01", "OFFER-05", "OFFER-07", "OFFER-11", "OFFER-12", "OFFER-17",
]);

/** The points a browser could settle: unverified, on the browser list, not blocked by a log-in. */
export function browsable(p: AuditPoint, r: RuleResult | undefined): boolean {
  if (!BROWSER_POINTS.has(p.id)) return false;
  if (!r || r.status !== "unverified" || r.facts?.blockedBy) return false;
  // Tracking and account points need GTM, GA4 or Clarity data, which this
  // step doesn't get (Regal, 23 Nov: TRK-15, LAND-01, RISK-01 came back open).
  if (p.category === "tracking" || p.needs.some(n => n === "ga4" || n === "gtm" || n === "clarity")) return false;
  // A point that needs the checkout form can't be reached without typing.
  if (p.pages.includes("checkout") && !p.pages.some(x => x === "cart" || x === "product")) return false;
  return p.needs.some(n => n === "visit" || n === "crawl");
}

export function buildBrowserPrompt(website: string, points: AuditPoint[], reasons: Record<string, string>, extra = ""): string {
  const list = points.map(p => [
    `- ${p.id} — ${p.title} (pages: ${p.pages.join(", ")})`,
    `  PASS when: ${p.rule}`,
    AI_GUIDES[p.id] ? `  How to decide: ${AI_GUIDES[p.id]}` : "",
    `  Why it is still open: ${reasons[p.id] ?? "the evidence didn't show it."}`,
  ].filter(Boolean).join(NL)).join(NL);
  return `You are a CRO auditor with a real browser. Our first pass couldn't settle the points below from the saved evidence. Open the store and test each one yourself.

Store: ${website}
${extra}
HOW TO BROWSE
- First call emulate with a 390x844 phone viewport (mobile, touch), then open the page each point needs.
- Keep what you read small: every tool result is re-read on each later turn, so big ones cost a lot. To read a page, use evaluate_script that returns only the short text or numbers you need (under 2,000 characters). Use take_snapshot only to find something to tap, and take a screenshot only when the point is about how something looks.
- You may scroll, tap buttons, open menus, drawers, tabs and variant options, look at images with a screenshot, and add one item to the cart.
- The only typing allowed: a product name into the store's own search box, to test search.
- Never type into any other field, fill a form, log in, submit anything or place an order. If a point needs that, answer unverified and say so.
- Close pop-ups (press Escape or tap ×) when they block the page.
- Do the test each point needs before you answer. "I did not check" or "I did not search" is never a reason: if the action is allowed, do it. Answer unverified only after you tried and couldn't see the answer.
- Group points that use the same page, so you open each page once.
- Budget: about 40 tool calls in total. Every call re-reads all earlier results, so stop when the budget is spent and answer unverified for what's left.

HOW TO DECIDE
- "pass" or "fail" only for what you saw yourself in the browser. Every part of the PASS line must be seen.
- A fail needs proof too. If the rule allows several places (for example cart or checkout), check them all before failing. If your own tap or click didn't work, that is unverified, not a fail: our headless browser may be the cause.
- "unverified" when you couldn't reach or see it. "n/a" when the point doesn't apply to this store.
- Never guess and never invent wording, numbers or policies.

WRITING
- en: one or two short sentences (max 30 words): what you saw that decides it, quoting store wording with « ». Say it was seen in the browser.
- ar: the same in plain Modern Standard Arabic.

POINTS
${list}

OUTPUT
When done, return ONLY a JSON object, no prose, no markdown fence. Never use the double-quote character inside text values.
{"points": [{"id": "${points[0]?.id ?? "PATH-01"}", "status": "pass|fail|unverified|n/a", "en": "", "ar": ""}]}
Exactly one entry per point (${points.map(p => p.id).join(", ")}).`;
}

const SEVERITY_ORDER = ["critical", "high", "medium", "low"];

/** Tests the still-open page points in a real browser. Points it can't settle stay as they were. */
export async function investigatePoints(points: AuditPoint[], reasons: Record<string, string>, ctx: { website: string; platform?: string | null }, jobId: string): Promise<Record<string, RuleResult>> {
  if (!points.length) return {};
  const picked = [...points].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)).slice(0, BROWSER_MAX_POINTS);
  const mcp = await buildMcpConfig(`${jobId}-browse`, { ga4Admin: false, gtm: false, browser: true });
  const ids = picked.map(p => p.id);
  try {
    const raw = await runClaudeHeadless({
      prompt: buildBrowserPrompt(ctx.website, picked, reasons, ctx.platform ? `Platform: ${ctx.platform}${NL}` : ""),
      mcpConfigPath: mcp.configPath,
      allowedTools: BROWSER_TOOLS,
      timeoutMs: BROWSER_TIMEOUT_MS,
      effort: "medium",
      // The writer model (Haiku in production): browsing is many cheap turns,
      // and the verdict rules above stay strict. POINTS_BROWSER_MODEL=main for Sonnet.
      model: process.env.POINTS_BROWSER_MODEL === "main" ? "main" : "writer",
      label: `points-browser (${picked.length} points)`,
    });
    if (process.env.POINTS_DEBUG_DIR) await writeFile(path.join(process.env.POINTS_DEBUG_DIR, `points-browser-${jobId}.json`), raw, "utf8").catch(() => {});
    let out: Record<string, RuleResult>;
    try {
      out = parsePointVerdicts(extractJsonPayload(raw), ids);
    } catch {
      const inner: unknown = JSON.parse(raw)?.result;
      const text = typeof inner === "string" ? inner : "";
      const s = text.indexOf("{"), end = text.lastIndexOf("}");
      out = s >= 0 && end > s ? parsePointVerdicts(JSON.parse(repairJsonQuotes(text.slice(s, end + 1))), ids) : {};
    }
    for (const r of Object.values(out)) r.facts = { ...r.facts, seenIn: "browser" };
    return out;
  } catch (err) {
    console.warn(`[audit-worker] Points browser step failed: ${err instanceof Error ? err.message : err}`);
    return {};
  } finally {
    await mcp.cleanup();
  }
}
