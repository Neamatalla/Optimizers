/**
 * Dev-only preview: builds a synthetic AuditResult (no network calls, no
 * claude -p, no Supabase) and renders it through the real buildAuditHtmlReport
 * pipeline so the report's HTML/CSS can be iterated on and screenshotted
 * without running a full live audit. Three modes, one per route
 * (scoring.ts's countedCategories — always 50 checks total, different
 * distribution):
 *
 *   npm run preview-report -- --path=tracking   (both GA4+GTM: 25+25)
 *   npm run preview-report -- --path=single     (one tool only: 25 GA4 + 25 website-code)
 *   npm run preview-report -- --path=website    (neither tool: 50 Website)
 *
 * Every finding below is written in BOTH registers (types.ts's FindingVoice)
 * because the report's language toggle is a first-class feature — a fixture
 * with only one voice filled in would render an empty pane on the other side
 * and make the toggle look broken while iterating on it.
 *
 * Output: audit-worker/output/preview-<path>.html (gitignored).
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { buildAuditHtmlReport } from "./html-report.js";
import { captureSiteScreenshots } from "./screenshots.js";
import { translateFindingsToArabic } from "./translate-ar.js";
import type { AuditResult, CategoryResult } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function ga4Category(): CategoryResult {
  return {
    category: "GA4",
    score: 68,
    checklistTally: { total: 25, evaluated: 25, passed: 17 },
    findings: [
      {
        checklistId: "GA4-D1",
        technical: {
          summary: "purchase events fire with value=0 on 84% of transactions (last 28 days)",
          detail: "run_report over purchase eventCount vs purchaseRevenue returns 412 purchase events against AED 9,240 revenue — the median non-zero order is AED 141, so roughly 347 of those events carry no value parameter at all. The dataLayer push is missing `value` and `currency` at the event root on the Shopify checkout template.",
        },
        business: {
          summary: "Most completed orders are recorded as if they earned nothing.",
          detail: "Analytics thinks the store made AED 9,240 last month when the real figure is several times that. Every judgement built on it inherits the error: which campaign 'paid for itself', which product line looks unprofitable, whether last month beat the one before. Ad platforms optimising toward this number are being told the wrong orders are the valuable ones, so budget drifts toward whatever happens to report a value.",
        },
        dataSource: "live",
        severity: "critical",
        status: "fail",
      },
      {
        checklistId: "GA4-D3",
        technical: {
          summary: "sessions jumped 6.4x on 14 August (2,180 vs a 340 trailing-7-day baseline) with no annotation or alert configured",
          detail: "Week-over-week run_report shows the spike isolated to a single day, 91% of it landing on / with sessionDefaultChannelGroup = Direct and an average engagement time of 4s. No GA4 custom insight or alert exists on the property, so nothing fired.",
        },
        business: {
          summary: "Visits jumped sharply on 14 August and nothing in the setup flags it.",
          detail: "Nobody is told when traffic moves like this, so a spike this size gets noticed weeks later, if at all — and by then whatever caused it (a campaign, a press mention, a bot) is cold. The 14 August jump goes unexplained until somebody digs through the data by hand, which usually means it never gets explained at all, and the thing that worked never gets repeated. The 4-second average visit suggests this one was not real customers, which matters just as much: it quietly drags down every quality metric for the month it lands in.",
        },
        dataSource: "live",
        severity: "critical",
        status: "fail",
      },
      {
        checklistId: "GA4-5",
        technical: {
          summary: "dataRedactionSettings on the web stream has emailRedactionEnabled=false",
          detail: "The stream collects page_location with query strings intact, and the newsletter form submits by GET — so `?email=` values reach GA4 verbatim. Redaction is a per-stream toggle and is off.",
        },
        business: {
          summary: "Customer email addresses are being stored inside the analytics account.",
          detail: "Google's own terms forbid sending them personal data, and the stated penalty is deletion of the account's data — years of history gone, with no appeal. It also means anyone with report access can read customer emails, which is not what most people assume analytics access grants. This is the kind of finding that turns into a compliance conversation rather than a technical one.",
        },
        dataSource: "live",
        severity: "critical",
        status: "fail",
      },
      {
        checklistId: "GA4-8",
        technical: {
          summary: "attributionSettings left on PAID_AND_ORGANIC_CHANNELS with a last-click reporting model",
          detail: "Property-level attribution has never been changed from the default. Combined with a 90-day acquisition lookback, every conversion is credited entirely to the final paid-or-organic touch before it.",
        },
        business: {
          summary: "Only the last thing a customer clicked gets any credit for the sale.",
          detail: "Channels that introduce people to the brand — social, email, display — show up as if they produce almost nothing, because someone who discovers the store on Instagram and buys two days later via a Google search counts entirely as Google. Cutting the 'underperforming' channels on this basis usually cuts the top of the funnel, and the damage shows up a month or two later as fewer sales overall with no obvious cause.",
        },
        dataSource: "live",
        severity: "medium",
        status: "fail",
      },
      {
        checklistId: "GA4-D4",
        technical: {
          summary: "38% of last-28-day sessions resolve to sessionDefaultChannelGroup = Unassigned",
          detail: "4,120 of 10,840 sessions. The pattern matches campaign URLs tagged with inconsistent utm_medium values plus a redirect on the /r/ short-link path that strips the query string before GA4's tag reads it.",
        },
        business: {
          summary: "For about 4 in 10 visits, nothing records where the visitor came from.",
          detail: "Nearly half the traffic sits in an 'unknown' bucket, so channel reports describe a little over half the business and every share-of-traffic figure is understated by an unknowable amount. Deciding where to spend next month means comparing channels while the largest single group is 'we don't know' — and because the missing visits are mostly campaign clicks, the channels being paid for are the ones most under-reported.",
        },
        dataSource: "live",
        severity: "medium",
        status: "fail",
      },
      {
        checklistId: "GA4-3",
        technical: {
          summary: "enhancedMeasurementSettings returned 403 for this token — evaluated from the public crawl signal instead",
          detail: "The v1alpha enhancedMeasurementSettings call was refused for the connected identity, so scroll/outbound-click/file-download coverage could not be confirmed against the account. The page source shows a gtag.js snippet with no explicit config overrides, which is consistent with defaults being on but does not prove it.",
        },
        business: {
          summary: "We could not confirm whether basic interaction tracking is switched on.",
          detail: "Scroll depth, outbound clicks and file downloads are the cheapest engagement signals available, and they are either already collecting or silently off — this run could not tell which, because the connected Google account did not grant access to that setting. Worth a two-minute check in the account, since if they are off, the fix is a toggle and the data starts flowing immediately.",
        },
        dataSource: "detection",
        severity: "low",
        status: "fail",
      },
    ],
  };
}

function websiteCodeCategory(): CategoryResult {
  return {
    category: "Website",
    score: 64,
    checklistTally: { total: 25, evaluated: 25, passed: 16 },
    findings: [
      {
        checklistId: "WEB-57",
        technical: {
          summary: "window.dataLayer contains no ecommerce events across the full journey",
          detail: "Drove view_item -> add_to_cart -> begin_checkout in the browser and read window.dataLayer after each step: only gtm.js, gtm.dom and gtm.load are present. No view_item, add_to_cart, begin_checkout or purchase push exists anywhere in the theme.",
        },
        business: {
          summary: "The site never tells analytics when someone adds to cart or buys.",
          detail: "The shop is invisible from the moment a visitor shows real intent. There is no way to answer which products get added and abandoned, where the checkout leaks, or what a visitor from a given campaign is actually worth — and connecting GA4 tomorrow would not help, because the site itself is not emitting these moments. This is the single item that blocks most of the others from ever producing useful numbers.",
        },
        dataSource: "live",
        severity: "critical",
        status: "fail",
      },
      {
        checklistId: "WEB-17",
        technical: {
          summary: "the GA4 collect request fires twice per pageview (hardcoded gtag.js plus the GTM-injected copy)",
          detail: "Network log shows two POSTs to /g/collect with the same measurement ID within 40ms of load. theme.liquid carries a hardcoded gtag.js snippet and the container also injects a Google tag, so both run.",
        },
        business: {
          summary: "Every visit is being counted twice.",
          detail: "Traffic looks roughly double what it is, and conversion rate looks roughly half — because the orders are counted once but the visits twice. Any target set against these numbers is set against a distortion, and the day someone removes the duplicate, traffic will appear to collapse overnight and prompt a panic about a problem that does not exist.",
        },
        dataSource: "live",
        severity: "critical",
        status: "fail",
      },
      {
        checklistId: "WEB-50",
        technical: {
          summary: "tracking requests fire before any consent choice and are identical after Accept vs Decline",
          detail: "Compared the network log across three loads: no interaction, Accept, Decline. The same 11 third-party requests fire in all three, at the same point in the load. The banner sets a cookie recording the choice and nothing reads it.",
        },
        business: {
          summary: "The cookie banner does not actually stop any tracking.",
          detail: "Declining changes nothing — the same trackers run either way. The banner creates a written record that consent was requested and honoured while the opposite is happening, which is worse than having no banner at all if it is ever examined. For a store selling into the EU or UK, this is the finding most likely to become someone else's formal complaint.",
        },
        dataSource: "live",
        severity: "critical",
        status: "fail",
      },
      {
        checklistId: "WEB-15",
        technical: {
          summary: "checkout.js throws 'Cannot read properties of undefined (reading price)' on every cart page load",
          detail: "Console shows the same TypeError once per load on /cart, thrown from the quantity-update handler. Execution stops at that point in the handler, so the code after it — including the subtotal recalculation — never runs.",
        },
        business: {
          summary: "The cart page hits a code error every single time it loads.",
          detail: "Something on the highest-intent page in the funnel is already broken, and the subtotal not updating when a shopper changes quantity is exactly the kind of thing that makes someone abandon a full cart. Nobody sees an error message, so this does not arrive as a support ticket — it arrives as a quietly lower conversion rate that nobody can attribute to anything.",
        },
        dataSource: "live",
        severity: "critical",
        status: "fail",
      },
      {
        checklistId: "WEB-61",
        technical: {
          summary: "hero image transfers 612 KB at 2400x1600 into a 720x480 rendered box",
          detail: "Network log: /assets/hero-banner.jpg, 612 KB, image/jpeg. naturalWidth 2400 against clientWidth 720 — roughly 11x the pixels needed. Three collection thumbnails are also over 200 KB each.",
        },
        business: {
          summary: "The homepage sends every visitor a photo more than ten times larger than the space it appears in.",
          detail: "Each visit downloads about half a megabyte of detail that is thrown away before it is ever seen. On mobile — the majority of this audience — that is the difference between the page appearing immediately and appearing after a visible pause, and it is charged to the visitor's own data plan. The fix is a re-export, not a rebuild, which makes it one of the cheapest speed wins available here.",
        },
        dataSource: "live",
        severity: "critical",
        status: "fail",
      },
      {
        checklistId: "WEB-29",
        technical: {
          summary: "no Content-Security-Policy or Strict-Transport-Security response header",
          detail: "The crawl's captured headers contain neither. X-Content-Type-Options and Referrer-Policy are also absent; only the platform's default headers are present.",
        },
        business: {
          summary: "Two standard browser protections are switched off.",
          detail: "These headers are how a site tells the browser to refuse injected scripts and to never load over an insecure connection. Without them, a compromised third-party script — an app, a widget, a pixel — has more freedom on the checkout page than it should. It is configuration rather than development work, and it costs nothing to turn on.",
        },
        dataSource: "public",
        severity: "medium",
        status: "fail",
      },
    ],
  };
}

function gtmCategory(): CategoryResult {
  return {
    category: "GTM",
    score: 84,
    checklistTally: { total: 25, evaluated: 25, passed: 21 },
    findings: [
      {
        checklistId: "GTM-18",
        technical: {
          summary: "6 of 19 tags have consentSettings.consentStatus = NOT_SET",
          detail: "Meta Pixel, TikTok Pixel, two Custom HTML remarketing tags and both Google Ads conversion tags carry the default. Consent Mode is otherwise initialised in the container, so these six are the exceptions that bypass it.",
        },
        business: {
          summary: "Six advertising trackers ignore the visitor's cookie choice entirely.",
          detail: "The consent setup works for most tags and silently skips these — which is harder to defend than not having consent at all, because the container shows an intent to honour choices that these six do not follow. They are also the tags most tied to advertising, so they are the ones a regulator or a platform audit would look at first.",
        },
        dataSource: "detection",
        severity: "critical",
        status: "fail",
      },
      {
        checklistId: "GTM-2",
        technical: {
          summary: "two active GA4 Configuration tags in the live container, both on All Pages",
          detail: "Both reference the same measurement ID via {{GA4 Measurement ID}} and both trigger on gtm.js. Neither is paused, and no blocking trigger separates them.",
        },
        business: {
          summary: "The analytics setup is installed twice inside the same container.",
          detail: "Everything this container reports is doubled — pageviews, events, and the conversions built on them. It also means two people probably added the same thing months apart without noticing, so the container likely has more of this kind of drift than this one finding shows.",
        },
        dataSource: "detection",
        severity: "critical",
        status: "fail",
      },
      {
        checklistId: "GTM-7",
        technical: {
          summary: "Google Ads conversion tag sends no transaction_id parameter",
          detail: "The conversion tag's parameter list has value and currency but no transaction_id, and a server-side conversion import is also configured for the same account.",
        },
        business: {
          summary: "The same sale can be reported to Google Ads twice with no way to spot the duplicate.",
          detail: "Orders arrive at Google from both the website and the back-office import, and without an order number to match them, both are counted. Reported ad performance is inflated by however much the two paths overlap, which makes it look correct to keep spending on campaigns that may not be paying for themselves.",
        },
        dataSource: "detection",
        severity: "critical",
        status: "fail",
      },
      {
        checklistId: "GTM-13",
        technical: {
          summary: "11 of 19 tags are raw Custom HTML where a native template exists",
          detail: "Meta Pixel, TikTok, Clarity and the remarketing tags are all hand-pasted script blocks rather than Template Gallery types, so they execute unsandboxed and receive no vendor updates.",
        },
        business: {
          summary: "Most trackers are pasted-in code rather than the vendors' official versions.",
          detail: "Hand-pasted scripts do not update themselves, so when a platform changes its tracking — as Meta and TikTok both have — these keep sending the old format until someone notices the numbers went quiet. They also run with full freedom on the page, including at checkout, which is a wider door than these tags need.",
        },
        dataSource: "detection",
        severity: "medium",
        status: "fail",
      },
    ],
  };
}

function websiteCategory(): CategoryResult {
  return {
    category: "Website",
    score: 62,
    checklistTally: { total: 50, evaluated: 50, passed: 31 },
    findings: [
      ...websiteCodeCategory().findings,
      {
        checklistId: "WEB-45",
        technical: {
          summary: "3 checkout inputs have no associated label, for or aria-label",
          detail: "Address line 2, city and postcode rely on placeholder text alone. The placeholder disappears on focus and is not exposed as an accessible name, so assistive technology announces them as unlabelled edit fields.",
        },
        business: {
          summary: "Three checkout fields are unlabelled for anyone using a screen reader.",
          detail: "A customer who cannot see the form is asked to fill in boxes with no names, at the exact moment they are handing over money. Some will get through it and some will leave; the ones who leave look identical to any other abandoned checkout in the data. In several markets this is also a legal accessibility obligation rather than a nice-to-have.",
        },
        dataSource: "live",
        severity: "critical",
        status: "fail",
      },
      {
        checklistId: "WEB-37",
        technical: {
          summary: "canonical tag missing on 4 of the 10 highest-traffic landing pages",
          detail: "The four collection pages emit no link rel=canonical, and each is reachable at both /collections/x and /collections/x?sort_by= variants — so search engines see multiple URLs with the same content and no declared original.",
        },
        business: {
          summary: "Four top pages do not tell search engines which version is the real one.",
          detail: "The value of every link and visit to those pages is split across near-duplicate addresses instead of accumulating on one, so they rank lower than the same content would if consolidated. It is invisible from inside the business — the pages work fine for visitors — and it quietly caps how much free traffic they can earn.",
        },
        dataSource: "public",
        severity: "medium",
        status: "fail",
      },
    ],
  };
}

async function main() {
  const mode = (process.argv.find(a => a.startsWith("--path="))?.split("=")[1] ?? "tracking") as "tracking" | "single" | "website";

  const discoveredPages = [
    "https://example.com/",
    "https://example.com/collections/all",
    "https://example.com/products/best-seller",
    "https://example.com/cart",
  ];

  // --shots=<url> captures REAL screenshots from a live site so the device
  // mockup can be eyeballed; without it the preview renders with no mockup,
  // which is also worth seeing (it is the graceful path when no browser is
  // available on the machine running an audit).
  const shotsUrl = process.argv.find(a => a.startsWith("--shots="))?.split("=").slice(1).join("=");
  let screenshots: { desktop: string | null; mobile: string | null } | undefined;
  if (shotsUrl) {
    const captured = await captureSiteScreenshots(shotsUrl);
    if (captured.error) console.warn("[preview] screenshots:", captured.error);
    screenshots = { desktop: captured.desktop, mobile: captured.mobile };
  }

  const base = { websiteUrl: shotsUrl ?? "https://example.com", businessName: "Nour Home & Living", discoveredPages, screenshots };

  const result: AuditResult =
    mode === "tracking"
      ? { ...base, categories: [ga4Category(), gtmCategory()], overallScore: 38, possiblePoints: 50 }
      : mode === "single"
        ? { ...base, categories: [ga4Category(), websiteCodeCategory()], overallScore: 33, possiblePoints: 50 }
        : { ...base, categories: [websiteCategory()], overallScore: 31, possiblePoints: 50 };

  // Best-effort, same as the real pipeline (poll.ts/test-run.ts) — exercises
  // the Arabic toggle in the preview using the real translation pass instead
  // of a hand-maintained (and easily stale) Arabic fixture. --no-ar skips it
  // for a fast iteration loop when only the English side is being tweaked.
  if (!process.argv.includes("--no-ar")) {
    const arabic = await translateFindingsToArabic(result, `preview-${mode}`);
    console.log("[preview] arabic:", arabic.error ?? `${arabic.translated}/${arabic.total} findings translated`);
  }

  const { html } = await buildAuditHtmlReport(result);
  const outDir = path.join(__dirname, "..", "output");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `preview-${mode}.html`);
  await writeFile(outPath, html, "utf8");
  console.log(`Wrote ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
