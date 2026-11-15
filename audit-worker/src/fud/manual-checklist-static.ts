import type { ManualText } from "../types.js";
import type { ManualCheckpoint } from "./manual-checklist-data.js";
import { MEANS_DONE_AR } from "./manual-checklist-ar.js";

/**
 * "What this means" and "Done when" for each CRO checkpoint. They explain the
 * checkpoint, not the store, so no model writes them per audit: they come from
 * the agency's own text in manual-checklist-data.ts.
 *
 * - means = the agency's note ("why"), word for word.
 * - done  = "Pass looks like", word for word.
 * - Arabic = manual-checklist-ar.ts, the same text translated once (a model
 *   wrote it, an Arabic reader should check it). A checkpoint with no Arabic
 *   there shows the English text, as before.
 *
 * An entry in STATIC_WRITEUP wins over all of this, to hand-correct one
 * checkpoint's wording.
 */
export const STATIC_WRITEUP: Record<string, { means: ManualText; done: ManualText }> = {};

export function storedWriteup(c: Pick<ManualCheckpoint, "id" | "why" | "pass">): { means: ManualText; done: ManualText } {
  const ar = MEANS_DONE_AR[c.id];
  return STATIC_WRITEUP[c.id] ?? { means: { en: c.why, ar: ar?.[0] ?? c.why }, done: { en: c.pass, ar: ar?.[1] ?? c.pass } };
}
