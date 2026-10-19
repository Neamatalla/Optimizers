import crypto from "crypto";
import { buildAuthorizeUrl } from "../../_lib/google-oauth.js";
import { withLog } from "../../_lib/log.js";

// Started as a same-tab navigation from the form (see GetFreeAudit.tsx) —
// the form snapshots its state to sessionStorage first and restores it when
// the callback sends the visitor back (see oauthResultHtml). State CSRF protection: a random nonce goes in an httpOnly
// cookie AND is echoed verbatim as the `state` param Google returns; the
// callback checks they match. No candidate GA4/GTM IDs ride along in state
// any more — the callback now returns every accessible property/container,
// and matching against the site crawl's candidates happens client-side.
async function handler(req, res) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    res.statusCode = 500;
    res.end("Google OAuth is not configured.");
    return;
  }

  const nonce = crypto.randomBytes(16).toString("hex");

  res.setHeader("Set-Cookie", `g_oauth_state=${nonce}; HttpOnly; Max-Age=300; SameSite=Lax; Path=/api/oauth/google`);
  res.statusCode = 302;
  res.setHeader("Location", buildAuthorizeUrl({ clientId, redirectUri, state: nonce }));
  res.end();
}

export default withLog("oauth-authorize", handler);
