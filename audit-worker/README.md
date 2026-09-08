# audit-worker

Headless worker for the website's "Get a Free Audit" feature. Polls the
`audit_requests` Supabase table for new submissions and processes each one via
`claude -p` (Claude Code's non-interactive/headless mode) — crawling the site,
calling GA4/GTM/Clarity MCP tools where access is available, generating a
branded PPTX, and emailing it via Resend.

This is a **separate Node project from the website** — not built by Vite, not
deployed to Vercel. It runs on a machine you actually control, because it logs
in as `claude` and that can't happen inside a stateless serverless function.

## Why it's separate

`claude -p` needs a real, persistent environment: a filesystem for its config,
a place for the GA4/GTM/Clarity MCP servers' service-account key files to live,
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
   - `CLARITY_MCP_SCRIPT_PATH` — your existing local `clarity-mcp` script
     (the same one behind per-client configs like `clarity-balqees`). This
     worker launches it fresh per job with each visitor's own pasted token,
     instead of one fixed client's token.
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
cosmetic — it personalizes the PPTX cover slide and email subject/greeting.
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

- **Hotjar isn't offered as a selectable tool at all** — no MCP or API
  integration exists for it, unlike GA4/GTM (service-account MCPs) and
  Clarity (token-based MCP). If Hotjar ever exposes something similar, it can
  be added back the same way Clarity was.
- **GA4/GTM only get live data once the visitor has actually shared access**
  with the service account's `client_email` (shown to them in the form). If
  they haven't, that category still gets audited — just from the public crawl
  signal instead, and the report says so plainly rather than pretending it's
  live data.
- **Clarity is capped at 10 API calls/day per project and only the trailing 3
  days of data** — `audit-prompt.ts` tells Claude to batch dimension
  breakdowns accordingly, but this is a hard ceiling from Clarity's API, not
  something this worker can work around.
- **Sora isn't embedded in the generated PPTX** — `pptxgenjs` sets the OOXML
  font-name reference, not an embedded font file. It renders correctly if Sora
  is installed wherever the deck is opened; otherwise PowerPoint substitutes a
  fallback. The real Sora TTF files now live in `assets/` (copied from the
  brand kit) so real OOXML font embedding is possible if this becomes a
  priority — it just isn't implemented yet; would need direct manipulation of
  the generated pptx's zip/XML structure, which `pptxgenjs` doesn't expose.
