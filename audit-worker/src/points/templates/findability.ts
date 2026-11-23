import type { PointTemplate } from "./types.js";

// SEO-01 and SEO-07 read the plain HTTP checks (net-checks.ts, rules/net.ts).
// SEO-01 always hands over {checked}, and {problems} on a fail. SEO-07 always
// hands over {hreflang}, and {fails} on a fail. SEO-05 hands over different
// keys on each fail path, so its text uses none.
export const FINDABILITY: Record<string, PointTemplate> = {
  "SEO-01": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Pages checked: {checked}. robots.txt allows each one, and none has noindex or nofollow in its meta robots tag or X-Robots-Tag header." },
          business: { summary: "Google is allowed to list your product and collection pages.", detail: "Shoppers searching Google can find these pages, so some visitors arrive without ad spend." },
          protect: "Check robots.txt and the pages' SEO settings after any theme change, SEO app install or platform move.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Problems found: {problems}. A Disallow rule in robots.txt stops Google crawling the page. A noindex in the meta robots tag or X-Robots-Tag header keeps it out of results, and nofollow stops Google following its links." },
          business: { summary: "Some of your product or collection pages are hidden from Google.", detail: "Blocked pages don't show in Google search results. Shoppers looking for these products find other stores, and every visit to them has to come from ads." },
          step: "Ask your developer to remove the robots.txt rule or the noindex or nofollow tag on the pages listed, then request indexing in Google Search Console.",
          doneWhen: "robots.txt allows the product and collection pages checked, and none carries noindex or nofollow in its meta robots tag or X-Robots-Tag header.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Google can't show some of your products or collections in search.", detail: "People searching for what you sell won't find these pages. Every visit to them has to be paid for with ads." } },
      },
      media_buyer: {
        fail: { business: { summary: "Product or collection pages are blocked from Google, so free search traffic is lost and blended CAC rises.", detail: "More of the store's sales have to come through paid clicks, since organic search can't send buyers to these pages. Paid ads still reach them. The developer removes the block." } },
      },
      agency: {
        pass: { business: { summary: "Google is allowed to list the store's product and collection pages.", detail: "Shoppers searching Google can find these pages, so some visitors arrive without ad spend." } },
        fail: { business: { summary: "Some of the store's product or collection pages are hidden from Google.", detail: "Blocked pages don't show in Google search results. Shoppers looking for these products find other stores, and every visit to them has to come from ads." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "ملف robots.txt يسمح بصفحات المنتجات والتصنيفات المفحوصة، ولا تحمل أي منها noindex أو nofollow.", detail: "الصفحات المفحوصة: {checked}. لا يوجد noindex أو nofollow في وسم meta robots أو ترويسة X-Robots-Tag." },
          business: { summary: "Google يستطيع عرض صفحات المنتجات والتصنيفات.", detail: "من يبحث في Google يجد هذه الصفحات، فيصل بعض الزوار دون إنفاق إعلاني." },
          protect: "افحص robots.txt وإعدادات SEO للصفحات بعد أي تغيير في القالب أو تثبيت تطبيق SEO أو نقل المنصة.",
        },
        fail: {
          technical: { summary: "بعض صفحات المنتجات أو التصنيفات محجوبة في robots.txt أو تحمل noindex أو nofollow.", detail: "المشكلات: {problems}. قاعدة Disallow في robots.txt تمنع Google من زحف الصفحة. وnoindex في وسم meta robots أو ترويسة X-Robots-Tag يُخرجها من النتائج، وnofollow يمنع Google من تتبع روابطها." },
          business: { summary: "بعض صفحات المنتجات أو التصنيفات مخفية عن Google.", detail: "الصفحات المحجوبة لا تظهر في نتائج بحث Google. فمن يبحث عن هذه المنتجات يجد متاجر أخرى، وكل زيارة لها يجب أن تأتي من الإعلانات." },
          step: "اطلب من المطوّر إزالة قاعدة robots.txt أو وسم noindex أو nofollow من الصفحات المذكورة، ثم اطلب الفهرسة في Google Search Console.",
          doneWhen: "ملف robots.txt يسمح بصفحات المنتجات والتصنيفات المفحوصة، ولا تحمل أي منها noindex أو nofollow في وسم meta robots أو ترويسة X-Robots-Tag.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Google ما يقدر يعرض بعض منتجاتك أو أقسامك في البحث.", detail: "اللي يدور على اللي تبيعه ما راح يلقى هالصفحات. وكل زيارة لها لازم تدفع عليها إعلان." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحات منتجات أو كولكشنز محجوبة عن Google، فالترافيك المجاني من البحث ضايع والـ CAC الإجمالي بيعلى.", detail: "مبيعات أكتر لازم تيجي من كليكات مدفوعة، لأن البحث العادي مش هيودّي مشترين على الصفحات دي. الإعلانات المدفوعة لسه بتوصلها. المطوّر يشيل الحجب." } },
      },
      agency: {
        fail: { business: { summary: "بعض صفحات منتجات «المتجر» أو تصنيفاته مخفية عن Google.", detail: "الصفحات المحجوبة لا تظهر في نتائج بحث Google. فمن يبحث عن هذه المنتجات يجد متاجر أخرى، وكل زيارة لها يجب أن تأتي من الإعلانات." } },
      },
    },
  },
  "SEO-05": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "The product page's JSON-LD has a Product with an Offer that holds a price and an availability value." },
          business: { summary: "Your product page gives Google its price and stock status.", detail: "Google can show the price and stock under the product in search results." },
          protect: "Recheck the product page schema after changing the theme or a product or SEO app.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "The product page's JSON-LD lacks a Product type, an Offer, or the Offer's price or availability. Google reads price and stock for product results from Product with an Offer." },
          business: { summary: "Your product page doesn't give Google its price and stock in the format Google reads.", detail: "Google can't show the price or stock status under the product in search results. The listing looks plainer than competitors' that do." },
          step: "Ask your developer to add Product schema (JSON-LD) to product pages, with an Offer holding the price, currency and availability.",
          doneWhen: "The product page's JSON-LD has a Product with an Offer that holds a price and an availability value.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Google can't read your product prices and stock from your product page.", detail: "Your products show in Google without price or stock under them. Stores that show them look more ready to buy from." } },
      },
      media_buyer: {
        fail: { business: { summary: "Product pages lack Product schema with price and stock, so free Google results show plainer listings and paid spend carries more of the sales.", detail: "Google Merchant Center's automatic item updates also read this markup to correct feed price and stock. The developer adds the schema on product pages." } },
      },
      agency: {
        pass: { business: { summary: "The store's product page gives Google its price and stock status.", detail: "Google can show the price and stock under the product in search results." } },
        fail: { business: { summary: "The store's product page doesn't give Google its price and stock in the format Google reads.", detail: "Google can't show the price or stock status under the product in search results. The listing looks plainer than competitors' that do." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "صفحة المنتج تحمل Product schema مع Offer فيه السعر وحالة التوفر.", detail: "بيانات JSON-LD في صفحة المنتج فيها Product مع Offer يحمل price وavailability." },
          business: { summary: "صفحة المنتج تعطي Google السعر وحالة التوفر.", detail: "يستطيع Google عرض السعر والتوفر تحت المنتج في نتائج البحث." },
          protect: "أعد فحص schema صفحة المنتج بعد تغيير القالب أو أي تطبيق منتجات أو SEO.",
        },
        fail: {
          technical: { summary: "صفحة المنتج بلا Product schema، أو بلا Offer، أو الـ Offer بلا سعر أو حالة توفر.", detail: "بيانات JSON-LD في صفحة المنتج ينقصها نوع Product، أو Offer، أو price أو availability داخل الـ Offer. يقرأ Google السعر والتوفر لنتائج المنتجات من Product مع Offer." },
          business: { summary: "صفحة المنتج لا تعطي Google السعر وحالة التوفر بالصيغة التي يقرؤها.", detail: "لا يستطيع Google عرض السعر أو التوفر تحت المنتج في نتائج البحث. فتبدو النتيجة أبسط من نتائج المنافسين الذين يعرضونها." },
          step: "اطلب من المطوّر إضافة Product schema بصيغة JSON-LD لصفحات المنتجات، مع Offer يحمل السعر والعملة وحالة التوفر.",
          doneWhen: "بيانات JSON-LD في صفحة المنتج فيها Product مع Offer يحمل price وavailability.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Google ما يقدر يقرأ أسعار منتجاتك وتوفرها من صفحة المنتج.", detail: "منتجاتك تطلع في Google بدون سعر أو توفر تحتها. والمتاجر اللي تعرضها تبان أجهز للشراء." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحات المنتجات ناقصها Product schema بالسعر والتوفر، فنتايج Google المجانية شكلها أبسط والصرف المدفوع شايل مبيعات أكتر.", detail: "الـ automatic item updates في Google Merchant Center كمان بتقرا الـ markup ده عشان تصحح السعر والتوفر في الـ feed. المطوّر يضيف الـ schema في صفحات المنتجات." } },
      },
      agency: {
        fail: { business: { summary: "صفحة المنتج في «المتجر» لا تعطي Google السعر وحالة التوفر بالصيغة التي يقرؤها.", detail: "لا يستطيع Google عرض السعر أو التوفر تحت منتجات «المتجر» في نتائج البحث. فتبدو النتيجة أبسط من نتائج المنافسين الذين يعرضونها." } },
      },
    },
  },
  "SEO-07": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "hreflang on the home page: {hreflang}. Each alternate lists the home page back, html lang and dir match the declared language, and no Arabic page carries noindex." },
          business: { summary: "Google can tell your English and Arabic pages apart.", detail: "Arabic searchers get the Arabic page and English searchers the English one." },
          protect: "Check the language tags when the language app changes or a page is added in only one language.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Faults: {fails}. hreflang pairs must point at each other, each page's html lang must match its hreflang language, dir must be rtl for Arabic and ltr for English, and Arabic pages must not carry noindex." },
          business: { summary: "Google gets mixed signals about your English and Arabic pages.", detail: "It may show the English page to Arabic searchers, or drop the Arabic page from results. Shoppers who land on the wrong language leave more often." },
          step: "Ask your developer to fix the faults listed: link each English and Arabic page to the other with hreflang, set html lang and dir to match, and remove noindex from Arabic pages.",
          doneWhen: "Each English and Arabic page lists the other in hreflang, html lang and dir match each page's language, and no Arabic page carries noindex.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Google mixes up the English and Arabic versions of your store.", detail: "Arabic speakers may find your English page in Google, or not find the Arabic one. Customers who land on the wrong language often leave." } },
      },
      media_buyer: {
        fail: { business: { summary: "English and Arabic language tags are wrong, so organic search can send shoppers to the wrong language and organic CVR drops.", detail: "Free traffic that lands in the wrong language converts worse, so paid traffic carries more of the sales. Ad links point at fixed URLs and are not affected. The developer fixes the tags." } },
      },
      agency: {
        pass: { business: { summary: "Google can tell the store's English and Arabic pages apart.", detail: "Arabic searchers get the Arabic page and English searchers the English one." } },
        fail: { business: { summary: "Google gets mixed signals about the store's English and Arabic pages.", detail: "It may show the English page to Arabic searchers, or drop the Arabic page from results. Shoppers who land on the wrong language leave more often." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "الصفحات الإنجليزية والعربية تشير إلى بعضها في hreflang، وlang وdir صحيحان، والعربية بلا noindex.", detail: "hreflang في الصفحة الرئيسية: {hreflang}. كل صفحة بديلة تشير إلى الرئيسية في المقابل، وlang وdir يطابقان اللغة المعلنة، ولا تحمل أي صفحة عربية noindex." },
          business: { summary: "Google يميّز بين الصفحات الإنجليزية والعربية.", detail: "من يبحث بالعربية يصل إلى الصفحة العربية، ومن يبحث بالإنجليزية يصل إلى الإنجليزية." },
          protect: "افحص وسوم اللغة عند تغيير تطبيق اللغات أو إضافة صفحة بلغة واحدة فقط.",
        },
        fail: {
          technical: { summary: "وسوم اللغة خاطئة بين النسختين الإنجليزية والعربية.", detail: "الأخطاء: {fails}. يجب أن تشير أزواج hreflang إلى بعضها، وأن يطابق html lang لغة hreflang لكل صفحة، وأن يكون dir بقيمة rtl للعربية وltr للإنجليزية، وألا تحمل الصفحات العربية noindex." },
          business: { summary: "Google يتلقى إشارات متضاربة عن الصفحات الإنجليزية والعربية.", detail: "قد يعرض الصفحة الإنجليزية لمن يبحث بالعربية، أو يُسقط الصفحة العربية من النتائج. ومن يصل إلى اللغة الخطأ يغادر أكثر." },
          step: "اطلب من المطوّر إصلاح الأخطاء المذكورة: ربط كل صفحة إنجليزية بالعربية المقابلة عبر hreflang، وضبط html lang وdir، وإزالة noindex من الصفحات العربية.",
          doneWhen: "كل صفحة إنجليزية وعربية تذكر الأخرى في hreflang، وhtml lang وdir يطابقان لغة كل صفحة، ولا تحمل أي صفحة عربية noindex.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Google يخلط بين النسخة الإنجليزية والعربية من متجرك.", detail: "اللي يتكلم عربي ممكن يلقى صفحتك الإنجليزية في Google، أو ما يلقى العربية. والعميل اللي يدخل على اللغة الغلط غالبًا يطلع." } },
      },
      media_buyer: {
        fail: { business: { summary: "وسوم اللغة بين الإنجليزي والعربي غلط، فالبحث العادي ممكن يودّي الناس على اللغة الغلط والـ CVR الأورجانيك بينزل.", detail: "الترافيك المجاني اللي بينزل على لغة غلط بيحوّل أقل، فالمدفوع بيشيل مبيعات أكتر. روابط الإعلانات ثابتة ومش متأثرة. المطوّر يصلّح الوسوم." } },
      },
      agency: {
        fail: { business: { summary: "Google يتلقى إشارات متضاربة عن صفحات «المتجر» الإنجليزية والعربية.", detail: "قد يعرض الصفحة الإنجليزية لمن يبحث بالعربية، أو يُسقط الصفحة العربية من النتائج. ومن يصل إلى اللغة الخطأ يغادر أكثر." } },
      },
    },
  },
};
