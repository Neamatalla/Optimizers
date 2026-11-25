// The master audit point list: old points with no master point, and why.
// Drafted 22 Nov 2026 from the old lists (see master-points/README.md), then
// reviewed. This file is now the source of truth: edit it by hand.
// Ids are stable and never reused.

import type { DroppedPoint } from "./types.js";

export const DROPPED: DroppedPoint[] = [
  {
    "id": "CL-001",
    "reason": "Template prescription: collection banner formula",
    "shownInPastReports": 6
  },
  {
    "id": "CL-003",
    "reason": "Low-value: product count",
    "shownInPastReports": 6
  },
  {
    "id": "CL-013",
    "reason": "Low-value and subjective: image style",
    "shownInPastReports": 0
  },
  {
    "id": "CL-014",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "CL-016",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "CL-020",
    "reason": "Niche: swatches only where colour matters",
    "shownInPastReports": 0
  },
  {
    "id": "CL-022",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "CL-023",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 6
  },
  {
    "id": "CL-024",
    "reason": "Template prescription: cross-sell row before footer",
    "shownInPastReports": 6
  },
  {
    "id": "CO-004",
    "reason": "Needs submitting invalid data, tool never places orders",
    "shownInPastReports": 0
  },
  {
    "id": "CO-005",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 5
  },
  {
    "id": "CO-009",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "CO-015",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "CO-016",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 0
  },
  {
    "id": "CP-002",
    "reason": "wireframe prescription, 3-step section",
    "shownInPastReports": 4
  },
  {
    "id": "CP-003",
    "reason": "copy formula, benefits before features",
    "shownInPastReports": 6
  },
  {
    "id": "CP-004",
    "reason": "Landing-page template, not a store check (decided 22 Nov)",
    "shownInPastReports": 0
  },
  {
    "id": "CP-006",
    "reason": "wireframe order, final CTA",
    "shownInPastReports": 6
  },
  {
    "id": "CP-007",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 6
  },
  {
    "id": "CP-010",
    "reason": "copy formula, headline style",
    "shownInPastReports": 6
  },
  {
    "id": "CP-011",
    "reason": "Our visit cannot observe it (past reports show the AI guessed a verdict)",
    "shownInPastReports": 4,
    "aiGuessed": true
  },
  {
    "id": "CP-012",
    "reason": "copy formula, skimmable text",
    "shownInPastReports": 5
  },
  {
    "id": "CP-013",
    "reason": "copy formula, feature-benefit ending",
    "shownInPastReports": 6
  },
  {
    "id": "CP-016",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 6
  },
  {
    "id": "CP-019",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "CT-004",
    "reason": "Overlay dimming is a design detail, low value",
    "shownInPastReports": 0
  },
  {
    "id": "CT-009",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 1
  },
  {
    "id": "CT-012",
    "reason": "RTL stepper order, low value",
    "shownInPastReports": 0
  },
  {
    "id": "CT-013",
    "reason": "Subscribe toggle fits only consumables, low value",
    "shownInPastReports": 4
  },
  {
    "id": "CT-016",
    "reason": "Button styling prescription, low value",
    "shownInPastReports": 0
  },
  {
    "id": "CT-020",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "CT-024",
    "reason": "Vague, needs drawer-to-page comparison",
    "shownInPastReports": 0
  },
  {
    "id": "CT-027",
    "reason": "Needs returning later, tool cannot observe",
    "shownInPastReports": 0
  },
  {
    "id": "CT-028",
    "reason": "Gift note field is low value",
    "shownInPastReports": 0
  },
  {
    "id": "D5",
    "reason": "Low-value: quick-add label wording",
    "shownInPastReports": 19
  },
  {
    "id": "G1",
    "reason": "Template prescription: collection banner formula",
    "shownInPastReports": 6
  },
  {
    "id": "GA4-01",
    "reason": "Summary of TRK-01/02/03; report names worst step",
    "shownInPastReports": 6
  },
  {
    "id": "GA4-25",
    "reason": "low-value",
    "shownInPastReports": 6
  },
  {
    "id": "GTM-12",
    "reason": "Low-value; lead signups minor for stores",
    "shownInPastReports": 6
  },
  {
    "id": "GTM-20",
    "reason": "Paused tags harmless; stray live IDs in TRK-28",
    "shownInPastReports": 6
  },
  {
    "id": "GTM-23",
    "reason": "Low-value; team visits barely move store numbers",
    "shownInPastReports": 6
  },
  {
    "id": "HP-011",
    "reason": "wireframe prescription for single-product brands",
    "shownInPastReports": 0
  },
  {
    "id": "HP-015",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "HP-018",
    "reason": "only if offered; guarantee covered by B1/TR-005",
    "shownInPastReports": 6
  },
  {
    "id": "HP-019",
    "reason": "wireframe prescription, not a store-wide rule",
    "shownInPastReports": 6
  },
  {
    "id": "HP-024",
    "reason": "wireframe prescription for category tiles",
    "shownInPastReports": 1
  },
  {
    "id": "HP-025",
    "reason": "vague, copy preference",
    "shownInPastReports": 6
  },
  {
    "id": "HP-027",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "HP-028",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 6
  },
  {
    "id": "HP-030",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 0
  },
  {
    "id": "HP-031",
    "reason": "template prescription, comparison table",
    "shownInPastReports": 6
  },
  {
    "id": "HP-032",
    "reason": "template prescription, self-qualification block",
    "shownInPastReports": 6
  },
  {
    "id": "HP-033",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 6
  },
  {
    "id": "HP-041",
    "reason": "wireframe order, final CTA",
    "shownInPastReports": 6
  },
  {
    "id": "HP-042",
    "reason": "low-value repeat of USP strip",
    "shownInPastReports": 6
  },
  {
    "id": "HP-043",
    "reason": "wireframe prescription for footer layout",
    "shownInPastReports": 6
  },
  {
    "id": "HP-044",
    "reason": "wireframe prescription for mobile header",
    "shownInPastReports": 1
  },
  {
    "id": "HP-045",
    "reason": "low-value, layout reflow covered by scroll check",
    "shownInPastReports": 0
  },
  {
    "id": "HP-046",
    "reason": "low-value, section parity on phone",
    "shownInPastReports": 1
  },
  {
    "id": "HP-048",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 1
  },
  {
    "id": "HP-049",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "HP-050",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 1
  },
  {
    "id": "LP-003",
    "reason": "Buy box formula for one template",
    "shownInPastReports": 4
  },
  {
    "id": "LP-005",
    "reason": "Template wireframe step order",
    "shownInPastReports": 4
  },
  {
    "id": "LP-006",
    "reason": "Template wireframe order",
    "shownInPastReports": 1
  },
  {
    "id": "LP-010",
    "reason": "Competitor comparison is a template block",
    "shownInPastReports": 4
  },
  {
    "id": "LP-012",
    "reason": "Advertorial template element",
    "shownInPastReports": 0
  },
  {
    "id": "LP-014",
    "reason": "Listicle template format",
    "shownInPastReports": 0
  },
  {
    "id": "LP-015",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 0
  },
  {
    "id": "LP-016",
    "reason": "Real urgency cannot be observed",
    "shownInPastReports": 0
  },
  {
    "id": "LP-017",
    "reason": "Listicle template element",
    "shownInPastReports": 0
  },
  {
    "id": "LP-019",
    "reason": "Listicle template prescription",
    "shownInPastReports": 0
  },
  {
    "id": "LP-020",
    "reason": "Advertorial template element",
    "shownInPastReports": 0
  },
  {
    "id": "LP-021",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-022",
    "reason": "Listicle template element",
    "shownInPastReports": 0
  },
  {
    "id": "LP-023",
    "reason": "Listicle template element",
    "shownInPastReports": 0
  },
  {
    "id": "LP-025",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 0
  },
  {
    "id": "LP-026",
    "reason": "Listicle template prescription",
    "shownInPastReports": 0
  },
  {
    "id": "LP-027",
    "reason": "Advertorial template link rule",
    "shownInPastReports": 0
  },
  {
    "id": "LP-029",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-030",
    "reason": "Advertorial template link rule",
    "shownInPastReports": 0
  },
  {
    "id": "LP-031",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-037",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-038",
    "reason": "Video-page template element",
    "shownInPastReports": 0
  },
  {
    "id": "LP-039",
    "reason": "Video-page template, low value",
    "shownInPastReports": 0
  },
  {
    "id": "LP-040",
    "reason": "Landing-page template, not a store check (decided 22 Nov)",
    "shownInPastReports": 0
  },
  {
    "id": "LP-041",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 0
  },
  {
    "id": "LP-042",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-049",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-050",
    "reason": "Quiz template",
    "shownInPastReports": 0
  },
  {
    "id": "LP-053",
    "reason": "Quiz template",
    "shownInPastReports": 0
  },
  {
    "id": "LP-054",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-055",
    "reason": "Quiz template",
    "shownInPastReports": 0
  },
  {
    "id": "LP-058",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-059",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-060",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 0
  },
  {
    "id": "LP-067",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 0
  },
  {
    "id": "LP-068",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-069",
    "reason": "Landing-page template, not a store check (decided 22 Nov)",
    "shownInPastReports": 0
  },
  {
    "id": "LP-070",
    "reason": "Lead template, many rules in one",
    "shownInPastReports": 0
  },
  {
    "id": "LP-071",
    "reason": "Template wireframe step order",
    "shownInPastReports": 0
  },
  {
    "id": "LP-072",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 0
  },
  {
    "id": "LP-073",
    "reason": "Quiz template",
    "shownInPastReports": 0
  },
  {
    "id": "LP-076",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-078",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-079",
    "reason": "Lead template wireframe",
    "shownInPastReports": 0
  },
  {
    "id": "LP-080",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-084",
    "reason": "Webinar template element",
    "shownInPastReports": 0
  },
  {
    "id": "LP-085",
    "reason": "Webinar template element",
    "shownInPastReports": 0
  },
  {
    "id": "LP-086",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-087",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "LP-088",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 1
  },
  {
    "id": "LP-089",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 1
  },
  {
    "id": "LP-091",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 1
  },
  {
    "id": "LP-093",
    "reason": "App template prescription",
    "shownInPastReports": 1
  },
  {
    "id": "LP-094",
    "reason": "Template wireframe step order",
    "shownInPastReports": 1
  },
  {
    "id": "LP-095",
    "reason": "Comparison table template block",
    "shownInPastReports": 1
  },
  {
    "id": "LP-097",
    "reason": "SaaS template element",
    "shownInPastReports": 1
  },
  {
    "id": "LP-098",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 1
  },
  {
    "id": "LP-099",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 1
  },
  {
    "id": "LP-100",
    "reason": "Template header layout",
    "shownInPastReports": 1
  },
  {
    "id": "LP-102",
    "reason": "Template layout prescription",
    "shownInPastReports": 2
  },
  {
    "id": "LP-104",
    "reason": "Service-page template element",
    "shownInPastReports": 2
  },
  {
    "id": "LP-105",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 2
  },
  {
    "id": "LP-106",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 2
  },
  {
    "id": "MB-010",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "MB-CL-01",
    "reason": "Compound, report-only; PATH-01/PDP-01 cover breakage",
    "shownInPastReports": 0
  },
  {
    "id": "MB-CL-03",
    "reason": "3-day Clarity window; GA4-Clarity gaps are normal",
    "shownInPastReports": 0
  },
  {
    "id": "MB-GA4-04",
    "reason": "always fails; adds little over TRK-01/02/03",
    "shownInPastReports": 10
  },
  {
    "id": "MB-GA4-13",
    "reason": "Low-value; new vs returning paid split",
    "shownInPastReports": 10
  },
  {
    "id": "MB-GTM-18",
    "reason": "Low-value, vague; late consent attribution edge case",
    "shownInPastReports": 10
  },
  {
    "id": "MB-GTM-19",
    "reason": "Low-value; rare container edge case",
    "shownInPastReports": 10
  },
  {
    "id": "MB-GTM-21",
    "reason": "low-value",
    "shownInPastReports": 10
  },
  {
    "id": "MB-GTM-23",
    "reason": "Low-value; stale container serving is rare (past reports show the AI guessed a verdict)",
    "shownInPastReports": 10,
    "aiGuessed": true
  },
  {
    "id": "MB-GTM-24",
    "reason": "Low-value; official templates handle load order",
    "shownInPastReports": 10
  },
  {
    "id": "MB-GTM-25",
    "reason": "Low-value; rare custom variable side effects",
    "shownInPastReports": 10
  },
  {
    "id": "MB-WC-17",
    "reason": "low-value",
    "shownInPastReports": 1
  },
  {
    "id": "MB-WC-18",
    "reason": "Bundle of five speed checks; parts handled elsewhere or low-value",
    "shownInPastReports": 1
  },
  {
    "id": "MB-WC-22",
    "reason": "Cross-origin iframe events not observable by our visit",
    "shownInPastReports": 1
  },
  {
    "id": "P6",
    "reason": "Template prescription: ordering steps section",
    "shownInPastReports": 6
  },
  {
    "id": "P7",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 6
  },
  {
    "id": "P9",
    "reason": "Template prescription: comparison section",
    "shownInPastReports": 6
  },
  {
    "id": "PDP-004",
    "reason": "Template prescription: trust bar layout",
    "shownInPastReports": 6
  },
  {
    "id": "PDP-007",
    "reason": "Template prescription: infographic image in gallery",
    "shownInPastReports": 0
  },
  {
    "id": "PDP-008",
    "reason": "Low-value; gallery arrows nearly always present",
    "shownInPastReports": 0
  },
  {
    "id": "PDP-016",
    "reason": "Template copy formula: one sentence with bold claims",
    "shownInPastReports": 5
  },
  {
    "id": "PDP-018",
    "reason": "Our visit cannot observe it (past reports show the AI guessed a verdict)",
    "shownInPastReports": 4,
    "aiGuessed": true
  },
  {
    "id": "PDP-020",
    "reason": "Template copy formula: three check-icon bullets",
    "shownInPastReports": 6
  },
  {
    "id": "PDP-025",
    "reason": "Niche: only for consumables with subscriptions",
    "shownInPastReports": 6
  },
  {
    "id": "PDP-032",
    "reason": "Template prescription: mini testimonial block",
    "shownInPastReports": 6
  },
  {
    "id": "PDP-036",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 6
  },
  {
    "id": "PDP-037",
    "reason": "Low-value: press and brand logos",
    "shownInPastReports": 6
  },
  {
    "id": "PDP-038",
    "reason": "Template prescription: three-step transformation section",
    "shownInPastReports": 6
  },
  {
    "id": "PDP-039",
    "reason": "Template prescription: alternating benefit rows",
    "shownInPastReports": 2
  },
  {
    "id": "PDP-040",
    "reason": "Template prescription: features section copy formula",
    "shownInPastReports": 2
  },
  {
    "id": "PDP-042",
    "reason": "Template prescription: CTA block with stars and seals",
    "shownInPastReports": 6
  },
  {
    "id": "PDP-046",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "PDP-049",
    "reason": "Template prescription: comparison section",
    "shownInPastReports": 2
  },
  {
    "id": "PDP-050",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 1
  },
  {
    "id": "PDP-052",
    "reason": "Template prescription: objection block",
    "shownInPastReports": 6
  },
  {
    "id": "PDP-057",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 6
  },
  {
    "id": "PDP-058",
    "reason": "Vague; mobile layout covered by phone fit point",
    "shownInPastReports": 0
  },
  {
    "id": "PO-005",
    "reason": "Our visit cannot observe it (past reports show the AI guessed a verdict)",
    "shownInPastReports": 2,
    "aiGuessed": true
  },
  {
    "id": "SO-CL-03",
    "reason": "low-value",
    "shownInPastReports": 0
  },
  {
    "id": "SO-GA4-01",
    "reason": "Summary of TRK-01/02/03; report names worst step",
    "shownInPastReports": 2
  },
  {
    "id": "SO-GTM-09",
    "reason": "Low-value; official templates handle load order",
    "shownInPastReports": 2
  },
  {
    "id": "SO-GTM-13",
    "reason": "Low-value GTM trigger style; not covered by any master point",
    "shownInPastReports": 2
  },
  {
    "id": "SO-GTM-14",
    "reason": "Low-value; lead signups minor for stores",
    "shownInPastReports": 2
  },
  {
    "id": "SO-GTM-17",
    "reason": "Low-value; unpublished workspace changes, not CRO",
    "shownInPastReports": 2
  },
  {
    "id": "SO-GTM-20",
    "reason": "Paused tags harmless; stray live IDs in TRK-28",
    "shownInPastReports": 2
  },
  {
    "id": "SO-GTM-21",
    "reason": "Low-value; team visits barely move store numbers",
    "shownInPastReports": 2
  },
  {
    "id": "SO-GTM-22",
    "reason": "Low-value; rare container edge case",
    "shownInPastReports": 2
  },
  {
    "id": "SO-GTM-25",
    "reason": "Low-value; 404 tracking",
    "shownInPastReports": 2
  },
  {
    "id": "SO-WC-17",
    "reason": "Product name clamping is minor; low-value",
    "shownInPastReports": 0
  },
  {
    "id": "SO-WC-19",
    "reason": "Bundle of render-blocking, weight, slow requests; parts handled elsewhere",
    "shownInPastReports": 0
  },
  {
    "id": "SW-003",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "SW-005",
    "reason": "low-value, basic logo link",
    "shownInPastReports": 0
  },
  {
    "id": "SW-007",
    "reason": "vague, brand-coined labels hard to judge",
    "shownInPastReports": 6
  },
  {
    "id": "SW-011",
    "reason": "low-value, depends on account policy",
    "shownInPastReports": 3
  },
  {
    "id": "SW-012",
    "reason": "low-value, sticky header nice-to-have",
    "shownInPastReports": 6
  },
  {
    "id": "SW-015",
    "reason": "low-value, covered by payment icons near button",
    "shownInPastReports": 5
  },
  {
    "id": "SW-016",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 1
  },
  {
    "id": "SW-021",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "SW-025",
    "reason": "Vague; second review said cut",
    "shownInPastReports": 0
  },
  {
    "id": "SW-026",
    "reason": "low-value, custom 404 page",
    "shownInPastReports": 0
  },
  {
    "id": "SW-029",
    "reason": "low-value, live suggestions nice-to-have",
    "shownInPastReports": 0
  },
  {
    "id": "SW-030",
    "reason": "low-value, no-results page",
    "shownInPastReports": 0
  },
  {
    "id": "TR-003",
    "reason": "indirect proxy, noisy",
    "shownInPastReports": 2
  },
  {
    "id": "TR-008",
    "reason": "rarely applicable seal rule",
    "shownInPastReports": 6
  },
  {
    "id": "TY-001",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "TY-002",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "TY-003",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "TY-004",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "TY-005",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "TY-006",
    "reason": "Our visit cannot observe it",
    "shownInPastReports": 0
  },
  {
    "id": "W-04",
    "reason": "Hanging requests: covered by LCP and render-blocking",
    "shownInPastReports": 1
  },
  {
    "id": "W-06",
    "reason": "Redirect chain; low-value, hosts handle it",
    "shownInPastReports": 1
  },
  {
    "id": "W-14",
    "reason": "Low-value; effect is already seen in SPEED-01",
    "shownInPastReports": 1
  },
  {
    "id": "W-18",
    "reason": "Compression and caching platform-managed; low-value",
    "shownInPastReports": 1
  },
  {
    "id": "W-19",
    "reason": "Font loading detail; low-value for CRO audit",
    "shownInPastReports": 1
  },
  {
    "id": "W-27",
    "reason": "Low-value; UA stopped collecting data",
    "shownInPastReports": 1
  },
  {
    "id": "W-28",
    "reason": "low-value",
    "shownInPastReports": 1
  },
  {
    "id": "W-32",
    "reason": "Platforms set headers; low-value for CRO audit",
    "shownInPastReports": 1
  },
  {
    "id": "W-34",
    "reason": "Library version scans are noisy; low-value",
    "shownInPastReports": 1
  },
  {
    "id": "W-35",
    "reason": "Matching trackers to privacy text is not reliably observable",
    "shownInPastReports": 1
  },
  {
    "id": "W-42",
    "reason": "Brand/GTIN schema fields low-value for GCC stores",
    "shownInPastReports": 1
  },
  {
    "id": "W-43",
    "reason": "Low-value markup detail",
    "shownInPastReports": 1
  },
  {
    "id": "W-46",
    "reason": "Filter URL indexing is niche; low-value",
    "shownInPastReports": 1
  },
  {
    "id": "W-48",
    "reason": "Image alt text low-value for conversion audit",
    "shownInPastReports": 1
  }
];
