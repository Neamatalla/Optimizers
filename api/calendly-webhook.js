// Calendly webhook -> GA4 (server-side). Confirms bookings even when the visitor's browser blocks GA.
// Setup: create a Calendly webhook subscription (invitee.created, invitee.canceled) pointing to
// https://www.optimizers.agency/api/calendly-webhook with a signing key, then set in Vercel:
//   CALENDLY_WEBHOOK_SIGNING_KEY, GA4_API_SECRET
// The site passes the visitor's GA4 client_id / session_id in Calendly's utm_content / utm_term.
// No personal data (name, email, answers) is sent to GA4.
import crypto from "node:crypto";
import { ga4Configured, readRawBody, safeEqual, sendGa4Event } from "./_ga4.js";

export const config = { api: { bodyParser: false } };

function validSignature(header, raw, key) {
  // Calendly-Webhook-Signature: t=<timestamp>,v1=<hex hmac-sha256 of "t.raw">
  const parts = Object.fromEntries(String(header || "").split(",").map((p) => p.split("=")));
  if (!parts.t || !parts.v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(parts.t)) > 300) return false; // replay window: 5 min
  const expected = crypto.createHmac("sha256", key).update(`${parts.t}.${raw}`).digest("hex");
  return safeEqual(expected, parts.v1);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!key || !ga4Configured()) return res.status(503).json({ error: "Calendly webhook tracking is not configured." });

  const raw = await readRawBody(req);
  if (!validSignature(req.headers["calendly-webhook-signature"], raw, key)) return res.status(401).json({ error: "Invalid signature" });

  let body;
  try { body = JSON.parse(raw); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
  const event = body?.event;
  if (event !== "invitee.created" && event !== "invitee.canceled") return res.status(200).json({ ignored: event });

  const p = body.payload || {};
  const tracking = p.tracking || {};
  const clientId = /^\d+\.\d+$/.test(tracking.utm_content || "") ? tracking.utm_content : undefined;
  const sessionId = /^\d+$/.test(tracking.utm_term || "") ? Number(tracking.utm_term) : undefined;
  try {
    await sendGa4Event({
      clientId,
      sessionId,
      name: event === "invitee.created" ? "booking_confirmed" : "booking_canceled",
      params: {
        booking_source: "calendly_webhook",
        booking_event_name: p.scheduled_event?.name,
        booking_start_time: p.scheduled_event?.start_time,
        booking_is_rescheduled: Boolean(p.rescheduled || p.old_invitee),
        booking_utm_source: tracking.utm_source,
        booking_utm_medium: tracking.utm_medium,
        ga_client_known: Boolean(clientId),
      },
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Calendly webhook -> GA4 failed:", err);
    return res.status(502).json({ error: "GA4 send failed" });
  }
}
