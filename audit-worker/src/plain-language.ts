import { extractJsonPayload, runClaudeHeadless } from "./claude.js";
import { buildMcpConfig } from "./mcp-config.js";
import type { AuditResult, CategoryResult, FindingVoice } from "./types.js";

/**
 * Plain-language rewrite of the business voice of an existing audit's
 * findings, to the same reading level audit-prompt.ts's READING LEVEL rules
 * ask new audits for: a busy store owner, about grade 6-8, short sentences,
 * everyday words, no analytics jargon. For bringing results written before
 * those rules up to date; new audits get the rules in the main prompt and
 * don't need this pass.
 *
 * Same shape and contract as translate-ar.ts: one `claude -p` call per
 * category, no tools, effort "low", never throws. A finding is only
 * replaced when its rewrite keeps every number from the original (counts,
 * percentages, money), so a rewrite that drops or changes a fact leaves the
 * original text in place. Run translate-ar.ts afterwards so the Arabic
 * follows the new English.
 */

const PLAIN_TIMEOUT_MS = 8 * 60 * 1000;

interface Item {
  key: string;
  status: string;
  business: FindingVoice;
}

export interface PlainLanguageResult {
  rewritten: number;
  kept: number;
  total: number;
  error?: string;
}

function buildPrompt(items: Item[]): string {
  return `You are a copy editor. Below are findings from an analytics and conversion audit of an online store. Each has a "business" text (a one-line "summary" and a short "detail" paragraph) written for the store owner.

Rewrite each business text so a busy store owner who has never opened Google Analytics understands it on the first read, at about a grade 6-8 reading level.

Rules:
- Keep every fact and every number exactly (counts, percentages, money, dates, product and tool names). Don't add facts, claims or advice that aren't in the original.
- Short sentences: one idea each, under 20 words. Split longer ones.
- Everyday words: "use" not "utilize", "about" not "approximately", "find out" not "determine", "show" not "indicate", "set up" not "implement", "help" not "facilitate", "before" not "prior to", "so" not "consequently".
- No analytics jargon: "where a visit came from" not "attribution", "the tracking code" not "tag" or "pixel", "a sale counted twice" not "duplicate transaction", "visits" not "sessions", "share of visits that buy" not "conversion rate" (the words "conversion rate" may stay once if the original leans on them). If a tool is named, keep its name and add a few words on what it is the first time.
- Talk about the shop: sales, orders, ad money, customers. Use "you" and "your store" where it reads naturally. Active voice.
- End on the last concrete fact or consequence. No closing line that only reassures or sums up. No "X, not Y" endings. No em dashes.
- Keep the summary to one sentence (two short ones at most).

Return ONLY a JSON array, same length and order as the input, each entry shaped exactly like:
{"key": "<copied verbatim>", "business": {"summary": "<rewritten>", "detail": "<rewritten>"}}

No prose, no markdown fence.

INPUT:
${JSON.stringify(items)}`;
}

// Every number in the original must still be in the rewrite.
function numbers(text: string): string[] {
  return (text.match(/\d[\d,.]*\d|\d/g) ?? []).map(n => n.replace(/,/g, "").replace(/\.$/, ""));
}

function keepsNumbers(before: FindingVoice, after: FindingVoice): boolean {
  const have = new Set(numbers(`${after.summary} ${after.detail}`));
  return numbers(`${before.summary} ${before.detail}`).every(n => have.has(n));
}

async function rewriteBatch(items: Item[], jobId: string): Promise<{ byKey: Map<string, FindingVoice>; error?: string }> {
  const byKey = new Map<string, FindingVoice>();
  if (items.length === 0) return { byKey };
  const mcp = await buildMcpConfig(jobId, { ga4Admin: false, gtm: false, browser: false });
  try {
    const raw = await runClaudeHeadless({
      prompt: buildPrompt(items),
      mcpConfigPath: mcp.configPath,
      allowedTools: [],
      timeoutMs: PLAIN_TIMEOUT_MS,
      effort: "low",
      label: `plain-language (${items.length} findings)`,
    });
    const parsed = extractJsonPayload(raw);
    if (!Array.isArray(parsed)) return { byKey, error: "plain-language response was not a JSON array" };
    for (const entry of parsed) {
      const key = (entry as any)?.key;
      const business = (entry as any)?.business;
      if (typeof key === "string" && business && typeof business.summary === "string" && typeof business.detail === "string") {
        byKey.set(key, { summary: business.summary.trim(), detail: business.detail.trim() });
      }
    }
    return { byKey };
  } catch (err) {
    return { byKey, error: err instanceof Error ? err.message : String(err) };
  } finally {
    await mcp.cleanup();
  }
}

/** Rewrites result.categories[].findings[].business in place. */
export async function simplifyBusinessVoice(result: AuditResult, jobId: string): Promise<PlainLanguageResult> {
  const cats: CategoryResult[] = result.categories.filter(c => c.findings.length > 0);
  const total = cats.reduce((n, c) => n + c.findings.length, 0);
  let rewritten = 0;
  let kept = 0;
  const errors: string[] = [];
  // Sequential, like translate-ar.ts: one claude -p process at a time.
  for (const cat of cats) {
    const items = cat.findings.map(f => ({ key: `${cat.category}:${f.checklistId}`, status: f.status, business: f.business }));
    const { byKey, error } = await rewriteBatch(items, `${jobId}-plain-${cat.category.toLowerCase()}`);
    for (const f of cat.findings) {
      const next = byKey.get(`${cat.category}:${f.checklistId}`);
      if (next && keepsNumbers(f.business, next)) {
        f.business = next;
        rewritten++;
      } else {
        kept++;
      }
    }
    if (error) errors.push(`${cat.category}: ${error}`);
  }
  return { rewritten, kept, total, error: errors.length ? errors.join(" | ") : undefined };
}
