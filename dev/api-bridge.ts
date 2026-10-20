// Dev-only: runs the real /api handlers inside `npm run dev`, the way Vercel
// runs them in production, so there's one copy of the API, not a dev twin.
//
//   /api/<path>              -> api/<path>.js (files under api/_lib are skipped, like on Vercel)
//   /audit-reports/<slug>    -> audit-report.html (same as vercel.json's rewrite), which
//                               fetches /api/audit-report?slug=<slug>
//
// Each handler gets the extras Vercel adds: req.query, req.body (parsed
// JSON), res.status(), res.json(), res.send(). Handlers are loaded through
// Vite, so editing an /api file takes effect on the next request.
//
// Three dev-only extras sit in front of the real handlers:
//   - /api/contact with no RESEND_API_KEY answers a fake success.
//   - /api/audit-request with no Supabase runs the audit locally (dev/local-audit.ts).
//   - /audit-reports/local/<file>.html serves a report saved in audit-worker/output/.
import fs from 'fs'
import path from 'path'
import { loadEnv } from 'vite'
import { runLocalAudit } from './local-audit'

const API_ROUTE = /^\/api\/((?:[a-zA-Z0-9][a-zA-Z0-9_-]*\/)*[a-zA-Z0-9][a-zA-Z0-9_-]*)$/
const REPORT_ROUTE = /^\/audit-reports\/([^/]+)$/
const LOCAL_REPORT_ROUTE = /^\/audit-reports\/local\/([^/]+)$/

export function apiBridgePlugin() {
  return {
    name: 'api-bridge',
    configureServer(server: any) {
      const rootDir: string = server.config.root

      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = new URL(req.url, 'http://localhost')

        const localReport = url.pathname.match(LOCAL_REPORT_ROUTE)
        if (localReport) return serveLocalReport(localReport[1], rootDir, res)

        // Vite serves and transforms the page; the URL in the address bar stays.
        if (REPORT_ROUTE.test(url.pathname)) {
          req.url = `/audit-report.html${url.search}`
          return next()
        }

        const query: Record<string, string> = Object.fromEntries(url.searchParams)
        const api = url.pathname.match(API_ROUTE)
        if (!api) return next()
        const file = `api/${api[1]}.js`
        if (!fs.existsSync(path.join(rootDir, file))) return next()

        // Re-read .env on every request, so edits apply without a restart.
        Object.assign(process.env, loadEnv(server.config.mode, rootDir, ''))
        addVercelHelpers(res)
        req.query = query
        try {
          req.body = await readJsonBody(req)
        } catch {
          return res.status(400).json({ error: 'Invalid JSON body.' })
        }

        // Google must send the visitor back to whichever host they started
        // on (localhost or a tunnel), or the state cookie won't be there.
        if (file.startsWith('api/oauth/google/')) {
          process.env.GOOGLE_OAUTH_REDIRECT_URI = `${requestOrigin(req)}/api/oauth/google/callback`
        }

        if (file === 'api/contact.js' && req.method === 'POST' && !process.env.RESEND_API_KEY) {
          console.warn('RESEND_API_KEY is missing in .env. Mocking success for development form testing.')
          return res.status(200).json({ success: true, message: 'Mock success: API key missing' })
        }
        if (file === 'api/audit-request.js' && req.method === 'POST' && !(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY)) {
          return runLocalAudit(req, res, rootDir)
        }

        try {
          const { default: handler } = await server.ssrLoadModule(`/${file}`)
          await handler(req, res)
        } catch (err) {
          console.error(`[api-bridge] ${file} crashed:`, err)
          if (!res.headersSent) res.status(500).json({ error: 'API handler crashed. See the dev server log.' })
        }
      })
    },
  }
}

function addVercelHelpers(res: any) {
  res.status = (code: number) => { res.statusCode = code; return res }
  res.json = (body: unknown) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(body))
    return res
  }
  res.send = (body: unknown) => { res.end(body); return res }
}

async function readJsonBody(req: any): Promise<unknown> {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined
  let raw = ''
  for await (const chunk of req) raw += chunk
  return raw.trim() ? JSON.parse(raw) : undefined
}

// ngrok sets x-forwarded-proto; tunnelmole forwards no x-forwarded-* headers
// (only a correct Host). Anything that isn't localhost came through a
// tunnel, and tunnels terminate TLS, so https.
function requestOrigin(req: any): string {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '')
  const forwardedProto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim()
  const isLocalHost = /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host)
  return `${forwardedProto || (isLocalHost ? 'http' : 'https')}://${host}`
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

// The filename is checked against a strict pattern before touching the
// filesystem, so a crafted request can't read outside audit-worker/output/.
async function serveLocalReport(rawName: string, rootDir: string, res: any) {
  const filename = safeDecode(rawName)
  if (!/^[a-zA-Z0-9_-]+\.html$/.test(filename)) {
    res.statusCode = 400
    return res.end('Invalid report filename.')
  }
  try {
    const html = await fs.promises.readFile(path.join(rootDir, 'audit-worker', 'output', filename), 'utf8')
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(html)
  } catch {
    res.statusCode = 404
    res.end('Report not found. Check the filename, or that the local audit run saved it.')
  }
}
