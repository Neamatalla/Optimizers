/**
 * Standalone one-off test: runs a single audit job directly, bypassing
 * Supabase queue claiming. Useful for proving out crawl -> PageSpeed ->
 * claude -p (with MCP tools) -> hosted HTML report -> email.
 *
 * Usage:
 *   npm run test-run -- --website=https://example.com --email=you@example.com
 *     [--tools=GA4,GTM] [--business="Some Business"]
 *     [--ga4-id=G-XXXXXXX] [--gtm-id=GTM-XXXXXXX]
 */
import "./logger.js";
import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { crawlWebsite } from "./crawl.js";
import { captureSiteScreenshots } from "./screenshots.js";
import { discoverPages } from "./discover-pages.js";
import { runPageSpeed } from "./pagespeed.js";
import { buildMcpConfig, neededMcpServers } from "./mcp-config.js";
import { runAudit } from "./audit-prompt.js";
import { computeOverallPoints } from "./scoring.js";
import { buildAuditHtmlReport } from "./html-report-node.js";
import { translateFindingsToArabic } from "./translate-ar.js";
import { sendAuditEmail } from "./email.js";
import type { AuditResult, ToolId } from "./types.js";

function parseArgs(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    const withValue = arg.match(/^--([^=]+)=(.*)$/);
    if (withValue) {
      out[withValue[1]] = withValue[2];
      continue;
    }
    const bareFlag = arg.match(/^--([^=]+)$/);
    if (bareFlag) out[bareFlag[1]] = "true";
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const website = args.website;
  const email = args.email;
  const skipEmail = "no-email" in args;
  if (!website || (!email && !skipEmail)) {
    console.error("Usage: npm run test-run -- --website=https://example.com (--email=you@example.com | --no-email) [--tools=GA4,GTM] [--business=Name] [--ga4-id=G-xxx] [--gtm-id=GTM-xxx]");
    process.exit(1);
  }

  const tools = (args.tools ? args.tools.split(",") : []).map(t => t.trim()) as ToolId[];
  const businessName = args.business ?? null;
  const userProvidedGa4Id = args["ga4-id"] ?? null;
  const userProvidedGtmId = args["gtm-id"] ?? null;
  const requestId = `test-${Date.now()}`;

  console.log(`[test-run] website=${website} tools=${tools.join(",") || "(none)"} email=${email ?? "(none, --no-email)"}`);

  console.log("[test-run] crawling...");
  const crawl = await crawlWebsite(website);
  console.log("[test-run] crawl detected:", crawl.detected, "ids:", crawl.ids);

  console.log("[test-run] discovering pages...");
  const discoveredPages = await discoverPages(website, crawl.html);
  console.log("[test-run] pages the audit will cover:", discoveredPages);
  const pageSpeedPromise = runPageSpeed(discoveredPages);

  const shots = await captureSiteScreenshots(website);
  console.log("[test-run] screenshots:", shots.error ?? `desktop=${Boolean(shots.desktop)} mobile=${Boolean(shots.mobile)}`);
  const screenshots = { desktop: shots.desktop, mobile: shots.mobile };

  console.log("[test-run] building MCP config + calling claude -p...");
  const needed = neededMcpServers({ tools, ga4OAuthData: null, gtmOAuthData: null });
  const mcp = await buildMcpConfig(requestId, needed);
  let result: AuditResult;
  let htmlReport: string;
  try {
    const { categories, ga4Metrics } = await runAudit({
      website,
      tools,
      discoveredPages,
      crawl,
      mcpConfigPath: mcp.configPath,
      businessName,
      userProvidedGa4Id,
      userProvidedGtmId,
      ga4OAuthData: null,
      gtmOAuthData: null,
    });

    console.log("[test-run] claude -p returned", categories.length, "categories");
    for (const cat of categories) {
      console.log(`  - ${cat.category}: ${cat.checklistTally.passed}/${cat.checklistTally.evaluated}, ${cat.findings.length} findings`);
    }

    const { earned, possible } = computeOverallPoints(categories);
    console.log("[test-run] overall score:", `${earned}/${possible}`);

    const pageSpeed = await pageSpeedPromise;
    console.log("[test-run] pagespeed:", pageSpeed.error ?? JSON.stringify(pageSpeed.average), pageSpeed.pages.map(p => `${p.type}=${p.mobile}/${p.desktop}`).join(" "));

    result = { categories, overallScore: earned, possiblePoints: possible, websiteUrl: website, businessName, discoveredPages, pageSpeed, screenshots, ga4Metrics };

    console.log("[test-run] translating findings to Arabic...");
    const arabic = await translateFindingsToArabic(result, requestId);
    console.log("[test-run] arabic:", arabic.error ?? `${arabic.translated}/${arabic.total} findings translated`);

    console.log("[test-run] building HTML report page...");
    const report = await buildAuditHtmlReport(result);
    htmlReport = report.html;
  } finally {
    await mcp.cleanup();
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outputDir = path.join(__dirname, "..", "output");
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `audit-${Date.now()}.html`);
  await writeFile(outputPath, htmlReport, "utf8");
  console.log(`[test-run] Saved locally: ${outputPath}`);

  if (skipEmail) {
    console.log("[test-run] --no-email set, skipping delivery. Done.");
    return;
  }

  const categoriesAudited = result.categories.map(c => c.category);

  // Published reports are rows tied to a real audit_requests row, which this
  // script doesn't have, so the email carries the local file instead.
  console.log(`[test-run] emailing attachment to ${email}...`);
  await sendAuditEmail({ to: email, website, businessName, categoriesAudited, isTest: true, attachment: { filename: path.basename(outputPath), html: htmlReport } });
  console.log("[test-run] Done - check the inbox.");
}

main().catch(err => {
  console.error("[test-run] Failed:", err);
  process.exit(1);
});
