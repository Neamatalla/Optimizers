import fs from "node:fs";
const SECTIONS = [["GA4","GA4"],["GTM","GTM"],["WEBCODE","Website code"],["CRO","CRO (storefront)"],["CLARITY","Clarity (only when connected, outside the 50)"]];
const P = { "store-owner": "Store owner (ICP1)", "media-buyer": "Media buyer (ICP2)" };
const esc = s => String(s ?? "").replace(/\|/g, "\|").replace(/\s+/g, " ").trim();
const load = (p, s) => fs.readFileSync(`selected/${p}-${s}.jsonl`, "utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse).sort((a,b)=>a.rank-b.rank);
let out = [];
const stats = {};
for (const [p, name] of Object.entries(P)) {
  out.push(`\n## ${name}\n`);
  for (const [s, label] of SECTIONS) {
    const rows = load(p, s);
    const nf = rows.filter(r => r.new_fact).length;
    const exist = rows.filter(r => (r.sources||[]).some(x => String(x).startsWith("EXIST-"))).length;
    (stats[p] ||= {})[s] = { n: rows.length, crit: rows.filter(r=>r.severity==="critical").length, newFact: nf, fromTool: exist };
    out.push(`\n### ${label} — ${rows.length} points (${nf} need a new GA4 query · ${exist} build on a current tool point)\n`);
    const buyer = p === "media-buyer";
    out.push(`| # | Point | Severity | Measured by | Who fixes | ${buyer ? "Ad effect | " : ""}Why it matters | Sources |`);
    out.push(`|---|---|---|---|---|${buyer ? "---|" : ""}---|---|`);
    for (const r of rows) {
      const flag = r.new_fact ? " 🆕" : "";
      out.push(`| ${r.rank} | **${esc(r.title)}** <br><small>${esc(r.id)}</small> | ${r.severity} | ${esc(r.measured_by)}${flag} | ${esc((r.owners||[]).join(", "))} | ${buyer ? esc(r.ad_effect) + " | " : ""}${esc(r.why_it_matters)} | ${esc((r.sources||[]).join(", "))} |`);
    }
    out.push(`\n<details><summary>Pass / fails / how we check / action / done when</summary>\n`);
    for (const r of rows) {
      out.push(`- **${esc(r.id)} ${esc(r.title)}**`);
      out.push(`  - Pass: ${esc(r.pass)}`);
      out.push(`  - Fails: ${esc(r.fails)}`);
      out.push(`  - How we check: ${esc(r.validate)}`);
      out.push(`  - Action: ${esc(r.action)}`);
      out.push(`  - Done when: ${esc(r.done_when)}`);
      out.push(`  - Selected because: ${esc(r.selected_because)}`);
    }
    out.push(`\n</details>`);
  }
}
fs.writeFileSync("proposal-tables.md", out.join("\n") + "\n");
fs.writeFileSync("proposal-stats.json", JSON.stringify(stats, null, 1));
console.log(JSON.stringify(stats));
