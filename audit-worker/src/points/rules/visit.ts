import type { Box, PageEvidence, StoreEvidence, TextBlock } from "../../fud/evidence.js";
import { desktopView, pageOf } from "../../fud/evidence.js";
import { anyBlock, hasWidget, matches, normalize } from "../../fud/signals.js";
import { contactLinksFrom, hasPrice } from "../../site-checks.js";
import type { Rule } from "./types.js";
import { unverified } from "./types.js";

/**
 * Rules read from our own store visit (fud/collect.ts). The phone screen is
 * 390x844. A rule only fails on what it saw for certain; anything our bot
 * may have caused or missed is unverified.
 */

const PHONE_HEIGHT = 844;

// Vertical gap between two boxes (0 when they overlap).
function gap(a: Box, b: Box): number {
  return Math.max(0, b.y - (a.y + a.h), a.y - (b.y + b.h));
}

// The product price: the price-looking block nearest the buy button. Shipping
// and promo lines carry amounts too ("free shipping over 40 KD" in the
// announcement bar on regal-honey.com), so they never count as the price.
function priceBlock(p: PageEvidence): TextBlock | undefined {
  const priced = p.blocks.filter(b => {
    if (!hasPrice(b.text)) return false;
    const t = normalize(b.text);
    return !matches("shippingWord", t) && !matches("discountField", t) && !matches("freeShipping", t);
  });
  if (!priced.length) return undefined;
  const cta = p.cta?.box;
  return cta ? [...priced].sort((a, b) => gap(a.box, cta) - gap(b.box, cta))[0] : priced.find(b => b.aboveFold) ?? priced[0];
}

function page(e: StoreEvidence | null | undefined, type: PageEvidence["pageType"]): PageEvidence | undefined {
  return e ? pageOf(e, type) : undefined;
}

const noVisit = unverified("Our store visit didn't run this time.");

// ---- TRK-17: our add to cart reaches GA4 and every pixel ----
// Event names each platform uses for add to cart.
const ATC_NAME: Record<string, RegExp> = { ga4: /^add_to_cart$/, meta: /^AddToCart$/, tiktok: /^AddToCart$/, snap: /^ADD_CART$/i, pinterest: /^addtocart$/i };
const trk17: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const a = e.addToCart;
  if (!a.attempted || !a.ok || a.via === "api" || a.clickAdded === false) {
    return unverified(`Our Add to Cart click didn't fill the cart by itself (${a.reason ?? (a.via === "api" ? "the item was added through the store's cart endpoint" : "item did not reach the cart")}), so the events it sends can't be judged.`);
  }
  const ev = e.atcEvents ?? { dataLayer: [], ga4: [], pixels: [] };
  const vendors = [...new Set((e.pageHits ?? []).map(h => h.vendor))].filter(v => ATC_NAME[v]);
  if (!vendors.length) return unverified("No GA4 or ad pixel hits were seen on page loads, so there is nothing to compare the click with.");
  const sent = (v: string) => (v === "ga4" ? [...ev.ga4, ...ev.dataLayer] : ev.pixels.filter(x => x.startsWith(`${v}:`)).map(x => x.slice(v.length + 1))).some(n => ATC_NAME[v].test(n));
  const missing = vendors.filter(v => !sent(v));
  const facts = { platforms: vendors, missing, dataLayer: ev.dataLayer, ga4: ev.ga4, pixels: ev.pixels };
  if (!missing.length) return { status: "pass", reason: `Our Add to Cart click filled the cart and ${vendors.join(", ")} each recorded an add to cart.`, facts };
  // A hit can arrive after our capture window, so a missing one is not proof.
  // final: the AI gets the same evidence and can't know either (Regal run 21:
  // it failed this from the same missing hit).
  return unverified(`Our click filled the cart, but no add to cart was seen from ${missing.join(", ")} within our capture window. It may be missing or late.`, { ...facts, final: true });
};

// ---- PATH-03: top products can be bought ----
const path03: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const home = page(e, "home");
  const product = page(e, "product");
  const soldOut = e.pages.filter(p => p.loaded && (p.pageType === "home" || p.pageType === "collection")).reduce((s, p) => s + (p.facts?.soldOutTop ?? 0), 0);
  if (soldOut > 0) return { status: "fail", reason: `${soldOut} "sold out" badge(s) sit in the first screens of the home or collection page.`, facts: { soldOutBadges: soldOut } };
  if (product?.cta?.disabled) return { status: "fail", reason: `The Add to Cart button on ${product.url} is disabled.`, facts: { url: product.url, button: product.cta.text } };
  if (!home || !product || !product.cta) return unverified("The home or product page didn't load, or no buy button was found.");
  return { status: "pass", reason: `No sold-out badge in the first screens, and Add to Cart ("${product.cta.text}") is active on the product page.`, facts: { url: product.url } };
};

// ---- PATH-16: checkout has no distractions ----
const LOGIN = /log-?in|sign in|account/i;
const path16: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const k = e.pages.find(p => p.pageType === "checkout");
  if (!k || !k.loaded) return unverified("The first checkout screen didn't load.");
  if (k.note && LOGIN.test(k.note)) return unverified("The store sent us to a log-in page before checkout, so the checkout screen wasn't seen.", { note: k.note });
  const nav = k.facts?.nav;
  if (!nav) return unverified("The checkout screen's header wasn't read.");
  const popups = (k.popups?.onLoad ?? []).filter(p => p.kind !== "cookie");
  if (nav.length > 2 || popups.length) {
    return { status: "fail", reason: `The first checkout screen shows ${nav.length > 2 ? `a menu of ${nav.length} links (${nav.slice(0, 4).join(", ")})` : ""}${nav.length > 2 && popups.length ? " and " : ""}${popups.length ? `${popups.length} popup(s)` : ""}.`, facts: { navLinks: nav.length, popups: popups.length } };
  }
  return { status: "pass", reason: `The first checkout screen has no main menu${nav.length ? ` (only ${nav.join(", ")})` : ""} and no popups.`, facts: { navLinks: nav.length } };
};

// ---- PDP-01: add to cart reachable on the first phone screen ----
const pdp01: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p || !p.cta) return unverified("The product page didn't load, or no Add to Cart button was found.");
  const inFold = p.cta.box.y + p.cta.box.h <= PHONE_HEIGHT;
  const facts = { buttonBottom: p.cta.box.y + p.cta.box.h, sticky: Boolean(p.sticky) };
  if (!inFold && !p.sticky) return { status: "fail", reason: `Add to Cart sits ${p.cta.box.y + p.cta.box.h}px down on a 844px phone screen, and no sticky buy button follows the shopper.`, facts };
  const price = priceBlock(p);
  const priceInFold = Boolean(price && price.box.y + price.box.h <= PHONE_HEIGHT);
  const out = { ...facts, priceTop: price ? price.box.y : "not found" };
  if (inFold && priceInFold) return { status: "pass", reason: "Add to Cart and the price both show in the first phone screen.", facts: out };
  if (p.sticky) return { status: "pass", reason: `${inFold ? `Add to Cart shows in the first screen${price ? ` and the price sits ${price.box.y}px down` : ""}` : "Add to Cart is below the first screen"}; a sticky "${p.sticky}" button follows the shopper.`, facts: out };
  if (!price) return unverified("Add to Cart is in the first screen, but no price was found on the page (the price format may not have been recognised).", out);
  return { status: "fail", reason: `The price sits ${price.box.y}px down on a 844px phone screen, below the first screen, with no sticky buy bar.`, facts: out };
};

// ---- LAND-11: buy box reachable at once (code+ai) ----
// Code decides the measured ends: the button on the first phone screen, or a
// buy bar that follows the shopper, passes; a button more than two screens
// down with no such bar fails (there is always body copy before it). A button
// on the second screen is left to the AI: whether what sits above it is
// "body copy" is a judgement (Regal, 23 Nov: judged both ways on the same page).
const land11: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const l = page(e, "landing");
  if (!l) return unverified("No landing page was visited.");
  if (!l.cta) return unverified(`No buy button or form was found on ${l.url}.`);
  const top = l.cta.box.y, bottom = l.cta.box.y + l.cta.box.h;
  const facts = { url: l.url, buttonTop: top, buttonBottom: bottom, sticky: l.sticky ?? "not checked" };
  if (bottom <= PHONE_HEIGHT) return { observation: { ar: `زر الشراء على بعد ${top}px من الأعلى في صفحة الهبوط، ضمن أول شاشة في الجوال.` }, status: "pass", reason: `The buy button sits ${top}px down on ${l.url}, inside the first 844px phone screen.`, facts };
  if (l.sticky) return { observation: { ar: `في صفحة الهبوط شريط شراء «${l.sticky}» يتبع المتسوق، فلا يحتاج إلى التمرير للشراء.` }, status: "pass", reason: `On ${l.url} a «${l.sticky}» buy bar follows the shopper, so buying needs no scrolling.`, facts };
  if (l.sticky === null && top >= 2 * PHONE_HEIGHT) return { observation: { ar: `في صفحة الهبوط يبدأ زر الشراء على بعد ${top}px، بعد الشاشة الثانية على الجوال، ولا يوجد شريط شراء يتبع المتسوق.` }, status: "fail", reason: `On ${l.url} the buy button starts ${top}px down, past the second phone screen, and no buy bar follows the shopper.`, facts };
  return unverified(`On ${l.url} the buy button starts ${top}px down, on the second phone screen${l.sticky === null ? "" : "; whether a buy bar follows wasn't checked"}.`, facts);
};

// ---- PDP-11: photos zoom ----
const pdp11: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p?.facts) return unverified("The product page didn't load.");
  if (p.facts.media.zoom) return { status: "pass", reason: "The product gallery has zoom or a lightbox.", facts: { images: p.facts.media.images } };
  // Native pinch-zoom and custom galleries can't be seen from the page markup.
  return unverified("No zoom or lightbox was found in the gallery markup; phone pinch-zoom may still work.", { images: p.facts.media.images });
};

// ---- NAV-02: short main menu, buying links first ----
const WEAK = /blog|مدون|about|من نحن|عن(?:ا| المتجر)|contact|تواصل|اتصل|faq|الاسئلة|الأسئلة|careers|وظائف|track|تتبع/i;
const HOMEWORD = /^(home|الرئيسية|الصفحة الرئيسية)$/i;
const nav02: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  // The phone menu is usually a hamburger, so read the desktop header.
  const desk = desktopView(e);
  const nav = desk ? pageOf(desk, "home")?.facts?.nav : undefined;
  if (!nav?.length) return unverified("The desktop visit didn't run or found no menu links.");
  const items = nav.filter(l => !HOMEWORD.test(l.trim()));
  const firstWeak = items.findIndex(l => WEAK.test(l));
  const lastBuy = items.map(l => !WEAK.test(l)).lastIndexOf(true);
  const weakAhead = firstWeak !== -1 && firstWeak < lastBuy;
  const facts = { links: nav.length, menu: nav };
  if (nav.length > 6 || weakAhead) {
    return { status: "fail", reason: `${nav.length > 6 ? `The main menu has ${nav.length} links` : "The main menu"}${weakAhead ? `${nav.length > 6 ? ", and" : " puts"} "${items[firstWeak]}" ahead of shopping links` : ""}.`, facts };
  }
  return { status: "pass", reason: `The main menu has ${nav.length} links, shopping first.`, facts };
};

// ---- NAV-04: search visible in the header ----
const nav04: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const phone = page(e, "home")?.facts?.search;
  if (!phone) return unverified("The home page didn't load.");
  const desk = desktopView(e);
  const desktop = desk ? pageOf(desk, "home")?.facts?.search : undefined;
  const facts = { phone: phone.visible, desktop: desktop ? desktop.visible : "not checked" };
  if (!phone.visible) return { status: "fail", reason: phone.present ? "Search exists but is hidden behind the menu on phones." : "No search box or icon was found in the phone header.", facts };
  if (desktop && !desktop.visible) return { status: "fail", reason: "Search shows on phones but not in the desktop header.", facts };
  return { status: "pass", reason: `Search is visible in the header on phones${desktop ? " and desktop" : " (desktop not checked)"}.`, facts };
};

// ---- NAV-10: no popup in the way on arrival ----
const nav10: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const home = page(e, "home");
  if (!home?.popups) return unverified("The home page didn't load, or popups weren't read.");
  // Cookie banners are judged by the consent point, not here.
  const blocking = home.popups.onLoad.filter(p => p.kind !== "cookie");
  const facts = { popups: blocking.map(p => `${p.kind} ${p.cover}%`), stillOpenAfterEscape: home.popups.afterEscape };
  if (!blocking.length) return { status: "pass", reason: "No popup covers the home page when a shopper arrives.", facts };
  const top = [...blocking].sort((a, b) => b.cover - a.cover)[0];
  return { status: "fail", reason: `A popup covers ${top.cover}% of the phone screen on arrival ("${top.text.slice(0, 60)}")${home.popups.afterEscape ? ", and it stays open after Escape" : ""}.`, facts };
};

// ---- OFFER-06: instalment line near the price ----
const offer06: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p) return unverified("The product page didn't load.");
  const widget = hasWidget(p, "installments");
  const lines = anyBlock(p.blocks, "installments");
  if (!widget && !lines.length) return { status: "n/a", reason: "No instalment provider (Tabby, Tamara, valU…) was found on the product page." };
  const price = priceBlock(p);
  if (!price) return unverified("The product price wasn't found, so the instalment line's position can't be judged.");
  if (!lines.length) return unverified("An instalment provider is installed, but its line wasn't readable (it may sit inside a frame).", { widget });
  const nearest = Math.min(...lines.map(b => gap(b.box, price.box)));
  const facts = { distancePx: nearest, line: lines[0].text.slice(0, 80) };
  return nearest <= 300
    ? { status: "pass", reason: `An instalment line ("${lines[0].text.slice(0, 60)}") sits ${nearest}px from the price.`, facts }
    : { status: "fail", reason: `The instalment line sits ${nearest}px from the price, out of sight when the shopper reads it.`, facts };
};

// ---- OFFER-18: stock or sale-end message near the price ----
const offer18: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p) return unverified("The product page didn't load.");
  const msgs = [...anyBlock(p.blocks, "stock"), ...anyBlock(p.blocks, "merchBadge")];
  if (!msgs.length) return { status: "n/a", reason: "No stock or sale-end message on the product page (not a fail)." };
  const price = priceBlock(p);
  if (!price) return unverified("The product price wasn't found, so the message's position can't be judged.");
  const nearest = Math.min(...msgs.map(b => gap(b.box, price.box)));
  const facts = { distancePx: nearest, message: msgs[0].text.slice(0, 80) };
  return nearest <= 200
    ? { status: "pass", reason: `"${msgs[0].text.slice(0, 60)}" sits ${nearest}px from the price.`, facts }
    : { status: "fail", reason: `The stock message sits ${nearest}px from the price, too far to be read with it.`, facts };
};

// ---- PATH-08: WhatsApp and call links work ----
const path08: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  if (!e.pages.some(p => p.loaded)) return unverified("No page of the store loaded.");
  const links = contactLinksFrom(e.pages);
  if (!links.length) return { status: "n/a", reason: "No WhatsApp or phone link was found on the pages we visited." };
  const bad = links.filter(l => !l.valid);
  const facts = { links: links.map(l => l.href), broken: bad.map(l => l.href) };
  return bad.length
    ? { status: "fail", reason: `${bad.length} contact link(s) have a missing or short number: ${bad.map(l => l.href).slice(0, 3).join(", ")}.`, facts }
    : { status: "pass", reason: `All ${links.length} WhatsApp/phone link(s) use a full international number.`, facts };
};

export const VISIT_RULES: Record<string, Rule> = {
  "PATH-08": path08,
  "TRK-17": trk17,
  "PATH-03": path03,
  "PATH-16": path16,
  "PDP-01": pdp01,
  "LAND-11": land11,
  "PDP-11": pdp11,
  "NAV-02": nav02,
  "NAV-04": nav04,
  "NAV-10": nav10,
  "OFFER-06": offer06,
  "OFFER-18": offer18,
};
