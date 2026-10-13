import type { FudFinding, FudResult } from "../types.js";
import { RULE_SET_VERSION } from "./rules.js";
import { band, computePexti, frictionScore, sortFindings } from "./score.js";
import { ruleById } from "./rules.js";

/**
 * Dev-only sample for `npm run preview-report -- --fud`: a plausible
 * Egyptian fashion store, written in both languages, so the friction
 * section can be iterated on without a browser or a Claude call.
 */

function placeholderCrop(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="520" viewBox="0 0 390 520"><rect width="390" height="520" fill="#f4f4f2"/><rect x="20" y="24" width="350" height="18" rx="4" fill="#d9d9d4"/><rect x="20" y="58" width="220" height="14" rx="4" fill="#e3e3de"/><rect x="20" y="300" width="350" height="52" rx="10" fill="#1f1f1f"/><text x="195" y="332" font-family="Arial" font-size="16" fill="#fff" text-anchor="middle">Add to cart</text><text x="195" y="470" font-family="Arial" font-size="14" fill="#8a8a85" text-anchor="middle">${label}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

type Draft = Pick<FudFinding, "ruleId" | "status" | "technical" | "business"> & Partial<FudFinding> & { ar: NonNullable<FudFinding["ar"]> };

const DRAFTS: Draft[] = [
  {
    ruleId: "A1",
    status: "fail",
    technical: { summary: "No shipping fee or free-shipping threshold in the cart drawer or near the PDP price", detail: "Cart drawer lists the item, subtotal 1,250 EGP and a Checkout button; no block mentions shipping. The PDP mentions 'شحن سريع' without a cost. The threshold only appears on the shipping policy page." },
    business: { summary: "Shoppers first see the shipping cost at checkout", detail: "Your cart shows the product and the total, but nothing about delivery cost. Shoppers who don't know what they'll pay for shipping often leave at checkout to compare, and many don't come back." },
    recommendation: "Add a free-shipping progress line at the top of the cart drawer and one line under the price on product pages.",
    exampleCopy: { en: "Add 250 EGP more for free delivery", ar: "أضف ٢٥٠ ج.م للحصول على توصيل مجاني" },
    funnel: { from: "add_to_cart", to: "begin_checkout", rate: 0.31 },
    ar: {
      technical: { summary: "لا توجد تكلفة شحن أو حد للشحن المجاني في درج السلة أو بجانب سعر المنتج", detail: "درج السلة يعرض المنتج والمجموع 1,250 ج.م وزر إتمام الشراء، ولا يذكر الشحن. صفحة المنتج تذكر 'شحن سريع' دون تكلفة." },
      business: { summary: "يرى المتسوق تكلفة الشحن لأول مرة عند الدفع", detail: "سلتك تعرض المنتج والمجموع فقط، دون تكلفة التوصيل. المتسوق الذي لا يعرف تكلفة الشحن يغادر غالبًا عند الدفع للمقارنة، وكثيرون لا يعودون." },
      recommendation: "أضف شريط تقدّم للشحن المجاني أعلى درج السلة، وسطرًا واحدًا أسفل السعر في صفحات المنتجات.",
    },
  },
  {
    ruleId: "B1",
    status: "warn",
    technical: { summary: "Return policy only in the footer; nothing about returns or COD within 220px of the CTA", detail: "Footer link 'سياسة الاسترجاع' exists. Blocks marked |cta cover price, size pills and the button only." },
    business: { summary: "Your return policy is hidden at the bottom of the page", detail: "Shoppers decide at the button. If they can't see they can return or pay on delivery right there, the risk feels like theirs, especially on a first order." },
    recommendation: "Put one line under the Add to Cart button with your return window and cash on delivery.",
    exampleCopy: { en: "Free returns within 14 days · Cash on delivery", ar: "استرجاع مجاني خلال ١٤ يومًا · الدفع عند الاستلام" },
    ar: {
      technical: { summary: "سياسة الاسترجاع في التذييل فقط، ولا شيء عن الاسترجاع أو الدفع عند الاستلام قرب زر الشراء", detail: "رابط 'سياسة الاسترجاع' موجود في التذييل. البنود القريبة من الزر تشمل السعر والمقاسات والزر فقط." },
      business: { summary: "سياسة الاسترجاع مخفية في أسفل الصفحة", detail: "المتسوق يتخذ قراره عند الزر. إذا لم يرَ هناك أنه يستطيع الاسترجاع أو الدفع عند الاستلام، يشعر أن المخاطرة عليه، خاصة في الطلب الأول." },
      recommendation: "ضع سطرًا واحدًا أسفل زر الإضافة إلى السلة يذكر مدة الاسترجاع والدفع عند الاستلام.",
    },
  },
  {
    ruleId: "B4",
    status: "warn",
    technical: { summary: "Size pills present (S–XL) but the size guide is inside the 'Details' accordion", detail: "Variant control = pills. 'جدول المقاسات' sits in the third accordion, ~900px below the selector." },
    business: { summary: "Shoppers have to dig for the size chart", detail: "Not knowing their size is the top reason shoppers hesitate on clothing — and the top reason for returns. The chart exists but is hidden far below the sizes." },
    recommendation: "Add a 'Size guide' link right next to the sizes that opens the chart.",
    ar: {
      technical: { summary: "المقاسات أزرار (S–XL) لكن جدول المقاسات داخل قسم 'التفاصيل'", detail: "طريقة الاختيار أزرار. 'جدول المقاسات' في القسم الثالث، على بعد ~900px أسفل المقاسات." },
      business: { summary: "على المتسوق أن يبحث عن جدول المقاسات", detail: "عدم معرفة المقاس هو أكثر سبب للتردد في الملابس، وأكثر سبب للاسترجاع. الجدول موجود لكنه بعيد عن المقاسات." },
      recommendation: "أضف رابط 'دليل المقاسات' بجانب المقاسات مباشرة يفتح الجدول.",
    },
  },
  {
    ruleId: "C3",
    status: "warn",
    technical: { summary: "Reviews are static text testimonials with no platform, dates or photos", detail: "No review widget detected; 3 testimonial blocks with first names only." },
    business: { summary: "Your reviews are hard to believe", detail: "Three short quotes with first names look like they could be written by anyone. Reviews with photos and a 'verified buyer' mark are what convince a first-time shopper." },
    recommendation: "Install a review app that collects photo reviews after delivery and shows 'verified buyer' marks.",
    ar: {
      technical: { summary: "التقييمات نصوص ثابتة دون منصة أو تواريخ أو صور", detail: "لا توجد إضافة تقييمات؛ 3 شهادات بالاسم الأول فقط." },
      business: { summary: "يصعب تصديق التقييمات في متجرك", detail: "ثلاث عبارات قصيرة بأسماء أولى تبدو وكأن أي شخص كتبها. التقييمات المصوّرة مع علامة 'مشترٍ موثّق' هي ما يقنع المتسوق الجديد." },
      recommendation: "ثبّت تطبيق تقييمات يجمع تقييمات مصوّرة بعد التوصيل ويعرض علامة 'مشترٍ موثّق'.",
    },
  },
  {
    ruleId: "A4",
    status: "pass",
    technical: { summary: "valU and cash on delivery shown under the price", detail: "valU widget detected; 'الدفع عند الاستلام' sits right under the price, next to the button." },
    business: { summary: "Shoppers can see they can pay in installments or on delivery", detail: "Right under the price, shoppers see valU installments and cash on delivery, which lowers the risk of a first order." },
    ar: {
      technical: { summary: "valU والدفع عند الاستلام ظاهران أسفل السعر", detail: "تم رصد إضافة valU؛ وعبارة 'الدفع عند الاستلام' قريبة من زر الشراء." },
      business: { summary: "يرى المتسوق أنه يستطيع التقسيط أو الدفع عند الاستلام", detail: "أسفل السعر مباشرة يرى المتسوق تقسيط valU والدفع عند الاستلام، وهذا يقلل مخاطرة الطلب الأول." },
    },
  },
  {
    ruleId: "D3",
    status: "pass",
    technical: { summary: "WhatsApp button on every page", detail: "whatsapp widget detected on home and product; wa.me link in the floating button." },
    business: { summary: "Shoppers can message you on WhatsApp from any page", detail: "A shopper with a question can reach a person in one tap, which keeps them on the page instead of leaving to ask elsewhere." },
    ar: {
      technical: { summary: "زر واتساب في كل الصفحات", detail: "تم رصد زر واتساب في الصفحة الرئيسية وصفحة المنتج." },
      business: { summary: "يستطيع المتسوق مراسلتك على واتساب من أي صفحة", detail: "المتسوق الذي لديه سؤال يصل إلى شخص بضغطة واحدة، فيبقى في الصفحة بدل أن يغادر." },
    },
  },
];

export function sampleFudResult(website: string): FudResult {
  const findings: FudFinding[] = DRAFTS.map(d => {
    const rule = ruleById(d.ruleId)!;
    const leak = Boolean(d.funnel);
    const pexti = computePexti({ status: d.status, signal: d.status === "pass" ? "present" : d.status === "fail" ? "absent" : "elsewhere", rule, leak });
    return {
      ruleVersion: RULE_SET_VERSION,
      pageType: rule.pageType,
      pageUrl: `${website.replace(/\/$/, "")}/${rule.pageType === "home" ? "" : rule.pageType}`,
      confidence: 0.9,
      evidence: { blockIds: [], crop: d.status === "pass" ? null : placeholderCrop(`${rule.pageType} · sample crop`) },
      pexti,
      band: pexti ? band(pexti.score) : undefined,
      funnel: d.funnel ?? null,
      ...d,
    };
  });
  findings.push({
    ruleId: "A3", ruleVersion: RULE_SET_VERSION, pageType: "cart", pageUrl: null, status: "unassessed", unassessedReason: "sample", confidence: 0,
    technical: { summary: "Not checked", detail: "" }, business: { summary: "Not checked", detail: "" }, evidence: { blockIds: [] }, pexti: null,
  });
  const { score, assessed, applicable } = frictionScore(findings.map(f => f.status));
  return {
    ruleSetVersion: RULE_SET_VERSION,
    viewport: "mobile",
    pagesSampled: [
      { url: website, pageType: "home", loaded: true },
      { url: `${website}/products/sample`, pageType: "product", loaded: true },
      { url: `${website}/cart`, pageType: "cart", loaded: true, note: "cart drawer" },
    ],
    score,
    assessed,
    applicable,
    findings: sortFindings(findings),
  };
}
