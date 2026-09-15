# audit-worker

Headless worker for the website's "Get a Free Audit" feature. Polls the
`audit_requests` Supabase table for new submissions and processes each one via
`claude -p` (Claude Code's non-interactive/headless mode) — crawling the site,
calling the GA4/GTM APIs where access is available, driving a real headless
browser over the site, generating a branded HTML report page, and emailing
the link via Resend.

This is a **separate Node project from the website** — not built by Vite, not
deployed to Vercel. It runs on a machine you actually control, because it logs
in as `claude` and that can't happen inside a stateless serverless function.

## Why it's separate

`claude -p` needs a real, persistent environment: a filesystem for its config,
a place for the GA4/GTM MCP servers' service-account key files to live,
and no per-request cold start. Vercel functions are the opposite of that. So:
the website (`api/audit-request.js`) only ever writes a row to Supabase and
returns immediately — this project is what actually does the work, running
wherever you start it.

## One-time setup

1. `npm install` in this folder.
2. Copy `.env.example` to `.env` and fill in every value — see the comments in
   that file for what each one is. In particular:
   - `SUPABASE_URL` / `SUPABASE_SECRET_KEY` — same Supabase project as the
     website's `api/audit-request.js` (get the **secret** key — Supabase's
     current server-side key format, `sb_secret_...` — not the publishable
     key, from Supabase's API settings; this table has no public RLS
     policies on purpose).
   - `GA4_ADMIN_MCP_SCRIPT_PATH` / `GA4_SA_KEY_PATH` — point at your existing
     `ga4-admin-mcp` project's `src/index.mjs` and its service-account JSON key.
   - `GTM_MCP_SCRIPT_PATH` / `GTM_SERVICE_ACCOUNT_PATH` — same idea, for
     `google-tag-manager-mcp-server`.
3. Run `supabase/schema.sql` (repo root) once against your Supabase project —
   SQL Editor → New query → paste → Run. Creates the `audit_requests` table.
4. Make sure `claude` is on `PATH` for whatever user/service runs this (or set
   `CLAUDE_BIN` to an absolute path).
5. For requests where the visitor picked no tools at all, the audit runs a
   real headless Chrome pass (console errors, network/tag-firing checks) via
   `chrome-devtools-mcp`, fetched at runtime with `npx` — no separate install
   step needed in this project, but the VPS needs Google Chrome (or Chrome
   for Testing) present so `npx chrome-devtools-mcp@latest --headless` has a
   browser to launch. First run on a fresh VPS will download Chrome's ~300MB
   binary via npx/puppeteer if it isn't already cached.

No browser login or OAuth consent step is needed anywhere in this setup — GA4
and GTM both authenticate via service account, same as your existing MCP
configs already do.

## Running it

**Locally (testing):**

```bash
npm run poll
```

Leave this running in a terminal. It polls every `POLL_INTERVAL_MS` (default
60s), drains any backlog immediately when it finds work, and goes back to
sleep when the queue's empty. `Ctrl+C` shuts it down cleanly after the current
job finishes.

**Production (VPS):**

1. Copy this whole `audit-worker/` folder to the VPS, plus the three MCP
   script projects it points at (`ga4-admin-mcp`, the GTM MCP server, and
   `clarity-mcp`) and their service-account key files — none of those are
   committed to this repo.
2. `npm install`, set up `.env` with paths matching the VPS's filesystem.
3. Run it under a process supervisor so it survives reboots/crashes — a
   systemd unit running `npm run start` (after `npm run build`) is the
   straightforward option; this repo doesn't ship a unit file yet, so write
   one when you set the VPS up.

## Test mode

To exercise the whole flow without the review queue, submit the form with a
leading `-` on **both** the website and the email:

    -omar@optimizers.agency
    -https://example.com

The prefix is stripped at intake (`api/_lib/audit-intake.js`'s
`parseTestPrefix`) and stored as `audit_requests.is_test`. From there a test
run differs from a real one in exactly four ways:

- The report is published to `AUDIT_REPORTS_TEST_BUCKET`
  (`audit-reports-test`) instead of the live bucket. `report_pages.bucket`
  records which bucket a slug is in, so `/audit-reports/<slug>` serves and
  `api/report/edit.js` edits either one without being told.
- It's emailed **straight to the address in the form** the moment the audit
  finishes — no internal review email, no approval link, no 2-day delay. The
  subject is tagged `[TEST]` and the body carries a banner, so a test that
  lands in a real inbox can't be mistaken for a client-ready audit.
- Neither internal notification is sent — not the reviewer's and not the
  heads-up to AUDIT_HEADSUP_EMAIL. Test mode pings nobody.
- It's exempt from the one-audit-per-website/email limit, and doesn't consume
  that site's real audit — the unique indexes are partial
  (`where is_test = false`), so the same site can be re-tested indefinitely.

Prefixing only one of the two fields is a hard 400, deliberately: if one were
enough, a stray dash typed into the email box would silently turn a real
prospect's submission into an unreviewed report mailed straight to them.

Two things worth knowing before using it on a live site:

- **There's no gate.** Any visitor who types the prefix gets test mode,
  including the exemption from the one-audit limit. That's the chosen
  behavior, but it does mean the audit's cost (a `claude -p` run with live
  browser access) is reachable repeatedly from outside. If that ever becomes
  a problem, the trigger is a single exported constant to change.
- `npm run test-run` and `npm run test-run-oauth` publish to the test bucket
  too, since they're test runs by definition.

## Testing over a tunnel (ngrok or tunnelmole)

The report pages are served by the dev server itself (a dev twin of
`api/audit-report.js`, since `vercel.json`'s rewrites don't exist locally),
so tunnelling the dev server is all it takes to have real, shareable report
URLs. The generated HTML is fully self-contained — fonts and icons are
inlined as data URIs — so it renders identically from any origin.

    npm run dev          # vite on :5173 (the --port flag overrides the config's 4000)
    npm run share        # ngrok http 5173
    npm run share:tmole  # tmole 5173 — tunnelmole, also already a dependency

Then switch the two host-dependent values to the tunnel's origin and
**restart both processes** (each is read at startup):

1. `audit-worker/.env` → `PUBLIC_SITE_URL=https://<sub>.ngrok-free.app`
   Every emailed report link is built from this (`supabase.ts`'s
   `publishAuditReport`), and it's persisted into `report_pages.public_url`.
   Left at localhost, the audit still succeeds and the email still arrives —
   with a link that only opens on your machine. The worker now prints the
   link base on startup and warns if it's a localhost address.
2. `.env` → `GOOGLE_OAUTH_REDIRECT_URI=https://<sub>.ngrok-free.app/api/oauth/google/callback`,
   **and add that exact URI to the OAuth client in Google Cloud Console.**
   Skipping this fails twice over: Google rejects the request with
   `redirect_uri_mismatch`, and even if it didn't, the callback posts its
   result to the origin derived from this same value — a different origin
   than the page listening for it, so `GetFreeAudit.tsx`'s origin check
   drops the message and the popup just closes silently. The dev server logs
   a HOST MISMATCH warning when a request arrives on a host that doesn't
   match this value.

Everything else works through either tunnel: `server.allowedHosts` is `true`
in `vite.config.ts` (Vite otherwise answers "Blocked request" for an unknown
Host), and both host-dependent values above are read from env rather than
from the request, so neither tunnel needs special handling.

### ngrok vs tunnelmole

Both work; the differences that actually matter:

- **Forwarded headers.** ngrok sends `x-forwarded-proto: https`; tunnelmole
  forwards no `x-forwarded-*` headers at all — just a correct `Host`
  (verified against a header-echo server, not assumed). Only one thing read
  that header — the dev-only local-report link in the "Supabase not
  configured" fallback path — and it now treats any non-localhost Host as
  https rather than defaulting to `http`, so both tunnels produce a correct
  link.
- **Interstitial.** ngrok's free tier shows its browser warning page on the
  first visit to a link. Tunnelmole showed none.
- **Hostname.** tunnelmole's default hostname embeds your machine's public
  IP address (`https://<random>-ip-<your-public-ip>.tunnelmole.net`), so any
  link you share leaks it — worth knowing before sending one to a client.
  Both services hand out a fresh hostname per session unless you're paying
  for a reserved one, which means re-doing the two env changes above each
  time.

Two things to expect rather than debug:

- The report link's host is baked in at publish time: `report_pages.public_url`
  keeps whatever `PUBLIC_SITE_URL` was set to, so rows from an old tunnel
  hold dead links.
- For that reason, run tunnel sessions in **test mode** (dash-prefixed email
  + website, see above) so those reports land in the test bucket instead of
  alongside real client ones.

## How Claude picks the right GA4 property / GTM container

The `ga4-admin` and `google-tag-manager-mcp-server` service account is
**shared across every client who uses this tool** — over time it can see many
different businesses' properties and containers, not just the one being
audited right now. So identification is never by business name or "looks
related" guessing: `crawl.ts` extracts the literal `G-XXXXXXX` / `GTM-XXXXXXX`
IDs out of the visitor's page source, the form also lets them type these IDs
directly (optional — merged in as additional candidates, not a replacement),
and `audit-prompt.ts` hard-instructs Claude to only treat a property/container
as "this visitor's" if its ID is an **exact string match** against that
combined candidate list. No match → that category falls back to
detection-only, exactly as if access hadn't been shared at all. This is a
privacy boundary, not just a correctness nicety — get it wrong and one
client's report could leak another client's data.

Note that typing an ID grants **no new access on its own** — it only narrows
which of the properties/containers the service account can *already* see
counts as a match. A wrong or made-up ID just fails to match anything and
falls back to detection-only, same as leaving it blank.

Business name (also optional, in the form's website step) is purely
cosmetic — it personalizes the report's cover block and the email
subject/greeting.
It's never used anywhere in the matching logic above.

One known gap: if a site loads GA4 purely through GTM (no literal gtag.js
snippet server-rendered into the HTML), `crawl.ts` finds no measurement ID to
match against, since it's a plain fetch with no JS execution. The prompt
tells Claude to try inspecting an already ID-matched GTM container's tags for
a GA4 Configuration tag as a fallback, still exact-match only — but if GTM
also isn't shared, that category just degrades to detection-only.

## Branding & checklist sourcing

- **Brand assets are real, not approximated.** `assets/wordmark-white.png`,
  `icon-white.png`, `pattern-bg-blackforest.png`, the category icons in
  `assets/icons/`, and the Sora TTF files are all copied directly from the
  `branding:rebuild` Claude Code plugin (`~/.claude/plugins/cache/optimizers-
  plugins/branding/`) — the actual brand kit, not a hand-rasterized guess.
  If the brand kit ever updates, re-copy from there rather than editing these
  files in place.
- **The audit checklist is curated from real methodology, not generic
  advice.** `src/checklist.ts`'s 13 GA4 / 13 GTM / 13 SessionRecording / 14
  Website points are hand-selected from the `ga4-gtm-audit` skill's 203-point
  Master Tracking Audit Framework (100+ sources, including real production-
  container audits) — chosen for highest business severity AND actual
  evaluability with this worker's access (no BigQuery/CRM/Ads-Manager/
  DebugView/browser-automation, unlike that skill's full interactive version).
  Each point keeps its source ID as a comment for traceability. If the
  framework gets updated, the curated selection should be revisited, not
  assumed still optimal.

## Known limitations (Phase 1)

- **GA4 and GTM are the only selectable tools.** Clarity was offered via a
  pasted-token MCP for a while and Hotjar never was (no comparable API);
  both are gone as selectable tools. They're still *detected* — a Clarity or
  Hotjar snippet firing on a site whose owner said they have no tools is a
  real finding (WEB-24), it just isn't a live-data source.
- **GA4/GTM only get live data once the visitor has actually shared access**
  with the service account's `client_email` (shown to them in the form). If
  they haven't, that category still gets audited — just from the public crawl
  signal instead, and the report says so plainly rather than pretending it's
  live data.
- **No PageSpeed Insights / Lighthouse data at all** (removed 2026-09-09).
  It was a real fifth step and its own scored category, but the sweep — a
  sequential mobile+desktop PSI call per discovered page — dominated every
  run's wall clock. The four things it scored (render-blocking resources,
  oversized images, uncompressed text, bundle weight) are now WEB-60..WEB-63,
  measured from the headless browser's own network data, and every other
  check that used to cite a Lighthouse audit id now names a browser/DOM or
  static-crawl check instead. `discover-pages.ts` still runs (cheaply, off
  sitemap.xml) because the browser needs real cart/product URLs to visit.
- **One audit per website and per email, ever.** The intake endpoint rejects
  a repeat submission from either the same email or the same hostname (409),
  backed by unique indexes in Postgres — see `supabase/schema.sql`.
