import { MAX_SWEEP_PAGES } from "./pagespeed.js";

/**
 * Picks a page-TYPE-aware sweep instead of a blind top-N-by-priority slice
 * (2026-09-06 rewrite). The old version sliced the priority-sorted candidate
 * list to the first MAX_SWEEP_PAGES — on a real Shopify store (tharaa.shop)
 * that meant homepage/collections/account/search/cart pages filled all 8
 * slots while a genuine product page and the blog were never reached at
 * all, even though both existed further down the same sitemap. One
 * representative page per commerce-relevant TYPE is more useful for
 * catching a slow product/checkout page than N pages that happen to sort
 * first — see pagespeed.ts's own MAX_SWEEP_PAGES doc comment for the
 * original "catch a slow product/checkout page hiding behind a fast
 * homepage" intent this restores properly.
 */
const PAGE_CATEGORIES: Array<{ name: string; test: (pathname: string) => boolean }> = [
  { name: "product", test: p => p.includes("/products/") },
  { name: "collection", test: p => p.includes("/collections/") },
  { name: "cart", test: p => p === "/cart" || p.startsWith("/cart/") },
  { name: "blog", test: p => p.includes("/blogs/") },
];

/**
 * Finds one page URL per commerce-relevant TYPE to run the site-wide
 * PageSpeed sweep against — deterministically, no LLM judgment call on
 * which pages matter. Two candidate sources, in priority order:
 *
 * 1. sitemap.xml at the site's root — the site's own declared page list,
 *    sorted by its own <priority> tag (descending) when present.
 * 2. Same-origin links pulled straight out of the already-fetched homepage
 *    HTML (crawlWebsite already has it — no extra fetch), used only when
 *    the sitemap is missing, unparseable, or came back empty.
 *
 * The homepage itself is always included and always first. Each of
 * PAGE_CATEGORIES then gets exactly one representative — the first
 * matching URL anywhere in the (priority-ordered) candidate list, not just
 * the first MAX_SWEEP_PAGES of it — so a product/blog page that exists but
 * sorts low still gets found. A category with no matching URL anywhere
 * (e.g. a site with no blog) is simply skipped, not forced. Result is at
 * most 1 (homepage) + PAGE_CATEGORIES.length pages — MAX_SWEEP_PAGES is
 * kept as a hard safety cap, not the driver of how many pages get checked
 * any more.
 */
export async function discoverPages(baseUrl: string, homepageHtml: string): Promise<string[]> {
  const origin = new URL(baseUrl).origin;
  const homepage = normalizeUrl(baseUrl, origin);

  let candidates = await fromSitemap(origin);
  if (candidates.length === 0) {
    candidates = fromHomepageLinks(homepageHtml, origin);
  }

  const ordered = candidates.filter(u => u !== homepage);

  const picked: string[] = [homepage];
  for (const { test } of PAGE_CATEGORIES) {
    const match = ordered.find(u => {
      try {
        return test(new URL(u).pathname);
      } catch {
        return false;
      }
    });
    if (match && !picked.includes(match)) picked.push(match);
  }

  return Array.from(new Set(picked)).slice(0, MAX_SWEEP_PAGES);
}

function normalizeUrl(url: string, origin: string): string {
  try {
    return stripHash(new URL(url, origin).toString());
  } catch {
    return url;
  }
}

interface SitemapEntry {
  loc: string;
  priority: number;
}

/**
 * A URL fragment (#anchor) never changes what the server actually returns —
 * same HTML, same resources, same PageSpeed result — so it's never a
 * distinct page to run the sweep against. Real-world case that motivated
 * this: a single-page site's own sitemap.xml listed each in-page section
 * (#services, #contact, etc.) as its own <url> entry, apparently for SEO
 * anchor-linking purposes — accurate to what the sitemap says, but not five
 * different pages worth five separate PSI runs.
 */
function stripHash(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Deliberately a light regex extraction, not a full XML parser — sitemap.xml
 * is a narrow, well-known schema (<url><loc>...</loc><priority>...</priority>
 * ...</url> repeated), and pulling in an XML dependency for one field pair
 * isn't worth it. Falls back cleanly (empty array) on anything that doesn't
 * look like a sitemap, including a sitemap INDEX file (one that itself just
 * lists other sitemap files) — that's a real limitation, not a bug: a
 * multi-sitemap index would need a second fetch layer this doesn't do.
 */
async function fromSitemap(origin: string): Promise<string[]> {
  let xml: string;
  try {
    // Bounded for the same reason as crawl.ts's fetch — a stalled connection
    // otherwise hangs forever instead of hitting the catch below.
    const res = await fetch(`${origin}/sitemap.xml`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; OptimizersAuditBot/1.0; +https://optimizers.example)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }

  const entries: SitemapEntry[] = [];
  const urlBlockPattern = /<url\b[^>]*>([\s\S]*?)<\/url>/gi;
  for (const block of xml.matchAll(urlBlockPattern)) {
    const body = block[1];
    const loc = body.match(/<loc>\s*([^<\s]+)\s*<\/loc>/i)?.[1];
    if (!loc) continue;
    const priorityRaw = body.match(/<priority>\s*([\d.]+)\s*<\/priority>/i)?.[1];
    const priority = priorityRaw ? parseFloat(priorityRaw) : 0.5; // sitemap spec default when omitted
    entries.push({ loc: stripHash(loc), priority });
  }

  return entries
    .sort((a, b) => b.priority - a.priority)
    .map(e => e.loc);
}

/**
 * Fallback when there's no usable sitemap: same-origin hrefs found directly
 * in the homepage's own HTML, in document order (a reasonable proxy for
 * "what the site itself links to first/most prominently" absent a real
 * sitemap's explicit priority signal).
 */
function fromHomepageLinks(html: string, origin: string): string[] {
  const found: string[] = [];
  const hrefPattern = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi;
  for (const match of html.matchAll(hrefPattern)) {
    const href = match[1];
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    let absolute: URL;
    try {
      absolute = new URL(href, origin);
    } catch {
      continue;
    }
    if (absolute.origin !== origin) continue; // same-origin only — a different domain isn't "this site's pages"
    found.push(stripHash(absolute.toString()));
  }
  return found;
}
