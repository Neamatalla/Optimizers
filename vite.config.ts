import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import { appendFileSync } from 'fs'
import crypto from 'crypto'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Plugin to handle /api/contact locally during dev
function apiMiddlewarePlugin() {
  return {
    name: 'api-middleware',
    configureServer(server: any) {
      server.middlewares.use('/api/contact', async (req: any, res: any, next: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const env = loadEnv('development', process.cwd(), '');
            const apiKey = env.RESEND_API_KEY;
            if (!apiKey) {
              console.warn("RESEND_API_KEY is missing in .env. Mocking success for development form testing.");
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Mock success: API key missing' }));
              return;
            }

            const { Resend } = await import('resend');
            const resend = new Resend(apiKey);
            const { firstName, email, website, monthlyConversions, challenge, traffic } = JSON.parse(body);
            const requiredFields = { firstName, email, website, traffic, monthlyConversions, challenge };
            const missingFields = Object.entries(requiredFields)
              .filter(([, value]) => !String(value || '').trim())
              .map(([field]) => field);

            if (missingFields.length > 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                error: 'All strategy session fields are required.',
                missingFields,
              }));
              return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(String(email).trim())) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Please enter a valid email address.' }));
              return;
            }

            try {
              const websiteUrl = new URL(String(website).trim());
              if (!websiteUrl.hostname.includes('.')) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Please enter a valid website URL.' }));
                return;
              }
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Please enter a valid website URL.' }));
              return;
            }

            const { data, error } = await resend.emails.send({
              from: 'Optimizers <onboarding@resend.dev>',
              to: ['mohamed@neamatalla.com'],
              subject: `New Optimizers Client Data Submission from ${firstName}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #263328; border-bottom: 2px solid #6ae499; padding-bottom: 10px;">
                    New Contact Form Submission
                  </h2>
                  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr style="background-color: #f5f5f5;">
                      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">First Name</td>
                      <td style="padding: 12px; border: 1px solid #ddd;">${firstName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                      <td style="padding: 12px; border: 1px solid #ddd;">${email}</td>
                    </tr>
                    <tr style="background-color: #f5f5f5;">
                      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Website</td>
                      <td style="padding: 12px; border: 1px solid #ddd;">${website}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Number Traffic Per Month</td>
                      <td style="padding: 12px; border: 1px solid #ddd;">${traffic}</td>
                    </tr>
                    <tr style="background-color: #f5f5f5;">
                      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Conversion Volume</td>
                      <td style="padding: 12px; border: 1px solid #ddd;">${monthlyConversions}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Primary Objective</td>
                      <td style="padding: 12px; border: 1px solid #ddd;">${challenge}</td>
                    </tr>
                  </table>
                  <p style="color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                    This submission was received from the Optimizers booking form.
                  </p>
                </div>
              `.trim(),
            });

            if (error) {
              console.error('Resend API Error:', JSON.stringify(error));
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: (error as any).message || 'Resend API error' }));
              return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Strategy session inquiry received successfully!', data }));
          } catch (err: any) {
            console.error('Dev API error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message || 'Unexpected error' }));
          }
        });
      });
      server.middlewares.use('/api/audit-request', async (req: any, res: any, next: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          const VALID_TOOLS = new Set(['GA4', 'GTM']);
          try {
            const env = loadEnv('development', process.cwd(), '');
            const { tools, website: rawWebsite, email: rawEmail, businessName, ga4MeasurementId, gtmContainerId, ga4OAuthData, gtmOAuthData } = JSON.parse(body || '{}');

            // Test-mode prefix comes off first, so every check below runs on
            // the real values — dev twin of api/audit-request.js, same
            // shared parser.
            const { parseTestPrefix, TEST_PREFIX_MISMATCH_MESSAGE, auditNotifyEmail, auditHeadsUpEmail, buildHeadsUpEmail } = await import('./api/_lib/audit-intake.js');
            const parsedIntake = parseTestPrefix({ email: rawEmail, website: rawWebsite });
            if (parsedIntake.mismatch) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: TEST_PREFIX_MISMATCH_MESSAGE }));
              return;
            }
            const { isTest, email, website } = parsedIntake;

            if (!Array.isArray(tools) || tools.some((tool: any) => !VALID_TOOLS.has(tool))) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Invalid tools selection.' }));
              return;
            }

            const missingFields: string[] = [];
            if (!String(website || '').trim()) missingFields.push('website');
            if (!String(email || '').trim()) missingFields.push('email');
            if (missingFields.length > 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Website and email are required.', missingFields }));
              return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(String(email).trim())) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Please enter a valid email address.' }));
              return;
            }

            try {
              const websiteUrl = new URL(String(website).trim());
              if (!websiteUrl.hostname.includes('.')) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Please enter a valid website URL.' }));
                return;
              }
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Please enter a valid website URL.' }));
              return;
            }

            // Required whenever the corresponding tool is selected — mirrors the
            // frontend's mandatory (not skippable) GA4/GTM access step.
            const ga4IdRegex = /^G-[A-Z0-9]{6,}$/i;
            if (tools.includes('GA4') && !ga4IdRegex.test(String(ga4MeasurementId || '').trim())) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'A valid GA4 measurement ID is required when GA4 is selected.' }));
              return;
            }
            const gtmIdRegex = /^GTM-[A-Z0-9]{4,}$/i;
            if (tools.includes('GTM') && !gtmIdRegex.test(String(gtmContainerId || '').trim())) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'A valid GTM container ID is required when GTM is selected.' }));
              return;
            }

            const supabaseUrl = env.SUPABASE_URL;
            const supabaseServiceKey = env.SUPABASE_SECRET_KEY;
            if (!supabaseUrl || !supabaseServiceKey) {
              // Dev-only shortcut: no queue configured, so skip straight to running
              // the real pipeline via audit-worker's standalone test-run script
              // instead of just mocking success. Never runs in production — this
              // whole file is Vite dev middleware, not the deployed api/*.js.
              //
              // Awaited (not fire-and-forget) specifically so this can hand back a
              // reportUrl the frontend can link to — a full run (crawl +
              // claude -p + report render) takes on the order of 1-3 minutes; the
              // request just stays open for it, same as it will in the real
              // Supabase-backed flow once that's wired up. --no-email is mandatory
              // here regardless of what the visitor entered: test-run.ts's normal
              // (non---no-email) path calls publishAuditReport(), which needs the
              // same Supabase creds this branch exists because we don't have.
              // The visitor still gets emailed below, via Resend directly, pointed
              // at the local report URL instead of a Supabase Storage one.
              console.warn('SUPABASE_URL/SUPABASE_SECRET_KEY missing in .env. Running audit-worker test-run directly instead of queueing.');
              const auditWorkerDir = path.resolve(__dirname, 'audit-worker');
              // Spawn node -> tsx's CLI entry directly, no npx/shell layer — shell:true
              // combined with fd-based stdio redirection is flaky on Windows and was
              // silently swallowing this process's output.
              const tsxCliPath = path.join(auditWorkerDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
              const testRunArgs = [
                tsxCliPath, 'src/test-run.ts',
                `--website=${website}`,
                '--no-email',
              ];
              if (Array.isArray(tools) && tools.length > 0) testRunArgs.push(`--tools=${tools.join(',')}`);
              if (businessName) testRunArgs.push(`--business=${businessName}`);
              if (ga4MeasurementId) testRunArgs.push(`--ga4-id=${ga4MeasurementId}`);
              if (gtmContainerId) testRunArgs.push(`--gtm-id=${gtmContainerId}`);

              // Own file per spawned child (pid-suffixed) — was previously one shared
              // dev-test-run.log every run appended to, which interleaves output when
              // more than one run is in flight and makes past runs hard to tell apart.
              const child = spawn(process.execPath, testRunArgs, {
                cwd: auditWorkerDir,
                stdio: ['ignore', 'pipe', 'pipe'],
              });
              const logPath = path.join(auditWorkerDir, `dev-test-run-${child.pid}.log`);
              console.log(`[dev test-run] spawned pid=${child.pid}, logging to ${logPath}`);

              let stdout = '';
              child.stdout.on('data', (chunk: Buffer) => {
                const text = chunk.toString();
                stdout += text;
                appendFileSync(logPath, text);
              });
              child.stderr.on('data', (chunk: Buffer) => {
                appendFileSync(logPath, chunk.toString());
              });

              const exitCode: number = await new Promise(resolve => {
                child.on('close', (code: number | null) => resolve(code ?? 1));
              });

              if (exitCode !== 0) {
                console.error(`[dev test-run] exited with code ${exitCode} — see ${logPath}`);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `Audit generation failed (exit ${exitCode}) — check ${logPath} for details.` }));
                return;
              }

              const savedMatch = stdout.match(/\[test-run\] Saved locally: (.+\.html)/);
              if (!savedMatch) {
                console.error('[dev test-run] finished but no "Saved locally" line found in output — see', logPath);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `Audit generation finished but produced no report file — check ${logPath}.` }));
                return;
              }

              const savedPath = savedMatch[1].trim();
              const filename = path.basename(savedPath);
              const reportUrl = `/audit-reports/local/${encodeURIComponent(filename)}`;
              console.log(`[dev test-run] done, report at ${reportUrl}`);

              const resendApiKey = env.RESEND_API_KEY;
              if (resendApiKey) {
                try {
                  // ngrok sets x-forwarded-proto; tunnelmole forwards no
                  // x-forwarded-* headers at all (verified — only a correct
                  // Host), so a bare fallback to http would put an
                  // insecure-scheme link in the email. Anything that is not
                  // literally localhost reached us through a tunnel, and
                  // every tunnel worth using terminates TLS, so https is the
                  // right assumption there.
                  const forwardedProto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim();
                  const requestHost = String(req.headers.host || '');
                  const isLocalHost = /^(localhost|127.0.0.1|[::1])(:|$)/.test(requestHost);
                  const protocol = forwardedProto || (isLocalHost ? 'http' : 'https');
                  const absoluteReportUrl = `${protocol}://${requestHost}${reportUrl}`;
                  const { Resend } = await import('resend');
                  const resend = new Resend(resendApiKey);
                  await resend.emails.send({
                    from: 'Optimizers <hello@optimizers.agency>',
                    to: [String(email).trim()],
                    subject: businessName ? `Your Free CRO & Analytics Audit for ${businessName}` : `Your Free CRO & Analytics Audit - ${website}`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #263328; border-bottom: 2px solid #6ae499; padding-bottom: 10px;">Your Audit Is Ready</h2>
                        <p style="color: #333; font-size: 14px; line-height: 1.6;">
                          ${businessName ? `Hi ${businessName} team, we've` : "We've"} put together a business-focused audit of ${website}.
                          The full branded HTML report is ready at the link below.
                        </p>
                        <p style="font-size: 14px; line-height: 1.6;">
                          <a href="${absoluteReportUrl}" style="display: inline-block; background: #263328; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 18px; border-radius: 999px;">View your audit report</a>
                        </p>
                        <p style="color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                          Sent from the Optimizers "Get a Free Audit" tool (dev/local run).
                        </p>
                      </div>
                    `.trim(),
                  });
                  console.log(`[dev test-run] emailed report link to ${email}`);
                } catch (emailErr) {
                  console.error('[dev test-run] failed to send audit email:', emailErr);
                }
              } else {
                console.warn('[dev test-run] RESEND_API_KEY missing in .env — skipped emailing the visitor.');
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Audit generated.', reportUrl }));
              return;
            }

            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            // Dev twin of api/audit-request.js's one-audit-per-website/email
            // limit — same shared implementation, so testing locally against
            // the real Supabase project behaves exactly like production
            // (including consuming a real site's one free audit).
            const {
              normalizeEmail,
              normalizeHostname,
              findExistingAuditRequest,
              isUniqueViolation,
              duplicateMessage,
            } = await import('./api/_lib/audit-intake.js');
            const emailNormalized = normalizeEmail(email);
            const websiteHostname = normalizeHostname(website);
            // Test runs are exempt from the one-per-site/email limit, same as
            // production (and the unique indexes themselves are partial).
            if (!isTest) {
              const existing = await findExistingAuditRequest(supabase, { emailNormalized, websiteHostname });
              if (existing) {
                res.statusCode = 409;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: duplicateMessage(existing.reason), duplicate: existing.reason }));
                return;
              }
            }

            const { data: row, error: insertError } = await supabase
              .from('audit_requests')
              .insert({
                tools,
                website: String(website).trim(),
                email: String(email).trim(),
                email_normalized: emailNormalized,
                website_hostname: websiteHostname || null,
                is_test: isTest,
                business_name: businessName ? String(businessName).trim() : null,
                ga4_measurement_id: ga4MeasurementId ? String(ga4MeasurementId).trim().toUpperCase() : null,
                gtm_container_id: gtmContainerId ? String(gtmContainerId).trim().toUpperCase() : null,
                ga4_oauth_data: ga4OAuthData ?? null,
                gtm_oauth_data: gtmOAuthData ?? null,
                status: 'pending',
              })
              .select()
              .single();

            if (insertError) {
              const duplicate = isUniqueViolation(insertError);
              if (duplicate) {
                res.statusCode = 409;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: duplicateMessage(duplicate), duplicate }));
                return;
              }
              console.error('Supabase insert error:', JSON.stringify(insertError));
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Could not queue audit request.' }));
              return;
            }

            const resendApiKey = env.RESEND_API_KEY;
            // Not on a test run — same as production, test mode pings nobody
            // internally.
            if (resendApiKey && !isTest) {
              try {
                const { Resend } = await import('resend');
                const resend = new Resend(resendApiKey);
                await resend.emails.send({
                  from: 'Optimizers <hello@optimizers.agency>',
                  to: [auditNotifyEmail(env)],
                  subject: `New Free Audit request — ${website}`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #263328; border-bottom: 2px solid #6ae499; padding-bottom: 10px;">New Free Audit Request</h2>
                      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="background-color: #f5f5f5;">
                          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Website</td>
                          <td style="padding: 12px; border: 1px solid #ddd;">${website}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                          <td style="padding: 12px; border: 1px solid #ddd;">${email}</td>
                        </tr>
                        <tr style="background-color: #f5f5f5;">
                          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Tools selected</td>
                          <td style="padding: 12px; border: 1px solid #ddd;">${tools.join(', ') || 'None'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Business name</td>
                          <td style="padding: 12px; border: 1px solid #ddd;">${businessName || '—'}</td>
                        </tr>
                      </table>
                      <p style="color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">Queued as audit_requests.id = ${row.id}.</p>
                    </div>
                  `.trim(),
                });
              } catch (notifyErr) {
                console.error('Internal notification email failed (dev):', notifyErr);
              }

              // Dev twin of the heads-up send in api/audit-request.js — a
              // second internal address gets just who asked and for which
              // site, nothing operational. Real runs only, same as above.
              try {
                const { Resend } = await import('resend');
                const resend = new Resend(resendApiKey);
                const headsUp = buildHeadsUpEmail({ email, website });
                await resend.emails.send({
                  from: 'Optimizers <hello@optimizers.agency>',
                  to: [auditHeadsUpEmail(env)],
                  subject: headsUp.subject,
                  html: headsUp.html,
                });
              } catch (headsUpErr) {
                console.error('Heads-up notification email failed (dev):', headsUpErr);
              }
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              isTest,
              message: isTest
                ? `Test run queued for ${website}. The report will be emailed straight to ${email} — no review step.`
                : 'Audit request received. Check your inbox shortly.',
            }));
          } catch (err: any) {
            console.error('Dev API error (audit-request):', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message || 'Unexpected error' }));
          }
        });
      });

      // Serves the HTML file the dev-only test-run bypass above just saved to
      // audit-worker/output/ — the local stand-in for production's
      // /audit-reports/:slug (which reads from Supabase Storage instead, via
      // api/audit-report.js). Only the final path segment is used
      // (path.basename ignores everything before it regardless of how connect
      // rewrites req.url for a mounted middleware), checked against a strict
      // filename pattern before touching the filesystem so a crafted request
      // can't read anything outside that directory.
      server.middlewares.use('/audit-reports/local', async (req: any, res: any) => {
        const url = new URL(req.url, 'http://localhost');
        const filename = path.basename(decodeURIComponent(url.pathname));
        if (!/^[a-zA-Z0-9_-]+\.html$/.test(filename)) {
          res.statusCode = 400;
          res.end('Invalid report filename.');
          return;
        }
        const filePath = path.join(__dirname, 'audit-worker', 'output', filename);
        try {
          const html = await (await import('fs/promises')).readFile(filePath, 'utf8');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch {
          res.statusCode = 404;
          res.end('Report not found. It may have been generated before a dev-server restart cleared this route, or the filename is wrong.');
        }
      });

      // Dev twin of api/audit-report.js — same Supabase Storage download, same
      // slug validation, same bucket/path convention (reports/<slug>/index.html
      // via audit-worker/src/supabase.ts's publishAuditReport). Needed because
      // a real (non-test-run) local poll.ts run publishes to Storage and
      // builds a PUBLIC_SITE_URL-based link (see .env.example) — pointing that
      // at localhost during local testing is useless without an actual local
      // route to serve it, since production's own /audit-reports/:slug only
      // exists on Vercel (api/audit-report.js), never in this dev server.
      // Registered AFTER /audit-reports/local above so a request for that
      // path (which doesn't match this broader /audit-reports mount's slug
      // pattern below anyway) keeps hitting the local-file handler instead.
      server.middlewares.use('/audit-reports', async (req: any, res: any) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }
        const url = new URL(req.url, 'http://localhost');
        const slug = path.basename(decodeURIComponent(url.pathname));
        if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
          res.statusCode = 400;
          res.end('Invalid audit report link.');
          return;
        }

        const env = loadEnv('development', process.cwd(), '');
        const supabaseUrl = env.SUPABASE_URL;
        const supabaseSecretKey = env.SUPABASE_SECRET_KEY;
        const bucket = env.AUDIT_REPORTS_BUCKET || 'audit-reports';
        if (!supabaseUrl || !supabaseSecretKey) {
          res.statusCode = 500;
          res.end('Audit report service is not configured (SUPABASE_URL/SUPABASE_SECRET_KEY missing in .env).');
          return;
        }

        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseSecretKey);
          // Same reasoning as api/audit-report.js: report_pages says which
          // bucket a slug lives in (a test-mode run publishes to its own),
          // with the conventional path as the fallback for legacy rows.
          const { data: page } = await supabase
            .from('report_pages')
            .select('bucket, storage_path')
            .eq('slug', slug)
            .maybeSingle();
          const objectPath = page?.storage_path || `reports/${slug}/index.html`;
          const { data, error } = await supabase.storage.from(page?.bucket || bucket).download(objectPath);
          if (error || !data) {
            res.statusCode = 404;
            res.end('Audit report not found.');
            return;
          }
          const html = await data.text();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (err: any) {
          console.error('Dev /audit-reports error:', err);
          res.statusCode = 500;
          res.end('Could not load audit report.');
        }
      });

      // Dev twin of api/detect-tracking.js — reuses the same shared, req/res-free
      // module. Called by the website step as soon as the visitor enters a URL,
      // to prefill the GA4/GTM ID fields on the later google-access step.
      server.middlewares.use('/api/detect-tracking', async (req: any, res: any) => {
        const url = new URL(req.url, 'http://localhost');
        const website = (url.searchParams.get('website') || '').trim();
        if (!website) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing website.' }));
          return;
        }
        let websiteUrl: URL;
        try {
          websiteUrl = new URL(website);
          if (!websiteUrl.hostname.includes('.')) throw new Error('no TLD');
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid website URL.' }));
          return;
        }
        try {
          const { detectTracking } = await import('./api/_lib/detect-tracking.js');
          const ids = await detectTracking(websiteUrl.toString());
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, ...ids }));
        } catch (err: any) {
          console.error('detect-tracking error (dev):', err?.message || err);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, ga4MeasurementIds: [], gtmContainerIds: [] }));
        }
      });

      // Google OAuth (GA4 + GTM readonly) — dev twin of api/oauth/google/*.js,
      // reusing the SAME shared logic module rather than duplicating the
      // token-exchange/API-fetch code the way /api/contact and
      // /api/audit-request duplicate theirs (that logic has no req/res
      // coupling, so it's importable as-is from both platforms).
      server.middlewares.use('/api/oauth/google/authorize', async (req: any, res: any) => {
        const env = loadEnv('development', process.cwd(), '');
        const clientId = env.GOOGLE_OAUTH_CLIENT_ID;
        const redirectUri = env.GOOGLE_OAUTH_REDIRECT_URI;
        if (!clientId || !redirectUri) {
          res.statusCode = 500;
          res.end('Google OAuth is not configured.');
          return;
        }
        const { buildAuthorizeUrl } = await import('./api/_lib/google-oauth.js');
        console.log('[oauth-authorize] hit');

        // Serving through a tunnel (ngrok) while GOOGLE_OAUTH_REDIRECT_URI
        // still points at localhost is a silent double failure: Google
        // rejects the redirect outright with redirect_uri_mismatch, and even
        // if it didn't, the callback posts its result to the origin derived
        // from this same env value — a different origin than the page doing
        // the listening, so GetFreeAudit.tsx's own origin check drops it and
        // the popup just closes with nothing happening. Cheap to detect
        // here, at the exact moment it starts to matter.
        try {
          const requestHost = String(req.headers['x-forwarded-host'] || req.headers.host || '');
          const configuredHost = new URL(redirectUri).host;
          if (requestHost && configuredHost && requestHost !== configuredHost) {
            console.warn(
              `[oauth-authorize] HOST MISMATCH — this request arrived on "${requestHost}" but GOOGLE_OAUTH_REDIRECT_URI is set to "${configuredHost}". ` +
              `Google will reject this with redirect_uri_mismatch. Set GOOGLE_OAUTH_REDIRECT_URI=https://${requestHost}/api/oauth/google/callback in .env, ` +
              `add that exact URI to the OAuth client in Google Cloud Console, and restart the dev server.`,
            );
          }
        } catch {
          // A malformed GOOGLE_OAUTH_REDIRECT_URI is already surfaced by the
          // real flow failing; no need to make the warning itself fatal.
        }

        // No candidate GA4/GTM IDs embedded in state any more — the callback
        // now returns every accessible property/container, and matching
        // against the site crawl's candidates happens client-side.
        const nonce = crypto.randomBytes(16).toString('hex');

        res.setHeader('Set-Cookie', `g_oauth_state=${nonce}; HttpOnly; Max-Age=300; SameSite=Lax; Path=/api/oauth/google`);
        res.statusCode = 302;
        res.setHeader('Location', buildAuthorizeUrl({ clientId, redirectUri, state: nonce }));
        res.end();
      });

      server.middlewares.use('/api/oauth/google/callback', async (req: any, res: any) => {
        const env = loadEnv('development', process.cwd(), '');
        const clientId = env.GOOGLE_OAUTH_CLIENT_ID;
        const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET;
        const redirectUri = env.GOOGLE_OAUTH_REDIRECT_URI;
        if (!clientId || !clientSecret || !redirectUri) {
          res.statusCode = 500;
          res.end('Google OAuth is not configured.');
          return;
        }
        const { exchangeCodeForToken, fetchAllGA4Properties, fetchAllGTMContainers, describeOAuthResult } = await import('./api/_lib/google-oauth.js');

        const url = new URL(req.url, 'http://localhost');
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state') || '';
        const oauthError = url.searchParams.get('error');
        console.log('[oauth-callback] hit, has code:', Boolean(code), 'has error:', Boolean(oauthError));

        const popupHtml = (payload: any) => {
          const origin = new URL(redirectUri).origin;
          return `<!doctype html><html><body>
<script>
  window.opener && window.opener.postMessage(${JSON.stringify(payload)}, ${JSON.stringify(origin)});
  window.close();
</script>
Connected — you can close this window.
</body></html>`;
        };

        res.setHeader('Content-Type', 'text/html');

        if (oauthError) {
          res.statusCode = 200;
          res.end(popupHtml({ type: 'google-oauth-result', error: `Google denied access: ${oauthError}` }));
          return;
        }

        const cookies: Record<string, string> = {};
        (req.headers.cookie || '').split(';').forEach((part: string) => {
          const [k, ...v] = part.trim().split('=');
          if (k) cookies[k] = decodeURIComponent(v.join('='));
        });
        const nonce = state;
        if (!nonce || nonce !== cookies.g_oauth_state) {
          console.log('[oauth-callback] state mismatch — nonce:', nonce, 'cookie:', cookies.g_oauth_state);
          res.statusCode = 200;
          res.end(popupHtml({ type: 'google-oauth-result', error: 'State mismatch — please try connecting again.' }));
          return;
        }

        try {
          const token = await exchangeCodeForToken({ clientId, clientSecret, redirectUri, code });
          console.log('[oauth-callback] token exchange OK');
          const [ga4Properties, gtmContainers] = await Promise.all([fetchAllGA4Properties(token), fetchAllGTMContainers(token)]);
          console.log('[oauth-callback] ga4Properties:', Array.isArray(ga4Properties) ? `${ga4Properties.length} found` : `ERROR: ${ga4Properties.error}`);
          console.log('[oauth-callback] gtmContainers:', Array.isArray(gtmContainers) ? `${gtmContainers.length} found` : `ERROR: ${gtmContainers.error}`);
          console.log(describeOAuthResult({ ga4Properties, gtmContainers }));
          res.statusCode = 200;
          // Fetch errors travel as their own fields rather than collapsing
          // into an empty list — see the Vercel callback for why.
          res.end(popupHtml({
            type: 'google-oauth-result',
            ga4Properties: Array.isArray(ga4Properties) ? ga4Properties : [],
            gtmContainers: Array.isArray(gtmContainers) ? gtmContainers : [],
            ga4Error: Array.isArray(ga4Properties) ? undefined : ga4Properties?.error,
            gtmError: Array.isArray(gtmContainers) ? undefined : gtmContainers?.error,
          }));
        } catch (err: any) {
          console.log('[oauth-callback] FAILED:', err.message || err);
          res.statusCode = 200;
          res.end(popupHtml({ type: 'google-oauth-result', error: err.message || 'Connection failed.' }));
        }
      });

      // Dev twin of api/report/edit.js, reusing the SAME shared logic module
      // rather than duplicating the auth/lookup/storage code (same reasoning
      // as the OAuth routes above — that logic has no req/res coupling).
      server.middlewares.use('/api/report/edit', async (req: any, res: any) => {
        const sendJson = (status: number, body: any) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };

        if (req.method !== 'GET' && req.method !== 'PATCH') {
          sendJson(405, { error: 'Method not allowed' });
          return;
        }

        const env = loadEnv('development', process.cwd(), '');
        const { isAuthorized, getReportHtml, updateReportHtml } = await import('./api/_lib/report-edit.js');

        if (!isAuthorized(req.headers['x-api-key'], env.REPORT_EDIT_API_KEY)) {
          sendJson(401, { error: 'Unauthorized' });
          return;
        }

        const supabaseUrl = env.SUPABASE_URL;
        const supabaseSecretKey = env.SUPABASE_SECRET_KEY;
        const bucket = env.AUDIT_REPORTS_BUCKET || 'audit-reports';
        if (!supabaseUrl || !supabaseSecretKey) {
          console.error('SUPABASE_URL / SUPABASE_SECRET_KEY environment variables are not set');
          sendJson(500, { error: 'Report-edit service is not configured.' });
          return;
        }

        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseSecretKey);

        if (req.method === 'GET') {
          const url = new URL(req.url, 'http://localhost');
          const slug = (url.searchParams.get('slug') || '').trim();
          const result = await getReportHtml({ supabase, bucket, slug });
          sendJson(result.status, result.body);
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => { body += chunk.toString(); });
        req.on('end', async () => {
          let parsed: any = {};
          try { parsed = JSON.parse(body || '{}'); } catch { /* falls through to updateReportHtml's own validation */ }
          const result = await updateReportHtml({ supabase, bucket, slug: parsed.slug, html: parsed.html });
          sendJson(result.status, result.body);
        });
      });

      // Dev twin of api/audit-approve.js, reusing the SAME shared logic
      // module — same reasoning as the report-edit/OAuth routes above.
      server.middlewares.use('/api/audit-approve', async (req: any, res: any) => {
        const sendHtml = (status: number, html: string) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        };

        if (req.method !== 'GET') {
          sendHtml(405, '<p>Method not allowed.</p>');
          return;
        }

        const env = loadEnv('development', process.cwd(), '');
        const supabaseUrl = env.SUPABASE_URL;
        const supabaseSecretKey = env.SUPABASE_SECRET_KEY;
        if (!supabaseUrl || !supabaseSecretKey) {
          console.error('SUPABASE_URL / SUPABASE_SECRET_KEY environment variables are not set');
          sendHtml(500, '<p>Approval service is not configured.</p>');
          return;
        }

        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseSecretKey);
        const { approveAuditRequest } = await import('./api/_lib/audit-approve.js');

        const url = new URL(req.url, 'http://localhost');
        const id = (url.searchParams.get('id') || '').trim();
        const token = (url.searchParams.get('token') || '').trim();
        const result = await approveAuditRequest({ supabase, id, token });
        sendHtml(result.status, result.html);
      });
    },
  };
}

export default defineConfig({
  cacheDir: '/tmp/vite-cache',
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    apiMiddlewarePlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4000,
    allowedHosts: true,
  },
})
