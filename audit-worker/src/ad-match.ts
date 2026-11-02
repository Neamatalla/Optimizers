/**
 * Ad → landing page match (round 20). Plain text maths, no AI: it compares
 * what the ad promises (AuditResult.adContext, typed by the reader on the
 * form) with what the paid landing page shows, first screen first. Runs in
 * the worker and in the browser (html-report.ts), so it only imports types.
 */

export interface LandingSummary {
  url: string;
  // Why we opened it ("GA4: the page with the most paid visits (28 days)").
  source: string;
  // The page we already visited under another role, when it's the same URL.
  sameAs?: string;
  loaded: boolean;
  note?: string;
  h1: string[];
  // Text of the first phone screen, in reading order (capped).
  fold: string;
  // Text of the whole page (capped), to tell "lower on the page" from "missing".
  page: string;
  // First screen shows a price / the buy button.
  priceOnFold: boolean;
  buyOnFold: boolean;
  buyLabel?: string;
  // JPEG data URI of the first phone screen.
  crop?: string;
}

export interface CheckoutSummary {
  loaded: boolean;
  note?: string;
  // A discount / coupon field on the first checkout screen.
  couponField: boolean;
}

export type Where = "fold" | "page" | "missing";

export interface AdMatch {
  // Each number from the ad (50%, 1399, "4 for 3") and where the page shows it.
  offers: Array<{ text: string; where: Where }>;
  // Words of the ad, found on the first screen or not.
  words: { found: string[]; missing: string[] };
  coupon: { code: string; where: Where; checkoutField: boolean | null } | null;
  // 0–100: the share of the ad's promises the first screen repeats.
  score: number | null;
}

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
/** Western digits, % for ٪, no thousands separators, lower case. */
export function normalize(s: string): string {
  return s
    .replace(/[٠-٩]/g, d => String(AR_DIGITS.indexOf(d)))
    .replace(/٪/g, "%")
    .replace(/[₀-₉]/g, d => String(d.charCodeAt(0) - 0x2080))
    .replace(/(\d)[,٬](?=\d{3}\b)/g, "$1")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase();
}

const STOP = new Set([
  "the", "and", "for", "with", "you", "your", "all", "now", "get", "off", "only", "today", "our", "from", "this", "that", "new", "free", "shop", "buy", "order",
  "egp", "sar", "aed", "kwd", "qar", "usd", "جنيه", "ريال", "بسعر", "بتمن",
  "من", "في", "على", "مع", "عن", "الي", "الى", "كل", "علي", "اللي", "دلوقتي", "النهارده", "النهاردة", "بس", "خصم", "عرض", "عروض", "اطلب", "اطلبي", "اشتري", "مجانا", "مجاني",
]);

/** The ad's numbers worth finding on the page: percentages, "N for M" deals, prices. */
export function offerTokens(ad: string): string[] {
  const t = normalize(ad);
  const out = new Set<string>();
  for (const m of t.matchAll(/\d+(?:\.\d+)?\s*%/g)) out.add(m[0].replace(/\s+/g, ""));
  // "4 for 3", "٤ منتجات بسعر ٣": up to two words between the number and "for".
  for (const m of t.matchAll(/(\d+)\s*(?:[\p{L}]+\s+){0,2}(?:for|بسعر|بتمن|ب)\s*(\d+)/gu)) out.add(`${m[1]}/${m[2]}`);
  for (const m of t.matchAll(/\b\d{2,6}\b/g)) {
    const n = m[0];
    if ([...out].some(o => o.startsWith(n) || o.includes(`/${n}`) || o.startsWith(`${n}/`))) continue;
    if (Number(n) >= 10) out.add(n);
  }
  return [...out];
}

function whereIs(token: string, fold: string, page: string): Where {
  const f = normalize(fold), p = normalize(page);
  const test = (s: string) => {
    if (token.includes("/")) {
      const [a, b] = token.split("/");
      return new RegExp(`\\b${a}\\b[^\\d]{1,20}\\b${b}\\b`).test(s);
    }
    if (token.endsWith("%")) return s.replace(/\s+%/g, "%").includes(token);
    return new RegExp(`(^|[^\\d])${token}([^\\d]|$)`).test(s);
  };
  return test(f) ? "fold" : test(p) ? "page" : "missing";
}

/** Words of the ad that say what is sold, without filler and offer words. */
export function adWords(ad: string): string[] {
  // Original spelling, for display; compared normalized.
  const words = ad.split(/[^\p{L}\p{N}]+/u).filter(w => w.length >= 3 && !/^[\d٠-٩]+$/.test(w) && !STOP.has(normalize(w)));
  const seen = new Set<string>();
  return words.filter(w => { const k = normalize(w); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 12);
}

// Arabic prefixes the same word can carry ("الزيت", "بالزيت", "وزيت").
const stem = (w: string) => w.replace(/^(وال|بال|لل|ال|و|ب|ل)(?=\p{L}{3,})/u, "");

export function adMatch(ad: { text: string | null; coupon: string | null } | null | undefined, l: LandingSummary, checkout: CheckoutSummary | null): AdMatch | null {
  if (!ad || (!ad.text && !ad.coupon) || !l.loaded) return null;
  const text = ad.text ?? "";
  const offers = offerTokens(text).map(t => ({ text: t, where: whereIs(t, l.fold, l.page) }));
  const foldWords = new Set(normalize(l.fold).split(/[^\p{L}\p{N}]+/u).map(stem));
  const ws = adWords(text);
  const found = ws.filter(w => foldWords.has(stem(normalize(w))));
  const coupon = ad.coupon
    ? {
        code: ad.coupon,
        where: (normalize(l.fold).includes(normalize(ad.coupon)) ? "fold" : normalize(l.page).includes(normalize(ad.coupon)) ? "page" : "missing") as Where,
        checkoutField: checkout?.loaded ? checkout.couponField : null,
      }
    : null;
  // Score: offers on the first screen count 2 (lower on the page 1), words 1 each, coupon 1.
  let got = 0, max = 0;
  for (const o of offers) { max += 2; got += o.where === "fold" ? 2 : o.where === "page" ? 1 : 0; }
  if (ws.length) { max += 2; got += (2 * found.length) / ws.length; }
  if (coupon) { max += 1; got += coupon.where === "missing" ? 0 : 1; }
  return { offers, words: { found, missing: ws.filter(w => !found.includes(w)) }, coupon, score: max ? Math.round((got / max) * 100) : null };
}
