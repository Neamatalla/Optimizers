/**
 * One-off regeneration of the existing tharaa-shop-daf037-mockup.html report
 * through the now-updated buildAuditHtmlReport (Arabic toggle, RTL, scroll
 * animations, screenshots) — reusing the ORIGINAL findings content (parsed
 * back out of the old static file) rather than re-running a live audit.
 *
 * Not part of the permanent codebase — delete after use.
 */
import "dotenv/config";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { buildAuditHtmlReport } from "./html-report.js";
import { translateFindingsToArabic } from "./translate-ar.js";
import type { AuditResult, CategoryResult, CategoryFinding } from "./types.js";

const SCRATCH = "C:\\Users\\OMARMA~1\\AppData\\Local\\Temp\\claude\\C--Users-Omar-Maged-Desktop-optimizers-dev-Optimizers\\cffc102d-ccf6-4237-ac4c-5be1e103576d\\scratchpad";

async function main() {
  const parsed = JSON.parse(await readFile(path.join(SCRATCH, "tharaa-parsed.json"), "utf8"));
  const desktop = (await readFile(path.join(SCRATCH, "tharaa-desktop.b64"), "utf8")).trim();
  const mobile = (await readFile(path.join(SCRATCH, "tharaa-mobile.b64"), "utf8")).trim();

  function toFindings(raw: any[]): CategoryFinding[] {
    return raw.map(f => ({
      checklistId: f.checklistId,
      severity: f.severity,
      status: f.status,
      dataSource: f.dataSource,
      business: f.business,
      technical: f.technical,
    }));
  }

  const ga4Category: CategoryResult = {
    category: "GA4",
    score: parsed.meta.panels.ga4.score,
    checklistTally: { total: parsed.meta.panels.ga4.total, evaluated: parsed.meta.panels.ga4.total, passed: parsed.meta.panels.ga4.passed },
    findings: toFindings(parsed.ga4),
  };
  const websiteCategory: CategoryResult = {
    category: "Website",
    score: parsed.meta.panels.website.score,
    checklistTally: { total: parsed.meta.panels.website.total, evaluated: parsed.meta.panels.website.total, passed: parsed.meta.panels.website.passed },
    findings: toFindings(parsed.website),
  };

  console.log("[regen] translating GA4 findings to Arabic...");
  const ga4Result = await translateFindingsToArabic({ categories: [ga4Category] } as AuditResult, "tharaa-ga4-regen");
  console.log("[regen] GA4:", ga4Result.error ?? `${ga4Result.translated}/${ga4Result.total} translated`);

  console.log("[regen] translating Website findings to Arabic...");
  const websiteResult = await translateFindingsToArabic({ categories: [websiteCategory] } as AuditResult, "tharaa-website-regen");
  console.log("[regen] Website:", websiteResult.error ?? `${websiteResult.translated}/${websiteResult.total} translated`);

  const result: AuditResult = {
    categories: [ga4Category, websiteCategory],
    overallScore: parsed.meta.overallScore,
    possiblePoints: parsed.meta.possiblePoints,
    websiteUrl: parsed.meta.websiteUrl,
    businessName: null,
    discoveredPages: parsed.meta.discoveredPages,
    screenshots: { desktop, mobile },
  };

  const { html } = await buildAuditHtmlReport(result);
  const outPath = path.join(__dirname, "..", "output", "tharaa-shop-daf037-mockup.html");
  await writeFile(outPath, html, "utf8");
  console.log(`[regen] Wrote ${outPath} (${html.length} bytes)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
