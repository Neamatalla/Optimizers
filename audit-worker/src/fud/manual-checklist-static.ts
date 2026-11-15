import type { ManualText } from "../types.js";

/**
 * "What this means" and "Done when" for each CRO checkpoint, written once in
 * English and Arabic. They explain the checkpoint, not the store, so there is
 * no reason to pay for them again in every audit. A checkpoint listed here has
 * them left out of the write-up request (manual-checklist.ts) and filled in
 * from here. A checkpoint not listed is written per audit, as before.
 *
 * Empty until generated: `npm run gen-static-writeups` writes this file with
 * the writer model (one run, a few cents). Review the result, then commit.
 */
export const STATIC_WRITEUP: Record<string, { means: ManualText; done: ManualText }> = {};
