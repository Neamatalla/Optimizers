import type { AudienceRole } from "../../audience.js";
import { pointById } from "../index.js";
import type { RuleResult } from "../rules/types.js";
import { TEMPLATES } from "./index.js";
import type { Copy, Lang, PartialCopy } from "./types.js";

export interface RenderedFinding {
  technical: { summary: string; detail: string };
  business: { summary: string; detail: string };
  step?: string;
  doneWhen?: string;
  protect?: string;
  // Slots the template asked for that the rule didn't provide. The text that
  // used them fell back to the rule's sentence (technical) or was dropped.
  missingSlots: string[];
  // True when no template exists and generic text was used.
  generic: boolean;
}

const SLOT = /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g;

function show(v: unknown): string {
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "number") return Number.isInteger(v) ? v.toLocaleString("en-US") : String(Math.round(v * 100) / 100);
  return String(v);
}

// Fills {slots}; returns null when a slot has no value.
function fill(text: string, values: Record<string, unknown>, missing: Set<string>): string | null {
  let ok = true;
  const out = text.replace(SLOT, (_, name: string) => {
    const v = values[name];
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) {
      missing.add(name);
      ok = false;
      return "";
    }
    return show(v);
  });
  return ok ? out : null;
}

function merge(base: Copy, over?: PartialCopy): Copy {
  if (!over) return base;
  return {
    ...base,
    ...over,
    technical: { ...base.technical, ...over.technical },
    business: { ...base.business, ...over.business },
  };
}

const GENERIC: Record<Lang, { unverified: string; na: string; detail: string }> = {
  en: { unverified: "Not checked this run.", na: "Doesn't apply to this store.", detail: "Worth a manual look before relying on it." },
  ar: { unverified: "لم نتمكن من فحص هذا البند في هذه الزيارة.", na: "هذا البند لا ينطبق على هذا المتجر.", detail: "يستحق نظرة يدوية قبل الاعتماد عليه." },
};

/**
 * The report text for one point, from its template and the rule's result.
 * Unverified and n/a get short generic text (with the rule's reason in
 * English). Arabic falls back to English when the point has no Arabic copy.
 */
export function renderFinding(pointId: string, result: RuleResult, opts: { role?: AudienceRole | null; lang?: Lang } = {}): RenderedFinding {
  const lang = opts.lang ?? "en";
  const missing = new Set<string>();
  const point = pointById(pointId);
  const tpl = TEMPLATES[pointId];
  // Arabic falls back to English text when the point has no Arabic copy yet.
  const useLang: Lang = lang === "ar" && tpl?.ar ? "ar" : "en";
  const copies = useLang === "ar" ? tpl!.ar : tpl?.en;

  if (result.status === "unverified" || result.status === "n/a" || !copies) {
    const g = GENERIC[useLang];
    const title = point?.roleCopy[opts.role ?? "store_owner"]?.title ?? point?.title ?? pointId;
    const head = result.status === "n/a" ? g.na : result.status === "unverified" ? g.unverified : title;
    return {
      // The rule's own sentence is English; Arabic shows the generic line.
      technical: { summary: useLang === "en" ? result.reason : head, detail: "" },
      business: { summary: head, detail: result.status === "unverified" ? g.detail : "" },
      missingSlots: [],
      generic: !copies,
    };
  }

  const status = result.status;
  const role = opts.role ?? undefined;
  const copy = merge(copies.default[status], role ? copies[role]?.[status] : undefined);
  const values: Record<string, unknown> = {
    ...result.facts,
    reason: useLang === "en" ? result.reason : undefined,
    // The AI's observation in this language. In English, a point code settled
    // (no observation) shows the rule's own sentence instead.
    observation: useLang === "en" ? (result.observation?.en ?? result.reason) : result.observation?.ar,
  };
  const f = (text: string | undefined) => (text ? fill(text, values, missing) : null);
  const strip = (text: string) => text.replace(SLOT, "").replace(/\s{2,}/g, " ").trim();
  const bizSummary = f(copy.business.summary) ?? strip(copy.business.summary);

  // A technical summary with a missing slot falls back to the rule's sentence
  // (English) or the template line without the slot (Arabic); an Arabic line
  // that was only a slot falls back to the business summary.
  const techSummary = f(copy.technical.summary) ?? (useLang === "en" ? result.reason : strip(copy.technical.summary) || bizSummary);
  const out: RenderedFinding = {
    technical: { summary: techSummary, detail: f(copy.technical.detail) ?? "" },
    business: { summary: bizSummary, detail: f(copy.business.detail) ?? "" },
    missingSlots: [...missing],
    generic: false,
  };
  if (status === "fail") {
    out.step = f(copy.step) ?? point?.defaultAction;
    out.doneWhen = f(copy.doneWhen) ?? point?.doneWhen;
  } else {
    out.protect = f(copy.protect) ?? undefined;
  }
  return out;
}
