import { extractJsonPayload, isRateLimitError, runClaudeHeadless } from "./claude.js";
import { buildMcpConfig } from "./mcp-config.js";
import type { AuditResult, CategoryResult, FindingVoice } from "./types.js";
import { arabicRegisterRule, type AudienceRole } from "./audience.js";


/**
 * Best-effort Arabic translation pass, run once per audit AFTER the English
 * AuditResult is complete (see poll.ts/test-run.ts, right before
 * buildAuditHtmlReport) — mutates each finding in place with an `ar` field
 * (types.ts) holding both registers in Modern Standard Arabic.
 *
 * Deliberately a separate pass rather than asking audit-prompt.ts's main
 * Claude call to produce both languages up front: that prompt is already a
 * 50-point checklist answered in two registers plus live API/browser tool
 * calls, and doubling its output language would add real run time and a new
 * way for the JSON schema to come back malformed. A translation-only call
 * has no tools to invoke and nothing to decide — it only has to carry the
 * meaning across faithfully — so it's cheap, fast, and can fail on its own
 * without taking the audit down with it: same "best-effort, never blocks a
 * real result" contract as screenshots.ts's screenshot capture.
 *
 * One call PER CATEGORY, not one giant call for all ~50 findings at once
 * (2026-09-13: a single 50-finding/200-string call on tharaa.shop timed out
 * at its full 8min budget and left EVERY finding on the English fallback —
 * html-report.ts still renders something under the Arabic toggle in that
 * case, but it's the English text inside an RTL wrapper, which reads as
 * "translation is broken", not as a partial/best-effort result). Splitting
 * by category means a single slow/failed batch only costs that category's
 * ~25 findings their Arabic, not all of them, and each batch gets its own
 * full timeout rather than sharing one budget across the whole audit.
 * `effort: "low"` on top of that: this is mechanical text-in/text-out with
 * no tools and nothing to decide, so extended thinking is pure overhead here
 * — the params below are otherwise the correctness-sensitive kind (accurate,
 * complete translation), not the kind that benefits from more thinking.
 *
 * Still never throws for ad-hoc callers (test-run, preview, the _regen
 * scripts), but the worker (poll.ts) uses the result to retry: only
 * findings without `ar` are sent, so a rerun on a saved result picks up
 * exactly what an earlier pass missed; `onCategoryDone` lets it save after
 * each category; and a usage/rate limit stops the loop and comes back as
 * `rateLimitError` for poll.ts to rethrow into its rate-limit path.
 */

const TRANSLATE_TIMEOUT_MS = 8 * 60 * 1000;

interface FlatFinding {
  key: string;
  technical: FindingVoice;
  business: FindingVoice;
  // The action layer (actions.ts): the step and done-state for a failed
  // point, or what to protect for a passed one.
  action?: { step: string; doneWhen: string; impact?: string };
  protect?: string;
  // What good looks like (the point's expected state), technical register.
  criteria?: string;
}

type Translated = { technical: FindingVoice; business: FindingVoice; action?: { step: string; doneWhen: string; impact?: string }; protect?: string; criteria?: string };

interface TranslateResult {
  // Findings translated by THIS pass, out of the ones it attempted.
  translated: number;
  total: number;
  // Findings across the whole result still without `ar` after this pass,
  // including any an early stop on a rate limit never got to.
  missing: number;
  error?: string;
  // The full limit message (reset epoch included, for poll.ts's
  // parseLimitResetAt) when a batch hit a usage/rate limit.
  rateLimitError?: string;
}

interface TranslateOptions {
  // Called after each category's Arabic is written onto its findings. Not
  // caught: a LostLeaseError from the worker's save must stop the pass.
  onCategoryDone?: () => Promise<void>;
}

function flatten(findings: CategoryResult["findings"], category: string): FlatFinding[] {
  return findings.map(finding => ({
    key: `${category}:${finding.checklistId}`,
    technical: finding.technical,
    business: finding.business,
    action: finding.action ? { step: finding.action.step, doneWhen: finding.action.doneWhen, impact: finding.action.impact } : undefined,
    protect: finding.protect,
    criteria: finding.criteria,
  }));
}

function buildPrompt(items: FlatFinding[], role?: AudienceRole | null): string {
  const payload = items.map(i => ({ key: i.key, technical: i.technical, business: i.business, ...(i.action ? { action: i.action } : {}), ...(i.protect ? { protect: i.protect } : {}), ...(i.criteria ? { criteria: i.criteria } : {}) }));

  return `You are translating a CRO/analytics audit report from English into professional Modern Standard Arabic for a business audience in the GCC/MENA region.

Below is a JSON array. Each entry has a "key" (do not translate or alter it — copy it back verbatim, it's how the translation gets matched back to its source), a "technical" object (summary + detail, written for an engineer) and a "business" object (summary + detail, written for ${arabicRegisterRule(role) ? "the reader named below" : "a non-technical stakeholder"}). Some entries also have an "action" object (step, doneWhen, optional impact: the task handed to the store, written in the business register) or a "protect" string (what to keep as it is).

Translate every "summary", "detail", "step", "doneWhen", "impact", "protect" and "criteria" string into natural, professional Arabic. "step" stays an instruction (imperative: "أضف"، "انقل"، "فعّل"). Rules:
- Keep the same two registers distinct in Arabic exactly as they are in English: the technical text should still read like precise engineering language, the business text like plain non-technical language — don't collapse them into the same tone.
- Keep product/brand names, tool names, and code-level identifiers as-is in Latin script inside the Arabic sentence where that's how an Arabic-speaking engineer would actually write them (e.g. "GA4", "GTM", "dataLayer", "gtag.js", tag/property/parameter/method/event/metric names, URLs, HTML/CSS selectors). Don't transliterate them into Arabic letters.
- Wrap every such kept-in-Latin-script CODE-LEVEL identifier in parentheses — (run_report), (activeUsers), (eventName), (dataLayer), (gtag.js), a tag/trigger/variable name, etc. — so it reads as a clearly bounded token inside the surrounding RTL sentence instead of blending into it. Short, universally-recognized product acronyms (GA4, GTM) don't need brackets; this is specifically for the longer/mixed-case API, parameter, and code names that are hard to visually delimit inside Arabic text.
- Numbers, percentages, currency codes (e.g. "AED 9,240"), and dates stay as digits/codes, written left-to-right as usual in Arabic text.
- Preserve emphasis and meaning exactly — this is a translation, not a rewrite or a summary. Every sentence in the English source should have a corresponding sentence in the Arabic output.
- Natural Arabic sentence structure, not a word-for-word calque of the English syntax.
${arabicRegisterRule(role) ? `- WHO READS THIS: ${arabicRegisterRule(role)} Keep the meaning and every fact; only the wording follows this reader.` : `- Reading level for the business text: the reader is a busy store owner in Egypt or the Gulf, not an analyst. Use plain, everyday Modern Standard Arabic, the kind used in business news, not formal or literary Arabic: short sentences with one idea each (split a long English sentence into two Arabic ones rather than chaining it with و/ف/حيث/إذ), common words over formal ones ("يُظهر" not "يتجلّى"، "لذلك" not "ومن ثَمّ"، "حتى الآن" not "حتى تاريخه"), and no long chains of nouns in إضافة. Speak to the owner directly ("متجرك"، "مبيعاتك") where it reads naturally. Keep the meaning and every fact; only the wording gets simpler.`}
- Use the standard Arabic CRO/e-commerce term for every metric or concept below — the exact term, every time, in both registers. Never replace one with a descriptive phrase (write "معدل التحويل", never "نسبة الزيارات التي انتهت بعملية شراء"). On a term's first use in an entry, add the English name in parentheses once, e.g. "معدل التحويل (Conversion Rate)".
  conversion rate = معدل التحويل · conversion(s) = التحويلات · conversion funnel / funnel = مسار التحويل · average order value (AOV) = متوسط قيمة الطلب · revenue = الإيرادات · cart abandonment = التخلي عن سلة التسوق · checkout = إتمام الشراء · add to cart = الإضافة إلى السلة · bounce rate = معدل الارتداد · engagement rate = معدل التفاعل · landing page = صفحة الهبوط · call to action (CTA) = دعوة لاتخاذ إجراء (CTA) · traffic source / channel = مصدر الزيارات · sessions / visits = الزيارات · new / returning visitors = الزوار الجدد / الزوار العائدون · attribution = إسناد التحويلات · key event = حدث رئيسي · tracking = التتبع · page speed = سرعة الصفحة · return on ad spend (ROAS) = العائد على الإنفاق الإعلاني (ROAS) · A/B test = اختبار A/B · user experience (UX) = تجربة المستخدم (UX)
- The technical text keeps the exact identifiers and values, but also in short sentences.
- Every entry in the input must produce exactly one entry in the output, in the same order, with the same "key" — never skip, merge, or drop one, even a short/simple one.

Return ONLY a JSON array, same length and same order as the input, each entry shaped exactly like:
{"key": "<copied verbatim>", "technical": {"summary": "<Arabic>", "detail": "<Arabic>"}, "business": {"summary": "<Arabic>", "detail": "<Arabic>"}, "action": {"step": "<Arabic>", "doneWhen": "<Arabic>", "impact": "<Arabic>"}, "protect": "<Arabic>"}
(include "action", "protect" and "criteria" only when the input entry has them; "criteria" is a plain string in the technical register, add it next to "protect" as "criteria": "<Arabic>")

No prose, no markdown fence, no commentary — the entire final answer must be that JSON array and nothing else.

INPUT:
${JSON.stringify(payload)}`;
}

/**
 * Translates one category's findings in a single `claude -p` call. Never
 * throws — same best-effort contract as the caller, just scoped to one
 * category's worth of findings instead of the whole audit.
 */
async function translateBatch(items: FlatFinding[], jobId: string, role?: AudienceRole | null): Promise<{ byKey: Map<string, Translated>; error?: string }> {
  const byKey = new Map<string, Translated>();
  if (items.length === 0) return { byKey };

  const mcp = await buildMcpConfig(jobId, { ga4Admin: false, gtm: false, browser: false });
  try {
    const raw = await runClaudeHeadless({
      prompt: buildPrompt(items, role),
      mcpConfigPath: mcp.configPath,
      allowedTools: [],
      timeoutMs: TRANSLATE_TIMEOUT_MS,
      effort: "low",
      label: `translate (${items.length} findings)`,
    });

    const parsed = extractJsonPayload(raw);
    if (!Array.isArray(parsed)) {
      return { byKey, error: "translation response was not a JSON array" };
    }

    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") continue;
      const key = (entry as any).key;
      const technical = (entry as any).technical;
      const business = (entry as any).business;
      if (
        typeof key === "string" &&
        technical && typeof technical.summary === "string" && typeof technical.detail === "string" &&
        business && typeof business.summary === "string" && typeof business.detail === "string"
      ) {
        const a = (entry as any).action;
        const p = (entry as any).protect;
        byKey.set(key, {
          technical: { summary: technical.summary, detail: technical.detail },
          business: { summary: business.summary, detail: business.detail },
          action: a && typeof a.step === "string" && typeof a.doneWhen === "string" ? { step: a.step, doneWhen: a.doneWhen, impact: typeof a.impact === "string" ? a.impact : undefined } : undefined,
          protect: typeof p === "string" ? p : undefined,
          criteria: typeof (entry as any).criteria === "string" ? (entry as any).criteria : undefined,
        });
      }
    }

    return { byKey };
  } catch (err) {
    return { byKey, error: err instanceof Error ? err.message : String(err) };
  } finally {
    await mcp.cleanup();
  }
}

/**
 * `jobId` only needs to be unique enough for a temp-file name per batch (see
 * mcp-config.ts) — none of these calls need MCP servers or tool access,
 * they're pure text-in/text-out, so an empty server set is intentional, not
 * a placeholder for "wire this up later".
 */
export async function translateFindingsToArabic(result: AuditResult, jobId: string, opts: TranslateOptions = {}): Promise<TranslateResult> {
  const countMissing = () => result.categories.reduce((sum, cat) => sum + cat.findings.filter(f => !f.ar).length, 0);
  const pendingCategories = result.categories.filter(cat => cat.findings.some(f => !f.ar));
  const total = countMissing();
  if (total === 0) return { translated: 0, total: 0, missing: 0 };

  let translated = 0;
  const errors: string[] = [];
  let rateLimitError: string | undefined;

  // Sequential, not parallel: each batch is a separate `claude -p` process
  // hitting the same account, and this codebase has already been burned once
  // by a burst of concurrent/heavy calls tripping the account's own rate
  // limit (see audit-prompt.ts's GA4 property-enumeration fix). One category
  // at a time keeps this pass's load predictable.
  for (const cat of pendingCategories) {
    const items = flatten(cat.findings.filter(f => !f.ar), cat.category);
    const { byKey, error } = await translateBatch(items, `${jobId}-ar-${cat.category.toLowerCase()}`, result.audienceRole);

    for (const finding of cat.findings) {
      if (finding.ar) continue;
      const ar = byKey.get(`${cat.category}:${finding.checklistId}`);
      if (ar) {
        finding.ar = ar;
        translated++;
      }
    }
    if (byKey.size > 0) await opts.onCategoryDone?.();

    if (error) {
      errors.push(`${cat.category}: ${error}`);
      // Every later batch would hit the same limit within seconds.
      if (isRateLimitError(error)) {
        rateLimitError = error;
        break;
      }
    }
  }

  return { translated, total, missing: countMissing(), error: errors.length > 0 ? errors.join(" | ") : undefined, rateLimitError };
}
