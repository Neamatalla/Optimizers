import crypto from "node:crypto";
import { Resend } from "resend";
import type { CategoryKey, CategoryResult, FindingAction, FudResult, Opportunity } from "./types.js";
import { OPPORTUNITY_LABEL } from "./labels.js";
import { formatMoney } from "./fud/insights.js";
import { mediaBuyerRank, roleSeverity, type AudienceRole } from "./audience.js";

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
  // production path (poll.ts) always has a hosted reportUrl (the
  // /audit-reports/<slug> page — see supabase.ts's saveAuditReport), since the visitor
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
  // Up to two purchase-friction quick wins (the owner-facing one-liners from
  // the FUD pass), shown as a short "two things your shoppers notice" list
  // so the email itself gives a reason to open the report. Omitted, or
  // empty, when the pass didn't run or found no quick wins.
  frictionWins?: string[];
  // The three actions worth most, from the action layer (topActionsOf).
  // When present they replace the quick-wins list.
  topActions?: TopAction[];
  // Who the report was written for (audience.ts): picks the email copy
  // (emailCopy) and, for a media buyer, which actions lead.
  audienceRole?: AudienceRole | null;
}

export interface TopAction {
  type: string;
  step: string;
  money: string | null;
}

const SEV: Record<string, number> = { critical: 0, medium: 1, low: 2 };
const TYPE_RANK: Record<string, number> = { revenue_loss: 0, revenue_gain: 1, risk: 2, benefit: 3 };

/**
 * The three actions to lead the client email with: GA4 points with a money
 * range first (biggest first), then the most serious failed checks (money
 * types before risk and benefit), then Conversion review quick wins.
 * For a media buyer, tracking (signal) and post-click points lead instead
 * (audience.ts's mediaBuyerRank), money breaking ties.
 */
export function topActionsOf(saved: { categories?: CategoryResult[]; fud?: FudResult | { error: string } | null } | null | undefined, role?: AudienceRole | null): TopAction[] {
  if (!saved) return [];
  const rows: Array<{ type: Opportunity; step: string; money: FindingAction["money"]; rank: number }> = [];
  for (const cat of saved.categories ?? []) {
    for (const f of cat.findings) {
      if (f.status !== "fail" || !f.action || !f.opportunity) continue;
      // The reader's own severity (audience.ts), then the media buyer's lanes.
      const base = SEV[roleSeverity(role, f.checklistId, f.severity)];
      const sev = role === "media_buyer" ? mediaBuyerRank(f.checklistId, base) : base;
      rows.push({ type: f.opportunity, step: f.action.step, money: f.action.money ?? null, rank: sev * 10 + TYPE_RANK[f.opportunity] });
    }
  }
  const fud = saved.fud && "findings" in saved.fud ? saved.fud : null;
  for (const f of fud?.findings ?? []) {
    if (f.override?.to === "hidden" || (f.status !== "fail" && f.status !== "warn") || f.band !== "quick_win" || !f.action || !f.opportunity) continue;
    rows.push({ type: f.opportunity, step: f.action.step, money: null, rank: (role === "media_buyer" ? 15 : 5) + (f.focus ? -3 : 0) });
  }
  if (role === "media_buyer") rows.sort((a, b) => a.rank - b.rank || (b.money?.high ?? 0) - (a.money?.high ?? 0));
  else rows.sort((a, b) => (b.money?.high ?? 0) - (a.money?.high ?? 0) || a.rank - b.rank);
  return rows.slice(0, 3).map(r => ({
    type: OPPORTUNITY_LABEL[r.type].en,
    step: r.step,
    money: r.money ? `${formatMoney(r.money.low, r.money.currency)}–${formatMoney(r.money.high, r.money.currency)} a month` : null,
  }));
}

// ---- client email copy per reader (audience.ts, the ICP cards) ----
// No role keeps the original store-owner copy. Values are already escaped.
interface EmailCopy { subject: string; intro: string[]; next: string[]; button: string }

function emailCopy(role: AudienceRole | null | undefined, c: { website: string; coverage: string; businessName: string | null; hasLink: boolean }): EmailCopy {
  const site = c.website;
  switch (role) {
    case "store_owner":
      return {
        subject: `${c.businessName ? `${c.businessName}: ` : ""}what's costing ${site} sales`,
        intro: [
          `Thank you for trusting us with a look at ${site}. We went through your ${c.coverage} and found what is costing you sales, what is already working, and which fixes you can make yourself in your store admin.`,
          `The report starts with your biggest leak, with the money it costs from your own data. Each point says what to change and where, and whether you need a developer for it.`,
        ],
        next: [
          "Most of what we found can be fixed, and the biggest wins often take days, not months. If you would rather we did it for you, that is what we do: for over 8 years we have helped e-commerce brands sell more to the visitors they already have, and if we don't improve your conversions, you don't pay.",
          "Book a free call and we will go through your results and the quickest wins together. No pressure.",
        ],
        button: "Book my free call",
      };
    case "media_buyer":
      return {
        subject: `Your audit for ${site} is ready: tracking and post-click leaks`,
        intro: [
          `Thanks for sending us ${site}. We went through its ${c.coverage} from a media buyer's side: whether the ad platforms and GA4 see every sale once and with the right value, and where paid traffic drops after the click.`,
          "Each point says what it does to ROAS or CAC, who has to fix it and how to check it's done, so you can forward it straight to the store owner or developer. Turn on Technical details for the exact events and tags.",
        ],
        next: [
          "Campaigns can only be as good as the data they learn from and the page the click lands on. Those two are what we fix: tracking the algorithm can trust, and a store that converts more of the clicks you already pay for. For over 8 years we have done this for e-commerce brands, and if we don't improve conversions, you don't pay.",
          "Book a free call and we will go through the tracking and funnel findings with you and show which fixes move ROAS fastest. You keep the account; we handle the site side.",
        ],
        button: "Book my free call",
      };
    case "marketing_manager":
      return {
        subject: `Your audit for ${site} is ready: priorities for your team`,
        intro: [
          `Thank you for trusting us with a look at ${site}. We went through its ${c.coverage} and ranked what we found by what it is worth to the business.`,
          "The report opens with an executive summary you can share with leadership: the store's numbers, the three fixes worth most, and which team owns each fix. Every point is written as a brief, with the step, the owner and how to confirm it's done.",
        ],
        next: [
          "For over 8 years we have helped e-commerce brands turn more of the visitors they already have into customers, and if we don't improve conversions, you don't pay.",
          "Book a free call and we will go through the priorities with you and your team and plan the fixes worth most to the business.",
        ],
        button: "Book a free call",
      };
    case "agency":
      return {
        subject: `Your client audit for ${site} is ready`,
        intro: [
          `Your audit of ${site} is ready. We went through its ${c.coverage} and wrote every finding so you can put it in front of the client: the evidence behind it, the work it needs, who does it and how both sides will know it's done.`,
          "The report opens with a client summary that groups the work into tracking, conversion and tech workstreams, to help you scope the engagement. Each finding says whether it came from live account data, the store visit or the public site.",
        ],
        next: [
          "If you want to go through the method or the findings before you share them, book a call with our team.",
        ],
        button: "Book a call",
      };
    default:
      return {
        subject: c.businessName ? `${c.businessName}, your free audit is ready` : "Your free website audit is ready",
        intro: [
          `Thank you for trusting us with a look at ${site}. Our team has gone through your ${c.coverage} and put everything we found into one clear report: what is already working well, what is quietly costing you sales, and what to fix first.`,
          c.hasLink ? "Grab a coffee and have a look. It is written in plain language, so you do not need to be technical to follow it." : "Your full report is attached to this email. It is written in plain language, so you do not need to be technical to follow it.",
        ],
        next: [
          "The good news: most of what we found can be fixed, and the biggest wins often take days, not months. That is exactly what we do. For over 8 years we have helped e-commerce brands turn more of the visitors they already have into customers, without spending more on ads. And if we don't improve your conversions, you don't pay.",
          "Want us to walk you through it? Book a free call and we will go through your results together, point out the quickest wins, and show you exactly what we would do for your store. No pressure and no jargon.",
        ],
        button: "Book my free call",
      };
  }
}

/** The quick wins worth a line in the client email, from a saved result. */
export function frictionWinsOf(fud: FudResult | { error: string } | null | undefined): string[] {
  if (!fud || !("findings" in fud)) return [];
  return fud.findings
    .filter(f => f.override?.to !== "hidden" && (f.status === "fail" || f.status === "warn") && f.band === "quick_win")
    .slice(0, 2)
    .map(f => f.business.summary);
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
  const top = (opts.topActions ?? []).slice(0, 3);
  const copy = emailCopy(opts.audienceRole, { website, coverage, businessName: opts.businessName, hasLink: Boolean(opts.reportUrl) });
  const wins = top.length ? [] : (opts.frictionWins ?? []).slice(0, 2);
  const p = "color: #2b332c; font-size: 15px; line-height: 1.7; margin: 0 0 16px;";
  const button = (href: string, label: string, primary: boolean) =>
    `<a href="${href}" style="display: inline-block; background: ${primary ? "#263328" : "#6ae499"}; color: ${primary ? "#ffffff" : "#0e1a10"}; font-weight: bold; font-size: 15px; text-decoration: none; padding: 14px 24px; border-radius: 999px;">${label}</a>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Optimizers <hello@optimizers.agency>",
    to: [opts.to],
    subject: `${opts.isTest ? "[TEST] " : ""}${copy.subject}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 8px 4px;">
        ${opts.isTest ? `<p style="background: #fff4e0; border: 1px solid #f2b75e; border-radius: 8px; color: #7a4b00; font-size: 13px; line-height: 1.6; padding: 10px 14px; margin: 0 0 18px;">
          <b>Test run.</b> Submitted in test mode, so this skipped the internal review step and came straight here. The report itself is stored in the test bucket, not alongside real client reports.
        </p>` : ""}
        <h1 style="color: #263328; font-size: 24px; line-height: 1.3; margin: 0 0 20px;">Your audit is ready${name ? `, ${name}` : ""}!</h1>
        <p style="${p}">${name ? `Hi ${name} team,` : "Hi there,"}</p>
        ${copy.intro.map(t => `<p style="${p}">${t}</p>`).join("\n        ")}
        ${wins.length ? `<p style="${p}">${wins.length === 1 ? "One thing your shoppers notice before they buy:" : "Two things your shoppers notice before they buy:"}</p>
        <ul style="color: #2b332c; font-size: 15px; line-height: 1.7; margin: 0 0 16px; padding-left: 20px;">
          ${wins.map(w => `<li>${escapeHtml(w)}</li>`).join("")}
        </ul>
        <p style="${p}">${wins.length === 1 ? "It is" : "Both are"} quick to fix, and the report shows exactly where and what to write.</p>` : ""}
        ${top.length ? `<p style="${p}">Your ${top.length === 1 ? "top action" : `top ${top.length} actions`}, from the report:</p>
        <ol style="color: #2b332c; font-size: 15px; line-height: 1.7; margin: 0 0 16px; padding-left: 20px;">
          ${top.map(a => `<li style="margin-bottom: 8px;"><b style="color: #263328;">${escapeHtml(a.type)}${a.money ? ` · ${escapeHtml(a.money)}` : ""}:</b> ${escapeHtml(a.step)}</li>`).join("")}
        </ol>
        <p style="${p}">Each one in the report says who does it and how you'll know it's done.</p>` : ""}
        ${opts.reportUrl ? `<p style="margin: 24px 0 32px;">${button(opts.reportUrl, "See my audit", true)}</p>` : ""}
        <h2 style="color: #263328; font-size: 18px; margin: 8px 0 12px;">So, what's next?</h2>
        ${copy.next.map(t => `<p style="${p}">${t}</p>`).join("\n        ")}
        <p style="margin: 24px 0 32px;">${button(bookUrl, copy.button, false)}</p>
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
  // Purchase-friction FAILs ("A1 — Shipping cost shown before checkout"),
  // flagged so the reviewer checks them before approving. FUD rules are new
  // and still being calibrated; a false FAIL in front of a prospect costs
  // more than a missed one.
  frictionFails?: string[];
  // Who asked (audience.ts) and their top 3 actions: the talk track for the
  // follow-up call (ICP cards; icp/ICP-PLAYBOOK.md §1.6).
  audienceRole?: AudienceRole | null;
  topActions?: TopAction[];
}

// The plain report URL 404s until the report is due to the client
// (api/_lib/report-access.js), so the reviewer's link carries a signature
// that opens it at any stage. Must stay in step with that file's
// previewSignature, which verifies it.
function reportPreviewUrl(reportUrl: string, slug: string, secret: string): string {
  const sig = crypto.createHmac("sha256", secret).update(slug).digest("base64url");
  return `${reportUrl}?preview=${sig}`;
}

// What our team says on the follow-up call, per reader. Opens on the
// reader's own problem and their biggest finding, and names the offer that
// fits them (from the ICP cards' role-in-purchase notes).
const TALK_TRACK: Record<AudienceRole, { who: string; open: string; press: string; offer: string }> = {
  store_owner: {
    who: "Store owner (ICP1): runs the store, fixes things in the Salla/Zid/Shopify admin, judges us on money.",
    open: "Open with their biggest leak in SAR and the one fix they can make themselves this week.",
    press: "Payment and delivery (COD fee, mada/Apple Pay/Tabby/Tamara visibility, free-delivery threshold) and how the store works on phones.",
    offer: "Done-for-you: we make the developer fixes. Keep it low-pressure; they distrust anything that sounds like a pitch.",
  },
  media_buyer: {
    who: "Media buyer (ICP2): runs the store's paid ads, judged on ROAS/CPA, doesn't own the site or the tracking.",
    open: "Open with the reported-ROAS verdict (over- or under-counting) and the post-click step that loses paid traffic.",
    press: "Proof he can forward to the owner, and what the fixes do to ROAS/CAC. Never quote ROAS values; we don't see spend.",
    offer: "He keeps the account; we do the site side and he refers the owner to the retainer. Tools: low, fair price he can pay himself.",
  },
  marketing_manager: {
    who: "Marketing director/manager (ICP3): reports to the CEO, briefs a team, needs numbers they can defend.",
    open: "Open with the top priority and what it's worth, then who on their team owns it.",
    press: "Channels that convert vs waste, mobile vs desktop, and privacy/consent exposure.",
    offer: "A roadmap session with their team; a retainer the CEO approves. Offer a one-page summary they can take upstairs.",
  },
  agency: {
    who: "Agency/consultant (ICP4): will show this to a client; one wrong number burns them.",
    open: "Open with how defensible the findings are (live-data share, method) and the workstreams they could scope.",
    press: "Tracking accuracy and anything that could embarrass them with the client (double counting, exposed files, consent).",
    offer: "Partner terms: audits for their clients, or white-label later. Never pitch Optimizers to their client.",
  },
};

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
  // Without it the Review button would be a link that 404s until the send
  // date; failing here retries the job instead of mailing a dead link.
  const previewSecret = process.env.REPORT_PREVIEW_SECRET;
  if (!previewSecret) {
    throw new Error("REPORT_PREVIEW_SECRET is not set - see audit-worker/.env.example");
  }
  const previewUrl = reportPreviewUrl(opts.reportUrl, opts.slug, previewSecret);

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
            Give these to Claude along with what you want changed. GET ?slug= returns
            the report's findings as JSON, each with an id. PATCH {slug, findingId,
            changes} updates one finding (technical, business, ar, action, protect or
            status). The report shows it within a minute.
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
        </p>${opts.audienceRole ? `
        <div style="background: #eef7f1; border: 1px solid #9fd8b4; border-radius: 8px; padding: 12px 16px; margin: 12px 0;">
          <p style="color: #1f4d2e; font-size: 13px; font-weight: bold; margin: 0 0 6px;">Talk track for the follow-up call</p>
          <p style="color: #23422d; font-size: 13px; line-height: 1.6; margin: 0 0 6px;"><b>Who:</b> ${TALK_TRACK[opts.audienceRole].who}</p>
          <p style="color: #23422d; font-size: 13px; line-height: 1.6; margin: 0 0 6px;"><b>Open with:</b> ${TALK_TRACK[opts.audienceRole].open}</p>
          <p style="color: #23422d; font-size: 13px; line-height: 1.6; margin: 0 0 6px;"><b>Press on:</b> ${TALK_TRACK[opts.audienceRole].press}</p>
          <p style="color: #23422d; font-size: 13px; line-height: 1.6; margin: 0 0 6px;"><b>Offer:</b> ${TALK_TRACK[opts.audienceRole].offer}</p>${opts.topActions?.length ? `
          <p style="color: #1f4d2e; font-size: 13px; font-weight: bold; margin: 8px 0 4px;">Their top actions (what the client email leads with)</p>
          <ol style="color: #23422d; font-size: 13px; line-height: 1.6; margin: 0; padding-left: 18px;">
            ${opts.topActions.map(a => `<li>${escapeHtml(a.type)}${a.money ? ` · ${escapeHtml(a.money)}` : ""}: ${escapeHtml(a.step)}</li>`).join("")}
          </ol>` : ""}
        </div>` : ""}${opts.frictionFails?.length ? `
        <div style="background: #fff4e5; border: 1px solid #f5c26b; border-radius: 8px; padding: 12px 16px; margin: 12px 0;">
          <p style="color: #7a4b00; font-size: 13px; font-weight: bold; margin: 0 0 6px;">Check these purchase-friction FAILs before approving</p>
          <ul style="color: #5c3a00; font-size: 13px; line-height: 1.6; margin: 0; padding-left: 18px;">
            ${opts.frictionFails.map(f => `<li>${f.replace(/</g, "&lt;")}</li>`).join("")}
          </ul>
        </div>` : ""}
        <p style="font-size: 14px; line-height: 1.6;">
          <a href="${previewUrl}" style="display: inline-block; background: #263328; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 18px; border-radius: 999px; margin-right: 8px;">
            Review
          </a>
          <a href="${opts.approveUrl}" style="display: inline-block; background: #6ae499; color: #263328; font-weight: bold; text-decoration: none; padding: 12px 18px; border-radius: 999px;">
            Approve &amp; schedule send
          </a>
        </p>
        <p style="color: #666; font-size: 12px; line-height: 1.6; margin-top: 16px;">
          Approving schedules the client email for 2 days from now. Edit the live
          report any time before then via the report-edit API using the slug above.
          The Review link works at every stage; the plain report link (without
          <code>?preview=</code>) only opens once the report has gone to the client.
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
