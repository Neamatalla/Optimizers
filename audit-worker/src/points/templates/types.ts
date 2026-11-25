import type { AudienceRole } from "../../audience.js";

/**
 * Written report text for a master point, so the AI doesn't write the same
 * finding again on every run (PHASE1-PLAN.md step 4). A code rule
 * (src/points/rules) decides the status and hands over facts; the template
 * turns them into the two voices the report shows.
 *
 * Slots: {name} is replaced by the rule's facts[name] (arrays joined with
 * ", "), and {reason} by the rule's own sentence (English only). A slot the
 * rule didn't provide makes the renderer fall back (render.ts), so a raw
 * "{x}" never reaches a report.
 *
 * Points the AI judges (decidedBy "code+ai" or "ai") get a frame: the same
 * shape, with {observation} where the AI's store-specific finding goes (in
 * the report's language). Why it matters, the fix, done-when and each
 * reader's version stay fixed.
 */

export interface Voice {
  summary: string;
  detail: string;
}

export interface Copy {
  // Engineer register: the literal state with the store's values.
  technical: Voice;
  // Reader register: the same finding in plain words, then what it costs or protects.
  business: Voice;
  // Fail only: the fix and how the reader knows it's done.
  step?: string;
  doneWhen?: string;
  // Pass only: what keeps the result clean.
  protect?: string;
}

// A role's copy may override any part; what it leaves out comes from default.
export type PartialCopy = { technical?: Partial<Voice>; business?: Partial<Voice>; step?: string; doneWhen?: string; protect?: string };

export interface ByStatus {
  pass: Copy;
  fail: Copy;
}

export type RoleCopies = { default: ByStatus } & Partial<Record<AudienceRole, Partial<Record<"pass" | "fail", PartialCopy>>>>;

export interface PointTemplate {
  en: RoleCopies;
  // Arabic, in each reader's register (audience.ts arabicRegisterRule).
  ar?: RoleCopies;
}

export type Lang = "en" | "ar";
