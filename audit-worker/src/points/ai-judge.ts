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

/**
 * The AI-judged points (decidedBy "code+ai" or "ai"): Claude reads what our
 * own visit captured plus the GA4 and GTM facts code already pulled, and
 * returns per point a status and one short observation in English and
 * Arabic. No tools, no browsing. The rest of the report text is fixed
 * (templates, {observation} slot).
 */

const TIMEOUT_MS = 8 * 60 * 1000;
// Points per call. Two calls run side by side for the 82 points.
const BATCH = 45;

export interface JudgeContext {
  website: string;
  evidence: StoreEvidence | null;
  ga4: Ga4Facts | null;
  gtm: unknown;
  siteChecks: SiteChecks | null;
  role: AudienceRole | null;
  adContext?: { text: string | null; coupon: string | null } | null;
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

export function buildPointsPrompt(points: AuditPoint[], ctx: JudgeContext): string {
  const e = ctx.evidence;
  const list = points.map(p => [
    `- ${p.id} — ${p.title} (pages: ${p.pages.join(", ")}; needs: ${p.needs.join(", ")})`,
    `  PASS when: ${p.rule}`,
    p.note ? `  Note: ${p.note}` : "",
  ].filter(Boolean).join("\n")).join("\n");
  const ad = ctx.adContext?.text || ctx.adContext?.coupon ? `The reader's ad: headline/offer «${ctx.adContext?.text ?? ""}»${ctx.adContext?.coupon ? `, coupon «${ctx.adContext.coupon}»` : ""}.` : "";

  return `You are a senior CRO and tracking auditor. Judge each audit point below for one e-commerce store, from the evidence only. The store sells in ${marketHint(ctx.website)}. Shoppers there expect cash on delivery, local instalments (Tabby, Tamara, valU), WhatsApp support and Arabic or bilingual copy: treat these as valid answers.

You cannot browse. The evidence is what our own phone visit (390px) captured, plus the GA4 facts and the GTM container that code pulled from the store's accounts.

POINTS TO JUDGE
${list}

HOW TO DECIDE
- "pass": the evidence shows the rule is met. "fail": the evidence clearly shows it is not met.
- "unverified": the page or data the point needs is missing, or the evidence can't settle it. Never guess a pass or a fail.
- "n/a": the point genuinely doesn't apply to this store (for example no sizes, no paid traffic for a paid-traffic point).
- Text may be Arabic, English or both. Missing English is not a fail if the Arabic says it.
- Never invent facts, numbers or policies.

WRITING
- en: one or two short sentences (max 30 words) saying what you saw on THIS store that decides it: where, and the exact wording or value. Plain words. No advice, no "should": the fix is written elsewhere.
- ar: the same in plain Modern Standard Arabic. Keep tool names in Latin script.${arabicRegisterRule(ctx.role) ? ` ${arabicRegisterRule(ctx.role)}` : ""}
- Never write block ids in the text. Quote store wording with « ».
${ad ? `\n${ad}\n` : ""}
GA4
${ctx.ga4 ? ga4FactsPromptBlock(ctx.ga4) : "No GA4 access for this store."}
${paidBlock(ctx.ga4)}

GTM
${gtmBlock(ctx.gtm)}

TRACKING SEEN DURING THE VISIT
${trackingBlock(ctx.siteChecks)}

STORE FACTS
${e ? storeBlock(e) : "No store visit."}

PAGES
${e ? e.pages.map(pageBlock).join("\n") : "No pages: the store visit failed."}

OUTPUT
Return ONLY a JSON object, no prose, no markdown fence. Valid JSON: never use the double-quote character inside text values, no line breaks inside strings.
{"points": [{"id": "PATH-01", "status": "pass|fail|unverified|n/a", "en": "", "ar": ""}]}
Exactly one entry per point listed above (${points.map(p => p.id).join(", ")}).`;
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

async function judgeBatch(points: AuditPoint[], ctx: JudgeContext, jobId: string, label: string): Promise<Record<string, RuleResult>> {
  const mcp = await buildMcpConfig(`${jobId}-points`, { ga4Admin: false, gtm: false, browser: false });
  const prompt = buildPointsPrompt(points, ctx);
  const ids = points.map(p => p.id);
  const model = process.env.POINTS_AI_MODEL === "writer" ? "writer" : "main";
  try {
    for (let attempt = 1; ; attempt++) {
      const raw = await runClaudeHeadless({
        prompt,
        mcpConfigPath: mcp.configPath,
        allowedTools: [],
        timeoutMs: TIMEOUT_MS,
        effort: "low",
        model,
        label: `points-judge (${points.length} points)${label}${attempt > 1 ? " retry" : ""}`,
      });
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
  const n = Math.ceil(points.length / BATCH);
  const size = Math.ceil(points.length / n);
  const batches = Array.from({ length: n }, (_, i) => points.slice(i * size, (i + 1) * size));
  const settled = await Promise.allSettled(batches.map((b, i) => judgeBatch(b, ctx, `${jobId}-b${i + 1}`, n > 1 ? ` batch ${i + 1}/${n}` : "")));
  const out: Record<string, RuleResult> = {};
  settled.forEach((s, i) => {
    if (s.status === "fulfilled") Object.assign(out, s.value);
    else console.warn(`[audit-worker] Points judge batch ${i + 1} failed: ${s.reason instanceof Error ? s.reason.message : s.reason}`);
  });
  for (const p of points) out[p.id] ??= { status: "unverified", reason: "The AI gave no verdict for this point." };
  return out;
}
