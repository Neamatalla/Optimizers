/**
 * Dev-only: sends a REAL internal-review email (via Resend) for a dummy
 * audit, using a real audit_requests row so the "Approve & schedule send"
 * link actually works when clicked — end-to-end validation of the
 * review/approve/delayed-send flow (poll.ts's processRequest tail +
 * api/_lib/audit-approve.js) without running a full live audit.
 *
 *   npm run test-send-review-email
 *
 * Requires the local dev server (npm run dev, port 5173) running if
 * PUBLIC_SITE_URL points at localhost — that's what serves both the
 * "View report" link and the "Approve" click target.
 */
import "dotenv/config";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { buildAuditHtmlReport } from "./html-report.js";
import { publishAuditReport, markRequestAwaitingApproval } from "./supabase.js";
import { sendInternalReviewEmail } from "./email.js";
import type { AuditResult } from "./types.js";

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY are not set — see audit-worker/.env.example");
  }
  const supabase = createClient(supabaseUrl, supabaseSecretKey);

  const website = "https://dummy-validation-store.example.com";
  const requesterEmail = "dummy-requester@example.com";
  const businessName = "Dummy Validation Store";

  const { data: row, error: insertError } = await supabase
    .from("audit_requests")
    .insert({ tools: ["GA4", "GTM"], website, email: requesterEmail, business_name: businessName })
    .select()
    .single();
  if (insertError) throw new Error(`Insert failed: ${insertError.message}`);
  console.log(`[test-send-review-email] Dummy audit_requests row: ${row.id}`);

  const result: AuditResult = {
    websiteUrl: website,
    businessName,
    sitePageSpeed: [],
    possiblePoints: 6,
    overallScore: 3,
    categories: [
      {
        category: "GA4",
        score: 33,
        checklistTally: { total: 3, evaluated: 3, passed: 1 },
        findings: [
          { checklistId: "GA4-D1", issue: "[DUMMY] Purchase events fire with $0 revenue on most real transactions", businessImpact: "[DUMMY DATA — for validating the review-email flow only.]", dataSource: "live", severity: "critical", status: "fail" },
          { checklistId: "GA4-5", issue: "[DUMMY] Email/PII redaction is off for the primary web data stream", businessImpact: "[DUMMY DATA — for validating the review-email flow only.]", dataSource: "live", severity: "critical", status: "fail" },
          { checklistId: "GA4-8", issue: "[DUMMY] Attribution model correctly set to data-driven", businessImpact: "[DUMMY DATA — for validating the review-email flow only.]", dataSource: "live", severity: "medium", status: "pass" },
        ],
      },
      {
        category: "GTM",
        score: 66,
        checklistTally: { total: 3, evaluated: 3, passed: 2 },
        findings: [
          { checklistId: "GTM-2", issue: "[DUMMY] Two active GA4 Configuration tags in the same container", businessImpact: "[DUMMY DATA — for validating the review-email flow only.]", dataSource: "detection", severity: "critical", status: "fail" },
          { checklistId: "GTM-7", issue: "[DUMMY] Google Ads conversion tag has a transaction_id set correctly", businessImpact: "[DUMMY DATA — for validating the review-email flow only.]", dataSource: "detection", severity: "medium", status: "pass" },
          { checklistId: "GTM-13", issue: "[DUMMY] Tags use native types, not raw Custom HTML", businessImpact: "[DUMMY DATA — for validating the review-email flow only.]", dataSource: "detection", severity: "low", status: "pass" },
        ],
      },
    ],
  };

  const { html } = await buildAuditHtmlReport(result);
  const { publicUrl: reportUrl, slug } = await publishAuditReport({ requestId: row.id, html, businessName, website });
  console.log(`[test-send-review-email] Published: ${reportUrl}`);

  const approvalToken = crypto.randomBytes(24).toString("hex");
  await markRequestAwaitingApproval(row.id, { reportUrl, approvalToken, categoriesAudited: result.categories.map(c => c.category) });

  const siteUrl = (process.env.PUBLIC_SITE_URL || "https://optimizers.agency").replace(/\/$/, "");
  const approveUrl = `${siteUrl}/api/audit-approve?id=${encodeURIComponent(row.id)}&token=${encodeURIComponent(approvalToken)}`;
  const reviewerEmail = process.env.AUDIT_REVIEWER_EMAIL || "omar@optimizers.agency";

  await sendInternalReviewEmail({ to: reviewerEmail, website, businessName, requesterEmail, reportUrl, approveUrl, slug });

  console.log(`[test-send-review-email] Sent internal review email to ${reviewerEmail}`);
  console.log(`[test-send-review-email] Approve link: ${approveUrl}`);
}

main().catch(err => {
  console.error("[test-send-review-email] Failed:", err);
  process.exit(1);
});
