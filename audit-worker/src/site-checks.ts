import type { StoreEvidence } from "./fud/evidence.js";
import type { SiteChecks } from "./types.js";

/**
 * The browser facts the friction collector saw on the live store, reduced to
 * what the 50-check prompt needs (W-01, W-07, W-08, W-17, W-22, GTM-11,
 * GTM-24 are written from these, so the audit and the Conversion review
 * describe the same visit).
 */

// A WhatsApp/phone link is usable when it carries a full international
// number: 8–15 digits after stripping +, spaces and dashes.
function contactValid(href: string): boolean {
  const raw = href.startsWith("tel:")
    ? href.slice(4)
    : (/wa\.me\/(\+?[\d\s-]+)/.exec(href)?.[1] ?? /[?&]phone=(\+?[\d\s%-]+)/.exec(href)?.[1] ?? "");
  const digits = decodeURIComponent(raw).replace(/[^\d]/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function siteChecksFrom(e: StoreEvidence, platform: string | null): SiteChecks {
  const links = new Map<string, SiteChecks["contactLinks"][number]>();
  for (const p of e.pages) {
    for (const href of p.facts?.contactLinks ?? []) {
      if (links.has(href)) continue;
      links.set(href, { href, kind: href.startsWith("tel:") ? "tel" : "whatsapp", valid: contactValid(href) });
    }
  }
  const cart = e.pages.find(p => p.pageType === "cart" && p.loaded);
  const home = e.pages.find(p => p.pageType === "home" && p.loaded);
  return {
    platform,
    addToCart: { attempted: e.addToCart.attempted, ok: e.addToCart.ok, reason: e.addToCart.reason, via: e.addToCart.ok ? cart?.cart?.source : undefined, method: e.addToCart.via, clickAdded: e.addToCart.clickAdded },
    // Events only say something when the click itself filled the cart.
    atcEvents: e.addToCart.clickAdded === false || !e.addToCart.ok ? null : e.atcEvents ?? null,
    contactLinks: [...links.values()].slice(0, 8),
    soldOutPromoted: e.pages.filter(p => p.pageType === "home" || p.pageType === "collection").reduce((s, p) => s + (p.facts?.soldOutTop ?? 0), 0),
    heroVideoMobile: home?.facts?.hero?.kind === "video" && (home.facts.hero.coverPct ?? 0) >= 30,
    pagesVisited: e.pages.map(p => ({ pageType: p.pageType, url: p.url, loaded: p.loaded })),
  };
}

export function siteChecksPromptBlock(s: SiteChecks): string {
  const atc = !s.addToCart.attempted
    ? `not attempted (${s.addToCart.reason ?? "no product page"})`
    : s.addToCart.method === "api"
      ? "our click on Add to Cart left the cart empty; the item was then added through the store's own cart endpoint so the cart could be reviewed. The click result is UNCONFIRMED (it may be our automated browser): do not fail a check on it alone"
      : s.addToCart.ok
        ? `worked (item reached the cart via ${s.addToCart.via ?? "the cart"})`
        : `did not fill the cart (${s.addToCart.reason ?? "item did not reach the cart"}); UNCONFIRMED, may be our automated browser`;
  const ev = s.atcEvents;
  const events = ev
    ? `dataLayer: ${ev.dataLayer.join(", ") || "nothing"}; GA4 hits: ${ev.ga4.join(", ") || "none"}; ad pixels: ${ev.pixels.join(", ") || "none"}`
    : "not usable: the click did not add the item, so add_to_cart tracking can't be judged from it (use the GTM/GA4 data instead)";
  const contacts = s.contactLinks.length ? s.contactLinks.map(c => `${c.href} (${c.valid ? "valid number" : "INVALID number"})`).join("; ") : "none found";
  return [
    `- Platform: ${s.platform ?? "unknown"}`,
    `- Our Add-to-Cart click on the product page: ${atc}`,
    `- Events sent by that click: ${events}`,
    `- WhatsApp / phone links: ${contacts}`,
    `- "Sold out" badges in the first screens of home/collection: ${s.soldOutPromoted}`,
    `- Autoplay video filling the phone first screen: ${s.heroVideoMobile ? "yes" : "no"}`,
    `- Pages visited: ${s.pagesVisited.map(p => `${p.pageType} ${p.url}${p.loaded ? "" : " (did not load)"}`).join(", ")}`,
  ].join("\n");
}
