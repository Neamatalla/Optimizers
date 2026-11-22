import type { DataLayerPush, HitParams, PageEvidence, PageNet, StoreEvidence } from "../../fud/evidence.js";
import { pageOf } from "../../fud/evidence.js";
import { currencyIn, hasWidget, matches, moneyAmounts, normalize } from "../../fud/signals.js";
import { hasPrice } from "../../site-checks.js";
import type { Rule, RuleResult } from "./types.js";
import { unverified } from "./types.js";

/**
 * Rules that read what collect.ts logs while it browses: script errors,
 * failed files, http requests, gtag loads, hit counts and item fields,
 * product-card details, struck-through prices, JSON-LD offers.
 * Same stance as visit.ts: fail only on what the log proves; anything our
 * bot may have caused or missed is unverified.
 */

const PHONE_HEIGHT = 844;
const noVisit = unverified("Our store visit didn't run this time.");
const na = (reason: string): RuleResult => ({ status: "n/a", reason });
const page = (e: StoreEvidence, type: PageEvidence["pageType"]) => pageOf(e, type);
const LOGIN = /log-?in|sign in|account/i;

// ---- helpers (pure, tested) ----

// The registrable part of a host: "cdn.shop.example.com" and "shop.example.com" share "example.com".
function baseHost(host: string): string {
  const parts = host.replace(/^www\./, "").toLowerCase().split(".");
  const second = parts[parts.length - 2];
  const keep = parts[parts.length - 1].length === 2 && /^(co|com|org|net|gov|edu)$/.test(second ?? "") ? 3 : 2;
  return parts.slice(-keep).join(".");
}
const hostOf = (url: string): string => { try { return new URL(url).hostname; } catch { return ""; } };
// Platform code (theme and storefront scripts) is the store's own.
const PLATFORM = /shopify|shopifycdn|salla|zid\.|youcan|woocommerce|wp\.com|wordpress|wixstatic|squarespace/i;

/**
 * Uncaught script errors that come from the store's own code. Errors from
 * another origin ("Script error." with no detail, or a third-party app's
 * host) are left out: they are common and not the store's to fix.
 */
export function ownErrors(net: PageNet | undefined, website: string): Array<{ msg: string; host?: string }> {
  const own = baseHost(hostOf(website) || website);
  return (net?.errors ?? []).filter(er => {
    if (/^script error\.?$/i.test(er.msg.trim())) return false;
    if (!er.host) return true;
    return baseHost(er.host) === own || PLATFORM.test(er.host);
  });
}

/** Failed files on one page (a missing favicon.ico is not counted: browsers ask for it by themselves): 404, 5xx, and real network errors (not a bare ERR_FAILED, which a blocked cross-origin call also gives). */
export function failedFiles(net: PageNet): { hard: PageNet["failed"]; vague: PageNet["failed"] } {
  const real = net.failed.filter(f => !/\/favicon\.ico(?:\?|$)/.test(f.url));
  const hard = real.filter(f => f.status === 404 || (f.status ?? 0) >= 500 || Boolean(f.error && f.error !== "ERR_FAILED"));
  const vague = real.filter(f => f.error === "ERR_FAILED");
  return { hard, vague };
}
const describeFailure = (f: PageNet["failed"][number]) => `${f.status ?? f.error} ${f.url}`;

/** Amounts written next to a currency ("KD 10.500", "١٢ ر.س"). */
// "KD 10.500" is how Kuwaiti stores write KWD; the shared amount reader only knows KWD.
export const amountsIn = (text: string): number[] => moneyAmounts(normalize(text).replace(/\bkd\b/g, "kwd"));

export type SortVerdict = "good" | "bad" | "unknown";
const GOOD_SORT = /best.?sell|featured|manual|popular|recommend|relevance|default|menu_order|الاكثر مبيع|الأكثر مبيع|الاكثر رواج|الأكثر رواج|مميز|الموصى|افتراضي/i;
const BAD_SORT = /price|alpha|title|a-z|z-a|name|date|newest|oldest|latest|created|\bnew\b|rating|الاحدث|الأحدث|الاقدم|الأقدم|السعر|ابجدي|أبجدي|الاسم|تاريخ/i;
/** Is the sort the page opened with best selling or featured? */
export function sortVerdict(sort: string): SortVerdict {
  if (GOOD_SORT.test(sort)) return "good";
  if (BAD_SORT.test(sort)) return "bad";
  return "unknown";
}

/** Columns in the first row of cards, or null when the row runs off the screen (a carousel). */
export function firstRowColumns(boxes: Array<{ x: number; y: number; w: number }>, screenWidth = 390): number | null {
  if (!boxes.length) return null;
  const top = Math.min(...boxes.map(b => b.y));
  const row = boxes.filter(b => Math.abs(b.y - top) <= 24);
  if (row.some(b => b.x + b.w > screenWidth + 8)) return null;
  return row.length;
}

// Which products does a hit name? Event names per vendor.
const VIEW_NAME: Record<string, RegExp> = { ga4: /^view_item$/, meta: /^ViewContent$/, tiktok: /^ViewContent$/ };
const ATC_NAME: Record<string, RegExp> = { ga4: /^add_to_cart$/, meta: /^AddToCart$/, tiktok: /^AddToCart$/, snap: /^ADD_CART$/i, pinterest: /^addtocart$/i };
const BASE_NAME = /^page_?view$/i;
type Hit = NonNullable<StoreEvidence["pageHits"]>[number];

/** Hits counted per page, vendor, ID and event name. */
export function hitCountsById(hits: Array<{ page?: string; vendor: string; name: string; id?: string }>): Array<{ page: string; vendor: string; id: string; name: string; count: number }> {
  const m = new Map<string, { page: string; vendor: string; id: string; name: string; count: number }>();
  for (const h of hits) {
    const key = [h.page ?? "", h.vendor, h.id ?? "", h.name].join("\u0000");
    const row = m.get(key) ?? { page: h.page ?? "", vendor: h.vendor, id: h.id ?? "", name: h.name, count: 0 };
    row.count++;
    m.set(key, row);
  }
  return [...m.values()];
}

const clickFilledCart = (e: StoreEvidence) => e.addToCart.attempted && e.addToCart.ok && e.addToCart.via !== "api" && e.addToCart.clickAdded !== false;
const label = (vendor: string, id: string) => (id ? `${vendor} ${id}` : vendor);

// A page we can read the log of.
const logged = (p: PageEvidence | undefined): p is PageEvidence & { net: PageNet } => Boolean(p?.net);

// ---- TRK-33: script errors do not break tracking ----
const trk33: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const product = page(e, "product");
  if (!product) return unverified("The product page didn't load.");
  if (!logged(product)) return unverified("This visit didn't record script errors.");
  const cart = page(e, "cart");
  const errs = [
    ...ownErrors(product.net, e.website).map(x => ({ page: "product", ...x })),
    ...(logged(cart) ? ownErrors(cart.net, e.website).map(x => ({ page: "cart", ...x })) : []),
  ];
  if (!errs.length) return { status: "pass", reason: `No uncaught script error from the store's own code on the product${logged(cart) ? " or cart" : ""} page.`, facts: { errors: 0 } };
  const facts = { errors: errs.length, first: `${errs[0].page}: ${errs[0].msg}` };
  const hits = (e.pageHits ?? []).filter(h => h.page === "product");
  const vendors = [...new Set(hits.map(h => h.vendor))].filter(v => VIEW_NAME[v]);
  if (!vendors.length) return unverified(`The store's own code threw ${errs.length} uncaught script error(s), but no GA4 or pixel hit was seen on the product page, so the effect on tracking can't be told. First: ${errs[0].msg}`, facts);
  const missingView = vendors.filter(v => !hits.some(h => h.vendor === v && VIEW_NAME[v].test(h.name)));
  if (missingView.length) return { status: "fail", reason: `The store's own code threw ${errs.length} uncaught script error(s) (first: ${errs[0].msg}) and ${missingView.join(", ")} sent no view_item on the product page.`, facts: { ...facts, missing: missingView } };
  if (!clickFilledCart(e)) return unverified(`The store's own code threw ${errs.length} script error(s), view_item still arrived, but our Add to Cart click didn't fill the cart, so add_to_cart can't be checked.`, facts);
  const ev = e.atcEvents ?? { dataLayer: [], ga4: [], pixels: [] };
  const sent = (v: string) => (v === "ga4" ? [...ev.ga4, ...ev.dataLayer] : ev.pixels.filter(x => x.startsWith(`${v}:`)).map(x => x.slice(v.length + 1))).some(n => ATC_NAME[v].test(n));
  const missingAtc = vendors.filter(v => !sent(v));
  // A late hit could miss our capture window, so a missing add_to_cart is not proof.
  if (missingAtc.length) return unverified(`The store's own code threw ${errs.length} script error(s) and view_item arrived, but no add_to_cart was seen from ${missingAtc.join(", ")} within our capture window.`, { ...facts, missing: missingAtc });
  return { status: "pass", reason: `The store's own code threw ${errs.length} script error(s), yet view_item and add_to_cart still reached ${vendors.join(", ")}.`, facts };
};

// ---- PATH-02: cart and checkout load without errors ----
const path02: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const cart = page(e, "cart");
  const k = page(e, "checkout");
  const parts: Array<{ name: string; url?: string; errs?: ReturnType<typeof ownErrors>; why?: string }> = [];
  if (!cart) parts.push({ name: "cart", why: "the cart page didn't load" });
  else if (cart.cart?.source === "drawer") parts.push({ name: "cart", why: "the cart is a drawer, so no cart page was opened" });
  else if (cart.cart?.empty) parts.push({ name: "cart", why: "the cart page was empty" });
  else if (!logged(cart)) parts.push({ name: "cart", why: "script errors weren't recorded" });
  else parts.push({ name: "cart", url: cart.url, errs: ownErrors(cart.net, e.website) });
  if (!k) parts.push({ name: "checkout", why: "the first checkout screen didn't load" });
  else if (k.note && LOGIN.test(k.note)) parts.push({ name: "checkout", why: "the store sent us to a log-in page before checkout" });
  else if (!logged(k)) parts.push({ name: "checkout", why: "script errors weren't recorded" });
  else parts.push({ name: "checkout", url: k.url, errs: ownErrors(k.net, e.website) });
  const bad = parts.filter(p => p.errs?.length);
  if (bad.length) {
    const b = bad[0];
    return { status: "fail", reason: `The ${b.name} page ${b.url} threw ${b.errs!.length} uncaught script error(s) from the store's own code; first: ${b.errs![0].msg}`, facts: Object.fromEntries(bad.map(p => [p.name, p.errs!.length])) };
  }
  const gaps = parts.filter(p => p.why);
  if (gaps.length) return unverified(`Not everything could be checked: ${gaps.map(p => `${p.name}: ${p.why}`).join("; ")}.`, Object.fromEntries(parts.filter(p => !p.why).map(p => [p.name, 0])));
  return { status: "pass", reason: "The cart page and the first checkout screen loaded with no uncaught script error from the store's own code.", facts: { cart: 0, checkout: 0 } };
};

// ---- PATH-07: no failed files on money pages ----
const path07: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const want = (["home", "collection", "product", "cart"] as const).map(t => ({ t, p: page(e, t) }));
  const missing: string[] = [];
  const hard: string[] = [];
  let vague = 0;
  for (const { t, p } of want) {
    // A cart drawer opens on the product page, whose log already covers it.
    if (t === "cart" && p?.cart?.source === "drawer") continue;
    if (!p) { missing.push(`${t} didn't load`); continue; }
    if (!logged(p)) { missing.push(`${t} wasn't logged`); continue; }
    const f = failedFiles(p.net);
    hard.push(...f.hard.map(x => `${t}: ${describeFailure(x)}`));
    vague += f.vague.length;
  }
  if (hard.length) return { status: "fail", reason: `${hard.length} file(s) failed on the money pages, e.g. ${hard[0]}.`, facts: { failed: hard.slice(0, 6) } };
  if (missing.length) return unverified(`No failed file on the pages we could log, but ${missing.join(", ")}.`);
  if (vague) return unverified(`${vague} request(s) failed with a bare network error that may be a blocked cross-origin call rather than a missing file.`);
  return { status: "pass", reason: "No file returned 404, 500 or a network error on home, collection, product or cart.", facts: { pages: want.length } };
};

// ---- RISK-02: https everywhere, no mixed content ----
const risk02: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const pages = e.pages.filter(p => p.loaded);
  if (!pages.length) return unverified("No page loaded.");
  const plain = pages.filter(p => { try { return new URL(p.url).protocol !== "https:"; } catch { return false; } });
  if (plain.length) return { status: "fail", reason: `${plain[0].pageType} page loads on plain http: ${plain[0].url}.`, facts: { pages: plain.map(p => p.url).slice(0, 5) } };
  // Page documents that redirect through http are not mixed content: only sub-files count.
  const mixed = pages.flatMap(p => (p.net?.http ?? []).filter(x => !x.startsWith("document ")).map(x => `${p.pageType}: ${x}`));
  if (mixed.length) return { status: "fail", reason: `${mixed.length} file(s) are requested over plain http on https pages, e.g. ${mixed[0]}.`, facts: { requests: mixed.slice(0, 5) } };
  const gaps: string[] = [];
  const checkout = e.pages.find(p => p.pageType === "checkout");
  if (!checkout?.loaded) gaps.push("the checkout page didn't load");
  else if (checkout.note && LOGIN.test(checkout.note)) gaps.push("checkout is behind a log-in page");
  const unlogged = pages.filter(p => !p.net).map(p => p.pageType);
  if (unlogged.length) gaps.push(`requests weren't logged on ${unlogged.join(", ")}`);
  for (const t of ["home", "product", "cart"] as const) if (!page(e, t)) gaps.push(`the ${t} page didn't load`);
  if (gaps.length) return unverified(`Every loaded page is on https with no http file, but ${gaps.join("; ")}.`);
  return { status: "pass", reason: `All ${pages.length} pages, checkout included, load on https with no http request.`, facts: { pages: pages.length } };
};

// ---- SPEED-07: no autoplay video over 1 MB on the phone first screen ----
const MB = 1024 * 1024;
const sameFile = (a: string, b: string) => a.split("#")[0] === b.split("#")[0];
const speed07: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const home = page(e, "home");
  if (!home) return unverified("The home page didn't load.");
  if (!logged(home)) return unverified("Video sizes weren't recorded on this visit.");
  const vids = (home.videos ?? []).filter(v => v.autoplay && v.y < PHONE_HEIGHT);
  if (!vids.length) return { status: "pass", reason: "No autoplay video sits in the phone first screen of the home page.", facts: { videos: (home.videos ?? []).length } };
  const sized = vids.map(v => ({ v, bytes: home.net.media.find(m => v.src && sameFile(m.url, v.src))?.bytes }));
  const big = sized.find(s => (s.bytes ?? 0) > MB);
  if (big) return { status: "fail", reason: `An autoplay video (${big.v.src}) in the phone first screen of home is ${(big.bytes! / MB).toFixed(1)} MB; the limit is 1 MB.`, facts: { src: big.v.src, megabytes: Number((big.bytes! / MB).toFixed(1)) } };
  const unknown = sized.filter(s => s.bytes === undefined);
  if (unknown.length) return unverified(`An autoplay video sits in the phone first screen of home, but its size isn't known (${unknown[0].v.src || "streamed source"}).`, { src: unknown[0].v.src });
  return { status: "pass", reason: `The autoplay video in the phone first screen of home is ${(Math.max(...sized.map(s => s.bytes!)) / MB).toFixed(1)} MB, under 1 MB.`, facts: { videos: vids.length } };
};

// ---- TRK-14: each event sent once ----
const trk14: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const hits = e.pageHits ?? [];
  const counts = hitCountsById(hits);
  const loads = counts.filter(c => BASE_NAME.test(c.name));
  const dupLoads = loads.filter(c => c.count > 1);
  const gtagDup: Array<{ page: string; id: string; count: number }> = [];
  for (const p of e.pages) for (const [id, count] of Object.entries(p.net?.gtag ?? {})) if (count > 1) gtagDup.push({ page: p.pageType, id, count });
  const atcCounts = hitCountsById((e.atcHits ?? []).filter(h => ATC_NAME[h.vendor]?.test(h.name)));
  const dupAtc = atcCounts.filter(c => c.count > 1);
  const problems = [
    ...dupLoads.map(c => `${label(c.vendor, c.id)} sent ${c.name} ${c.count} times on one ${c.page} load`),
    ...gtagDup.map(g => `gtag.js for ${g.id} loaded ${g.count} times on ${g.page}`),
    ...dupAtc.map(c => `${label(c.vendor, c.id)} sent ${c.name} ${c.count} times for one click`),
  ];
  if (problems.length) return { status: "fail", reason: `${problems[0]}${problems.length > 1 ? ` (and ${problems.length - 1} more)` : ""}.`, facts: { problems: problems.slice(0, 6) } };
  if (!loads.length) return unverified("No page_view or PageView was seen on any page load, so there is nothing to count.");
  if (!clickFilledCart(e)) return unverified("Each page load sent its page view once, but our Add to Cart click didn't fill the cart, so the add-to-cart hits can't be counted.", { loads: loads.length });
  if (!atcCounts.length) return unverified("Each page load sent its page view once, but no add-to-cart hit was seen after our click.", { loads: loads.length });
  return { status: "pass", reason: `Each GA4 ID and pixel sent one page view per page load and one add to cart for our click; gtag.js loaded once per ID.`, facts: { pageViews: loads.length, addToCart: atcCounts.length } };
};

// ---- TRK-18: shopping events carry value and products ----
const CUR = /^[A-Za-z]{3}$/;
const ITEM_FIELD_NAMES = { id: "item_id", name: "item_name", price: "price", qty: "quantity" } as const;
type ItemFlags = NonNullable<HitParams["itemFields"]>;

/** What is wrong with one event's money fields; "?" entries mean the item fields weren't recorded. */
export function eventProblems(q: { value?: number; currency?: string; items?: number; itemFields?: ItemFlags } | undefined, checkItemFields: boolean): string[] {
  if (!q) return ["no value, currency or products"];
  const out: string[] = [];
  if (typeof q.value !== "number") out.push("no numeric value");
  if (!q.currency || !CUR.test(q.currency)) out.push("no 3-letter currency");
  if (!q.items) out.push("no products");
  else if (checkItemFields) {
    if (!q.itemFields) out.push("?");
    else {
      const lacking = (Object.keys(ITEM_FIELD_NAMES) as Array<keyof ItemFlags[number]>).filter(k => q.itemFields!.some(it => !it[k]));
      if (lacking.length) out.push(`items missing ${lacking.map(k => ITEM_FIELD_NAMES[k]).join(", ")}`);
    }
  }
  return out;
}
const pushQ = (p: DataLayerPush) => ({ value: p.value, currency: p.currency, items: p.items?.length, itemFields: p.items });

const trk18: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const steps: Array<{ step: string; events: Array<{ from: string; q: Parameters<typeof eventProblems>[0]; fields: boolean }> }> = [
    { step: "view_item", events: [
      ...(e.pageHits ?? []).filter((h: Hit) => h.page === "product" && VIEW_NAME[h.vendor]?.test(h.name)).map(h => ({ from: `${h.vendor} ${h.name}`, q: h.q, fields: h.vendor === "ga4" })),
      ...(e.dlPushes?.view ?? []).map(p => ({ from: "dataLayer view_item", q: pushQ(p), fields: true })),
    ] },
  ];
  const click = clickFilledCart(e);
  if (click) {
    steps.push({ step: "add_to_cart", events: [
      ...(e.atcHits ?? []).filter(h => ATC_NAME[h.vendor]?.test(h.name) && (h.vendor === "ga4" || h.vendor === "meta" || h.vendor === "tiktok")).map(h => ({ from: `${h.vendor} ${h.name}`, q: h.q, fields: h.vendor === "ga4" })),
      ...(e.dlPushes?.atc ?? []).map(p => ({ from: "dataLayer add_to_cart", q: pushQ(p), fields: true })),
    ] });
  }
  const problems: string[] = [];
  let unknown = false;
  for (const s of steps) for (const ev of s.events) {
    const ps = eventProblems(ev.q, ev.fields);
    if (ps.includes("?")) unknown = true;
    const real = ps.filter(x => x !== "?");
    if (real.length) problems.push(`${ev.from} on ${s.step}: ${real.join(", ")}`);
  }
  if (problems.length) return { status: "fail", reason: `${problems[0]}${problems.length > 1 ? ` (and ${problems.length - 1} more)` : ""}.`, facts: { problems: problems.slice(0, 6) } };
  const seen = steps.filter(s => s.events.length);
  const notSeen = steps.filter(s => !s.events.length).map(s => s.step);
  if (!click) notSeen.push("add_to_cart (our click didn't fill the cart)");
  if (!seen.length) return unverified("No view_item or add_to_cart hit or push was seen.");
  if (notSeen.length) return unverified(`${seen.map(s => s.step).join(" and ")} carry value, currency and products, but ${notSeen.join(" and ")} wasn't seen.`);
  if (unknown) return unverified("Value, currency and product count are there, but the item fields (item_id, item_name, price, quantity) weren't recorded for every hit.");
  return { status: "pass", reason: `view_item and add_to_cart carry a numeric value, a currency and products with item_id, item_name, price and quantity.`, facts: { events: seen.reduce((n, s) => n + s.events.length, 0) } };
};

// ---- collection and home listings ----
const listingOf = (e: StoreEvidence, type: "collection" | "home") => page(e, type)?.listing;
const noListing = (e: StoreEvidence, type: "collection" | "home") =>
  page(e, type) ? unverified(`Fewer than 4 product cards were found on the ${type} page, so its grid can't be judged.`) : unverified(`The ${type} page didn't load.`);

// ---- COL-02: sold-out items marked and placed last ----
const col02: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const l = listingOf(e, "collection");
  if (!l) return noListing(e, "collection");
  const flags = l.soldOutFlags;
  if (!flags) return unverified("Sold-out labels weren't recorded on this visit.");
  const sold = flags.filter(Boolean).length;
  if (!sold) return na("No product card carries a sold-out label on the collection page.");
  const lastInStock = flags.lastIndexOf(false);
  const firstSold = flags.indexOf(true);
  const facts = { cards: flags.length, soldOut: sold, firstSoldOut: firstSold + 1, lastInStock: lastInStock + 1 };
  if (lastInStock > firstSold) return { status: "fail", reason: `A sold-out product is card ${firstSold + 1} of ${flags.length}, ahead of in-stock card ${lastInStock + 1}.`, facts };
  return { status: "pass", reason: `${sold} sold-out card(s) are labelled and sit after every in-stock one (from card ${firstSold + 1} of ${flags.length}).`, facts };
};

// ---- COL-03: filter, sort or category chips visible; sort defaults well ----
const col03: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const l = listingOf(e, "collection");
  if (!l) return noListing(e, "collection");
  const controls = l.hasFilter || l.hasSort;
  const above = controls && (l.controlsTop === undefined || l.firstCardTop === undefined || l.controlsTop <= l.firstCardTop);
  const facts = { filter: l.hasFilter, sort: l.hasSort, chips: l.pills, controlsTop: l.controlsTop ?? "n/a", firstCardTop: l.firstCardTop ?? "n/a", selectedSort: l.sort ?? "not read" };
  if (!above && l.pills === 0) {
    return { status: "fail", reason: controls ? `The filter or sort control sits at ${l.controlsTop}px, below the first product card (${l.firstCardTop}px), and there are no category chips.` : "No filter, sort control or category chips were found above the product grid.", facts };
  }
  if (l.sort === undefined) return unverified(`${l.pills ? `${l.pills} category chips` : "A filter or sort control"} show above the grid, but the selected sort couldn't be read.`, facts);
  const v = sortVerdict(l.sort);
  if (v === "bad") return { status: "fail", reason: `The collection opens sorted by "${l.sort.split("|")[0] || l.sort}", not best selling or featured.`, facts };
  if (v === "unknown") return unverified(`The collection opens sorted by "${l.sort.split("|")[0] || l.sort}", which isn't clearly best selling or featured.`, facts);
  return { status: "pass", reason: `Controls show above the grid and the collection opens sorted by "${l.sort.split("|")[0] || l.sort}".`, facts };
};

// ---- COL-04: products on the first screen ----
const col04: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const l = listingOf(e, "collection");
  if (!l) return noListing(e, "collection");
  if (l.firstCardTop === undefined) return unverified("The first card's position wasn't recorded on this visit.");
  const facts = { firstCardTop: l.firstCardTop, screen: PHONE_HEIGHT };
  return l.firstCardTop < PHONE_HEIGHT
    ? { status: "pass", reason: `The first product row starts ${l.firstCardTop}px down, inside the 844px phone first screen.`, facts }
    : { status: "fail", reason: `The first product row starts ${l.firstCardTop}px down, below the 844px phone first screen.`, facts };
};

// ---- COL-05: every card shows image, name and price ----
function cardGaps(l: NonNullable<PageEvidence["listing"]>): { image: number; name: number; price: number } | null {
  if (l.withImage === undefined || l.withName === undefined) return null;
  return { image: l.cards - l.withImage, name: l.cards - l.withName, price: l.cards - l.withPrice };
}
const gapText = (g: { image: number; name: number; price: number }) => [g.image && `${g.image} without an image`, g.name && `${g.name} without a name`, g.price && `${g.price} without a price and currency`].filter(Boolean).join(", ");
const col05: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const l = listingOf(e, "collection");
  if (!l) return noListing(e, "collection");
  const g = cardGaps(l);
  if (!g) return unverified("Image and name counts weren't recorded on this visit.");
  const facts = { cards: l.cards, withImage: l.withImage!, withName: l.withName!, withPrice: l.withPrice };
  if (g.image || g.name || g.price) return { status: "fail", reason: `Of ${l.cards} product cards, ${gapText(g)}.`, facts };
  return { status: "pass", reason: `All ${l.cards} product cards show an image, a name and a price with currency.`, facts };
};

// ---- COL-10: two columns on a phone ----
const col10: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const l = listingOf(e, "collection");
  if (!l) return noListing(e, "collection");
  if (!l.cardBoxes) return unverified("Card positions weren't recorded on this visit.");
  if (l.cardBoxes.length < 2) return unverified("Fewer than 2 cards were found, so columns can't be counted.");
  const cols = firstRowColumns(l.cardBoxes);
  if (cols === null) return unverified("The first row runs past the screen edge, which looks like a carousel, so columns can't be counted.");
  return cols === 2
    ? { status: "pass", reason: "The phone collection grid shows 2 columns.", facts: { columns: cols } }
    : { status: "fail", reason: `The phone collection grid shows ${cols} column${cols === 1 ? "" : "s"}, not 2.`, facts: { columns: cols } };
};

// ---- HOME-05: best sellers high on home ----
const storeHasReviews = (e: StoreEvidence) => e.pages.some(p => p.loaded && (hasWidget(p, "reviews") || Boolean(p.jsonLd.ratingValue || p.jsonLd.reviewCount)));
const home05: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const home = page(e, "home");
  if (!home) return unverified("The home page didn't load.");
  const l = home.listing;
  if (!l) return unverified("No product grid (4 or more product cards) was found on the home page.");
  if (l.firstCardTop === undefined) return unverified("The grid's position wasn't recorded on this visit.");
  const g = cardGaps(l);
  if (!g) return unverified("Image and name counts weren't recorded on this visit.");
  const limit = PHONE_HEIGHT * 2;
  const reviews = storeHasReviews(e);
  const facts = { firstGridTop: l.firstCardTop, cards: l.cards, withImage: l.withImage!, withName: l.withName!, withPrice: l.withPrice, withRating: l.withRating, storeHasReviews: reviews };
  if (l.firstCardTop >= limit) return { status: "fail", reason: `The first product grid starts ${l.firstCardTop}px down, past the first 2 phone screens (${limit}px).`, facts };
  if (g.image || g.name || g.price) return { status: "fail", reason: `The home grid starts ${l.firstCardTop}px down, but of ${l.cards} cards, ${gapText(g)}.`, facts };
  if (reviews && l.withRating === 0) return { status: "fail", reason: `The store has reviews, but none of the ${l.cards} home cards shows a rating.`, facts };
  return { status: "pass", reason: `A product grid starts ${l.firstCardTop}px down (inside 2 phone screens) and all ${l.cards} cards show image, name and price${reviews ? `; ${l.withRating} show a rating` : ""}.`, facts };
};

// ---- TRUST-02: ratings on cards and product page ----
const norm = (s: string) => normalize(s).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const trust02: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const product = page(e, "product");
  if (!product) return unverified("The product page didn't load.");
  if (!storeHasReviews(e)) return na("No rating, review count or review app was found on the store.");
  if (product.reviewAnchor === undefined) return unverified("Review links weren't recorded on this visit.");
  const a = product.reviewAnchor;
  let productFail: string | null = null;
  if (a === null) productFail = "no rating link to the reviews was found near the product title";
  else {
    const h1 = product.facts?.h1[0];
    const title = h1 ? product.blocks.find(b => norm(b.text) === norm(h1)) : undefined;
    const near = title ? Math.abs(a.y - title.box.y) <= 300 : a.y < PHONE_HEIGHT;
    if (!near) productFail = `the reviews link ("${a.text}") sits at ${a.y}px, away from the title${title ? ` (${title.box.y}px)` : ""}`;
    else if (!/\d/.test(a.text) && !product.blocks.some(b => Math.abs(b.box.y - a.y) <= 60 && /\d/.test(b.text) && /review|rating|تقييم|\(\d+\)/i.test(b.text))) productFail = `the reviews link ("${a.text}") shows no rating or review count`;
  }
  if (productFail) return { status: "fail", reason: `On the product page, ${productFail}.`, facts: { link: a?.text ?? "none" } };
  const l = listingOf(e, "collection");
  if (!l) return unverified(`The product page shows a rating linking to reviews ("${a!.text}"), but the collection's cards couldn't be read.`);
  const share = l.withRating / l.cards;
  const facts = { link: a!.text, cardsWithRating: l.withRating, cards: l.cards };
  return share >= 0.5
    ? { status: "pass", reason: `The product page links its rating to the reviews ("${a!.text}") and ${l.withRating} of ${l.cards} collection cards show a rating.`, facts }
    : { status: "fail", reason: `Only ${l.withRating} of ${l.cards} collection cards show a rating; at least half should.`, facts };
};

// ---- offers: struck-through prices ----
// A struck price near the buy button is the product's own old price; others on the page belong to related products.
const saleNearCta = (p: PageEvidence | undefined) => Boolean(p?.cta && (p.struck ?? []).some(s => Math.abs(s.y - p.cta!.box.y) <= 400));
const SAVING = /-\s?\d{1,3}\s?%|\d{1,3}\s?%\s?(?:off|خصم)|\bsave\b|you sav|وفر|توفير|بتوفر|خصم/;
const savingBlock = (p: PageEvidence, aroundY: number) =>
  p.blocks.find(b => Math.abs(b.box.y - aroundY) <= 500 && SAVING.test(normalize(b.text)) && (/%/.test(b.text) || hasPrice(b.text)));
const cartSavings = (cart: PageEvidence) => cart.blocks.some(b => matches("savings", b.text) || SAVING.test(normalize(b.text)));

// ---- OFFER-03: cart price matches product page ----
const offer03: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const a = e.addToCart;
  if (!a.attempted || !a.ok || a.via === "api" || a.clickAdded === false) return unverified("Our Add to Cart click didn't fill the cart by itself, so the cart price isn't one a shopper would get from the page.");
  const product = page(e, "product");
  const cart = page(e, "cart");
  if (!product || !cart) return unverified(`The ${!product ? "product" : "cart"} page didn't load.`);
  if (cart.cart?.empty) return unverified("The cart was empty.");
  const ld = product.jsonLd;
  const fromHit = (e.atcHits ?? []).find(h => ATC_NAME[h.vendor]?.test(h.name) && typeof h.q?.value === "number")?.q;
  const prices = [ld.price, fromHit?.value].filter((x): x is number => typeof x === "number");
  if (!prices.length) return unverified("The product page has no price in its schema and our click sent no value, so the page price isn't known.");
  const priced = cart.blocks.map(b => ({ b, amounts: amountsIn(b.text) })).filter(x => x.amounts.length);
  if (!priced.length) return unverified("The cart shows no prices (a drawer that lists none).");
  const match = priced.find(x => x.amounts.some(n => prices.some(p => Math.abs(n - p) < 0.011)));
  const facts = { productPrice: prices[0], cartAmounts: [...new Set(priced.flatMap(x => x.amounts))].slice(0, 6).map(String) };
  if (!match) return { status: "fail", reason: `The cart shows ${facts.cartAmounts.join(", ")}, not the product page price ${prices[0]}${ld.priceCurrency ? ` ${ld.priceCurrency}` : ""}.`, facts };
  const cartCur = currencyIn(normalize(match.b.text));
  if (ld.priceCurrency && cartCur && cartCur !== ld.priceCurrency) return { status: "fail", reason: `The cart price is in ${cartCur}, the product page's is in ${ld.priceCurrency}.`, facts };
  if (saleNearCta(product) && !(cart.struck ?? []).length) return { status: "fail", reason: `The product page crosses out an old price, but the cart shows ${prices[0]} with no old price.`, facts };
  return { status: "pass", reason: `The cart shows ${prices[0]}${cartCur ? ` ${cartCur}` : ""}, the same as the product page${saleNearCta(product) ? ", with the old price kept" : ""}.`, facts };
};

// ---- OFFER-08: sale price and saving are clear ----
type OfferState = "ok" | "fail" | "none" | "unknown";
const offer08: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const product = page(e, "product");
  const l = listingOf(e, "collection");
  const col = page(e, "collection");
  if (!product && !col) return unverified("Neither the product nor the collection page loaded.");
  let cards: OfferState = "unknown";
  let cardNote = col ? "the collection grid wasn't read" : "the collection page didn't load";
  if (l && l.withStrike !== undefined) {
    if (l.withStrike > 0) { cards = "ok"; cardNote = `${l.withStrike} of ${l.cards} collection cards show a crossed-out old price`; }
    else if ((l.withSaleText ?? 0) === 0) { cards = "none"; cardNote = "no collection card is on sale"; }
    else cardNote = `${l.withSaleText} collection cards mention a sale but none shows a crossed-out price (an old price may be shown without a line)`;
  }
  let prod: OfferState = "unknown";
  let prodNote = "the product page didn't load";
  if (product) {
    if (!logged(product)) prodNote = "strikethrough prices weren't recorded";
    else if (!saleNearCta(product)) { prod = "none"; prodNote = "the product isn't on sale"; }
    else {
      const sb = savingBlock(product, product.cta!.box.y);
      prod = sb ? "ok" : "fail";
      prodNote = sb ? `the product page shows the saving ("${sb.text.slice(0, 40)}")` : "the product page crosses out an old price but states no saving (amount or %)";
    }
  }
  const facts = { cards: cardNote, product: prodNote };
  if (prod === "fail") return { status: "fail", reason: `${prodNote[0].toUpperCase()}${prodNote.slice(1)}.`, facts };
  if (cards === "none" && prod === "none") return na("No discounted product was seen on the collection or product page.");
  if (cards === "unknown" || prod === "unknown") return unverified(`${[cards === "unknown" && cardNote, prod === "unknown" && prodNote].filter(Boolean).join("; ")}.`, facts);
  return { status: "pass", reason: `${cardNote}; ${prodNote}.`, facts };
};

// ---- OFFER-16: cart shows what the shopper saved ----
const offer16: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const a = e.addToCart;
  if (!a.attempted || !a.ok || a.clickAdded === false) return unverified("Our Add to Cart click didn't fill the cart, so a discount can't be judged.");
  const cart = page(e, "cart");
  const product = page(e, "product");
  if (!cart || !product) return unverified(`The ${!cart ? "cart" : "product"} page didn't load.`);
  if (cart.cart?.empty) return unverified("The cart was empty.");
  if (!logged(product)) return unverified("Struck-through prices weren't recorded on this visit.");
  const onSale = saleNearCta(product);
  const shows = (cart.struck ?? []).length > 0 || cartSavings(cart);
  if (shows) return { status: "pass", reason: "The cart shows a saving line or a crossed-out price.", facts: { itemOnSale: onSale } };
  if (!onSale) return na("The item we added isn't on sale, and the cart shows no discount.");
  if (cart.cart?.source === "drawer") return unverified("The item is on sale, but the cart drawer may simply not show the discount.", { itemOnSale: true });
  return { status: "fail", reason: "The item we added is on sale (the product page crosses out its old price), but the cart shows no saving line or crossed-out price.", facts: { itemOnSale: true } };
};

// ---- SEO-05: Product schema with an Offer holding price and availability ----
const seo05: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p) return unverified("The product page didn't load.");
  const ld = p.jsonLd;
  if (!ld.types.some(t => /^product$/i.test(t))) return { status: "fail", reason: `The product page ${p.url} has no Product schema (found: ${ld.types.join(", ") || "none"}).`, facts: { types: ld.types } };
  if (ld.offer === undefined) return unverified("The page has Product schema, but this visit didn't record its Offer price.", { types: ld.types });
  const missing = [ld.price === undefined && "price", !ld.availability && "availability"].filter(Boolean) as string[];
  const facts = { price: ld.price ?? "none", currency: ld.priceCurrency ?? "none", availability: ld.availability ?? "none" };
  if (!ld.offer) return { status: "fail", reason: "The Product schema has no Offer.", facts };
  if (missing.length) return { status: "fail", reason: `The Product schema's Offer has no ${missing.join(" or ")}.`, facts };
  return { status: "pass", reason: `The Product schema has an Offer with price ${ld.price}${ld.priceCurrency ? ` ${ld.priceCurrency}` : ""} and availability ${ld.availability}.`, facts };
};

export const COLLECT_RULES: Record<string, Rule> = {
  "TRK-33": trk33,
  "PATH-02": path02,
  "PATH-07": path07,
  "RISK-02": risk02,
  "SPEED-07": speed07,
  "TRK-14": trk14,
  "TRK-18": trk18,
  "COL-02": col02,
  "COL-03": col03,
  "COL-04": col04,
  "COL-05": col05,
  "COL-10": col10,
  "HOME-05": home05,
  "TRUST-02": trust02,
  "OFFER-03": offer03,
  "OFFER-08": offer08,
  "OFFER-16": offer16,
  "SEO-05": seo05,
};
