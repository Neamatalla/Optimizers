import "./logger.js";
import "dotenv/config";
import crypto from "node:crypto";
import os from "node:os";
import {
  claimNextRequest,
  heartbeat,
  saveProgress,
  scheduleRetry,
  LostLeaseError,
  HEARTBEAT_MS,
  markRequestFailed,
  markRequestRateLimited,
  markRequestAwaitingApproval,
  markTestRequestSent,
  publishAuditReport,
  findDueScheduledRequests,
  markSentToClient,
  findScheduledDeliveries,
  getLastDigestDateUtc,
  recordDigestSent,
} from "./supabase.js";
import { crawlWebsite } from "./crawl.js";
import { captureSiteScreenshots } from "./screenshots.js";
import { discoverPages } from "./discover-pages.js";
import { runPageSpeed } from "./pagespeed.js";
import { buildMcpConfig, neededMcpServers } from "./mcp-config.js";
import { runAudit } from "./audit-prompt.js";
import { computeOverallPoints } from "./scoring.js";
import { buildAuditHtmlReport } from "./html-report.js";
import { translateFindingsToArabic } from "./translate-ar.js";
import { sendAuditEmail, sendInternalReviewEmail, sendDailyDigestEmail, sendAuditFailedEmail } from "./email.js";
import type { AuditRequestRow, AuditResult, JobProgress } from "./types.js";

// Identifies this process in audit_requests.locked_by, so two workers (or a
// restarted one) can tell whose lease a row is under.
const WORKER_ID = `${os.hostname()}-${process.pid}`;
// Real attempts before a request is marked failed and the reviewer emailed.
// Rate limits don't count (they give their attempt back).
const MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS ?? 3);
// Wait before attempt 2, 3, ... (the last value repeats if MAX_ATTEMPTS is raised).
const RETRY_BACKOFF_MINUTES = [2, 10, 30];

// Every completed audit is emailed here first for review — never straight to
// the requester. See processRequest's tail and api/_lib/audit-approve.js.
const REVIEWER_EMAIL = process.env.AUDIT_REVIEWER_EMAIL || "omar@optimizers.agency";
// Roughly "end of day" for a Cairo-based reviewer (UTC+2/+3) without pulling
// in a timezone library for one comparison — override via env if that drifts.
const DAILY_DIGEST_HOUR_UTC = Number(process.env.DAILY_DIGEST_HOUR_UTC ?? 20);

// Heuristic match against whatever `claude -p` printed (see claude.ts, which
// reports BOTH its streams for exactly this reason) or a thrown Google API
// error surfaces — there's no structured error type to inspect across both
// sources, just message text. False negatives just mean a rate-limited run
// gets marked failed instead of retained (safe); false positives would
// wrongly retry a real failure, which is why this stays narrow to actual
// rate/quota vocabulary rather than e.g. generic "error". "usage limit" is
// the Claude CLI's own wording for a plan limit, distinct from an API 429.
function isRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /rate.?limit|usage limit|429|quota|resource_exhausted|too many requests|overloaded/i.test(message);
}

/**
 * When the limit message says WHEN it resets, honour that instead of the
 * blind 5/10/20/40/60-minute backoff. A plan usage limit resets at a fixed
 * wall-clock time — often hours out — so exponential backoff just burns a
 * claim-and-fail cycle every hour until then, and each of those cycles
 * re-marks the row and re-logs a failure for no reason.
 *
 * The Claude CLI reports the reset as a unix timestamp in its limit message
 * (the "Claude AI usage limit reached|<epoch>" shape); an ISO timestamp is
 * also accepted since the API's own error bodies use that. Anything else
 * returns null and the caller falls back to the backoff, which is still the
 * right behaviour for a genuine rate limit (as opposed to a plan limit),
 * where capacity returns in seconds rather than at an appointed hour.
 *
 * A parsed time in the past, or absurdly far out, is rejected — a bad parse
 * shouldn't strand a request for a week.
 */
function parseLimitResetAt(err: unknown): Date | null {
  const message = err instanceof Error ? err.message : String(err);
  const now = Date.now();
  const MAX_WAIT_MS = 12 * 60 * 60 * 1000;

  const candidates: number[] = [];
  // "usage limit reached|1757440800" — the CLI's own format. Seconds or ms.
  for (const m of message.matchAll(/limit[^|]*\|\s*(\d{10,13})/gi)) {
    const raw = Number(m[1]);
    candidates.push(raw < 1e12 ? raw * 1000 : raw);
  }
  for (const m of message.matchAll(/"?(?:resets?_at|retry_after_epoch)"?\s*[:=]\s*"?(\d{10,13})"?/gi)) {
    const raw = Number(m[1]);
    candidates.push(raw < 1e12 ? raw * 1000 : raw);
  }
  for (const m of message.matchAll(/\b(\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:?\d{2}))/g)) {
    const parsed = Date.parse(m[1]);
    if (!Number.isNaN(parsed)) candidates.push(parsed);
  }

  const usable = candidates.filter(t => t > now && t - now <= MAX_WAIT_MS).sort((a, b) => a - b);
  return usable.length ? new Date(usable[0]) : null;
}

/**
 * Runs one audit request as a sequence of resumable stages. After each stage
 * its output is saved to row.progress, so a retry (after a crash, a lost
 * lease or a failed attempt) skips everything that already finished:
 *
 *   1. audit      crawl + claude -p audit + PageSpeed + screenshots
 *   2. translate  Arabic text for every finding (best-effort)
 *   3. publish    build the HTML report and upload it
 *   4. deliver    test run: email the requester. Real run: email the
 *                 reviewer, then park the row for approval.
 *
 * Emails are recorded the moment they succeed, so none is ever sent twice.
 */
async function processRequest(row: AuditRequestRow, workerId: string): Promise<void> {
  const progress: JobProgress = { ...(row.progress ?? {}) };
  const done = [progress.categories && "audit", progress.translated && "translate", progress.reportUrl && "publish"].filter(Boolean);
  console.log(
    `[audit-worker] Processing ${row.id} (${row.website}), attempt ${row.attempts}/${MAX_ATTEMPTS}` +
    (done.length ? `, resuming after: ${done.join(", ")}` : ""),
  );
  const save = () => saveProgress(row.id, workerId, progress);
  // Before any email: confirm we still own the row, so a worker that lost
  // its lease never emails on top of the worker that took over.
  const ensureLease = async () => {
    if (!(await heartbeat(row.id, workerId))) throw new LostLeaseError(`Lost the lease on ${row.id}`);
  };

  // 1. audit
  if (!progress.categories) {
    const crawl = await crawlWebsite(row.website);
    // Homepage first, then one representative page per commerce-relevant
    // type — the browser checks that need a specific page type pick from
    // here (see audit-prompt.ts).
    const discoveredPages = await discoverPages(row.website, crawl.html);
    // Started now, awaited after the main audit, so its PSI calls overlap it instead of adding to the run time.
    const pageSpeedPromise = runPageSpeed(discoveredPages);

    // Illustration for the report hero, not audit evidence — best-effort, and
    // deliberately not allowed to fail the run (see screenshots.ts).
    const screenshots = await captureSiteScreenshots(row.website);
    if (screenshots.error) {
      console.warn(`[audit-worker] Screenshots unavailable for ${row.id}: ${screenshots.error}`);
    } else {
      console.log(`[audit-worker] Captured site screenshots (desktop: ${Boolean(screenshots.desktop)}, mobile: ${Boolean(screenshots.mobile)})`);
    }

    const needed = neededMcpServers({ tools: row.tools, ga4OAuthData: row.ga4_oauth_data, gtmOAuthData: row.gtm_oauth_data });
    const mcp = await buildMcpConfig(row.id, needed);
    let categories;
    try {
      categories = await runAudit({
        website: row.website,
        tools: row.tools,
        discoveredPages,
        crawl,
        mcpConfigPath: mcp.configPath,
        businessName: row.business_name,
        userProvidedGa4Id: row.ga4_measurement_id,
        userProvidedGtmId: row.gtm_container_id,
        ga4OAuthData: row.ga4_oauth_data,
        gtmOAuthData: row.gtm_oauth_data,
      });
    } finally {
      await mcp.cleanup();
    }

    const pageSpeed = await pageSpeedPromise;
    if (pageSpeed.error) {
      console.warn(`[audit-worker] PageSpeed unavailable for ${row.id}: ${pageSpeed.error}`);
    } else {
      console.log(`[audit-worker] PageSpeed scored ${pageSpeed.pages.length} pages (avg mobile ${pageSpeed.average.mobile}, desktop ${pageSpeed.average.desktop})`);
    }
    Object.assign(progress, { categories, discoveredPages, pageSpeed, screenshots: { desktop: screenshots.desktop, mobile: screenshots.mobile } });
    await save();
    console.log(`[audit-worker] Saved audit result for ${row.id}`);
  }

  const categories = progress.categories!;
  const { earned, possible } = computeOverallPoints(categories);
  const result: AuditResult = {
    categories,
    overallScore: earned,
    possiblePoints: possible,
    websiteUrl: row.website,
    businessName: row.business_name,
    discoveredPages: progress.discoveredPages ?? [],
    pageSpeed: progress.pageSpeed,
    screenshots: progress.screenshots,
  };
  const categoriesAudited = categories.map(c => c.category);

  // 2. translate — best-effort, same contract as screenshots: never allowed
  // to fail a run that otherwise produced 50 real findings (translate-ar.ts).
  // It writes the Arabic straight onto result.categories, which is the same
  // array saved in progress.
  if (!progress.translated) {
    const arabic = await translateFindingsToArabic(result, row.id);
    if (arabic.error) {
      console.warn(`[audit-worker] Arabic translation unavailable for ${row.id}: ${arabic.error}`);
    } else {
      console.log(`[audit-worker] Translated ${arabic.translated}/${arabic.total} findings to Arabic`);
    }
    progress.translated = true;
    await save();
  }

  // 3. publish
  if (!progress.reportUrl) {
    const report = await buildAuditHtmlReport(result);
    const { publicUrl, slug } = await publishAuditReport({ requestId: row.id, html: report.html, businessName: row.business_name, website: row.website, isTest: row.is_test });
    Object.assign(progress, { reportUrl: publicUrl, slug });
    await save();
  }
  const reportUrl = progress.reportUrl!;

  // 4. deliver. Test mode (both fields submitted with a leading "-", see
  // api/_lib/audit-intake.js) skips the review queue entirely: straight to
  // whoever was in the form, no approval token, row goes to 'done' here.
  if (row.is_test) {
    if (!progress.testEmailSent) {
      await ensureLease();
      await sendAuditEmail({ to: row.email, website: row.website, businessName: row.business_name, reportUrl, categoriesAudited, isTest: true });
      progress.testEmailSent = true;
      await save();
    }
    await markTestRequestSent(row.id, { reportUrl, categoriesAudited });
    console.log(`[audit-worker] TEST run ${row.id} - overall score ${result.overallScore}/${result.possiblePoints}, emailed ${row.email} directly, report: ${reportUrl}`);
    return;
  }

  // Parked for review, NOT emailed to the requester yet — sendAuditEmail only
  // runs later, from processDueSends, once the reviewer has approved and the
  // 2-day delay has elapsed. The token is saved before the email so a retry
  // reuses the same approval link instead of minting a second one.
  if (!progress.approvalToken) {
    progress.approvalToken = crypto.randomBytes(24).toString("hex");
    await save();
  }
  if (!progress.reviewEmailSent) {
    await ensureLease();
    const siteUrl = (process.env.PUBLIC_SITE_URL || "https://optimizers.agency").replace(/\/$/, "");
    const approveUrl = `${siteUrl}/api/audit-approve?id=${encodeURIComponent(row.id)}&token=${encodeURIComponent(progress.approvalToken)}`;
    await sendInternalReviewEmail({
      to: REVIEWER_EMAIL,
      website: row.website,
      businessName: row.business_name,
      requesterEmail: row.email,
      reportUrl,
      approveUrl,
      slug: progress.slug ?? "",
    });
    progress.reviewEmailSent = true;
    await save();
  }
  await markRequestAwaitingApproval(row.id, { reportUrl, approvalToken: progress.approvalToken, categoriesAudited });

  console.log(`[audit-worker] Awaiting approval ${row.id} - overall score ${result.overallScore}/${result.possiblePoints}, report: ${reportUrl}`);
}

async function tick(): Promise<boolean> {
  const row = await claimNextRequest(WORKER_ID);
  if (!row) return false;

  // Keeps the lease alive through long claude -p runs. A missed beat is only
  // logged: the lease survives several, and saveProgress/ensureLease are what
  // actually stop work if it is lost.
  const beat = setInterval(() => {
    heartbeat(row.id, WORKER_ID).catch(err => console.warn(`[audit-worker] Heartbeat failed for ${row.id}:`, err?.message ?? err));
  }, HEARTBEAT_MS);

  try {
    await processRequest(row, WORKER_ID);
  } catch (err: any) {
    const message = err?.message ?? String(err);

    if (err instanceof LostLeaseError) {
      console.warn(`[audit-worker] ${message}; another worker owns it now, stopping without touching the row`);
      return true;
    }

    if (isRateLimitError(err)) {
      try {
        const resetAt = parseLimitResetAt(err);
        const retryAfter = await markRequestRateLimited(row.id, row.retry_count, row.attempts - 1, message, resetAt);
        console.warn(
          `[audit-worker] Usage/rate limit on ${row.id}, retaining queue position - retrying after ${retryAfter.toISOString()}` +
          (resetAt ? " (the limit's own stated reset time)" : " (backoff; no reset time in the message)"),
        );
      } catch (markErr) {
        console.error(`[audit-worker] Also failed to mark ${row.id} as rate-limited:`, markErr);
      }
      return true;
    }

    if (row.attempts < MAX_ATTEMPTS) {
      const minutes = RETRY_BACKOFF_MINUTES[Math.min(row.attempts - 1, RETRY_BACKOFF_MINUTES.length - 1)];
      const retryAfter = new Date(Date.now() + minutes * 60_000);
      console.error(`[audit-worker] Attempt ${row.attempts}/${MAX_ATTEMPTS} failed for ${row.id}, retrying after ${retryAfter.toISOString()}:`, err);
      try {
        await scheduleRetry(row.id, message, retryAfter);
      } catch (markErr) {
        // The lease will expire and another claim will pick it up anyway.
        console.error(`[audit-worker] Also failed to schedule a retry for ${row.id}:`, markErr);
      }
      return true;
    }

    console.error(`[audit-worker] Failed ${row.id} after ${row.attempts} attempts, giving up:`, err);
    try {
      await markRequestFailed(row.id, message);
    } catch (markErr) {
      console.error(`[audit-worker] Also failed to mark ${row.id} as failed:`, markErr);
    }
    try {
      await sendAuditFailedEmail({
        to: REVIEWER_EMAIL,
        requestId: row.id,
        website: row.website,
        businessName: row.business_name,
        requesterEmail: row.email,
        attempts: row.attempts,
        error: message,
        isTest: row.is_test,
      });
    } catch (mailErr) {
      console.error(`[audit-worker] Also failed to email the reviewer about ${row.id}:`, mailErr);
    }
  } finally {
    clearInterval(beat);
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
  console.log(`[audit-worker] Starting poll loop (every ${pollIntervalMs}ms) as ${WORKER_ID}, up to ${MAX_ATTEMPTS} attempts per request`);

  // Every report link this worker emails is built from PUBLIC_SITE_URL (see
  // supabase.ts's publishAuditReport), so a stale value is the one config
  // mistake that produces working audits with dead links — most easily hit
  // when serving through a tunnel (ngrok) whose host changed since the last
  // run, or when it was left pointing at localhost. Printing it up front
  // makes that visible before an audit finishes rather than after the email
  // has already gone out.
  const siteUrlForLinks = process.env.PUBLIC_SITE_URL || "https://optimizers.agency";
  console.log(`[audit-worker] Report links will point at ${siteUrlForLinks}/audit-reports/<slug>`);
  if (/localhost|127\.0\.0\.1/.test(siteUrlForLinks)) {
    console.warn(`[audit-worker] PUBLIC_SITE_URL is a localhost address — emailed links will only open on this machine. Set it to your tunnel/production origin before sending anything to a real inbox.`);
  }
  console.log(`[audit-worker] Reviewer: ${REVIEWER_EMAIL} · reports bucket: ${process.env.AUDIT_REPORTS_BUCKET || "audit-reports"} · test bucket: ${process.env.AUDIT_REPORTS_TEST_BUCKET || "audit-reports-test"}`);

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
