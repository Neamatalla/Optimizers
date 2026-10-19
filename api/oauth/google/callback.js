import { exchangeCodeForToken, fetchAllGA4Properties, fetchAllGTMContainers, describeOAuthResult, oauthResultHtml } from "../../_lib/google-oauth.js";
import { log, withLog } from "../../_lib/log.js";

function parseCookies(header) {
  const out = {};
  (header || "").split(";").forEach(part => {
    const [k, ...v] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(v.join("="));
  });
  return out;
}

async function handler(req, res) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    res.statusCode = 500;
    res.end("Google OAuth is not configured.");
    return;
  }

  const { code, state, error: oauthError } = req.query;
  res.setHeader("Content-Type", "text/html");

  if (oauthError) {
    log.warn("Google denied access", { oauthError });
    res.statusCode = 200;
    res.end(oauthResultHtml({ type: "google-oauth-result", error: `Google denied access: ${oauthError}` }));
    return;
  }

  // state is just the CSRF nonce now — no candidate-ID payload embedded in
  // it any more. Matching moved client-side (GetFreeAudit.tsx stars whichever
  // returned property/container matches what the site crawl found), since
  // the callback now returns every accessible property/container rather
  // than trying to pick one on the server.
  const cookies = parseCookies(req.headers.cookie);
  const nonce = String(state || "");
  if (!nonce || nonce !== cookies.g_oauth_state) {
    // Only whether each side was there: the values are the CSRF secret.
    log.warn("OAuth state mismatch", { hasState: Boolean(nonce), hasCookie: Boolean(cookies.g_oauth_state) });
    res.statusCode = 200;
    res.end(oauthResultHtml({ type: "google-oauth-result", error: "State mismatch — please try connecting again." }));
    return;
  }

  try {
    const token = await exchangeCodeForToken({ clientId, clientSecret, redirectUri, code });
    log.info("Token exchange OK");
    const [ga4Properties, gtmContainers] = await Promise.all([
      fetchAllGA4Properties(token),
      fetchAllGTMContainers(token),
    ]);
    log.info("Fetched Google accounts", {
      ga4Properties: Array.isArray(ga4Properties) ? `${ga4Properties.length} found` : `ERROR: ${ga4Properties.error}`,
      gtmContainers: Array.isArray(gtmContainers) ? `${gtmContainers.length} found` : `ERROR: ${gtmContainers.error}`,
      detail: describeOAuthResult({ ga4Properties, gtmContainers }),
    });
    res.statusCode = 200;
    // A failed fetch travels as its own field rather than collapsing into an
    // empty list: the form used to render "no accessible GA4 properties" for
    // a 403/quota error, which reads as "your account has none" and sends
    // the visitor looking in the wrong place.
    res.end(oauthResultHtml({
      type: "google-oauth-result",
      ga4Properties: Array.isArray(ga4Properties) ? ga4Properties : [],
      gtmContainers: Array.isArray(gtmContainers) ? gtmContainers : [],
      ga4Error: Array.isArray(ga4Properties) ? undefined : ga4Properties?.error,
      gtmError: Array.isArray(gtmContainers) ? undefined : gtmContainers?.error,
    }));
  } catch (err) {
    log.error("OAuth callback failed", { error: err.message || err });
    res.statusCode = 200;
    res.end(oauthResultHtml({ type: "google-oauth-result", error: err.message || "Connection failed." }));
  }
}

export default withLog("oauth-callback", handler);
