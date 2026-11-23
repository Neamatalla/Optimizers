import { extractJsonPayload, runClaudeHeadless } from "../claude.js";
import { buildMcpConfig } from "../mcp-config.js";
import { repairJsonQuotes } from "../fud/judge.js";
import type { RuleResult } from "./rules/types.js";

/**
 * Code rules write their sentence in English only, so an Arabic reader saw
 * generic text for every point code decided or left unchecked. One call on
 * the writer model translates those sentences; each becomes the point's
 * Arabic observation. Best effort: if it fails, the report keeps the generic
 * Arabic text, as before.
 */

const TIMEOUT_MS = 4 * 60 * 1000;

/** The points whose Arabic text has no store detail: an English sentence with no Arabic observation. */
export function needsArabic(results: Record<string, RuleResult>): string[] {
  return Object.entries(results)
    .filter(([, r]) => r.status !== "n/a" && !r.observation?.ar && Boolean(r.observation?.en ?? r.reason))
    .map(([id]) => id);
}

export function buildTranslatePrompt(items: Array<{ id: string; en: string }>): string {
  return `Translate each English audit sentence about an online store into plain Modern Standard Arabic.

Rules:
- Keep the meaning exactly. Keep numbers, prices, currencies, URLs, IDs and tool names (GA4, GTM, Meta, TikTok, Snapchat, Google Ads) as they are, in Latin script.
- Text already in Arabic inside « » stays exactly as it is.
- Short, plain sentences. No additions, no advice.

Return ONLY a JSON object, no prose, no markdown fence. Never use the double-quote character inside a value.
{"items": [{"id": "", "ar": ""}]}

Sentences:
${items.map(i => JSON.stringify({ id: i.id, en: i.en })).join("\n")}`;
}

export async function translateReasons(results: Record<string, RuleResult>, jobId: string): Promise<number> {
  const ids = needsArabic(results);
  if (!ids.length) return 0;
  const items = ids.map(id => ({ id, en: (results[id].observation?.en ?? results[id].reason).slice(0, 400) }));
  const mcp = await buildMcpConfig(`${jobId}-ar`, { ga4Admin: false, gtm: false, browser: false });
  try {
    const raw = await runClaudeHeadless({
      prompt: buildTranslatePrompt(items),
      mcpConfigPath: mcp.configPath,
      allowedTools: [],
      timeoutMs: TIMEOUT_MS,
      effort: "low",
      model: "writer",
      label: `points-arabic (${items.length})`,
    });
    let parsed: unknown;
    try {
      parsed = extractJsonPayload(raw);
    } catch {
      const inner: unknown = JSON.parse(raw)?.result;
      const text = typeof inner === "string" ? inner : "";
      const s = text.indexOf("{"), e = text.lastIndexOf("}");
      parsed = JSON.parse(repairJsonQuotes(text.slice(s, e + 1)));
    }
    const list = (parsed as { items?: Array<{ id?: unknown; ar?: unknown }> })?.items ?? [];
    let n = 0;
    for (const it of list) {
      if (typeof it.id !== "string" || typeof it.ar !== "string" || !results[it.id] || !it.ar.trim()) continue;
      const r = results[it.id];
      r.observation = { en: r.observation?.en ?? r.reason, ar: it.ar.trim() };
      n++;
    }
    return n;
  } catch (err) {
    console.warn(`[audit-worker] Points Arabic translation failed: ${err instanceof Error ? err.message : err}`);
    return 0;
  } finally {
    await mcp.cleanup();
  }
}
