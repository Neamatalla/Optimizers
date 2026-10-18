// One-off: run the same store as three more test audits, one per reader role,
// one after another. Each job is created parked (status failed), then
// requeued and claimed by a freshly started local worker, which ticks at once
// and so beats the Railway worker that still reads this database.
import "dotenv/config";
import { spawn, execSync } from "child_process";
import os from "os";
import { createClient } from "@supabase/supabase-js";

const SOURCE = "52cc734c-9a08-415d-a0ce-b88e8ebd68c8";
const ROLES = ["media_buyer", "store_owner", "marketing_manager", "agency"] as const;
const s = createClient(process.env.SUPABASE_URL!, (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!);
const log = (m: string) => console.log(`[run-roles ${new Date().toISOString()}] ${m}`);

function stopWorkers() {
  // The PowerShell line matches its own command line too and kills itself, so
  // a non-zero exit here is expected.
  try { execSync(`powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -match 'run poll|src/poll\\.ts' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`, { stdio: "ignore" }); } catch { /* see above */ }
}

const { data: src, error } = await s.from("audit_requests").select("*").eq("id", SOURCE).single();
if (error || !src) throw new Error(`source row: ${error?.message}`);

for (const role of ROLES) {
  const { data: row, error: e } = await s.from("audit_requests").insert({
    tools: src.tools, website: src.website, email: src.email, email_normalized: src.email_normalized, website_hostname: src.website_hostname,
    is_test: true, business_name: src.business_name, audience_role: role,
    ga4_measurement_id: src.ga4_measurement_id, gtm_container_id: src.gtm_container_id,
    ga4_oauth_data: src.ga4_oauth_data, gtm_oauth_data: src.gtm_oauth_data,
    status: "failed", result_error: "parked by _run-roles, about to be requeued",
  }).select("id").single();
  if (e || !row) throw new Error(`insert ${role}: ${e?.message}`);
  log(`${role}: created ${row.id}`);

  stopWorkers();
  execSync(`npm run requeue -- ${row.id} --fresh --force`, { stdio: "inherit" });
  const worker = spawn("npm", ["run", "poll"], { shell: true, stdio: "inherit" });

  let last = "";
  for (;;) {
    await new Promise(r => setTimeout(r, 30_000));
    const { data } = await s.from("audit_requests").select("status, locked_by, attempts, report_url, result_error").eq("id", row.id).single();
    const now = `${data?.status} ${data?.locked_by ?? ""} attempt ${data?.attempts}`;
    if (now !== last) { log(`${role}: ${now}`); last = now; }
    if (data?.locked_by && !String(data.locked_by).startsWith(os.hostname())) log(`${role}: WARNING claimed by ${data.locked_by}, not this machine`);
    if (data?.status === "done") { log(`${role}: DONE ${data.report_url}`); break; }
    if (data?.status === "failed") { log(`${role}: FAILED ${data.result_error}`); break; }
  }
  worker.kill();
  stopWorkers();
}
log("all roles finished");
