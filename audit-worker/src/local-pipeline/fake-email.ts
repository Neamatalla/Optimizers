/**
 * Stand-in for src/email.ts inside the local pipeline run: the pure helpers
 * are the real ones; sending writes the email HTML to output/ instead.
 */
import { writeFileSync } from "fs";
import path from "path";
import { buildAuditEmail, type SendAuditEmailOptions } from "../email.js";
export { frictionWinsOf, topActionsOf } from "../email.js";

const OUT = path.join(process.cwd(), "output");
console.log("[local-pipeline] fake email in use: nothing goes to an inbox");

export async function sendAuditEmail(opts: SendAuditEmailOptions): Promise<void> {
  const { subject, html } = buildAuditEmail(opts);
  const host = new URL(opts.website).hostname.replace(/^www\./, "");
  writeFileSync(path.join(OUT, `pipeline-${host}-email.html`), html, "utf8");
  console.log(`[local-pipeline] client email not sent, saved: output/pipeline-${host}-email.html — subject: ${subject}`);
}
const skipped = (name: string) => async () => console.log(`[local-pipeline] ${name} not sent (local run)`);
export const sendInternalReviewEmail = skipped("internal review email");
export const sendDailyDigestEmail = skipped("daily digest");
export const sendAuditFailedEmail = skipped("audit-failed email");
export const sendClaudeLoginAlertEmail = skipped("login alert");
