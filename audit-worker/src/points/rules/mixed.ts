import type { Box, PageEvidence, StoreEvidence, TextBlock } from "../../fud/evidence.js";
import { pageOf } from "../../fud/evidence.js";
import { currencyIn, moneyAmounts, normalize } from "../../fud/signals.js";
import { parseGtm } from "../gtm.js";
import type { Rule, RuleResult } from "./types.js";
import { unverified } from "./types.js";
import { contrast, parseRgb } from "./facts.js";

/**
 * The code part of the "code+ai" page points (PHASE1-PLAN.md step 3).
 * Each rule settles only the side the visit proves for certain, almost
 * always the pass (the text is there, next to the button) or n/a. Anything
 * else is "unverified" with what the code saw, and the pipeline hands the
 * point to the AI with that as a hint. A missing match is never a fail here:
 * the words may sit in a picture or be phrased another way.
 */

const PHONE = 844;
const noVisit = unverified("Our store visit didn't run this time.");
// Each decided verdict carries its own Arabic sentence (the report shows it
// through {observation}), so no AI call writes the Arabic for code verdicts.
const decided = (status: RuleResult["status"]) => (reason: string, facts?: RuleResult["facts"], ar?: string): RuleResult => ({ status, reason, ...(facts && { facts }), ...(ar && { observation: { ar } }) });
const pass = decided("pass");
const fail = decided("fail");
const na = decided("n/a");
// Store wording in Arabic sentences, and page names.
const qa = (t: string) => `«${t.replace(/\s+/g, " ").trim().slice(0, 90)}»`;
const PT_AR: Record<string, string> = { home: "الصفحة الرئيسية", product: "صفحة المنتج", cart: "السلة", collection: "صفحة التصنيف", landing: "صفحة الهبوط", checkout: "صفحة الدفع" };
const page = (e: StoreEvidence, type: PageEvidence["pageType"]) => pageOf(e, type);
const quote = (t: string) => `"${t.replace(/\s+/g, " ").trim().slice(0, 90)}"`;

function vGap(a: Box, b: Box): number {
  return Math.max(0, b.y - (a.y + a.h), a.y - (b.y + b.h));
}

// Text blocks within reach of the page's main button (collect.ts: 220px above or below).
function nearCta(p: PageEvidence): TextBlock[] {
  if (!p.cta) return [];
  const ids = new Set(p.cta.nearbyBlockIds);
  return p.blocks.filter(b => ids.has(b.id));
}
// Text blocks within `px` of the main button, measured edge to edge.
function within(p: PageEvidence, px: number): TextBlock[] {
  if (!p.cta) return [];
  return p.blocks.filter(b => vGap(b.box, p.cta!.box) <= px);
}
const find = (blocks: TextBlock[], re: RegExp) => blocks.find(b => re.test(b.text));
// The cart as the shopper saw it: the cart page, and the drawer when there is one.
function cartViews(e: StoreEvidence): PageEvidence[] {
  return [page(e, "cart"), e.cartDrawer?.loaded ? e.cartDrawer : undefined].filter((p): p is PageEvidence => Boolean(p && p.cart && !p.cart.empty));
}

// ---- shared wording ----
const DELIVERY_PROMISE = /free (shipping|delivery)|fast (shipping|delivery)|same.?day|next.?day|deliver(y|ed|s)? (in|within)|ships? (in|within|today)|شحن مجاني|توصيل مجاني|توصيل سريع|شحن سريع|التوصيل خلال|توصيل خلال|يصلك خلال|نفس اليوم/i;
const SECURE = /secure|ssl|encrypt|safe (checkout|payment)|دفع آمن|دفع امن|آمن|مشفر|محمي/i;
// Arabic read on normalized text (alef forms folded): "آمنة", "أمنة" → "امنة". Not after ث ("ثامن").
const SECURE_AR = /(^|[^ث])امن|مشفر|محمي/;
const isSecure = (t: string) => SECURE.test(t) || SECURE_AR.test(normalize(t));
// A returns or money-back promise. "ضمان مدفوعات آمنة" (secure payments) is a security line, not a guarantee.
const isGuarantee = (t: string) => RETURN_WORD.test(t) || /money.?back|free returns?|easy returns?/i.test(t) || (/guarantee|ضمان/i.test(t) && !isSecure(t));
const SUPPORT = /whatsapp|customer (service|support)|contact us|واتس|خدمة العملاء|الدعم|تواصل معنا/i;
const PAY_NAME = /visa|master ?card|mada|apple ?pay|google ?pay|tabby|tamara|paypal|stc ?pay|cash on delivery|تابي|تمارا|الدفع عند الاستلام/i;
const RETURN_WORD = /return|refund|exchange|استرجاع|إرجاع|ارجاع|استبدال|استرداد/i;
// A star rating with its number, or a count of customers / reviews.
const PROOF = /\b[1-5](\.\d)?\s*(\/\s*5|out of 5|stars?|★|⭐)|(★|⭐)\s*[1-5](\.\d)?|\b[1-9][\d,.]*\s*\+?\s*k?\+?\s*(happy |satisfied |verified )?(customers|reviews|ratings|clients)\b|(^|[^\d])[1-9][\d,.]*\s*\+?\s*(عميل|عملاء|تقييم|تقييمات|مراجعة|مراجعات)|(أكثر من|اكثر من|\+)\s*\d[\d,.]*\s*(عميل|عملاء)/i;

// ---- PATH-01: Add to cart really adds the item ----
// Code proves the pass only: a failed tap may be our bot (PHASE1 review note).
const path01: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const a = e.addToCart;
  if (!a.attempted) return unverified("Our visit didn't try Add to Cart (no product page or no button found).");
  const shown = cartViews(e);
  const facts = { via: a.via ?? "unknown", clickAdded: a.clickAdded ?? "unknown", cartShowsItem: shown.length > 0 };
  if (a.ok && a.via !== "api" && a.clickAdded !== false && shown.length) {
    return pass(`Our phone tap on Add to Cart added the item, and the ${shown.some(p => p.cart?.source === "drawer") ? "cart drawer" : "cart page"} lists it.`, facts, `أضافت نقرتنا على زر الإضافة إلى السلة المنتج، وظهر في ${shown.some(p => p.cart?.source === "drawer") ? "درج السلة" : "صفحة السلة"}.`);
  }
  if (a.via === "api") return unverified("Our tap left the cart empty, so the item was added through the store's cart address instead. A failed tap may be our bot, not the store.", facts);
  return unverified(`Add to Cart couldn't be confirmed: ${a.reason ?? "the cart didn't show the item"}.`, facts);
};

// ---- PATH-04: cart checkout button clear on phone ----
const CHECKOUT_WORD = /check ?out|proceed to|continue to (checkout|payment)|متابعة الطلب|متابعة الدفع|متابعة للدفع|complete (the )?order|place order|إتمام|اتمام|الدفع|ادفع|إكمال الطلب|اكمال الطلب/i;
const path04: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const c = page(e, "cart");
  if (!c || c.cart?.empty) return unverified("The cart page didn't load with the item in it.");
  if (!c.cta) return unverified("No checkout button was found on the cart page.");
  const b = c.cta.box;
  const facts = { button: c.cta.text, top: b.y, bottom: b.y + b.h };
  if (!CHECKOUT_WORD.test(c.cta.text)) return unverified(`The cart's main button reads ${quote(c.cta.text)}, which isn't clear checkout wording.`, facts);
  if (c.cta.disabled) return unverified(`The ${quote(c.cta.text)} button looked disabled.`, facts);
  if (!c.facts?.floaters) return unverified("Floating widgets on the cart page weren't read, so a covered button can't be ruled out.", facts);
  const covered = c.facts.floaters.find(f => Math.min(f.box.x + f.box.w, b.x + b.w) - Math.max(f.box.x, b.x) > 4 && Math.min(f.box.y + f.box.h, b.y + b.h) - Math.max(f.box.y, b.y) > 4);
  if (covered) return unverified(`A floating ${covered.kind} widget overlaps the ${quote(c.cta.text)} button.`, facts);
  if (b.y + b.h <= PHONE) return pass(`The cart's ${quote(c.cta.text)} button sits ${b.y}px down, inside the first phone screen, with nothing floating over it.`, facts, `زر السلة ${qa(c.cta.text)} يبدأ على بعد ${b.y}px من الأعلى، ضمن أول شاشة في الجوال، ولا يغطيه شيء.`);
  return unverified(`The cart's ${quote(c.cta.text)} button starts ${b.y}px down, below the first phone screen; whether it is sticky wasn't checked.`, facts);
};

// ---- PATH-05: guest checkout, no forced sign-in ----
const LOGIN = /log-?in|sign in|account/i;
const path05: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const k = e.pages.find(p => p.pageType === "checkout");
  if (!k || !k.loaded) return unverified("The first checkout screen didn't load.");
  if ((k.note && LOGIN.test(k.note)) || /\/(account|login)\b/i.test(k.url)) return unverified(`Checkout opened on a log-in page (${k.url}); whether it takes a phone number as a guest needs a look.`, { url: k.url });
  const fields = (k.facts?.inputs ?? []).filter(f => !f.inHeader);
  if (fields.some(f => f.type === "password")) return unverified(`The first checkout screen (${k.url}) asks for a password.`, { url: k.url });
  if (fields.length >= 2) return pass(`From the cart, checkout opened straight on a form with ${fields.length} fields (${k.url}), with no log-in wall.`, { url: k.url, fields: fields.length }, `من السلة، فتحت صفحة الدفع مباشرة على نموذج من ${fields.length} حقول، بدون تسجيل دخول.`);
  return unverified(`Only ${fields.length} form field(s) could be read on ${k.url}; the form may sit in a frame we can't read.`, { url: k.url });
};

// ---- PATH-09: cart quantity and remove controls work ----
const path09: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const c = page(e, "cart");
  const q = c?.interactions?.quantity;
  if (!c || !q) return unverified("Our visit didn't test the cart's quantity buttons.");
  const facts = { ...q };
  if (q.plusChanged && q.minusChanged && q.removeFound) return pass("In the cart, our + and − taps changed the quantity, and a remove control is there.", facts, `في السلة، غيّرت نقراتنا على + و − الكمية، ويوجد زر للحذف.`);
  return unverified(`Cart controls: + ${q.plusFound ? (q.plusChanged ? "worked" : "didn't change anything") : "not found"}, − ${q.minusFound ? (q.minusChanged ? "worked" : "didn't change anything") : "not found"}, remove ${q.removeFound ? "found" : "not found"}. A tap that didn't work may be our bot.`, facts);
};

// ---- PDP-04 / PDP-13: no options at all → not applicable ----
function noOptions(p: PageEvidence): boolean {
  return Boolean(p.variants && p.variants.control === "none" && p.variants.groups.length === 0 && !p.variants.hasSize && p.facts && (p.facts.swatches ?? []).length === 0);
}
const pdp04: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p) return unverified("The product page didn't load.");
  if (noOptions(p)) return na(`The product on ${p.url} has no options to choose.`, { url: p.url }, `المنتج ليس له خيارات للاختيار.`);
  return unverified(`Options found (${p.variants?.control ?? "unknown"}${p.variants?.groups.length ? `: ${p.variants.groups.join(", ")}` : ""}); the selected and sold-out states need a look.`, { url: p.url });
};
const pdp13: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p) return unverified("The product page didn't load.");
  if (noOptions(p)) return na(`The product on ${p.url} has no size or other options.`, { url: p.url }, `المنتج ليس له مقاسات أو خيارات أخرى.`);
  return unverified(`The product has options${p.variants?.hasSize ? ", including sizes" : ""}; whether a size guide is needed and sits next to them needs a look.`, { url: p.url });
};

// ---- NAV-08: Arabic layout mirrors ----
const nav08: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const seen = [...e.pages, ...(e.desktop ?? [])].filter(p => p.loaded && p.facts);
  if (!seen.length) return unverified("No page's layout facts were read.");
  const arabic = seen.filter(p => /^ar\b/i.test(p.facts!.lang));
  if (!arabic.length) {
    const hint = seen.some(p => p.facts!.langSwitch || p.facts!.hreflang.some(h => /^ar/i.test(h)) || p.facts!.dir === "rtl");
    if (hint) return unverified("The store links to another language version, but the pages we visited weren't the Arabic ones.");
    return na("The store has no Arabic pages: no page is lang=ar, none is right-to-left, and no language switch or Arabic hreflang was found.", undefined, `المتجر ليس له صفحات عربية.`);
  }
  const ltr = arabic.filter(p => p.facts!.dir.toLowerCase() !== "rtl");
  const facts = { arabicPages: arabic.map(p => p.pageType), ltr: ltr.map(p => p.pageType) };
  if (ltr.length) return fail(`The Arabic ${ltr.map(p => p.pageType).join(", ")} page${ltr.length > 1 ? "s are" : " is"} marked lang=ar but laid out left-to-right (dir "${ltr[0].facts!.dir || "none"}").`, facts, `${ltr.map(p => PT_AR[p.pageType]).join("، ")} معلنة بالعربية لكنها معروضة من اليسار إلى اليمين.`);
  return unverified(`The Arabic pages are right-to-left (${arabic.map(p => p.pageType).join(", ")}); arrows and alignment need a look.`, facts);
};

// ---- TRUST-01 / TRUST-07: policy page linked ----
// Fail only when no page links the policy, no policy page was found, and no
// page text mentions it: the link kinds come from link text and addresses.
function policyRule(kind: "returns" | "shipping", word: RegExp, label: string): Rule {
  return ({ evidence: e }) => {
    if (!e) return noVisit;
    const pages = [...e.pages, ...(e.desktop ?? [])].filter(p => p.loaded && ["home", "product", "cart", "collection"].includes(p.pageType));
    if (!pages.some(p => p.pageType === "home") || !pages.some(p => p.pageType === "product")) return unverified("The home or product page didn't load.");
    if (!e.policies) return unverified("Our visit didn't look for policy pages this run.");
    const linked = pages.filter(p => p.policyLinks.some(l => l.kind === kind));
    const policy = e.policies.find(p => p.kind === kind);
    const facts = { linkedFrom: [...new Set(linked.map(p => p.pageType))], policyUrl: policy?.url ?? "none" };
    if (!linked.length && !policy && !pages.some(p => p.blocks.some(b => word.test(b.text)))) {
      return fail(`No ${label} link was found on the home, product, cart or collection pages, no ${label} page was found, and no page text mentions it.`, facts, `لا يوجد رابط ${kind === "returns" ? "لسياسة الإرجاع" : "لسياسة الشحن"} في الصفحة الرئيسية أو صفحة المنتج أو السلة أو صفحة التصنيف، ولا صفحة لها، ولا ذكر لها في نصوص الصفحات.`);
    }
    if (policy && policy.text.trim().length < 80) return unverified(`The ${label} page (${policy.url}) shows almost no text to us; it may load its text by script.`, facts);
    return unverified(`${linked.length ? `A ${label} link is on the ${facts.linkedFrom.join(", ")} page(s)` : `No ${label} link was found by its wording`}${policy ? ` and the page is ${policy.url}` : ""}; what it says needs a look.`, facts);
  };
}
const trust01 = policyRule("returns", RETURN_WORD, "returns");
const trust07 = policyRule("shipping", /shipping|delivery|الشحن|التوصيل|شحن|توصيل/i, "shipping");

// ---- TRUST-04: proof on the home page's first phone screen ----
const trust04: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const h = page(e, "home");
  if (!h) return unverified("The home page didn't load.");
  const b = h.blocks.find(x => x.aboveFold && PROOF.test(x.text));
  if (b) return pass(`The home page's first phone screen shows ${quote(b.text)}.`, { block: b.id }, `أول شاشة في الصفحة الرئيسية على الجوال تعرض ${qa(b.text)}.`);
  return unverified("No star rating with a number or customer count was found in the first phone screen's text; a testimonial or a rating inside a picture needs a look.");
};

// ---- TRUST-05: guarantee next to the buy button ----
const trust05: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p?.cta) return unverified("The product page or its Add to Cart button wasn't found.");
  const b = nearCta(p).find(b => isGuarantee(b.text));
  if (b) return pass(`Next to the ${quote(p.cta.text)} button: ${quote(b.text)}.`, { block: b.id }, `بجانب زر ${qa(p.cta.text)}: ${qa(b.text)}.`);
  return unverified(`No guarantee or returns line was found in the text within 220px of the ${quote(p.cta.text)} button; it may be a picture or worded another way.`);
};

// ---- TRUST-06: trust signals near the cart checkout button ----
const trust06: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const carts = cartViews(e).filter(c => c.cta);
  if (!carts.length) return unverified("The cart didn't load with the item and a checkout button.");
  for (const c of carts) {
    const near = nearCta(c);
    // Each block counts once, as its first kind: one badge in two languages is one signal.
    const order: Array<[string, (b: TextBlock) => boolean]> = [
      ["secure", b => isSecure(b.text)],
      ["payment", b => b.tag === "img" && PAY_NAME.test(b.text)],
      ["returns", b => isGuarantee(b.text)],
      ["delivery", b => DELIVERY_PROMISE.test(b.text)],
      ["support", b => SUPPORT.test(b.text)],
    ];
    const kinds: Record<string, TextBlock | undefined> = {};
    for (const b of near) {
      const k = order.find(([, test]) => test(b))?.[0];
      if (k && !kinds[k]) kinds[k] = b;
    }
    const got = Object.entries(kinds).filter(([, b]) => b);
    if (got.length >= 2) return pass(`Near the cart's ${quote(c.cta!.text)} button: ${got.map(([k, b]) => `${k} (${quote(b!.text)})`).join(", ")}.`, { kinds: got.map(([k]) => k) }, `قرب زر ${qa(c.cta!.text)} في السلة: ${got.map(([, b]) => qa(b!.text)).join("، ")}.`);
  }
  return unverified("Fewer than 2 trust signals were found in the text near the cart's checkout button; icons without text need a look.");
};

// ---- TRUST-08: phone or WhatsApp plus email or form ----
const trust08: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const pages = [...e.pages, ...(e.desktop ?? [])].filter(p => p.loaded && p.facts);
  if (!pages.length) return unverified("No page's facts were read.");
  const links = pages.flatMap(p => p.facts!.contactLinks ?? []);
  const phone = links.some(l => /(wa\.me|whatsapp\.com|^tel:).*\d{6,}/i.test(l.replace(/[\s+()-]/g, ""))) || pages.some(p => p.facts!.footer?.phone || p.facts!.footer?.whatsapp);
  const email = pages.some(p => p.facts!.footer?.email) || pages.some(p => p.policyLinks.some(l => l.kind === "contact"));
  const facts = { phoneOrWhatsapp: phone, emailOrContactPage: email };
  if (phone && email) return pass("A phone or WhatsApp number is linked, and an email address or contact page is reachable from the header or footer.", facts, `رقم هاتف أو واتساب مرتبط، وبريد إلكتروني أو صفحة تواصل متاحة من أعلى الصفحة أو أسفلها.`);
  return unverified(`Found: ${phone ? "a phone or WhatsApp number" : "no phone or WhatsApp link"}, ${email ? "an email or contact page" : "no email or contact page link"}. Icons or widgets may hold the rest.`, facts);
};

// ---- TRUST-11 / TRUST-12: guarantee / trust badge within 300px of the landing CTA ----
function landingNear(match: (b: TextBlock) => boolean, what: string): Rule {
  return ({ evidence: e }) => {
    if (!e) return noVisit;
    const l = page(e, "landing");
    if (!l) return unverified("No landing page was visited.");
    if (!l.cta) return unverified(`No main button was found on ${l.url}.`);
    const b = within(l, 300).find(match);
    if (b) return pass(`On ${l.url}, within 300px of the ${quote(l.cta.text)} button: ${quote(b.text)}.`, { url: l.url, block: b.id }, `في صفحة الهبوط، على بعد أقل من 300px من زر ${qa(l.cta.text)}: ${qa(b.text)}.`);
    return unverified(`No ${what} was found in the text within 300px of the ${quote(l.cta.text)} button on ${l.url}; it may be a picture.`, { url: l.url });
  };
}
const trust11 = landingNear(b => isGuarantee(b.text), "guarantee or returns line");
const trust12 = landingNear(b => isSecure(b.text) || (b.tag === "img" && PAY_NAME.test(b.text)) || /trusted|verified|maroof|معروف|موثق/i.test(b.text), "security line, payment icon or trust seal");

// ---- OFFER-01: shipping cost or free-shipping rule before checkout ----
const SHIP_WORD = /shipping|delivery|الشحن|التوصيل|شحن|توصيل/i;
const FREE_SHIP = /free (shipping|delivery)|شحن مجاني|توصيل مجاني|الشحن مجاني|التوصيل مجاني|الشحن المجاني|التوصيل المجاني/i;
function shipCost(b: TextBlock): boolean {
  if (FREE_SHIP.test(b.text)) return true;
  return SHIP_WORD.test(b.text) && moneyAmounts(normalize(b.text)).length > 0 && !RETURN_WORD.test(b.text);
}
const offer01: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const pages = [page(e, "product"), ...cartViews(e)].filter((p): p is PageEvidence => Boolean(p));
  if (!pages.length) return unverified("Neither the product page nor the cart loaded.");
  for (const p of pages) {
    const b = p.blocks.find(shipCost);
    if (b) return pass(`The ${p.pageType === "product" ? "product page" : "cart"} states the shipping: ${quote(b.text)}.`, { page: p.pageType, block: b.id }, `${p.pageType === "product" ? "صفحة المنتج توضح" : "السلة توضح"} الشحن: ${qa(b.text)}.`);
  }
  return unverified("No shipping cost or free-shipping rule was found in the product page or cart text.");
};

// ---- OFFER-05: delivery time near the buy box ----
const DELIVERY_TIME = /(deliver\w*|shipping|ships?|arriv\w*|dispatch\w*|توصيل|التوصيل|شحن|الشحن|يصل\S*|تصل\S*)([^.\n]{0,30}?)(\d+\s*(-|–|to|الى|إلى)?\s*\d*\s*(business |working )?(days?|hours?|أيام|ايام|يوم|ساعة|ساعات)|same.?day|next.?day|tomorrow|نفس اليوم|اليوم التالي|غدا|غداً)/i;
function deliveryTime(b: TextBlock): boolean {
  const m = b.text.match(DELIVERY_TIME);
  return Boolean(m && !RETURN_WORD.test(m[0]));
}
const offer05: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p?.cta) return unverified("The product page or its Add to Cart button wasn't found.");
  const b = within(p, 400).find(deliveryTime);
  if (b) return pass(`Near the ${quote(p.cta.text)} button: ${quote(b.text)}.`, { block: b.id }, `قرب زر ${qa(p.cta.text)}: ${qa(b.text)}.`);
  return unverified(`No delivery time was found in the text within 400px of the ${quote(p.cta.text)} button.`);
};

// ---- OFFER-07: local payment methods and a secure line by both buttons ----
const LOCAL_PAY = /\bmada\b|apple ?pay|tabby|tamara|stc ?pay|cash on delivery|\bcod\b|تابي|تمارا|الدفع عند الاستلام/i;
const localPay = (b: TextBlock) => LOCAL_PAY.test(b.text) || (b.tag === "img" && /مدى/.test(b.text));
const offer07: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  const c = cartViews(e).find(x => x.cta);
  if (!p?.cta || !c) return unverified("The product page's or the cart's main button wasn't found.");
  const found: string[] = [];
  for (const [name, v] of [["product page", p], ["cart", c]] as const) {
    const near = nearCta(v);
    const pay = near.find(localPay);
    const sec = near.find(b => isSecure(b.text));
    if (!pay || !sec) return unverified(`Near the ${name}'s ${quote(v.cta!.text)} button the text shows ${pay ? `${quote(pay.text)} but no secure-checkout line` : "no local payment method"}; icons without text need a look.`);
    found.push(`${name}: ${quote(pay.text)} and ${quote(sec.text)}`);
  }
  return pass(`Local payment methods and a secure-checkout line sit by both buttons (${found.join("; ")}).`, undefined, `طرق دفع محلية وعبارة دفع آمن موجودة بجانب زر صفحة المنتج وزر السلة.`);
};

// ---- OFFER-09: free-shipping progress in the cart ----
// No "." exclusion in the gaps: amounts carry decimals and "ر.س".
const FREE_BAR = /(spend|add|away|left)[^\n]{0,40}free (shipping|delivery|gift)|free (shipping|delivery|gift)[^\n]{0,30}(away|left|more)|(unlocked|qualif\w*|got|earned|you'?ve)[^\n]{0,20}free (shipping|delivery)|(أضف|اضف|تبقى|باقي|متبقي|بقي|أنفق|انفق)[^\n]{0,40}(شحن مجاني|توصيل مجاني|الشحن المجاني|التوصيل المجاني|هدية)|(الشحن المجاني|التوصيل المجاني|شحن مجاني|توصيل مجاني)[^\n]{0,40}(تبقى|باقي|متبقي)|حصلت على (ال)?(شحن|توصيل) (ال)?مجاني/i;
const offer09: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const carts = cartViews(e);
  if (!carts.length) return unverified("The cart didn't load with the item in it.");
  for (const c of carts) {
    // The rule wants the exact amount left; a bar already full says so instead.
    const b = c.blocks.find(x => FREE_BAR.test(x.text) && (/\d/.test(x.text) || /unlocked|qualif|earned|حصلت/i.test(x.text)));
    if (b) return pass(`The ${c.cart?.source === "drawer" ? "cart drawer" : "cart"} shows ${quote(b.text)}.`, { block: b.id }, `${c.cart?.source === "drawer" ? "درج السلة يعرض" : "السلة تعرض"} ${qa(b.text)}.`);
  }
  return unverified("No free-shipping progress line was found in the cart text; a bar drawn as a picture, or a store with no free shipping, needs a look.");
};

// ---- OFFER-17: discount code field present but quiet ----
// Decision guide (ai-guides.ts): an open field fails whatever its size.
const COUPON = /discount|coupon|promo|voucher|gift.?card|كوبون|خصم|قسيمة|كود الخصم|رمز الخصم/i;
const offer17: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const c = page(e, "cart");
  if (!c || c.cart?.empty) return unverified("The cart page didn't load with the item in it.");
  if (!c.facts?.inputs) return unverified("The cart page's form fields weren't read this run.");
  const open = c.facts.inputs.find(f => !f.inHeader && COUPON.test(`${f.name} ${f.label}`));
  if (open) return fail(`The cart page shows an open discount code field (${quote(open.label || open.name)}), not one collapsed behind a link.`, { field: open.label || open.name }, `صفحة السلة تعرض حقل كود خصم مفتوحًا (${qa(open.label || open.name)})، وليس مخفيًا خلف رابط.`);
  const link = find(c.blocks, COUPON);
  if (link) return pass(`The cart has a place for codes behind ${quote(link.text)}, with no open field.`, { block: link.id }, `السلة فيها مكان للأكواد خلف ${qa(link.text)}، بدون حقل مفتوح.`);
  return unverified("No discount code field or link was found on the cart page; it may be on the checkout screen.");
};

// ---- OFFER-20: signup with an incentive ----
const SIGNUP = /subscribe|newsletter|sign ?up|join (our|the)|اشترك|اشتراك|النشرة|سجل|انضم/i;
const INCENTIVE = /\d+\s*%|%\s*\d+|discount|\boff\b|early access|free gift|خصم|هدية|وصول مبكر/i;
const offer20: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  for (const p of e.pages.filter(x => x.loaded)) {
    const capture = p.facts?.capture.email || p.facts?.capture.phone;
    const texts = [...p.blocks.map(b => b.text), ...(p.popups?.onLoad.map(o => o.text) ?? [])];
    const t = texts.find(x => SIGNUP.test(x) && INCENTIVE.test(x));
    if (t && capture) return pass(`The ${p.pageType} page has a signup form offering ${quote(t)}.`, { page: p.pageType }, `${PT_AR[p.pageType]} فيها نموذج اشتراك يعرض ${qa(t)}.`);
  }
  return unverified("No signup form with a stated incentive was found in the page text or the first pop-up.");
};

// ---- OFFER-22: cart shows the full cost ----
const SUBTOTAL = /sub-?total|total|المجموع|الإجمالي|الاجمالي/i;
const offer22: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const carts = cartViews(e);
  if (!carts.length) return unverified("The cart didn't load with the item in it.");
  for (const c of carts) {
    const sub = find(c.blocks, SUBTOTAL);
    const ship = find(c.blocks, SHIP_WORD);
    const code = find(c.blocks, COUPON) ?? c.blocks.find(b => /\bcode\b|كود/i.test(b.text));
    if (sub && ship && code) return pass(`The ${c.cart?.source === "drawer" ? "cart drawer" : "cart"} shows ${quote(sub.text)}, ${quote(ship.text)} and ${quote(code.text)}.`, undefined, `${c.cart?.source === "drawer" ? "درج السلة يعرض" : "السلة تعرض"} ${qa(sub.text)} و${qa(ship.text)} و${qa(code.text)}.`);
  }
  return unverified("The cart text didn't show all three of: subtotal, how shipping is handled, a discount field or note.");
};

// ---- OFFER-24: reassurance right by the button ----
const offer24: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p?.cta) return unverified("The product page or its Add to Cart button wasn't found.");
  const b = nearCta(p).find(x => x.text.trim() !== p.cta!.text.trim() && (isGuarantee(x.text) || DELIVERY_PROMISE.test(x.text) || isSecure(x.text) || /cash on delivery|الدفع عند الاستلام/i.test(x.text)));
  if (b) return pass(`Right by the ${quote(p.cta.text)} button: ${quote(b.text)}.`, { block: b.id }, `مباشرة بجانب زر ${qa(p.cta.text)}: ${qa(b.text)}.`);
  return unverified(`No reassurance line was found in the text within 220px of the ${quote(p.cta.text)} button.`);
};

// ---- LAND-03: landing page without the main menu ----
const land03: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const l = page(e, "landing");
  if (!l) return unverified("No landing page was visited.");
  const f = l.facts;
  if (f?.menuLinks === undefined) return unverified("The landing page's menu wasn't read this run.");
  const facts = { url: l.url, menuLinks: f.menuLinks, menuIcon: f.menuIcon ?? false };
  if (f.menuLinks >= 3) return fail(`${l.url} carries the store's main menu (${f.menuLinks} links), so visitors can leave the offer.`, facts, `صفحة الهبوط تعرض القائمة الرئيسية للمتجر (${f.menuLinks} رابطًا)، فيستطيع الزائر الخروج من العرض.`);
  return unverified(`${l.url} shows ${f.menuLinks} menu link(s); whether it keeps to one offer and one action needs a look.`, facts);
};

// ---- LAND-07: rating or named proof in the first two screens ----
const land07: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const l = page(e, "landing");
  if (!l) return unverified("No landing page was visited.");
  const b = l.blocks.find(x => x.box.y < 2 * PHONE && PROOF.test(x.text));
  if (b) return pass(`${l.url} shows ${quote(b.text)} in the first two phone screens.`, { url: l.url, block: b.id }, `صفحة الهبوط تعرض ${qa(b.text)} في أول شاشتين على الجوال.`);
  return unverified(`No star rating with a count was found in the text of ${l.url}'s first two screens; named testimonials need a look.`, { url: l.url });
};

// ---- LAND-09: CTA labels say what the visitor gets ----
const GENERIC = /^(submit|send|click here|learn more|read more|more|continue|go|ok|إرسال|ارسال|اضغط هنا|اعرف المزيد|المزيد|اقرأ المزيد|متابعة)$/i;
const NEXT = /add to (cart|bag)|buy|order|shop|get |claim|book|try|اطلب|أضف|اضف|اشتر|تسوق|احصل|احجز|جرب/i;
const land09: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const l = page(e, "landing");
  if (!l) return unverified("No landing page was visited.");
  if (!l.cta) return unverified(`No main button was found on ${l.url}.`);
  const labels = [l.cta.text, ...(l.facts?.heroButtons ?? [])].map(t => t.replace(/\s+/g, " ").trim()).filter(Boolean);
  const generic = labels.find(t => GENERIC.test(t));
  const facts = { url: l.url, labels: [...new Set(labels)] };
  if (generic) return fail(`A main button on ${l.url} only says ${quote(generic)}.`, facts, `أحد الأزرار الرئيسية في صفحة الهبوط يقول فقط ${qa(generic)}.`);
  if (l.facts && labels.every(t => NEXT.test(t))) return pass(`The main buttons on ${l.url} name the next step: ${facts.labels.map(quote).join(", ")}.`, facts, `الأزرار الرئيسية في صفحة الهبوط تسمّي الخطوة التالية: ${facts.labels.map(qa).join("، ")}.`);
  return unverified(`Main button labels on ${l.url}: ${facts.labels.map(quote).join(", ")}.`, facts);
};

// ---- SEO-06: schema price matches the shown price ----
const seo06: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p) return unverified("The product page didn't load.");
  const price = p.jsonLd.price;
  if (price === undefined) return unverified(p.jsonLd.offer ? "The product schema has no price." : "No product schema price was read.");
  const shown = [...new Set(p.blocks.filter(b => b.aboveFold).flatMap(b => moneyAmounts(normalize(b.text))))];
  const facts = { schemaPrice: price, shownPrices: shown.map(String) };
  if (p.cta?.disabled && /instock/i.test(p.jsonLd.availability ?? "")) return unverified("The buy button looks disabled while the schema says in stock.", facts);
  if (shown.length === 1 && Math.abs(shown[0] - price) < 0.01) return pass(`The schema price (${price}) equals the one price shown on the first screen.`, facts, `السعر في البيانات المنظمة للمنتج (${price}) يطابق السعر الوحيد الظاهر في أول شاشة.`);
  return unverified(shown.length === 1 ? `The schema price (${price}) differs from the price shown (${shown[0]}); a variant or sale price may explain it.` : `${shown.length} prices show on the first screen (${shown.slice(0, 4).join(", ")}), so the shown price isn't clear.`, facts);
};

// ---- TRK-44: value sent matches the shown price ----
const trk44: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p) return unverified("The product page didn't load.");
  const view = [...(e.pageHits ?? []).filter(h => h.vendor === "ga4" && h.name === "view_item").map(h => h.q), ...(e.dlPushes?.view ?? [])].filter(q => q?.value !== undefined || q?.currency);
  const atc = [...(e.atcHits ?? []).filter(h => h.vendor === "ga4" && h.name === "add_to_cart").map(h => h.q), ...(e.dlPushes?.atc ?? [])].filter(q => q?.value !== undefined || q?.currency);
  const sent = [...view, ...atc];
  if (!sent.length) return unverified("No view_item or add_to_cart value was seen on the product page.");
  const bad = sent.find(q => q!.currency !== undefined && !/^[A-Z]{3}$/.test(q!.currency));
  const facts = { values: sent.map(q => `${q!.value ?? "none"} ${q!.currency ?? ""}`.trim()) };
  if (bad) return fail(`The event sends currency "${bad.currency}", not a three-letter code in capitals (for example SAR).`, facts, `الحدث يرسل العملة "${bad.currency}"، وليس رمزًا من ثلاثة أحرف كبيرة (مثل SAR).`);
  const shown = [...new Set(p.blocks.filter(b => b.aboveFold).flatMap(b => moneyAmounts(normalize(b.text))))];
  if (shown.length !== 1) return unverified(`${shown.length} prices show on the first screen, so the shown price isn't clear.`, facts);
  const off = sent.find(q => q!.value === undefined || Math.abs(q!.value - shown[0]) > 0.01 || !q!.currency);
  if (!off) return pass(`view_item and add_to_cart send ${shown[0]} ${sent[0]!.currency}, the price shown on the page.`, facts, `view_item و add_to_cart يرسلان ${shown[0]} ${sent[0]!.currency}، وهو السعر الظاهر في الصفحة.`);
  return unverified(`The shown price is ${shown[0]}, but an event sent ${off!.value ?? "no value"} ${off!.currency ?? "with no currency"}; a variant or quantity may explain it.`, facts);
};

// ---- TRK-26: test sites mixed into live numbers ----
// GA4-P05 lists every foreign hostname; only dev-looking ones fail this point.
const DEV_HOST = /staging|\bstage\b|preview|localhost|127\.0\.0\.1|\bdev\b|-dev\b|\.dev\.|\btest\b|theme|shopifypreview|vercel\.app|netlify\.app|ngrok/i;
const trk26: Rule = ({ ga4 }) => {
  if (!ga4) return unverified("No GA4 data this run (no OAuth access, or under 300 sessions).");
  const f = ga4.facts["GA4-P05"];
  if (!f || f.status === "no_data") return unverified(f?.en ?? "The hostname report wasn't in the GA4 pull.");
  if (f.status === "pass") return pass(f.en, { fact: "GA4-P05" }, `كل النطاقات التي ترسل بيانات إلى GA4 تابعة للمتجر.`);
  const hosts = [...f.en.matchAll(/([a-z0-9][a-z0-9.-]*[a-z0-9]|localhost)(:\d+)? \(\d/gi)].map(m => m[1]);
  const dev = hosts.filter(h => DEV_HOST.test(h));
  const facts = { fact: "GA4-P05", hosts, devHosts: dev };
  if (dev.length) return fail(f.en, facts, `نطاقات تجريبية أو تطوير ترسل بيانات إلى GA4: ${dev.join("، ")}.`);
  return pass(`No test or staging hostname sends data. Other hosts to review: ${f.en}`, facts, `لا يرسل أي نطاق تجريبي بيانات إلى GA4.${hosts.length ? ` نطاقات أخرى للمراجعة: ${hosts.join("، ")}.` : ""}`);
};


// ---- COL-07: quick add on product cards (presence only) ----
const col07: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const lists = (["collection", "home"] as const).map(t => ({ t, l: page(e, t)?.listing })).filter(x => x.l && x.l.cards > 0);
  if (!lists.length) return unverified("No product cards were read on the collection or home page.");
  // "Quick view" opens a preview, it doesn't add: those cards don't count.
  const VIEW = /view|عرض|مشاهدة/i;
  const hit = lists.find(x => x.l!.quickAdd > 0 && !(x.l!.quickAddLabels.length && x.l!.quickAddLabels.every(t => VIEW.test(t))));
  const viewOnly = lists.find(x => x.l!.quickAdd > 0);
  if (!hit && viewOnly) return unverified(`Cards on the ${viewOnly.t} page show ${viewOnly.l!.quickAddLabels.slice(0, 2).map(quote).join(", ")}, a quick view rather than an add button.`);
  if (hit) return pass(`${hit.l!.quickAdd} of ${hit.l!.cards} product cards on the ${hit.t} page have a quick add button (${hit.l!.quickAddLabels.slice(0, 2).map(quote).join(", ") || "icon"}).`, { page: hit.t, quickAdd: hit.l!.quickAdd, cards: hit.l!.cards }, `${hit.l!.quickAdd} من ${hit.l!.cards} بطاقة منتج في ${PT_AR[hit.t]} فيها زر إضافة سريعة.`);
  return unverified(`No quick add button was found on ${lists.map(x => `${x.l!.cards} ${x.t} cards`).join(" or ")}; an icon-only button needs a look.`);
};

// ---- RISK-05: price and buy button readable ----
// Code decides the clear fail only: button text under 3:1 on a solid colour
// fails at any text size. The price's colours aren't read, so no pass here.
const risk05: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  const a = p?.facts?.atc;
  if (!p?.cta || !a) return unverified("The Add to Cart button's colours weren't read.");
  const fg = parseRgb(a.fg), bg = parseRgb(a.bg);
  if (a.bgComplex || !fg || !bg) return unverified("The Add to Cart button sits on a gradient, picture or see-through background, so its contrast can't be computed.");
  const ratio = Math.round(contrast(fg, bg) * 10) / 10;
  if (ratio < 3) return fail(`The ${quote(p.cta.text)} button text has a ${ratio}:1 contrast against its background; even large text needs 3:1.`, { ratio }, `تباين نص زر ${qa(p.cta.text)} مع خلفيته ${ratio}:1، والحد الأدنى حتى للنص الكبير 3:1.`);
  return unverified(`The ${quote(p.cta.text)} button has ${ratio}:1 contrast; the price's contrast needs a look.`, { ratio });
};

// ---- TRK-15: GCC consent defaults (GTM side only) ----
// With no consent setup in GTM there is nothing in the container to judge,
// and the AI would read the same container: final unverified.
const CONSENT = /consent|cookiebot|onetrust|cookieyes|usercentrics|didomi|iubenda|complianz|termly|cookie.?script|osano/i;
const trk15: Rule = ({ gtm }) => {
  const s = parseGtm(gtm);
  if (!s) return unverified("No GTM container was shared, so its consent setup can't be read.");
  const raw = JSON.stringify(gtm);
  const tags = s.tags.filter(t => !t.paused && (CONSENT.test(t.name) || CONSENT.test(t.type)));
  const commands = /consent\\?['"]?\s*,\s*\\?['"]default/i.test(raw);
  if (!tags.length && !commands) return unverified("The GTM container has no consent template or consent default, so it sets nothing that could hide Gulf visitors; a banner outside GTM can't be read from here.", { final: true });
  return unverified(`GTM has a consent setup (${tags.map(t => `"${t.name}"`).join(", ") || "a consent default command"}); whether it denies storage for GCC visitors needs a read of its settings.`, { consentTags: tags.map(t => t.name) });
};

// ---- RISK-01: no customer emails sent to trackers ----
// GA4-24 scans GA4 page paths. Code fails a clear email only (phone patterns hit order IDs).
const risk01: Rule = ({ ga4 }) => {
  if (!ga4) return unverified("No GA4 data this run (no OAuth access, or under 300 sessions).");
  const f = ga4.facts["GA4-24"];
  if (!f || f.status === "no_data") return unverified(f?.en ?? "GA4 page paths weren't in the pull.");
  if (f.status === "fail" && /@/.test(f.en)) return fail(f.en, { fact: "GA4-24" }, `تظهر بيانات شخصية (بريد إلكتروني) في مسارات الصفحات المرسلة إلى GA4.`);
  return unverified(`${f.en} Pixel hits and GTM tag values still need a look.`, { fact: "GA4-24" });
};

// ---- SPEED-08: only core tags fire on every page ----
// Core: the platforms' own base tags (GA4, Ads, Meta, TikTok, Snapchat), the
// Google tag, the Conversion Linker and consent tags. Anything else firing on
// every page goes to the AI with its name; "heavy" needs a judgement.
const speed08: Rule = ({ gtm }) => {
  const s = parseGtm(gtm);
  if (!s) return unverified("No GTM container was shared.");
  const every = s.tags.filter(t => !t.paused && t.triggers.some(tr => tr.kind === "all_pages"));
  const extra = every.filter(t => t.platform === "other" && !CONSENT.test(`${t.name} ${t.type}`) && !/^(googtag|gaawc|gclidw)$/.test(t.type));
  const facts = { allPagesTags: every.map(t => t.name), nonCore: extra.map(t => t.name) };
  if (!extra.length) return pass(`Every tag firing on all pages is a core analytics, ad pixel or consent tag (${every.length}).`, facts, `كل الوسوم التي تعمل في كل الصفحات وسوم أساسية للتحليلات أو الإعلانات أو الموافقة (${every.length}).`);
  return unverified(`${extra.length} other tag(s) fire on every page: ${extra.slice(0, 5).map(t => `"${t.name}" (${t.type})`).join(", ")}; whether they are heavy needs a look.`, facts);
};

// ---- NAV-12: language switch findable, one currency throughout ----
const nav12: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const home = page(e, "home");
  if (!home?.facts) return unverified("The home page didn't load.");
  const where = home.facts.langAt;
  const cur = (["product", "cart", "collection"] as const).map(t => {
    const p = page(e, t);
    const b = p?.blocks.find(x => moneyAmounts(normalize(x.text)).length && currencyIn(normalize(x.text)));
    return { t, code: b ? currencyIn(normalize(b.text)) : null };
  });
  const codes = [...new Set(cur.map(c => c.code).filter(Boolean))];
  const facts = { langAt: where ?? "none", currencies: cur.map(c => `${c.t}: ${c.code ?? "?"}`) };
  if ((where === "header" || where === "menu") && codes.length === 1 && cur.every(c => c.code)) return pass(`The language switch sits in the phone ${where === "header" ? "header" : "menu"}, and product, cart and collection prices all show ${codes[0]}.`, facts, `مفتاح اللغة في ${where === "header" ? "رأس الصفحة" : "القائمة"} على الجوال، والأسعار في صفحة المنتج والسلة وصفحة التصنيف كلها بعملة ${codes[0]}.`);
  if (codes.length > 1) return fail(`Prices show in different currencies across the store: ${facts.currencies.join(", ")}.`, facts, `الأسعار تظهر بعملات مختلفة في المتجر: ${facts.currencies.join("، ")}.`);
  return unverified(`Language switch: ${where ?? "not found"}; currencies read: ${facts.currencies.join(", ")}.`, facts);
};

// ---- HOME-09: announcement bar with a concrete reason ----
const CONCRETE = /free (shipping|delivery)|\d+\s*%|%\s*\d+|\bsale\b|\boff\b|deliver(y|ed)? (in|within)|guarantee|شحن مجاني|توصيل مجاني|خصم|تخفيض|توصيل خلال|ضمان|كود/i;
function topBar(p: PageEvidence | undefined): TextBlock | undefined {
  return p?.blocks.find(b => b.box.y < 70 && b.box.h < 80 && CONCRETE.test(b.text));
}
const home09: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const h = page(e, "home"), p = page(e, "product");
  if (!h || !p) return unverified("The home or product page didn't load.");
  const a = topBar(h), b = topBar(p);
  if (a && b) return pass(`A bar at the top of the home and product pages says ${quote(a.text)}.`, { home: a.text, product: b.text }, `شريط أعلى الصفحة الرئيسية وصفحة المنتج يقول ${qa(a.text)}.`);
  return unverified("No top bar with a concrete reason (free shipping, a sale, a delivery promise or a guarantee) was found in the text at the top of both pages.");
};

// ---- OFFER-10: free-shipping amount in the cart matches the bar ----
function freeShipAmount(blocks: TextBlock[]): { amount: number; code: string | null } | null {
  for (const b of blocks) {
    if (!FREE_SHIP.test(b.text)) continue;
    const n = normalize(b.text);
    const a = moneyAmounts(n);
    if (a.length === 1) return { amount: a[0], code: currencyIn(n) };
  }
  return null;
}
const offer10: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const h = page(e, "home");
  const carts = cartViews(e);
  if (!h || !carts.length) return unverified("The home page or a cart with the item didn't load.");
  const bar = freeShipAmount(h.blocks.filter(b => b.box.y < 70));
  const cart = freeShipAmount(carts.flatMap(c => c.blocks));
  if (!bar || !cart) return unverified(`A free-shipping amount wasn't found in ${bar ? "the cart" : "the top bar"} text.`);
  const facts = { bar: `${bar.amount} ${bar.code ?? ""}`.trim(), cart: `${cart.amount} ${cart.code ?? ""}`.trim() };
  if (bar.code !== cart.code) return unverified(`The bar and the cart name different currencies (${facts.bar} vs ${facts.cart}).`, facts);
  if (bar.amount === cart.amount) return pass(`The top bar and the cart both put free shipping at ${facts.bar}.`, facts, `الشريط العلوي والسلة يحددان الشحن المجاني عند ${facts.bar}.`);
  return fail(`The top bar promises free shipping from ${facts.bar}, but the cart says ${facts.cart}.`, facts, `الشريط العلوي يعد بالشحن المجاني من ${facts.bar}، لكن السلة تقول ${facts.cart}.`);
};

// ---- OFFER-11: bundle saving stated ----
const BUNDLE = /bundle|\bpack\b|set of|\d\s*(x|for|pcs|pieces)\b|buy \d|عبوات|عبوة|باقة|بكج|اشتر \d|قطع/i;
const SAVING = /save\s*\d|\d+\s*%|%\s*\d+|وفر|خصم\s*\d|توفير/i;
const offer11: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p?.cta) return unverified("The product page or its Add to Cart button wasn't found.");
  const b = within(p, 600).find(x => BUNDLE.test(x.text) && SAVING.test(x.text));
  if (b) return pass(`Near the ${quote(p.cta.text)} button: ${quote(b.text)}.`, { block: b.id }, `قرب زر ${qa(p.cta.text)}: ${qa(b.text)}.`);
  return unverified("No bundle offer with a stated saving was found in the text near the buy button; the store may sell no bundles.");
};

// ---- TRUST-21: press, certification or partner logos ----
const BADGE = /certif|halal|\biso\b|sfda|haccp|\bfda\b|as seen|featured in|award|معتمد|حلال|هيئة الغذاء|الغذاء والدواء|ايزو|آيزو|شهادة|جائزة|فحوصات حكومية/i;
const trust21: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const h = page(e, "home");
  if (!h) return unverified("The home page didn't load.");
  const b = h.blocks.find(x => BADGE.test(x.text));
  if (b) return pass(`The home page shows ${quote(b.text)}.`, { block: b.id }, `الصفحة الرئيسية تعرض ${qa(b.text)}.`);
  return unverified("No press, certification or partner name was found in the home page's text or image alt text; logos without alt text need a look.");
};

// ---- PATH-10: express pay buttons ----
const EXPRESS = /apple ?pay|google ?pay|shop ?pay|paypal|gpay/i;
const path10: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  for (const c of cartViews(e).filter(x => x.cta)) {
    const b = nearCta(c).find(x => EXPRESS.test(x.text) && x.tag !== "img");
    if (b) return pass(`Next to the cart's ${quote(c.cta!.text)} button: ${quote(b.text)}.`, { block: b.id }, `بجانب زر ${qa(c.cta!.text)} في السلة: ${qa(b.text)}.`);
  }
  return unverified("No express pay button was found next to the cart's checkout button. Headless browsers often miss Apple Pay and late-loading frames, so absence proves nothing.");
};

// ---- RISK-11: body text readable on phone ----
const risk11: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const seen = e.pages.filter(p => p.loaded && p.facts && p.facts.bodyText !== undefined && ["home", "product", "collection"].includes(p.pageType));
  if (!seen.length) return unverified("Body text size wasn't read this run.");
  const read = seen.filter(p => p.facts!.bodyText);
  if (!read.length) return unverified("No body paragraphs were found on the home, product or collection page.");
  const sizes = read.map(p => `${p.pageType}: ${p.facts!.bodyText!.fs}px`);
  const small = read.filter(p => p.facts!.bodyText!.fs < 16);
  if (small.length) return fail(`Body text is under 16px on the phone: ${small.map(p => `${p.pageType} page ${p.facts!.bodyText!.fs}px`).join(", ")}.`, { sizes }, `حجم نص المحتوى أقل من 16px على الجوال: ${small.map(p => `${PT_AR[p.pageType]} ${p.facts!.bodyText!.fs}px`).join("، ")}.`);
  const low: string[] = [];
  for (const p of read) {
    const c = p.facts!.bodyText!.color;
    if (!c || c.bgComplex) return unverified(`Body text is 16px or larger (${sizes.join(", ")}), but on the ${p.pageType} page it sits on a picture or gradient, so contrast can't be computed.`, { sizes });
    const fg = parseRgb(c.fg), bg = parseRgb(c.bg);
    if (!fg || !bg) return unverified("Body text colours couldn't be read.", { sizes });
    const ratio = Math.round(contrast(fg, bg) * 10) / 10;
    if (ratio < 4.5) low.push(`${p.pageType} page ${ratio}:1`);
  }
  if (low.length) return fail(`Body text contrast is under 4.5:1: ${low.join(", ")}.`, { sizes }, `تباين نص المحتوى أقل من 4.5:1 (${low.length} صفحة).`);
  return pass(`Body text is 16px or larger (${sizes.join(", ")}) with at least 4.5:1 contrast.`, { sizes }, `نص المحتوى بحجم 16px أو أكبر، وتباينه 4.5:1 على الأقل.`);
};

// ---- OFFER-23: delivery time, with the free-shipping threshold below it ----
const offer23: Rule = ({ evidence: e }) => {
  if (!e) return noVisit;
  const p = page(e, "product");
  if (!p?.cta) return unverified("The product page or its Add to Cart button wasn't found.");
  const near = within(p, 600);
  const t = near.find(deliveryTime);
  const f = t && near.find(b => b.box.y >= t.box.y && FREE_SHIP.test(b.text) && moneyAmounts(normalize(b.text)).length > 0);
  if (t && f) return pass(`Near the buy button: ${quote(t.text)}, then ${quote(f.text)}.`, { time: t.id, threshold: f.id }, `قرب زر الشراء: ${qa(t.text)}، ثم ${qa(f.text)}.`);
  return unverified(t ? `A delivery time shows (${quote(t.text)}), but no free-shipping threshold was found below it.` : "No delivery time was found in the text near the buy button.");
};

export const MIXED_RULES: Record<string, Rule> = {
  "PATH-01": path01,
  "PATH-04": path04,
  "PATH-05": path05,
  "PATH-09": path09,
  "PDP-04": pdp04,
  "PDP-13": pdp13,
  "NAV-08": nav08,
  "TRUST-01": trust01,
  "TRUST-04": trust04,
  "TRUST-05": trust05,
  "TRUST-06": trust06,
  "TRUST-07": trust07,
  "TRUST-08": trust08,
  "TRUST-11": trust11,
  "TRUST-12": trust12,
  "OFFER-01": offer01,
  "OFFER-05": offer05,
  "OFFER-07": offer07,
  "OFFER-09": offer09,
  "OFFER-17": offer17,
  "OFFER-20": offer20,
  "OFFER-22": offer22,
  "OFFER-24": offer24,
  "LAND-03": land03,
  "LAND-07": land07,
  "LAND-09": land09,
  "SEO-06": seo06,
  "TRK-26": trk26,
  "TRK-44": trk44,
  "COL-07": col07,
  "RISK-05": risk05,
  "TRK-15": trk15,
  "RISK-01": risk01,
  "SPEED-08": speed08,
  "NAV-12": nav12,
  "HOME-09": home09,
  "OFFER-10": offer10,
  "OFFER-11": offer11,
  "TRUST-21": trust21,
  "PATH-10": path10,
  "RISK-11": risk11,
  "OFFER-23": offer23,
};
