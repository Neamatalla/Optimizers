import { pageOf, type PageEvidence, type StoreEvidence } from "./evidence.js";
import type { FudRule } from "./rules.js";
import { hasWidget, matches, nearCta, normalize, pageText, type PatternKey } from "./signals.js";

/**
 * The CRO rules beyond trust and cost (added in rule set fud-2.0.0; the
 * landing-page framework rules H3-H6, P5-P12, K1, G1-G2 in fud-2.1.0):
 * homepage clarity, product page layout, navigation and search, buy-more
 * (order value), buy-again (repeat purchases), local-market fit and popups.
 * Same contract as rules.ts: the judge proposes, the detectors here are the
 * second opinion score.ts gates with. Most of these are "opportunity" rules,
 * so they never auto-FAIL (autoFail: false) — at worst they show as a
 * warning with a fix.
 */

function has(page: PageEvidence | undefined, key: PatternKey): boolean {
  return page ? matches(key, pageText(page)) : false;
}

/** Desktop version of a page if the desktop visit loaded it. */
function desktopOf(e: StoreEvidence, type: "home" | "product"): PageEvidence | undefined {
  return e.desktop?.find(p => p.pageType === type && p.loaded);
}

/** First number after a free-shipping phrase, e.g. 1399 from "شحن مجاني من ١٣٩٩ جنيه". */
export function freeShippingThreshold(e: StoreEvidence): number | null {
  for (const type of ["product", "cart", "home"] as const) {
    const p = pageOf(e, type);
    if (!p) continue;
    for (const b of p.blocks) {
      const t = normalize(b.text);
      if (!matches("freeShipping", t) && !matches("shippingThreshold", t)) continue;
      const nums = (t.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map(n => Number(n.replace(/,/g, ""))).filter(n => n >= 50 && n <= 100000);
      if (nums.length) return Math.max(...nums);
    }
  }
  return null;
}

export const CRO_RULES: FudRule[] = [
  // ---- homepage --------------------------------------------------------------
  {
    id: "H1",
    group: "homepage",
    pageType: "home",
    needs: ["home"],
    crop: "fold",
    layout: true,
    title: { en: "Homepage says what you sell in 3 seconds", ar: "الصفحة الرئيسية توضح ما تبيعه في 3 ثوانٍ" },
    question: "The '3-second test' on the homepage's first phone screen: can a first-time visitor tell what this store sells and why it is better, from a clear benefit headline — not a vague slogan, a carousel of sale banners, or an image with no words? Note whether the main image looks like an authentic product photo or generic stock.",
    pass: "A specific headline (what + benefit) and the product visible on the first screen.",
    warn: "The first screen is mostly an image or banner with a generic slogan, or the offer is only clear after scrolling.",
    fail: "(not used — this rule is WARN at most)",
    E: 4, C: 4, T: 4, I: 4,
    funnel: null,
    autoFail: false,
    signal: e => {
      const home = pageOf(e, "home");
      if (!home) return "unknown";
      if (home.facts?.hero && matches("stockPhoto", home.facts.hero.src)) return "elsewhere";
      const foldText = home.blocks.filter(b => b.aboveFold && b.tag !== "img" && b.text.length >= 12);
      return foldText.length === 0 ? "absent" : "unknown";
    },
  },
  {
    id: "H2",
    group: "homepage",
    pageType: "home",
    needs: ["home"],
    crop: "fold",
    layout: true,
    title: { en: "One clear next step on the first screen", ar: "خطوة تالية واضحة في أول شاشة" },
    question: "Is there one obvious primary button on the homepage's first phone screen (e.g. 'Shop bestsellers', 'تسوقي الآن'), so the visitor knows what to click next?",
    pass: "A visible, high-contrast primary button on the first screen.",
    warn: "Several competing buttons, or the only next step is a small text link or the menu.",
    fail: "No button or link to products anywhere on the first screen.",
    E: 5, C: 5, T: 5, I: 3,
    funnel: null,
    autoFail: true,
    signal: e => {
      const home = pageOf(e, "home");
      if (!home?.facts) return "unknown";
      const n = home.facts.heroButtons.length;
      if (n === 1 || n === 2) return "present";
      return n === 0 ? "absent" : "elsewhere";
    },
  },
  // ---- product page ------------------------------------------------------------
  {
    id: "P1",
    group: "product",
    pageType: "product",
    needs: ["product"],
    crop: "fold",
    layout: true,
    title: { en: "Enough product photos and video", ar: "صور وفيديو كافيان للمنتج" },
    question: "Does the product page give shoppers enough to judge the product without touching it: several photos (different angles, in use, scale, details), ideally a video, and zoom?",
    pass: "4+ product images, plus video or zoom.",
    warn: "Only 1-3 images, or no in-use / scale shots.",
    fail: "(not used — this rule is WARN at most)",
    E: 3, C: 3, T: 3, I: 4,
    funnel: { from: "view_item", to: "add_to_cart" },
    autoFail: false,
    signal: e => {
      const m = pageOf(e, "product")?.facts?.media;
      if (!m) return "unknown";
      if (m.images >= 4 && (m.video || m.zoom)) return "present";
      return m.images >= 4 ? "elsewhere" : m.images <= 2 ? "absent" : "elsewhere";
    },
  },
  {
    id: "P2",
    group: "product",
    pageType: "product",
    needs: ["product"],
    crop: "cta",
    layout: true,
    title: { en: "Options are one-tap buttons", ar: "الخيارات أزرار بضغطة واحدة" },
    question: "Where the product comes in options (size, colour, flavour, volume), are they shown as one-tap buttons/swatches with the selected one clearly marked, rather than a dropdown?",
    pass: "Buttons or swatches for every option, with a clear selected state.",
    warn: "A dropdown, or buttons with no clear selected state.",
    fail: "Options exist but are hidden behind a dropdown with no labels shown.",
    E: 4, C: 4, T: 4, I: 3,
    funnel: { from: "view_item", to: "add_to_cart" },
    autoFail: false,
    applies: e => (pageOf(e, "product")?.variants?.groups.length ?? 0) > 0,
    signal: e => {
      const v = pageOf(e, "product")?.variants;
      if (!v) return "unknown";
      return v.control === "pills" ? "present" : v.control === "dropdown" ? "absent" : "unknown";
    },
  },
  {
    id: "P3",
    group: "product",
    pageType: "product",
    needs: ["product"],
    crop: "cta",
    title: { en: "Buy button stays on screen while scrolling", ar: "زر الشراء يبقى ظاهرًا أثناء التمرير" },
    question: "On a phone, after the shopper scrolls down through photos, description and reviews, is a buy button still within reach (a sticky add-to-cart bar)?",
    pass: "A sticky add-to-cart bar appears once the main button scrolls away.",
    warn: "(use pass or fail)",
    fail: "No buy button on screen after scrolling past the main one.",
    E: 3, C: 4, T: 4, I: 4,
    funnel: { from: "view_item", to: "add_to_cart" },
    autoFail: true,
    applies: e => Boolean(pageOf(e, "product")?.cta),
    signal: e => {
      const p = pageOf(e, "product");
      if (!p || p.sticky === undefined) return "unknown";
      return p.sticky ? "present" : "absent";
    },
  },
  {
    id: "P4",
    group: "product",
    pageType: "product",
    needs: ["product"],
    crop: "cta",
    title: { en: "Product details are easy to scan", ar: "تفاصيل المنتج سهلة التصفح" },
    question: "Is the product information organised into short labelled sections (benefits, how to use, ingredients/materials, shipping, FAQ — tabs or expandable sections) rather than one long block of text?",
    pass: "Clear labelled sections or tabs covering the main questions.",
    warn: "Some structure, but key questions (how to use, ingredients/size, delivery) are missing or buried in one long paragraph.",
    fail: "(not used — this rule is WARN at most)",
    E: 4, C: 5, T: 4, I: 3,
    funnel: { from: "view_item", to: "add_to_cart" },
    autoFail: false,
    signal: e => {
      const f = pageOf(e, "product")?.facts?.infoSections;
      if (!f) return "unknown";
      return f.details + f.expanders >= 3 ? "present" : f.details + f.expanders > 0 ? "elsewhere" : "unknown";
    },
  },
  // ---- navigation & search -----------------------------------------------------
  {
    id: "N1",
    group: "navigation",
    pageType: "home",
    needs: ["home"],
    crop: "fold",
    title: { en: "Menu is short and specific", ar: "القائمة قصيرة وواضحة" },
    question: "Looking at the store's top menu (desktop labels are listed in the evidence): are there 5 or fewer top-level items, with specific category names shoppers recognise (e.g. 'Hair oils', 'زيوت الشعر') rather than generic ones ('Products', 'Shop', 'Collections')?",
    pass: "5 or fewer top-level items, mostly specific category names.",
    warn: "More than 5 top-level items, or mostly generic labels that don't say what's inside.",
    fail: "(not used — this rule is WARN at most)",
    E: 4, C: 5, T: 4, I: 3,
    funnel: null,
    autoFail: false,
    applies: e => (desktopOf(e, "home")?.facts?.nav.length ?? pageOf(e, "home")?.facts?.nav.length ?? 0) > 0,
    signal: e => {
      const nav = desktopOf(e, "home")?.facts?.nav ?? pageOf(e, "home")?.facts?.nav ?? [];
      if (nav.length === 0) return "unknown";
      return nav.length <= 5 ? "present" : "elsewhere";
    },
  },
  {
    id: "N2",
    group: "navigation",
    pageType: "home",
    needs: ["home"],
    crop: "fold",
    title: { en: "Search is easy to find and finds products", ar: "البحث سهل الوصول ويعرض نتائج" },
    question: "Is there a visible search on the phone, and did our test search (a word from the product's own name — see the evidence) return that kind of product?",
    pass: "Search visible on the first screen and the test search found products.",
    warn: "Search exists but is hidden in the menu, or the test search returned nothing for a product the store sells.",
    fail: "No search on the site at all.",
    E: 3, C: 4, T: 3, I: 3,
    funnel: null,
    autoFail: true,
    signal: e => {
      const s = pageOf(e, "home")?.facts?.search;
      if (!s) return "unknown";
      if (!s.present) return "absent";
      const t = e.searchTest;
      if (t && t.loaded && t.results === 0) return "elsewhere";
      return s.visible && (!t || t.results > 0) ? "present" : "elsewhere";
    },
  },
  // ---- buy more (order value) ---------------------------------------------------
  {
    id: "M1",
    group: "buy_more",
    pageType: "product",
    needs: ["product"],
    crop: "cta",
    layout: true,
    title: { en: "Reasons to buy more than one", ar: "أسباب لشراء أكثر من قطعة" },
    question: "Does the product page offer a reason to buy more: bundles, 'buy 2 save X%', multi-packs or quantity tiers, shown next to the price with the saving clear (and a 'most popular' option pre-selected)?",
    pass: "A bundle or quantity offer with a visible saving next to the price/button.",
    warn: "No bundle or quantity offer — a missed chance to raise order value.",
    fail: "(not used — this rule is WARN at most)",
    E: 3, C: 4, T: 3, I: 4,
    funnel: null,
    autoFail: false,
    signal: e => {
      const p = pageOf(e, "product");
      if (!p) return "unknown";
      if (nearCta(p).some(b => matches("bundle", b.text))) return "present";
      return has(p, "bundle") ? "elsewhere" : "absent";
    },
  },
  {
    id: "M2",
    group: "buy_more",
    pageType: "cart",
    needs: ["product", "cart"],
    crop: "cart",
    title: { en: "Add-ons suggested on the product page and in the cart", ar: "اقتراح منتجات مكملة في صفحة المنتج والسلة" },
    question: "Are complementary products suggested where the shopper is already buying — 'frequently bought together' on the product page and a one-tap add-on in the cart drawer?",
    pass: "Relevant add-ons offered in the cart (and ideally on the product page), one tap to add.",
    warn: "Suggestions only on one of the two, or generic 'you may also like' far down the page.",
    fail: "(not used — this rule is WARN at most)",
    E: 3, C: 3, T: 3, I: 4,
    funnel: null,
    autoFail: false,
    signal: e => {
      const product = pageOf(e, "product");
      const cart = pageOf(e, "cart");
      const inCart = Boolean(cart && !cart.cart?.empty && has(cart, "crossSell"));
      const inProduct = has(product, "crossSell");
      if (inCart && inProduct) return "present";
      return inCart || inProduct ? "elsewhere" : "absent";
    },
  },
  {
    id: "M3",
    group: "buy_more",
    pageType: "cart",
    needs: ["cart"],
    crop: "cart",
    title: { en: "Free-shipping threshold set to lift order value", ar: "حد الشحن المجاني مضبوط لرفع قيمة الطلب" },
    question: "Compare the free-shipping threshold with the store's average order value (given in the evidence from GA4). A threshold somewhat above the average order (roughly 10-50% higher) nudges shoppers to add one more item; one far below gives margin away, one far above is out of reach.",
    pass: "Threshold roughly 10-50% above the average order value.",
    warn: "Threshold below the average order (most orders already qualify) or far above it (out of reach).",
    fail: "(not used — this rule is WARN at most)",
    E: 5, C: 4, T: 5, I: 4,
    funnel: null,
    autoFail: false,
    applies: e => Boolean(e.context?.aov) && freeShippingThreshold(e) !== null,
    signal: e => {
      const aov = e.context?.aov;
      const threshold = freeShippingThreshold(e);
      if (!aov || threshold === null) return "unknown";
      const ratio = threshold / aov;
      return ratio >= 1.05 && ratio <= 1.6 ? "present" : "elsewhere";
    },
  },
  // ---- buy again (repeat purchases) ----------------------------------------------
  {
    id: "R1",
    group: "buy_again",
    pageType: "home",
    needs: ["home"],
    crop: "fold",
    title: { en: "A reason to leave an email or WhatsApp number", ar: "سبب لترك البريد أو رقم واتساب" },
    question: "Does the store capture first-time visitors so it can bring them back — an email or WhatsApp signup with a concrete reason (first-order discount, early access, a guide)?",
    pass: "A signup with a clear incentive.",
    warn: "A signup box with no reason to use it ('Subscribe to our newsletter'), or none at all.",
    fail: "(not used — this rule is WARN at most)",
    E: 4, C: 4, T: 4, I: 3,
    funnel: null,
    autoFail: false,
    signal: e => {
      const home = pageOf(e, "home");
      if (!home) return "unknown";
      const capture = Boolean(home.facts?.capture.email || home.facts?.capture.phone || home.popups?.onLoad.some(p => p.kind === "email" || p.kind === "discount"));
      const offer = has(home, "signupOffer") || Boolean(home.popups?.onLoad.some(p => p.kind === "discount"));
      if (capture && offer) return "present";
      return capture ? "elsewhere" : "absent";
    },
  },
  {
    id: "R2",
    group: "buy_again",
    pageType: "home",
    needs: ["home", "product"],
    crop: "fold",
    title: { en: "Reasons to come back and buy again", ar: "أسباب للعودة والشراء مرة أخرى" },
    question: "Is there anything that brings a customer back for the next order — loyalty points or rewards, referral credit, subscribe-and-save for products people run out of, or an account with order history and reorder?",
    pass: "A loyalty, referral or subscription programme that shoppers can see before buying.",
    warn: "Only a basic account login, or nothing that rewards a second order.",
    fail: "(not used — this rule is WARN at most)",
    E: 2, C: 3, T: 2, I: 4,
    funnel: null,
    autoFail: false,
    signal: e => {
      const pages = [pageOf(e, "home"), pageOf(e, "product")];
      if (!pages[0] && !pages[1]) return "unknown";
      if (pages.some(p => has(p, "loyalty") || has(p, "subscription"))) return "present";
      return pages.some(p => p?.facts?.capture.account) ? "elsewhere" : "absent";
    },
  },
  // ---- local market fit -----------------------------------------------------------
  {
    id: "L1",
    group: "local",
    pageType: "home",
    needs: ["home"],
    crop: "fold",
    title: { en: "Arabic version that reads naturally", ar: "نسخة عربية طبيعية ومكتملة" },
    question: "For an Egypt/GCC store: is there an Arabic version (or Arabic-first site) with right-to-left layout, and is the Arabic complete and natural — not half-translated, not machine-sounding, not mixing English menus and buttons into Arabic pages?",
    pass: "Arabic available, right-to-left, complete and natural across home and product.",
    warn: "Arabic exists but parts stay in English, the layout isn't right-to-left, or the wording reads machine-translated; or there is no Arabic option at all.",
    fail: "(not used — this rule is WARN at most)",
    E: 3, C: 3, T: 3, I: 3,
    funnel: null,
    autoFail: false,
    signal: e => {
      const home = pageOf(e, "home");
      if (!home?.facts) return "unknown";
      const f = home.facts;
      const arabic = /^ar/i.test(f.lang) || f.hreflang.some(h => /^ar/i.test(h)) || /[؀-ۿ]/.test(pageText(home));
      if (!arabic && !f.langSwitch) return "absent";
      if (/^ar/i.test(f.lang) && f.dir.toLowerCase() !== "rtl") return "elsewhere";
      return "unknown";
    },
  },
  {
    id: "L2",
    group: "local",
    pageType: "product",
    needs: ["product", "cart"],
    crop: "cta",
    title: { en: "Local payment and delivery shown before checkout", ar: "طرق الدفع والتوصيل المحلية ظاهرة قبل الدفع" },
    question: "Before checkout, does the shopper see the payment methods people in this market expect (cash on delivery, mada/Meeza/Fawry/InstaPay/KNET/STC Pay, valU/Tabby/Tamara, Apple Pay) and that delivery covers their city or governorate, with prices in local currency?",
    pass: "Local payment methods and delivery coverage are both visible on the product page or in the cart.",
    warn: "Only one of the two, or only card logos with no local options.",
    fail: "(not used — this rule is WARN at most)",
    E: 4, C: 4, T: 4, I: 3,
    funnel: { from: "add_to_cart", to: "begin_checkout" },
    autoFail: false,
    signal: e => {
      const pages = [pageOf(e, "product"), pageOf(e, "cart")].filter((p): p is PageEvidence => Boolean(p));
      if (pages.length === 0) return "unknown";
      const pay = pages.some(p => has(p, "localPayment") || hasWidget(p, "installments"));
      const coverage = pages.some(p => has(p, "deliveryCoverage"));
      if (pay && coverage) return "present";
      return pay || coverage ? "elsewhere" : "absent";
    },
  },
  // ---- popups ----------------------------------------------------------------------
  {
    id: "U1",
    group: "popups",
    pageType: "home",
    needs: ["home"],
    crop: "fold",
    title: { en: "No popup in the way on arrival", ar: "لا نافذة منبثقة تعيق الزائر عند الدخول" },
    question: "When a phone visitor first lands, does a popup or overlay (newsletter, discount wheel, app banner, large cookie banner) cover the page before they've seen anything? The evidence lists overlays found on arrival and whether pressing Escape closed them.",
    pass: "Nothing covers the page on arrival (a small cookie bar is fine).",
    warn: "A large popup covers the page on arrival, even if it can be closed.",
    fail: "(not used — this rule is WARN at most)",
    E: 5, C: 5, T: 5, I: 3,
    funnel: null,
    autoFail: false,
    signal: e => {
      const home = pageOf(e, "home");
      if (!home?.popups) return "unknown";
      const blocking = home.popups.onLoad.filter(p => p.kind !== "cookie" || p.cover >= 30);
      if (blocking.length === 0) return "present";
      return "elsewhere";
    },
  },
  // ---- the landing-page framework (fud-2.1.0) ---------------------------------------
  // From the CRO wireframe library and ATIDFA (Attention, Transformation,
  // Interest, Desire, FAQ, Action): what high-converting store pages put
  // where. All opportunity rules: WARN at most.
  {
    id: "H3",
    group: "homepage",
    pageType: "home",
    needs: ["home"],
    crop: "fold",
    title: { en: "An offer bar at the very top", ar: "شريط عرض في أعلى الصفحة" },
    question: "Is there a thin bar at the very top of the page (above or inside the header) that states one concrete reason to buy now: free shipping over an amount, cash on delivery, a current offer, or delivery time?",
    pass: "A top bar states a specific offer or promise (e.g. 'Free delivery over 1,000 EGP', 'Cash on delivery all over Egypt').",
    warn: "No top bar, or it only says something vague ('Welcome to our store', 'Fast shipping').",
    fail: "(not used — this rule is WARN at most)",
    E: 5, C: 4, T: 5, I: 3,
    funnel: null,
    autoFail: false,
    signal: e => {
      const home = pageOf(e, "home");
      if (!home) return "unknown";
      const top = home.blocks.filter(b => b.aboveFold && b.box.y < 120);
      const offer = (t: string) => matches("freeShipping", t) || matches("offer", t) || matches("cod", t) || matches("deliveryTime", t);
      if (top.some(b => offer(b.text))) return "present";
      return home.blocks.some(b => b.aboveFold && offer(b.text)) ? "elsewhere" : "unknown";
    },
  },
  {
    id: "H4",
    group: "homepage",
    pageType: "home",
    needs: ["home"],
    crop: "fold",
    layout: true,
    title: { en: "A rating on the first screen", ar: "تقييم ظاهر في أول شاشة" },
    question: "Does the homepage's first phone screen show proof that real people buy here: a star rating with a count, or a line like 'Rated 4.8/5 by 12,000+ customers'?",
    pass: "A star rating or a customer count sits in the first screen, close to the headline.",
    warn: "Ratings or customer numbers exist on the homepage but only further down, or there are none.",
    fail: "(not used — this rule is WARN at most)",
    E: 4, C: 4, T: 4, I: 4,
    funnel: null,
    autoFail: false,
    signal: e => {
      const home = pageOf(e, "home");
      if (!home) return "unknown";
      const proof = (t: string) => matches("ratedBy", t) || matches("reviews", t);
      if (home.blocks.some(b => b.aboveFold && proof(b.text))) return "present";
      return home.blocks.some(b => proof(b.text)) ? "elsewhere" : "absent";
    },
  },
  {
    id: "H5",
    group: "homepage",
    pageType: "home",
    needs: ["home"],
    crop: "fold",
    layout: true,
    title: { en: "Three benefits under the headline", ar: "ثلاث مزايا تحت العنوان" },
    question: "Under the homepage headline, are there 2-4 short benefit points (with check marks or icons) that say what the shopper gets — e.g. 'Natural ingredients', 'Delivery in 48 hours', 'Free returns'?",
    pass: "2-4 short, specific benefit points sit right under the headline on the first screen.",
    warn: "No benefit points on the first screen, or they're generic ('High quality', 'Best prices').",
    fail: "(not used — this rule is WARN at most)",
    E: 5, C: 4, T: 5, I: 3,
    funnel: null,
    autoFail: false,
    signal: e => {
      const home = pageOf(e, "home");
      if (!home) return "unknown";
      const points = home.blocks.filter(b => b.aboveFold && b.text.length <= 60 && (b.tag === "li" || matches("checkMark", b.text)));
      return points.length >= 2 ? "present" : "unknown";
    },
  },
  {
    id: "H6",
    group: "homepage",
    pageType: "home",
    needs: ["home"],
    crop: "fold",
    title: { en: "The main button says what happens", ar: "الزر الرئيسي يقول هيحصل إيه" },
    question: "Does the homepage's main button tell the visitor exactly where it goes ('Shop bestsellers', 'Shop abayas', 'Find your size'), rather than a generic 'Shop now' or 'Discover'?",
    pass: "The main button names the destination or the benefit.",
    warn: "The main button is generic ('Shop now', 'Discover', 'Learn more', 'تسوق الآن').",
    fail: "(not used — this rule is WARN at most)",
    E: 5, C: 4, T: 5, I: 2,
    funnel: null,
    autoFail: false,
    applies: e => (pageOf(e, "home")?.facts?.heroButtons.length ?? 0) > 0,
    signal: e => {
      const labels = pageOf(e, "home")?.facts?.heroButtons ?? [];
      if (!labels.length) return "unknown";
      return labels.some(l => !matches("genericCta", normalize(l).trim())) ? "present" : "absent";
    },
  },
  {
    id: "P5",
    group: "product",
    pageType: "product",
    needs: ["product"],
    crop: "fold",
    layout: true,
    title: { en: "The product headline sells a benefit", ar: "عنوان المنتج بيبيع ميزة" },
    question: "Next to the product name on the first phone screen, does the page say what the product does for the buyer: a benefit line and 2-4 check-marked points (e.g. '25g protein per serving', 'Gluten-free', 'Easy to digest'), not just the name and price?",
    pass: "A benefit line or 2-4 short benefit points sit next to the name and price.",
    warn: "Only the product name and price; the benefits are buried in the description.",
    fail: "(not used — this rule is WARN at most)",
    E: 5, C: 4, T: 5, I: 4,
    funnel: { from: "view_item", to: "add_to_cart" },
    autoFail: false,
    signal: e => {
      const product = pageOf(e, "product");
      if (!product) return "unknown";
      const points = product.blocks.filter(b => b.aboveFold && b.text.length <= 70 && (b.tag === "li" || matches("checkMark", b.text)));
      return points.length >= 2 ? "present" : "unknown";
    },
  },
  {
    id: "P6",
    group: "product",
    pageType: "product",
    needs: ["product"],
    crop: "fold",
    title: { en: "What happens after you order, in steps", ar: "إيه اللي هيحصل بعد الطلب، خطوة بخطوة" },
    question: "Does the product page show, in 2-4 simple steps or icons, how buying works and what the shopper ends up with (e.g. 'Order today → Delivered in 2 days → Pay at the door → Results in 4 weeks')? This 'transformation' section makes the purchase feel easy and the outcome real.",
    pass: "A short steps section shows ordering, delivery and the result.",
    warn: "Nothing shows how ordering works or what the result looks like.",
    fail: "(not used — this rule is WARN at most)",
    E: 4, C: 3, T: 4, I: 3,
    funnel: { from: "view_item", to: "add_to_cart" },
    autoFail: false,
    signal: e => {
      const product = pageOf(e, "product");
      if (!product) return "unknown";
      return has(product, "howItWorks") ? "present" : "absent";
    },
  },
  {
    id: "P7",
    group: "product",
    pageType: "product",
    needs: ["product"],
    crop: "fold",
    title: { en: "Benefits come before features", ar: "المزايا قبل المواصفات" },
    question: "Reading the product page from the top, does it lead with what the buyer gains (results, feelings, problems solved) and only then list features, materials or specs that back those benefits up? Or does it open with a spec list?",
    pass: "Benefits first, each feature tied back to a benefit.",
    warn: "The page leads with specs, materials or a raw description, and never says what they mean for the buyer.",
    fail: "(not used — this rule is WARN at most)",
    E: 4, C: 3, T: 4, I: 3,
    funnel: { from: "view_item", to: "add_to_cart" },
    autoFail: false,
    signal: () => "unknown",
  },
  {
    id: "P8",
    group: "product",
    pageType: "product",
    needs: ["product"],
    crop: "fold",
    title: { en: "Customer photos or videos", ar: "صور أو فيديوهات من العملاء" },
    question: "Does the product page show photos or videos made by real customers (UGC): review photos, unboxing or try-on clips, before/after, tagged social posts? These convert better than studio shots because they look real.",
    pass: "Customer photos or videos are on the product page.",
    warn: "Only studio photos; reviews (if any) are text only.",
    fail: "(not used — this rule is WARN at most)",
    E: 3, C: 4, T: 3, I: 4,
    funnel: { from: "view_item", to: "add_to_cart" },
    autoFail: false,
    signal: e => {
      const product = pageOf(e, "product");
      if (!product) return "unknown";
      if (has(product, "ugc") || product.widgets.some(w => w === "loox" || w === "okendo")) return "present";
      return "unknown";
    },
  },
  {
    id: "P9",
    group: "product",
    pageType: "product",
    needs: ["product"],
    crop: "fold",
    title: { en: "A comparison with the alternative", ar: "مقارنة بالبديل" },
    question: "Does the product page compare this product with what the shopper would otherwise buy (other brands, the cheap version, doing nothing) — e.g. a check/cross table 'Us vs Others'? This answers 'why this one?' before the shopper leaves to compare.",
    pass: "A clear comparison (table or side-by-side) shows why this product wins.",
    warn: "No comparison anywhere; the shopper has to leave to compare.",
    fail: "(not used — this rule is WARN at most)",
    E: 3, C: 3, T: 4, I: 3,
    funnel: { from: "view_item", to: "add_to_cart" },
    autoFail: false,
    signal: e => {
      const product = pageOf(e, "product");
      if (!product) return "unknown";
      return has(product, "comparison") ? "present" : "absent";
    },
  },
  {
    id: "P10",
    group: "product",
    pageType: "product",
    needs: ["product"],
    crop: "cta",
    title: { en: "An FAQ answers the last doubts", ar: "أسئلة شائعة بترد على آخر شك" },
    question: "Does the product page have a short FAQ that answers the questions people ask before buying this product (delivery time, returns, sizing, how to use, is it original)? A link to a general FAQ page doesn't count.",
    pass: "A product-page FAQ with short answers to the common objections.",
    warn: "Only a link to a general FAQ page, or no FAQ at all.",
    fail: "(not used — this rule is WARN at most)",
    E: 4, C: 4, T: 4, I: 3,
    funnel: { from: "view_item", to: "add_to_cart" },
    autoFail: false,
    signal: e => {
      const product = pageOf(e, "product");
      if (!product) return "unknown";
      if (has(product, "faq")) return "present";
      return product.policyLinks.some(l => l.kind === "faq") ? "elsewhere" : "absent";
    },
  },
  {
    id: "P11",
    group: "product",
    pageType: "product",
    needs: ["product"],
    crop: "cta",
    title: { en: "The page ends with a reason and a buy button", ar: "الصفحة بتخلص بسبب للشراء وزرار" },
    question: "When a shopper scrolls to the bottom of the product page (after reviews and details), is there a closing section with one more reason to buy and a buy button — or does the page just end, so they have to scroll all the way back up?",
    pass: "A closing headline or offer with a buy button near the end of the page (a sticky bar alone counts as WARN).",
    warn: "Only a sticky bar, or the page ends with no way to buy without scrolling back up.",
    fail: "(not used — this rule is WARN at most)",
    E: 4, C: 4, T: 4, I: 3,
    funnel: { from: "view_item", to: "add_to_cart" },
    autoFail: false,
    signal: () => "unknown",
  },
  {
    id: "P12",
    group: "product",
    pageType: "product",
    needs: ["product"],
    crop: "fold",
    title: { en: "Says what's included", ar: "بيقول إيه اللي جوه العلبة" },
    question: "Does the product page say exactly what the shopper receives (pieces in the set, size or volume, accessories, how many servings) so there's no surprise on delivery?",
    pass: "A clear 'what's included' list or line.",
    warn: "The shopper has to guess what's in the package or how much they get.",
    fail: "(not used — this rule is WARN at most)",
    E: 5, C: 4, T: 5, I: 2,
    funnel: { from: "view_item", to: "add_to_cart" },
    autoFail: false,
    signal: e => {
      const product = pageOf(e, "product");
      if (!product) return "unknown";
      return has(product, "whatsIncluded") ? "present" : "unknown";
    },
  },
  {
    id: "K1",
    group: "buy_more",
    pageType: "cart",
    needs: ["product", "cart"],
    crop: "cart",
    title: { en: "The cart shows what they saved", ar: "السلة بتوري العميل وفّر كام" },
    question: "When the product is on sale or in a bundle, does the cart remind the shopper how much they're saving ('You saved 250 EGP'), right above the checkout button?",
    pass: "A 'You saved …' line (or crossed-out prices) shows in the cart.",
    warn: "The product was discounted on its page, but the cart shows only the final total.",
    fail: "(not used — this rule is WARN at most)",
    E: 5, C: 4, T: 4, I: 2,
    funnel: { from: "add_to_cart", to: "begin_checkout" },
    autoFail: false,
    applies: e => has(pageOf(e, "product"), "offer"),
    signal: e => {
      const cart = pageOf(e, "cart");
      if (!cart || cart.cart?.empty) return "unknown";
      return has(cart, "savings") ? "present" : "absent";
    },
  },
  {
    id: "G1",
    group: "collection",
    pageType: "collection",
    needs: ["collection"],
    crop: "fold",
    layout: true,
    title: { en: "The collection opens with a promise and a rating", ar: "صفحة القسم بتبدأ بوعد وتقييم" },
    question: "Does the collection page open with a short headline that says why to buy from this range (not just the category name), with a rating or customer count next to it?",
    pass: "A benefit headline plus a rating or customer count above the products.",
    warn: "Only the category name ('Abayas') above the grid.",
    fail: "(not used — this rule is WARN at most)",
    E: 5, C: 3, T: 5, I: 2,
    funnel: null,
    autoFail: false,
    signal: e => {
      const col = pageOf(e, "collection");
      if (!col) return "unknown";
      return col.blocks.some(b => b.aboveFold && (matches("ratedBy", b.text) || matches("reviews", b.text))) ? "present" : "unknown";
    },
  },
  {
    id: "G2",
    group: "collection",
    pageType: "collection",
    needs: ["collection"],
    crop: "fold",
    title: { en: "Badges help shoppers choose", ar: "الشارات بتساعد العميل يختار" },
    question: "Do product cards on the collection page carry honest badges that help a shopper pick — 'Best seller', 'Selling fast', 'New', 'Top rated' — so the grid isn't a wall of equal choices?",
    pass: "Some cards carry badges like Best seller / Selling fast / New.",
    warn: "No badges: every card looks the same.",
    fail: "(not used — this rule is WARN at most)",
    E: 5, C: 4, T: 5, I: 2,
    funnel: null,
    autoFail: false,
    signal: e => {
      const col = pageOf(e, "collection");
      if (!col) return "unknown";
      return has(col, "merchBadge") ? "present" : "absent";
    },
  },
];
