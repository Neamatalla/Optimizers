/**
 * The production audit job (poll.ts processRequest), run once on this
 * machine with no Supabase and no emails sent: every stage is the real code
 * (crawl, store visit, claude -p audit, PageSpeed, friction rules, the CRO
 * checklist, Arabic translation, publish, deliver). Only src/supabase.ts and
 * src/email.ts are swapped for the fakes in this folder (hooks.mjs).
 *
 *   npx tsx src/local-pipeline/run.ts <website> [--role=media_buyer] [--ad="headline"] [--coupon=CODE] [--tools=GA4,GTM] [--form=output/form-<host>.json]
 *
 * Writes to output/: pipeline-<host>.html (rebuilt from the saved rows, as
 * the live page does), -rows.json, -progress.json and -email.html.
 * Without --form there is no GA4/GTM OAuth data (it lives in Supabase), so the GA4-driven parts
 * (break-even, campaigns, landing pages from paid traffic) are absent, as
 * for a store that didn't connect Google.
 */
import { register } from "node:module";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import type { AuditRequestRow } from "../types.js";

register("./hooks.mjs", import.meta.url);
process.env.AUDIT_WORKER_NO_POLL = "1";
// The friction pass and the checklist run on every row in this run.
process.env.FUD_PASS ??= "all";

const args = process.argv.slice(2);
const flag = (k: string) => args.find(a => a.startsWith(`--${k}=`))?.slice(k.length + 3);
let website = args.find(a => !a.startsWith("--"));
if (!website) throw new Error("usage: npx tsx src/local-pipeline/run.ts <website> [--role=media_buyer] [--ad=...] [--coupon=...]");
if (!/^https?:\/\//.test(website)) website = `https://${website}`;
// --form=<file>: a form the dev server saved (dev/local-audit.ts), with the
// GA4/GTM data from the Google sign-in. Flags given on the command line win.
const form: Record<string, any> = flag("form") ? JSON.parse(readFileSync(flag("form")!, "utf8")) : {};
const ad = flag("ad") ?? form.adText ?? null, coupon = flag("coupon") ?? form.adCoupon ?? null;

const now = new Date().toISOString();
const row = {
  id: randomUUID(), tools: (flag("tools")?.split(",").filter(Boolean) ?? form.tools ?? []) as AuditRequestRow["tools"], website, email: "local@pipeline.test",
  business_name: flag("business") ?? form.businessName ?? null, ga4_measurement_id: form.ga4MeasurementId ?? null, gtm_container_id: form.gtmContainerId ?? null,
  ga4_oauth_data: form.ga4OAuthData ?? null, gtm_oauth_data: form.gtmOAuthData ?? null,
  clarity_data: form.clarityData ?? null, ad_context: ad || coupon ? { text: ad, coupon } : null, is_test: true, verification_methods: [], is_verified: false,
  store_platform: form.storePlatform ?? null, audience_role: (flag("role") ?? form.role ?? "media_buyer") as AuditRequestRow["audience_role"], status: "processing",
  result_error: null, report_url: null, retry_after: null, retry_count: 0, approval_token: null, approved_at: null, scheduled_send_at: null,
  sent_to_client_at: null, categories_audited: null, attempts: 1, locked_by: "local-pipeline", heartbeat_at: now, progress: {}, created_at: now, updated_at: now,
} as unknown as AuditRequestRow;
(globalThis as any).__pipelineRow = row;

const t0 = Date.now();
const { processRequest } = await import("../poll.js");
await processRequest(row, "local-pipeline");
console.log(`[local-pipeline] done in ${Math.round((Date.now() - t0) / 1000)}s`);
