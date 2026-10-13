import type { PageEvidence, TextBlock } from "./evidence.js";

/**
 * Deterministic detectors, English + Arabic. They never decide a finding on
 * their own — the judge does — but score.ts uses them as a second opinion:
 * a FAIL only stands when these agree the thing is absent (see gate()).
 *
 * Every pattern runs on text that went through normalize() first, so
 * Arabic-Indic digits, tatweel and the common alef/yaa spellings all match
 * the same way.
 */

const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

export function normalize(text: string): string {
  return text
    .replace(/[٠-٩۰-۹]/g, d => ARABIC_DIGITS[d] ?? d)
    .replace(/[٬،]/g, ",")
    .replace(/٫/g, ".")
    .replace(/ـ/g, "") // tatweel
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

// Currency tokens as they appear on EG/GCC storefronts (normalized: alef
// forms folded, lowercase).
const CURRENCY = String.raw`(?:egp|le|l\.e\.?|ج\.?\s?م|جنيه|sar|ر\.?\s?س|ريال|aed|د\.?\s?ا|درهم|kwd|د\.?\s?ك|qar|ر\.?\s?ق|bhd|omr|usd|\$|€|£)`;
const AMOUNT = String.raw`\d[\d,.]*`;
const MONEY = String.raw`(?:${CURRENCY}\s?${AMOUNT}|${AMOUNT}\s?${CURRENCY})`;

export const PATTERNS = {
  freeShipping: /free (?:shipping|delivery)|ships? free|شحن مجاني|توصيل مجاني|الشحن مجاني|التوصيل مجاني|شحن مجانا|توصيل مجانا/,
  shippingWord: /shipping|delivery|deliver|شحن|الشحن|توصيل|التوصيل/,
  shippingThreshold: new RegExp(
    String.raw`(?:free (?:shipping|delivery)|شحن مجاني|توصيل مجاني|الشحن مجاني|التوصيل مجاني)[^.]{0,40}?(?:over|above|from|on orders|orders over|عند|للطلبات|فوق|اكثر من|اعلي من|بقيمة)?[^.]{0,20}?${MONEY}` +
      String.raw`|${MONEY}[^.]{0,30}?(?:free (?:shipping|delivery)|شحن مجاني|توصيل مجاني)` +
      String.raw`|(?:add|spend|only|away|اضف|فاضل|فاضلك|باقي|متبقي|تبقي)[^.]{0,20}?${MONEY}[^.]{0,40}?(?:free|مجاني)`,
  ),
  shippingFee: new RegExp(String.raw`(?:shipping|delivery|شحن|توصيل)[^.]{0,25}?${MONEY}|${MONEY}[^.]{0,15}?(?:shipping|delivery|شحن|توصيل)`),
  returns: /return|refund|exchange|money.?back|guarantee|warranty|استرجاع|ارجاع|استرداد|استبدال|ضمان|الاسترجاع|الاستبدال/,
  returnsDays: /(\d{1,3})\s?(?:-?\s?day|days|يوم|ايام)[^.]{0,30}?(?:return|refund|exchange|money|guarantee|استرجاع|ارجاع|استرداد|استبدال|ضمان)|(?:return|refund|exchange|guarantee|استرجاع|ارجاع|استرداد|استبدال|ضمان)[^.]{0,30}?(\d{1,3})\s?(?:day|days|يوم|ايام)/,
  cod: /cash on delivery|\bcod\b|pay on delivery|الدفع عند الاستلام|الدفع عند التوصيل|الدفع عند الاستلام|كاش عند الاستلام|الدفع نقدا/,
  installments: /installment|instalment|pay in \d|split (?:it|your|in)|\d interest.?free|interest.?free|buy now,? pay later|bnpl|تقسيط|اقساط|قسط|ادفع علي|بدون فوائد|بدون فوايد/,
  // No trailing \b after the Arabic alternatives: \b only knows ASCII word
  // characters, so it never matches next to Arabic letters.
  deliveryTime: /(?:\d{1,2}\s?(?:-|–|to|الي|او)\s?)?\d{1,2}\s?(?:business |working )?(?:(?:days?|hours?)\b|يوم|ايام|ساعة|ساعات)|deliver(?:y|ed)? (?:in|within|by)|arrives? (?:in|by|on)|same.?day|next.?day|خلال \d|يصلك|التوصيل خلال|الشحن خلال|توصيل في نفس اليوم|express delivery/,
  stock: /in stock|only \d+ left|\d+ left in stock|low stock|available now|ready to ship|متوفر|متاح|متبقي|باقي \d|اخر \d|كمية محدودة/,
  secure: /secure (?:checkout|payment)|safe checkout|ssl|encrypted|100% secure|دفع امن|الدفع امن|دفع آمن|امن 100|آمن|امان/,
  paymentNames: /visa|mastercard|master card|mada|meeza|apple ?pay|google ?pay|paypal|shop ?pay|fawry|instapay|vodafone cash|tabby|tamara|valu|sympl|stc ?pay|benefit|knet|مدى|فوري|ميزة|فودافون كاش/,
  reviews: /\breviews?\b|\bratings?\b|★|⭐|out of 5|\/ ?5\b|تقييم|تقييمات|مراجعة|مراجعات|اراء العملاء|اراء|اشخاص قيموا/,
  verified: /verified (?:buyer|purchase|customer|review)|مشتري موثق|مشتري معتمد|شراء موثق|عميل موثق/,
  sizeGuide: /size (?:guide|chart|table|help)|sizing (?:guide|chart)|fit guide|find your size|measurement|دليل المقاسات|جدول المقاسات|دليل المقاس|جدول المقاس|المقاسات|اعرف مقاسك/,
  support: /whatsapp|wa\.me|live chat|chat with us|chat now|call us|contact us|customer (?:service|support|care)|hotline|واتساب|واتس اب|تواصل معنا|اتصل بنا|خدمة العملاء|الدعم|محادثة/,
  phone: /(?:\+|00)(?:20|966|971|965|974|973|968)\s?\d[\d\s-]{6,}|\b01[0125]\d{8}\b|\b05\d{8}\b|\b1\d{4}\b/,
  subtotal: /subtotal|sub-total|total|المجموع|الاجمالي|الإجمالي|المجموع الفرعي/,
  tax: /tax|vat|ضريبة|القيمة المضافة|شامل الضريبة/,
  discountField: /discount|coupon|promo code|voucher|gift card|كود الخصم|كوبون|رمز الخصم|قسيمة|خصم/,
  aboutWord: /about us|our story|who we are|founder|founded|meet the team|من نحن|قصتنا|عن المتجر|مؤسس|فريقنا|عنا/,
  trustSeal: /as seen (?:on|in)|featured in|certified|certificate|approved|award|iso \d|halal|حلال|معتمد|شهادة|حاصل علي|كما ظهر في/,
  // Buy more / buy again / local market (rules M*, R*, L*). Normalized text:
  // alef/hamza forms folded, so "اضف" also matches "أضف".
  bundle: /\bbundle\b|\bkit\b|\bset of \d|pack of \d|\bbuy \d+\b|\d+ for \d|\bx ?2\b|\bsave \d+ ?%|quantity discount|volume discount|باقة|باقات|بكج|عرض \d|قطعتين|اشتر[ي]? \d|اشتري قطعتين|وفر \d|وفري \d|العرض الثنائي|عرض التوفير|مجموعة التوفير/,
  crossSell: /frequently bought|you may also like|you might also like|complete the look|complete your|related products|customers also|pairs well|goes well with|recommended for you|قد يعجبك|منتجات مشابهة|منتجات ذات صلة|اشتري معه|يشترى معه|منتجات مقترحة|اكمل روتين|كمل روتين|كملي روتين|كمّلي روتين|اختيارات مكملة|ممكن يعجبك/,
  loyalty: /\bpoints\b|\brewards?\b|loyalty|cash ?back|\bvip\b|refer a friend|referral|نقاط|مكافات|برنامج الولاء|كاش باك|استرداد نقدي|ادعو صديق|ادعي صديقة/,
  subscription: /subscribe (?:&|and) save|subscription|deliver(?:ed)? every|auto.?ship|اشتراك شهري|اشترك ووفر|الاشتراك/,
  signupOffer: /\d+ ?% off your first|first order|welcome (?:offer|discount|gift)|join (?:and|&) (?:get|save)|sign up (?:and|&) (?:get|save)|خصم (?:على )?اول طلب|اول طلب|اشترك واحصل|اشتركي واحصلي|هدية ترحيب/,
  deliveryCoverage: /all (?:governorates|cities|emirates|regions)|all over (?:egypt|the uae|saudi|ksa)|nationwide|across (?:egypt|saudi|the uae|the gcc)|gcc wide|جميع المحافظات|كل المحافظات|لكل مصر|لكل محافظات|جميع انحاء|جميع مدن|كل مصر|جميع الامارات|كل الامارات|جميع مناطق المملكة|كل مدن المملكة/,
  localPayment: /\bmada\b|meeza|fawry|instapay|vodafone cash|valu|tabby|tamara|sympl|souhoola|\bknet\b|benefit ?pay|stc ?pay|apple ?pay|cash on delivery|\bcod\b|مدى|ميزة|فوري|انستاباي|فودافون كاش|فاليو|تابي|تمارا|الدفع عند الاستلام/,
  stockPhoto: /unsplash|pexels|shutterstock|istockphoto|gettyimages|depositphotos|freepik|stock-photo|adobestock/,
  priceJustification: /premium|handmade|hand.?made|made in|genuine|authentic|original|100% (?:cotton|natural|pure|silk|leather)|organic|natural|lab.?tested|dermatologist|clinically|certified|imported|quality|اصلي|أصلي|طبيعي|عضوي|صناعة|مصنوع|يدوي|جودة|مستورد|معتمد|خامة|خامات/,
};

export type PatternKey = keyof typeof PATTERNS;

/** Script/markup fingerprints (searched in lowercased HTML) → widget name. */
export const WIDGETS: Array<{ name: string; kind: "reviews" | "installments" | "support" | "trust"; match: RegExp }> = [
  { name: "judgeme", kind: "reviews", match: /judge\.me|judgeme|jdgm-/ },
  { name: "loox", kind: "reviews", match: /loox\.io|loox-rating/ },
  { name: "yotpo", kind: "reviews", match: /yotpo/ },
  { name: "stamped", kind: "reviews", match: /stamped\.io/ },
  { name: "okendo", kind: "reviews", match: /okendo/ },
  { name: "trustpilot", kind: "reviews", match: /trustpilot/ },
  { name: "reviews.io", kind: "reviews", match: /reviews\.io|reviewsio/ },
  { name: "ali-reviews", kind: "reviews", match: /alireviews|ali-reviews/ },
  { name: "woo-reviews", kind: "reviews", match: /woocommerce-product-rating|star-rating|commentlist/ },
  { name: "google-reviews", kind: "reviews", match: /google-reviews|elfsight.*review|trustindex/ },
  { name: "tabby", kind: "installments", match: /tabby\.ai|tabby-promo|tabbypromo|checkout\.tabby/ },
  { name: "tamara", kind: "installments", match: /tamara\.co|tamara-product-widget|tamara-widget/ },
  { name: "valu", kind: "installments", match: /valu\.com\.eg|valu-widget|\bvalu\b/ },
  { name: "sympl", kind: "installments", match: /sympl/ },
  { name: "souhoola", kind: "installments", match: /souhoola/ },
  { name: "postpay", kind: "installments", match: /postpay/ },
  { name: "shop-pay-installments", kind: "installments", match: /shopify-payment-terms|shop-pay-installments|installments-banner/ },
  { name: "whatsapp", kind: "support", match: /wa\.me\/|api\.whatsapp\.com|whatsapp-button|wa-chat|whatsapp-widget|joinchat|click-to-chat/ },
  { name: "tidio", kind: "support", match: /tidio/ },
  { name: "zendesk", kind: "support", match: /zdassets|zendesk/ },
  { name: "intercom", kind: "support", match: /intercom/ },
  { name: "crisp", kind: "support", match: /crisp\.chat/ },
  { name: "tawk", kind: "support", match: /tawk\.to/ },
  { name: "gorgias", kind: "support", match: /gorgias/ },
  { name: "freshchat", kind: "support", match: /freshchat|freshworks/ },
  { name: "livechat", kind: "support", match: /livechatinc/ },
  { name: "messenger", kind: "support", match: /facebook\.com\/customer_chat|fb-customerchat|m\.me\// },
];

export function widgetsIn(html: string): string[] {
  const lower = html.toLowerCase();
  return WIDGETS.filter(w => w.match.test(lower)).map(w => w.name);
}

export function widgetKind(name: string): string | undefined {
  return WIDGETS.find(w => w.name === name)?.kind;
}

export function matches(key: PatternKey, text: string): boolean {
  return PATTERNS[key].test(normalize(text));
}

export function anyBlock(blocks: TextBlock[], key: PatternKey): TextBlock[] {
  return blocks.filter(b => matches(key, b.text));
}

export function pageText(page: PageEvidence | undefined): string {
  return page ? page.blocks.map(b => b.text).join(" \n ") : "";
}

export function nearCta(page: PageEvidence | undefined): TextBlock[] {
  if (!page?.cta) return [];
  const ids = new Set(page.cta.nearbyBlockIds);
  return page.blocks.filter(b => ids.has(b.id));
}

export function hasWidget(page: PageEvidence | undefined, kind: string): boolean {
  return Boolean(page?.widgets.some(w => widgetKind(w) === kind));
}
