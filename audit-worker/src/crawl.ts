// Response headers a security/best-practices checklist point can actually
// evaluate from a single already-made static fetch — no need for a second
// request or the browser. Absent from `headers` means the header genuinely
// wasn't sent (fetch() lowercases header names, so this list is already
// lowercase to match `res.headers.get(...)` results directly).
const SECURITY_HEADER_NAMES = [
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "strict-transport-security",
  "set-cookie",
  "server",
  "x-powered-by",
] as const;

export interface CrawlFindings {
  html: string;
  headers: Partial<Record<(typeof SECURITY_HEADER_NAMES)[number], string>>;
  detected: {
    GA4: boolean;
    GTM: boolean;
    Clarity: boolean;
    Hotjar: boolean;
  };
  /**
   * Literal IDs pulled out of the page source (not just "present/absent").
   * These are what make it possible to find *this specific visitor's*
   * property/container out of everything the shared service account can
   * see — matched by exact ID, never by business name or domain guessing.
   * Deduplicated; empty array if none found (e.g. GA4 loaded dynamically via
   * GTM rather than a literal gtag.js snippet in the server-rendered HTML —
   * a real limitation of a plain fetch-based crawl with no JS execution).
   */
  ids: {
    ga4MeasurementIds: string[];
    gtmContainerIds: string[];
  };
  /**
   * Deterministic structural signals computed from `html` — added
   * specifically so checklist points that need something about the raw
   * page source beyond a plain "is it present" boolean (GTM-16's
   * consent-sequencing, GTM-10's SPA heuristic, GTM-11's platform guess —
   * see checklist.ts) have a REAL field to check instead of silently
   * falling back to a guess with nothing behind it. gtmScriptEarlyInHead/
   * gtmNoscriptRightAfterBody are NOT tied to a scored checklist point —
   * kept as unscored informational context only (see checklist.ts's GTM-1
   * doc comment for why the snippet-position check itself was dropped).
   * Every field
   * is computed from a single static HTML string with no JS execution, so
   * each is a best-effort proxy, not ground truth — `null` means "couldn't
   * be determined from this signal," not "failed."
   */
  structuralSignals: {
    // Is the GTM script tag among the first script/link resources in
    // <head> (a proxy for "as high as possible"), rather than buried after
    // several other resources? Null when no GTM script tag was found at
    // all in <head> (e.g. GTM injected some other way).
    gtmScriptEarlyInHead: boolean | null;
    // Does the GTM <noscript> fallback appear immediately (allowing only
    // whitespace/comments) after the opening <body> tag, rather than after
    // other real markup? Null when no GTM noscript block was found.
    gtmNoscriptRightAfterBody: boolean | null;
    // Does a Consent Mode default-consent call (gtag('consent','default'...))
    // appear earlier in the raw source than the GTM script tag? Null when
    // no such consent-default call was found at all (can't tell whether
    // sequencing matters here, not the same as it being wrong).
    consentDefaultBeforeGtm: boolean | null;
    // Heuristic only: very little real text content inside <body> once
    // <script>/<style> blocks are stripped is consistent with a
    // client-side-rendered SPA shell (a near-empty root div, real content
    // injected by JS after load) — not a confirmed SPA, just a signal.
    looksLikeSpaShell: boolean;
    // First recognized CMS/platform fingerprint found in the raw source
    // (script/asset URL patterns, global object names), or null if none of
    // the recognized patterns matched — not an exhaustive CMS detector.
    cmsPlatformGuess: "Shopify" | "WooCommerce" | "WordPress" | "Wix" | "Squarespace" | "Webflow" | "Magento" | "BigCommerce" | null;
  };
}

const CMS_PATTERNS: Array<[CrawlFindings["structuralSignals"]["cmsPlatformGuess"] & string, RegExp]> = [
  ["Shopify", /cdn\.shopify\.com|Shopify\.theme|window\.Shopify/i],
  ["WooCommerce", /woocommerce|wp-content\/plugins\/woocommerce/i],
  ["WordPress", /wp-content\/|wp-json\/|wp-includes\//i],
  ["Wix", /static\.wixstatic\.com|wix-warmup-data/i],
  ["Squarespace", /squarespace\.com|static1\.squarespace\.com/i],
  ["Webflow", /webflow\.com|data-wf-site/i],
  ["Magento", /mage\/cookies|Magento_/i],
  ["BigCommerce", /cdn\d*\.bigcommerce\.com|bigcommerce\.com/i],
];

function computeStructuralSignals(html: string): CrawlFindings["structuralSignals"] {
  const headMatch = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(html);
  const head = headMatch ? headMatch[1] : "";
  const gtmScriptIdx = head.search(/googletagmanager\.com\/gtm\.js\?id=/i);
  let gtmScriptEarlyInHead: boolean | null = null;
  if (gtmScriptIdx !== -1) {
    const before = head.slice(0, gtmScriptIdx);
    const priorResourceCount = (before.match(/<script[\s>]|<link[\s>]/gi) || []).length;
    gtmScriptEarlyInHead = priorResourceCount <= 1;
  }

  const bodyOpenMatch = /<body[^>]*>/i.exec(html);
  let gtmNoscriptRightAfterBody: boolean | null = null;
  if (bodyOpenMatch) {
    const afterBody = html.slice(bodyOpenMatch.index + bodyOpenMatch[0].length);
    const noscriptIdx = afterBody.search(/<noscript>[\s\S]*?googletagmanager\.com\/ns\.html\?id=/i);
    if (noscriptIdx !== -1) {
      const between = afterBody.slice(0, noscriptIdx);
      gtmNoscriptRightAfterBody = !/<[a-z][a-z0-9-]*(?:\s[^>]*)?>/i.test(between.replace(/<!--[\s\S]*?-->/g, ""));
    }
  }

  const gtmTagIdx = html.search(/googletagmanager\.com\/(gtm\.js|ns\.html)\?id=/i);
  const consentIdx = html.search(/gtag\(\s*['"]consent['"]\s*,\s*['"]default['"]/i);
  const consentDefaultBeforeGtm = consentIdx === -1 ? null : gtmTagIdx === -1 ? null : consentIdx < gtmTagIdx;

  const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  const textOnly = bodyContent
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const looksLikeSpaShell = textOnly.length < 150;

  const cmsMatch = CMS_PATTERNS.find(([, pattern]) => pattern.test(html));
  const cmsPlatformGuess = cmsMatch ? cmsMatch[0] : null;

  return { gtmScriptEarlyInHead, gtmNoscriptRightAfterBody, consentDefaultBeforeGtm, looksLikeSpaShell, cmsPlatformGuess };
}

/**
 * Extraction is anchored to the specific URLs Google's own install snippets
 * always produce (gtag.js's script src, GTM's noscript iframe src) rather
 * than a bare "G-something"/"GTM-something" text scan. A loose scan matches
 * far too much real-world page content — e.g. Google's own reCAPTCHA widget
 * uses the CSS class `g-recaptcha`, and any site can have JS/CSS identifiers
 * that happen to start with "G-" or "GTM-". Confirmed by testing against a
 * real production site where the loose version matched CSS classes like
 * "G-ANIMATION" and "G-FAMILY" as if they were measurement IDs.
 */
function extractUnique(html: string, pattern: RegExp): string[] {
  const found = new Set<string>();
  for (const match of html.matchAll(pattern)) {
    if (match[1]) found.add(match[1].toUpperCase());
  }
  return Array.from(found);
}

const GA4_PATTERNS = [
  /googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]+)/gi,
  /gtag\(\s*['"]config['"]\s*,\s*['"](G-[A-Z0-9]+)['"]/gi,
];

const GTM_PATTERNS = [
  /googletagmanager\.com\/ns\.html\?id=(GTM-[A-Z0-9]+)/gi,
  /googletagmanager\.com\/gtm\.js\?id=(GTM-[A-Z0-9]+)/gi,
];

/**
 * Public, no-auth signal for whether a tool's tracking snippet is present on
 * the live page, plus the literal GA4/GTM IDs found in the HTML. Used both as
 * the detection-only fallback whenever live MCP access isn't available, and
 * as the exact-match key the audit prompt uses to pick the right property/
 * container out of a multi-tenant service account's access list.
 */
export async function crawlWebsite(url: string): Promise<CrawlFindings> {
  // Bounded so a stalled connection (seen in practice — no error, no socket
  // ever showing in netstat, just an unresolved promise) fails fast instead
  // of hanging the whole run indefinitely.
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; OptimizersAuditBot/1.0; +https://optimizers.example)" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();

  const headers: CrawlFindings["headers"] = {};
  for (const name of SECURITY_HEADER_NAMES) {
    const value = res.headers.get(name);
    if (value) headers[name] = value;
  }

  const ga4MeasurementIds = GA4_PATTERNS.flatMap(p => extractUnique(html, p));
  const gtmContainerIds = GTM_PATTERNS.flatMap(p => extractUnique(html, p));

  return {
    html,
    headers,
    detected: {
      GA4: ga4MeasurementIds.length > 0,
      GTM: gtmContainerIds.length > 0,
      Clarity: /clarity\.ms\/tag/i.test(html),
      Hotjar: /static\.hotjar\.com/i.test(html),
    },
    ids: {
      ga4MeasurementIds: Array.from(new Set(ga4MeasurementIds)),
      gtmContainerIds: Array.from(new Set(gtmContainerIds)),
    },
    structuralSignals: computeStructuralSignals(html),
  };
}
