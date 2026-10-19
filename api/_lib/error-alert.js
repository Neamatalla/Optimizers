// Emails the reviewer when an API route answers 5xx or crashes, so a broken
// form doesn't go unnoticed until someone happens to open the Vercel logs.
// Production only (not dev, not previews), and at most one email per route
// every ALERT_GAP_MS, so a broken endpoint can't flood the inbox. The gap is
// kept in memory: each running Vercel instance has its own, so a burst across
// several instances can still send a few, which is fine for a heads-up.
import { escapeHtml } from "./escape-html.js";

const ALERT_GAP_MS = 15 * 60 * 1000;
const lastSent = new Map();

/** Returns whether an email went out. Throws only if Resend itself fails. */
export async function sendErrorAlert({ route, status, error, auditId, slug }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (process.env.VERCEL_ENV !== "production" || !apiKey) return false;

  const now = Date.now();
  if (now - (lastSent.get(route) ?? 0) < ALERT_GAP_MS) return false;
  lastSent.set(route, now);

  // Imported here, not at the top: audit-intake.js logs through log.js,
  // which calls this file, and a static import would make that a cycle.
  const { auditNotifyEmail } = await import("./audit-intake.js");
  const { Resend } = await import("resend");

  const rows = [
    ["Route", `/api/${route}`],
    ["Status", status],
    ["Error", error],
    ["Audit ID", auditId],
    ["Report slug", slug],
    ["Time (UTC)", new Date(now).toISOString()],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  const { error: sendError } = await new Resend(apiKey).emails.send({
    from: "Optimizers <hello@optimizers.agency>",
    to: [auditNotifyEmail()],
    subject: `API error: /api/${route} ${status === "crashed" ? "crashed" : `returned ${status}`}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #263328;">An API route failed</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          ${rows.map(([label, value]) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${label}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(String(value))}</td>
          </tr>`).join("")}
        </table>
        <p style="color: #666; font-size: 12px;">
          Search the audit ID or the time in the Vercel runtime logs for the full story.
          More failures on this route in the next 15 minutes won't send another email.
        </p>
      </div>
    `.trim(),
  });
  if (sendError) throw new Error(sendError.message || "Resend error");
  return true;
}

// Tests only: forget which routes were alerted.
export function resetErrorAlerts() {
  lastSent.clear();
}
