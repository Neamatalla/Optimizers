// What the customer pays and how they can pay, read from the visit's page
// text (store owner report, Round 7). Shared by fud/index.ts (real audits)
// and the samples. Each value is "seen" on the page or null when the pages
// it needs were not visited: never guessed.
import type { FudPageType } from "../types.js";
import type { PageEvidence, StoreEvidence } from "./evidence.js";
import { normalize, PATTERNS } from "./signals.js";

export type PayMethod = "mada" | "applePay" | "stcPay" | "tabby" | "tamara" | "cod";

export interface CostSignals {
  // Pages the methods were looked for on (product, cart, checkout), loaded only.
  pages: FudPageType[];
  // true = seen on one of those pages; absent from the record = not seen.
  methods: Partial<Record<PayMethod, boolean>>;
  // Before checkout = product page or cart. null when neither loaded.
  deliveryFee: boolean | null;
  codFee: boolean | null;
  vatIncluded: boolean | null;
  // Short text of the delivery-time promise, as shown, or null.
  deliveryPromise: string | null;
  // "free delivery from SAR 600" → 600, or null.
  freeThreshold: number | null;
}

const AMT = String.raw`\d[\d,.]*`;
const CUR = String.raw`(?:sar|ر\.?\s?س|ريال|aed|درهم|kwd|qar|bhd|omr|egp|جنيه|usd|\$)`;

export const METHOD_PATTERNS: Record<PayMethod, RegExp> = {
  mada: /\bmada\b|بطاقة مدي|(?:^|[\s،,|/])مدي(?:$|[\s،,|/])/,
  applePay: /apple ?pay|ابل باي/,
  stcPay: /stc ?pay|اس تي سي باي/,
  tabby: /\btabby\b|تابي/,
  tamara: /\btamara\b|تمارا/,
  cod: PATTERNS.cod,
};

const COD_FEE = new RegExp(String.raw`(?:cash on delivery|\bcod\b|الدفع عند الاستلام)[^.\n]{0,40}?(?:fee|رسوم|${CUR}\s?${AMT}|${AMT}\s?${CUR})|(?:رسوم|fee)[^.\n]{0,15}?(?:الدفع عند الاستلام|cash on delivery|\bcod\b)`);
const VAT_INCLUDED = /incl(?:uding|usive|\.)?\s(?:of\s)?(?:vat|tax)|(?:vat|tax)(?:es)?\s(?:included|inclusive)|شامل(?:ه|ة)?\s(?:ال)?ضريبة|شامل(?:ه|ة)?\s(?:ل)?(?:ال)?قيمة المضافة/;
const THRESHOLD_AMT = new RegExp(String.raw`(${AMT})\s?${CUR}|${CUR}\s?(${AMT})`);

const text = (p: PageEvidence | undefined) => normalize(p ? p.blocks.map(b => b.text).join(" \n ") : "");

export function costSignals(e: Pick<StoreEvidence, "pages">): CostSignals {
  const get = (t: FudPageType) => e.pages.find(p => p.pageType === t && p.loaded);
  const product = get("product"), cart = get("cart"), checkout = get("checkout");
  const seen = [product, cart, checkout].filter((p): p is PageEvidence => Boolean(p));
  const all = seen.map(p => text(p) + " " + (p.widgets ?? []).join(" ").toLowerCase()).join(" \n ");
  const before = [product, cart].filter((p): p is PageEvidence => Boolean(p));
  const pre = before.map(text).join(" \n ");
  const methods: CostSignals["methods"] = {};
  for (const [m, re] of Object.entries(METHOD_PATTERNS) as Array<[PayMethod, RegExp]>) if (re.test(all)) methods[m] = true;
  const has = (re: RegExp) => (before.length ? re.test(pre) : null);
  const promise = before.length ? pre.match(PATTERNS.deliveryTime) : null;
  const thr = before.length || get("home") ? (pre + " " + text(get("home"))).match(PATTERNS.shippingThreshold) : null;
  const amt = thr ? thr[0].match(THRESHOLD_AMT) : null;
  const num = amt ? Number((amt[1] ?? amt[2]).replace(/,/g, "")) : NaN;
  return {
    pages: seen.map(p => p.pageType),
    methods,
    deliveryFee: before.length ? PATTERNS.shippingFee.test(pre) || PATTERNS.shippingThreshold.test(pre) || PATTERNS.freeShipping.test(pre) : null,
    codFee: has(COD_FEE),
    vatIncluded: has(VAT_INCLUDED),
    deliveryPromise: promise ? snippet(pre, promise.index ?? 0) : null,
    freeThreshold: Number.isFinite(num) && num > 0 ? num : null,
  };
}

function snippet(s: string, at: number): string {
  // normalize() folds newlines to spaces, so cut a short window around the match.
  const a = Math.max(0, s.lastIndexOf(" ", Math.max(0, at - 20)));
  const b = s.indexOf(" ", Math.min(s.length, at + 45));
  return s.slice(a, b < 0 ? undefined : b).trim();
}
