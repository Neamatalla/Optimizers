import type { Box, FactInput, PageEvidence, PageImage, PageOverflow, StoreEvidence } from "../../fud/evidence.js";
import { pageOf } from "../../fud/evidence.js";
import { PLACEHOLDER_SOURCE } from "../../fud/facts-js.js";
import { matches, normalize } from "../../fud/signals.js";
import { hasPrice } from "../../site-checks.js";
import type { Rule, RuleResult } from "./types.js";
import { unverified } from "./types.js";

/**
 * Rules that read the per-page layout facts from facts-js.ts (form fields,
 * header controls, floating widgets, button colours, overflow, images...).
 * Same stance as visit.ts: fail only on what we saw for certain, unverified
 * for pages that didn't load, cart drawers (no facts) and anything the page
 * markup can't prove.
 */

const PHONE_W = 390;
const noVisit = unverified("Our store visit didn't run this time.");
const OLD_DATA = "The page facts for this rule weren't collected in this run.";

function page(e: StoreEvidence | null | undefined, type: PageEvidence["pageType"]): PageEvidence | undefined {
  return e ? pageOf(e, type) : undefined;
}
const px = (n: number) => `${Math.round(n)}px`;
const pass = (reason: string, facts?: RuleResult["facts"]): RuleResult => ({ status: "pass", reason, ...(facts && { facts }) });
const fail = (reason: string, facts?: RuleResult["facts"]): RuleResult => ({ status: "fail", reason, ...(facts && { facts }) });
const MAIN_TYPES: PageEvidence["pageType"][] = ["home", "collection", "product", "cart"];

// Vertical gap between two boxes (0 when they overlap).
function vGap(a: Box, b: Box): number {
  return Math.max(0, b.y - (a.y + a.h), a.y - (b.y + b.h));
}
function overlaps(a: Box, b: Box): boolean {
  return Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 4 && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 4;
}

// ---- field kinds (PATH-12, RISK-12) ----
const PHONE_FIELD = /phone|mobile|\btel\b|whats|جوال|هاتف|موبايل|واتس|رقم/i;
const EMAIL_FIELD = /e-?mail|بريد/i;
const SKIP_FIELD = /discount|coupon|promo|gift|search|voucher|note|instruction|كود|كوبون|خصم|بحث|ملاحظ|قسيمة/i;

export function fieldKind(f: FactInput): "phone" | "email" | "text" | "other" {
  const sig = `${f.name} ${f.label}`;
  if (f.type === "tel" || (f.type !== "email" && PHONE_FIELD.test(sig) && !EMAIL_FIELD.test(sig))) return "phone";
  if (f.type === "email" || EMAIL_FIELD.test(sig)) return "email";
  if (["text", "tel", "email", "textarea", "select", "password", "number", "url"].includes(f.type)) return "text";
  return "other";
}
const phoneKeyboardOk = (f: FactInput) => f.type === "tel" || f.inputmode === "tel" || f.inputmode === "numeric";
const emailKeyboardOk = (f: FactInput) => f.type === "email" || f.inputmode === "email";
const desc = (f: FactInput) => `${f.label || f.name || f.type}`.slice(0, 30);

const LOGIN = /log-?in|sign in|account/i;

function checkoutForm(e: StoreEvidence): { fields: FactInput[] } | RuleResult {
  const k = e.pages.find(p => p.pageType === "checkout");
  if (!k || !k.loaded) return unverified("The first checkout screen didn't load.");
  if (k.note && LOGIN.test(k.note)) return unverified("The store sent us to a log-in page before checkout, so the checkout form wasn't seen.", { note: k.note });
  if (/\/(account|login)\b/i.test(k.url)) return unverified("The checkout link led to an account page, not the checkout form.", { url: k.url });
  if (!k.facts?.inputs) return unverified(OLD_DATA);
  const fields = k.facts.inputs.filter(f => !f.inHeader);
  if (fields.length < 2) return unverified(`Only ${fields.length} form field(s) could be read on ${k.url}; the checkout form may sit in a frame we can't read.`, { url: k.url });
  return { fields };
}

// ---- PATH-12: checkout fields use right phone keyboards ----
const path12: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const c = checkoutForm(e);
  if (!("fields" in c)) return c;
  const fields = c.fields;
  const problems: string[] = [];
  for (const f of fields) {
    const kind = fieldKind(f);
    if (kind === "phone" && !phoneKeyboardOk(f)) problems.push(`phone field "${desc(f)}" opens a ${f.inputmode || f.type} keyboard, not a numeric one`);
    if (kind === "email" && !emailKeyboardOk(f)) problems.push(`email field "${desc(f)}" opens a ${f.inputmode || f.type} keyboard, not an email one`);
    if (f.h < 44) problems.push(`"${desc(f)}" is ${px(f.h)} tall`);
  }
  const needAuto = fields.filter(f => ["text", "tel", "email"].includes(f.type) && !SKIP_FIELD.test(`${f.name} ${f.label}`));
  const noAuto = needAuto.filter(f => !f.autocomplete || f.autocomplete === "off");
  if (noAuto.length) problems.push(`${noAuto.length} field(s) have no autocomplete (${noAuto.slice(0, 3).map(desc).join(", ")})`);
  const facts = { fields: fields.length, phoneFields: fields.filter(f => fieldKind(f) === "phone").length, emailFields: fields.filter(f => fieldKind(f) === "email").length, shortest: Math.min(...fields.map(f => f.h)), noAutocomplete: noAuto.length };
  if (problems.length) return fail(`On the checkout form: ${problems.slice(0, 4).join("; ")}.`, facts);
  return pass(`All ${fields.length} checkout fields are at least 44px tall, phone and email fields use the right keyboard, and autocomplete is set.`, facts);
};

// ---- RISK-12: form fields do not zoom on tap ----
const risk12: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const seen = e.pages.filter(p => p.loaded && p.facts?.inputs?.length);
  if (!seen.length) return unverified("No form fields were read on any page this run.");
  const problems: string[] = [];
  let total = 0;
  for (const p of seen) {
    for (const f of p.facts!.inputs!) {
      total++;
      if (f.fs > 0 && f.fs < 16) problems.push(`"${desc(f)}" on the ${p.pageType} page uses ${f.fs}px text`);
      const kind = fieldKind(f);
      if (kind === "phone" && !phoneKeyboardOk(f)) problems.push(`phone field "${desc(f)}" on the ${p.pageType} page opens a ${f.inputmode || f.type} keyboard`);
      if (kind === "email" && !emailKeyboardOk(f)) problems.push(`email field "${desc(f)}" on the ${p.pageType} page opens a ${f.inputmode || f.type} keyboard`);
    }
  }
  const facts = { fields: total, pages: seen.map(p => p.pageType) };
  if (problems.length) return fail(`${problems.slice(0, 4).join("; ")}.`, { ...facts, problems: problems.length });
  // The checkout form is where phone and email fields live: don't pass without it.
  const c = checkoutForm(e);
  if (!("fields" in c)) return unverified(`${total} field(s) on ${seen.length} page(s) are fine, but the checkout form wasn't read: ${c.reason}`, facts);
  if (c.fields.some(f => f.fs < 16 && f.fs > 0)) return fail("A checkout field uses text under 16px.", facts);
  return pass(`All ${total} fields read use 16px text or more, and phone and email fields use the right keyboard.`, { ...facts, checkout: true });
};

// ---- PDP-05: floating widgets do not cover buying controls ----
const CHAT_WIDGET = /chat|whatsapp|tidio|intercom|zendesk|tawk|crisp|gorgias|livechat|jivo|drift|smartsupp|freshchat|messenger/i;

// The price-looking block nearest the buy button; shipping/promo lines never count.
function priceBox(p: PageEvidence): Box | undefined {
  const cta = p.cta?.box;
  const priced = p.blocks.filter(b => {
    if (!hasPrice(b.text)) return false;
    const t = normalize(b.text);
    return !matches("shippingWord", t) && !matches("discountField", t) && !matches("freeShipping", t);
  });
  if (!priced.length || !cta) return undefined;
  return [...priced].sort((a, b) => vGap(a.box, cta) - vGap(b.box, cta))[0].box;
}

const pdp05: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const product = page(e, "product");
  const cart = page(e, "cart");
  if (!product || !product.cta) return unverified("The product page didn't load, or no Add to Cart button was found.");
  if (!cart) return unverified("The cart page didn't load.");
  const seen: Array<{ p: PageEvidence; controls: Array<{ name: string; box: Box }> }> = [];
  for (const p of [product, cart]) {
    if (!p.facts?.floaters) continue;
    const controls: Array<{ name: string; box: Box }> = [];
    if (p.cta) controls.push({ name: `"${p.cta.text}" button`, box: p.cta.box });
    if (p.pageType === "product") {
      const price = priceBox(p);
      if (price) controls.push({ name: "price", box: price });
      if (p.facts.qty) controls.push({ name: "quantity selector", box: p.facts.qty.box });
      (p.facts.swatches ?? []).forEach(b => controls.push({ name: "option", box: b }));
    }
    seen.push({ p, controls });
  }
  for (const { p, controls } of seen) {
    for (const f of p.facts!.floaters!) {
      const hit = controls.find(c => overlaps(f.box, c.box));
      if (hit) return fail(`A floating ${f.kind === "other" ? "element" : f.kind} (${f.box.w}x${f.box.h}px) covers the ${hit.name} on the ${p.pageType} page.`, { page: p.pageType, kind: f.kind, covers: hit.name });
    }
  }
  // Drawers and unread pages have no floating-element facts.
  if (!seen.some(s => s.p === product)) return unverified(OLD_DATA);
  if (!seen.some(s => s.p === cart)) return unverified("The cart is a drawer, so floating elements over it weren't read.");
  // A chat tool is named in the scripts but nothing floating was found: it may load later.
  for (const { p } of seen) {
    const named = p.widgets.filter(w => CHAT_WIDGET.test(w));
    if (named.length && !p.facts!.floaters!.some(f => f.kind === "chat")) return unverified(`${named.join(", ")} is on the ${p.pageType} page, but its floating button wasn't on screen yet (it may load late).`, { widgets: named });
  }
  const n = seen.reduce((s, x) => s + x.p.facts!.floaters!.length, 0);
  return pass(`${n ? `${n} floating element(s) were on screen, none` : "No floating element was on screen, and none"} covers the options, price, Add to Cart or checkout button.`, { floating: n });
};

// ---- PDP-08: quantity selector next to a full-width Add to cart with contrast ----
export interface Rgb { r: number; g: number; b: number }
export function parseRgb(s: string | undefined): Rgb | null {
  const m = /^rgba?\(\s*(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)(?:[,\s/]+([\d.]+%?))?\s*\)$/.exec((s ?? "").trim());
  if (!m) return null;
  if (m[4] !== undefined && parseFloat(m[4]) < 1) return null;
  return { r: +m[1], g: +m[2], b: +m[3] };
}
const lum = ({ r, g, b }: Rgb) => {
  const c = [r, g, b].map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Width the buy button spans, counting a quantity selector on the same row.
function buySpan(cta: Box, qty: Box | null | undefined): number {
  if (qty && vGap(cta, qty) === 0 && Math.min(cta.y + cta.h, qty.y + qty.h) - Math.max(cta.y, qty.y) > 8) {
    return Math.max(cta.x + cta.w, qty.x + qty.w) - Math.min(cta.x, qty.x);
  }
  return cta.w;
}

const pdp08: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p || !p.cta) return unverified("The product page didn't load, or no Add to Cart button was found.");
  if (!p.facts || p.facts.qty === undefined) return unverified(OLD_DATA);
  const cta = p.cta.box;
  const qty = p.facts.qty;
  if (!qty) return fail(`No quantity selector was found next to the "${p.cta.text}" button.`, { button: p.cta.text });
  const gap = vGap(cta, qty.box);
  if (gap > 100) return fail(`The quantity selector sits ${px(gap)} away from the "${p.cta.text}" button.`, { gap });
  const span = buySpan(cta, qty.box);
  if (span < PHONE_W * 0.8) return fail(`The "${p.cta.text}" button (with its quantity selector) spans ${px(span)} of the ${PHONE_W}px screen, not full width.`, { span });
  const a = p.facts.atc;
  if (!a || !overlaps(a.box, cta)) return unverified("The button's colours couldn't be read.", { span });
  if (a.bgComplex) return unverified("The button sits on a gradient, image or see-through background, so its contrast can't be computed.", { span });
  const fg = parseRgb(a.fg);
  const bg = parseRgb(a.bg);
  if (!fg || !bg) return unverified("The button's colours are in a format we can't read.", { fg: a.fg, bg: a.bg });
  const ratio = Math.round(contrast(fg, bg) * 10) / 10;
  const facts = { ratio, span: Math.round(span), gap: Math.round(gap) };
  if (ratio < 3) return fail(`The "${p.cta.text}" button text has a ${ratio}:1 contrast against its background (needs 3:1).`, facts);
  return pass(`A quantity selector sits ${px(gap)} from a ${px(span)}-wide "${p.cta.text}" button with ${ratio}:1 text contrast.`, facts);
};

// ---- NAV-05: cart icon with item count ----
const nav05: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const read = e.pages.filter(p => p.loaded && p.facts?.header && (p.pageType === "home" || p.pageType === "product" || p.pageType === "collection" || p.pageType === "cart"));
  if (!read.length || read.every(p => !p.facts!.header!.found)) return unverified("No header was found on the pages we read.");
  const missing = read.filter(p => p.facts!.header!.found && !p.facts!.header!.cart);
  if (missing.length) return fail(`No cart icon was found in the header of the ${missing.map(p => p.pageType).join(", ")} page.`, { pages: missing.map(p => p.pageType) });
  if (!read.some(p => p.facts!.header!.cart)) return unverified("No header was found on the pages we read.");
  const a = e.addToCart;
  if (!a.attempted || !a.ok) return unverified(`The cart icon is there on ${read.length} page(s), but our Add to Cart didn't work (${a.reason ?? "item not added"}), so the item count couldn't be checked.`);
  const cart = e.pages.find(p => p.pageType === "cart" && p.loaded);
  const header = cart?.facts?.header?.cart;
  if (!cart || !cart.facts?.header || cart.cart?.source === "drawer" || cart.cart?.empty) return unverified("The cart icon is there, but the page after adding wasn't a full cart page, so the item count in the header wasn't read.");
  if (!header) return fail("The header of the cart page has no cart icon.");
  if (header.count === null) return unverified("The cart icon is there, but no item count was seen on it after adding (it may update after our capture).", { opens: header.opens ?? "unknown" });
  if (header.count < 1) return fail(`The cart icon shows ${header.count} after we added a product.`, { count: header.count });
  if (!header.opens) return unverified(`The cart icon shows ${header.count} item(s), but we can't tell whether it opens the cart.`, { count: header.count });
  return pass(`The header shows a cart icon on ${read.length} page(s); after adding a product it shows ${header.count} and opens the cart ${header.opens}.`, { count: header.count, opens: header.opens });
};

// ---- NAV-06: language switch easy to find ----
const nav06: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const home = page(e, "home");
  const f = home?.facts;
  if (!home || !f) return unverified("The home page didn't load.");
  if (f.langAt === undefined) return unverified(OLD_DATA);
  const langs = new Set(f.hreflang.map(h => h.toLowerCase().split("-")[0]).filter(h => h && h !== "x"));
  if (f.langAt === null) {
    if (langs.size >= 2) return unverified(`The page declares ${[...langs].join(", ")} versions, but no language switch was found (it may sit in a pop-up).`, { hreflang: f.hreflang });
    return { status: "n/a", reason: "No second language or language switch was found: a single-language store." };
  }
  if (f.langAt === "header") return pass("A language switch is visible in the header.", { at: "header" });
  if (f.langAt === "menu") return unverified("A language switch exists inside the header or menu, but not on screen; we can't tell if it is on the first menu level.", { at: "menu" });
  return fail(`The language switch is only in the ${f.langAt === "footer" ? "footer" : "page body"}, not in the header or menu.`, { at: f.langAt });
};

// ---- NAV-07: footer has contact and policy links ----
const nav07: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const home = page(e, "home");
  if (!home) return unverified("The home page didn't load.");
  const ft = home.facts?.footer;
  if (!ft) return unverified(OLD_DATA);
  if (!ft.found) return unverified("No footer element was found on the home page.");
  if (ft.links < 3) return unverified(`The footer has only ${ft.links} link(s); it may load after our capture.`, { links: ft.links });
  const missing: string[] = [];
  if (!ft.phone && !ft.whatsapp && !ft.email) missing.push("contact details (phone, WhatsApp or email)");
  for (const k of ["shipping", "returns", "privacy", "terms"]) if (!ft.kinds.includes(k)) missing.push(`a ${k} link`);
  const facts = { phone: ft.phone, whatsapp: ft.whatsapp, email: ft.email, links: ft.kinds };
  if (missing.length) return fail(`The footer has no ${missing.join(", no ")}.`, facts);
  return pass(`The footer has contact details and links to ${ft.kinds.join(", ")}.`, facts);
};

// ---- TRUST-09: no template or placeholder content ----
const PLACEHOLDER = new RegExp(PLACEHOLDER_SOURCE, "i");
const trust09: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const hits: string[] = [];
  for (const p of e.pages) {
    if (!p.loaded || p.pageType === "checkout") continue;
    const ph = p.facts?.placeholder;
    if (ph?.text.length) hits.push(`${p.pageType}: "${ph.text[0].slice(0, 70)}"`);
    else if (ph?.hrefs.length) hits.push(`${p.pageType}: link to ${ph.hrefs[0]}`);
    else {
      const b = p.blocks.find(x => PLACEHOLDER.test(x.text));
      if (b) hits.push(`${p.pageType}: "${b.text.slice(0, 70)}"`);
    }
  }
  if (hits.length) return fail(`Template or placeholder content found: ${hits.slice(0, 3).join("; ")}.`, { hits: hits.length });
  const missing = MAIN_TYPES.filter(t => !page(e, t));
  if (missing.length) return unverified(`The ${missing.join(", ")} page(s) didn't load, so they weren't scanned.`, { missing });
  const noFacts = MAIN_TYPES.filter(t => !page(e, t)?.facts?.placeholder);
  // A cart drawer has no page facts, but its text blocks were scanned above.
  const needFull = noFacts.filter(t => page(e, t)?.cart?.source !== "drawer");
  if (needFull.length) return unverified(`The full text of the ${needFull.join(", ")} page wasn't scanned (only the first text blocks).`, { pages: needFull });
  return pass("No Lorem ipsum, demo address, theme-demo link or placeholder text was found on the home, collection, product or cart page.");
};

// ---- RISK-06: tap targets at least 44px ----
const MIN_TAP = 44;
const MIN_SPACE = 8;
// Two neighbours closer than 8px in a row or column (overlapping boxes are one control).
function tooClose(a: Box, b: Box): boolean {
  const dx = Math.max(0, b.x - (a.x + a.w), a.x - (b.x + b.w));
  const dy = vGap(a, b);
  if (dx === 0 && dy === 0) return false;
  return (dy === 0 && dx < MIN_SPACE) || (dx === 0 && dy < MIN_SPACE);
}
const risk06: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const home = page(e, "home");
  const product = page(e, "product");
  if (!home?.facts?.header) return unverified("The home page header wasn't read.");
  if (!product?.cta || !product.facts) return unverified("The product page didn't load, or no Add to Cart button was found.");
  const small: string[] = [];
  const check = (name: string, b: Box | null | undefined) => {
    if (b && (b.w < MIN_TAP || b.h < MIN_TAP)) small.push(`${name} is ${b.w}x${b.h}px`);
  };
  const h = home.facts.header;
  check("The menu button", h.menu);
  check("The cart icon", h.cart?.box);
  check("The search icon", h.search);
  const headerRead = [h.menu, h.cart?.box, h.search].filter(Boolean).length;
  if (!headerRead) return unverified("No menu, cart or search control was found in the home header.");
  check(`The "${product.cta.text}" button`, product.cta.box);
  const qty = product.facts.qty;
  (qty?.controls ?? []).forEach((b, i) => check(`Quantity control ${i + 1}`, b));
  const sw = product.facts.swatches ?? [];
  sw.forEach((b, i) => check(`Option ${i + 1}`, b));
  const cart = page(e, "cart");
  if (cart?.cta) check(`The "${cart.cta.text}" button`, cart.cta.box);
  const span = buySpan(product.cta.box, qty?.box);
  const tight = sw.filter((b, i) => sw.slice(i + 1).some(o => tooClose(b, o))).length;
  const facts = { headerControls: headerRead, optionCount: sw.length, quantityControls: qty?.controls.length ?? 0, ctaWidth: product.cta.box.w, span: Math.round(span) };
  if (small.length) return fail(`${small.slice(0, 4).join("; ")} (phone controls should be at least ${MIN_TAP}x${MIN_TAP}px).`, { ...facts, small: small.length });
  if (span < PHONE_W * 0.8) return fail(`The main buy button spans ${px(span)} of the ${PHONE_W}px screen, not near full width.`, facts);
  if (tight) return fail(`${tight} option button(s) sit less than ${MIN_SPACE}px from their neighbours.`, facts);
  return pass(`The controls we found (${headerRead} in the header, the buy button${qty ? ", quantity" : ""}${sw.length ? `, ${sw.length} options` : ""}) are all at least ${MIN_TAP}px, and the main button is ${px(span)} wide.`, facts);
};

// ---- RISK-07: no sideways scroll on small phones ----
function overflowOf(o: PageOverflow | undefined): "scrolls" | "masked" | "ok" | null {
  if (!o) return null;
  if (o.sw > o.iw + 1) return "scrolls";
  if (o.clipped && o.wide > o.iw + 1) return "masked";
  return "ok";
}
const risk07: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const pages = MAIN_TYPES.map(t => page(e, t));
  const bad: string[] = [];
  const open: string[] = [];
  for (const [i, p] of pages.entries()) {
    const t = MAIN_TYPES[i];
    if (!p) { open.push(`the ${t} page didn't load`); continue; }
    if (!p.facts && p.cart?.source === "drawer") { open.push("the cart is a drawer"); continue; }
    if (!p.facts?.overflow) { open.push(`the ${t} page wasn't measured`); continue; }
    for (const [w, o] of [[p.facts.overflow.iw, p.facts.overflow], [360, p.facts.overflow360]] as const) {
      const s = overflowOf(o);
      if (s === "scrolls") bad.push(`${t} at ${w}px (page ${o!.sw}px wide)`);
      else if (s === "masked") open.push(`the ${t} page hides overflow at ${w}px while content reaches ${o!.wide}px`);
      else if (s === null) open.push(`the ${t} page wasn't re-read at ${w}px`);
    }
  }
  if (bad.length) return fail(`These pages scroll sideways: ${bad.join(", ")}.`, { pages: bad });
  if (!open.length) return pass("None of the home, collection, product or cart pages scrolls sideways at 390px or 360px.");
  return unverified(`No sideways scroll was seen, but not everything could be checked: ${[...new Set(open)].slice(0, 4).join("; ")}.`, { open: [...new Set(open)] });
};

// ---- TRK-24: no campaign tags on internal links ----
const trk24: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const tagged: string[] = [];
  const open: string[] = [];
  let internal = 0;
  for (const t of MAIN_TYPES) {
    const p = page(e, t);
    if (!p) { open.push(`the ${t} page didn't load`); continue; }
    if (!p.facts?.utm) { open.push(p.cart?.source === "drawer" ? "the cart is a drawer (links not read)" : `the ${t} page's links weren't read`); continue; }
    internal += p.facts.utm.internal;
    if (p.facts.utm.withUtm) tagged.push(`${p.facts.utm.withUtm} on the ${t} page (${p.facts.utm.samples[0] ?? ""})`);
  }
  if (tagged.length) return fail(`Internal links carry utm_ parameters: ${tagged.join("; ")}.`, { tagged });
  if (open.length) return unverified(`No utm_ link was found, but not every page was read: ${open.join("; ")}.`, { internalLinks: internal });
  return pass(`None of the ${internal} internal links on the home, collection, product and cart pages carries a utm_ parameter.`, { internalLinks: internal });
};

// ---- SPEED-05: images are light and lazy ----
const NEGOTIATING = /cdn\.shopify\.com|cloudinary|imgix|cloudfront|akamai|fastly|imagekit|cdn\.salla|zid\.|wp\.com|cloudflare|googleusercontent|bunny/i;
const FOLD = 844;

export type ImageVerdict = "good" | "bad" | "unknown";
// good: right size and modern format; bad: provably too big or a plain
// jpg/png from a host that doesn't negotiate; unknown: not loaded yet, or a
// CDN that may serve WebP behind a .jpg name.
export function judgeImage(i: PageImage): ImageVerdict {
  const modern = i.fmt === "webp" || i.fmt === "avif";
  if (i.nw > 0 && i.nw > 2 * i.dw) return "bad";
  const fmt: ImageVerdict = modern ? "good" : i.auto || NEGOTIATING.test(i.host) || i.fmt === "other" ? "unknown" : "bad";
  if (fmt === "bad") return "bad";
  if (i.nw === 0) return "unknown";
  return fmt;
}

const speed05: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const home = page(e, "home");
  const product = page(e, "product");
  if (!home || !product) return unverified("The home or product page didn't load.");
  const read = [home, product, page(e, "collection"), page(e, "cart")].filter((p): p is PageEvidence => Boolean(p?.facts?.images));
  if (!read.some(p => p === home) || !read.some(p => p === product)) return unverified(OLD_DATA);
  const cut = read.filter(p => (p.facts!.imagesTotal ?? 0) > p.facts!.images!.length);
  if (cut.length) return unverified(`Only the first ${cut[0].facts!.images!.length} of ${cut[0].facts!.imagesTotal} images on the ${cut[0].pageType} page were measured.`);
  const imgs = read.flatMap(p => p.facts!.images!);
  if (!imgs.length) return unverified("No content images were found on the pages we read.");
  const v = imgs.map(judgeImage);
  const good = v.filter(x => x === "good").length;
  const unknown = v.filter(x => x === "unknown").length;
  const below = imgs.filter(i => i.top >= FOLD);
  const lazy = below.filter(i => i.lazy).length;
  const lazyShare = below.length ? lazy / below.length : 1;
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const facts = { images: imgs.length, good, unknown, bad: imgs.length - good - unknown, belowFold: below.length, lazy };
  const maxShare = (good + unknown) / imgs.length;
  const minShare = good / imgs.length;
  if (maxShare < 0.9) return fail(`Only ${pct(maxShare)} of ${imgs.length} content images are the right size (up to 2x display width) and WebP or AVIF; at least 90% is needed.`, facts);
  if (lazyShare < 0.9) return fail(`Only ${lazy} of ${below.length} images below the first screen use loading=lazy.`, facts);
  if (minShare < 0.9) return unverified(`${unknown} of ${imgs.length} images are served from a CDN that may send WebP behind a .jpg name, or weren't loaded yet; the rest are fine.`, facts);
  return pass(`${pct(minShare)} of ${imgs.length} content images are the right size and WebP or AVIF, and ${lazy} of ${below.length} below the first screen are lazy.`, facts);
};

export const FACTS_RULES: Record<string, Rule> = {
  "PATH-12": path12,
  "RISK-12": risk12,
  "PDP-05": pdp05,
  "PDP-08": pdp08,
  "NAV-05": nav05,
  "NAV-06": nav06,
  "NAV-07": nav07,
  "TRUST-09": trust09,
  "RISK-06": risk06,
  "RISK-07": risk07,
  "TRK-24": trk24,
  "SPEED-05": speed05,
};
