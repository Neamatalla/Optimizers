// What the Ministry of Commerce checks on a Saudi store (store owner report,
// Round 8): trust and legal basics read from the visit's public page text,
// policy links and widgets. Each item is true (seen) or false (not seen on
// the pages we opened). The whole result is null when no page loaded: never
// "missing" when we didn't look. Shared by fud/index.ts and the samples.
import type { PageEvidence, StoreEvidence } from "./evidence.js";
import { normalize, PATTERNS } from "./signals.js";

export type MinistryItem = "sbc" | "cr" | "vat" | "phone" | "email" | "returns" | "terms" | "privacy" | "deliveryTime" | "complaints";

export interface MinistryChecks {
  // Page types the items were looked for on (loaded only).
  pages: string[];
  items: Record<MinistryItem, boolean>;
  // Saudi rules apply: SAR, a .sa domain or a Saudi store language hint.
  saudi: boolean;
}

export const MINISTRY_PATTERNS: Record<Exclude<MinistryItem, "deliveryTime">, RegExp> = {
  sbc: /eauthenticate\.saudibusiness\.gov\.sa|saudibusiness\.gov\.sa|المركز السعودي للأعمال|موثق|maroof\.sa|معروف/,
  cr: /السجل التجاري|سجل تجاري|\bc\.?r\.?\s?(?:no|number|#|:)|commercial registration|\b(?:1|2|4|7)\d{9}\b/,
  vat: /الرقم الضريبي|رقم ضريبي|\bvat\s?(?:no|number|#|:|reg)|tax (?:no|number)|\b3\d{13}3\b|\b3\d{14}\b/,
  phone: /(?:\+?966|00966|\b05)\s?\d[\d\s-]{7,}|\b9200\d{5}\b|tel:/,
  email: /[\w.+-]+@[\w-]+\.[\w.]+/,
  returns: /الاسترجاع|الاستبدال|استرجاع|استبدال|\breturns?\b|refund|exchange policy|\b7 days\b|٧ أيام|7 أيام/,
  terms: /الشروط والأحكام|الشروط و الأحكام|terms (?:and|&) conditions|terms of (?:service|use)/,
  privacy: /سياسة الخصوصية|الخصوصية|privacy policy|\bprivacy\b/,
  complaints: /الشكاوى|شكوى|شكاوي|complaints?\b/,
};

const text = (p: PageEvidence) =>
  normalize([...p.blocks.map(b => b.text), ...p.policyLinks.map(l => `${l.text} ${l.href} ${l.kind === "returns" ? "returns" : ""}`), ...(p.widgets ?? [])].join(" \n "));

export function ministryChecks(e: Pick<StoreEvidence, "pages" | "website">, currency?: string | null): MinistryChecks | null {
  const seen = e.pages.filter(p => p.loaded);
  if (!seen.length) return null;
  const all = seen.map(text).join(" \n ");
  const before = seen.filter(p => p.pageType === "product" || p.pageType === "cart").map(text).join(" \n ");
  const items = {} as Record<MinistryItem, boolean>;
  for (const [k, re] of Object.entries(MINISTRY_PATTERNS) as Array<[MinistryItem, RegExp]>) items[k] = re.test(all);
  items.deliveryTime = PATTERNS.deliveryTime.test(before);
  let host = "";
  try { host = new URL(e.website).hostname; } catch { /* keep empty */ }
  const saudi = /\.sa$/.test(host) || (currency ?? "").toUpperCase() === "SAR" || /ر\.?\s?س|\bsar\b|ريال سعودي/.test(all);
  return { pages: [...new Set(seen.map(p => p.pageType))], items, saudi };
}
