import type { FudPageType, Ga4FunnelEvent } from "../types.js";
import { pageOf, type PageEvidence, type StoreEvidence } from "./evidence.js";
import { anyBlock, hasWidget, matches, nearCta, pageText, type PatternKey } from "./signals.js";
import { CRO_RULES } from "./rules-cro.js";

/**
 * The v1 rule set: storefront-detectable FUD checks (PRD categories A–D).
 * Category E (surveys, review mining, behavioural signals) needs connectors
 * the free audit doesn't have, so it isn't run at all rather than shown as
 * a block of "not assessed" rows. B2/B3/C2 are left out of v1 on purpose
 * (health claims, review text, claim substantiation — see the design doc).
 *
 * Bump RULE_SET_VERSION whenever a rule's wording, signal or defaults change
 * — every finding carries it, so results stay comparable over time.
 */
export const RULE_SET_VERSION = "fud-2.0.0";

/**
 * Deterministic second opinion on one rule (score.ts's gate):
 * - present: the thing is there, where it should be
 * - elsewhere: it exists, but not where the shopper needs it
 * - absent: nothing on the page(s) the rule looks at
 * - unknown: the detectors can't tell (judgement-only rule, or no page)
 */
export type SignalState = "present" | "elsewhere" | "absent" | "unknown";

// Where a rule sits in the report and the judge's batches.
export type FudGroup = "trust" | "homepage" | "product" | "navigation" | "collection" | "buy_more" | "buy_again" | "local" | "popups";

export interface FudRule {
  id: string;
  // Defaults to "trust" (the original purchase-friction rules).
  group?: FudGroup;
  // The page whose URL and crop the finding is shown with.
  pageType: FudPageType;
  // Every page the rule needs; if none of them loaded, it's UNASSESSED.
  needs: FudPageType[];
  crop: "fold" | "cta" | "cart";
  title: { en: string; ar: string };
  // What the judge must decide, and what each status means for this rule.
  question: string;
  pass: string;
  warn: string;
  fail: string;
  // PEXTI defaults (1-5). The judge may lower E/C/T by 1, never raise.
  E: number;
  C: number;
  T: number;
  I: number;
  // GA4 step this rule's friction shows up in, for proof/impact.
  funnel: { from: Ga4FunnelEvent; to: Ga4FunnelEvent } | null;
  // false = never shown as FAIL, at most WARN (can't be verified well enough).
  autoFail: boolean;
  // The answer depends on where things sit on the page, so it can differ
  // between a phone and a desktop screen (index.ts's desktop comparison).
  layout?: boolean;
  // Only evaluated when this returns true (e.g. size guide only for products
  // that come in sizes). Absent = always applicable.
  applies?: (e: StoreEvidence) => boolean;
  signal: (e: StoreEvidence) => SignalState;
}

const ATC_TO_CHECKOUT = { from: "add_to_cart", to: "begin_checkout" } as const;
const VIEW_TO_ATC = { from: "view_item", to: "add_to_cart" } as const;

function has(page: PageEvidence | undefined, key: PatternKey): boolean {
  return page ? matches(key, pageText(page)) : false;
}

function nearCtaHas(page: PageEvidence | undefined, keys: PatternKey[]): boolean {
  const near = nearCta(page);
  return near.some(b => keys.some(k => matches(k, b.text)));
}

/** Cart evidence that actually holds the added item; empty carts can't be judged. */
function usableCart(e: StoreEvidence): PageEvidence | undefined {
  const cart = pageOf(e, "cart");
  return cart && !cart.cart?.empty ? cart : undefined;
}

const TRUST_RULES: FudRule[] = [
  {
    id: "A1",
    pageType: "cart",
    needs: ["product", "cart"],
    crop: "cart",
    title: { en: "Shipping cost shown before checkout", ar: "تكلفة الشحن ظاهرة قبل إتمام الشراء" },
    question: "Can a shopper learn what shipping costs (a fee, or the free-shipping threshold) on the product page AND in the cart, before reaching checkout? A dynamic 'add X more for free shipping' message in the cart is the strongest form.",
    pass: "Shipping fee or free-shipping threshold is stated on the product page and in the cart (ideally with a progress message in the cart).",
    warn: "Shown in only one of the two places, or only in a header bar / policy page, or the wording is vague ('fast shipping') with no cost.",
    fail: "No shipping cost or threshold anywhere on the product page or cart — the first time the shopper sees it is checkout.",
    E: 4, C: 5, T: 5, I: 4,
    funnel: ATC_TO_CHECKOUT,
    autoFail: true,
    signal: e => {
      const product = pageOf(e, "product");
      const cart = usableCart(e);
      const cost = (p?: PageEvidence) => has(p, "shippingThreshold") || has(p, "shippingFee") || has(p, "freeShipping");
      if (!product && !cart) return "unknown";
      const inProduct = cost(product);
      const inCart = cost(cart);
      if (inProduct && inCart) return "present";
      if (inProduct || inCart) return "elsewhere";
      return "absent";
    },
  },
  {
    id: "A2",
    layout: true,
    pageType: "product",
    needs: ["product"],
    crop: "cta",
    title: { en: "Price backed by reasons to pay it", ar: "السعر مدعوم بأسباب مقنعة" },
    question: "Near the price and the Add-to-Cart button, does the product page give concrete reasons the price is worth it — material/ingredient quality, origin, certifications, what's included, a comparison or saving?",
    pass: "Specific value reasons (quality, origin, certification, what's included, saving) sit next to the price or CTA.",
    warn: "Value reasons exist but are far from the price (deep in the description), or are generic ('best quality').",
    fail: "Nothing on the page explains why the product costs what it does.",
    E: 4, C: 5, T: 4, I: 3,
    funnel: VIEW_TO_ATC,
    autoFail: false,
    signal: e => {
      const product = pageOf(e, "product");
      if (!product) return "unknown";
      if (nearCtaHas(product, ["priceJustification"])) return "present";
      return has(product, "priceJustification") ? "elsewhere" : "unknown";
    },
  },
  {
    id: "A3",
    pageType: "cart",
    needs: ["cart"],
    crop: "cart",
    title: { en: "Cart shows the full cost clearly", ar: "السلة تعرض التكلفة كاملة بوضوح" },
    question: "With an item in it, does the cart show the subtotal, how shipping will be charged (estimate, 'free', or 'calculated at checkout'), tax treatment where relevant, and where to enter a discount code?",
    pass: "Subtotal plus clear shipping handling, and a discount field or note, before the checkout button.",
    warn: "Subtotal shown but shipping is only 'calculated at checkout' with no estimate or threshold, or no discount entry.",
    fail: "Only a bare total with no word on shipping or tax at all.",
    E: 3, C: 4, T: 4, I: 4,
    funnel: ATC_TO_CHECKOUT,
    autoFail: true,
    signal: e => {
      const cart = usableCart(e);
      if (!cart) return "unknown";
      const subtotal = has(cart, "subtotal");
      const shipping = has(cart, "shippingWord");
      if (subtotal && shipping) return "present";
      if (subtotal || shipping) return "elsewhere";
      return "absent";
    },
  },
  {
    id: "A4",
    layout: true,
    pageType: "product",
    needs: ["product"],
    crop: "cta",
    title: { en: "Installments or cash on delivery visible", ar: "التقسيط أو الدفع عند الاستلام ظاهر" },
    question: "Does the shopper see a way to lower the payment risk or split the cost — cash on delivery, or installments (Tabby, Tamara, valU, Sympl, Souhoola, Shop Pay Installments…) — near the price, the CTA, or in the cart?",
    pass: "COD or an installment option is shown near the price/CTA or in the cart.",
    warn: "Only mentioned in the footer, FAQ, or as a payment logo at checkout.",
    fail: "No cash on delivery or installment option is mentioned before checkout.",
    E: 3, C: 3, T: 3, I: 4,
    funnel: VIEW_TO_ATC,
    autoFail: true,
    signal: e => {
      const product = pageOf(e, "product");
      const cart = usableCart(e);
      if (!product) return "unknown";
      const keys: PatternKey[] = ["cod", "installments"];
      if (nearCtaHas(product, keys) || hasWidget(product, "installments")) return "present";
      if (keys.some(k => has(product, k) || has(cart, k)) || hasWidget(cart, "installments")) return "elsewhere";
      return "absent";
    },
  },
  {
    id: "B1",
    layout: true,
    pageType: "product",
    needs: ["product"],
    crop: "cta",
    title: { en: "Returns or guarantee next to the button", ar: "سياسة الاسترجاع أو الضمان بجانب زر الشراء" },
    question: "Is there risk-reversal wording — returns/exchange window, money-back guarantee, or cash on delivery — right by the Add-to-Cart button, and is it consistent with the store's policy links?",
    pass: "Return/exchange window, guarantee or COD stated within reach of the CTA.",
    warn: "Only in the footer, FAQ or a policy page; or vague ('easy returns') with no window.",
    fail: "No return, exchange, guarantee or COD wording on the product page at all.",
    E: 5, C: 5, T: 5, I: 4,
    funnel: VIEW_TO_ATC,
    autoFail: true,
    signal: e => {
      const product = pageOf(e, "product");
      if (!product) return "unknown";
      const keys: PatternKey[] = ["returns", "cod"];
      if (nearCtaHas(product, keys)) return "present";
      if (keys.some(k => has(product, k)) || product.policyLinks.some(l => l.kind === "returns")) return "elsewhere";
      return "absent";
    },
  },
  {
    id: "B4",
    layout: true,
    pageType: "product",
    needs: ["product"],
    crop: "cta",
    title: { en: "Size help next to the size choice", ar: "مساعدة اختيار المقاس بجانب المقاسات" },
    question: "For a product sold in sizes: are sizes one-tap choices (pills/buttons) and is a size guide or fit note right next to them?",
    pass: "Size pills plus a size guide/fit note adjacent to the selector.",
    warn: "Size guide exists but is far from the selector or hidden in a tab; or sizes are a dropdown.",
    fail: "Sizes offered with no size guide or fit information anywhere on the page.",
    E: 4, C: 4, T: 4, I: 4,
    funnel: VIEW_TO_ATC,
    autoFail: true,
    applies: e => Boolean(pageOf(e, "product")?.variants?.hasSize),
    signal: e => {
      const product = pageOf(e, "product");
      if (!product) return "unknown";
      if (nearCtaHas(product, ["sizeGuide"])) return product.variants?.control === "pills" ? "present" : "elsewhere";
      return has(product, "sizeGuide") ? "elsewhere" : "absent";
    },
  },
  {
    id: "B5",
    layout: true,
    pageType: "product",
    needs: ["product"],
    crop: "cta",
    title: { en: "Stock and delivery time near the button", ar: "التوفر ووقت التوصيل بجانب زر الشراء" },
    question: "Near the CTA, does the shopper see availability (in stock / low stock) and when the order will arrive (days or a date)?",
    pass: "Both availability and a delivery time/date are visible near the CTA.",
    warn: "Only one of the two, or delivery time only in a policy page.",
    fail: "Neither availability nor any delivery time on the product page.",
    E: 4, C: 5, T: 4, I: 3,
    funnel: VIEW_TO_ATC,
    autoFail: true,
    signal: e => {
      const product = pageOf(e, "product");
      if (!product) return "unknown";
      const near = nearCtaHas(product, ["deliveryTime"]);
      const stockNear = nearCtaHas(product, ["stock"]) || Boolean(product.jsonLd.availability);
      if (near && stockNear) return "present";
      if (near || has(product, "deliveryTime") || has(product, "stock")) return "elsewhere";
      return "absent";
    },
  },
  {
    id: "C1",
    layout: true,
    pageType: "product",
    needs: ["home", "product"],
    crop: "fold",
    title: { en: "Social proof on the first screen", ar: "دليل اجتماعي في أول شاشة" },
    question: "On the first mobile screen of the homepage and of the product page, is there credible proof others bought and liked it — star rating with a review count, customer count, press logos?",
    pass: "Rating with review count (or equivalent proof) visible on the first screen of the product page, and some proof on the homepage's first screen.",
    warn: "Proof exists but only further down the page, or on only one of the two pages, or a rating with no count.",
    fail: "No reviews, ratings or social proof anywhere on the homepage or product page.",
    E: 4, C: 4, T: 4, I: 4,
    funnel: VIEW_TO_ATC,
    autoFail: true,
    signal: e => {
      const home = pageOf(e, "home");
      const product = pageOf(e, "product");
      if (!home && !product) return "unknown";
      const fold = (p?: PageEvidence) => Boolean(p && anyBlock(p.blocks.filter(b => b.aboveFold), "reviews").length);
      if (fold(product) && fold(home)) return "present";
      const anywhere = [home, product].some(p => has(p, "reviews") || hasWidget(p, "reviews") || Boolean(p?.jsonLd.ratingValue));
      if (fold(product) || fold(home) || anywhere) return "elsewhere";
      return "absent";
    },
  },
  {
    id: "C3",
    pageType: "product",
    needs: ["product"],
    crop: "fold",
    title: { en: "Reviews look real", ar: "التقييمات تبدو حقيقية" },
    question: "Do the product's reviews carry signs they're genuine — a review platform, 'verified buyer' marks, customer photos/videos, dates, a realistic mix of ratings?",
    pass: "Reviews from a review app/platform with verified marks or customer photos.",
    warn: "Reviews exist but are plain text testimonials with no source, dates or photos.",
    fail: "The product page has no reviews at all.",
    E: 3, C: 3, T: 3, I: 3,
    funnel: VIEW_TO_ATC,
    autoFail: true,
    signal: e => {
      const product = pageOf(e, "product");
      if (!product) return "unknown";
      const platform = hasWidget(product, "reviews");
      if (platform && has(product, "verified")) return "present";
      if (platform || has(product, "reviews") || product.jsonLd.reviewCount) return "elsewhere";
      return "absent";
    },
  },
  {
    id: "C4",
    pageType: "home",
    needs: ["home"],
    crop: "fold",
    title: { en: "Trust badges you can check", ar: "شارات ثقة يمكن التحقق منها" },
    question: "Are certifications, press mentions or trust badges shown, and do they link to or explain something verifiable? Decorative badges with no source are weak.",
    pass: "Badges/press logos that link to real coverage or name a real certifying body.",
    warn: "Badges or logos present but unlinked/unverifiable, or none at all (this rule never fails — badges are optional).",
    fail: "(not used — this rule is WARN at most)",
    E: 4, C: 4, T: 4, I: 2,
    funnel: null,
    autoFail: false,
    signal: () => "unknown",
  },
  {
    id: "C5",
    pageType: "home",
    needs: ["home"],
    crop: "fold",
    title: { en: "A real business behind the store", ar: "نشاط تجاري حقيقي خلف المتجر" },
    question: "Can a shopper see who runs the store — an About/Our story page, founder or team, a physical address or real contact details — rather than a faceless shop?",
    pass: "About/story content plus real contact details (phone, address, named support).",
    warn: "Contact form or email only, no story or identity; or an About page that says nothing specific.",
    fail: "No About page and no contact details anywhere.",
    E: 3, C: 5, T: 3, I: 3,
    funnel: null,
    autoFail: true,
    signal: e => {
      const home = pageOf(e, "home");
      if (!home) return "unknown";
      const about = home.policyLinks.some(l => l.kind === "about") || has(home, "aboutWord");
      const contact = home.policyLinks.some(l => l.kind === "contact") || has(home, "phone") || has(home, "support");
      if (about && contact) return "present";
      if (about || contact) return "elsewhere";
      return "absent";
    },
  },
  {
    id: "D1",
    layout: true,
    pageType: "product",
    needs: ["product"],
    crop: "cta",
    title: { en: "Reassurance right under the button", ar: "عبارات طمأنة أسفل زر الشراء مباشرة" },
    question: "Directly around the Add-to-Cart button, is there short reassurance copy answering last-second doubts — free/fast shipping, returns, COD, secure payment?",
    pass: "One or more short reassurance lines sit directly by the CTA.",
    warn: "Reassurance exists on the page but is visually separated from the CTA.",
    fail: "Nothing reassuring near the CTA and nothing elsewhere on the page.",
    E: 5, C: 5, T: 5, I: 4,
    funnel: VIEW_TO_ATC,
    autoFail: true,
    signal: e => {
      const product = pageOf(e, "product");
      if (!product?.cta) return "unknown";
      const keys: PatternKey[] = ["freeShipping", "returns", "cod", "secure", "deliveryTime"];
      if (nearCtaHas(product, keys)) return "present";
      return keys.some(k => has(product, k)) ? "elsewhere" : "absent";
    },
  },
  {
    id: "D2",
    pageType: "cart",
    needs: ["cart"],
    crop: "cart",
    title: { en: "Trust signals in the cart", ar: "إشارات الثقة داخل السلة" },
    question: "In the cart, next to the checkout button, are accepted payment methods (logos or names), secure-payment or return reassurance shown, with one clear checkout action?",
    pass: "Payment methods plus a security or returns line beside a clear checkout button.",
    warn: "Only one of these, or a decorative lock icon with no words.",
    fail: "No payment, security or returns information in the cart at all.",
    E: 4, C: 5, T: 5, I: 4,
    funnel: ATC_TO_CHECKOUT,
    autoFail: true,
    signal: e => {
      const cart = usableCart(e);
      if (!cart) return "unknown";
      const payment = has(cart, "paymentNames");
      const reassurance = has(cart, "secure") || has(cart, "returns") || has(cart, "cod");
      if (payment && reassurance) return "present";
      if (payment || reassurance) return "elsewhere";
      return "absent";
    },
  },
  {
    id: "D3",
    layout: true,
    pageType: "product",
    needs: ["home", "product"],
    crop: "fold",
    title: { en: "Easy to reach a person", ar: "سهولة الوصول إلى شخص حقيقي" },
    question: "Can a shopper with a question reach a human quickly from the product page — WhatsApp, live chat, a phone number — ideally with an expected response time?",
    pass: "WhatsApp/chat/phone reachable from the product page.",
    warn: "Only a contact page or email, or support exists on the homepage but not the product page.",
    fail: "No way to contact the store from the homepage or product page.",
    E: 3, C: 3, T: 4, I: 3,
    funnel: null,
    autoFail: true,
    signal: e => {
      const home = pageOf(e, "home");
      const product = pageOf(e, "product");
      if (!home && !product) return "unknown";
      const reachable = (p?: PageEvidence) => hasWidget(p, "support") || has(p, "phone") || (p ? /whatsapp|واتساب|wa\.me/i.test(pageText(p)) : false);
      if (reachable(product)) return "present";
      if (reachable(home) || [home, product].some(p => has(p, "support") || p?.policyLinks.some(l => l.kind === "contact"))) return "elsewhere";
      return "absent";
    },
  },
  {
    id: "C6",
    group: "collection",
    pageType: "collection",
    needs: ["collection"],
    crop: "fold",
    title: { en: "Product cards show price and proof", ar: "بطاقات المنتجات تعرض السعر والتقييم" },
    question: "On the collection page, does each product card give a shopper enough to choose — a clear price, a star rating with a review count, and useful tags (bestseller, sale, key benefit)?",
    pass: "Cards show a clear price and most show a rating with a count; tags help where relevant.",
    warn: "Price is there but no ratings on the cards (even though the store has reviews), or cards are inconsistent.",
    fail: "(not used — this rule is WARN at most)",
    E: 3, C: 4, T: 3, I: 3,
    funnel: null,
    autoFail: false,
    applies: e => (pageOf(e, "collection")?.listing?.cards ?? 0) >= 4,
    signal: e => {
      const l = pageOf(e, "collection")?.listing;
      if (!l) return "unknown";
      const price = l.withPrice / l.cards >= 0.8;
      const rating = l.withRating / l.cards >= 0.5;
      if (price && rating) return "present";
      return price ? "elsewhere" : "absent";
    },
  },
  {
    id: "D4",
    group: "collection",
    pageType: "collection",
    needs: ["collection"],
    crop: "fold",
    title: { en: "Easy to narrow down the products", ar: "سهولة تضييق اختيار المنتجات" },
    question: "With this many products, can a phone shopper narrow them down quickly — filter, sort, or one-tap category pills above the grid — without opening the main menu?",
    pass: "Filter and/or sort controls, or category pills, are visible above the product grid.",
    warn: "Only one weak control (e.g. sort hidden in a dropdown), or controls exist but sit below the fold.",
    fail: "A long product list with no filter, sort or category shortcuts at all.",
    E: 3, C: 4, T: 3, I: 3,
    funnel: null,
    autoFail: true,
    // A short catalogue doesn't need filters.
    applies: e => (pageOf(e, "collection")?.listing?.cards ?? 0) >= 12,
    signal: e => {
      const l = pageOf(e, "collection")?.listing;
      if (!l) return "unknown";
      const controls = Number(l.hasFilter) + Number(l.hasSort) + Number(l.pills >= 3);
      if (controls >= 2) return "present";
      return controls === 1 ? "elsewhere" : "absent";
    },
  },
  {
    id: "D5",
    group: "collection",
    pageType: "collection",
    needs: ["collection"],
    crop: "fold",
    title: { en: "Quick-add buttons say the same thing", ar: "أزرار الإضافة السريعة موحّدة" },
    question: "Do the quick-add buttons on the product cards use one consistent label and behave predictably (e.g. always 'Add to cart', or always 'Choose options' for products with variants)?",
    pass: "One label (or a clear two-label split between simple and variant products).",
    warn: "Three or more different labels across cards, or labels that don't say what will happen.",
    fail: "(not used — this rule is WARN at most)",
    E: 5, C: 5, T: 5, I: 2,
    funnel: null,
    autoFail: false,
    applies: e => (pageOf(e, "collection")?.listing?.quickAdd ?? 0) >= 3,
    signal: e => {
      const l = pageOf(e, "collection")?.listing;
      if (!l || l.quickAdd === 0) return "unknown";
      return l.quickAddLabels.length <= 2 ? "present" : "elsewhere";
    },
  },
];

export const FUD_RULES: FudRule[] = [...TRUST_RULES, ...CRO_RULES];

export function groupOf(rule: Pick<FudRule, "group">): FudGroup {
  return rule.group ?? "trust";
}

export function ruleById(id: string): FudRule | undefined {
  return FUD_RULES.find(r => r.id === id);
}
