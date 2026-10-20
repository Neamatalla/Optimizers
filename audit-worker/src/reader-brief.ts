// The reader briefs in icp/, read from disk. Kept apart from audience.ts so
// that module stays free of Node APIs: the report renderer imports it, and the
// renderer also runs in the browser (src/audit-report/main.ts).

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { AudienceRole } from "./audience.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICP_DIR = path.join(__dirname, "..", "icp");
const BRIEF_FILES: Record<AudienceRole, string> = {
  store_owner: "store-owner.md",
  media_buyer: "media-buyer.md",
  marketing_manager: "marketing-manager.md",
  agency: "agency.md",
};

/**
 * The reader brief added to the audit prompt, or null for no role (default
 * voice). The "## Arabic" section is cut: the audit writes English only, and
 * the Arabic register reaches the translation step through
 * arabicRegisterRule. Left in, the audit wrote its English fields in Arabic.
 */
export function readerBrief(role: AudienceRole | null | undefined): string | null {
  if (!role) return null;
  const file = BRIEF_FILES[role];
  try {
    const text = fs.readFileSync(path.join(ICP_DIR, file), "utf8").replace(/\r\n/g, "\n");
    return text.replace(/\n## Arabic\b[\s\S]*?(?=\n## |$)/, "").trim();
  } catch (err) {
    // A missing brief must not fail a paid-for audit: it falls back to the
    // default voice, and the log says why.
    console.warn(`[audit-worker] Reader brief ${file} unreadable, using the default voice: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}
