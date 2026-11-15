/**
 * Dev-only: the store owner preview (preview-report.ts --role=store_owner).
 *
 * Owner round 1 (ROUNDS-LOG-OWNER.md): before this, the owner preview ran the
 * shared GA4-xx checks with shared English text, in EGP, for an Egyptian
 * store, with a checklist written for a media buyer in Egyptian Arabic. So
 * nothing on the page could be judged as "what an owner gets". This file
 * builds what a real owner audit produces instead:
 *   - the owner's own checklist points (SO-*) for the route, through the real
 *     personaChecklistFor + computeCategoryResult + ga4-facts code;
 *   - owner-voice English and Gulf Arabic finding text (what the AI writes from
 *     icp/store-owner.md on a real run), quoting the computed GA4 numbers;
 *   - a Saudi store on Salla, in SAR (preview-owner-data.ts);
 *   - the page review (FUD) and the CRO checklist in owner Gulf Arabic.
 * The media buyer preview doesn't use any of this.
 */
import { computeCategoryResult } from "./audit-prompt.js";
import { computeGa4Facts } from "./ga4-facts.js";
import { personaChecklistFor } from "./persona-checklist.js";
import type { PersonaChecklistPoint } from "./checklist-persona-data.js";
import { buildSampleFud, type SampleFudDraft } from "./fud/sample.js";
import { withFudActions } from "./preview-actions.js";
import { OWNER_STORE, ownerSampleGa4OAuth, ownerStoreEvidence } from "./preview-owner-data.js";
import type { CategoryKey, CategoryResult, FudResult, Ga4Facts, ToolId } from "./types.js";

export type PreviewMode = "tracking" | "single" | "website";

/** The tools an owner on each route connected (the form's tools field). */
export function ownerTools(mode: PreviewMode): ToolId[] {
  return mode === "tracking" ? ["GA4", "GTM"] : mode === "single" ? ["GA4"] : [];
}

/** Every owner point's title in Gulf Arabic (what a real run's translation gives the reader). */
export const OWNER_AR_TITLE: Record<string, string> = {
  "SO-GA4-01": "الخطوة اللي تضيّع عليك أكثر مبيعات",
  "SO-GA4-02": "عملاء يبدون الدفع وما يكملون",
  "SO-GA4-03": "سلات ما توصل للدفع",
  "SO-GA4-04": "زيارات للمنتج ما تتحول لإضافة للسلة",
  "SO-GA4-05": "اللي يشترون من الجوال أقل من اللي يشترون من الكمبيوتر",
  "SO-GA4-06": "رقم مبيعاتك في قوقل أناليتكس يطابق طلباتك الحقيقية",
  "SO-GA4-07": "قوقل أناليتكس يسجّل الحين، بدون هبوط أو قفزة مفاجئة",
  "SO-GA4-08": "كل خطوة في الشراء تنسجّل",
  "SO-GA4-09": "منتجات عليها مشاهدات كثيرة وإضافة للسلة قليلة",
  "SO-GA4-10": "صفحات تجيها زيارات وما تجيب مبيعات",
  "SO-GA4-11": "حد التوصيل المجاني مقارنة بمتوسط طلبك",
  "SO-GA4-12": "حملة مدفوعة تجيب زيارات بدون مبيعات",
  "SO-GA4-13": "رجوع العملاء للشراء مرة ثانية",
  "SO-GA4-14": "تابي أو تمارا أو صفحة الدفع تاخذ فضل المبيعات",
  "SO-GA4-15": "دومينات متجرك نفسه تطلع كمصدر زيارات",
  "SO-GA4-16": "قوقل أناليتكس على عملتك ووقتك",
  "SO-GA4-17": "زيارات ومبيعات ما يُعرف مصدرها",
  "SO-GA4-18": "روابط الحملات تحتفظ بمصدرها بعد التحويل",
  "SO-GA4-19": "مواقع التجربة ما تخلط أرقامك الحقيقية",
  "SO-GA4-20": "المبيعات الحقيقية بس هي اللي تنحسب تحويل",
  "SO-GA4-21": "وش يدوّر عليه عملاؤك في متجرك",
  "SO-GA4-22": "المبيعات تنسجّل لكل منتج",
  "SO-GA4-23": "إيميلات وأرقام العملاء ما توصل لقوقل أناليتكس",
  "SO-GA4-24": "زيارات من دول ما توصّل لها",
  "SO-GA4-25": "الساعات والأيام اللي يبيع فيها متجرك أكثر",
  "SO-GTM-01": "كود الشراء ينطلق مرة وحدة، مع الطلب الحقيقي بس",
  "SO-GTM-02": "الدفع والطلبات في متجرك تنسجّل",
  "SO-GTM-03": "إعدادات الموافقة ما تخفي زوارك من الخليج",
  "SO-GTM-04": "الإضافة للسلة تنحسب مرة وحدة لكل إضافة",
  "SO-GTM-05": "كل بكسل إعلانات مركّب مرة وحدة، مو مرتين",
  "SO-GTM-06": "كود الشراء مركّب لكل منصة إعلانات تدفع لها",
  "SO-GTM-07": "ضغطات الواتساب والاتصال تنحسب",
  "SO-GTM-08": "بياناتك تروح لحسابك أنت بس",
  "SO-GTM-09": "بكسل الإعلانات يشتغل قبل أحداثه",
  "SO-GTM-10": "ميتا ما تحسب نفس الطلب مرتين",
  "SO-GTM-11": "كل منصة إعلانات توصلها مبيعاتك على بكسل واحد",
  "SO-GTM-12": "إعلانات قوقل تشوف مبيعاتك",
  "SO-GTM-13": "الأكواد تشتغل على أحداث المتجر، مو على شكل الأزرار",
  "SO-GTM-14": "الاشتراك في النشرة ونموذج التواصل ينحسبون",
  "SO-GTM-15": "معرّفات ضغطات الإعلانات تنحفظ عشان المنصات تربط المبيعات",
  "SO-GTM-16": "الأكواد ما ترسل إيميلات أو أرقام العملاء مكشوفة",
  "SO-GTM-17": "آخر تعديلات التتبع منشورة فعلًا",
  "SO-GTM-18": "ما فيه أكواد غريبة شغّالة في متجرك",
  "SO-GTM-19": "الصفحات اللي تتغير بدون تحميل تنحسب",
  "SO-GTM-20": "أكواد الوكالات والحملات القديمة محذوفة",
  "SO-GTM-21": "زيارات فريقك ما تدخل في أرقام المبيعات",
  "SO-GTM-22": "التشغيل ما يعتمد على إعدادات مقفّلة",
  "SO-GTM-23": "نافذة الموافقة تشتغل قبل الاختيار وبعده",
  "SO-GTM-24": "تسجيل الجلسات مركّب عشان تتأكد من الإصلاحات",
  "SO-GTM-25": "زيارات الصفحات غير الموجودة تنسجّل",
  "SO-WC-01": "زر أضف للسلة يضيف المنتج فعلًا",
  "SO-WC-02": "السلة تفتح بدون أخطاء",
  "SO-WC-03": "صفحة المنتج تفتح بسرعة على الجوال",
  "SO-WC-04": "روابط الواتساب والاتصال على رقم شغّال",
  "SO-WC-05": "قوقل يقدر يعرض منتجاتك وأقسامك",
  "SO-WC-06": "التتبع يشتغل في كل أنواع الصفحات، جوال وكمبيوتر",
  "SO-WC-07": "أحداث الشراء ترسل السعر والعملة وبيانات المنتج",
  "SO-WC-08": "قوقل أناليتكس يحسب كل زيارة مرة وحدة",
  "SO-WC-09": "القيمة المرسلة تطابق السعر اللي في الصفحة",
  "SO-WC-10": "ما فيه صور أو ملفات خربانة في صفحات البيع",
  "SO-WC-11": "بكسلات الإعلانات تشتغل في صفحاتك",
  "SO-WC-12": "الضغطات تستجيب بدون تأخير",
  "SO-WC-13": "صور المنتجات مو أثقل من اللازم",
  "SO-WC-14": "التطبيقات والأكواد ما تبطّئ المتجر",
  "SO-WC-15": "الصفحة ما تتحرك وهي تحمّل",
  "SO-WC-16": "القائمة توصل لكل الأقسام وما فيه روابط خربانة",
  "SO-WC-17": "أسماء المنتجات كاملة في صفحات الأقسام",
  "SO-WC-18": "التتبع يبدأ قبل ما يطلع عميل الجوال من صفحة بطيئة",
  "SO-WC-19": "ما فيه أكواد بطيئة تأخر ظهور الصفحة",
  "SO-WC-20": "ما فيه بقايا أكواد من تطبيقات حذفتها",
  "SO-WC-21": "الألوان تظهر كدوائر ألوان في صفحة المنتج",
  "SO-WC-22": "قوقل يشوف السعر والتوفر الصحيح",
  "SO-WC-23": "بنرات الرئيسية تسجّل المشاهدات والضغطات",
  "SO-WC-24": "الروابط المرسلة تطلع بصورة في الواتساب والانستقرام",
  "SO-WC-25": "بيانات المنتج جاهزة لما تقراها الأكواد",
  "SO-CRO-01": "العميل يشوف إنه يقدر يدفع بمدى وأبل باي وتابي وتمارا قبل الدفع",
  "SO-CRO-02": "تكلفة التوصيل واضحة قبل الدفع",
  "SO-CRO-03": "حد التوصيل المجاني ظاهر ومفهوم",
  "SO-CRO-04": "رسوم الدفع عند الاستلام مكتوبة قبل الدفع",
  "SO-CRO-05": "زر الواتساب واضح على الجوال وما يغطي زر الشراء",
  "SO-CRO-06": "زر أضف للسلة في أول شاشة على الجوال",
  "SO-CRO-07": "أسماء المنتجات بالعربي",
  "SO-CRO-08": "الصفحات العربية من اليمين لليسار على الجوال، والسلة معها",
  "SO-CRO-09": "السلة تعرض نفس السعر وإجمالي واضح",
  "SO-CRO-10": "زر إتمام الطلب في السلة واضح على الجوال",
  "SO-CRO-11": "قسط تابي أو تمارا ظاهر في صفحة المنتج",
  "SO-CRO-12": "ما فيه سحب للجنب في الجوال والأزرار سهلة الضغط",
  "SO-CRO-13": "مدة التوصيل مكتوبة قبل الشراء",
  "SO-CRO-14": "سياسة الاسترجاع والاستبدال سهلة توصل لها",
  "SO-CRO-15": "التقييمات ظاهرة في صفحة المنتج والأقسام",
  "SO-CRO-16": "صفحة المنتج فيها كذا صورة واضحة",
  "SO-CRO-17": "وصف المنتج يجاوب أسئلة المشتري، بالعربي",
  "SO-CRO-18": "سعر الخصم والتوفير واضحين",
  "SO-CRO-19": "المنتجات النافدة ما توقف العميل",
  "SO-CRO-20": "تغيير اللغة والأسعار بالعملة الصحيحة",
  "SO-CRO-21": "منتجات مشابهة تظهر عشان يكبر الطلب",
  "SO-CRO-22": "أيقونة السلة ظاهرة دايم في أعلى الجوال",
  "SO-CRO-23": "البحث سهل تلقاه على الجوال",
  "SO-CRO-24": "الفلترة والترتيب موجودة في الأقسام على الجوال",
  "SO-CRO-25": "ما فيه فيديو ثقيل يشتغل تلقائي في أول شاشة على الجوال",
  "SO-CL-01": "العملاء يضغطون على أشياء ما تشتغل في أهم صفحة منتج",
  "SO-CL-02": "أخطاء في الصفحات اللي يشترون منها",
  "SO-CL-03": "لوين ينزل عملاء الجوال في أهم صفحة منتج",
};

/**
 * Owner-voice text for each failed point: [summary, detail] in English, and
 * [summary, detail, action, done when] in Gulf Arabic. GA4 points quote the
 * computed fact's numbers only (preview-owner.test.ts checks that).
 */
interface FailText { en: [string, string]; ar: [string, string, string, string] }

const FAILS: Record<string, FailText> = {
  "SO-GA4-01": {
    en: ["Your weakest buying step: from cart to checkout", "Of 1,200 people who added to cart, 492 started checkout (41%). A typical store keeps about half (50%). This step costs you an estimated SAR 2,470–6,174 a month."],
    ar: ["أضعف خطوة شراء عندك: من السلة إلى الدفع","من 1,200 شخص أضافوا للسلة، 492 بس بدوا الدفع (41%). المتجر العادي يوصل للنص (50%). هالخطوة تكلفك تقريبًا 2,470–6,174 ر.س بالشهر.", "ابدأ بصفحة السلة. مراجعة الصفحة تحت توضح وش يشوف عميلك فيها ووش تغيّر.", "نسبة السلة للدفع توصل 50% أو أكثر خلال 14 يوم في قوقل أناليتكس."],
  },
  "SO-GA4-03": {
    en: ["Six in ten full carts never reach checkout", "492 of 1,200 shoppers with a full cart started checkout (41%). Most leave without seeing what delivery costs."],
    ar: ["6 من كل 10 سلات ما توصل للدفع", "492 من 1,200 عميل عندهم سلة بدوا الدفع (41%). أغلبهم يطلعون قبل ما يعرفون كم التوصيل.", "اكتب في السلة تكلفة التوصيل وحد التوصيل المجاني، وطرق الدفع، وخلّ زر إتمام الطلب واضح.", "نسبة السلة للدفع 50% أو أكثر خلال 14 يوم."],
  },
  "SO-GA4-05": {
    en: ["Phone shoppers buy three times less than computer shoppers", "Phones convert at 1.2% (17,000 visits). Computers convert at 3.3% (3,000 visits). Closing part of that gap is worth an estimated SAR 5,250–11,300 a month."],
    ar: ["عملاء الجوال يشترون أقل بثلاث مرات من عملاء الكمبيوتر", "الجوال يحوّل 1.2% (17,000 زيارة). الكمبيوتر يحوّل 3.3% (3,000 زيارة). تقليل جزء من الفرق يساوي تقريبًا 5,250–11,300 ر.س بالشهر.", "صلّح مشاكل الجوال اللي لقتها مراجعة الصفحة: الأزرار، والتوصيل والدفع على الشاشة الصغيرة.", "تحويل الجوال يوصل 60% أو أكثر من الكمبيوتر خلال 14 يوم."],
  },
  "SO-GA4-09": {
    en: ["Your Cambodi oud gets views but few adds to cart", "It was viewed 6,000 times in 28 days and added to cart 150 times (2.5%). Your products average 8%. That gap is worth an estimated SAR 3,094–7,734 a month."],
    ar: ["عود كمبودي عليه مشاهدات كثيرة وإضافة قليلة للسلة", "انشاف 6,000 مرة في 28 يوم وانضاف للسلة 150 مرة بس (2.5%). متوسط منتجاتك 8%. الفرق يساوي تقريبًا 3,094–7,734 ر.س بالشهر.", "راجع صفحة المنتج: السعر، والصور، والاسم بالعربي، والأحجام، والتوفر.", "نسبة الإضافة للسلة لهالمنتج توصل متوسط متجرك."],
  },
  "SO-GA4-10": {
    en: ["Your offers page brings visits but almost no sales", "3,000 visits started on your offers page in 28 days, with 2 sales (0.1%). Your store converts at 1.5%. Worth an estimated SAR 3,844–7,688 a month."],
    ar: ["صفحة العروض تجيب زيارات وما تبيع تقريبًا", "3,000 زيارة بدت من صفحة العروض في 28 يوم، وجابت طلبين بس (0.1%). متجرك يحوّل 1.5%. تساوي تقريبًا 3,844–7,688 ر.س بالشهر.", "صلّح صفحة العروض، أو وجّه إعلاناتك وروابطك لصفحة تبيع لين تصلحها.", "الصفحة تحوّل نص متوسط متجرك أو أكثر، أو ما يوصلها زيارات مدفوعة."],
  },
  "SO-GA4-11": {
    en: ["Free delivery starts too far above your average order", "Free delivery starts at SAR 600. Your average order is SAR 350, so the threshold is 1.71 times it. Most shoppers won't try to reach it."],
    ar: ["التوصيل المجاني يبدأ بعيد عن متوسط طلبك", "التوصيل المجاني يبدأ من 600 ر.س. متوسط طلبك 350 ر.س، يعني الحد 1.71 ضعف. أغلب العملاء ما راح يحاولون يوصلون له.", "من إعدادات التوصيل في متجرك، حط التوصيل المجاني فوق متوسط طلبك بشوي، وخلّه يظهر في السلة.", "الحد بين 1.2 و1.5 ضعف متوسط طلبك، ويظهر في السلة على الجوال."],
  },
  "SO-GA4-14": {
    en: ["Tabby gets the credit for 12 of your sales", "tabby.ai shows as the source of 40 visits and 12 sales. Those shoppers came from your ads or Instagram first, so those channels look weaker than they are."],
    ar: ["تابي ياخذ فضل 12 طلب من مبيعاتك", "tabby.ai يطلع مصدر 40 زيارة و12 طلب. هالعملاء جوك أول من إعلاناتك أو الانستقرام، فهالقنوات تبان أضعف من حقيقتها.", "اطلب من اللي يدير حسابك في قوقل أناليتكس يضيف دومينات الدفع لقائمة المصادر المستبعدة.", "ما تطلع كمصدر زيارات في قوقل أناليتكس."],
  },
  "SO-GA4-17": {
    en: ["15% of your visits have no known source", "3,000 of 20,000 visits came with no source. You can't tell if they came from Snapchat, Instagram or WhatsApp."],
    ar: ["15% من زياراتك ما يُعرف مصدرها", "3,000 من 20,000 زيارة جت بدون مصدر. ما تقدر تعرف هل جت من سناب ولا انستقرام ولا واتساب.", "حط علامات حملات بسيطة بحروف صغيرة على كل رابط إعلان، ورابط البايو، والواتساب، والرسائل.", "الزيارات بدون مصدر أقل من 5% في قوقل أناليتكس."],
  },
  "SO-GA4-18": {
    en: ["Links inside your store reset where visits came from", "Your home banner links carry campaign tags. A shopper who taps one looks like a new visit from that campaign."],
    ar: ["روابط داخل متجرك تمسح مصدر الزيارة", "روابط بنر الرئيسية فيها علامات حملات. العميل اللي يضغطها يبان كأنه زيارة جديدة من الحملة.", "شيل علامات الحملات من الروابط داخل متجرك، واطلب من المطوّر يحافظ عليها بعد التحويل.", "ما فيه روابط داخلية عليها علامات حملات."],
  },
  "SO-GA4-20": {
    en: ["Page views count as conversions next to real sales", "Your key events are purchase and page view. Every page view counts as a conversion, so your conversion numbers look far higher than your sales."],
    ar: ["مشاهدة الصفحة تنحسب تحويل مع المبيعات الحقيقية", "الأحداث الرئيسية عندك: الشراء ومشاهدة الصفحة. كل مشاهدة تنحسب تحويل، فأرقام التحويل تبان أكبر بكثير من مبيعاتك.", "في قوقل أناليتكس، خلّ الشراء بس حدث رئيسي، وشيل مشاهدة الصفحة.", "قائمة الأحداث الرئيسية فيها المبيعات الحقيقية بس."],
  },
  "SO-GA4-22": {
    en: ["Sales aren't recorded per product", "Orders reach Google Analytics without the products in them. You can't see which perfume earns the most."],
    ar: ["المبيعات ما تنسجّل لكل منتج", "الطلبات توصل قوقل أناليتكس بدون المنتجات اللي فيها. ما تقدر تعرف أي عطر يجيب أكثر دخل.", "اطلب من المطوّر يرسل اسم كل منتج ورقمه وسعره وكميته مع الطلب.", "أسماء المنتجات تظهر في تقرير المنتجات، ومجموعها يطابق الطلبات."],
  },
  "SO-GA4-24": {
    en: ["Visits from India bring no sales", "India brought 1,500 visits in 28 days (7.5%) and zero sales. You don't deliver there."],
    ar: ["زيارات من الهند بدون مبيعات", "الهند جابت 1,500 زيارة في 28 يوم (7.5%) وولا طلب. وأنت ما توصّل هناك.", "اطلب من اللي يدير إعلاناتك يستبعد الدول اللي ما توصّل لها.", "الزيارات المدفوعة من هالدول قريبة من الصفر."],
  },
  "SO-GTM-01": {
    en: ["Your purchase tag can fire on the thank-you page reload", "The purchase tag fires on the order page view, not on the order itself. A shopper who reloads that page counts as a second sale."],
    ar: ["كود الشراء ممكن ينطلق مرة ثانية لو انعاد تحميل صفحة الشكر", "كود الشراء ينطلق مع فتح صفحة الطلب، مو مع الطلب نفسه. العميل اللي يحدّث الصفحة ينحسب طلب ثاني.", "خلّ المطوّر يربط كود الشراء بحدث الشراء بس، ويرسل رقم الطلب معه.", "كل كود شراء مربوط بحدث الشراء ويرسل رقم الطلب."],
  },
  "SO-GTM-05": {
    en: ["Your Snapchat pixel is installed twice", "It loads from the Salla app and again from Google Tag Manager. Snapchat counts every visit twice."],
    ar: ["بكسل سناب شات مركّب مرتين", "يشتغل من تطبيق سلة ومرة ثانية من قوقل تاق مانجر. سناب يحسب كل زيارة مرتين.", "اختار طريقة وحدة لكل بكسل. تقدر توقف الربط من تطبيق سلة بنفسك، والكود في قوقل تاق مانجر يشيله المطوّر.", "كل بكسل يشتغل مرة وحدة ويرسل حدث واحد لكل إجراء."],
  },
  "SO-GTM-07": {
    en: ["WhatsApp taps aren't counted", "Many of your shoppers order on WhatsApp. Nothing records those taps, so those sales look like they came from nowhere."],
    ar: ["ضغطات الواتساب ما تنحسب", "كثير من عملائك يطلبون بالواتساب. ما فيه شي يسجّل هالضغطات، فالمبيعات تبان كأنها جت من لا مكان.", "خلّ المطوّر يسجّل ضغطة زر الواتساب والاتصال كحدث.", "الضغط على زر الواتساب يرسل حدث."],
  },
  "SO-GTM-10": {
    en: ["Meta can count the same sale twice", "The Meta purchase tag sends no order number. When the store app also reports the sale, Meta can't tell they're the same."],
    ar: ["ميتا ممكن تحسب نفس الطلب مرتين", "كود الشراء حق ميتا ما يرسل رقم الطلب. لما تطبيق المتجر يرسل الطلب بعد، ميتا ما تعرف إنه نفس الطلب.", "خلّ المطوّر يرسل رقم الطلب مع الشراء لميتا.", "كود الشراء حق ميتا يرسل رقم الطلب."],
  },
  "SO-GTM-12": {
    en: ["Google Ads doesn't see your sales", "There is no Google Ads purchase tag. Your brand search ads can't learn which clicks buy."],
    ar: ["إعلانات قوقل ما تشوف مبيعاتك", "ما فيه كود شراء لإعلانات قوقل. إعلانات البحث ما تقدر تتعلم أي ضغطة تشتري.", "خلّ المطوّر يضيف كود الشراء لإعلانات قوقل.", "فيه كود شراء لإعلانات قوقل وشغّال."],
  },
  "SO-GTM-16": {
    en: ["A tag sends customer phone numbers in plain text", "One ad tag sends the phone number from checkout as it is. Platforms ask for it hidden (hashed), or not at all."],
    ar: ["كود يرسل أرقام العملاء مكشوفة", "كود إعلانات يرسل رقم الجوال من صفحة الدفع زي ما هو. المنصات تطلبه مشفّر أو ما ينرسل أبد.", "خلّ المطوّر يشيل بيانات العملاء المكشوفة أو يشفّرها.", "ما فيه إيميل أو رقم مكشوف في أي كود."],
  },
  "SO-GTM-20": {
    en: ["Old tags from a past agency still run", "Three tags from a past agency are still live. They slow your pages and send data you don't use."],
    ar: ["أكواد قديمة من وكالة سابقة لسا شغّالة", "3 أكواد من وكالة سابقة لسا شغّالة. تبطّئ صفحاتك وترسل بيانات ما تستخدمها.", "خلّ المطوّر يحذف الأكواد الميتة والقديمة.", "ما فيه أكواد موقفة أو قديمة."],
  },
  "SO-GTM-23": {
    en: ["Your consent banner doesn't hold tags back", "Ad tags load before the shopper answers the cookie banner."],
    ar: ["نافذة الموافقة ما توقف الأكواد", "أكواد الإعلانات تشتغل قبل ما يرد العميل على نافذة الكوكيز.", "خلّ المطوّر يشغّل إعدادات الموافقة أول، ويربط أكواد الإعلانات فيها.", "كل كود إعلانات ينتظر موافقة العميل."],
  },
  "SO-WC-03": {
    en: ["Your product page is slow on phones", "Google's test puts your product page at 35 out of 100 on a phone. The main photo shows late."],
    ar: ["صفحة المنتج بطيئة على الجوال", "اختبار قوقل يعطي صفحة المنتج 35 من 100 على الجوال. الصورة الرئيسية تتأخر.", "صغّر حجم الصورة الرئيسية، واطلب من المطوّر يحمّلها قبل التطبيقات والبنرات.", "الصورة الرئيسية تظهر في أقل من 2.5 ثانية على الجوال."],
  },
  "SO-WC-04": {
    en: ["One of your two WhatsApp buttons has a wrong number", "Our phone visit found two WhatsApp links. One opens a chat. The other has a number that doesn't work."],
    ar: ["واحد من زرين الواتساب رقمه غلط", "زيارتنا من الجوال لقت رابطين واتساب. واحد يفتح محادثة. والثاني رقمه ما يشتغل.", "عدّل الرقم في زر الواتساب أو إعدادات التطبيق، يبدأ بـ 966 بدون صفر.", "كل روابط الواتساب والاتصال تفتح على رقمك."],
  },
  "SO-WC-07": {
    en: ["Add to cart reaches Google Analytics without a price", "The add-to-cart event has the currency but no value or product. Google can't tell which products shoppers want."],
    ar: ["الإضافة للسلة توصل قوقل أناليتكس بدون سعر", "حدث الإضافة للسلة فيه العملة بس، بدون القيمة أو المنتج. قوقل ما يعرف أي منتجات يبيها العملاء.", "اطلب من المطوّر يرسل القيمة والعملة والمنتجات مع كل حدث شراء.", "الإضافة للسلة ترسل القيمة والعملة واسم المنتج."],
  },
  "SO-WC-13": {
    en: ["Your home banner photo is far too heavy", "The banner photo is about three times bigger than the space it fills. Phones on slow data wait for it."],
    ar: ["صورة البنر في الرئيسية ثقيلة مرة", "صورة البنر أكبر بثلاث مرات تقريبًا من مكانها. الجوالات على نت بطيء تنتظرها.", "صغّر الصورة واضغطها قبل ما ترفعها من جديد.", "ما فيه صورة أكبر من ضعف مكانها."],
  },
  "SO-WC-14": {
    en: ["A reviews app is the heaviest thing on your product page", "The app loads before your product photo. Shoppers on phones see a blank space first."],
    ar: ["تطبيق التقييمات أثقل شي في صفحة المنتج", "التطبيق يحمّل قبل صورة المنتج. عميل الجوال يشوف فراغ أول.", "احذف التطبيقات اللي ما تستخدمها، وخلّ الثقيلة تحمّل بعد الصفحة.", "ما فيه تطبيق هو أثقل جزء في صفحة المنتج."],
  },
  "SO-WC-16": {
    en: ["Your menu misses the gift sets section", "Gift sets has 14 products but no menu link. Two footer links lead to missing pages."],
    ar: ["القائمة ما فيها قسم أطقم الهدايا", "قسم أطقم الهدايا فيه 14 منتج وما له رابط في القائمة. ورابطين في أسفل الصفحة يودّون لصفحات مو موجودة.", "أضف الأقسام الناقصة للقائمة، وصلّح أو احذف الروابط الخربانة.", "كل قسم فيه منتجات له رابط في القائمة، وما فيه روابط خربانة."],
  },
  "SO-WC-24": {
    en: ["Links you share on WhatsApp show no picture", "Your product links have no share image. In WhatsApp and Instagram they show as plain text."],
    ar: ["الروابط اللي ترسلها بالواتساب تطلع بدون صورة", "روابط منتجاتك ما فيها صورة مشاركة. في الواتساب والانستقرام تطلع نص بس.", "أضف صورة ووصف للمشاركة للرئيسية والمنتجات، أو اطلب من المطوّر يفعّلها.", "الرئيسية وصفحات المنتجات تطلع بصورة لما ترسلها."],
  },
  "SO-CRO-01": {
    en: ["Shoppers can't see they can pay with mada or Tabby", "No payment logos show on the product page or in the cart. Shoppers find out only at checkout."],
    ar: ["العميل ما يشوف إنه يقدر يدفع بمدى أو تابي", "ما فيه شعارات دفع في صفحة المنتج ولا في السلة. العميل يعرف بس في صفحة الدفع.", "حط شعارات طرق الدفع (مدى، أبل باي، تابي، تمارا، الدفع عند الاستلام) تحت زر أضف للسلة وجنب زر إتمام الطلب.", "صفحة المنتج والسلة تعرض طرق الدفع على الجوال."],
  },
  "SO-CRO-02": {
    en: ["Delivery cost shows only at checkout", "Your cart says free delivery from SAR 600. It doesn't say what delivery costs below that."],
    ar: ["تكلفة التوصيل ما تظهر إلا في الدفع", "سلتك تقول التوصيل مجاني فوق 600 ر.س. بس ما تقول كم التوصيل تحتها.", "اكتب تكلفة التوصيل في السلة وصفحة المنتج.", "عميل الجوال يقرا تكلفة التوصيل قبل ما يضغط إتمام الطلب."],
  },
  "SO-CRO-04": {
    en: ["The cash-on-delivery fee isn't stated", "Cash on delivery is offered, but its fee shows only at the last step."],
    ar: ["رسوم الدفع عند الاستلام مو مكتوبة", "الدفع عند الاستلام موجود، بس رسومه تظهر في آخر خطوة.", "أضف سطر جنب شعارات الدفع: «الدفع عند الاستلام: رسوم X ر.س» أو «بدون رسوم».", "رسوم الدفع عند الاستلام مكتوبة في صفحة المنتج أو السلة."],
  },
  "SO-CRO-11": {
    en: ["The Tabby instalment price isn't on your product page", "Tabby is set up at checkout, but the product page doesn't show 'pay in 4'."],
    ar: ["قسط تابي مو ظاهر في صفحة المنتج", "تابي مفعّل في الدفع، بس صفحة المنتج ما تقول «قسّمها على 4».", "فعّل ودجت تابي أو تمارا في صفحة المنتج من إعدادات التطبيق.", "صفحة المنتج تعرض مبلغ القسط على الجوال."],
  },
  "SO-CRO-13": {
    en: ["Delivery time isn't shown before buying", "Nothing on the product page says how many days delivery takes."],
    ar: ["مدة التوصيل مو مكتوبة قبل الشراء", "ما فيه شي في صفحة المنتج يقول كم يوم ياخذ التوصيل.", "أضف سطر تحت السعر: «التوصيل خلال 2 إلى 4 أيام».", "صفحة المنتج تعرض مدة التوصيل على الجوال."],
  },
  "SO-CRO-15": {
    en: ["Ratings don't show under product titles", "Reviews exist further down the page. Collection cards show no stars."],
    ar: ["التقييمات ما تظهر تحت اسم المنتج", "التقييمات موجودة تحت في الصفحة. وبطاقات الأقسام ما فيها نجوم.", "اعرض التقييم تحت اسم المنتج، واطلب من آخر العملاء يقيّمون بالواتساب.", "صفحة المنتج تعرض التقييم وعدده تحت الاسم."],
  },
  "SO-CRO-19": {
    en: ["Three sold-out products sit on your home page", "Our phone visit saw 3 sold-out products in the first rows. Shoppers tap them and hit a dead end."],
    ar: ["3 منتجات نافدة في الصفحة الرئيسية", "زيارتنا من الجوال شافت 3 منتجات نافدة في أول الصفوف. العميل يضغطها ويلقاها خلصانة.", "شيل المنتجات النافدة من البنر وأول الصفوف، وحط «منتجات مشابهة» في صفحاتها.", "ما فيه منتج نافد في البنر أو أول صف."],
  },
};

/** Points with no computed GA4 fact (or no data for it) that fail in this sample. */
const FAIL_WITHOUT_FACT = new Set(Object.keys(FAILS));

function passText(p: PersonaChecklistPoint) {
  const ar = OWNER_AR_TITLE[p.id] ?? p.title;
  return {
    en: { summary: `${p.title}: in place.`, detail: p.whyItMatters ?? p.expectedState },
    ar: { summary: `${ar}: تمام.`, detail: "شغّال عندك الحين. ما يحتاج تسوي شي." },
    protectEn: "Keep it as it is while the fixes above go in.",
    protectAr: "خلّه على حاله وأنت تشتغل على الإصلاحات اللي فوق.",
  };
}

/** The raw model answer a real owner audit would return for these points. */
function ownerRawFindings(points: PersonaChecklistPoint[], facts: Ga4Facts | null): unknown[] {
  return points.map(p => {
    const fact = p.factId ? facts?.facts[p.factId] : undefined;
    const status = fact && fact.status !== "no_data" ? fact.status : FAIL_WITHOUT_FACT.has(p.id) ? "fail" : "pass";
    const fail = FAILS[p.id];
    const technicalEn = fact?.en ?? (status === "fail" ? p.commonFailure : p.expectedState);
    if (status === "fail") {
      if (!fail) throw new Error(`preview-owner: ${p.id} fails in the sample but has no owner text`);
      return {
        checklistId: p.id, status, dataSource: fact ? "live" : "detection", severity: p.severity,
        technical: { summary: fail.en[0], detail: technicalEn },
        business: { summary: fail.en[0], detail: fail.en[1] },
        action: { step: p.action, owners: p.owners, doneWhen: p.doneWhen },
      };
    }
    const t = passText(p);
    return {
      checklistId: p.id, status, dataSource: fact ? "live" : "detection", severity: p.severity,
      technical: { summary: t.en.summary, detail: technicalEn },
      business: t.en,
      protect: `${p.expectedState} ${t.protectEn}`,
    };
  });
}

/** Adds the Gulf Arabic a real run's translation pass would add. */
function withOwnerArabic(cat: CategoryResult): CategoryResult {
  return {
    ...cat,
    findings: cat.findings.map(f => {
      const fail = FAILS[f.checklistId];
      const title = OWNER_AR_TITLE[f.checklistId];
      if (f.status === "fail" && fail) {
        const business = { summary: fail.ar[0], detail: fail.ar[1] };
        return { ...f, ar: { business, technical: business, action: { step: fail.ar[2], doneWhen: fail.ar[3] }, criteria: title ? `${title}.` : undefined } };
      }
      const business = { summary: `${title ?? f.business.summary}: تمام.`, detail: "شغّال عندك الحين. ما يحتاج تسوي شي." };
      return { ...f, ar: { business, technical: business, protect: "خلّه على حاله وأنت تشتغل على الإصلاحات اللي فوق.", criteria: title ? `${title}.` : undefined } };
    }),
  };
}

/** The owner's own checklist results for the route, built by the real scoring code. */
export function ownerActionCategories(mode: PreviewMode, website: string): { categories: CategoryResult[]; ga4Facts: Ga4Facts | null } {
  const ga4Facts = mode === "website" ? null : computeGa4Facts(ownerSampleGa4OAuth(), website, ownerStoreEvidence() as never);
  const tools = ownerTools(mode);
  const keys: CategoryKey[] = mode === "tracking" ? ["GA4", "GTM"] : mode === "single" ? ["GA4", "Website"] : ["Website"];
  const categories = keys.map(k => {
    const list = personaChecklistFor("store_owner", k, tools);
    const raw = { category: k, findings: ownerRawFindings(list, k === "GA4" ? ga4Facts : null) };
    return withOwnerArabic(computeCategoryResult(raw as never, list, { ga4Facts }));
  });
  return { categories, ga4Facts };
}

// ---- the page review (purchase friction) for the owner's store ----

const C = OWNER_STORE.currency;
const OWNER_FUD: SampleFudDraft[] = [
  {
    ruleId: "A1", status: "fail",
    technical: { summary: "Cart shows 'free delivery over SAR 600' but no delivery fee below it", detail: `Cart drawer: one item, subtotal ${C} ${OWNER_STORE.cartTotal}, the line 'التوصيل مجاني للطلبات فوق 600 ر.س' and a checkout button. No delivery fee for smaller orders on the product page or in the cart.` },
    business: { summary: "Shoppers first see the delivery cost at checkout", detail: "Your cart says delivery is free above SAR 600. It doesn't say what smaller orders pay. Shoppers who can't see the cost often leave at checkout to compare." },
    recommendation: "Show the delivery fee in the cart, and how much more unlocks free delivery.",
    exampleCopy: { en: `Add ${C} ${OWNER_STORE.freeDeliveryFrom - OWNER_STORE.cartTotal} more for free delivery`, ar: `أضف ${OWNER_STORE.freeDeliveryFrom - OWNER_STORE.cartTotal} ر.س وخذ التوصيل مجانًا` },
    funnel: { from: "add_to_cart", to: "begin_checkout", rate: 0.41 },
    ar: {
      technical: { summary: "السلة تقول «التوصيل مجاني فوق 600 ر.س» وما تذكر رسوم التوصيل تحتها", detail: `درج السلة: منتج واحد، المجموع ${OWNER_STORE.cartTotal} ر.س، وسطر التوصيل المجاني وزر إتمام الطلب. ما فيه رسوم توصيل للطلبات الأصغر.` },
      business: { summary: "العميل يشوف تكلفة التوصيل أول مرة في الدفع", detail: "سلتك تقول التوصيل مجاني فوق 600 ر.س. بس ما تقول كم يدفع اللي طلبه أصغر. العميل اللي ما يشوف التكلفة يطلع غالبًا من الدفع يقارن." },
      recommendation: "اكتب رسوم التوصيل في السلة، وكم باقي على التوصيل المجاني.",
    },
  },
  {
    ruleId: "B1", status: "warn",
    technical: { summary: "Returns policy only in the footer; nothing about exchanges or cash on delivery near the button", detail: "Footer link 'سياسة الاستبدال والاسترجاع'. Blocks near the button: price, sizes, the button." },
    business: { summary: "Your returns policy is hidden at the bottom of the page", detail: "Shoppers decide at the button. If they can't see they can exchange or pay on delivery there, the risk feels like theirs." },
    recommendation: "Put one line under the Add to cart button with your exchange window and cash on delivery.",
    exampleCopy: { en: "Exchange within 7 days · Cash on delivery", ar: "استبدال خلال 7 أيام · الدفع عند الاستلام" },
    ar: {
      technical: { summary: "سياسة الاسترجاع في أسفل الصفحة بس، وما فيه شي عن الاستبدال أو الدفع عند الاستلام جنب الزر", detail: "رابط سياسة الاستبدال والاسترجاع في أسفل الصفحة. جنب الزر: السعر، والأحجام، والزر." },
      business: { summary: "سياسة الاسترجاع مخفية تحت", detail: "العميل يقرر عند الزر. إذا ما شاف هناك إنه يقدر يستبدل أو يدفع عند الاستلام، يحس إن المخاطرة عليه." },
      recommendation: "حط سطر تحت زر أضف للسلة فيه مدة الاستبدال والدفع عند الاستلام.",
    },
  },
  {
    ruleId: "C3", status: "warn",
    technical: { summary: "Reviews are short text quotes with no dates or photos", detail: "No review widget near the title; 3 quote blocks with first names only." },
    business: { summary: "Your reviews are hard to believe", detail: "Three short quotes with first names could be written by anyone. Photo reviews from real buyers convince a first-time shopper." },
    recommendation: "Turn on product reviews and ask buyers for a photo review after delivery.",
    ar: {
      technical: { summary: "التقييمات عبارات قصيرة بدون تواريخ أو صور", detail: "ما فيه ودجت تقييمات جنب الاسم؛ 3 عبارات بالاسم الأول بس." },
      business: { summary: "تقييماتك صعب أحد يصدقها", detail: "3 عبارات قصيرة بأسماء أولى ممكن أي أحد يكتبها. التقييمات بالصور من عملاء حقيقيين هي اللي تقنع العميل الجديد." },
      recommendation: "فعّل تقييمات المنتجات، واطلب من العملاء تقييم بصورة بعد التوصيل.",
    },
  },
  {
    ruleId: "A4", status: "pass",
    technical: { summary: "Tamara and cash on delivery shown under the price", detail: "Tamara widget detected; 'الدفع عند الاستلام' sits under the price." },
    business: { summary: "Shoppers can see they can pay in instalments or on delivery", detail: "Right under the price, shoppers see Tamara instalments and cash on delivery. That lowers the risk of a first order." },
    ar: {
      technical: { summary: "تمارا والدفع عند الاستلام ظاهرين تحت السعر", detail: "ودجت تمارا موجود؛ و«الدفع عند الاستلام» تحت السعر." },
      business: { summary: "العميل يشوف إنه يقدر يقسّط أو يدفع عند الاستلام", detail: "تحت السعر على طول، يشوف العميل أقساط تمارا والدفع عند الاستلام. هذا يخفف خوف الطلب الأول." },
    },
  },
  {
    ruleId: "D3", status: "warn",
    technical: { summary: "Two WhatsApp links; one number is invalid", detail: "Floating button wa.me/966500000000 works; the footer link wa.me/0500 has no country code." },
    business: { summary: "One of your WhatsApp buttons doesn't open a chat", detail: "The floating button works. The link at the bottom of the page has a broken number, so a shopper with a question hits a dead end." },
    recommendation: "Fix the footer WhatsApp link so the number starts with 966 and has no leading zero.",
    ar: {
      technical: { summary: "رابطين واتساب؛ واحد رقمه غلط", detail: "الزر العائم wa.me/966500000000 شغّال؛ رابط أسفل الصفحة wa.me/0500 بدون مفتاح الدولة." },
      business: { summary: "واحد من أزرار الواتساب ما يفتح محادثة", detail: "الزر العائم شغّال. الرابط اللي تحت رقمه خربان، فالعميل اللي عنده سؤال يوقف." },
      recommendation: "صلّح رابط الواتساب اللي تحت، خلّ الرقم يبدأ بـ 966 بدون صفر.",
    },
  },
  {
    ruleId: "H5", status: "warn",
    technical: { summary: "Hero has a headline and one button; no benefit points on the first screen", detail: "First screen: headline 'عود كمبودي أصلي' and one button 'تسوّق الحين'. No check-marked lines until 1,400px down." },
    business: { summary: "The first screen doesn't say why to buy here", detail: "Visitors see a headline and a button. Three short points answer 'why here?' in a glance." },
    recommendation: "Add three short benefit points with check marks under the homepage headline.",
    exampleCopy: { en: "✓ Original oud · ✓ Delivered in 2–4 days · ✓ Pay on delivery", ar: "✓ عود أصلي · ✓ توصيل خلال 2–4 أيام · ✓ ادفع عند الاستلام" },
    ar: {
      technical: { summary: "أول شاشة فيها عنوان وزر واحد، وما فيها نقاط مزايا", detail: "أول شاشة: عنوان «عود كمبودي أصلي» وزر «تسوّق الحين». ما فيه نقاط بعلامة صح لين 1,400 بكسل تحت." },
      business: { summary: "أول شاشة ما تقول ليش يشتري منك", detail: "الزائر يشوف عنوان وزر. 3 نقاط قصيرة تجاوب «ليش هنا؟» بنظرة." },
      recommendation: "أضف 3 نقاط مزايا قصيرة بعلامة صح تحت عنوان الصفحة الرئيسية.",
    },
  },
  {
    ruleId: "P6", status: "warn",
    technical: { summary: "No ordering or delivery steps on the product page", detail: "No steps block; delivery info only in the footer policy link." },
    business: { summary: "Shoppers can't picture what happens after they order", detail: "Nothing shows how ordering, delivery and payment work. A three-step strip makes buying feel easy." },
    recommendation: "Add a three-step strip under the buy button: order today, delivered in 2–4 days, pay at the door.",
    exampleCopy: { en: "Order today → At your door in 2–4 days → Pay when it arrives", ar: "اطلب اليوم ← يوصلك خلال 2–4 أيام ← ادفع لما يوصل" },
    funnel: { from: "view_item", to: "add_to_cart", rate: 0.08 },
    ar: {
      technical: { summary: "ما فيه خطوات للطلب أو التوصيل في صفحة المنتج", detail: "ما فيه قسم خطوات؛ معلومات التوصيل في رابط السياسة تحت بس." },
      business: { summary: "العميل ما يقدر يتخيل وش يصير بعد الطلب", detail: "ما فيه شي يوضح كيف الطلب والتوصيل والدفع. شريط من 3 خطوات يخلي الشراء سهل." },
      recommendation: "أضف شريط من 3 خطوات تحت زر الشراء: اطلب اليوم، يوصلك خلال 2–4 أيام، ادفع عند الباب.",
    },
  },
  {
    ruleId: "K1", status: "warn",
    technical: { summary: "Product is 20% off, but the cart shows only the final total", detail: "Product page shows 'خصم 20%' with a crossed-out price; the cart shows the subtotal only." },
    business: { summary: "The cart hides the saving", detail: "The product page says 20% off. The cart shows only the total. A 'You saved' line above checkout reminds shoppers of the deal." },
    recommendation: "Show 'You saved …' above the checkout button when the cart has discounted items.",
    exampleCopy: { en: `You saved ${C} 70 on this order`, ar: "وفّرت 70 ر.س في هالطلب" },
    ar: {
      technical: { summary: "المنتج عليه خصم 20% والسلة تعرض الإجمالي بس", detail: "صفحة المنتج فيها «خصم 20%» وسعر مشطوب؛ السلة فيها الإجمالي بس." },
      business: { summary: "السلة تخفي التوفير", detail: "صفحة المنتج تقول خصم 20%. السلة تعرض الإجمالي بس. سطر «وفّرت» فوق زر الدفع يذكّر العميل بالعرض." },
      recommendation: "اعرض «وفّرت …» فوق زر الدفع لما يكون في السلة منتجات عليها خصم.",
    },
  },
];

export function ownerSampleFud(website: string, ga4Facts: Ga4Facts | null): FudResult {
  return withFudActions(buildSampleFud(website, OWNER_FUD), ga4Facts);
}

// ---- the CRO checklist, in the owner's register ----

/**
 * Egyptian → Gulf/Saudi words, for turning the saved tharaa.shop checklist
 * (written for a media buyer, in Egyptian Arabic) into owner register. A
 * word-for-word swap: good enough to judge layout and code-written labels,
 * not the AI's real Gulf writing (round 21's real owner run checks that).
 * Whole words only; the prefixes و/ف/ب/ل are kept.
 */
const EG_TO_GULF: Array<[string, string]> = [
  ["دلوقتي", "الحين"], ["دلوقت", "الحين"], ["النهارده", "اليوم"], ["إزاي", "كيف"], ["ازاي", "كيف"], ["إيه", "وش"], ["ايه", "وش"],
  ["ليه", "ليش"], ["فين", "وين"], ["ده", "هذا"], ["دي", "هذي"], ["دول", "هذول"], ["دا", "هذا"], ["كده", "كذا"], ["كدا", "كذا"],
  ["مش", "مو"], ["مفيش", "ما فيه"], ["معندكش", "ما عندك"], ["عايز", "تبي"], ["عايزة", "تبين"], ["عاوز", "تبي"], ["عايزين", "تبون"],
  ["كويس", "زين"], ["كويسة", "زينة"], ["أوي", "مرة"], ["قوي", "مرة"], ["خالص", "أبد"], ["بتاع", "حق"], ["بتاعة", "حقة"], ["بتاعك", "حقك"], ["بتاعتك", "حقتك"],
  ["زرار", "زر"], ["الزرار", "الزر"], ["زراير", "أزرار"], ["الموبايل", "الجوال"], ["موبايل", "جوال"], ["الزبون", "العميل"], ["الزبونة", "العميلة"], ["زبون", "عميل"],
  ["الأوردر", "الطلب"], ["أوردر", "طلب"], ["شحن", "توصيل"], ["الشحن", "التوصيل"], ["بص", "شوف"], ["بصّ", "شوف"], ["اتأكد", "تأكد"],
  ["لسه", "لسا"], ["برضه", "بعد"], ["برضو", "بعد"], ["حاجة", "شي"], ["حاجات", "أشياء"], ["تاني", "ثاني"], ["تانية", "ثانية"], ["كتير", "كثير"], ["كتيرة", "كثيرة"],
  ["تلات", "ثلاث"], ["تلاتة", "ثلاثة"], ["اتنين", "اثنين"], ["لحد", "لين"], ["علشان", "عشان"], ["يعمل", "يسوي"], ["تعمل", "تسوي"], ["اعمل", "سوّ"], ["بيعمل", "يسوي"],
  ["هيمشي", "بيطلع"], ["هيشتري", "بيشتري"], ["ممكن", "ممكن"], ["اللي", "اللي"], ["اطلبيه", "اطلبه"], ["تسوقي", "تسوّق"], ["ادفعي", "ادفع"], ["ضيف", "أضف"], ["ضيفي", "أضف"],
];

const AR_PREFIX = "(^|[\\s«“‘(\"'،.:؛!؟-])([وفبل]?)";
const EG_RE = EG_TO_GULF.filter(([a, b]) => a !== b).sort((x, y) => y[0].length - x[0].length).map(([eg, gulf]) => [new RegExp(`${AR_PREFIX}${eg}(?=$|[\\s»”’)"'،.:؛!؟-])`, "g"), gulf] as const);
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Gulf words, Western digits and SAR for one Arabic string. */
export function toOwnerArabic(s: string): string {
  let out = s.replace(/[٠-٩]/g, d => String(AR_DIGITS.indexOf(d)));
  for (const [re, gulf] of EG_RE) out = out.replace(re, (_m, pre: string, p: string) => `${pre}${p}${gulf}`);
  return out.replace(/ج\.م|جنيه/g, "ر.س").replace(/\bLE\s?/g, "SAR ").replace(/\bEGP\b/g, "SAR");
}

/** SAR instead of EGP, and the media buyer's ad framing out, for one English string. */
export function toOwnerEnglish(s: string): string {
  const sar = s.replace(/\bLE\s?/g, "SAR ").replace(/\bEGP\b/g, "SAR");
  // A string that is only ad framing keeps its words rather than going blank.
  return sar.replace(/\s*[^.]*\b(?:ad spend|paid visitors?|paid traffic|pay for the click|ROAS|CPA|CAC)\b[^.]*\.(?=\s|$)/gi, "").trim() || sar;
}

function mapStrings(v: unknown, lang: "en" | "ar" | null): unknown {
  // Arabic quoted inside English strings (the store's own button text) gets
  // the same word swap.
  if (typeof v === "string") {
    if (v.startsWith("data:") || v.startsWith("http")) return v;
    return lang === "ar" ? toOwnerArabic(v) : toOwnerEnglish(toOwnerArabic(v));
  }
  if (Array.isArray(v)) return v.map(x => mapStrings(x, lang));
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) out[k] = mapStrings(x, k === "ar" || k === "t" ? "ar" : k === "en" ? "en" : lang);
    return out;
  }
  return v;
}

/** The saved CRO checklist run, reworded for the owner (Gulf Arabic, SAR, no ad framing). */
export function ownerChecklistFixture<T>(checklist: T): T {
  return mapStrings(checklist, null) as T;
}
