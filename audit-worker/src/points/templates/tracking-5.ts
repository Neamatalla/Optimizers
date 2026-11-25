import type { PointTemplate } from "./types.js";

// TRK-39 (session recorder), TRK-40 (Custom HTML pixels, code+ai frame),
// TRK-41 (ecommerce: null), TRK-45 (GA4 retention), TRK-46 (GA4 refunds),
// TRK-47 (hours and days), TRK-48 (ad click ID cookies). Only {reason} (and
// {observation} for TRK-40) are used: the rules write the store's values.
export const TRACKING_5: Record<string, PointTemplate> = {
  "TRK-39": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "A session-recording script (Microsoft Clarity, Hotjar, Mouseflow, Smartlook, Lucky Orange or FullStory) loads on the home page, or a recorder tag is live in GTM." },
          business: { summary: "Session recordings are running.", detail: "You can watch real shoppers use the store, so you can check whether a fix helped instead of guessing." },
          protect: "Keep the recorder installed after theme or tag changes, and open a few recordings after each fix.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "No session-recording script (Microsoft Clarity, Hotjar, Mouseflow, Smartlook, Lucky Orange or FullStory) loads on the home page, and no recorder tag is live in GTM." },
          business: { summary: "No session recordings are running.", detail: "You can't see where shoppers get stuck or confused. The fixes in this report can't be checked on real visits." },
          step: "Install Microsoft Clarity (free) through GTM or the store's app settings.",
          doneWhen: "Recordings of real visits show up in Clarity.",
        },
      },
      store_owner: {
        fail: { business: { summary: "You can't watch how shoppers use your store.", detail: "Recordings show where people get stuck. Without them, you can't tell if a fix worked or you are guessing." } },
      },
      media_buyer: {
        fail: { business: { summary: "No session recordings, so you can't see why paid clicks don't convert.", detail: "Landing page problems stay invisible, and CPA stays high without a reason you can point to. Recordings of paid visits show where they drop. A free recorder is enough." } },
      },
      agency: {
        fail: { business: { summary: "The store has no session recordings.", detail: "Nobody can see where its shoppers get stuck, and the fixes in this report can't be checked on real visits." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "يعمل تسجيل الجلسات في المتجر.", detail: "يُحمَّل سكربت تسجيل جلسات (Microsoft Clarity أو Hotjar أو Mouseflow أو Smartlook أو Lucky Orange أو FullStory) في الصفحة الرئيسية، أو يوجد وسم تسجيل فعّال في GTM." },
          business: { summary: "تسجيل الجلسات يعمل.", detail: "يمكنك مشاهدة استخدام المتسوقين الحقيقيين للمتجر، فتتحقق من أثر كل إصلاح بدل التخمين." },
          protect: "أبقِ أداة التسجيل مثبتة بعد تغييرات القالب والوسوم، وافتح بعض التسجيلات بعد كل إصلاح.",
        },
        fail: {
          technical: { summary: "لا يعمل أي تسجيل للجلسات في المتجر.", detail: "لا يُحمَّل سكربت تسجيل جلسات (Microsoft Clarity أو Hotjar أو Mouseflow أو Smartlook أو Lucky Orange أو FullStory) في الصفحة الرئيسية، ولا يوجد وسم تسجيل فعّال في GTM." },
          business: { summary: "لا يوجد تسجيل للجلسات.", detail: "لا يمكن معرفة أين يتعثر المتسوقون أو يرتبكون. وتبقى إصلاحات هذا التقرير بلا تحقق على زيارات حقيقية." },
          step: "ثبّت Microsoft Clarity (مجاني) عبر GTM أو من إعدادات تطبيقات المتجر.",
          doneWhen: "تظهر تسجيلات لزيارات حقيقية في Clarity.",
        },
      },
      store_owner: {
        fail: { business: { summary: "ما تقدر تشوف كيف المتسوقين يستخدمون متجرك.", detail: "التسجيلات تبيّن لك وين الناس يتعثرون. بدونها ما تعرف إذا الإصلاح نفع أو أنت تخمّن." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش session recordings، فمش عارف ليه الكليكات المدفوعة مبتحوّلش.", detail: "مشاكل الـ landing page بتفضل مخفية، والـ CPA عالي من غير سبب تقدر تشاور عليه. تسجيلات الزيارات المدفوعة بتوريك فين الناس بتسيب. أداة مجانية كفاية." } },
      },
      agency: {
        fail: { business: { summary: "لا يوجد تسجيل للجلسات في «المتجر».", detail: "لا يمكن لأحد رؤية أين يتعثر متسوقوه، وتبقى إصلاحات هذا التقرير بلا تحقق على زيارات حقيقية." } },
      },
    },
  },
  "TRK-40": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Custom HTML tags in GTM load scripts only from known vendors, and no Meta, Snap, TikTok or gtag pixel sits in Custom HTML where an official template exists." },
          business: { summary: "No unknown scripts or hand-pasted pixels were found in GTM.", detail: "Tracking runs from official templates and known vendors, so it breaks less and nothing unknown touches your pages." },
          protect: "Before adding a Custom HTML tag, check the GTM gallery for a template and name an owner for the tag.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "A live Custom HTML tag in GTM holds a Meta, Snap, TikTok or gtag pixel where an official template exists, or loads a script from a host that is not a known vendor." },
          business: { summary: "Pasted pixel code or an unknown script runs on your store.", detail: "Pasted code breaks quietly when a platform changes, and events stop reaching it. An unknown script can slow pages or collect customer data without you knowing." },
          step: "Replace each pasted pixel with the platform's official GTM template. Remove Custom HTML tags nobody owns.",
          doneWhen: "Each Custom HTML tag left live has a named owner and a clear purpose, and loads only from a known vendor.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Pasted pixel code or an unknown script runs on your store.", detail: "Unknown scripts can break your pages or collect your customers' data without you knowing. Pasted pixels can stop working with no warning, and you only notice when sales data goes missing." } },
      },
      media_buyer: {
        fail: { business: { summary: "Pixels pasted as Custom HTML break quietly, so the signal your campaigns learn from drifts from real.", detail: "Events and values can stop reaching Meta, TikTok or Snap after a platform change, and reported ROAS and CPA drift. Official templates are maintained by the platforms. An unknown script host is worth checking too." } },
      },
      agency: {
        fail: { business: { summary: "Pasted pixel code or an unknown script runs on the store.", detail: "Pasted code breaks quietly when a platform changes. An unknown script can slow pages or collect customer data without the store knowing." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "وسوم Custom HTML في GTM لا تحمّل سكربتات إلا من جهات معروفة، ولا يوجد بكسل Meta أو Snap أو TikTok أو gtag داخل Custom HTML حيث يتوفر قالب رسمي." },
          business: { summary: "لم يُعثر على سكربتات مجهولة أو بكسلات ملصوقة يدويًا في GTM.", detail: "التتبع يعمل من قوالب رسمية وجهات معروفة، فيتعطل أقل ولا يلمس صفحاتك شيء مجهول." },
          protect: "قبل إضافة وسم Custom HTML، ابحث في معرض GTM عن قالب جاهز وسمِّ مسؤولًا عن الوسم.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "يحتوي وسم Custom HTML فعّال في GTM على بكسل Meta أو Snap أو TikTok أو gtag حيث يتوفر قالب رسمي، أو يحمّل سكربتًا من نطاق ليس جهة معروفة." },
          business: { summary: "كود بكسل ملصوق أو سكربت مجهول يعمل في المتجر.", detail: "الكود الملصوق يتعطل بصمت عندما تغيّر المنصة شيئًا، وتتوقف الأحداث عن الوصول إليها. والسكربت المجهول قد يُبطئ الصفحات أو يجمع بيانات العملاء دون علم أحد." },
          step: "استبدل كل بكسل ملصوق بقالب GTM الرسمي للمنصة. واحذف وسوم Custom HTML التي لا يملكها أحد.",
          doneWhen: "كل وسم Custom HTML متبقٍّ له مسؤول معروف وغرض واضح، ويحمّل من جهة معروفة فقط.",
        },
      },
      store_owner: {
        fail: { business: { summary: "كود بكسل ملصوق أو سكربت مجهول يشتغل في متجرك.", detail: "السكربتات المجهولة ممكن تخرب صفحاتك أو تجمع بيانات عملائك وأنت ما تدري. والبكسلات الملصوقة ممكن توقف بدون تنبيه، وما تنتبه إلا لما تختفي بيانات المبيعات." } },
      },
      media_buyer: {
        fail: { business: { summary: "البكسلات الملصوقة كـ Custom HTML بتتعطل بهدوء، فالـ signal اللي حملاتك بتتعلم منه بيبعد عن الحقيقي.", detail: "الأحداث والقيم ممكن تبطّل توصل لـ Meta أو TikTok أو Snap بعد أي تغيير في المنصة، والـ ROAS والـ CPA المعروضين يبعدوا عن الحقيقي. القوالب الرسمية بتتحدّث من المنصات نفسها. ومصدر السكربت المجهول يستاهل الفحص كمان." } },
      },
      agency: {
        fail: { business: { summary: "كود بكسل ملصوق أو سكربت مجهول يعمل في «المتجر».", detail: "الكود الملصوق يتعطل بصمت عندما تغيّر المنصة شيئًا. والسكربت المجهول قد يُبطئ الصفحات أو يجمع بيانات العملاء دون علم «المتجر»." } },
      },
    },
  },
  "TRK-41": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "On the product page, each dataLayer push with an ecommerce object after the first is preceded by an ecommerce: null push." },
          business: { summary: "Product data is cleared between events.", detail: "Each event carries only its own items, so product views and add-to-carts are counted correctly." },
          protect: "After any theme or tracking change, check in GTM preview that an ecommerce: null push comes before each ecommerce push.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "On the product page, a dataLayer push with an ecommerce object follows an earlier one with no ecommerce: null push between them, so the earlier items can be carried into the later event." },
          business: { summary: "Old product data can stick to new events.", detail: "Items from an earlier event can be added to a later one. Product reports then show the wrong items as viewed or added to cart, with inflated counts and values." },
          step: "Ask your developer to push ecommerce: null before every push that carries an ecommerce object.",
          doneWhen: "Each ecommerce push on the product page follows an ecommerce: null push and carries only its own items.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your product reports can show the wrong items.", detail: "Product data from one action sticks to the next. Your reports then show the wrong products as viewed and added to cart." } },
      },
      media_buyer: {
        fail: { business: { summary: "Old cart items stick to new events, so item counts and values read higher than real.", detail: "Product-level numbers get inflated, and the signal sent to Meta and Google Ads can carry the wrong items and values. Product ROAS reads higher than real. The developer adds ecommerce: null before each push." } },
      },
      agency: {
        fail: { business: { summary: "Old product data can stick to the store's new events.", detail: "Items from one event can be added to the next. The store's product reports then show the wrong items as viewed or added, with inflated counts and values." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "بيانات التجارة الإلكترونية تُمسح بين الأحداث في صفحة المنتج.", detail: "في صفحة المنتج، يسبق كل دفع إلى dataLayer يحمل كائن ecommerce بعد الأول دفعُ ecommerce: null." },
          business: { summary: "بيانات المنتج تُمسح بين الأحداث.", detail: "كل حدث يحمل منتجاته فقط، فتُحسب مشاهدات المنتجات وإضافاتها إلى السلة بشكل صحيح." },
          protect: "بعد أي تغيير في القالب أو التتبع، تأكد في معاينة GTM أن ecommerce: null يسبق كل دفع ecommerce.",
        },
        fail: {
          technical: { summary: "بيانات المنتج القديمة قد تنتقل إلى أحداث لاحقة في صفحة المنتج.", detail: "في صفحة المنتج، يأتي دفع إلى dataLayer يحمل كائن ecommerce بعد دفع سابق دون ecommerce: null بينهما، فقد تنتقل المنتجات السابقة إلى الحدث اللاحق." },
          business: { summary: "بيانات منتج قديمة قد تلتصق بأحداث جديدة.", detail: "قد تُضاف منتجات حدث سابق إلى حدث لاحق. فتعرض تقارير المنتجات منتجات خاطئة على أنها شوهدت أو أُضيفت إلى السلة، بأعداد وقيم مضخّمة." },
          step: "اطلب من المطوّر دفع ecommerce: null قبل كل دفع يحمل كائن ecommerce.",
          doneWhen: "كل دفع ecommerce في صفحة المنتج يأتي بعد ecommerce: null ويحمل منتجاته فقط.",
        },
      },
      store_owner: {
        fail: { business: { summary: "تقارير منتجاتك ممكن تعرض منتجات غلط.", detail: "بيانات المنتج من إجراء تلصق بالإجراء اللي بعده. فتقاريرك تعرض منتجات غلط على أنها انشافت وانضافت للسلة." } },
      },
      media_buyer: {
        fail: { business: { summary: "منتجات الكارت القديمة بتلزق في الأحداث الجديدة، فأعداد وقيم المنتجات أعلى من الحقيقي.", detail: "أرقام مستوى المنتج بتتضخم، والـ signal المبعوت لـ Meta وGoogle Ads ممكن يشيل منتجات وقيم غلط. والـ ROAS على مستوى المنتج بيبان أعلى من الحقيقي. المطوّر بيضيف ecommerce: null قبل كل push." } },
      },
      agency: {
        fail: { business: { summary: "بيانات منتج قديمة قد تلتصق بأحداث «المتجر» الجديدة.", detail: "قد تُضاف منتجات حدث إلى الحدث التالي. فتعرض تقارير منتجات «المتجر» منتجات خاطئة على أنها شوهدت أو أُضيفت، بأعداد وقيم مضخّمة." } },
      },
    },
  },
  "TRK-45": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "GA4 event data retention is longer than 2 months (GA4 Admin, Data retention)." },
          business: { summary: "GA4 keeps your data long enough to compare periods.", detail: "You can compare this Ramadan or White Friday with the last one." },
          protect: "Check Data retention in GA4 Admin once a year. It resets only if someone changes it.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "GA4 event data retention is set to 2 months. Explorations can't look further back than that." },
          business: { summary: "GA4 forgets detailed data after 2 months.", detail: "You can't compare Ramadan or White Friday with last year in explorations. Seasonal planning has no history behind it." },
          step: "In GA4 Admin, under Data settings, then Data retention, set event data retention to 14 months.",
          doneWhen: "GA4 Admin, Data retention shows 14 months.",
        },
      },
      store_owner: {
        fail: { business: { summary: "GA4 forgets your detailed data after 2 months.", detail: "You can't compare this Ramadan or White Friday with last year's. Planning your season has no history to learn from." } },
      },
      media_buyer: {
        fail: { business: { summary: "GA4 explorations only reach back 2 months, so you can't compare seasons.", detail: "Year-on-year CAC and ROAS for Ramadan or White Friday can't be pulled from GA4 explorations. Seasonal budgets are set without last year's attribution data. It's one setting in GA4 Admin." } },
      },
      agency: {
        fail: { business: { summary: "The store's GA4 forgets detailed data after 2 months.", detail: "Ramadan or White Friday can't be compared with last year in explorations, so seasonal planning has no history behind it." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "مدة حفظ بيانات الأحداث في GA4 أطول من شهرين.", detail: "مدة الاحتفاظ ببيانات الأحداث في GA4 أطول من شهرين (إدارة GA4، الاحتفاظ بالبيانات)." },
          business: { summary: "GA4 يحتفظ ببياناتك مدة كافية لمقارنة الفترات.", detail: "يمكنك مقارنة رمضان أو الجمعة البيضاء هذا العام بالعام الماضي." },
          protect: "افحص إعداد الاحتفاظ بالبيانات في إدارة GA4 مرة في السنة. فهو لا يتغير إلا إذا غيّره أحد.",
        },
        fail: {
          technical: { summary: "مدة حفظ بيانات الأحداث في GA4 شهران فقط.", detail: "مدة الاحتفاظ ببيانات الأحداث في GA4 مضبوطة على شهرين. ولا تستطيع الاستكشافات الرجوع أبعد من ذلك." },
          business: { summary: "GA4 ينسى البيانات التفصيلية بعد شهرين.", detail: "لا يمكن مقارنة رمضان أو الجمعة البيضاء بالعام الماضي في الاستكشافات. فيُخطَّط للمواسم دون سجل تاريخي." },
          step: "في إدارة GA4، ضمن إعدادات البيانات ثم الاحتفاظ بالبيانات، اضبط مدة الاحتفاظ ببيانات الأحداث على 14 شهرًا.",
          doneWhen: "تُظهر إدارة GA4، الاحتفاظ بالبيانات، مدة 14 شهرًا.",
        },
      },
      store_owner: {
        fail: { business: { summary: "GA4 ينسى بياناتك التفصيلية بعد شهرين.", detail: "ما تقدر تقارن رمضان أو الجمعة البيضاء هالسنة بالسنة اللي فاتت. وتخطيط موسمك ما عنده تاريخ تتعلم منه." } },
      },
      media_buyer: {
        fail: { business: { summary: "الـ explorations في GA4 بترجع شهرين بس، فمينفعش تقارن المواسم.", detail: "الـ CAC والـ ROAS لرمضان أو الجمعة البيضاء سنة بسنة مينفعش تتسحب من الـ explorations. وميزانيات المواسم بتتحدد من غير بيانات الـ attribution بتاعة السنة اللي فاتت. وده إعداد واحد في إدارة GA4." } },
      },
      agency: {
        fail: { business: { summary: "GA4 الخاص بـ«المتجر» ينسى البيانات التفصيلية بعد شهرين.", detail: "لا يمكن مقارنة رمضان أو الجمعة البيضاء بالعام الماضي في الاستكشافات، فيُخطَّط للمواسم دون سجل تاريخي." } },
      },
    },
  },
  "TRK-46": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "With purchases in the last 90 days, GA4 also recorded at least one refund event." },
          business: { summary: "Returned and cancelled orders reach GA4.", detail: "GA4 revenue is closer to the money the store keeps." },
          protect: "When you change the order system or platform apps, check that a refund still reaches GA4 with the order's transaction ID.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "GA4 recorded purchases in the last 90 days but no refund event." },
          business: { summary: "Returned and cancelled orders still count as sales in GA4.", detail: "Orders refused on delivery or cancelled are never taken off. GA4 revenue reads higher than the cash the store keeps." },
          step: "Ask your developer to send a GA4 refund event with the transaction ID when an order is returned, refused on delivery or cancelled. The store platform's GA4 app or the Measurement Protocol can do it.",
          doneWhen: "GA4 shows refund events for the store's returned and cancelled orders.",
        },
      },
      store_owner: {
        fail: { business: { summary: "GA4 still counts returned and cancelled orders as sales.", detail: "Orders that come back or get refused at the door stay in your GA4 revenue. It shows more money than you really keep." } },
      },
      media_buyer: {
        fail: { business: { summary: "Refunds never reach GA4, so GA4 revenue and paid ROAS in GA4 read higher than real.", detail: "With COD refusals the gap can be large. Campaigns that bring many refused orders look better than they are. The developer sends a refund event with the transaction ID." } },
      },
      agency: {
        fail: { business: { summary: "Returned and cancelled orders still count as sales in the store's GA4.", detail: "Orders refused on delivery or cancelled are never taken off, so GA4 revenue reads higher than the cash the store keeps." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "يسجّل GA4 أحداث استرداد للمشتريات خلال 90 يومًا.", detail: "مع وجود مشتريات في آخر 90 يومًا، سجّل GA4 حدث استرداد واحدًا على الأقل." },
          business: { summary: "الطلبات المرتجعة والملغاة تصل إلى GA4.", detail: "إيراد GA4 أقرب إلى المال الذي يحتفظ به المتجر فعلًا." },
          protect: "عند تغيير نظام الطلبات أو تطبيقات المنصة، تأكد أن الاسترداد ما زال يصل إلى GA4 مع رقم معاملة الطلب.",
        },
        fail: {
          technical: { summary: "سجّل GA4 مشتريات خلال 90 يومًا دون أي حدث استرداد.", detail: "سجّل GA4 مشتريات في آخر 90 يومًا ولم يسجّل أي حدث استرداد." },
          business: { summary: "الطلبات المرتجعة والملغاة ما زالت تُحسب مبيعات في GA4.", detail: "الطلبات المرفوضة عند التسليم أو الملغاة لا تُخصم أبدًا. فيبدو إيراد GA4 أعلى من النقد الذي يحتفظ به المتجر." },
          step: "اطلب من المطوّر إرسال حدث refund إلى GA4 مع رقم المعاملة عند إرجاع الطلب أو رفضه عند التسليم أو إلغائه. ويمكن لتطبيق GA4 في منصة المتجر أو Measurement Protocol القيام بذلك.",
          doneWhen: "يعرض GA4 أحداث استرداد للطلبات المرتجعة والملغاة في المتجر.",
        },
      },
      store_owner: {
        fail: { business: { summary: "GA4 ما زال يحسب الطلبات المرتجعة والملغاة مبيعات.", detail: "الطلبات اللي ترجع أو تنرفض عند الباب تبقى في إيراد GA4 عندك. فيبيّن فلوس أكثر من اللي تحتفظ فيه فعلًا." } },
      },
      media_buyer: {
        fail: { business: { summary: "الـ refunds مبتوصلش GA4، فالإيراد والـ ROAS في GA4 أعلى من الحقيقي.", detail: "مع رفض الـ COD الفجوة ممكن تبقى كبيرة. والحملات اللي بتجيب أوردرات كتير بتترفض بتبان أحسن من حقيقتها. المطوّر بيبعت حدث refund مع الـ transaction ID." } },
      },
      agency: {
        fail: { business: { summary: "الطلبات المرتجعة والملغاة ما زالت تُحسب مبيعات في GA4 الخاص بـ«المتجر».", detail: "الطلبات المرفوضة عند التسليم أو الملغاة لا تُخصم أبدًا، فيبدو إيراد GA4 أعلى من النقد الذي يحتفظ به «المتجر»." } },
      },
    },
  },
  "TRK-47": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Over 28 days, with 30+ sales, no hour or weekday block converts far above or below the store's average with enough visits to act on." },
          business: { summary: "Your store converts about evenly across the day and week.", detail: "No hours or days stand out enough to move budget toward or away from." },
          protect: "Look at conversion by hour and weekday again before big campaigns and seasons.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Over 28 days, with 30+ sales, some hour or weekday blocks convert far above or below the store's average, with enough visits to act on." },
          business: { summary: "Some hours and days sell far better than others.", detail: "Ads spend the same at every hour today. Money spent in hours that rarely convert brings fewer sales than the same money in the best hours." },
          step: "Shift budget or set an ad schedule toward the hours and days that convert, where the ad platform allows it.",
          doneWhen: "The ad schedule or budget split in the ad accounts matches the hours and days that convert.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your store sells far better at some hours and days.", detail: "Your ads spend the same all day. Moving money to the hours when shoppers buy can bring more sales from the same spend." } },
      },
      media_buyer: {
        fail: { business: { summary: "Spend is flat across hours that convert very differently, which raises CAC.", detail: "Budget in hours that rarely convert pays for clicks that don't buy. Moving it toward the best hours is expected to lower CAC on the same budget. Use an ad schedule or a budget split where the platform allows it." } },
      },
      agency: {
        fail: { business: { summary: "The store sells far better at some hours and days.", detail: "Its ads spend the same at every hour. Moving budget to the hours that convert can bring more sales from the same spend." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "التحويل متقارب تقريبًا عبر ساعات اليوم وأيام الأسبوع.", detail: "خلال 28 يومًا ومع 30 عملية بيع أو أكثر، لا توجد ساعة أو يوم يحوّل بفارق كبير عن متوسط المتجر مع زيارات كافية للتصرف." },
          business: { summary: "متجرك يحوّل بشكل متقارب خلال اليوم والأسبوع.", detail: "لا توجد ساعات أو أيام بارزة بما يكفي لنقل الميزانية إليها أو عنها." },
          protect: "راجع التحويل حسب الساعة واليوم قبل الحملات الكبيرة والمواسم.",
        },
        fail: {
          technical: { summary: "بعض الساعات والأيام تحوّل بفارق كبير عن متوسط المتجر.", detail: "خلال 28 يومًا ومع 30 عملية بيع أو أكثر، تحوّل بعض الساعات أو الأيام بفارق كبير فوق متوسط المتجر أو تحته، مع زيارات كافية للتصرف." },
          business: { summary: "بعض الساعات والأيام تبيع أفضل بكثير من غيرها.", detail: "الإعلانات تنفق بالقدر نفسه في كل ساعة اليوم. والمال المنفق في ساعات نادرًا ما تحوّل يجلب مبيعات أقل من المال نفسه في أفضل الساعات." },
          step: "انقل الميزانية أو اضبط جدول الإعلانات نحو الساعات والأيام التي تحوّل، حيث تسمح المنصة بذلك.",
          doneWhen: "جدول الإعلانات أو توزيع الميزانية في حسابات الإعلانات يطابق الساعات والأيام التي تحوّل.",
        },
      },
      store_owner: {
        fail: { business: { summary: "متجرك يبيع أفضل بكثير في ساعات وأيام معيّنة.", detail: "إعلاناتك تصرف بنفس القدر طول اليوم. ولو نقلت الفلوس لساعات شراء المتسوقين، تجيب لك مبيعات أكثر من نفس الصرف." } },
      },
      media_buyer: {
        fail: { business: { summary: "الصرف ثابت على ساعات بتحوّل بشكل مختلف جدًا، وده بيرفع الـ CAC.", detail: "الميزانية في ساعات نادرًا ما بتحوّل بتدفع على كليكات مبتشتريش. ونقلها لأحسن الساعات المتوقع إنه يخفّض الـ CAC بنفس الميزانية. استخدم ad schedule أو قسّم الميزانية لو المنصة بتسمح." } },
      },
      agency: {
        fail: { business: { summary: "«المتجر» يبيع أفضل بكثير في ساعات وأيام معيّنة.", detail: "إعلاناته تنفق بالقدر نفسه في كل ساعة. ونقل الميزانية إلى الساعات التي تحوّل قد يجلب مبيعات أكثر من الإنفاق نفسه." } },
      },
    },
  },
  "TRK-48": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "A test visit with gclid and fbclid in the URL left the click-ID cookie for each platform the store runs: _gcl_aw for Google Ads, _fbc for Meta." },
          business: { summary: "Ad click IDs are saved.", detail: "Ad platforms can match later sales to the ad that brought the click, even when the buyer returns days later." },
          protect: "After any change to consent, tags or the theme, open the store with a test click ID and check the cookies are still set.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "A test visit with gclid and fbclid in the URL did not leave the click-ID cookie for a platform the store runs: _gcl_aw for Google Ads, _fbc for Meta. TikTok is not checked." },
          business: { summary: "Ad clicks are not saved on your store.", detail: "When a buyer returns later, the sale can't be tied back to the ad. Sales show as direct or unknown, and the ad platforms learn from less." },
          step: "Ask your developer to add the Conversion Linker tag in GTM for Google Ads, and make sure the Meta pixel stores fbclid in the _fbc cookie.",
          doneWhen: "A test visit with click IDs leaves _gcl_aw and _fbc cookies for each platform the store runs.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your store doesn't save which ad a shopper clicked.", detail: "When the click isn't stored, sales show up as unknown. You can't tell which ads sell, and the ad platforms can't see their own results." } },
      },
      media_buyer: {
        fail: { business: { summary: "No click ID cookie, so returning buyers show as direct and reported ROAS reads lower than real.", detail: "Without _gcl_aw or _fbc, a buyer who comes back later is no longer tied to the ad. Google Ads and Meta get a weaker signal and optimize on less. The developer adds the Conversion Linker and fixes the Meta pixel." } },
      },
      agency: {
        fail: { business: { summary: "The store doesn't save which ad a shopper clicked.", detail: "When a buyer returns later, the sale can't be tied back to the ad. Sales show as direct or unknown, and the ad platforms learn from less." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "معرّفات نقرات الإعلانات تُحفظ في الكوكيز.", detail: "ترك زيارة اختبارية بـ gclid وfbclid في الرابط كوكي معرّف النقرة لكل منصة يعمل عليها المتجر: _gcl_aw لـ Google Ads و_fbc لـ Meta." },
          business: { summary: "معرّفات نقرات الإعلانات محفوظة.", detail: "تستطيع منصات الإعلانات ربط المبيعات اللاحقة بالإعلان الذي جلب النقرة، حتى لو عاد المشتري بعد أيام." },
          protect: "بعد أي تغيير في الموافقة أو الوسوم أو القالب، افتح المتجر بمعرّف نقرة تجريبي وتأكد أن الكوكيز ما زالت تُحفظ.",
        },
        fail: {
          technical: { summary: "معرّفات نقرات الإعلانات لا تُحفظ في الكوكيز لمنصة يعمل عليها المتجر.", detail: "لم تترك زيارة اختبارية بـ gclid وfbclid في الرابط كوكي معرّف النقرة لمنصة يعمل عليها المتجر: _gcl_aw لـ Google Ads و_fbc لـ Meta. ولا يُفحص TikTok." },
          business: { summary: "نقرات الإعلانات لا تُحفظ في المتجر.", detail: "عندما يعود المشتري لاحقًا لا يمكن ربط البيع بالإعلان. فتظهر المبيعات مباشرة أو مجهولة، وتتعلم منصات الإعلانات من بيانات أقل." },
          step: "اطلب من المطوّر إضافة وسم Conversion Linker في GTM لـ Google Ads، والتأكد أن بكسل Meta يخزّن fbclid في كوكي _fbc.",
          doneWhen: "تترك زيارة اختبارية بمعرّفات النقرات كوكيز _gcl_aw و_fbc لكل منصة يعمل عليها المتجر.",
        },
      },
      store_owner: {
        fail: { business: { summary: "متجرك ما يحفظ أي إعلان ضغط عليه المتسوق.", detail: "لما ما تنحفظ النقرة، تطلع المبيعات مجهولة. ما تعرف أي إعلان يبيع، ومنصات الإعلانات ما تشوف نتايجها." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش click ID cookie، فالمشترين العائدين بيظهروا Direct والـ ROAS المعروض أقل من الحقيقي.", detail: "من غير _gcl_aw أو _fbc، المشتري اللي بيرجع بعدين مبقاش مربوط بالإعلان. Google Ads وMeta بياخدوا signal أضعف وبيحسّنوا على بيانات أقل. المطوّر بيضيف الـ Conversion Linker ويصلّح بكسل Meta." } },
      },
      agency: {
        fail: { business: { summary: "«المتجر» لا يحفظ الإعلان الذي نقر عليه المتسوق.", detail: "عندما يعود المشتري لاحقًا لا يمكن ربط البيع بالإعلان. فتظهر المبيعات مباشرة أو مجهولة، وتتعلم منصات الإعلانات من بيانات أقل." } },
      },
    },
  },
};
