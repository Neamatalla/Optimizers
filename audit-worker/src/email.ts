import { Resend } from "resend";
import type { CategoryKey } from "./types.js";

// Human phrase per category, in a fixed display order — GA4/GTM first when
// present since they're the higher-intent "we connected your tools" story,
// Website always last since it's the one present on all but the
// both-tools run.
const CATEGORY_PHRASES: Record<CategoryKey, string> = {
  GA4: "Google Analytics setup",
  GTM: "Tag Manager setup",
  Website: "website",
};

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const CATEGORY_ORDER: CategoryKey[] = ["GA4", "GTM", "Website"];

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

// Built from what actually ran (result.categories — the ground truth once
// an audit exists, same reasoning as scoring.ts's own doc comment on this),
// not the visitor's tool selection — so a "none of these" run correctly
// says "your website's code" instead of a copy-pasted sentence claiming
// analytics/tag-management coverage that never happened.
function coverageSentence(categoriesAudited: CategoryKey[]): string {
  const phrases = CATEGORY_ORDER.filter(c => categoriesAudited.includes(c)).map(c => CATEGORY_PHRASES[c]);
  return joinWithAnd(phrases);
}

export interface SendAuditEmailOptions {
  to: string;
  website: string;
  businessName: string | null;
  categoriesAudited: CategoryKey[];
  // Exactly one of these two is provided by the caller: the normal
  // production path (poll.ts) always has a hosted reportUrl (Supabase
  // Storage — see supabase.ts's publishAuditReport), since the visitor
  // needs a stable link that works from any device, not just the machine
  // that ran the audit. `attachment` is a dev-only fallback test-run.ts uses
  // when Supabase isn't configured locally, so `npm run test-run --email=`
  // still actually sends something to look at instead of failing outright.
  reportUrl?: string;
  attachment?: { filename: string; html: string };
  // Test-mode run (both form fields submitted with a leading "-" — see
  // api/_lib/audit-intake.js's parseTestPrefix). Exactly the email a real
  // requester would get, but subject-tagged and banner-topped, so a test
  // that lands in a real inbox can never be mistaken for a reviewed,
  // client-ready audit.
  isTest?: boolean;
}

export async function sendAuditEmail(opts: SendAuditEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set - see audit-worker/.env.example");
  }
  if (!opts.reportUrl && !opts.attachment) {
    throw new Error("sendAuditEmail needs either a reportUrl or an attachment");
  }

  const siteUrl = (process.env.PUBLIC_SITE_URL || "https://optimizers.agency").replace(/\/$/, "");
  const bookUrl = `${siteUrl}/#contact`;
  const name = opts.businessName ? escapeHtml(opts.businessName) : null;
  const website = escapeHtml(opts.website.replace(/^https?:\/\//, "").replace(/\/$/, ""));
  const coverage = coverageSentence(opts.categoriesAudited) || "website";
  const p = "color: #2b332c; font-size: 15px; line-height: 1.7; margin: 0 0 16px;";
  const button = (href: string, label: string, primary: boolean) =>
    `<a href="${href}" style="display: inline-block; background: ${primary ? "#263328" : "#6ae499"}; color: ${primary ? "#ffffff" : "#0e1a10"}; font-weight: bold; font-size: 15px; text-decoration: none; padding: 14px 24px; border-radius: 999px;">${label}</a>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Optimizers <hello@optimizers.agency>",
    to: [opts.to],
    subject: `${opts.isTest ? "[TEST] " : ""}${opts.businessName ? `${opts.businessName}, your free audit is ready` : "Your free website audit is ready"}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 8px 4px;">
        ${opts.isTest ? `<p style="background: #fff4e0; border: 1px solid #f2b75e; border-radius: 8px; color: #7a4b00; font-size: 13px; line-height: 1.6; padding: 10px 14px; margin: 0 0 18px;">
          <b>Test run.</b> Submitted in test mode, so this skipped the internal review step and came straight here. The report itself is stored in the test bucket, not alongside real client reports.
        </p>` : ""}
        <h1 style="color: #263328; font-size: 24px; line-height: 1.3; margin: 0 0 20px;">Your audit is ready${name ? `, ${name}` : ""}!</h1>
        <p style="${p}">${name ? `Hi ${name} team,` : "Hi there,"}</p>
        <p style="${p}">
          Thank you for trusting us with a look at ${website}. Our team has gone through your ${coverage} and put everything
          we found into one clear report: what is already working well, what is quietly costing you sales, and what to fix first.
        </p>
        <p style="${p}">
          ${opts.reportUrl ? "Grab a coffee and have a look. It is written in plain language, so you do not need to be technical to follow it." : "Your full report is attached to this email. It is written in plain language, so you do not need to be technical to follow it."}
        </p>
        ${opts.reportUrl ? `<p style="margin: 24px 0 32px;">${button(opts.reportUrl, "See my audit", true)}</p>` : ""}
        <h2 style="color: #263328; font-size: 18px; margin: 8px 0 12px;">So, what's next?</h2>
        <p style="${p}">
          The good news: most of what we found can be fixed, and the biggest wins often take days, not months. That is exactly
          what we do. For over 8 years we have helped e-commerce brands turn more of the visitors they already have into
          customers, without spending more on ads. And if we don't improve your conversions, you don't pay.
        </p>
        <p style="${p}">
          Want us to walk you through it? Book a free call and we will go through your results together, point out the quickest
          wins, and show you exactly what we would do for your store. No pressure and no jargon.
        </p>
        <p style="margin: 24px 0 32px;">${button(bookUrl, "Book my free call", false)}</p>
        <p style="${p}">Talk soon,<br /><b>The Optimizers team</b></p>
        <p style="color: #7a857b; font-size: 12px; line-height: 1.6; margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e6e2;">
          You are receiving this because you requested a free audit at <a href="${siteUrl}" style="color: #7a857b;">optimizers.agency</a>.
        </p>
      </div>
    `.trim(),
    attachments: opts.attachment
      ? [{ filename: opts.attachment.filename, content: Buffer.from(opts.attachment.html, "utf8").toString("base64") }]
      : undefined,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }
}

export interface SendInternalReviewEmailOptions {
  to: string;
  website: string;
  businessName: string | null;
  requesterEmail: string;
  reportUrl: string;
  approveUrl: string;
  slug: string;
}

// Sent the moment an audit finishes — the requester does NOT get their copy
// yet (see sendAuditEmail, now only called from poll.ts's due-send check).
// This goes to the reviewer instead, with a one-click approve link that
// starts the 2-day delay (api/_lib/audit-approve.js) and the report slug
// needed for the existing /api/report/edit path.
export async function sendInternalReviewEmail(opts: SendInternalReviewEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set - see audit-worker/.env.example");
  }

  // Attached so the reviewer can hand both straight to Claude ("here's the
  // key and slug, fetch the report, here's what to change") without having
  // to go look them up separately. Same credential that authenticates
  // /api/report/edit (see api/_lib/report-edit.js) — omitted from the email
  // entirely if unset rather than rendering an empty/broken-looking block.
  const editApiKey = process.env.REPORT_EDIT_API_KEY;
  const siteUrl = (process.env.PUBLIC_SITE_URL || "https://optimizers.agency").replace(/\/$/, "");
  const editEndpoint = `${siteUrl}/api/report/edit`;
  const editSection = editApiKey
    ? `
        <div style="background: #f5f5f5; border-radius: 8px; padding: 14px 18px; margin-top: 16px;">
          <p style="color: #263328; font-size: 13px; font-weight: bold; margin: 0 0 8px;">Editing this report</p>
          <p style="color: #333; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
            Give these to Claude along with what you want changed — it can GET the
            current html, edit it, then PATCH it back:
          </p>
          <p style="color: #333; font-size: 13px; line-height: 1.8; margin: 0; font-family: monospace;">
            Endpoint: ${editEndpoint}<br/>
            Slug: ${opts.slug}<br/>
            x-api-key: ${editApiKey}
          </p>
        </div>`
    : "";

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Optimizers Audits <hello@optimizers.agency>",
    to: [opts.to],
    subject: `Review needed: audit for ${opts.businessName || opts.website}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #263328; border-bottom: 2px solid #6ae499; padding-bottom: 10px;">
          Audit ready for review
        </h2>
        <p style="color: #333; font-size: 14px; line-height: 1.6;">
          Site: <b>${opts.website}</b><br/>
          Requested by: <b>${opts.requesterEmail}</b><br/>
          Report slug (for the <code>/api/report/edit</code> path): <code>${opts.slug}</code>
        </p>
        <p style="font-size: 14px; line-height: 1.6;">
          <a href="${opts.reportUrl}" style="display: inline-block; background: #263328; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 18px; border-radius: 999px; margin-right: 8px;">
            Review
          </a>
          <a href="${opts.approveUrl}" style="display: inline-block; background: #6ae499; color: #263328; font-weight: bold; text-decoration: none; padding: 12px 18px; border-radius: 999px;">
            Approve &amp; schedule send
          </a>
        </p>
        <p style="color: #666; font-size: 12px; line-height: 1.6; margin-top: 16px;">
          Approving schedules the client email for 2 days from now. Edit the live
          report any time before then via the report-edit API using the slug above.
        </p>${editSection}
      </div>
    `.trim(),
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }
}

// Sent once, when a request has used up every attempt and been marked
// failed, so a stuck audit never sits unnoticed in the queue.
export async function sendAuditFailedEmail(opts: {
  to: string;
  requestId: string;
  website: string;
  businessName: string | null;
  requesterEmail: string;
  attempts: number;
  error: string;
  isTest: boolean;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set - see audit-worker/.env.example");
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Optimizers Audits <hello@optimizers.agency>",
    to: [opts.to],
    subject: `${opts.isTest ? "[TEST] " : ""}Audit failed after ${opts.attempts} attempts: ${opts.businessName || opts.website}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <h2 style="color: #7a1f14; border-bottom: 2px solid #ff6b57; padding-bottom: 10px;">Audit failed</h2>
        <p style="color: #333; font-size: 14px; line-height: 1.6;">
          The audit for <b>${escapeHtml(opts.website)}</b> (requested by ${escapeHtml(opts.requesterEmail)}) failed ${opts.attempts} times and has stopped retrying.
          The requester has not been emailed.
        </p>
        <p style="color: #333; font-size: 13px; margin: 0 0 6px;"><b>Last error</b></p>
        <pre style="background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px; padding: 12px; font-size: 12px; white-space: pre-wrap; word-break: break-word;">${escapeHtml(opts.error.slice(0, 2000))}</pre>
        <p style="color: #333; font-size: 13px; line-height: 1.6;">
          Once the cause is fixed, retry it from the audit-worker folder with:<br />
          <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px;">npm run requeue -- ${opts.requestId}</code><br />
          It resumes from the last stage that finished.
        </p>
      </div>
    `.trim(),
  });
  if (error) throw new Error(`Resend API error: ${error.message}`);
}

// Sent when the worker finds Claude logged out (at startup, or later if the
// login stops working). While logged out it claims nothing, so requests wait
// in the queue instead of failing; this email is how anyone finds out.
export async function sendClaudeLoginAlertEmail(opts: { to: string; workerId: string; detail: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set - see audit-worker/.env.example");
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Optimizers Audits <hello@optimizers.agency>",
    to: [opts.to],
    subject: "Audit worker is paused: Claude isn't logged in",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <h2 style="color: #7a1f14; border-bottom: 2px solid #ff6b57; padding-bottom: 10px;">Audit worker paused</h2>
        <p style="color: #333; font-size: 14px; line-height: 1.6;">
          The audit worker <b>${escapeHtml(opts.workerId)}</b> can't use Claude, so it has stopped picking up audit requests.
          Nothing is lost: new requests wait in the queue and are processed once Claude is logged in again.
          Approved audits still go out to clients on schedule.
        </p>
        <p style="color: #333; font-size: 13px; margin: 0 0 6px;"><b>What it found</b></p>
        <pre style="background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px; padding: 12px; font-size: 12px; white-space: pre-wrap; word-break: break-word;">${escapeHtml(opts.detail)}</pre>
        <p style="color: #333; font-size: 13px; line-height: 1.6;">
          To fix it, open a shell in the worker's container (<code style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px;">railway ssh</code>, or
          <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px;">docker exec -it audit-worker bash</code> locally), run
          <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px;">claude</code> and then <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px;">/login</code>.
          The worker notices within a minute; no restart needed.
        </p>
      </div>
    `.trim(),
  });
  if (error) throw new Error(`Resend API error: ${error.message}`);
}

export interface DigestRow {
  email: string;
  website: string;
  businessName: string | null;
  dueAt: string;
}

// One per calendar day (see poll.ts's maybeSendDailyDigest) — every approved
// audit still waiting on its 2-day delay, so the reviewer always knows what's
// due and when without having to query Supabase directly.
export async function sendDailyDigestEmail(opts: { to: string; rows: DigestRow[] }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set - see audit-worker/.env.example");
  }

  const resend = new Resend(apiKey);
  const tableRows = opts.rows.length > 0
    ? opts.rows.map(r => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${r.email}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${r.businessName ? `${r.businessName} — ` : ""}${r.website}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${new Date(r.dueAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</td>
        </tr>`).join("")
    : `<tr><td colspan="3" style="padding: 10px; border: 1px solid #ddd; color: #666;">Nothing pending client delivery right now.</td></tr>`;

  const { error } = await resend.emails.send({
    from: "Optimizers Audits <hello@optimizers.agency>",
    to: [opts.to],
    subject: `Audit delivery due dates — ${opts.rows.length} pending`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <h2 style="color: #263328; border-bottom: 2px solid #6ae499; padding-bottom: 10px;">
          Approved audits awaiting client delivery
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Requester email</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Site</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Due to send</th>
          </tr>
          ${tableRows}
        </table>
      </div>
    `.trim(),
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }
}
