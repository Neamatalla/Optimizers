/**
 * Dev-only: sends the REAL daily due-dates digest (via Resend, using the
 * production sendDailyDigestEmail + findScheduledDeliveries) right now,
 * bypassing maybeSendDailyDigest's once-per-day/after-hour gate — for
 * validating the digest email's content without waiting for the real
 * schedule. Inserts a couple of extra dummy 'scheduled' rows first so the
 * table isn't just the one row from test-send-review-email.
 *
 *   npm run test-send-digest-email
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { findScheduledDeliveries } from "./supabase.js";
import { sendDailyDigestEmail } from "./email.js";

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY are not set — see audit-worker/.env.example");
  }
  const supabase = createClient(supabaseUrl, supabaseSecretKey);

  const now = Date.now();
  const dummyRows = [
    {
      tools: ["GA4"],
      website: "https://second-dummy-shop.example.com",
      email: "dummy-requester-2@example.com",
      business_name: "Second Dummy Shop",
      status: "scheduled",
      approved_at: new Date(now).toISOString(),
      scheduled_send_at: new Date(now + 1 * 24 * 60 * 60 * 1000).toISOString(), // due tomorrow
    },
    {
      tools: ["GTM"],
      website: "https://third-dummy-brand.example.com",
      email: "dummy-requester-3@example.com",
      business_name: "Third Dummy Brand",
      status: "scheduled",
      approved_at: new Date(now).toISOString(),
      scheduled_send_at: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString(), // due in 2 days
    },
  ];

  const { error: insertError } = await supabase.from("audit_requests").insert(dummyRows);
  if (insertError) throw new Error(`Insert failed: ${insertError.message}`);
  console.log(`[test-send-digest-email] Inserted ${dummyRows.length} extra dummy 'scheduled' rows.`);

  const rows = await findScheduledDeliveries();
  console.log(`[test-send-digest-email] ${rows.length} total 'scheduled' rows found (includes any from earlier test runs).`);

  const reviewerEmail = process.env.AUDIT_REVIEWER_EMAIL || "omar@optimizers.agency";
  await sendDailyDigestEmail({
    to: reviewerEmail,
    rows: rows.map(r => ({ email: r.email, website: r.website, businessName: r.business_name, dueAt: r.scheduled_send_at! })),
  });

  console.log(`[test-send-digest-email] Sent daily digest to ${reviewerEmail} (${rows.length} pending rows).`);
}

main().catch(err => {
  console.error("[test-send-digest-email] Failed:", err);
  process.exit(1);
});
