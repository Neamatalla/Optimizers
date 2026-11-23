import type { PointTemplate } from "./types.js";

export const TRACKING_4: Record<string, PointTemplate> = {
  "TRK-14": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "We counted page_view and PageView hits per GA4 ID and pixel on each page load, add-to-cart hits after our one click, and gtag.js loads per measurement ID. None repeated." },
          business: { summary: "Each visit and add to cart is counted once.", detail: "Your conversion rate and add-to-cart numbers come from one count per action, so a change in them is a real change." },
          protect: "Check for a second GA4 or pixel install whenever you add a store app or paste new tracking code.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Repeats found: {problems}. Two setups sending the same event, such as a store app plus a GTM tag, or gtag.js in the theme plus GTM, each send their own hit." },
          business: { summary: "Some visits or add-to-carts are counted twice.", detail: "Doubled counts push your traffic, add-to-cart rate or conversion rate away from the truth. Page and budget decisions then rest on the wrong numbers." },
          step: "Have your developer find the second setup sending the same event (a store app, theme code or a GTM tag) and remove one.",
          doneWhen: "A re-scan sees one page view per page load for each GA4 ID and pixel, one add-to-cart hit per click, and gtag.js loaded once per ID.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your store counts some visits or add-to-carts twice.", detail: "Double counting makes your conversion rate look lower or higher than it is. You can end up fixing a page that works, or paying more for ads that only look good." } },
      },
      media_buyer: {
        fail: { business: { summary: "The same event fires more than once, so reported conversions read higher than real.", detail: "Doubled PageView or AddToCart hits inflate the signal the algorithm optimizes on and fill audiences with the wrong people. A setup that doubles these often doubles Purchase too, so reported ROAS can read higher than real. Check one page load in Pixel Helper, then forward the fix to the store's developer." } },
      },
      agency: {
        pass: { business: { summary: "Each visit and add to cart on the store is counted once.", detail: "The store's conversion rate and add-to-cart numbers come from one count per action, so a change in them is a real change." } },
        fail: { business: { summary: "The store sends some events more than once.", detail: "Doubled hits distort the store's traffic, add-to-cart and conversion numbers in GA4 and the ad platforms. Decisions on pages and budget then rest on inflated counts." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "كل معرّف GA4 وكل Pixel أرسل مشاهدة صفحة واحدة لكل تحميل، وإضافة سلة واحدة لنقرتنا.", detail: "عددنا مرات إرسال page_view و PageView لكل معرّف في كل تحميل صفحة، وإضافات السلة بعد نقرة واحدة، وتحميل gtag.js لكل معرّف قياس. لم يتكرر شيء." },
          business: { summary: "كل زيارة وكل إضافة للسلة تُحسب مرة واحدة.", detail: "معدل التحويل وأرقام الإضافة للسلة مبنية على عدّ واحد لكل إجراء، فأي تغيّر فيها تغيّر حقيقي." },
          protect: "تحقق من عدم وجود تثبيت ثانٍ لـ GA4 أو Pixel عند إضافة أي تطبيق أو كود تتبع جديد.",
        },
        fail: {
          technical: { summary: "حدث واحد على الأقل يُرسَل أكثر من مرة لكل إجراء.", detail: "التكرارات: {problems}. إعدادان يرسلان الحدث نفسه، مثل تطبيق في المتجر مع وسم GTM، أو gtag.js في القالب مع GTM، يرسل كل منهما نسخته." },
          business: { summary: "بعض الزيارات أو الإضافات للسلة تُحسب مرتين.", detail: "العدّ المضاعف يبعد أرقام الزيارات ومعدل الإضافة للسلة ومعدل التحويل عن الحقيقة. فتُبنى قرارات الصفحات والميزانية على أرقام خاطئة." },
          step: "اطلب من المطور تحديد الإعداد الثاني الذي يرسل الحدث نفسه (تطبيق أو كود في القالب أو وسم GTM) وحذف أحدهما.",
          doneWhen: "يرى الفحص التالي مشاهدة صفحة واحدة لكل تحميل لكل معرّف GA4 و Pixel، وإضافة سلة واحدة لكل نقرة، وتحميل gtag.js مرة واحدة لكل معرّف.",
        },
      },
      store_owner: {
        fail: { business: { summary: "متجرك يحسب بعض الزيارات أو الإضافات للسلة مرتين.", detail: "العدّ المكرر يخلي معدل التحويل يبان أقل أو أعلى من الحقيقي. فممكن تصلّح صفحة شغالة، أو تصرف على إعلانات شكلها زين وهي مو كذا." } },
      },
      media_buyer: {
        fail: { business: { summary: "نفس الـ event بيتبعت أكتر من مرة، فالـ conversions المعروضة أعلى من الحقيقي.", detail: "الـ PageView أو AddToCart المتكرر بينفخ الـ signal اللي الـ algorithm بيتعلم منه وبيملا الـ audiences بناس غلط. الإعداد اللي بيكرر دول غالبًا بيكرر الـ Purchase كمان، فالـ ROAS المعروض ممكن يبقى أعلى من الحقيقي. اتأكد بـ Pixel Helper على تحميل صفحة واحد، وابعت التصليح لمطور المتجر." } },
      },
      agency: {
        fail: { business: { summary: "المتجر يرسل بعض الأحداث أكثر من مرة.", detail: "التكرار يشوّه أرقام الزيارات والإضافة للسلة والتحويل لدى المتجر في GA4 ومنصات الإعلان. فتُبنى قرارات الصفحات والميزانية على أرقام مضخّمة." } },
      },
    },
  },
  "TRK-17": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "After our click filled the cart, every platform that sent hits on page loads also sent an add-to-cart hit: {platforms}." },
          business: { summary: "When a shopper adds to cart, GA4 and your ad pixels record it.", detail: "Your add-to-cart numbers show where shoppers drop off between the product page and checkout, and cart retargeting fills with real cart adders." },
          protect: "Test add to cart in GA4 DebugView after any theme, cart drawer or app change.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Our Add to Cart click filled the cart, but a platform that sent hits on page loads sent no add-to-cart hit. A cart drawer that adds without a page load often skips the tag's trigger." },
          business: { summary: "Some adds to cart never reach GA4 or your ad pixels.", detail: "Your reports then show fewer cart adds than happened. That hides whether the product page or the cart is losing the sale." },
          step: "Have your developer fire add_to_cart, and each pixel's add-to-cart event, from the theme's add-to-cart action, the cart drawer included.",
          doneWhen: "After an add to cart on a product page, GA4 and every pixel that loads on the store each send an add-to-cart hit.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some adds to cart in your store are never recorded.", detail: "Without a true add-to-cart count you can't tell whether your product pages or your cart are losing the sale. You may fix the wrong page." } },
      },
      media_buyer: {
        fail: { business: { summary: "AddToCart doesn't reach every pixel, so the mid-funnel signal the algorithm optimizes on is thinner.", detail: "Missing AddToCart events shrink ATC retargeting audiences and give the platforms fewer mid-funnel examples to learn from. Check with Pixel Helper or Test Events on a product-page add, then forward the fix to the store's developer." } },
      },
      agency: {
        pass: { business: { summary: "When a shopper adds to cart, GA4 and the store's ad pixels record it.", detail: "The store's add-to-cart numbers show where shoppers drop off between the product page and checkout." } },
        fail: { business: { summary: "Some adds to cart on the store never reach GA4 or the ad pixels.", detail: "The store's reports then show fewer cart adds than happened. That hides whether the product page or the cart is losing the sale." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "نقرتنا على أضف للسلة ملأت السلة، وكل منصة سجّلت إضافة للسلة.", detail: "{platforms}" },
          business: { summary: "عندما يضيف العميل منتجًا للسلة يسجّل ذلك GA4 وبكسلات الإعلانات.", detail: "أرقام الإضافة للسلة تبيّن أين يتوقف العملاء بين صفحة المنتج والدفع، وجمهور إعادة الاستهداف يمتلئ بمن أضافوا فعلًا." },
          protect: "اختبر الإضافة للسلة في DebugView في GA4 بعد أي تغيير في القالب أو سلة الدرج أو التطبيقات.",
        },
        fail: {
          technical: { summary: "نقرتنا ملأت السلة، لكن منصة واحدة على الأقل لم ترسل حدث إضافة للسلة.", detail: "منصة أرسلت أحداثًا عند تحميل الصفحات لم ترسل أي إضافة للسلة بعد نقرتنا. سلة الدرج التي تضيف دون تحميل صفحة كثيرًا ما تتجاوز مشغّل الوسم." },
          business: { summary: "بعض الإضافات للسلة لا تصل إلى GA4 أو بكسلات الإعلانات.", detail: "التقارير تعرض إضافات أقل من الحقيقية. وهذا يخفي هل الخسارة في صفحة المنتج أم في السلة." },
          step: "اطلب من المطور إرسال add_to_cart وحدث الإضافة للسلة لكل Pixel من إجراء الإضافة في القالب، بما فيه سلة الدرج.",
          doneWhen: "بعد إضافة منتج للسلة من صفحة المنتج، يرسل GA4 وكل Pixel محمّل في المتجر حدث إضافة للسلة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بعض الإضافات للسلة في متجرك ما تنحسب.", detail: "بدون رقم صحيح للإضافة للسلة ما تقدر تعرف هل صفحة المنتج أو السلة هي اللي تخسرك البيعة. وممكن تصلّح الصفحة الغلط." } },
      },
      media_buyer: {
        fail: { business: { summary: "الـ AddToCart مش واصل لكل Pixel، فالـ signal في نص الـ funnel أضعف.", detail: "الـ AddToCart الناقص بيصغّر audiences الـ retargeting وبيدي المنصات أمثلة أقل تتعلم منها. اتأكد بـ Pixel Helper أو Test Events على إضافة من صفحة المنتج، وابعت التصليح لمطور المتجر." } },
      },
      agency: {
        fail: { business: { summary: "بعض الإضافات للسلة في المتجر لا تصل إلى GA4 أو بكسلات الإعلانات.", detail: "تقارير المتجر تعرض إضافات أقل من الحقيقية. وهذا يخفي هل الخسارة في صفحة المنتج أم في السلة." } },
      },
    },
  },
  "TRK-18": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Checked {events} view_item and add_to_cart hits and dataLayer pushes. GA4 hits and pushes were also checked for item_id, item_name, price and quantity on every item." },
          business: { summary: "Product views and cart adds carry their price and product.", detail: "Your reports can show which products sell and what each shopping step is worth in money." },
          protect: "Re-check the item fields after a theme update or a change of tracking app.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Events with gaps: {problems}. GA4 hits and dataLayer pushes need a numeric value, a 3-letter currency and items with item_id, item_name, price and quantity. Meta and TikTok hits are checked for value, currency and products." },
          business: { summary: "Some product views or cart adds go out without price, currency or product details.", detail: "Reports then can't show which products people view and add, or what each step is worth. Ad platforms can't learn which shoppers bring the most money." },
          step: "Have your developer add value, currency and an items list (item_id, item_name, price, quantity) to every view_item and add_to_cart push and tag.",
          doneWhen: "A re-scan sees a numeric value, a 3-letter currency and complete items on every view_item and add_to_cart hit and push.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your store's product views and cart adds are sent without price or product details.", detail: "Your reports can't show which products sell or what each step is worth in money. Your ads also can't aim at the shoppers who spend the most." } },
      },
      media_buyer: {
        fail: { business: { summary: "Product and cart events go out without value, currency or items, so reported value reads low.", detail: "Value-based bidding and catalog retargeting need value and item IDs on these events. Without them the algorithm optimizes on counts instead of money. Forward the field list to the store's developer." } },
      },
      agency: {
        pass: { business: { summary: "The store's product views and cart adds carry their price and product.", detail: "The store's reports can show which products sell and what each shopping step is worth in money." } },
        fail: { business: { summary: "Some of the store's product views or cart adds go out without price, currency or product details.", detail: "The store's reports then can't show which products people view and add, or what each step is worth. Ad platforms can't learn which shoppers bring the most money." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "view_item و add_to_cart تحمل قيمة رقمية وعملة ومنتجات بحقولها كاملة.", detail: "فحصنا {events} من أحداث view_item و add_to_cart ودفعات dataLayer. وفحصنا في أحداث GA4 والدفعات وجود item_id و item_name و price و quantity لكل منتج." },
          business: { summary: "مشاهدات المنتجات والإضافات للسلة تحمل السعر والمنتج.", detail: "التقارير تستطيع أن تبيّن المنتجات التي تُباع وقيمة كل خطوة في الشراء بالمال." },
          protect: "أعد فحص حقول المنتجات بعد تحديث القالب أو تغيير تطبيق التتبع.",
        },
        fail: {
          technical: { summary: "بعض أحداث view_item أو add_to_cart تنقصها القيمة أو العملة أو حقول المنتجات.", detail: "الأحداث الناقصة: {problems}. أحداث GA4 ودفعات dataLayer تحتاج قيمة رقمية وعملة من 3 أحرف ومنتجات فيها item_id و item_name و price و quantity. أحداث Meta و TikTok تُفحص للقيمة والعملة والمنتجات." },
          business: { summary: "بعض مشاهدات المنتجات أو الإضافات للسلة تُرسل بلا سعر أو عملة أو تفاصيل منتج.", detail: "لا تستطيع التقارير أن تبيّن المنتجات التي يشاهدها العملاء ويضيفونها، ولا قيمة كل خطوة. ولا تتعلم منصات الإعلان أي العملاء ينفقون أكثر." },
          step: "اطلب من المطور إضافة القيمة والعملة وقائمة المنتجات (item_id و item_name و price و quantity) إلى كل دفعة ووسم view_item و add_to_cart.",
          doneWhen: "يرى الفحص التالي قيمة رقمية وعملة من 3 أحرف ومنتجات كاملة في كل حدث ودفعة view_item و add_to_cart.",
        },
      },
      store_owner: {
        fail: { business: { summary: "مشاهدات المنتجات والإضافات للسلة في متجرك تنرسل بدون سعر أو تفاصيل المنتج.", detail: "تقاريرك ما تقدر توضح وش المنتجات اللي تبيع ولا قيمة كل خطوة بالفلوس. وإعلاناتك ما تقدر توصل للعملاء اللي يصرفون أكثر." } },
      },
      media_buyer: {
        fail: { business: { summary: "events المنتج والسلة بتتبعت من غير value أو currency أو items، فالقيمة المعروضة أقل من الحقيقي.", detail: "الـ value-based bidding وإعلانات الكتالوج محتاجين value و item IDs في الـ events دي. من غيرهم الـ algorithm بيتعلم على العدد مش على الفلوس. ابعت قائمة الحقول لمطور المتجر." } },
      },
      agency: {
        fail: { business: { summary: "بعض مشاهدات المنتجات أو الإضافات للسلة في المتجر تُرسل بلا سعر أو عملة أو تفاصيل منتج.", detail: "لا تستطيع تقارير المتجر أن تبيّن المنتجات التي يشاهدها العملاء ويضيفونها، ولا قيمة كل خطوة. ولا تتعلم منصات الإعلان أي العملاء ينفقون أكثر." } },
      },
    },
  },
  "TRK-19": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "{baseline} from the home page loaded on every page checked: {checked}." },
          business: { summary: "Tracking loads on every main page, on phone and desktop.", detail: "Visits and sales from your home, collection, product and cart pages all reach your reports." },
          protect: "Check that tracking still loads on every page type after a theme change or a new page template.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "{baseline} loaded on home but not on {missing}. No consent banner was showing on those pages, so the tag is most likely missing from their template." },
          business: { summary: "Some of your pages load no tracking.", detail: "Visitors and sales on those pages vanish from your reports. Every number built on them, like conversion rate by page, comes out wrong." },
          step: "Have your developer add the same GTM container or GA4 tag that loads on home to the templates of the pages listed, on phone and desktop.",
          doneWhen: "A re-scan sees the home page's container or tag load on home, collection, product and cart, on phone and desktop.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some pages in your store have no tracking.", detail: "Visitors and sales on those pages disappear from your numbers. You see fewer sales than you made, and can't tell which pages work." } },
      },
      media_buyer: {
        fail: { business: { summary: "Tracking is missing on some page types, so sales from ads landing there go uncounted and reported ROAS reads lower than real.", detail: "A landing page without the tag sends no PageView or conversion events. Winning ad sets can look weak and get cut. Forward the page list to the store's developer." } },
      },
      agency: {
        pass: { business: { summary: "Tracking loads on every main page of the store, on phone and desktop.", detail: "Visits and sales from the store's home, collection, product and cart pages all reach its reports." } },
        fail: { business: { summary: "Some of the store's pages load no tracking.", detail: "Visitors and sales on those pages vanish from the store's reports. Every number built on them, like conversion rate by page, comes out wrong." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "حاوية GTM أو وسم GA4 من الصفحة الرئيسية يعمل على كل الصفحات المفحوصة.", detail: "{baseline}: {checked}" },
          business: { summary: "التتبع يعمل على كل الصفحات الرئيسية في الجوال والكمبيوتر.", detail: "الزيارات والمبيعات من الصفحة الرئيسية والتصنيفات والمنتج والسلة تصل كلها إلى التقارير." },
          protect: "تأكد أن التتبع ما زال يعمل على كل أنواع الصفحات بعد تغيير القالب أو إضافة قالب صفحة جديد.",
        },
        fail: {
          technical: { summary: "حاوية GTM أو وسم GA4 من الصفحة الرئيسية لا يعمل على بعض الصفحات.", detail: "{baseline} لم يعمل على: {missing}. لم تظهر نافذة موافقة على هذه الصفحات، فالأرجح أن الوسم غير موجود في قالبها." },
          business: { summary: "بعض الصفحات لا تحمّل أي تتبع.", detail: "الزوار والمبيعات على هذه الصفحات يختفون من التقارير. وكل رقم مبني عليها، مثل معدل التحويل لكل صفحة، يخرج خاطئًا." },
          step: "اطلب من المطور إضافة حاوية GTM أو وسم GA4 نفسه الموجود في الصفحة الرئيسية إلى قوالب الصفحات المذكورة، في الجوال والكمبيوتر.",
          doneWhen: "يرى الفحص التالي حاوية الصفحة الرئيسية أو وسمها يعمل على الرئيسية والتصنيفات والمنتج والسلة، في الجوال والكمبيوتر.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بعض صفحات متجرك ما فيها تتبع.", detail: "الزوار والمبيعات في هذي الصفحات يختفون من أرقامك. فتشوف مبيعات أقل من اللي صارت، وما تعرف وش الصفحات اللي تشتغل." } },
      },
      media_buyer: {
        fail: { business: { summary: "التتبع مش موجود على بعض أنواع الصفحات، فمبيعات الإعلانات اللي بتنزل عليها مش بتتحسب والـ ROAS المعروض أقل من الحقيقي.", detail: "صفحة الهبوط اللي من غير tag مش بتبعت PageView ولا conversions. فممكن ad sets كسبانة تبان ضعيفة وتتقفل. ابعت قائمة الصفحات لمطور المتجر." } },
      },
      agency: {
        fail: { business: { summary: "بعض صفحات المتجر لا تحمّل أي تتبع.", detail: "الزوار والمبيعات على هذه الصفحات يختفون من تقارير المتجر. وكل رقم مبني عليها، مثل معدل التحويل لكل صفحة، يخرج خاطئًا." } },
      },
    },
  },
  "TRK-23": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "We opened home with test utm_source, utm_medium, utm_campaign, gclid, fbclid and ttclid. The first GA4 page_view carried all of them in page_location: {pageLocation}." },
          business: { summary: "Ad and campaign tags stay on the link when shoppers land.", detail: "GA4 credits sales from your ads to the campaign that brought them." },
          protect: "Re-test a campaign link after adding a redirect, a language switch or a new domain.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "We opened home with test utm_source, utm_medium, utm_campaign, gclid, fbclid and ttclid. The first GA4 page_view lost {missing}; its page_location was {pageLocation}. A redirect that drops the query string is the usual cause." },
          business: { summary: "Some campaign tags drop off the link before GA4 records the visit.", detail: "Sales from your ads then show up as direct visits or with no campaign. Good campaigns look weak, and budget moves away from them." },
          step: "Have your developer find what strips the parameters, often a www, language or country redirect, and keep the full query string through it.",
          doneWhen: "Opening home with the test campaign link, the first GA4 page_view keeps all six parameters in page_location.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your ad links lose their tracking tags when shoppers land on your store.", detail: "Sales from your ads then show up in GA4 as direct visits. A campaign that sells can look weak, and you may stop paying for it." } },
      },
      media_buyer: {
        fail: { business: { summary: "Click IDs or UTMs are lost before GA4's first page_view, so reported ROAS reads lower than real.", detail: "Paid sales land in direct or unassigned, and the platforms lose the click ID that ties the sale to the click. Winning campaigns can look weak and get cut. Forward the redirect fix to the store's developer." } },
      },
      agency: {
        pass: { business: { summary: "Ad and campaign tags stay on the link when shoppers land on the store.", detail: "GA4 credits the store's ad sales to the campaign that brought them." } },
        fail: { business: { summary: "Some campaign tags drop off the link before GA4 records the visit to the store.", detail: "The store's ad sales then show up as direct visits or with no campaign. Good campaigns look weak, and budget moves away from them." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "أول page_view في GA4 احتفظ بكل معاملات الحملة التجريبية في page_location.", detail: "فتحنا الصفحة الرئيسية بقيم تجريبية لـ utm_source و utm_medium و utm_campaign و gclid و fbclid و ttclid، وظهرت كلها في page_location: {pageLocation}" },
          business: { summary: "وسوم الإعلانات والحملات تبقى في الرابط عند وصول العميل.", detail: "GA4 ينسب مبيعات الإعلانات إلى الحملة التي جلبتها." },
          protect: "أعد اختبار رابط حملة بعد إضافة أي تحويل أو مبدّل لغة أو نطاق جديد.",
        },
        fail: {
          technical: { summary: "أول page_view في GA4 فقد بعض معاملات الحملة التجريبية من page_location.", detail: "المعاملات المفقودة: {missing}. وكان page_location: {pageLocation}. السبب المعتاد تحويل (redirect) يحذف معاملات الرابط." },
          business: { summary: "بعض وسوم الحملات تسقط من الرابط قبل أن يسجّل GA4 الزيارة.", detail: "تظهر مبيعات الإعلانات كزيارات مباشرة أو بلا حملة. فتبدو الحملات الجيدة ضعيفة وتذهب الميزانية عنها." },
          step: "اطلب من المطور تحديد ما يحذف المعاملات، وغالبًا تحويل www أو اللغة أو الدولة، والإبقاء على معاملات الرابط كاملة عبره.",
          doneWhen: "عند فتح الصفحة الرئيسية برابط الحملة التجريبي، يحتفظ أول page_view في GA4 بالمعاملات الست كلها في page_location.",
        },
      },
      store_owner: {
        fail: { business: { summary: "روابط إعلاناتك تفقد وسوم التتبع لما يوصل العميل لمتجرك.", detail: "مبيعات إعلاناتك تطلع في GA4 كزيارات مباشرة. فالحملة اللي تبيع ممكن تبان ضعيفة، وممكن توقفها." } },
      },
      media_buyer: {
        fail: { business: { summary: "الـ click IDs أو الـ UTMs بتضيع قبل أول page_view في GA4، فالـ ROAS المعروض أقل من الحقيقي.", detail: "المبيعات المدفوعة بتنزل direct أو unassigned، والمنصات بتفقد الـ click ID اللي بيربط البيعة بالكليك. فحملات كسبانة ممكن تبان ضعيفة وتتقفل. ابعت تصليح الـ redirect لمطور المتجر." } },
      },
      agency: {
        fail: { business: { summary: "بعض وسوم الحملات تسقط من الرابط قبل أن يسجّل GA4 الزيارة إلى المتجر.", detail: "تظهر مبيعات المتجر من الإعلانات كزيارات مباشرة أو بلا حملة. فتبدو الحملات الجيدة ضعيفة وتذهب الميزانية عنها." } },
      },
    },
  },
  "TRK-24": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Checked {internalLinks} links to the store's own domain on home, collection, product and cart." },
          business: { summary: "Your own links carry no campaign tags.", detail: "A shopper who clicks a banner keeps the source they came from, so ad sales stay credited to the ad." },
          protect: "Track banner clicks with GA4 events instead of adding utm_ tags to links inside your store.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Internal links with utm_: {tagged}. A click on one replaces the visit's source in GA4 with the internal utm values, so the original campaign loses the sale." },
          business: { summary: "Some links inside your store carry campaign tags.", detail: "A shopper who clicks one loses the ad or channel they came from in GA4. Their sale is credited to your own banner instead." },
          step: "Have your developer or content team remove utm_ tags from links to your own store, and track banner clicks with GA4 events.",
          doneWhen: "A re-scan finds no link to the store's own domain with a utm_ parameter on home, collection, product and cart.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some links inside your store carry campaign tags.", detail: "When a shopper from your ads clicks one, GA4 forgets the ad. Your ads then look like they sell less than they do." } },
      },
      media_buyer: {
        fail: { business: { summary: "Internal links carry UTMs, so paid ROAS in GA4 reads lower than real.", detail: "Each click on a tagged banner overwrites the paid source with the store's own UTM. The sale lands on an internal campaign instead of yours. Forward the link list to the store's developer or content team." } },
      },
      agency: {
        pass: { business: { summary: "The store's own links carry no campaign tags.", detail: "A shopper who clicks a banner keeps the source they came from, so ad sales stay credited to the ad." } },
        fail: { business: { summary: "Some links inside the store carry campaign tags.", detail: "A shopper who clicks one loses the ad or channel they came from in GA4. The sale is credited to the store's own banner instead." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لا يحمل أي رابط داخلي في الرئيسية والتصنيفات والمنتج والسلة معامل utm_.", detail: "فحصنا {internalLinks} رابطًا إلى نطاق المتجر نفسه." },
          business: { summary: "روابط المتجر الداخلية لا تحمل وسوم حملات.", detail: "العميل الذي ينقر بانرًا يحتفظ بالمصدر الذي جاء منه، فتبقى مبيعات الإعلانات منسوبة إلى الإعلان." },
          protect: "تتبّع نقرات البانرات بأحداث GA4 بدل إضافة وسوم utm_ إلى روابط المتجر.",
        },
        fail: {
          technical: { summary: "روابط داخلية تحمل معاملات utm_.", detail: "{tagged}. النقر على أحدها يستبدل مصدر الزيارة في GA4 بقيم utm الداخلية، فتخسر الحملة الأصلية البيعة." },
          business: { summary: "بعض الروابط داخل المتجر تحمل وسوم حملات.", detail: "العميل الذي ينقر أحدها يفقد في GA4 الإعلان أو القناة التي جاء منها. وتُنسب البيعة إلى بانر المتجر نفسه." },
          step: "اطلب من المطور أو فريق المحتوى حذف وسوم utm_ من الروابط الداخلية، وتتبّع نقرات البانرات بأحداث GA4.",
          doneWhen: "لا يجد الفحص التالي أي رابط إلى نطاق المتجر يحمل معامل utm_ في الرئيسية والتصنيفات والمنتج والسلة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بعض الروابط داخل متجرك فيها وسوم حملات.", detail: "لما عميل جاي من إعلاناتك يضغط عليها، GA4 ينسى الإعلان. فتبان إعلاناتك تبيع أقل من الحقيقي." } },
      },
      media_buyer: {
        fail: { business: { summary: "روابط داخلية عليها UTMs، فالـ ROAS المدفوع في GA4 أقل من الحقيقي.", detail: "كل كليك على بانر عليه UTM بيكتب فوق المصدر المدفوع بالـ UTM بتاع المتجر. فالبيعة بتتحسب لحملة داخلية مش لحملتك. ابعت قائمة الروابط لمطور المتجر أو فريق المحتوى." } },
      },
      agency: {
        fail: { business: { summary: "بعض الروابط داخل المتجر تحمل وسوم حملات.", detail: "العميل الذي ينقر أحدها يفقد في GA4 الإعلان أو القناة التي جاء منها. وتُنسب البيعة إلى بانر المتجر نفسه." } },
      },
    },
  },
  "TRK-28": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Checked {checked} Meta, TikTok and Snap purchase and add-to-cart tags and hits; each sends event_id (client_dedup_id for Snap)." },
          business: { summary: "Your ad pixels send a matching ID with each sale and add to cart.", detail: "If a server connection (Conversions API) sends the same events, the platform can match the two copies and count each once." },
          protect: "Send the same event ID from the browser and the server when you add or change a Conversions API setup.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "No event ID on: {missing}. A Conversions API copy of the same event is matched to the browser copy by this ID. We can't see the server side, so this causes double counting only if a Conversions API runs." },
          business: { summary: "Some ad pixel events go out without a matching ID.", detail: "If your store also sends these events to Meta, TikTok or Snap from its server, each one can be counted twice. The platforms then report more sales than you made." },
          step: "Have your developer add an event ID to every Meta and TikTok purchase and add-to-cart tag (client_dedup_id for Snap), and send the same ID from the Conversions API.",
          doneWhen: "A re-scan finds an event ID on every Meta, TikTok and Snap purchase and add-to-cart tag in GTM, and on the Meta and TikTok add-to-cart hits from our click.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your ad pixels send sales without a matching ID.", detail: "If your store also sends sales to Meta from the server, Meta can count one sale twice. Then you can't trust Meta's sales number." } },
      },
      media_buyer: {
        fail: { business: { summary: "Pixel events carry no event_id, so with CAPI running the platform can't dedupe and reported ROAS reads higher than real.", detail: "Without a shared event_id, the browser and server copies of a Purchase or AddToCart both count. Inflated results make campaigns look stronger than they are. Check Deduplication in Meta Events Manager, then forward the fix to the store's developer." } },
      },
      agency: {
        pass: { business: { summary: "The store's ad pixels send a matching ID with each sale and add to cart.", detail: "If a server connection (Conversions API) sends the same events, the platform can match the two copies and count each once." } },
        fail: { business: { summary: "Some of the store's ad pixel events go out without a matching ID.", detail: "If the store also sends these events to Meta, TikTok or Snap from its server, each one can be counted twice. The platforms then report more sales than the store made." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "كل وسم وحدث شراء أو إضافة للسلة لـ Meta و TikTok و Snap يرسل معرّف حدث.", detail: "فحصنا {checked} من الوسوم والأحداث، وكلها ترسل event_id (أو client_dedup_id في Snap)." },
          business: { summary: "بكسلات الإعلانات ترسل معرّفًا مطابقًا مع كل بيعة وإضافة للسلة.", detail: "إذا أرسل اتصال من الخادم (Conversions API) الأحداث نفسها، تستطيع المنصة مطابقة النسختين وحساب كل حدث مرة واحدة." },
          protect: "أرسل معرّف الحدث نفسه من المتصفح والخادم عند إضافة Conversions API أو تغييره.",
        },
        fail: {
          technical: { summary: "بعض وسوم أو أحداث Meta أو TikTok أو Snap لا ترسل معرّف حدث.", detail: "بلا معرّف حدث: {missing}. نسخة الحدث من Conversions API تُطابَق مع نسخة المتصفح بهذا المعرّف. لا نرى جهة الخادم، فالعدّ المزدوج يحدث فقط إذا كان Conversions API يعمل." },
          business: { summary: "بعض أحداث بكسلات الإعلانات تُرسل بلا معرّف مطابق.", detail: "إذا كان المتجر يرسل هذه الأحداث أيضًا إلى Meta أو TikTok أو Snap من الخادم، فقد يُحسب كل حدث مرتين. فتعرض المنصات مبيعات أكثر من الحقيقية." },
          step: "اطلب من المطور إضافة معرّف حدث إلى كل وسم شراء وإضافة للسلة لـ Meta و TikTok (و client_dedup_id لـ Snap)، وإرسال المعرّف نفسه من Conversions API.",
          doneWhen: "يجد الفحص التالي معرّف حدث في كل وسم شراء وإضافة للسلة لـ Meta و TikTok و Snap في GTM، وفي أحداث الإضافة للسلة من نقرتنا لـ Meta و TikTok.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بكسلات إعلاناتك ترسل المبيعات بدون رقم مطابق.", detail: "إذا متجرك يرسل المبيعات لـ Meta من السيرفر بعد، ممكن Meta يحسب البيعة الوحدة مرتين. وقتها ما تقدر تثق برقم مبيعات Meta." } },
      },
      media_buyer: {
        fail: { business: { summary: "events الـ Pixel من غير event_id، فلو CAPI شغال المنصة مش هتعرف تعمل dedupe والـ ROAS المعروض أعلى من الحقيقي.", detail: "من غير event_id مشترك، نسخة المتصفح ونسخة السيرفر من الـ Purchase أو AddToCart الاتنين بيتحسبوا. النتايج المنفوخة بتخلي الحملات تبان أقوى من حقيقتها. شوف الـ Deduplication في Events Manager، وابعت التصليح لمطور المتجر." } },
      },
      agency: {
        fail: { business: { summary: "بعض أحداث بكسلات الإعلانات في المتجر تُرسل بلا معرّف مطابق.", detail: "إذا كان المتجر يرسل هذه الأحداث أيضًا من الخادم، فقد يُحسب كل حدث مرتين. فتعرض المنصات مبيعات أكثر مما حققه المتجر." } },
      },
    },
  },
  "TRK-31": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Our visit tapped {navigations} in-app link(s) from home. GA4 page_view count per navigation: {pageViews}." },
          business: { summary: "Your store changes pages without reloading, and each page is still counted.", detail: "Product and collection views after the first page reach your funnel and product reports." },
          protect: "Re-test page changes after a theme or app update that changes how pages load.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "GA4 page_view count per in-app navigation, within 3.5 seconds: {pageViews}. The store swaps pages without a reload, so a tag that fires on page load runs only on the first page unless a history-change trigger is added." },
          business: { summary: "Some pages shoppers open after the first one aren't counted.", detail: "Your store switches pages without reloading, and those views never reach GA4. Product and funnel reports then show fewer views than happened." },
          step: "Have your developer add a history-change trigger in GTM, or turn on page changes based on browser history in GA4 enhanced measurement, so each page change sends a page_view.",
          doneWhen: "Each in-app page change in a re-scan sends a GA4 page_view within 3.5 seconds.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some pages in your store aren't counted when shoppers open them.", detail: "Your store changes pages without reloading, and GA4 misses those views. Products shoppers look at can vanish from your reports." } },
      },
      media_buyer: {
        fail: { business: { summary: "Page changes after the landing page send no page_view, so the funnel signal is thinner.", detail: "Missed views after the first page shrink product-view and retargeting audiences, and the platforms learn from fewer views. Forward the trigger fix to the store's developer." } },
      },
      agency: {
        pass: { business: { summary: "The store changes pages without reloading, and each page is still counted.", detail: "Product and collection views after the first page reach the store's funnel and product reports." } },
        fail: { business: { summary: "Some pages shoppers open after the first one aren't counted.", detail: "The store switches pages without reloading, and those views never reach GA4. The store's product and funnel reports then show fewer views than happened." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "المتجر يغيّر الصفحات دون إعادة تحميل، وكل تنقّل أرسل page_view إلى GA4.", detail: "نقرنا {navigations} رابطًا داخليًا من الصفحة الرئيسية. عدد page_view لكل تنقّل: {pageViews}." },
          business: { summary: "المتجر يغيّر الصفحات دون إعادة تحميل، وكل صفحة ما زالت تُحسب.", detail: "مشاهدات المنتجات والتصنيفات بعد الصفحة الأولى تصل إلى تقارير المسار والمنتجات." },
          protect: "أعد اختبار تغيير الصفحات بعد أي تحديث للقالب أو التطبيقات يغيّر طريقة تحميل الصفحات.",
        },
        fail: {
          technical: { summary: "المتجر يغيّر الصفحات دون إعادة تحميل، وبعض التنقلات لم ترسل page_view إلى GA4.", detail: "عدد page_view لكل تنقّل خلال 3.5 ثانية: {pageViews}. المتجر يبدّل الصفحات دون تحميل، فالوسم الذي يعمل عند تحميل الصفحة يعمل في الصفحة الأولى فقط ما لم يُضف مشغّل تغيّر السجل (history change)." },
          business: { summary: "بعض الصفحات التي يفتحها العملاء بعد الصفحة الأولى لا تُحسب.", detail: "المتجر يبدّل الصفحات دون إعادة تحميل، وهذه المشاهدات لا تصل إلى GA4. فتعرض تقارير المنتجات والمسار مشاهدات أقل من الحقيقية." },
          step: "اطلب من المطور إضافة مشغّل history change في GTM، أو تفعيل تغييرات الصفحة حسب سجل المتصفح في القياس المحسّن في GA4، ليرسل كل تغيير صفحة page_view.",
          doneWhen: "كل تغيير صفحة داخلي في الفحص التالي يرسل page_view إلى GA4 خلال 3.5 ثانية.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بعض صفحات متجرك ما تنحسب لما يفتحها العميل.", detail: "متجرك يغيّر الصفحات بدون تحميل جديد، و GA4 ما يشوف هالمشاهدات. فالمنتجات اللي يتصفحها العملاء ممكن تختفي من تقاريرك." } },
      },
      media_buyer: {
        fail: { business: { summary: "تغيير الصفحات بعد صفحة الهبوط مش بيبعت page_view، فالـ signal في الـ funnel أضعف.", detail: "المشاهدات الضايعة بعد أول صفحة بتصغّر audiences مشاهدة المنتجات والـ retargeting، والمنصات بتتعلم من مشاهدات أقل. ابعت تصليح الـ trigger لمطور المتجر." } },
      },
      agency: {
        fail: { business: { summary: "بعض الصفحات التي يفتحها العملاء بعد الصفحة الأولى لا تُحسب.", detail: "المتجر يبدّل الصفحات دون إعادة تحميل، وهذه المشاهدات لا تصل إلى GA4. فتعرض تقارير المتجر مشاهدات أقل من الحقيقية." } },
      },
    },
  },
  "TRK-32": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Home loaded on a throttled phone (4x slower CPU, 1.6 Mbps). The first GA4 hit and pixel PageView we saw went out before LCP at {lcpMs} ms." },
          business: { summary: "Tracking starts before a slow phone page finishes showing.", detail: "Shoppers who leave a slow page early are still counted as visits." },
          protect: "Keep tracking tags early in the page when you add apps or change how GTM loads.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "On a throttled phone (4x slower CPU, 1.6 Mbps), LCP on home came at {lcpMs} ms and at least one first hit went out after it. Tags that load late through GTM, or wait for the page to finish loading, miss shoppers who leave first." },
          business: { summary: "On a slow phone, tracking starts after the page appears.", detail: "Shoppers who leave in those first seconds are never counted. Visits look lower than they were, and ads look like they bring fewer people." },
          step: "Have your developer load GTM or gtag.js early in the page head and fire page views on an Initialization or Page View trigger instead of Window Loaded.",
          doneWhen: "On our throttled-phone re-scan of home, the first GA4 hit and the first pixel PageView both go out before LCP.",
        },
      },
      store_owner: {
        fail: { business: { summary: "On slow phones, your tracking starts late.", detail: "Shoppers who leave your store in the first seconds are never counted. Your ads then look like they bring fewer visitors than they do." } },
      },
      media_buyer: {
        fail: { business: { summary: "The pixel fires after the page appears on a slow phone, so landing page views are under-counted.", detail: "Early leavers never send PageView, so the click-to-LPV gap looks worse than the page alone and the platforms see fewer visitors. Forward the tag loading fix to the store's developer." } },
      },
      agency: {
        pass: { business: { summary: "Tracking on the store starts before a slow phone page finishes showing.", detail: "Shoppers who leave a slow page early are still counted as visits." } },
        fail: { business: { summary: "On a slow phone, the store's tracking starts after the page appears.", detail: "Shoppers who leave in those first seconds are never counted. The store's visits look lower than they were, and its ads look like they bring fewer people." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "على جوال مُبطّأ، خرج أول حدث GA4 وأول PageView قبل وقت LCP.", detail: "حمّلنا الصفحة الرئيسية على جوال مُبطّأ (معالج أبطأ 4 مرات، 1.6 Mbps). أول حدث GA4 وأول PageView رأيناهما خرجا قبل LCP عند {lcpMs} ms." },
          business: { summary: "التتبع يبدأ قبل أن تكتمل الصفحة على الجوال البطيء.", detail: "العملاء الذين يغادرون صفحة بطيئة مبكرًا يُحسبون كزيارات." },
          protect: "أبقِ وسوم التتبع في بداية الصفحة عند إضافة تطبيقات أو تغيير طريقة تحميل GTM.",
        },
        fail: {
          technical: { summary: "على جوال مُبطّأ، خرج أول حدث GA4 أو أول PageView بعد وقت LCP.", detail: "على جوال مُبطّأ (معالج أبطأ 4 مرات، 1.6 Mbps) كان LCP في الصفحة الرئيسية عند {lcpMs} ms، وخرج حدث أول واحد على الأقل بعده. الوسوم التي تُحمَّل متأخرة عبر GTM أو تنتظر اكتمال الصفحة تفوّت من يغادر قبلها." },
          business: { summary: "على الجوال البطيء، يبدأ التتبع بعد ظهور الصفحة.", detail: "العملاء الذين يغادرون في الثواني الأولى لا يُحسبون أبدًا. فتبدو الزيارات أقل من الحقيقية، وتبدو الإعلانات وكأنها تجلب عددًا أقل." },
          step: "اطلب من المطور تحميل GTM أو gtag.js مبكرًا في رأس الصفحة، وإرسال مشاهدات الصفحة على مشغّل Initialization أو Page View بدل Window Loaded.",
          doneWhen: "في فحصنا التالي للصفحة الرئيسية على جوال مُبطّأ، يخرج أول حدث GA4 وأول PageView قبل LCP.",
        },
      },
      store_owner: {
        fail: { business: { summary: "على الجوالات البطيئة، التتبع في متجرك يبدأ متأخر.", detail: "العملاء اللي يطلعون من متجرك في أول ثواني ما ينحسبون أبدًا. فتبان إعلاناتك تجيب زوار أقل من الحقيقي." } },
      },
      media_buyer: {
        fail: { business: { summary: "الـ Pixel بيشتغل بعد ما الصفحة تظهر على الموبايل البطيء، فالـ landing page views أقل من الحقيقي.", detail: "اللي بيمشوا بدري مش بيبعتوا PageView، فالفرق بين الكليك والـ LPV بيبان أسوأ من الصفحة نفسها والمنصات بتشوف زوار أقل. ابعت تصليح تحميل الـ tags لمطور المتجر." } },
      },
      agency: {
        fail: { business: { summary: "على الجوال البطيء، يبدأ تتبع المتجر بعد ظهور الصفحة.", detail: "العملاء الذين يغادرون في الثواني الأولى لا يُحسبون أبدًا. فتبدو زيارات المتجر أقل من الحقيقية، وتبدو إعلاناته وكأنها تجلب عددًا أقل." } },
      },
    },
  },
  "TRK-33": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Uncaught errors from the store's own code on product and cart: {errors}. Errors from other sites' scripts are left out." },
          business: { summary: "No script error on your product or cart page stopped tracking.", detail: "Your product and cart pages showed no store script error that stopped GA4 or pixel events." },
          protect: "Check the browser console on product and cart after each theme or app update.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "{errors} uncaught error(s) from the store's own code on product or cart, first: {first}. No view_item on the product page from {missing}. An error that halts the page's code can stop tag code that runs after it." },
          business: { summary: "A script error on your product page showed up with missing product-view tracking.", detail: "The same error can break parts of the page shoppers use to buy. With the tracking gone too, your reports can't show the loss." },
          step: "Send the console error to your developer to fix, then check that view_item fires on the product page.",
          doneWhen: "A re-scan sees no uncaught script error from the store's own code on product and cart, and view_item reaches GA4 and every pixel on the product page.",
        },
      },
      store_owner: {
        fail: { business: { summary: "A script error on your product page also stops some tracking.", detail: "The same error can break parts of the page shoppers need to buy. Your reports then miss those visits, so you can't see the lost sales." } },
      },
      media_buyer: {
        fail: { business: { summary: "Script errors on the product page come with lost view_item, so CVR can drop and reported ROAS reads low.", detail: "An error that stops tag code can also stop the page code shoppers use to buy. Paid clicks then convert less, and the conversions that remain are under-reported. Forward the console error to the store's developer." } },
      },
      agency: {
        pass: { business: { summary: "No script error on the store's product or cart page stopped tracking.", detail: "The store's product and cart pages showed no script error from its own code that stopped GA4 or pixel events." } },
        fail: { business: { summary: "A script error on the store's product page showed up with missing product-view tracking.", detail: "The same error can break parts of the page shoppers use to buy. With the tracking gone too, the store's reports can't show the loss." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لم يمنع أي خطأ برمجي من كود المتجر نفسه التتبع في صفحة المنتج أو السلة.", detail: "أخطاء غير معالجة من كود المتجر في المنتج والسلة: {errors}. أخطاء سكربتات المواقع الأخرى مستبعدة." },
          business: { summary: "لم يوقف أي خطأ برمجي التتبع في صفحة المنتج أو السلة.", detail: "صفحتا المنتج والسلة لم يظهر فيهما خطأ من كود المتجر أوقف أحداث GA4 أو البكسلات." },
          protect: "افحص وحدة التحكم في المتصفح على صفحتي المنتج والسلة بعد كل تحديث للقالب أو التطبيقات.",
        },
        fail: {
          technical: { summary: "خطأ برمجي من كود المتجر في صفحة المنتج أو السلة، ومنصة واحدة على الأقل لم ترسل view_item.", detail: "عدد الأخطاء غير المعالجة: {errors}، وأولها: {first}. لا view_item في صفحة المنتج من: {missing}. الخطأ الذي يوقف كود الصفحة قد يوقف كود الوسوم الذي يأتي بعده." },
          business: { summary: "ظهر خطأ برمجي في صفحة المنتج مع غياب تتبع مشاهدة المنتج.", detail: "الخطأ نفسه قد يعطّل أجزاء من الصفحة يحتاجها العميل للشراء. ومع غياب التتبع أيضًا لا تُظهر التقارير هذه الخسارة." },
          step: "أرسل خطأ وحدة التحكم إلى المطور لإصلاحه، ثم تأكد أن view_item يعمل في صفحة المنتج.",
          doneWhen: "لا يرى الفحص التالي أي خطأ غير معالج من كود المتجر في المنتج والسلة، ويصل view_item إلى GA4 وكل Pixel في صفحة المنتج.",
        },
      },
      store_owner: {
        fail: { business: { summary: "فيه خطأ برمجي في صفحة المنتج بمتجرك يوقف جزء من التتبع.", detail: "نفس الخطأ ممكن يخرّب أجزاء من الصفحة يحتاجها العميل عشان يشتري. وتقاريرك ما تشوف هالزيارات، فما تدري عن المبيعات الضايعة." } },
      },
      media_buyer: {
        fail: { business: { summary: "أخطاء الـ scripts في صفحة المنتج جاية مع view_item ناقص، فالـ CVR ممكن يقع والـ ROAS المعروض أقل.", detail: "الخطأ اللي بيوقف كود الـ tags ممكن يوقف كود الصفحة اللي العميل بيشتري بيه. فالكليكات المدفوعة بتحوّل أقل، والـ conversions اللي فاضلة مش بتتحسب كلها. ابعت خطأ الـ console لمطور المتجر." } },
      },
      agency: {
        fail: { business: { summary: "ظهر خطأ برمجي في صفحة منتج المتجر مع غياب تتبع مشاهدة المنتج.", detail: "الخطأ نفسه قد يعطّل أجزاء من الصفحة يحتاجها العميل للشراء. ومع غياب التتبع أيضًا لا تُظهر تقارير المتجر هذه الخسارة." } },
      },
    },
  },
};
