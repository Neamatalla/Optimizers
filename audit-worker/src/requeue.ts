/**
 * Puts one or more audit requests back in the queue with fresh attempts.
 *
 *   npm run requeue -- <request-id> [<request-id> ...] [--fresh] [--force]
 *
 * By default the saved progress is kept, so the worker resumes from the last
 * stage that finished (e.g. a failed upload does not re-run the audit).
 *   --fresh  discard saved progress and run the whole audit again
 *   --force  also allow rows already awaiting approval, scheduled or done
 */
import "dotenv/config";
import { requeueRequest } from "./supabase.js";

async function main() {
  const args = process.argv.slice(2);
  const fresh = args.includes("--fresh");
  const force = args.includes("--force");
  const ids = args.filter(a => !a.startsWith("--"));
  if (ids.length === 0) {
    console.error("Usage: npm run requeue -- <request-id> [<request-id> ...] [--fresh] [--force]");
    process.exit(1);
  }
  let failed = 0;
  for (const id of ids) {
    try {
      const { previousStatus } = await requeueRequest(id, { fresh, force });
      console.log(`Requeued ${id} (was '${previousStatus}')${fresh ? ", saved progress cleared" : ", will resume from saved progress"}`);
    } catch (err: any) {
      failed++;
      console.error(`Could not requeue ${id}: ${err?.message ?? err}`);
    }
  }
  process.exit(failed ? 1 : 0);
}

main();
