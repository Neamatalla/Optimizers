import type { PointCategory } from "./types.js";

// Report section names for the master-point categories. Its own file so the
// browser report can import it without the worker-only pipeline code.
export const POINT_CATEGORY_LABELS: Record<PointCategory, { en: string; ar: string }> = {
  tracking: { en: "Tracking", ar: "التتبع" },
  "buying-path": { en: "Buying path", ar: "مسار الشراء" },
  "product-page": { en: "Product page", ar: "صفحة المنتج" },
  collection: { en: "Collection pages", ar: "صفحات الأقسام" },
  homepage: { en: "Homepage", ar: "الصفحة الرئيسية" },
  navigation: { en: "Navigation and search", ar: "التنقل والبحث" },
  trust: { en: "Trust", ar: "الثقة" },
  offers: { en: "Offers and order value", ar: "العروض وقيمة الطلب" },
  landing: { en: "Ad landing pages", ar: "صفحات هبوط الإعلانات" },
  speed: { en: "Speed", ar: "السرعة" },
  findability: { en: "Search visibility", ar: "الظهور في البحث" },
  risk: { en: "Risks", ar: "المخاطر" },
};
