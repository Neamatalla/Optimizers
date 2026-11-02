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
  // fud-2.1.0 framework rules.
  {
    ruleId: "H5",
    status: "warn",
    technical: { summary: "Hero has a headline and one button; no benefit points on the first screen", detail: "Above the fold: h1 'Rosemary Oil for Stronger Hair', one button 'تسوقي الآن'. No li or check-marked lines until 1,400px down." },
    business: { summary: "The first screen doesn't say what shoppers get", detail: "Visitors see a headline and a button, but no quick reasons to stay. Three short points like 'natural', 'delivery in 48 hours' and 'cash on delivery' answer 'why here?' in a glance." },
    recommendation: "Add three short benefit points with check marks under the homepage headline.",
    exampleCopy: { en: "✓ 100% natural oils · ✓ Delivered in 48 hours · ✓ Pay on delivery", ar: "✓ زيوت طبيعية ١٠٠٪ · ✓ توصيل خلال ٤٨ ساعة · ✓ ادفعي عند الاستلام" },
    ar: {
      technical: { summary: "أول شاشة فيها عنوان وزرار واحد ومفيش نقاط مزايا", detail: "فوق الطيّة: عنوان h1 وزرار 'تسوقي الآن'. مفيش نقاط بعلامة صح لحد ١٤٠٠ بكسل تحت." },
      business: { summary: "أول شاشة مش بتقول العميل هياخد إيه", detail: "الزائر بيشوف عنوان وزرار، من غير أسباب سريعة يكمّل. تلات نقاط قصيرة زي 'طبيعي' و'توصيل في ٤٨ ساعة' و'الدفع عند الاستلام' بترد على 'ليه هنا؟' في لمحة." },
      recommendation: "ضيف تلات نقاط مزايا قصيرة بعلامة صح تحت عنوان الصفحة الرئيسية.",
    },
  },
  {
    ruleId: "P6",
    status: "warn",
    technical: { summary: "No ordering or delivery steps on the product page", detail: "No block matches how-it-works / steps patterns; delivery info only in the footer policy link." },
    business: { summary: "Shoppers can't picture what happens after they order", detail: "Nothing shows how ordering, delivery and payment work, or what result to expect. A three-step strip makes buying feel easy and the outcome real." },
    recommendation: "Add a three-step strip under the buy button: order today, delivered in 2 days, pay at the door.",
    exampleCopy: { en: "Order today → At your door in 48 hours → Pay when it arrives", ar: "اطلبي النهارده ← توصل لحد بابك في ٤٨ ساعة ← ادفعي لما توصل" },
    funnel: { from: "view_item", to: "add_to_cart", rate: 0.08 },
    ar: {
      technical: { summary: "مفيش خطوات للطلب أو التوصيل في صفحة المنتج", detail: "مفيش أي جزء بيشرح الخطوات؛ معلومات التوصيل في رابط السياسة في الفوتر بس." },
      business: { summary: "العميل مش قادر يتخيل إيه اللي هيحصل بعد الطلب", detail: "مفيش حاجة بتوري الطلب والتوصيل والدفع بيمشوا إزاي، ولا النتيجة. شريط من تلات خطوات بيخلي الشرا سهل والنتيجة حقيقية." },
      recommendation: "ضيف شريط من تلات خطوات تحت زرار الشراء: اطلبي النهارده، توصل في يومين، ادفعي على الباب.",
    },
  },
  {
    ruleId: "P8",
    status: "warn",
    technical: { summary: "Only studio photos; no customer images or video", detail: "6 product images, all on a plain background; review blocks are text only; no photo-review app detected." },
    business: { summary: "No photos from real customers", detail: "Every photo is a studio shot. Photos and short videos from real buyers show the product in real life, and they convince a first-time buyer more than any studio image." },
    recommendation: "Ask buyers for a photo after delivery and show the best ones under the gallery.",
    ar: {
      technical: { summary: "صور استوديو بس؛ مفيش صور أو فيديو من العملاء", detail: "٦ صور على خلفية سادة؛ التقييمات نص بس؛ مفيش تطبيق تقييمات بالصور." },
      business: { summary: "مفيش صور من عملاء حقيقيين", detail: "كل الصور استوديو. صور وفيديوهات قصيرة من مشترين حقيقيين بتوري المنتج في الحقيقة، وبتقنع أول مرة يشتري أكتر من أي صورة استوديو." },
      recommendation: "اطلبي من العملاء صورة بعد التوصيل واعرضي أحسنها تحت الصور.",
    },
  },
  {
    ruleId: "P9",
    status: "warn",
    technical: { summary: "No comparison with other oils or brands", detail: "No 'vs', comparison table or 'why us' block on the product page." },
    business: { summary: "Shoppers leave to compare", detail: "Nothing answers 'why this oil and not the cheaper one?'. A short us-vs-others table answers it on the page, before they open another tab." },
    recommendation: "Add a 4-row table comparing your oil with a typical supermarket oil: purity, origin, results, price per use.",
    ar: {
      technical: { summary: "مفيش مقارنة بزيوت أو براندات تانية", detail: "مفيش 'مقابل' ولا جدول مقارنة ولا 'ليه تختارينا' في صفحة المنتج." },
      business: { summary: "العميل بيمشي يقارن", detail: "مفيش حاجة بترد على 'ليه الزيت ده مش الأرخص؟'. جدول قصير إحنا قصاد غيرنا بيرد عليها في الصفحة، قبل ما يفتح تاب تاني." },
      recommendation: "ضيف جدول من ٤ صفوف بيقارن زيتك بزيت السوبرماركت: النقاء، المصدر، النتيجة، السعر لكل استخدام.",
    },
  },
  {
    ruleId: "P10",
    status: "warn",
    technical: { summary: "FAQ only as a footer link to a general page", detail: "policyLinks has faq → /pages/faq; no question blocks on the product page." },
    business: { summary: "The last questions have no answer on the page", detail: "A shopper who wonders 'is it original?' or 'how long until delivery?' has to leave the page to find out. Many don't come back." },
    recommendation: "Add 5 short questions under the reviews: original or not, delivery time, how to use, returns, results timeline.",
    ar: {
      technical: { summary: "الأسئلة الشائعة رابط في الفوتر لصفحة عامة بس", detail: "فيه رابط /pages/faq؛ مفيش أسئلة في صفحة المنتج نفسها." },
      business: { summary: "آخر الأسئلة ملهاش رد في الصفحة", detail: "العميل اللي بيسأل 'أصلي ولا لأ؟' أو 'التوصيل ياخد قد إيه؟' لازم يسيب الصفحة يدوّر. ناس كتير مش بترجع." },
      recommendation: "ضيف ٥ أسئلة قصيرة تحت التقييمات: أصلي ولا لأ، مدة التوصيل، طريقة الاستخدام، الاسترجاع، النتيجة إمتى.",
    },
  },
  {
    ruleId: "K1",
    status: "warn",
    technical: { summary: "Product is 20% off, but the cart shows only the final total", detail: "PDP shows 'خصم 20%' with a crossed-out price; cart drawer shows subtotal only, no saving line." },
    business: { summary: "The cart hides the saving", detail: "The product page says 20% off, but the cart only shows the total. A 'You saved 250 EGP' line right above checkout reminds shoppers of the deal at the moment they decide." },
    recommendation: "Show 'You saved …' above the checkout button whenever the cart has discounted items.",
    exampleCopy: { en: "You saved 250 EGP on this order", ar: "وفّرتي ٢٥٠ ج.م في الأوردر ده" },
    funnel: { from: "add_to_cart", to: "begin_checkout", rate: 0.41 },
    ar: {
      technical: { summary: "المنتج عليه خصم ٢٠٪ بس السلة بتوري الإجمالي بس", detail: "صفحة المنتج فيها 'خصم 20%' وسعر مشطوب؛ درج السلة فيه الإجمالي بس من غير سطر توفير." },
      business: { summary: "السلة مخبية التوفير", detail: "صفحة المنتج بتقول خصم ٢٠٪، بس السلة بتوري الإجمالي بس. سطر 'وفّرتي ٢٥٠ جنيه' فوق زرار الدفع بيفكّر العميل بالعرض في لحظة القرار." },
      recommendation: "اعرض 'وفّرت …' فوق زرار الدفع لما يكون في السلة منتجات عليها خصم.",
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
