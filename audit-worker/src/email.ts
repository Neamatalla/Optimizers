import { Resend } from "resend";
import type { CategoryKey } from "./types.js";

// Human phrase per category, in a fixed display order — GA4/GTM first when
// present since they're the higher-intent "we connected your tools" story,
// Website/PageSpeed always last since they're the ones present on literally
// every run.
const CATEGORY_PHRASES: Record<CategoryKey, string> = {
  GA4: "analytics",
  GTM: "tag management",
  Website: "your website's code",
  PageSpeed: "page speed",
};
const CATEGORY_ORDER: CategoryKey[] = ["GA4", "GTM", "Website", "PageSpeed"];

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

// Built from what actually ran (result.categories — the ground truth once
// an audit exists, same reasoning as scoring.ts's own doc comment on this),
// not the visitor's tool selection — so a "none of these" run correctly
// says "your website's code and page speed" instead of a copy-pasted
// sentence claiming analytics/tag-management coverage that never happened.
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
}

export async function sendAuditEmail(opts: SendAuditEmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set - see audit-worker/.env.example");
  }
  if (!opts.reportUrl && !opts.attachment) {
    throw new Error("sendAuditEmail needs either a reportUrl or an attachment");
  }

  const siteUrl = process.env.PUBLIC_SITE_URL || "https://optimizers.agency";
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Optimizers <hello@optimizers.agency>",
    to: [opts.to],
    subject: opts.businessName ? `Your Free CRO & Analytics Audit for ${opts.businessName}` : `Your Free CRO & Analytics Audit - ${opts.website}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #263328; border-bottom: 2px solid #6ae499; padding-bottom: 10px;">
          Your Audit Is Ready
        </h2>
        <p style="color: #333; font-size: 14px; line-height: 1.6;">
          ${opts.businessName ? `Hi ${opts.businessName} team, we've` : "We've"} put together a
          business-focused audit of ${opts.website} covering ${coverageSentence(opts.categoriesAudited)}.
          ${opts.reportUrl ? "The full branded HTML report is ready at the link below." : "The full branded HTML report is attached to this email."}
        </p>
        ${opts.reportUrl ? `<p style="font-size: 14px; line-height: 1.6;">
          <a href="${opts.reportUrl}" style="display: inline-block; background: #263328; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 18px; border-radius: 999px;">
            View your audit report
          </a>
        </p>` : ""}
        <p style="font-size: 14px; line-height: 1.6;">
          <a href="${siteUrl.replace(/\/$/, "")}/#contact" style="color: #263328; font-weight: bold;">
            Book a strategy session
          </a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
          Sent from the Optimizers "Get a Free Audit" tool.
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
            View report
          </a>
          <a href="${opts.approveUrl}" style="display: inline-block; background: #6ae499; color: #263328; font-weight: bold; text-decoration: none; padding: 12px 18px; border-radius: 999px;">
            Approve &amp; schedule send
          </a>
        </p>
        <p style="color: #666; font-size: 12px; line-height: 1.6; margin-top: 16px;">
          Approving schedules the client email for 2 days from now. Edit the live
          report any time before then via the report-edit API using the slug above.
        </p>
      </div>
    `.trim(),
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }
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
