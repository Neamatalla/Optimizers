// Dev-only: the "Get a Free Audit" form with no Supabase in .env. Instead of
// queueing the request, starts the real pipeline on this machine via
// audit-worker's standalone test-run script and answers right away. The run
// (crawl + claude -p + report render, 1-3 minutes) carries on in the
// background: the report is saved in audit-worker/output/, its progress goes
// to its own log file, and the outcome is printed to the dev server log.
// Never runs in production.
//
// --no-email is mandatory: test-run.ts's normal path calls
// publishAuditReport(), which needs the same Supabase creds this path exists
// because we don't have. The visitor is emailed below instead, via Resend
// directly, with a link to the local report.
import path from 'path'
import { spawn } from 'child_process'
import { appendFileSync } from 'fs'
import { validateAuditForm } from '../api/_lib/audit-intake.js'
import { escapeHtml } from '../api/_lib/escape-html.js'

export function runLocalAudit(req: any, res: any, rootDir: string) {
  // Same field rules as production (api/audit-request.js).
  const check = validateAuditForm(req.body)
  if (check.invalid) return res.status(400).json(check.invalid)
  const { email, website, tools, businessName, ga4MeasurementId, gtmContainerId } = check.form

  console.warn('SUPABASE_URL/SUPABASE_SECRET_KEY missing in .env. Running audit-worker test-run directly instead of queueing.')
  const auditWorkerDir = path.join(rootDir, 'audit-worker')
  // Spawn node -> tsx's CLI entry directly, no npx/shell layer — shell:true
  // combined with fd-based stdio redirection is flaky on Windows and was
  // silently swallowing this process's output.
  const tsxCliPath = path.join(auditWorkerDir, 'node_modules', 'tsx', 'dist', 'cli.mjs')
  const testRunArgs = [tsxCliPath, 'src/test-run.ts', `--website=${website}`, '--no-email']
  if (tools.length > 0) testRunArgs.push(`--tools=${tools.join(',')}`)
  if (businessName) testRunArgs.push(`--business=${businessName}`)
  if (ga4MeasurementId) testRunArgs.push(`--ga4-id=${ga4MeasurementId}`)
  if (gtmContainerId) testRunArgs.push(`--gtm-id=${gtmContainerId}`)

  // One log file per run (pid-suffixed), so parallel runs don't interleave.
  const child = spawn(process.execPath, testRunArgs, { cwd: auditWorkerDir, stdio: ['ignore', 'pipe', 'pipe'] })
  const logName = `dev-test-run-${child.pid}.log`
  const logPath = path.join(auditWorkerDir, logName)
  console.log(`[dev test-run] spawned pid=${child.pid}, logging to ${logPath}`)

  let stdout = ''
  child.stdout.on('data', (chunk: Buffer) => {
    const text = chunk.toString()
    stdout += text
    appendFileSync(logPath, text)
  })
  child.stderr.on('data', (chunk: Buffer) => appendFileSync(logPath, chunk.toString()))
  child.on('error', err => console.error('[dev test-run] could not start:', err))
  child.on('close', (code: number | null) => {
    finishLocalAudit({ exitCode: code ?? 1, stdout, logPath, email, website, businessName, req })
      .catch(err => console.error('[dev test-run] failed after the run:', err))
  })

  return res.status(200).json({
    success: true,
    message: 'Local audit started.',
    localAudit: { folder: 'audit-worker/output/', log: `audit-worker/${logName}` },
  })
}

// Runs after the response is gone, so every outcome goes to the dev server
// log rather than to the browser.
async function finishLocalAudit({ exitCode, stdout, logPath, email, website, businessName, req }: {
  exitCode: number
  stdout: string
  logPath: string
  email: string
  website: string
  businessName?: string
  req: any
}) {
  if (exitCode !== 0) {
    console.error(`[dev test-run] exited with code ${exitCode} — see ${logPath}`)
    return
  }

  const savedMatch = stdout.match(/\[test-run\] Saved locally: (.+\.html)/)
  if (!savedMatch) {
    console.error('[dev test-run] finished but no "Saved locally" line found in output — see', logPath)
    return
  }

  const reportUrl = `/audit-reports/local/${encodeURIComponent(path.basename(savedMatch[1].trim()))}`
  console.log(`[dev test-run] done, report at ${reportUrl}`)

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.warn('[dev test-run] RESEND_API_KEY missing in .env — skipped emailing the visitor.')
    return
  }

  // ngrok sets x-forwarded-proto; tunnelmole forwards no x-forwarded-*
  // headers at all (only a correct Host). Anything that isn't localhost
  // reached us through a tunnel, and tunnels terminate TLS, so https.
  const forwardedProto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim()
  const requestHost = String(req.headers.host || '')
  const isLocalHost = /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(requestHost)
  const protocol = forwardedProto || (isLocalHost ? 'http' : 'https')
  const absoluteReportUrl = `${protocol}://${requestHost}${reportUrl}`

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(resendApiKey)
    await resend.emails.send({
      from: 'Optimizers <hello@optimizers.agency>',
      to: [email],
      subject: businessName ? `Your Free CRO & Analytics Audit for ${businessName}` : `Your Free CRO & Analytics Audit - ${website}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #263328; border-bottom: 2px solid #6ae499; padding-bottom: 10px;">Your Audit Is Ready</h2>
          <p style="color: #333; font-size: 14px; line-height: 1.6;">
            ${businessName ? `Hi ${escapeHtml(businessName)} team, we've` : "We've"} put together a business-focused audit of ${escapeHtml(website)}.
            The full branded HTML report is ready at the link below.
          </p>
          <p style="font-size: 14px; line-height: 1.6;">
            <a href="${escapeHtml(absoluteReportUrl)}" style="display: inline-block; background: #263328; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 18px; border-radius: 999px;">View your audit report</a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
            Sent from the Optimizers "Get a Free Audit" tool (dev/local run).
          </p>
        </div>
      `.trim(),
    })
    console.log(`[dev test-run] emailed report link to ${email}`)
  } catch (emailErr) {
    console.error('[dev test-run] failed to send audit email:', emailErr)
  }
}
