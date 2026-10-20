import test from "node:test";
import assert from "node:assert/strict";
import { buildAuditEmail, talkTrackHtml, topActionsOf } from "./email.js";
import type { AudienceRole } from "./audience.js";
import type { CategoryResult } from "./types.js";

process.env.PUBLIC_SITE_URL = "https://optimizers.agency";
const REPORT = "https://r.example/report/abc";

type Sev = "critical" | "medium" | "low";
function finding(checklistId: string, severity: Sev, summary: string, opts: { owners?: string[]; money?: number; step?: string } = {}) {
  return {
    checklistId, status: "fail", severity, opportunity: "revenue_loss", dataSource: "live",
    technical: { summary: "", detail: "" }, business: { summary, detail: "" },
    action: { step: opts.step ?? `step for ${checklistId}`, owners: opts.owners ?? ["dev"], doneWhen: `done for ${checklistId}.`, money: opts.money ? { low: opts.money / 2, high: opts.money, currency: "SAR" } : null },
  };
}
const cats = (findings: unknown[]) => [{ category: "GA4", findings }] as unknown as CategoryResult[];

function email(role: AudienceRole | null, categories: CategoryResult[], extra: { ga4Days?: number; reportUrl?: string } = {}) {
  const saved = { categories, ga4Facts: extra.ga4Days ? ({ periodDays: extra.ga4Days, focus: { step: null, page: null } } as never) : null };
  return buildAuditEmail({
    website: "https://store.sa/", businessName: null, categoriesAudited: ["GA4"],
    reportUrl: extra.reportUrl ?? REPORT, topActions: topActionsOf(saved, role), audienceRole: role,
  });
}

// ---- store owner ----

test("owner email with GA4 money: subject leads with the range, body sources it and lists 3 fixes with who/done", () => {
  const { subject, html } = email("store_owner", cats([
    finding("SO-GA4-01", "medium", "Checkout loses buyers", { money: 24000 }),
    finding("SO-WEB-01", "critical", "Delivery fee hidden until checkout", { owners: ["owner"] }),
    finding("SO-WEB-02", "low", "Product photos load slowly"),
    finding("SO-WEB-03", "low", "Fourth fix, not shown"),
  ]), { ga4Days: 28 });
  assert.equal(subject, "store.sa: about SAR 12,000–SAR 24,000 a month at one step, and 3 fixes");
  assert.match(html, /About SAR 12,000–SAR 24,000 a month in sales is at stake at one step of your store\./);
  assert.match(html, /Source: your own Google Analytics, last 28 days\. An estimate/);
  assert.match(html, /Checkout loses buyers[\s\S]*Delivery fee hidden until checkout[\s\S]*Product photos load slowly/);
  assert.doesNotMatch(html, /Fourth fix/);
  assert.match(html, /<b>Who:<\/b> You, in your store admin\. <b>Done when:<\/b> done for SO-WEB-01\./);
  assert.match(html, /<b>Who:<\/b> Your developer/);
  assert.match(html, new RegExp(`href="${REPORT}"[^>]*>Open your report</a>`));
  assert.match(html, /href="https:\/\/optimizers\.agency\/#contact"[^>]*>Book a free call<\/a>/);
  // Two equal buttons: same style on both.
  const styles = [...html.matchAll(/<a href="[^"]+" style="([^"]+)">(Open your report|Book a free call)<\/a>/g)].map(m => m[1]);
  assert.equal(styles.length, 2);
  assert.equal(styles[0], styles[1]);
  assert.doesNotMatch(html, /[؀-ۿ]/, "the client email has no Arabic part");
});

test("owner email without money: '3 fixes that cost you sales' and no money line", () => {
  const { subject, html } = email("store_owner", cats([
    finding("SO-WEB-01", "critical", "A"), finding("SO-WEB-02", "medium", "B"), finding("SO-WEB-03", "low", "C"),
  ]));
  assert.equal(subject, "store.sa: 3 fixes that cost you sales");
  assert.doesNotMatch(html, /at stake|Google Analytics, last/);
  assert.match(html, /Your report starts with these 3 fixes/);
});

test("owner email: one fix, nothing failed, and test mode", () => {
  assert.equal(email("store_owner", cats([finding("SO-WEB-01", "low", "A")])).subject, "store.sa: 1 fix that costs you sales");
  const clean = email("store_owner", cats([]));
  assert.equal(clean.subject, "store.sa: passed all checks");
  assert.match(clean.html, /passed all the checks/);
  const t = buildAuditEmail({ website: "store.sa", businessName: null, categoriesAudited: [], reportUrl: REPORT, topActions: [], audienceRole: "store_owner", isTest: true });
  assert.ok(t.subject.startsWith("[TEST] "));
  assert.match(t.html, /<b>Test run\.<\/b>/);
});

// ---- media buyer ----

const buyerCats = () => cats([
  finding("MB-GA4-02", "critical", "Purchase fires twice", { owners: ["dev"] }), // signal, inflated
  finding("MB-GA4-05", "medium", "Non-sales counted as conversions", { owners: ["marketing"] }), // signal, inflated
  finding("MB-GA4-13", "low", "Third signal point"), // signal: not in the top 2
  finding("MB-GA4-04", "critical", "Product pages lose paid clicks"), // post_click, performance
  finding("MB-GA4-01", "medium", "Paid clicks land on dead pages", { owners: ["marketing"] }), // post_click, cost
]);

test("buyer email, not clean: verdict subject, 2+2 findings with direction and who, report + handover links", () => {
  const { subject, html } = email("media_buyer", buyerCats());
  assert.equal(subject, "store.sa: reported ROAS likely reads high — tracking and post-click findings");
  assert.match(html, /Reported ROAS likely reads higher than real/);
  assert.match(html, /After the click: Product pages lose paid clicks/);
  assert.match(html, /Is the number real\?[\s\S]*Purchase fires twice[\s\S]*Non-sales counted as conversions[\s\S]*Does paid traffic convert\?/);
  assert.doesNotMatch(html, /Third signal point/);
  assert.match(html, /Does paid traffic convert\?[\s\S]*Product pages lose paid clicks[\s\S]*Paid clicks land on dead pages/);
  assert.match(html, /Now: reported ROAS ↑ too high \(est\.\) · <b>Who fixes it:<\/b> Developer/);
  assert.match(html, /Fixing: ROAS ↑ · CAC ↓ \(est\.\)/);
  assert.match(html, /Now: wasted clicks, CAC ↑ \(est\.\) · <b>Who fixes it:<\/b> Marketing/);
  assert.match(html, new RegExp(`href="${REPORT}"[^>]*>Open your report</a>`));
  assert.match(html, new RegExp(`href="${REPORT}#handover"[^>]*>Forward the owner summary</a>`));
  assert.match(html, /directions, never numbers/);
  // Direction only: no ROAS/CAC figure anywhere.
  assert.doesNotMatch(html, /ROAS (of )?\d|\d+(\.\d+)?x ROAS|CAC (of )?\d/);
});

test("buyer email: other verdicts", () => {
  const verdict = (findings: unknown[]) => email("media_buyer", cats(findings)).subject;
  assert.equal(verdict([finding("MB-GA4-03", "medium", "x")]), "store.sa: reported ROAS likely reads low — tracking and post-click findings");
  assert.equal(verdict([finding("MB-GA4-02", "medium", "x"), finding("MB-GA4-03", "medium", "y")]), "store.sa: reported ROAS is likely off in both directions — tracking and post-click findings");
  assert.equal(verdict([finding("MB-GA4-15", "medium", "x")]), "store.sa: the ad platforms get a weak signal — tracking and post-click findings");
  assert.equal(verdict([finding("MB-GA4-04", "medium", "x")]), "store.sa: tracking is clean, the leak is after the click");
});

test("buyer email, clean: 'tracking and site passed', both lanes say so, report + call (no handover)", () => {
  const { subject, html } = email("media_buyer", cats([]));
  assert.equal(subject, "store.sa: tracking and site passed");
  assert.match(html, /Tracking and the site passed: look at targeting and creative/);
  assert.match(html, /No tracking problem found/);
  assert.match(html, /No post-click leak found/);
  assert.match(html, />Open your report<\/a>/);
  assert.match(html, />Book a free call<\/a>/);
  assert.doesNotMatch(html, /#handover|Forward the owner summary/);
});

// ---- internal review talk track ----

test("talk track: owner and buyer open with their own top finding, name the offer, ask one question", () => {
  const owner = talkTrackHtml("store_owner", topActionsOf({ categories: cats([finding("SO-GA4-01", "medium", "Checkout loses buyers", { money: 24000 })]), ga4Facts: { periodDays: 28, focus: { step: null, page: null } } as never }, "store_owner"), "https://store.sa");
  assert.match(owner, /Open with:<\/b> Open with their own top finding: "Checkout loses buyers" \(about SAR 12,000–SAR 24,000 a month at stake, from their GA4, last 28 days/);
  assert.match(owner, /We do the developer fixes/);
  assert.equal((owner.match(/<b>Ask:<\/b>/g) ?? []).length, 1);

  const buyer = talkTrackHtml("media_buyer", topActionsOf({ categories: buyerCats() }, "media_buyer"), "store.sa");
  assert.match(buyer, /verdict from their report: "Reported ROAS likely reads higher than real"\. Then their top finding: "Purchase fires twice" \(Now: reported ROAS ↑ too high \(est\.\)\), fixed by developer\./);
  assert.match(buyer, /we fix the site side|We fix the site side \(tracking and post-click\) so his campaigns are judged on real numbers/);
  assert.equal((buyer.match(/<b>Ask:<\/b>/g) ?? []).length, 1);
  // Only the top 3 rows are listed, though the buyer's actions carry them all.
  assert.equal((buyer.match(/<li>/g) ?? []).length, 3);
});

test("talk track and client email: marketing manager, agency and no-role output unchanged", () => {
  const top = [{ type: "Revenue loss", step: "fix it", money: null }];
  for (const role of ["marketing_manager", "agency"] as const) {
    const html = talkTrackHtml(role, top, "store.sa");
    assert.doesNotMatch(html, /<b>Ask:<\/b>/);
    assert.match(html, /<li>Revenue loss: fix it<\/li>/);
  }
  assert.match(talkTrackHtml("marketing_manager", top, "x"), /Open with:<\/b> Open with the top priority and what it's worth/);
  assert.equal(buildAuditEmail({ website: "store.sa", businessName: "Acme", categoriesAudited: ["Website"], reportUrl: REPORT, topActions: top, audienceRole: "marketing_manager" }).subject, "Your audit for store.sa is ready: priorities for your team");
  assert.equal(buildAuditEmail({ website: "store.sa", businessName: "Acme", categoriesAudited: ["Website"], reportUrl: REPORT, topActions: top, audienceRole: "agency" }).subject, "Your client audit for store.sa is ready");
  const none = buildAuditEmail({ website: "store.sa", businessName: "Acme", categoriesAudited: ["Website"], reportUrl: REPORT, topActions: top, audienceRole: null });
  assert.equal(none.subject, "Acme, your free audit is ready");
  assert.match(none.html, /Your audit is ready, Acme!/);
  assert.match(none.html, /<b style="color: #263328;">Revenue loss:<\/b> fix it/);
  assert.match(none.html, />See my audit<\/a>/);
  assert.match(none.html, />Book my free call<\/a>/);
});
