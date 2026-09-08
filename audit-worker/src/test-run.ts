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
import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { crawlWebsite } from "./crawl.js";
import { fetchSitePageSpeed, parsePageSpeedKeys } from "./pagespeed.js";
import { discoverPages } from "./discover-pages.js";
import { buildMcpConfig, neededMcpServers } from "./mcp-config.js";
import { runAudit } from "./audit-prompt.js";
import { computeOverallPoints } from "./scoring.js";
import { buildAuditHtmlReport } from "./html-report.js";
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

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name}`);
  return value;
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

  console.log("[test-run] discovering pages for the site-wide PageSpeed sweep...");
  const pages = await discoverPages(website, crawl.html);
  console.log("[test-run] sweeping", pages.length, "page(s) sequentially:", pages);
  const sitePageSpeed = await fetchSitePageSpeed(pages, parsePageSpeedKeys(requireEnv("PAGESPEED_API_KEYS")));
  const pagespeed = sitePageSpeed[0].report;
  console.log("[test-run] homepage pagespeed mobile score:", pagespeed.mobile.performanceScore, "desktop score:", pagespeed.desktop.performanceScore);

  console.log("[test-run] building MCP config + calling claude -p...");
  const needed = neededMcpServers({ tools, ga4OAuthData: null, gtmOAuthData: null });
  const mcp = await buildMcpConfig(requestId, needed);
  let result: AuditResult;
  let htmlReport: string;
  try {
    const categories = await runAudit({
      website,
      tools,
      pagespeed,
      sitePageSpeed,
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

    result = { categories, overallScore: earned, possiblePoints: possible, websiteUrl: website, businessName, sitePageSpeed };
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
    console.log("[test-run] --no-email set, skipping upload and delivery. Done.");
    return;
  }

  const categoriesAudited = result.categories.map(c => c.category);

  // publishAuditReport needs Supabase (storage upload for a stable, from-
  // anywhere link) — the real production path (poll.ts) always has that
  // configured, but a local `npm run test-run -- --email=...` shouldn't
  // have to set up Supabase just to see the email step actually work.
  // Fall back to attaching the local HTML file directly instead of a
  // hosted link whenever Supabase isn't configured this run.
  const supabaseConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);

  if (supabaseConfigured) {
    const { publicUrl: reportUrl } = await publishAuditReport({ requestId, html: htmlReport, businessName, website });
    console.log(`[test-run] Published report: ${reportUrl}`);
    console.log(`[test-run] emailing link to ${email}...`);
    await sendAuditEmail({ to: email, website, businessName, reportUrl, categoriesAudited });
  } else {
    console.log("[test-run] SUPABASE_URL/SUPABASE_SECRET_KEY not set — attaching the local HTML report instead of a hosted link.");
    console.log(`[test-run] emailing attachment to ${email}...`);
    await sendAuditEmail({ to: email, website, businessName, categoriesAudited, attachment: { filename: path.basename(outputPath), html: htmlReport } });
  }
  console.log("[test-run] Done - check the inbox.");
}

main().catch(err => {
  console.error("[test-run] Failed:", err);
  process.exit(1);
});
