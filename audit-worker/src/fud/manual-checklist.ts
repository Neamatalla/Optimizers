import { arabicRegisterRule, type AudienceRole } from "../audience.js";
import { extractJsonPayload, runClaudeHeadless } from "../claude.js";
import { buildMcpConfig } from "../mcp-config.js";
import type { ManualChecklistResult, ManualExplain, ManualShownVerdict, ManualText, ManualVerdict } from "../types.js";
import type { StoreEvidence } from "./evidence.js";
import { marketHint, pageBlock, storeBlock } from "./judge.js";
import type { ManualCheckpoint } from "./manual-checklist-data.js";
import { CODES, MANUAL_CHECKLIST_VERSION, isShown, pagesForTab, runnableCheckpoints } from "./manual-checklist-score.js";

export * from "./manual-checklist-score.js";

/**
 * The CRO team's manual expert audit (manual-checklist-data.ts: all 377
 * checkpoints of "Optimizers - CRO Manual Audit Checklist.xlsx"), run by the
 * tool on the pages the friction pass captured. Two reviewer passes:
 *
 * 1. Verdicts: every checkpoint whose page was captured gets the sheet's
 *    verdict (well / adequately / badly / not implemented), or "doesn't
 *    apply" / "can't tell". Those two are dropped here, so the report only
 *    ever shows checkpoints that apply to this store and could be judged.
 * 2. Write-ups: every checkpoint not done well gets a long, plain-language
 *    explanation in English and Arabic: what we found, what it means, the
 *    problem, how to fix it (steps) and how to tell it's fixed.
 *
 * Never fatal: a failed call only leaves its checkpoints out.
 */

type Draft = { id: string; v: ManualVerdict; seen?: ManualText; t?: string };

function pagesText(e: StoreEvidence, items: ManualCheckpoint[], ad?: ChecklistAd): string {
  const pages = new Set(items.flatMap(i => pagesForTab(i.tab)));
  return e.pages.filter(p => p.loaded && pages.has(p.pageType)).map(pageBlock).join("\n") + adText(items, ad);
}

/** The ad the reader typed on the form, for landing-page checkpoints (round 20). */
export type ChecklistAd = { text: string | null; coupon: string | null } | null | undefined;
function adText(items: ManualCheckpoint[], ad: ChecklistAd): string {
  if (!ad || (!ad.text && !ad.coupon) || !items.some(i => i.tab === "Landing Pages")) return "";
  return `\n### THE AD THAT SENDS TRAFFIC TO THE LANDING PAGES (typed by the store's media buyer)\n${ad.text ? `What the ad promises: ${JSON.stringify(ad.text)}\n` : ""}${ad.coupon ? `Coupon code in the ad: ${JSON.stringify(ad.coupon)}\n` : ""}Use it for checkpoints about message match between the ad and the page.\n`;
}

// ---- pass 1: verdicts --------------------------------------------------------

export function buildVerdictPrompt(e: StoreEvidence, items: ManualCheckpoint[], role?: AudienceRole | null, ad?: ChecklistAd): string {
  const list = items.map(i => `- ${i.id} [${i.importance}] (${i.tab} › ${i.section}) ${i.checkpoint}\n  Pass looks like: ${i.pass}\n  How a specialist checks: ${i.how}`).join("\n");
  return `You are a senior CRO specialist at Optimizers running the agency's manual expert audit on an e-commerce store that sells in ${marketHint(e.website)}. You can't browse: below is everything our phone visit captured (page text in reading order, layout facts, widgets, links). Judge each checkpoint from this evidence only.

## Store-wide facts
${storeBlock(e)}

## Pages captured
${pagesText(e, items, ad)}

## Checkpoints
${list}

## How to answer
For EVERY checkpoint above, give one verdict code:
- W = implemented well: exactly what "Pass looks like" describes.
- A = implemented adequately: there and working, but could be clearer, closer to the button, or more convincing.
- B = implemented badly: exists but hidden, confusing, wrong or broken.
- N = not implemented: the captured pages clearly lack it.
- X = doesn't apply to this store (e.g. size help for a product with no sizes, a subscription option for a one-off product, a mega-menu for a store with 4 products). Use X freely when the checkpoint makes no sense for this kind of store.
- U = can't tell from this evidence (it needs a click, hover, test order, image, another page or the admin). Use U rather than guessing. Never mark N just because something wasn't captured.

X and U are dropped from the client's report, so only W, A, B and N need notes.
"en": one line in English, what you saw, quoting the store's own words when useful (25 words or fewer).
"ar": the same line in Arabic. ${arabicRule(role)}
"t": the checkpoint itself rewritten as a short Arabic title (10 words or fewer).

Answer with JSON only, no prose before or after:
{"items":[{"id":"SW-001","v":"N","en":"...","ar":"...","t":"..."}]}`;
}

export function parseVerdicts(raw: unknown, ids: string[]): Draft[] {
  const arr = raw && typeof raw === "object" && Array.isArray((raw as { items?: unknown }).items) ? (raw as { items: unknown[] }).items : null;
  if (!arr) throw new Error("checklist verdicts: no items array");
  const want = new Set(ids);
  const out = new Map<string, Draft>();
  for (const x of arr) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    const v = typeof o.v === "string" ? CODES[o.v.trim().toUpperCase()] : undefined;
    if (!want.has(id) || !v || out.has(id)) continue;
    const s = (k: string) => (typeof o[k] === "string" && (o[k] as string).trim() ? (o[k] as string).trim().slice(0, 400) : "");
    const en = s("en"), ar = s("ar"), t = s("t");
    out.set(id, { id, v, ...(en || ar ? { seen: { en, ar: ar || en } } : {}), ...(t ? { t } : {}) });
  }
  // Anything the reviewer skipped can't be told.
  return ids.map(id => out.get(id) ?? { id, v: "unknown" as const });
}

// ---- pass 2: the long write-ups -------------------------------------------------

function arabicRule(role: AudienceRole | null | undefined): string {
  return arabicRegisterRule(role) ?? "Write natural, plain Arabic a store owner in Egypt or the Gulf reads easily. Keep tool, app and code names in Latin script.";
}

export function buildExplainPrompt(e: StoreEvidence, items: Array<{ c: ManualCheckpoint; d: Draft }>, role?: AudienceRole | null, ad?: ChecklistAd): string {
  const verdictWord: Record<string, string> = { adequate: "implemented adequately", badly: "implemented badly", missing: "not implemented" };
  const list = items.map(({ c, d }) => `### ${c.id} [${c.importance}] ${c.tab} › ${c.section}
Checkpoint: ${c.checkpoint}
Why it matters (agency's note): ${c.why}
How a specialist checks: ${c.how}
Pass looks like: ${c.pass}
Reference: ${c.ref}
Verdict on this store: ${verdictWord[d.v] ?? d.v}
What the first review saw: ${d.seen?.en ?? "(no note)"}`).join("\n\n");
  return `You are a senior CRO specialist at Optimizers. The checkpoints below did not pass on this store (it sells in ${marketHint(e.website)}). Write the explanation the client will read in their audit report. The reader is busy and not technical. They must finish each one knowing exactly what the point says, what it means, what is wrong on their store, and how to fix it.

## Store-wide facts
${storeBlock(e)}

## Pages captured on a phone
${pagesText(e, items.map(i => i.c), ad)}

## Checkpoints to explain
${list}

## What to write for each checkpoint
- "title": the problem on THIS store as a plain headline (12 words or fewer), e.g. "Shoppers can't see the delivery cost until checkout".
- "found": 2-4 sentences. What we saw on this store, specifically. Name the page and where on it. Quote the store's own words in quotation marks when that helps.
- "means": 3-5 sentences. What this checkpoint is about and why it matters to a shopper deciding to buy, and what it does to sales. Use the agency's note, but explain it for this store.
- "problem": 2-4 sentences. The exact issue on this store and what it costs: which shoppers it loses, at which step.
- "fix": 3-6 steps, in order. Each step is one or two sentences and says exactly what to change and where (which page, which part of the page, which setting or app if the platform makes it obvious). Include one example line of copy the store can paste when the fix is a wording change.
- "done": 1-2 sentences. How the store can check it's fixed, based on "Pass looks like".

Rules:
- Plain words. Short sentences, one idea each, 14 words or fewer. No semicolons.
- Explain any term the first time you use it, e.g. "above the fold (the part of the page you see before scrolling)".
- Only state facts the evidence shows. Never invent numbers, reviews, policies or prices. Example copy may use placeholders like [X days].
- Don't repeat the same sentence across fields. Each field adds something new.
- "en" is English. "ar" is the same content in Arabic, written naturally, not word for word. ${arabicRule(role)}

Answer with JSON only, no prose before or after:
{"items":[{"id":"PDP-002","title":{"en":"...","ar":"..."},"found":{"en":"...","ar":"..."},"means":{"en":"...","ar":"..."},"problem":{"en":"...","ar":"..."},"fix":{"en":["...","..."],"ar":["...","..."]},"done":{"en":"...","ar":"..."}}]}`;
}

const MAX_FIELD = 1600;
function text(o: unknown): ManualText | null {
  if (!o || typeof o !== "object") return null;
  const r = o as Record<string, unknown>;
  const en = typeof r.en === "string" ? r.en.trim().slice(0, MAX_FIELD) : "";
  const ar = typeof r.ar === "string" ? r.ar.trim().slice(0, MAX_FIELD) : "";
  return en ? { en, ar: ar || en } : null;
}
function steps(o: unknown): { en: string[]; ar: string[] } | null {
  if (!o || typeof o !== "object") return null;
  const r = o as Record<string, unknown>;
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string" && s.trim().length > 0).map(s => s.trim().slice(0, 600)).slice(0, 8) : []);
  const en = list(r.en), ar = list(r.ar);
  return en.length ? { en, ar: ar.length ? ar : en } : null;
}

export function parseExplains(raw: unknown, ids: string[]): Map<string, ManualExplain> {
  const arr = raw && typeof raw === "object" && Array.isArray((raw as { items?: unknown }).items) ? (raw as { items: unknown[] }).items : null;
  if (!arr) throw new Error("checklist write-ups: no items array");
  const want = new Set(ids);
  const out = new Map<string, ManualExplain>();
  for (const x of arr) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id.trim() : "";
    if (!want.has(id) || out.has(id)) continue;
    const title = text(o.title), found = text(o.found), means = text(o.means), problem = text(o.problem), fix = steps(o.fix), done = text(o.done);
    // A write-up is all or nothing: half an explanation reads worse than the short note.
    if (title && found && means && problem && fix && done) out.set(id, { title, found, means, problem, fix, done });
  }
  return out;
}

// ---- batching and the run ------------------------------------------------------

// Verdicts are short: ~40 checkpoints per call. Write-ups are long and in two
// languages: 10 per call is about 19K output tokens, well inside the output
// limit. Every call re-sends the page text (~11K tokens), so fewer, bigger
// calls cost less: at 4 per call, an audit took ~43 write-up calls.
const VERDICT_BATCH = 40;
const EXPLAIN_BATCH = 10;
const CONCURRENCY = 3;
const TIMEOUT_MS = 12 * 60 * 1000;

/** A tab never splits across calls unless it is bigger than one call; small tabs share one. */
export function batchesOf<T>(items: T[], tabOf: (x: T) => string, size: number): T[][] {
  const out: T[][] = [];
  for (const tab of [...new Set(items.map(tabOf))]) {
    const list = items.filter(i => tabOf(i) === tab);
    if (out.length && out[out.length - 1].length + list.length <= size) { out[out.length - 1].push(...list); continue; }
    for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  }
  return out;
}

async function pool<T, R>(jobs: T[], n: number, run: (job: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(jobs.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, jobs.length) }, async () => {
    while (next < jobs.length) { const i = next++; out[i] = await run(jobs[i], i); }
  }));
  return out;
}

/** The saved result: only shown verdicts, each with its write-up when it isn't "well". */
export function finalize(drafts: Draft[], explains: Map<string, ManualExplain>, ran: number, failedBatches: number): ManualChecklistResult {
  const items: ManualChecklistResult["items"] = [];
  for (const d of drafts) {
    if (!isShown(d.v)) continue;
    const v: ManualShownVerdict = d.v;
    const x = explains.get(d.id);
    items.push({ id: d.id, v, ...(d.seen ? { seen: d.seen } : {}), ...(d.t ? { t: d.t } : {}), ...(x ? { x } : {}) });
  }
  return { version: MANUAL_CHECKLIST_VERSION, items, ran, dropped: ran - items.length, failedBatches };
}

export async function runManualChecklist(e: StoreEvidence, jobId: string, role?: AudienceRole | null, ad?: ChecklistAd): Promise<ManualChecklistResult> {
  const runnable = runnableCheckpoints(e);
  const byId = new Map(runnable.map(c => [c.id, c]));
  let failedBatches = 0;
  const mcp = await buildMcpConfig(`${jobId}-checklist`, { ga4Admin: false, gtm: false, browser: false });
  try {
    // Verdicts judge, so they keep medium effort. Write-ups only write up a
    // verdict already made, so low is enough.
    const call = async (prompt: string, label: string, effort: "low" | "medium") => extractJsonPayload(await runClaudeHeadless({
      prompt, mcpConfigPath: mcp.configPath, allowedTools: [], timeoutMs: TIMEOUT_MS, effort, model: "writer", label,
    }));

    // Pass 1: verdicts.
    const vb = batchesOf(runnable, c => c.tab, VERDICT_BATCH);
    const drafts = (await pool(vb, CONCURRENCY, async (list, i) => {
      const ids = list.map(c => c.id);
      try {
        return parseVerdicts(await call(buildVerdictPrompt(e, list, role, ad), `cro-checklist verdicts ${i + 1}/${vb.length} (${list.length})`, "medium"), ids);
      } catch (err) {
        failedBatches++;
        console.warn(`[audit-worker] CRO checklist verdict batch ${i + 1}/${vb.length} failed: ${err instanceof Error ? err.message.slice(0, 200) : err}`);
        return ids.map(id => ({ id, v: "unknown" as const }));
      }
    })).flat();

    // Pass 2: write-ups for everything shown that isn't done well.
    const toExplain = drafts.filter(d => isShown(d.v) && d.v !== "well").map(d => ({ c: byId.get(d.id)!, d }));
    const eb = batchesOf(toExplain, x => x.c.tab, EXPLAIN_BATCH);
    const explains = new Map<string, ManualExplain>();
    await pool(eb, CONCURRENCY, async (list, i) => {
      try {
        const got = parseExplains(await call(buildExplainPrompt(e, list, role, ad), `cro-checklist write-ups ${i + 1}/${eb.length} (${list.length})`, "low"), list.map(x => x.c.id));
        for (const [id, x] of got) explains.set(id, x);
      } catch (err) {
        // The checkpoints still show, with their one-line note.
        failedBatches++;
        console.warn(`[audit-worker] CRO checklist write-up batch ${i + 1}/${eb.length} failed: ${err instanceof Error ? err.message.slice(0, 200) : err}`);
      }
    });
    return finalize(drafts, explains, runnable.length, failedBatches);
  } finally {
    await mcp.cleanup();
  }
}
