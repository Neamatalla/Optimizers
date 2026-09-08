import { detectTracking } from "./_lib/detect-tracking.js";

// Called by the form right after the visitor enters their website URL — see
// GetFreeAudit.tsx's website step. Best-effort only: this is a UX nicety
// (prefilling the GA4/GTM ID fields before OAuth) not a security or
// correctness boundary, so a failed/empty crawl just means empty prefill
// candidates, never a blocked submission.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const website = String(req.query?.website || "").trim();
  if (!website) {
    return res.status(400).json({ error: "Missing website." });
  }

  let websiteUrl;
  try {
    websiteUrl = new URL(website);
    if (!websiteUrl.hostname.includes(".")) throw new Error("no TLD");
  } catch {
    return res.status(400).json({ error: "Invalid website URL." });
  }

  try {
    const ids = await detectTracking(websiteUrl.toString());
    res.setHeader("Cache-Control", "private, max-age=60");
    return res.status(200).json({ success: true, ...ids });
  } catch (err) {
    // Non-fatal from the visitor's point of view — log and return empty
    // candidates rather than an error the form would need to surface.
    console.error("detect-tracking error:", err?.message || err);
    return res.status(200).json({ success: false, ga4MeasurementIds: [], gtmContainerIds: [] });
  }
}
