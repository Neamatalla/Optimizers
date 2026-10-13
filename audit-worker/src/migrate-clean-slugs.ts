/**
 * One-off (2026-10-13): renames every published report to the clean slug
 * reportSlug() now produces — the site's domain, "test_" in front for test
 * runs — dropping the old "-<6 hex of the request id>" suffix. Recorded in
 * supabase/migrations/2026-10-13-1-clean-report-slugs.md.
 *
 *   npm run migrate-clean-slugs            dry run: prints what would change
 *   npm run migrate-clean-slugs -- --apply moves the files and updates the rows
 *
 * Runs against whichever project audit-worker/.env points at. Per report:
 * the Storage file is MOVED (not copied, so nothing stays reachable under
 * the old path), then report_pages and audit_requests (report_url and
 * progress.slug/reportUrl) are updated. Links also gain the https:// that
 * staging's scheme-less PUBLIC_SITE_URL left off. Safe to re-run: rows
 * already on their clean slug and URL are skipped.
 *
 *   --drop-test-reports  first deletes every test report: the files and
 *                        report_pages row of each is_test request (in either
 *                        bucket — pre-cutover tests sit in the real one), and
 *                        anything else left in the test bucket. The
 *                        audit_requests rows stay. Needed where many test runs
 *                        of one site would otherwise all want its single
 *                        test_ slug.
 *   --drop-all-reports   the same for EVERY report, test or not, and anything
 *                        left in either bucket — for a project whose reports
 *                        were all throwaway (production before launch: 30).
 */
import "dotenv/config";
import { getClient, publicSiteUrl, reportSlug } from "./supabase.js";

interface Row {
  id: string;
  slug: string;
  bucket: string;
  storage_path: string;
  public_url: string | null;
  audit_requests: { id: string; website: string; is_test: boolean; report_url: string | null; progress: Record<string, unknown> | null } | null;
}

// Keeps the link's own host (each project's rows point at its own site),
// adding the scheme when it's missing.
function rebuildUrl(oldUrl: string | null, slug: string): string {
  const host = oldUrl?.replace(/\/audit-reports\/.*$/, "").replace(/\/$/, "");
  const base = !host ? publicSiteUrl() : /^https?:\/\//i.test(host) ? host : `https://${host}`;
  return `${base}/audit-reports/${encodeURIComponent(slug)}`;
}

// Every file under reports/<folder>/ in a bucket (index.html, and anything
// else a run may have left beside it).
async function folderFiles(bucket: string, folder: string): Promise<string[]> {
  const { data, error } = await getClient().storage.from(bucket).list(`reports/${folder}`, { limit: 1000 });
  if (error) throw new Error(`listing ${bucket}/reports/${folder} failed: ${error.message}`);
  return (data ?? []).map(f => `reports/${folder}/${f.name}`);
}

// Deletes the given reports (files + report_pages row) and every other
// folder left in `sweepBuckets`. Returns the rows still standing.
async function dropReports(rows: Row[], drop: (r: Row) => boolean, sweepBuckets: string[], apply: boolean): Promise<Row[]> {
  const supabase = getClient();
  const doomed = rows.filter(drop);
  const strays: [string, string][] = [];
  for (const bucket of sweepBuckets) {
    const { data: folders, error } = await supabase.storage.from(bucket).list("reports", { limit: 1000 });
    if (error) throw new Error(`listing ${bucket} failed: ${error.message}`);
    for (const f of folders ?? []) {
      if (!doomed.some(d => d.bucket === bucket && d.slug === f.name)) strays.push([bucket, f.name]);
    }
  }

  console.log(`Dropping ${doomed.length} report(s) and ${strays.length} stray folder(s) in ${sweepBuckets.join(", ")}`);
  for (const d of doomed) console.log(`  - ${d.slug} [${d.bucket}${d.audit_requests?.is_test ? ", test" : ""}]`);
  for (const [bucket, name] of strays) console.log(`  - ${name} [${bucket}, no report_pages row]`);
  if (apply) {
    for (const d of doomed) {
      const files = await folderFiles(d.bucket, d.slug);
      if (files.length) {
        const { error } = await supabase.storage.from(d.bucket).remove(files);
        if (error) throw new Error(`${d.slug}: file delete failed (${error.message})`);
      }
      const { error } = await supabase.from("report_pages").delete().eq("id", d.id);
      if (error) throw new Error(`${d.slug}: report_pages delete failed (${error.message}); its files are already gone`);
    }
    for (const [bucket, name] of strays) {
      const files = await folderFiles(bucket, name);
      if (files.length) {
        const { error } = await supabase.storage.from(bucket).remove(files);
        if (error) throw new Error(`${name}: stray folder delete failed (${error.message})`);
      }
    }
    console.log("  dropped");
  }
  console.log("");
  return rows.filter(r => !drop(r));
}

async function main() {
  const apply = process.argv.includes("--apply");
  const supabase = getClient();
  console.log(`${apply ? "APPLYING" : "DRY RUN"} against ${process.env.SUPABASE_URL}\n`);

  const { data, error } = await supabase
    .from("report_pages")
    .select("id, slug, bucket, storage_path, public_url, audit_requests(id, website, is_test, report_url, progress)");
  if (error) throw new Error(`report_pages read failed: ${error.message}`);
  let rows = data as unknown as Row[];
  const realBucket = process.env.AUDIT_REPORTS_BUCKET || "audit-reports";
  const testBucket = process.env.AUDIT_REPORTS_TEST_BUCKET || "audit-reports-test";
  if (process.argv.includes("--drop-all-reports")) {
    rows = await dropReports(rows, () => true, [realBucket, testBucket], apply);
  } else if (process.argv.includes("--drop-test-reports")) {
    rows = await dropReports(rows, r => Boolean(r.audit_requests?.is_test), [testBucket], apply);
  }

  const plans = rows.flatMap(row => {
    const req = row.audit_requests;
    if (!req) {
      console.warn(`! ${row.slug}: no linked audit_requests row, skipped`);
      return [];
    }
    const slug = reportSlug({ website: req.website, isTest: req.is_test });
    const url = rebuildUrl(row.public_url, slug);
    if (slug === row.slug && url === row.public_url && url === req.report_url) return [];
    return [{ row, req, slug, url, path: `reports/${slug}/index.html` }];
  });

  // Pre-flight: nothing is written if any target is shared or already taken.
  const clashes: string[] = [];
  const targets = new Map<string, string>();
  for (const p of plans) {
    if (targets.has(p.slug) && p.slug !== p.row.slug) clashes.push(`${p.slug}: wanted by ${targets.get(p.slug)} and ${p.row.slug}`);
    targets.set(p.slug, p.row.slug);
    const taken = rows.find(r => r.slug === p.slug && r.id !== p.row.id);
    if (taken) clashes.push(`${p.slug}: already used by report_pages ${taken.id}`);
  }
  if (clashes.length) {
    console.error("Aborting, nothing changed. Slug clashes:\n  " + clashes.join("\n  "));
    process.exit(1);
  }

  console.log(`${rows.length} report(s), ${plans.length} to change\n`);
  for (const p of plans) {
    console.log(`${p.row.slug} -> ${p.slug}  [${p.row.bucket}${p.req.is_test ? ", test" : ""}]\n  ${p.url}`);
    if (!apply) continue;

    const step = async (name: string, run: () => PromiseLike<{ error: { message: string } | null }>) => {
      const { error } = await run();
      if (error) throw new Error(`${p.row.slug}: ${name} failed (${error.message}); earlier steps for this row are done, finish it by hand`);
    };
    if (p.path !== p.row.storage_path) {
      await step("storage move", () => supabase.storage.from(p.row.bucket).move(p.row.storage_path, p.path));
    }
    await step("report_pages update", () =>
      supabase.from("report_pages").update({ slug: p.slug, storage_path: p.path, public_url: p.url }).eq("id", p.row.id));
    const progress = { ...(p.req.progress ?? {}) };
    if (progress.slug) progress.slug = p.slug;
    if (progress.reportUrl) progress.reportUrl = p.url;
    await step("audit_requests update", () =>
      supabase.from("audit_requests").update({ report_url: p.url, progress }).eq("id", p.req.id));
    console.log("  done");
  }
  if (!apply && plans.length) console.log("\nDry run only. Re-run with --apply to make these changes.");
}

main().catch(err => {
  console.error(err?.message ?? err);
  process.exit(1);
});
