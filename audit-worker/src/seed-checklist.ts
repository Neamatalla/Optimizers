import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { GA4_CHECKLIST, GTM_CHECKLIST, WEBSITE_CHECKLIST, type ChecklistPoint } from "./checklist.js";
import type { CategoryKey } from "./types.js";

/**
 * Mirrors checklist.ts's three canonical arrays into Supabase's
 * checklist_points table (see supabase/schema-content-backend.sql) — a
 * reference/display copy, NOT the live source the audit pipeline reads
 * from. audit-prompt.ts and scoring.ts still import checklist.ts directly
 * at runtime, unchanged by this. Run after any checklist.ts edit:
 *
 *   npm run seed-checklist
 *
 * WEBSITE_CODE_CHECKLIST is deliberately not seeded separately — it's a
 * filtered subset of WEBSITE_CHECKLIST sharing the exact same ids (see
 * checklist.ts), already covered by seeding the full WEBSITE_CHECKLIST once.
 */
const SOURCES: Array<{ category: CategoryKey; points: ChecklistPoint[] }> = [
  { category: "GA4", points: GA4_CHECKLIST },
  { category: "GTM", points: GTM_CHECKLIST },
  { category: "Website", points: WEBSITE_CHECKLIST },
];

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY are not set — see audit-worker/.env.example");
  }
  const supabase = createClient(url, key);

  const rows = SOURCES.flatMap(({ category, points }) =>
    points.map((p, index) => ({
      id: p.id,
      category,
      title: p.title,
      expected_state: p.expectedState,
      common_failure: p.commonFailure,
      validate: p.validate,
      severity: p.severity,
      sort_order: index,
    })),
  );

  const { error } = await supabase.from("checklist_points").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`Supabase upsert error: ${error.message}`);

  console.log(`Seeded ${rows.length} checklist points into Supabase (checklist_points table).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
