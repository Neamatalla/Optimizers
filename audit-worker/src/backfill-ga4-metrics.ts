import { extractJsonPayload, runClaudeHeadless } from "./claude.js";
import { buildMcpConfig } from "./mcp-config.js";
import { sanitizeGa4Metrics } from "./audit-prompt.js";
import type { AuditResult, Ga4Metrics } from "./types.js";

/**
 * Recovers the report's "store numbers" (types.ts Ga4Metrics) for an audit
 * that ran before audit-prompt.ts started returning them. The numbers were
 * already pulled live back then; they just live inside the GA4-D findings'
 * text. One `claude -p` call reads those findings and copies out only the
 * values they state, then sanitizeGa4Metrics applies the same checks a new
 * audit's numbers get (live GA4 data only, well-formed values).
 *
 * Never invents: a value the findings don't state stays null or empty, and
 * the report leaves that chart out. Never throws; returns null on any failure.
 */

const BACKFILL_TIMEOUT_MS = 5 * 60 * 1000;

function buildPrompt(findings: Array<{ id: string; summary: string; detail: string }>): string {
  return `Below are findings from a Google Analytics 4 audit of an online store. Each one states real numbers pulled from the store's GA4 account for the same 28-day window.

Copy those numbers into the JSON shape below. Rules:
- Use only numbers written in the findings. Never estimate, compute a new figure, or fill a gap. Leave a field null, or an array empty, when the findings don't state it.
- "funnel": event counts for page_view, view_item, add_to_cart, begin_checkout, add_shipping_info, add_payment_info and purchase, only those the findings give a count for.
- "conversionRate": the purchase conversion rate in percent, only if a finding states it. Ignore "key event" or "conversions" rates that count page views or scrolls.
- "channels" and "segments": include a channel or a new/returning segment only when a finding states its PURCHASE conversion rate in percent. Key events per session do not count.
- "revenue": purchaseRevenue as a plain number; "currency": its 3-letter code.

Return ONLY this JSON object, no prose, no markdown fence:
{"periodDays": 28, "currency": null, "sessions": null, "conversions": null, "conversionRate": null, "revenue": null, "funnel": [{"event": "", "count": 0}], "channels": [{"name": "", "sessions": null, "conversionRate": 0}], "segments": [{"name": "new", "sessions": null, "conversionRate": 0}]}

FINDINGS:
${JSON.stringify(findings)}`;
}

// One retry: a single short call, and the first attempt on 2026-10-05 failed
// transiently and succeeded on the second.
export async function backfillGa4Metrics(result: AuditResult, jobId: string): Promise<Ga4Metrics | null> {
  return (await attempt(result, jobId)) ?? attempt(result, `${jobId}-retry`);
}

async function attempt(result: AuditResult, jobId: string): Promise<Ga4Metrics | null> {
  const ga4 = result.categories.find(c => c.category === "GA4");
  if (!ga4) return null;
  const findings = ga4.findings
    .filter(f => f.checklistId.startsWith("GA4-D") && f.dataSource === "live")
    .map(f => ({ id: f.checklistId, summary: f.technical.summary, detail: f.technical.detail }));
  if (!findings.length) return null;
  const mcp = await buildMcpConfig(jobId, { ga4Admin: false, gtm: false, browser: false });
  try {
    const raw = await runClaudeHeadless({
      prompt: buildPrompt(findings),
      mcpConfigPath: mcp.configPath,
      allowedTools: [],
      timeoutMs: BACKFILL_TIMEOUT_MS,
      effort: "low",
      label: "ga4-metrics backfill",
    });
    return sanitizeGa4Metrics(extractJsonPayload(raw), result.categories);
  } catch (err) {
    console.warn(`[backfill-ga4-metrics] ${err instanceof Error ? err.message.slice(0, 600) : String(err)}`);
    return null;
  } finally {
    await mcp.cleanup();
  }
}
