// Shared, platform-agnostic report-edit logic. Imported by both
// api/report/edit.js (the real Vercel function) and vite.config.ts's dev
// middleware — one implementation, not duplicated per platform, since none
// of this touches req/res (same reasoning as google-oauth.js).
import crypto from "node:crypto";

// Same slug shape api/audit-report.js already validates against.
export const REPORT_SLUG_RE = /^[a-zA-Z0-9_-]+$/;

// Constant-time compare so a timing attack can't narrow down the key
// character-by-character.
export function isAuthorized(providedKey, expectedKey) {
  if (!expectedKey) return false;
  if (typeof providedKey !== "string") return false;
  const a = Buffer.from(providedKey);
  const b = Buffer.from(expectedKey);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function getReportHtml({ supabase, bucket, slug }) {
  if (!REPORT_SLUG_RE.test(slug)) {
    return { status: 400, body: { error: "Invalid slug." } };
  }

  // bucket comes from the row, not the caller: a test-mode report lives in
  // a different bucket (see audit-worker/src/supabase.ts), and the passed-in
  // `bucket` is only the fallback for rows written before that column
  // existed.
  const { data: page, error: lookupError } = await supabase
    .from("report_pages")
    .select("slug, storage_path, public_url, updated_at, bucket")
    .eq("slug", slug)
    .maybeSingle();

  if (lookupError) {
    console.error("report_pages lookup error:", lookupError);
    return { status: 500, body: { error: "Could not look up report page." } };
  }
  if (!page) {
    return { status: 404, body: { error: "Unknown report slug." } };
  }

  const { data, error: downloadError } = await supabase.storage.from(page.bucket || bucket).download(page.storage_path);
  if (downloadError || !data) {
    console.error("Supabase report download error:", downloadError);
    return { status: 404, body: { error: "Report file not found in storage." } };
  }

  const html = await data.text();
  return { status: 200, body: { slug: page.slug, publicUrl: page.public_url, updatedAt: page.updated_at, html } };
}

export async function updateReportHtml({ supabase, bucket, slug, html }) {
  const trimmedSlug = String(slug || "").trim();
  if (!REPORT_SLUG_RE.test(trimmedSlug)) {
    return { status: 400, body: { error: "Invalid slug." } };
  }
  if (typeof html !== "string" || html.trim().length === 0) {
    return { status: 400, body: { error: "html is required and must be a non-empty string." } };
  }

  const { data: page, error: lookupError } = await supabase
    .from("report_pages")
    .select("id, storage_path, bucket")
    .eq("slug", trimmedSlug)
    .maybeSingle();

  if (lookupError) {
    console.error("report_pages lookup error:", lookupError);
    return { status: 500, body: { error: "Could not look up report page." } };
  }
  if (!page) {
    return { status: 404, body: { error: "Unknown report slug." } };
  }

  const { error: uploadError } = await supabase.storage
    .from(page.bucket || bucket)
    .upload(page.storage_path, Buffer.from(html, "utf8"), {
      contentType: "text/html; charset=utf-8",
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("Supabase report upload error:", uploadError);
    return { status: 500, body: { error: "Could not save report page." } };
  }

  // Bumps updated_at via the table's own trigger (set_report_pages_updated_at)
  // — there's no separate content column on this row to actually change, the
  // real content lives in Storage above; this update's only purpose is
  // recording when the page was last edited.
  const { error: updateError } = await supabase
    .from("report_pages")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", page.id);

  if (updateError) {
    console.error("report_pages update error (non-fatal, file already saved):", updateError);
  }

  return { status: 200, body: { success: true, slug: trimmedSlug } };
}
