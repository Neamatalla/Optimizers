/**
 * Same as test-run.ts, but for proving the OAuth data path end-to-end without
 * standing up Supabase queue claiming.
 *
 * Usage:
 *   npm run test-run-oauth -- --website=https://example.com
 *     [--ga4-oauth-file=/tmp/ga4-oauth-data.json] [--gtm-oauth-file=/tmp/gtm-oauth-data.json]
 *     [--ga4-id=G-XXXXXXX] [--gtm-id=GTM-XXXXXXX] [--business="Some Business"]
 *     [--no-email | --email=you@example.com]
 */
import "dotenv/config";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { crawlWebsite } from "./crawl.js";
import { captureSiteScreenshots } from "./screenshots.js";
import { discoverPages } from "./discover-pages.js";
import { buildMcpConfig, neededMcpServers } from "./mcp-config.js";
import { runAudit } from "./audit-prompt.js";
import { computeOverallPoints } from "./scoring.js";
import { buildAuditHtmlReport } from "./html-report.js";
import { translateFindingsToArabic } from "./translate-ar.js";
import { publishAuditReport } from "./supabase.js";
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

async function readJsonIfPresent(filePath: string | undefined): Promise<unknown> {
  if (!filePath) return null;
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const args = parseArgs();
  const website = args.website;
  const email = args.email;
  const skipEmail = "no-email" in args;
  if (!website || (!email && !skipEmail)) {
    console.error("Usage: npm run test-run-oauth -- --website=https://example.com (--email=you@example.com | --no-email) [--ga4-oauth-file=x] [--gtm-oauth-file=x] [--ga4-id=G-xxx] [--gtm-id=GTM-xxx] [--business=Name]");
    process.exit(1);
  }

  const ga4OAuthData = await readJsonIfPresent(args["ga4-oauth-file"]);
  const gtmOAuthData = await readJsonIfPresent(args["gtm-oauth-file"]);
  const tools: ToolId[] = [];
  if (ga4OAuthData) tools.push("GA4");
  if (gtmOAuthData) tools.push("GTM");

  const businessName = args.business ?? null;
  const userProvidedGa4Id = args["ga4-id"] ?? null;
  const userProvidedGtmId = args["gtm-id"] ?? null;
  const requestId = `oauth-test-${Date.now()}`;

  console.log(`[test-run-oauth] website=${website} tools=${tools.join(",") || "(none)"} email=${email ?? "(none, --no-email)"}`);
  console.log(`[test-run-oauth] ga4OAuthData: ${ga4OAuthData ? "present" : "none"}, gtmOAuthData: ${gtmOAuthData ? "present" : "none"}`);

  console.log("[test-run-oauth] crawling...");
  const crawl = await crawlWebsite(website);
  console.log("[test-run-oauth] crawl detected:", crawl.detected, "ids:", crawl.ids);

  console.log("[test-run-oauth] discovering pages...");
  const discoveredPages = await discoverPages(website, crawl.html);
  console.log("[test-run-oauth] pages the audit will cover:", discoveredPages);

  const shots = await captureSiteScreenshots(website);
  console.log("[test-run-oauth] screenshots:", shots.error ?? `desktop=${Boolean(shots.desktop)} mobile=${Boolean(shots.mobile)}`);
  const screenshots = { desktop: shots.desktop, mobile: shots.mobile };

  console.log("[test-run-oauth] building MCP config + calling claude -p...");
  const needed = neededMcpServers({ tools, ga4OAuthData, gtmOAuthData });
  const mcp = await buildMcpConfig(requestId, needed);
  let result: AuditResult;
  let htmlReport: string;
  try {
    const categories = await runAudit({
      website,
      tools,
      discoveredPages,
      crawl,
      mcpConfigPath: mcp.configPath,
      businessName,
      userProvidedGa4Id,
      userProvidedGtmId,
      ga4OAuthData,
      gtmOAuthData,
    });

    console.log("[test-run-oauth] claude -p returned", categories.length, "categories");
    for (const cat of categories) {
      console.log(`  - ${cat.category}: ${cat.checklistTally.passed}/${cat.checklistTally.evaluated}, ${cat.findings.length} findings`);
      for (const f of cat.findings) {
        console.log(`      [${f.severity}/${f.dataSource}] ${f.technical.summary}`);
      }
    }

    const { earned, possible } = computeOverallPoints(categories);
    console.log("[test-run-oauth] overall score:", `${earned}/${possible}`);

    result = { categories, overallScore: earned, possiblePoints: possible, websiteUrl: website, businessName, discoveredPages, screenshots };

    console.log("[test-run-oauth] translating findings to Arabic...");
    const arabic = await translateFindingsToArabic(result, requestId);
    console.log("[test-run-oauth] arabic:", arabic.error ?? `${arabic.translated}/${arabic.total} findings translated`);

    console.log("[test-run-oauth] building HTML report page...");
    const report = await buildAuditHtmlReport(result);
    htmlReport = report.html;
  } finally {
    await mcp.cleanup();
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outputDir = path.join(__dirname, "..", "output");
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `audit-oauth-${Date.now()}.html`);
  await writeFile(outputPath, htmlReport, "utf8");
  console.log(`[test-run-oauth] Saved locally: ${outputPath}`);

  if (skipEmail) {
    console.log("[test-run-oauth] --no-email set, skipping upload and delivery. Done.");
    return;
  }

  const { publicUrl: reportUrl } = await publishAuditReport({ requestId, html: htmlReport, businessName, website, isTest: true });
  console.log(`[test-run-oauth] Published report: ${reportUrl}`);
  console.log(`[test-run-oauth] emailing link to ${email}...`);
  await sendAuditEmail({ to: email, website, businessName, isTest: true, reportUrl, categoriesAudited: result.categories.map(c => c.category) });
  console.log("[test-run-oauth] Done - check the inbox.");
}

main().catch(err => {
  console.error("[test-run-oauth] Failed:", err);
  process.exit(1);
});
