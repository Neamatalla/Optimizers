// Store owner report (owner round 4): which platform the store runs on, who
// does each fix, and where in the store admin to make it.
//
// Admin paths come ONLY from icp/research/owner-market-research.md §5
// (checked in official help articles, 12 Nov 2026). A topic with no confirmed
// path returns null: the report then says it in plain words and never guesses
// a menu path.

import type { ActionOwner, CategoryKey } from "./types.js";

export type StorePlatform = "salla" | "zid" | "shopify" | "woocommerce" | "other";

// Markers in a store's HTML or script URLs. Salla and Zid first: their themes
// can carry generic markers too.
const MARKERS: Array<[StorePlatform, RegExp]> = [
  ["salla", /cdn\.salla\.network|salla\.sa\/|\bsalla\.(?:config|event)|assets\.salla\.sa/i],
  ["zid", /zidcdn|media\.zid\.store|\.zid\.store|zid\.sa\/|raqeeb\.zid\.sa|\bwindow\.zid\b/i],
  ["shopify", /cdn\.shopify\.com|Shopify\.theme|window\.Shopify|myshopify\.com/i],
  ["woocommerce", /woocommerce|wp-content\/plugins\/woocommerce/i],
];

/** Platform from raw HTML / script URLs; null when no marker matched. */
export function detectStorePlatform(html: string): StorePlatform | null {
  for (const [p, re] of MARKERS) if (re.test(html)) return p;
  return null;
}

/** Normalise a free-text platform name (SiteChecks.platform, form field). */
export function normalizePlatform(name: string | null | undefined): StorePlatform | null {
  if (!name) return null;
  const s = name.toLowerCase();
  if (/salla|سلة/.test(s)) return "salla";
  if (/zid|زد/.test(s)) return "zid";
  if (/shopify|شوبيفاي/.test(s)) return "shopify";
  if (/woo/.test(s)) return "woocommerce";
  return "other";
}

export type OwnerLane = "admin" | "ads" | "dev";

/**
 * Who does a fix, in the owner's words. A developer task stays "dev". GA4,
 * GTM and ad-platform setup goes to whoever runs the ads, never "you".
 */
export function ownerLane(category: CategoryKey | string, owners: ActionOwner[] | undefined, text = ""): OwnerLane {
  if (!owners?.length || owners.includes("dev")) return "dev";
  if (category === "GA4" || category === "GTM" || owners.includes("marketing")) return "ads";
  if (/google analytics|\bga4\b|tag manager|\bgtm\b|google ads|meta pixel|conversion api|\bpixel\b/i.test(text)) return "ads";
  return "admin";
}

export const LANE_LABEL: Record<OwnerLane, [string, string]> = {
  admin: ["You, in your store admin", "أنت، من لوحة تحكم متجرك"],
  ads: ["Whoever runs your ads", "اللي يدير إعلاناتك"],
  dev: ["Your developer", "المطوّر حقك"],
};

export type AdminTopic = "freeShipping" | "cod" | "bnpl" | "payments" | "reviews" | "whatsapp" | "policies" | "seo" | "analytics" | "shipping";

// Order matters: the narrower topic wins.
const TOPICS: Array<[AdminTopic, RegExp]> = [
  ["freeShipping", /free (?:delivery|shipping)|شحن مجاني|توصيل مجاني|الشحن المجاني/i],
  ["cod", /cash on delivery|\bCOD\b|الدفع عند الاستلام/i],
  ["bnpl", /tabby|tamara|تابي|تمارا|pay later|\bBNPL\b|instal?ments?|تقسيط/i],
  ["payments", /payment method|apple pay|\bmada\b|مدى|طرق الدفع|وسائل الدفع/i],
  ["reviews", /reviews?|ratings?|تقييم/i],
  ["whatsapp", /whatsapp|واتساب|واتس/i],
  ["policies", /return polic|refund polic|privacy polic|terms|policy page|سياسة/i],
  ["seo", /meta description|page title|title tag|\bSEO\b|محركات البحث/i],
  ["analytics", /google analytics|\bga4\b|tag manager|\bgtm\b|pixel|بكسل/i],
  ["shipping", /shipping|delivery|carrier|الشحن|التوصيل/i],
];

export function adminTopic(text: string): AdminTopic | null {
  for (const [t, re] of TOPICS) if (re.test(text)) return t;
  return null;
}

/** path + optional plan gate, both [en, ar]. Menu names stay as the admin shows them. */
export interface AdminPath { path: string; gate: [string, string] | null }

const P = (path: string, gate: [string, string] | null = null): AdminPath => ({ path, gate });

const PATHS: Partial<Record<StorePlatform, Partial<Record<AdminTopic, AdminPath>>>> = {
  salla: {
    freeShipping: P("الكل > إعدادات الشحن > الشحن المجاني"),
    cod: P("إعدادات الشحن والتوصيل > تخصيص الدفع عند الاستلام"),
    bnpl: P("الكل > الإعدادات والأدوات > طرق الدفع > اشترِ الآن وادفع لاحقاً"),
    payments: P("الكل > الإعدادات والأدوات > طرق الدفع > تفعيل", ["Online payment needs a paid Salla plan.", "الدفع الإلكتروني يحتاج باقة سلة مدفوعة."]),
    reviews: P("إعدادات الأسئلة والتقييمات", ["Reviews on the product page need a paid Salla plan.", "التقييمات في صفحة المنتج تحتاج باقة سلة مدفوعة."]),
    policies: P("المتجر وقنوات البيع > الصفحات التعريفية > صفحة جديدة"),
    seo: P("الأدوات التسويقية > تحسين محركات البحث > الإعدادات العامة"),
    analytics: P("الكل > متجر التطبيقات > Google Analytics > تثبيت"),
    shipping: P("الكل > الشحن والتوصيل"),
  },
  zid: {
    freeShipping: P("اللوجستيات > الإعدادات > شروط الشحن المجاني > تخصيص"),
    cod: P("اللوجستيات > طرق الشحن > [طريقة الشحن] > التخصيص > تعديل", ["COD rules need the Growth plan or higher.", "قواعد الدفع عند الاستلام تحتاج باقة النمو أو أعلى."]),
    bnpl: P("المدفوعات > الدفع لاحقاً > تابي / تمارا"),
    payments: P("المدفوعات > تفعيل الدفع الإلكتروني"),
    reviews: P("العملاء > التقييمات > تفعيل الآن"),
    whatsapp: P("الواتساب > الإعدادات > زر واتساب", ["Needs a Zid WhatsApp subscription.", "يحتاج اشتراك واتساب من زد."]),
    policies: P("الإعدادات > المتجر > الصفحات القانونية"),
    seo: P("المتجر الإلكتروني > تحسين محركات البحث > إدارة"),
    analytics: P("التطبيقات > سوق التطبيقات > Google Analytics"),
    shipping: P("الشحن والتوصيل > شركات الشحن الأخرى"),
  },
  shopify: {
    freeShipping: P("Settings > Shipping and delivery > [profile] > [zone] > Add shipping option"),
    bnpl: P("Settings > Payments > Additional payment methods > Add payment methods"),
    payments: P("Settings > Payments"),
    policies: P("Settings > Policies > Written policies"),
    seo: P("Online Store > Preferences"),
    analytics: P("Google & YouTube sales channel"),
    shipping: P("Settings > Shipping and delivery"),
  },
};

/** Confirmed admin path for a fix's text on this platform, or null. */
export function adminPathFor(platform: StorePlatform | null, text: string): AdminPath | null {
  if (!platform) return null;
  const topic = adminTopic(text);
  return topic ? PATHS[platform]?.[topic] ?? null : null;
}
