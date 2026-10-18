// "What you asked, answered": each reader's own questions, from their ICP
// card (repo docs ICP1-ICP4, icp/ICP-PLAYBOOK.md), each answered by the
// checks and conversion-review rules that hold the evidence. The report
// (html-report.ts questionsHtml) shows every question with a verdict from
// this store's data: what was found, or what was checked and came back clean.
//
// The reader is treated as a person who came to us with these problems; the
// audit is the answer. Questions never change the 50 points or their
// results — they only decide which results answer which question.

import type { AudienceRole } from "./audience.js";

export interface ReaderQuestion {
  id: string;
  en: string;
  ar: string;
  // Checklist points and conversion-review rules that answer it.
  points: string[];
  fud?: string[];
  // "money": the answer leads with the biggest GA4 money range among its
  // failed points. "diy": the answer counts fixes with no developer.
  kind?: "money" | "diy";
  // Shown when every point behind it passed.
  cleanEn: string;
  cleanAr: string;
}

const FUNNEL = ["GA4-01", "GA4-02", "GA4-03", "GA4-04"];
const SIGNAL = ["GTM-01", "GTM-02", "GTM-03", "GTM-07", "GA4-15", "GA4-18", "GA4-19", "GA4-20", "W-22", "W-24"];
const LEARN = ["GTM-04", "GTM-05", "GTM-06", "GTM-08", "GTM-14", "GTM-24", "GTM-25", "GA4-14", "GA4-17", "GA4-21", "W-25", "W-26"];
const WASTE = ["GA4-06", "GA4-07", "GA4-09", "W-05", "W-06", "W-08"];
const PHONES = ["GA4-05", "W-09", "W-10", "W-11", "W-20", "W-17"];
const PAY_DELIVERY = ["GA4-11", "W-02", "W-07"];
const PAY_DELIVERY_FUD = ["A1", "A3", "A4", "B5", "D2", "L2", "M3"];
const PRIVACY = ["GTM-16", "GTM-17", "GTM-18", "GA4-24", "W-29", "W-30", "W-35"];
const EMBARRASS = ["W-31", "W-33", "W-34", "W-30", "GTM-18", "GA4-24", "GTM-01", "GA4-18"];
const CHANNELS = ["GA4-06", "GA4-07", "GA4-08", "GA4-09", "GA4-19"];

export const READER_QUESTIONS: Record<AudienceRole, ReaderQuestion[]> = {
  store_owner: [
    {
      id: "cost", en: "What's costing me sales, and how much?", ar: "وش اللي يكلّفني مبيعات، وكم؟",
      points: [...FUNNEL, "GA4-05", "GA4-06", "GA4-10", "GA4-11", "GA4-12"], kind: "money",
      cleanEn: "No big leak in the funnel steps we could measure.", cleanAr: "ما لقينا تسريب كبير في خطوات الشراء اللي قدرنا نقيسها.",
    },
    {
      id: "diy", en: "What can I fix myself, without a developer?", ar: "وش أقدر أصلح بنفسي بدون مطوّر؟",
      points: [], kind: "diy",
      cleanEn: "Every fix in this report needs a developer.", cleanAr: "كل الإصلاحات في هذا التقرير تحتاج مطوّر.",
    },
    {
      id: "pay", en: "Are my payment and delivery options losing orders?", ar: "هل خيارات الدفع والتوصيل تضيّع علي طلبات؟",
      points: PAY_DELIVERY, fud: PAY_DELIVERY_FUD,
      cleanEn: "Payment options, delivery cost and the free-delivery threshold all checked out.", cleanAr: "خيارات الدفع وتكلفة التوصيل وحد التوصيل المجاني كلها سليمة.",
    },
    {
      id: "phones", en: "Does my store work well on phones?", ar: "هل متجري يشتغل زين على الجوال؟",
      points: PHONES, fud: ["P3", "U1"],
      cleanEn: "Phone speed, layout and taps passed on the pages we tested.", cleanAr: "سرعة الجوال والتصميم واللمس كلها سليمة في الصفحات اللي جربناها.",
    },
    {
      id: "trust", en: "Can I trust the numbers in my dashboard?", ar: "هل أقدر أثق بالأرقام في لوحة التحكم؟",
      points: SIGNAL,
      cleanEn: "Orders and revenue are recorded once, with the right value.", cleanAr: "الطلبات والإيرادات تنسجل مرة وحدة وبالقيمة الصحيحة.",
    },
  ],
  media_buyer: [
    {
      id: "real", en: "Are my ad numbers real?", ar: "هل أرقام الإعلانات بتاعتي حقيقية؟",
      points: SIGNAL,
      cleanEn: "Each sale reaches GA4 and the pixels once, with its value. Judge campaigns on the numbers as they are.", cleanAr: "كل عملية بيع بتوصل لـ GA4 والـ Pixels مرة واحدة بقيمتها. قيّم الحملات على الأرقام زي ما هي.",
    },
    {
      id: "site", en: "Is it the ads or the site?", ar: "المشكلة في الإعلانات ولا في الموقع؟",
      points: [...FUNNEL, "GA4-10", "W-01", "W-02", "W-09", "W-20"], fud: ["P4", "B5", "A1"], kind: "money",
      cleanEn: "The funnel steps we could measure hold up. Look at creative, audience and bids first.", cleanAr: "خطوات الـ funnel اللي قدرنا نقيسها كويسة. ابدأ بالـ creative والـ audience والـ bids.",
    },
    {
      id: "learn", en: "Can the ad platforms learn from my sales?", ar: "هل منصات الإعلانات بتتعلم من المبيعات؟",
      points: LEARN,
      cleanEn: "Cart and purchase events reach the platforms you pay for, with click IDs kept.", cleanAr: "أحداث السلة والشراء بتوصل للمنصات اللي بتدفع لها، والـ click IDs محفوظة.",
    },
    {
      id: "waste", en: "Is my budget paying for clicks that can't buy?", ar: "هل الميزانية بتدفع تمن كليكات مش هتشتري؟",
      points: WASTE,
      cleanEn: "No campaign, country or landing page in the data spends traffic without sales.", cleanAr: "مفيش حملة أو دولة أو صفحة هبوط في الداتا بتجيب زيارات من غير مبيعات.",
    },
    {
      id: "phones", en: "Does paid mobile traffic convert?", ar: "هل الترافيك المدفوع من الموبايل بيحوّل؟",
      points: PHONES,
      cleanEn: "Phones convert close to desktop and the product page loads fast enough.", cleanAr: "الموبايل بيحوّل قريب من الديسكتوب، وصفحة المنتج بتفتح بسرعة كفاية.",
    },
  ],
  marketing_manager: [
    {
      id: "first", en: "What should the team fix first, and what is it worth?", ar: "ما الذي يجب أن يصلحه الفريق أولًا، وما قيمته؟",
      points: [...FUNNEL, "GA4-05", "GA4-06", "GA4-07", "GA4-10", "GA4-11"], kind: "money",
      cleanEn: "No funnel step falls far below its benchmark.", cleanAr: "لا توجد خطوة في مسار الشراء أقل بكثير من معيارها.",
    },
    {
      id: "channels", en: "Which channels and campaigns convert, and which waste budget?", ar: "أي القنوات والحملات تحقق مبيعات، وأيها يهدر الميزانية؟",
      points: CHANNELS,
      cleanEn: "Channels, campaigns and countries in the data all produce sales.", cleanAr: "كل القنوات والحملات والدول في البيانات تحقق مبيعات.",
    },
    {
      id: "phones", en: "Do phones convert as well as desktop?", ar: "هل يحوّل الجوال بمستوى سطح المكتب؟",
      points: PHONES,
      cleanEn: "Phones convert within range of desktop.", cleanAr: "معدل تحويل الجوال قريب من سطح المكتب.",
    },
    {
      id: "trust", en: "Can I trust the numbers I report to the CEO?", ar: "هل يمكنني الوثوق بالأرقام التي أرفعها للإدارة؟",
      points: SIGNAL,
      cleanEn: "Sales and revenue are recorded once, from the right source.", cleanAr: "تُسجَّل المبيعات والإيرادات مرة واحدة ومن المصدر الصحيح.",
    },
    {
      id: "privacy", en: "Are we exposed on privacy and consent?", ar: "هل نحن معرّضون لمخاطر في الخصوصية والموافقة؟",
      points: PRIVACY,
      cleanEn: "Consent, personal data and the privacy policy checks all passed.", cleanAr: "اجتازت فحوصات الموافقة والبيانات الشخصية وسياسة الخصوصية كلها.",
    },
  ],
  agency: [
    {
      id: "win", en: "Is there enough here to win this client?", ar: "هل يكفي ما هنا لكسب هذا العميل؟",
      points: [...FUNNEL, "GA4-05", "GA4-06", "GA4-07", "GA4-10", "GA4-11"], kind: "money",
      cleanEn: "The funnel holds up; the case for work rests on the tracking and tech findings below.", cleanAr: "مسار الشراء متماسك؛ مبرر العمل يعتمد على نتائج التتبع والتقنية أدناه.",
    },
    {
      id: "defend", en: "Is the tracking solid enough to measure our work?", ar: "هل التتبع متين بما يكفي لقياس عملنا؟",
      points: [...SIGNAL, ...LEARN],
      cleanEn: "Sales, values and funnel events are recorded cleanly; results of your work can be measured.", cleanAr: "المبيعات والقيم وأحداث مسار الشراء تُسجَّل بشكل سليم، ويمكن قياس نتائج عملكم.",
    },
    {
      id: "embarrass", en: "What could embarrass us in front of the client?", ar: "ما الذي قد يحرجنا أمام العميل؟",
      points: EMBARRASS,
      cleanEn: "No double counting, exposed files or personal-data leaks were found.", cleanAr: "لم نجد احتسابًا مزدوجًا أو ملفات مكشوفة أو تسرب بيانات شخصية.",
    },
    {
      id: "privacy", en: "Is the client exposed on privacy and consent?", ar: "هل العميل معرّض لمخاطر في الخصوصية والموافقة؟",
      points: PRIVACY,
      cleanEn: "Consent and personal-data checks passed.", cleanAr: "اجتازت فحوصات الموافقة والبيانات الشخصية.",
    },
  ],
};

/** Every id a question points at, for the test that they exist. */
export const QUESTION_IDS = Object.values(READER_QUESTIONS).flat().flatMap(q => q.points);
export const QUESTION_FUD_IDS = Object.values(READER_QUESTIONS).flat().flatMap(q => q.fud ?? []);
