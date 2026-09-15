// A client-facing slug now (e.g. "nour-home-goods-a1b2c3" — see
// audit-worker/src/supabase.ts's reportSlug()), not a bare UUID. The `:id`
// query-param name is unchanged from vercel.json's rewrite; only what it
// contains changed.
const REPORT_SLUG_RE = /^[a-zA-Z0-9_-]+$/;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const slug = String(req.query?.id || "").trim();
  if (!REPORT_SLUG_RE.test(slug)) {
    return res.status(400).send("Invalid audit report link.");
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;
  const defaultBucket = process.env.AUDIT_REPORTS_BUCKET || "audit-reports";

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("SUPABASE_URL / SUPABASE_SECRET_KEY environment variables are not set");
    return res.status(500).send("Audit report service is not configured.");
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // report_pages is the authority on where a report actually lives: a
    // test-mode run (see api/_lib/audit-intake.js) publishes to a separate
    // bucket, so the bucket can't be assumed from the slug alone. Rows
    // written before that column existed default to the live bucket, and a
    // report published before report_pages was introduced has no row at
    // all — hence the fallback to the conventional path below rather than a
    // 404 on a link that used to work.
    const { data: page, error: lookupError } = await supabase
      .from("report_pages")
      .select("bucket, storage_path")
      .eq("slug", slug)
      .maybeSingle();

    if (lookupError) {
      console.error("report_pages lookup error:", lookupError);
    }

    const bucket = page?.bucket || defaultBucket;
    const objectPath = page?.storage_path || `reports/${slug}/index.html`;
    const { data, error } = await supabase.storage.from(bucket).download(objectPath);

    if (error || !data) {
      console.error("Supabase report download error:", error);
      return res.status(404).send("Audit report not found.");
    }

    const html = await data.text();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
    return res.status(200).send(html);
  } catch (err) {
    console.error("audit-report serverless function error:", err);
    return res.status(500).send("Could not load audit report.");
  }
}
