import { fetchClaritySnapshot, isValidClarityToken, ClarityError } from "../_lib/clarity.js";
import { normalizeHostname } from "../_lib/audit-intake.js";
import { log, withLog } from "../_lib/log.js";

// Called by the audit form when the visitor pastes a Clarity Data Export
// token. Pulls a snapshot of the last few days and returns it to the
// browser, which submits it with the audit request (see api/_lib/clarity.js
// for why the token itself is never stored or logged).
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = String(req.body?.token || "").trim();
  const website = String(req.body?.website || "").trim();
  if (!isValidClarityToken(token)) {
    return res.status(400).json({ error: "That doesn't look like a Clarity API token. Copy it from Clarity: Settings > Data Export." });
  }
  let websiteHostname;
  try {
    const url = new URL(website);
    if (!url.hostname.includes(".")) throw new Error("no TLD");
    websiteHostname = normalizeHostname(website);
  } catch {
    return res.status(400).json({ error: "Enter your website first." });
  }

  try {
    const snapshot = await fetchClaritySnapshot(token, websiteHostname);
    if (!snapshot.sessions) {
      return res.status(422).json({ error: "Clarity has no visits recorded for the last 3 days on this project." });
    }
    if (!snapshot.hostMatch) {
      return res.status(422).json({ error: `This Clarity project doesn't seem to track ${websiteHostname}. Check you copied the token from the right project.` });
    }
    return res.status(200).json({
      success: true,
      snapshot,
      summary: { sessions: snapshot.sessions, days: snapshot.days, breakdowns: !!(snapshot.byUrl || snapshot.byDevice) },
    });
  } catch (err) {
    if (err instanceof ClarityError) {
      if (err.kind === "auth") return res.status(401).json({ error: "Clarity didn't accept this token. Generate a new one in Settings > Data Export." });
      if (err.kind === "limit") return res.status(429).json({ error: "Clarity's daily limit for this project is used up. Try again tomorrow, or continue without Clarity." });
      log.warn("clarity connect: Clarity unavailable", { error: err.message });
      // Clarity has answered an empty 400 (not 429) once a project's 10 calls
      // for the day were spent, so a refusal says that instead of "unreachable".
      if (/answered 400\.$/.test(err.message)) return res.status(502).json({ error: "Clarity refused the request. This usually means this project's 10 data requests for today are used up. Try again tomorrow, or continue without Clarity." });
      return res.status(502).json({ error: "We couldn't reach Clarity right now. Try again, or continue without it." });
    }
    log.error("clarity connect error", { error: err?.message || err });
    return res.status(500).json({ error: "Something went wrong connecting Clarity." });
  }
}

export default withLog("clarity-connect", handler);
