import { exchangeCodeForToken, fetchAllGA4Properties, fetchAllGTMContainers, describeOAuthResult } from "../../_lib/google-oauth.js";

function popupResponseHtml(payload) {
  // Self-closing page: posts the result to the opener (the main site tab)
  // and closes. targetOrigin is derived from our own configured redirect
  // URI, never from request headers — keeps the postMessage recipient
  // pinned to a known origin regardless of how this page was reached.
  const origin = new URL(process.env.GOOGLE_OAUTH_REDIRECT_URI).origin;
  return `<!doctype html><html><body>
<script>
  window.opener && window.opener.postMessage(${JSON.stringify(payload)}, ${JSON.stringify(origin)});
  window.close();
</script>
Connected — you can close this window.
</body></html>`;
}

function parseCookies(header) {
  const out = {};
  (header || "").split(";").forEach(part => {
    const [k, ...v] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(v.join("="));
  });
  return out;
}

export default async function handler(req, res) {
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
  console.log("[oauth-callback] hit, has code:", Boolean(code), "has error:", Boolean(oauthError));

  if (oauthError) {
    console.log("[oauth-callback] Google denied access:", oauthError);
    res.statusCode = 200;
    res.end(popupResponseHtml({ type: "google-oauth-result", error: `Google denied access: ${oauthError}` }));
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
    console.log("[oauth-callback] state mismatch — nonce:", nonce, "cookie:", cookies.g_oauth_state);
    res.statusCode = 200;
    res.end(popupResponseHtml({ type: "google-oauth-result", error: "State mismatch — please try connecting again." }));
    return;
  }

  try {
    const token = await exchangeCodeForToken({ clientId, clientSecret, redirectUri, code });
    console.log("[oauth-callback] token exchange OK");
    const [ga4Properties, gtmContainers] = await Promise.all([
      fetchAllGA4Properties(token),
      fetchAllGTMContainers(token),
    ]);
    console.log(
      "[oauth-callback] ga4Properties:",
      Array.isArray(ga4Properties) ? `${ga4Properties.length} found` : `ERROR: ${ga4Properties.error}`
    );
    console.log(
      "[oauth-callback] gtmContainers:",
      Array.isArray(gtmContainers) ? `${gtmContainers.length} found` : `ERROR: ${gtmContainers.error}`
    );
    console.log(describeOAuthResult({ ga4Properties, gtmContainers }));
    res.statusCode = 200;
    // A failed fetch travels as its own field rather than collapsing into an
    // empty list: the form used to render "no accessible GA4 properties" for
    // a 403/quota error, which reads as "your account has none" and sends
    // the visitor looking in the wrong place.
    res.end(popupResponseHtml({
      type: "google-oauth-result",
      ga4Properties: Array.isArray(ga4Properties) ? ga4Properties : [],
      gtmContainers: Array.isArray(gtmContainers) ? gtmContainers : [],
      ga4Error: Array.isArray(ga4Properties) ? undefined : ga4Properties?.error,
      gtmError: Array.isArray(gtmContainers) ? undefined : gtmContainers?.error,
    }));
  } catch (err) {
    console.log("[oauth-callback] FAILED:", err.message || err);
    res.statusCode = 200;
    res.end(popupResponseHtml({ type: "google-oauth-result", error: err.message || "Connection failed." }));
  }
}
