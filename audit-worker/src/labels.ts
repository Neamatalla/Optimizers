import type { ActionOwner } from "./types.js";

// Display labels for opportunity types and owners. No imports beyond types, so
// the report renderer can use them in the browser (src/audit-report/main.ts).

export const OPPORTUNITY_LABEL = {
  revenue_gain: { en: "Revenue gain", ar: "زيادة الإيرادات", short: "RG" },
  revenue_loss: { en: "Stop revenue loss", ar: "إيقاف خسارة الإيرادات", short: "RL" },
  risk: { en: "Risk reduction", ar: "تجنّب المخاطر", short: "RA" },
  benefit: { en: "Benefit gain", ar: "مكسب إضافي", short: "BG" },
} as const;

export const OWNER_LABEL: Record<ActionOwner, { en: string; ar: string }> = {
  dev: { en: "Developer", ar: "المطوّر" },
  marketing: { en: "Marketing", ar: "التسويق" },
  content: { en: "Content", ar: "المحتوى" },
  owner: { en: "Store owner", ar: "صاحب المتجر" },
};
