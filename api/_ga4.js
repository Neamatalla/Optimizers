// Shared GA4 Measurement Protocol sender for server-side events (files starting with "_" are not routes on Vercel).
// Needs GA4_API_SECRET (GA4 Admin > Data streams > Measurement Protocol API secrets); GA4_MEASUREMENT_ID defaults to the site stream.
import crypto from "node:crypto";

export const ga4Configured = () => Boolean(process.env.GA4_API_SECRET);

/** A GA4 client_id like the _ga cookie's ("123.456"); generated when the visitor's is unknown. */
export const fallbackClientId = () => `${crypto.randomInt(1e9, 2e9)}.${Math.floor(Date.now() / 1000)}`;

export async function sendGa4Event({ clientId, sessionId, name, params = {} }) {
  const measurementId = process.env.GA4_MEASUREMENT_ID || "G-QVT0L5BCEB";
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${encodeURIComponent(process.env.GA4_API_SECRET)}`;
  const clean = Object.fromEntries(Object.entries({ ...params, session_id: sessionId, engagement_time_msec: 1, event_source: "server" })
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => [k, typeof v === "string" ? v.slice(0, 100) : v]));
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_id: clientId || fallbackClientId(), events: [{ name, params: clean }] }) });
  if (!r.ok) throw new Error(`GA4 MP ${r.status}`);
}

export async function readRawBody(req) {
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === "string" ? Buffer.from(c) : c);
  return Buffer.concat(chunks).toString("utf8");
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
