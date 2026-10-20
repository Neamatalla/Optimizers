// Builds one candidate pool per section (GA4, GTM, WEBCODE, CRO) per persona,
// from the 402 ranked clusters plus the tool's current 100 points.
import fs from "node:fs";
const read = f => fs.readFileSync(f, "utf8").split(/\r?\n/).filter(Boolean);
const clusters = read("clusters.jsonl").map(JSON.parse);
const existing = read("existing-index.jsonl").map(JSON.parse);
const chkRef = new Map(read("joined.jsonl").map(JSON.parse).filter(r => r.src === "OWN-CHECKLIST").map(r => [r.pid, String(r.src_ref)]));
const CODE = new Set(["W-01","W-02","W-03","W-04","W-07","W-08","W-09","W-10","W-11","W-12","W-13","W-14","W-15","W-16","W-21","W-22","W-23","W-24","W-25","W-29","W-30","W-36","W-40","W-41","W-44"]);

function sectionOfCluster(c) {
  if (c.id.startsWith("CHK")) {
    const ref = chkRef.get(c.id) || "";
    const cat = Number((ref.match(/Cat(?:egory)?\s*(\d+)/) || [])[1]);
    if (/Appendix/.test(ref)) return "EXCLUDED";
    if ([1, 5, 9, 11].includes(cat)) return "GA4";
    if ([2, 4, 6, 7, 10].includes(cat)) return "GTM";
    if ([3, 8].includes(cat)) return "WEBCODE";
    if (cat === 12) return "CLARITY";
    return "GTM";
  }
  if (["web-tracking", "web-speed", "web-find"].includes(c.group)) return "WEBCODE";
  return "CRO";
}
function sectionOfExisting(e) {
  const id = e.pid.replace("EXIST-", "");
  if (id.startsWith("GA4")) return "GA4";
  if (id.startsWith("GTM")) return "GTM";
  return CODE.has(id) ? "WEBCODE" : "CRO";
}
function rank(file) {
  const m = new Map();
  for (const l of read(file).slice(1)) {
    const [rank, score, id, , , I, A, M, F, fail, , reason] = l.split("\t");
    m.set(id, { rank: +rank, score: +score, I: +I, A: +A, M: +M, F: +F, reason });
  }
  return m;
}
const personas = { "store-owner": rank("rank-store-owner.tsv"), "media-buyer": rank("rank-media-buyer.tsv") };
fs.mkdirSync("pools", { recursive: true });
const summary = {};
for (const [p, r] of Object.entries(personas)) {
  const bySec = {};
  for (const c of clusters) {
    const sec = sectionOfCluster(c);
    const s = r.get(c.id) || {};
    (bySec[sec] ||= []).push({
      cand: c.id, sec, label: c.label, score: s.score ?? 0, I: s.I, A: s.A, M: s.M,
      tested: c.stores_total > 0, stores_fail: `${c.stores_fail}/${c.stores_total}`,
      already_in_tool: c.tool_existing || "-", reason: s.reason || "",
      criteria: (c.criteria || "").replace(/\s+/g, " ").slice(0, 200),
      effect: (c.business_effect || "").replace(/\s+/g, " ").slice(0, 200),
    });
  }
  for (const e of existing) {
    const sec = sectionOfExisting(e);
    (bySec[sec] ||= []).push({
      cand: e.pid, sec, label: e.title, score: null, tested: "current-tool", stores_fail: "-",
      already_in_tool: e.pid, reason: "current tool point (measurable today)",
      criteria: (e.criteria || "").slice(0, 200), effect: (e.business_effect || "").slice(0, 200),
      fact: e.fact, browser: e.browser,
    });
  }
  for (const [sec, rows] of Object.entries(bySec)) {
    rows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    fs.writeFileSync(`pools/${p}-${sec}.jsonl`, rows.map(x => JSON.stringify(x)).join("\n") + "\n");
    (summary[p] ||= {})[sec] = rows.length;
  }
}
console.log(summary);
