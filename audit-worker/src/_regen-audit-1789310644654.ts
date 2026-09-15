/**
 * One-off: re-derive the AuditResult behind an already-generated report
 * (output/audit-1789310644654.html — the real tharaa.shop GA4+GTM run, no
 * live re-audit) by parsing its own rendered HTML back into structured
 * findings, then rebuild it through the now-fixed buildAuditHtmlReport
 * (scroll-jump CSS fix) and translateFindingsToArabic (batched, low-effort,
 * no longer an all-or-nothing 8min call) — a cheap way to preview both fixes
 * on a real report without spending another ~20min/$ on a fresh claude -p
 * audit. Same technique as _regen-tharaa.ts.
 *
 * Not part of the permanent codebase — delete after use.
 */
import "dotenv/config";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { buildAuditHtmlReport } from "./html-report.js";
import { translateFindingsToArabic } from "./translate-ar.js";
import type { AuditResult, CategoryResult, CategoryFinding, FindingSeverity } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_HTML = path.join(__dirname, "..", "output", "audit-1789310644654.html");
const OUT_HTML = path.join(__dirname, "..", "output", "audit-1789310644654-fixed-preview.html");

function unescapeHtml(s: string): string {
  return s
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

function severityFromClass(cls: string): FindingSeverity {
  if (cls === "critical") return "critical";
  if (cls === "medium") return "medium";
  return "low";
}

const DATA_SOURCE_BY_LABEL: Record<string, "live" | "detection" | "public"> = {
  "Live data": "live",
  "Detected": "detection",
  "Public data": "public",
};

function parseFailFindings(chunk: string): CategoryFinding[] {
  const out: CategoryFinding[] = [];
  const articleRe = /<article class="finding finding--(critical|medium|low)[^"]*"[^>]*>([\s\S]*?)<\/article>/g;
  let m: RegExpExecArray | null;
  while ((m = articleRe.exec(chunk))) {
    const severity = severityFromClass(m[1]);
    const body = m[2];

    const dataSourceMatch = body.match(/<span class="pill"><span class="i18n-en">(Live data|Detected|Public data)<\/span>/);
    const checklistIdMatch = body.match(/<span class="pill checklist-id-pill">([^<]+)<\/span>/);
    const businessSummary = body.match(/<h3 class="voice voice-business i18n-en">([\s\S]*?)<\/h3>/);
    const technicalSummary = body.match(/<h3 class="voice voice-technical i18n-en">([\s\S]*?)<\/h3>/);
    const businessDetail = body.match(/<p class="voice voice-business i18n-en">([\s\S]*?)<\/p>/);
    const technicalDetail = body.match(/<p class="voice voice-technical i18n-en">([\s\S]*?)<\/p>/);

    if (!checklistIdMatch || !businessSummary || !technicalSummary) {
      console.warn("[regen] skipping a fail finding that didn't match expected markup");
      continue;
    }

    out.push({
      checklistId: checklistIdMatch[1].trim(),
      severity,
      status: "fail",
      dataSource: dataSourceMatch ? DATA_SOURCE_BY_LABEL[dataSourceMatch[1]] : "detection",
      business: {
        summary: unescapeHtml(businessSummary[1].trim()),
        detail: unescapeHtml((businessDetail?.[1] ?? "").trim()),
      },
      technical: {
        summary: unescapeHtml(technicalSummary[1].trim()),
        detail: unescapeHtml((technicalDetail?.[1] ?? "").trim()),
      },
    });
  }
  return out;
}

function parsePassFindings(chunk: string): CategoryFinding[] {
  const out: CategoryFinding[] = [];
  const starts: number[] = [];
  const startRe = /<div class="check-pass-row reveal"/g;
  let sm: RegExpExecArray | null;
  while ((sm = startRe.exec(chunk))) starts.push(sm.index);

  for (let i = 0; i < starts.length; i++) {
    const body = chunk.slice(starts[i], starts[i + 1] ?? starts[i] + 4000);

    const checklistIdMatch = body.match(/<span class="check-id">([^<]+)<\/span>/);
    const businessSummary = body.match(/<span class="check-title voice voice-business i18n-en">([\s\S]*?)<\/span>/);
    const technicalSummary = body.match(/<span class="check-title voice voice-technical i18n-en">([\s\S]*?)<\/span>/);
    const businessDetail = body.match(/<p class="voice voice-business i18n-en">([\s\S]*?)<\/p>/);
    const technicalDetail = body.match(/<p class="voice voice-technical i18n-en">([\s\S]*?)<\/p>/);
    const severityMatch = body.match(/class="pill severity-pill"[^>]*><span class="i18n-en">(Critical|Medium|Low)<\/span>/);

    if (!checklistIdMatch || !businessSummary || !technicalSummary) {
      console.warn("[regen] skipping a pass row that didn't match expected markup");
      continue;
    }

    out.push({
      checklistId: checklistIdMatch[1].trim(),
      severity: severityMatch ? (severityMatch[1].toLowerCase() as FindingSeverity) : "low",
      status: "pass",
      // Never rendered for a pass row in html-report.ts's own template — inert here too.
      dataSource: "detection",
      business: {
        summary: unescapeHtml(businessSummary[1].trim()),
        detail: unescapeHtml((businessDetail?.[1] ?? "").trim()),
      },
      technical: {
        summary: unescapeHtml(technicalSummary[1].trim()),
        detail: unescapeHtml((technicalDetail?.[1] ?? "").trim()),
      },
    });
  }
  return out;
}

async function main() {
  const html = await readFile(SRC_HTML, "utf8");

  const websiteUrlMatch = html.match(/i18n-ar" dir="rtl">الموقع:<\/span> <b>([^<]+)<\/b>/);
  const businessNameMatch = html.match(/<h1>([^<]+)<\/h1>/);
  const overallScoreMatch = html.match(/data-count-to="(\d+)"/);
  const possiblePointsMatch = html.match(/<span class="score-den">\/ (\d+)<\/span>/);
  // Anchored on the <figure>'s own class, not on how many wrapper divs sit
  // between the <img> and its <figcaption> — device-desktop has one
  // (.device-screen) and device-mobile has two (.device-bezel wrapping
  // .device-screen), which an img-to-figcaption regex silently mismatches
  // on the mobile side only (2026-09-15: mobile mockup went missing because
  // of exactly this — desktop matched, mobile's extra div broke the pattern
  // and the regex returned null, and deviceMockupHtml() just omits a null
  // shot rather than erroring).
  const desktopShotMatch = html.match(/<figure class="device device-desktop[\s\S]*?<img src="(data:image\/jpeg;base64,[^"]+)"/);
  const mobileShotMatch = html.match(/<figure class="device device-mobile[\s\S]*?<img src="(data:image\/jpeg;base64,[^"]+)"/);

  if (!websiteUrlMatch || !businessNameMatch || !overallScoreMatch || !possiblePointsMatch) {
    throw new Error("Could not parse required meta fields from the source HTML — check the regexes against the actual markup.");
  }

  const websiteUrl = websiteUrlMatch[1].trim();
  const businessName = businessNameMatch[1].trim();
  const overallScore = Number(overallScoreMatch[1]);
  const possiblePoints = Number(possiblePointsMatch[1]);

  const ga4Start = html.indexOf('id="panel-ga4"');
  const gtmStart = html.indexOf('id="panel-gtm"');
  const websiteStart = html.indexOf('id="panel-website"');
  const ctaStart = html.indexOf('<section class="cta">');
  if (ga4Start === -1 || gtmStart === -1) {
    throw new Error("Could not locate panel-ga4/panel-gtm boundaries in the source HTML.");
  }
  const ga4Chunk = html.slice(ga4Start, gtmStart);
  const gtmEnd = websiteStart !== -1 ? websiteStart : ctaStart;
  const gtmChunk = html.slice(gtmStart, gtmEnd);

  const ga4Findings = [...parseFailFindings(ga4Chunk), ...parsePassFindings(ga4Chunk)];
  const gtmFindings = [...parseFailFindings(gtmChunk), ...parsePassFindings(gtmChunk)];

  console.log(`[regen] parsed GA4: ${ga4Findings.length} findings (expected 25)`);
  console.log(`[regen] parsed GTM: ${gtmFindings.length} findings (expected 25)`);

  const ga4Category: CategoryResult = {
    category: "GA4",
    score: Math.round((ga4Findings.filter(f => f.status === "pass").length / (ga4Findings.length || 1)) * 100),
    checklistTally: { total: ga4Findings.length, evaluated: ga4Findings.length, passed: ga4Findings.filter(f => f.status === "pass").length },
    findings: ga4Findings,
  };
  const gtmCategory: CategoryResult = {
    category: "GTM",
    score: Math.round((gtmFindings.filter(f => f.status === "pass").length / (gtmFindings.length || 1)) * 100),
    checklistTally: { total: gtmFindings.length, evaluated: gtmFindings.length, passed: gtmFindings.filter(f => f.status === "pass").length },
    findings: gtmFindings,
  };

  console.log("[regen] translating GA4 findings to Arabic...");
  const ga4Ar = await translateFindingsToArabic({ categories: [ga4Category] } as AuditResult, "regen-1789310644654-ga4");
  console.log("[regen] GA4 arabic:", ga4Ar.error ?? `${ga4Ar.translated}/${ga4Ar.total} translated`);

  console.log("[regen] translating GTM findings to Arabic...");
  const gtmAr = await translateFindingsToArabic({ categories: [gtmCategory] } as AuditResult, "regen-1789310644654-gtm");
  console.log("[regen] GTM arabic:", gtmAr.error ?? `${gtmAr.translated}/${gtmAr.total} translated`);

  const result: AuditResult = {
    categories: [ga4Category, gtmCategory],
    overallScore,
    possiblePoints,
    websiteUrl,
    businessName,
    discoveredPages: [],
    screenshots: {
      desktop: desktopShotMatch?.[1] ?? null,
      mobile: mobileShotMatch?.[1] ?? null,
    },
  };

  const { html: outHtml } = await buildAuditHtmlReport(result);
  await writeFile(OUT_HTML, outHtml, "utf8");
  console.log(`[regen] Wrote ${OUT_HTML} (${outHtml.length} bytes)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
