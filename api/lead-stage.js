// Lead pipeline -> GA4 (server-side): report what happened to a lead after the call, so GA4 can
// attribute qualified leads and closed revenue to the channel that brought them.
//
// POST /api/lead-stage   header: x-lead-stage-key: <LEAD_STAGE_KEY>
// { "client_id": "123.456",            // "GA4 client ID" row in the lead email
//   "session_id": "1730000000",        // optional, "GA4 session ID" row
//   "stage": "qualified" | "working" | "disqualified" | "won" | "lost",
//   "value": 12000, "currency": "SAR", // for "won" (deal value)
//   "lead_id": "optional internal id" }
// Env (Vercel): LEAD_STAGE_KEY, GA4_API_SECRET
import { ga4Configured, safeEqual, sendGa4Event } from "./_ga4.js";

// GA4 recommended lead-funnel events.
const STAGE_EVENTS = {
  working: "working_lead",
  qualified: "qualify_lead",
  disqualified: "disqualify_lead",
  won: "close_convert_lead",
  lost: "close_unconvert_lead",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.LEAD_STAGE_KEY;
  if (!key || !ga4Configured()) return res.status(503).json({ error: "Lead stage tracking is not configured." });
  if (!safeEqual(req.headers["x-lead-stage-key"] || "", key)) return res.status(401).json({ error: "Unauthorized" });

  const { client_id, session_id, stage, value, currency, lead_id } = req.body || {};
  const name = STAGE_EVENTS[stage];
  if (!name) return res.status(400).json({ error: `stage must be one of: ${Object.keys(STAGE_EVENTS).join(", ")}` });
  if (!/^\d+\.\d+$/.test(String(client_id || ""))) return res.status(400).json({ error: "client_id (from the lead email) is required, e.g. 123456789.1730000000" });
  const amount = value === undefined ? undefined : Number(value);
  if (amount !== undefined && !(amount >= 0)) return res.status(400).json({ error: "value must be a positive number" });
  if (amount !== undefined && !/^[A-Z]{3}$/.test(String(currency || ""))) return res.status(400).json({ error: "currency (ISO code, e.g. SAR) is required with value" });

  try {
    await sendGa4Event({
      clientId: String(client_id),
      sessionId: /^\d+$/.test(String(session_id || "")) ? Number(session_id) : undefined,
      name,
      params: { lead_stage: stage, value: amount, currency: amount !== undefined ? currency : undefined, lead_id: lead_id ? String(lead_id) : undefined, lead_source: "strategy_session_form" },
    });
    return res.status(200).json({ ok: true, event: name });
  } catch (err) {
    console.error("lead-stage -> GA4 failed:", err);
    return res.status(502).json({ error: "GA4 send failed" });
  }
}
