import "dotenv/config";
import crypto from "node:crypto";
import {
  claimNextPendingRequest,
  markRequestFailed,
  markRequestRateLimited,
  markRequestAwaitingApproval,
  publishAuditReport,
  findDueScheduledRequests,
  markSentToClient,
  findScheduledDeliveries,
  getLastDigestDateUtc,
  recordDigestSent,
} from "./supabase.js";
import { crawlWebsite } from "./crawl.js";
import { fetchSitePageSpeed, parsePageSpeedKeys } from "./pagespeed.js";
import { discoverPages } from "./discover-pages.js";
import { buildMcpConfig, neededMcpServers } from "./mcp-config.js";
import { runAudit } from "./audit-prompt.js";
import { computeOverallPoints } from "./scoring.js";
import { buildAuditHtmlReport } from "./html-report.js";
import { sendAuditEmail, sendInternalReviewEmail, sendDailyDigestEmail } from "./email.js";
import type { AuditRequestRow, AuditResult } from "./types.js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name}`);
  return value;
}

// Every completed audit is emailed here first for review — never straight to
// the requester. See processRequest's tail and api/_lib/audit-approve.js.
const REVIEWER_EMAIL = process.env.AUDIT_REVIEWER_EMAIL || "omar@optimizers.agency";
// Roughly "end of day" for a Cairo-based reviewer (UTC+2/+3) without pulling
// in a timezone library for one comparison — override via env if that drifts.
const DAILY_DIGEST_HOUR_UTC = Number(process.env.DAILY_DIGEST_HOUR_UTC ?? 20);

// Heuristic match against whatever `claude -p`'s stderr (see claude.ts) or a
// thrown Google API error surfaces — there's no structured error type to
// inspect across both sources, just message text. False negatives just mean
// a rate-limited run gets marked failed instead of retained (safe); false
// positives would wrongly retry a real failure, which is why this stays
// narrow to actual rate/quota vocabulary rather than e.g. generic "error".
function isRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /rate.?limit|429|quota|resource_exhausted|too many requests|overloaded/i.test(message);
}

async function processRequest(row: AuditRequestRow): Promise<void> {
  console.log(`[audit-worker] Processing ${row.id} (${row.website})`);

  const crawl = await crawlWebsite(row.website);
  const pageSpeedKeys = parsePageSpeedKeys(requireEnv("PAGESPEED_API_KEYS"));
  const pages = await discoverPages(row.website, crawl.html);
  // Sequential by design (see fetchSitePageSpeed's own doc comment) —
  // homepage first, so sitePageSpeed[0] doubles as the single-page report
  // the rest of the pipeline already expects.
  const sitePageSpeed = await fetchSitePageSpeed(pages, pageSpeedKeys);
  const pagespeed = sitePageSpeed[0].report;

  const needed = neededMcpServers({ tools: row.tools, ga4OAuthData: row.ga4_oauth_data, gtmOAuthData: row.gtm_oauth_data });
  const mcp = await buildMcpConfig(row.id, needed);
  let result: AuditResult;
  let htmlReport: string;

  try {
    const categories = await runAudit({
      website: row.website,
      tools: row.tools,
      pagespeed,
      sitePageSpeed,
      crawl,
      mcpConfigPath: mcp.configPath,
      businessName: row.business_name,
      userProvidedGa4Id: row.ga4_measurement_id,
      userProvidedGtmId: row.gtm_container_id,
      ga4OAuthData: row.ga4_oauth_data,
      gtmOAuthData: row.gtm_oauth_data,
    });

    const { earned, possible } = computeOverallPoints(categories);
    result = { categories, overallScore: earned, possiblePoints: possible, websiteUrl: row.website, businessName: row.business_name, sitePageSpeed };

    const report = await buildAuditHtmlReport(result);
    htmlReport = report.html;
  } finally {
    await mcp.cleanup();
  }

  const { publicUrl: reportUrl, slug } = await publishAuditReport({ requestId: row.id, html: htmlReport, businessName: row.business_name, website: row.website });

  // Parked for review, NOT emailed to the requester yet — sendAuditEmail
  // below only ever runs later, from processDueSends, once the reviewer has
  // approved and the 2-day delay has actually elapsed.
  const approvalToken = crypto.randomBytes(24).toString("hex");
  await markRequestAwaitingApproval(row.id, { reportUrl, approvalToken, categoriesAudited: result.categories.map(c => c.category) });

  const siteUrl = (process.env.PUBLIC_SITE_URL || "https://optimizers.agency").replace(/\/$/, "");
  const approveUrl = `${siteUrl}/api/audit-approve?id=${encodeURIComponent(row.id)}&token=${encodeURIComponent(approvalToken)}`;
  await sendInternalReviewEmail({
    to: REVIEWER_EMAIL,
    website: row.website,
    businessName: row.business_name,
    requesterEmail: row.email,
    reportUrl,
    approveUrl,
    slug,
  });

  console.log(`[audit-worker] Awaiting approval ${row.id} - overall score ${result.overallScore}/${result.possiblePoints}, report: ${reportUrl}`);
}

async function tick(): Promise<boolean> {
  const row = await claimNextPendingRequest();
  if (!row) return false;

  try {
    await processRequest(row);
  } catch (err: any) {
    if (isRateLimitError(err)) {
      try {
        const retryAfter = await markRequestRateLimited(row.id, row.retry_count, err?.message ?? String(err));
        console.warn(`[audit-worker] Rate-limited ${row.id}, retaining queue position - retrying after ${retryAfter.toISOString()}`);
      } catch (markErr) {
        console.error(`[audit-worker] Also failed to mark ${row.id} as rate-limited:`, markErr);
      }
      return true;
    }

    console.error(`[audit-worker] Failed ${row.id}:`, err);
    try {
      await markRequestFailed(row.id, err?.message ?? String(err));
    } catch (markErr) {
      console.error(`[audit-worker] Also failed to mark ${row.id} as failed:`, markErr);
    }
  }
  return true;
}

// Sends the client email for every approved audit whose 2-day delay has
// elapsed. Independent of the claude-audit queue above (no claude -p run,
// just email + a status flip), so it runs every loop iteration regardless of
// whether tick() found audit work — a due delivery shouldn't wait behind an
// unrelated long-running audit.
async function processDueSends(): Promise<void> {
  const due = await findDueScheduledRequests();
  for (const row of due) {
    try {
      await sendAuditEmail({
        to: row.email,
        website: row.website,
        businessName: row.business_name,
        reportUrl: row.report_url ?? undefined,
        categoriesAudited: row.categories_audited ?? [],
      });
      await markSentToClient(row.id);
      console.log(`[audit-worker] Sent to client ${row.id} (${row.email}), scheduled for ${row.scheduled_send_at}`);
    } catch (err) {
      console.error(`[audit-worker] Failed to send due delivery ${row.id}:`, err);
    }
  }
}

// At most once per UTC calendar day, after DAILY_DIGEST_HOUR_UTC — reads the
// last send from audit_digest_log (not in-memory) so a worker restart can't
// cause a duplicate or a skipped day.
async function maybeSendDailyDigest(): Promise<void> {
  const now = new Date();
  if (now.getUTCHours() < DAILY_DIGEST_HOUR_UTC) return;

  const today = now.toISOString().slice(0, 10);
  const lastSent = await getLastDigestDateUtc();
  if (lastSent === today) return;

  const rows = await findScheduledDeliveries();
  await sendDailyDigestEmail({
    to: REVIEWER_EMAIL,
    rows: rows.map(r => ({ email: r.email, website: r.website, businessName: r.business_name, dueAt: r.scheduled_send_at! })),
  });
  await recordDigestSent();
  console.log(`[audit-worker] Sent daily digest (${rows.length} pending) for ${today}`);
}

async function main() {
  const pollIntervalMs = Number(process.env.POLL_INTERVAL_MS ?? 60_000);
  console.log(`[audit-worker] Starting poll loop (every ${pollIntervalMs}ms)`);

  let running = true;
  process.on("SIGINT", () => {
    console.log("[audit-worker] SIGINT received, shutting down after current tick...");
    running = false;
  });
  process.on("SIGTERM", () => {
    console.log("[audit-worker] SIGTERM received, shutting down after current tick...");
    running = false;
  });

  while (running) {
    let foundWork = false;
    try {
      foundWork = await tick();
    } catch (err) {
      console.error("[audit-worker] Unexpected error in tick:", err);
    }

    try {
      await processDueSends();
    } catch (err) {
      console.error("[audit-worker] Unexpected error in processDueSends:", err);
    }

    try {
      await maybeSendDailyDigest();
    } catch (err) {
      console.error("[audit-worker] Unexpected error in maybeSendDailyDigest:", err);
    }

    // Drain the audit queue back-to-back while there is work; only sleep once empty.
    if (!foundWork) {
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }
}

main().catch(err => {
  console.error("[audit-worker] Fatal error:", err);
  process.exit(1);
});
