import type { PointTemplate } from "./types.js";

// Frames for AI-judged points: fixed text, the AI's finding in {observation} (types.ts).
export const FRAMES_TRACKING: Record<string, PointTemplate> = {
  "TRK-05": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "GA4 shows google/cpc sessions, and GTM has a live Google Ads conversion tag, or the account imports GA4 purchases." },
          business: { summary: "Google Ads receives the store's sales.", detail: "Smart Bidding sees which clicks became orders, so it can look for more shoppers like those buyers." },
          protect: "Check the conversion status in Google Ads after any change to the checkout, the thank-you page or GTM.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "GA4 shows google/cpc sessions, but GTM has no live Google Ads conversion tag, and Google Ads isn't linked to GA4, so no GA4 purchase import is possible. Saving the click ID (Conversion Linker) is a separate check." },
          business: { summary: "Google Ads doesn't see all the sales its clicks bring.", detail: "The store pays for Google clicks, but Google bids without knowing which ones became orders. It then spends on shoppers less likely to buy, and its reports show fewer sales than the store made." },
          step: "The developer adds a Google Ads purchase conversion tag in GTM and turns on enhanced conversions. If the account imports GA4 purchases instead, confirm the import is set as the primary conversion.",
          doneWhen: "Google Ads shows the purchase conversion as recording, and a test order appears in it.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Google Ads doesn't see all the sales its clicks bring to your store.", detail: "You pay for every Google click, but Google can't tell which ones bought. It keeps spending on shoppers less likely to order, and its reports show fewer sales than you made." } },
      },
      media_buyer: {
        fail: { business: { summary: "Google Ads is missing purchases, so reported ROAS reads lower than real and Smart Bidding learns from fewer sales.", detail: "With no conversion tag, Google-driven sales are never credited. Winning campaigns can look weak and get cut, and tROAS or tCPA bidding works from a thin signal. The store's developer adds the tag in GTM." } },
      },
      agency: {
        fail: { business: { summary: "Google Ads doesn't see all the sales its clicks bring to the store.", detail: "The store pays for Google clicks, but Google bids without knowing which ones became orders. Its reports undercount sales, so campaign results look weaker than they are." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "يظهر في GA4 زيارات google/cpc، وفي GTM وسم تحويل Google Ads يعمل، أو أن الحساب يستورد مشتريات GA4." },
          business: { summary: "Google Ads يستقبل مبيعات المتجر.", detail: "المزايدة الذكية ترى أي النقرات تحولت إلى طلبات، فتبحث عن متسوقين يشبهون هؤلاء المشترين." },
          protect: "تحقق من حالة التحويل في Google Ads بعد أي تغيير في الدفع أو صفحة الشكر أو GTM.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "يظهر في GA4 زيارات google/cpc، لكن لا يوجد في GTM وسم تحويل Google Ads يعمل، وGoogle Ads غير مربوط بـ GA4، فلا يمكن استيراد مشتريات GA4. حفظ معرّف النقرة (Conversion Linker) بند منفصل." },
          business: { summary: "Google Ads لا يرى كل المبيعات التي تأتي من نقراته.", detail: "المتجر يدفع مقابل نقرات Google، لكن Google يزايد دون أن يعرف أيها تحول إلى طلب. فيصرف على متسوقين أقل احتمالًا للشراء، وتُظهر تقاريره مبيعات أقل من الحقيقية." },
          step: "يضيف المطوّر في GTM وسم تحويل شراء من Google Ads، ويفعّل التحويلات المحسّنة. وإذا كان الحساب يستورد مشتريات GA4، تأكد أن الاستيراد مضبوط كتحويل أساسي.",
          doneWhen: "يعرض Google Ads تحويل الشراء بحالة تسجيل، ويظهر فيه طلب تجريبي.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Google Ads ما يشوف كل المبيعات اللي تجي من إعلاناته في متجرك.", detail: "أنت تدفع على كل ضغطة من Google، بس Google ما يعرف مين اشترى. فيكمل يصرف على ناس أقل احتمال يطلبون، وتقاريره تبين مبيعات أقل من اللي صارت فعلًا." } },
      },
      media_buyer: {
        fail: { business: { summary: "Google Ads مش شايف كل الـ purchases، فالـ ROAS المعروض أقل من الحقيقي والـ Smart Bidding بيتعلم من مبيعات أقل.", detail: "من غير conversion tag، المبيعات الجاية من Google مش بتتحسب. حملات كسبانة ممكن تبان ضعيفة وتتقفل، والـ tROAS أو tCPA بيشتغل على signal ضعيف. مطوّر المتجر يضيف الـ tag في GTM." } },
      },
      agency: {
        fail: { business: { summary: "Google Ads لا يرى كل المبيعات التي تأتي من نقراته إلى المتجر.", detail: "المتجر يدفع مقابل نقرات Google، لكن Google يزايد دون أن يعرف أيها تحول إلى طلب. وتقاريره تُظهر مبيعات أقل، فتبدو نتائج الحملات أضعف مما هي عليه." } },
      },
    },
  },

  "TRK-12": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "For each platform with paid sessions in GA4 (Meta, TikTok, Snap, Google Ads), its pixel loaded and sent PageView and AddToCart hits during our visit, with no blocking." },
          business: { summary: "Each ad platform the store pays for sees visits and add to carts.", detail: "The platforms can learn which visitors shop, so they keep finding more people like them." },
          protect: "When adding a new ad platform, install its pixel before the first campaign goes live.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "For at least one platform with paid sessions in GA4, its pixel didn't load, was blocked, or sent no PageView or AddToCart hit during our visit. A missing hit can also come from a consent default with no banner choice, so check the consent setup too." },
          business: { summary: "At least one ad platform the store pays for can't see what visitors do on the site.", detail: "That platform gets clicks but can't tell which visitors shop or buy. It keeps showing ads to people less likely to order, and its reports show fewer results than it brought." },
          step: "The developer installs the missing pixel through GTM or the store's app for that platform, with PageView on every page and AddToCart on the add to cart click. If the pixel is there but blocked, fix the consent or script setting that stops it.",
          doneWhen: "Each platform's pixel helper or test events tool shows PageView and AddToCart from a test visit.",
        },
      },
      store_owner: {
        fail: { business: { summary: "At least one ad platform you pay for can't see what visitors do in your store.", detail: "You pay for its clicks, but it can't tell who shops or buys. So it keeps showing your ads to people less likely to order." } },
      },
      media_buyer: {
        fail: { business: { summary: "A platform you run has no working pixel, so reported ROAS reads lower than real and its algorithm optimises blind.", detail: "Without PageView and AddToCart, the platform can't build audiences or credit sales to campaigns. Good ad sets look like losers and get cut. The store's developer installs or unblocks the pixel." } },
      },
      agency: {
        fail: { business: { summary: "At least one ad platform the store pays for can't see what visitors do on the site.", detail: "It gets clicks but can't tell which visitors shop or buy, so it targets people less likely to order. Its reports also undercount the results it brought." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "لكل منصة لها زيارات مدفوعة في GA4 (Meta و TikTok و Snap و Google Ads)، حُمّل البكسل وأرسل PageView و AddToCart أثناء زيارتنا دون حجب." },
          business: { summary: "كل منصة إعلانية يدفع لها المتجر ترى الزيارات والإضافات إلى السلة.", detail: "تتعلم المنصات أي الزوار يتسوقون، فتستمر في الوصول إلى أشخاص يشبهونهم." },
          protect: "عند إضافة منصة إعلانية جديدة، ثبّت البكسل الخاص بها قبل إطلاق أول حملة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "لمنصة واحدة على الأقل لها زيارات مدفوعة في GA4، لم يُحمّل البكسل أو حُجب أو لم يرسل PageView أو AddToCart أثناء زيارتنا. قد يأتي غياب الحدث أيضًا من إعداد موافقة افتراضي دون اختيار في الشريط، فافحص إعداد الموافقة كذلك." },
          business: { summary: "منصة إعلانية واحدة على الأقل يدفع لها المتجر لا ترى ما يفعله الزوار في الموقع.", detail: "تحصل المنصة على النقرات لكنها لا تعرف من يتسوق أو يشتري. فتستمر في عرض الإعلانات على أشخاص أقل احتمالًا للطلب، وتُظهر تقاريرها نتائج أقل مما جلبته." },
          step: "يثبّت المطوّر البكسل الناقص عبر GTM أو تطبيق المتجر الخاص بالمنصة، مع PageView في كل الصفحات و AddToCart عند النقر على زر الإضافة للسلة. وإذا كان البكسل موجودًا لكنه محجوب، أصلح إعداد الموافقة أو السكربت الذي يوقفه.",
          doneWhen: "تُظهر أداة فحص البكسل أو أداة اختبار الأحداث في كل منصة حدثي PageView و AddToCart من زيارة تجريبية.",
        },
      },
      store_owner: {
        fail: { business: { summary: "فيه منصة إعلانية وحدة على الأقل تدفع لها وما تشوف وش يسوون الزوار في متجرك.", detail: "تدفع على ضغطاتها، بس ما تعرف مين يتسوق أو يشتري. فتكمل تعرض إعلاناتك على ناس أقل احتمال يطلبون." } },
      },
      media_buyer: {
        fail: { business: { summary: "منصة شغال عليها مفيهاش Pixel شغال، فالـ ROAS المعروض أقل من الحقيقي والـ algorithm بيشتغل أعمى.", detail: "من غير PageView و AddToCart المنصة مش هتعرف تبني audiences ولا تنسب المبيعات للحملات. Ad sets كويسة هتبان خسرانة وتتقفل. مطوّر المتجر يركّب الـ Pixel أو يفك الحجب عنه." } },
      },
      agency: {
        fail: { business: { summary: "منصة إعلانية واحدة على الأقل يدفع لها المتجر لا ترى ما يفعله الزوار في الموقع.", detail: "تحصل على النقرات لكنها لا تعرف من يتسوق أو يشتري، فتستهدف أشخاصًا أقل احتمالًا للطلب. وتقاريرها تُظهر نتائج أقل مما جلبته." } },
      },
    },
  },

  "TRK-13": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "For each platform with paid sessions in GA4, GTM has purchase and add-to-cart tags on matching event triggers, or a store-app integration sends them." },
          business: { summary: "Each paid platform is told about add to carts and purchases.", detail: "The platforms learn from real shoppers and buyers, so they can find more people like them." },
          protect: "Set up purchase and add-to-cart events for any new ad platform before its first campaign.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "For at least one platform with paid sessions in GA4, GTM has no purchase or add-to-cart tag on a matching event trigger, and no store-app integration was found that sends them. That platform receives clicks but no buying events." },
          business: { summary: "At least one ad platform the store pays for isn't told about purchases or add to carts.", detail: "It can't learn who buys, so it shows ads to people less likely to order. Its reports also show fewer sales than it brought, which makes it hard to judge." },
          step: "The developer adds that platform's add-to-cart and purchase events, through its official store app or GTM tags on the add_to_cart and purchase events, with value and currency.",
          doneWhen: "That platform's events manager shows add-to-cart and purchase from a test order.",
        },
      },
      store_owner: {
        fail: { business: { summary: "At least one ad platform you pay for never hears about your sales.", detail: "It can't learn who buys from you, so it keeps showing your ads to people less likely to order. Its reports also show fewer sales than it brought." } },
      },
      media_buyer: {
        fail: { business: { summary: "A platform you run gets no purchase or add-to-cart events, so it optimises on thin signal and CAC likely runs higher.", detail: "Without funnel events, delivery can't find buyers and conversion campaigns have nothing to optimise for. Reported results also undercount. The store's developer adds the events through the platform's app or GTM." } },
      },
      agency: {
        fail: { business: { summary: "At least one ad platform the store pays for isn't told about purchases or add to carts.", detail: "It can't learn who buys, so it targets people less likely to order. Its reports also undercount the sales it brought." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "لكل منصة لها زيارات مدفوعة في GA4، يوجد في GTM وسما الشراء والإضافة للسلة على مشغّلات الأحداث المطابقة، أو يرسلها تكامل من تطبيق المتجر." },
          business: { summary: "كل منصة مدفوعة تصلها الإضافات إلى السلة والمشتريات.", detail: "تتعلم المنصات من متسوقين ومشترين حقيقيين، فتجد أشخاصًا أكثر يشبهونهم." },
          protect: "اضبط حدثي الشراء والإضافة للسلة لأي منصة إعلانية جديدة قبل أول حملة لها.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "لمنصة واحدة على الأقل لها زيارات مدفوعة في GA4، لا يوجد في GTM وسم شراء أو إضافة للسلة على مشغّل حدث مطابق، ولم نجد تكاملًا من تطبيق المتجر يرسلهما. تحصل المنصة على النقرات دون أحداث الشراء." },
          business: { summary: "منصة إعلانية واحدة على الأقل يدفع لها المتجر لا تصلها المشتريات أو الإضافات إلى السلة.", detail: "لا تستطيع أن تتعلم من يشتري، فتعرض الإعلانات على أشخاص أقل احتمالًا للطلب. وتُظهر تقاريرها مبيعات أقل مما جلبته، فيصعب تقييمها." },
          step: "يضيف المطوّر حدثي الإضافة للسلة والشراء لتلك المنصة، عبر تطبيقها الرسمي في المتجر أو وسوم GTM على حدثي add_to_cart و purchase، مع القيمة والعملة.",
          doneWhen: "يُظهر مدير الأحداث في تلك المنصة الإضافة للسلة والشراء من طلب تجريبي.",
        },
      },
      store_owner: {
        fail: { business: { summary: "فيه منصة إعلانية وحدة على الأقل تدفع لها وما توصلها مبيعاتك.", detail: "ما تقدر تتعلم مين يشتري منك، فتكمل تعرض إعلاناتك على ناس أقل احتمال يطلبون. وتقاريرها تبين مبيعات أقل من اللي جابتها." } },
      },
      media_buyer: {
        fail: { business: { summary: "منصة شغال عليها مش واصلها purchase ولا add to cart، فبتعمل optimization على signal ضعيف والـ CAC غالبًا أعلى.", detail: "من غير funnel events الـ delivery مش هيلاقي مشترين وحملات الـ conversion مفيهاش حاجة تعمل عليها optimization. والنتائج المعروضة أقل من الحقيقي. مطوّر المتجر يضيف الـ events من تطبيق المنصة أو GTM." } },
      },
      agency: {
        fail: { business: { summary: "منصة إعلانية واحدة على الأقل يدفع لها المتجر لا تصلها المشتريات أو الإضافات إلى السلة.", detail: "لا تستطيع أن تتعلم من يشتري، فتستهدف أشخاصًا أقل احتمالًا للطلب. وتقاريرها تُظهر مبيعات أقل مما جلبته." } },
      },
    },
  },

  "TRK-15": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "GTM consent defaults are set per region, or none deny ad_storage and analytics_storage for GCC countries (SA, AE, KW, QA, BH, OM)." },
          business: { summary: "Gulf visits and orders are recorded normally.", detail: "Consent settings don't block tracking for Gulf shoppers, so reports and ad platforms see their real activity." },
          protect: "Re-check the consent regions after any change to the consent banner or its app.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "A GTM consent default denies ad_storage and analytics_storage without a region list, so it applies to GCC visitors too. Until a visitor accepts, GA4 and ad tags send no full hits for them." },
          business: { summary: "Consent settings hide part of the store's Gulf visits and orders.", detail: "Tracking is blocked for Gulf shoppers who don't click accept on the banner. Their visits and sales are missing from reports and ad platforms, so results look lower than they are." },
          step: "The developer sets the consent defaults per region: denied for the EEA and other regions that require it, granted for GCC countries.",
          doneWhen: "GCC visits record in GA4 without a banner click, and EEA visits stay denied by default in GTM Preview.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your consent settings hide part of your Gulf visits and orders.", detail: "Gulf shoppers who don't click accept aren't recorded. Your reports show fewer visits and sales than you really have, and your ads learn from fewer buyers." } },
      },
      media_buyer: {
        fail: { business: { summary: "Consent defaults block tags for Gulf visitors, so reported ROAS reads lower than real and platforms learn from a fraction of buyers.", detail: "Every Gulf shopper who ignores the banner is invisible to Meta, Google, TikTok and Snap. Campaigns get less credit than they earned, and audiences are built from fewer buyers. The store's developer sets the defaults per region." } },
      },
      agency: {
        fail: { business: { summary: "Consent settings hide part of the store's Gulf visits and orders.", detail: "Gulf shoppers who don't click accept aren't recorded, so reports and ad platforms show less than really happened. Campaign results read lower than they are." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "إعدادات الموافقة الافتراضية في GTM مضبوطة حسب المنطقة، أو لا يوجد منها ما يرفض ad_storage و analytics_storage لدول الخليج (SA و AE و KW و QA و BH و OM)." },
          business: { summary: "زيارات وطلبات الخليج تُسجَّل بشكل طبيعي.", detail: "إعدادات الموافقة لا تحجب التتبع عن متسوقي الخليج، فترى التقارير ومنصات الإعلان نشاطهم الحقيقي." },
          protect: "أعد فحص مناطق الموافقة بعد أي تغيير في شريط الموافقة أو تطبيقه.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "إعداد موافقة افتراضي في GTM يرفض ad_storage و analytics_storage دون قائمة مناطق، فيُطبَّق على زوار الخليج أيضًا. وحتى يوافق الزائر، لا يرسل GA4 ووسوم الإعلانات بيانات كاملة عنه." },
          business: { summary: "إعدادات الموافقة تُخفي جزءًا من زيارات وطلبات المتجر في الخليج.", detail: "يُحجب التتبع عن متسوقي الخليج الذين لا يضغطون موافقة في الشريط. فتغيب زياراتهم ومبيعاتهم عن التقارير ومنصات الإعلان، وتبدو النتائج أقل من حقيقتها." },
          step: "يضبط المطوّر إعدادات الموافقة الافتراضية حسب المنطقة: مرفوضة للمنطقة الاقتصادية الأوروبية والمناطق التي تتطلبها، وممنوحة لدول الخليج.",
          doneWhen: "تُسجَّل زيارات الخليج في GA4 دون ضغط على الشريط، وتبقى زيارات أوروبا مرفوضة افتراضيًا في معاينة GTM.",
        },
      },
      store_owner: {
        fail: { business: { summary: "إعدادات الموافقة عندك تخفي جزء من زياراتك وطلباتك في الخليج.", detail: "المتسوق الخليجي اللي ما يضغط موافقة ما ينسجل. فتقاريرك تبين زيارات ومبيعات أقل من الحقيقية، وإعلاناتك تتعلم من مشترين أقل." } },
      },
      media_buyer: {
        fail: { business: { summary: "الـ consent defaults بتحجب الـ tags عن زوار الخليج، فالـ ROAS المعروض أقل من الحقيقي والمنصات بتتعلم من جزء صغير من المشترين.", detail: "كل متسوق خليجي بيتجاهل الـ banner مش ظاهر لـ Meta و Google و TikTok و Snap. الحملات بتاخد credit أقل من اللي تستحقه، والـ audiences بتتبني من مشترين أقل. مطوّر المتجر يظبط الـ defaults حسب المنطقة." } },
      },
      agency: {
        fail: { business: { summary: "إعدادات الموافقة تُخفي جزءًا من زيارات وطلبات المتجر في الخليج.", detail: "متسوقو الخليج الذين لا يضغطون موافقة لا يُسجَّلون، فتُظهر التقارير ومنصات الإعلان أقل مما حدث فعلًا. وتبدو نتائج الحملات أقل من حقيقتها." } },
      },
    },
  },

  "TRK-16": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The store isn't on Shopify, or begin_checkout and purchase come from a Shopify Customer Events pixel or a native app instead of GTM tags." },
          business: { summary: "Checkout and orders are recorded from a source that can see the checkout.", detail: "GA4 and the ad platforms receive checkout starts and purchases, so sales and checkout drop-off show in the reports." },
          protect: "Re-test a checkout and purchase after any change to the checkout, its apps or the tracking setup.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "The store runs on Shopify, and begin_checkout and purchase depend on GTM tags or come from no source we found. GTM can't run inside Shopify's checkout, so those events miss most or all orders." },
          business: { summary: "The store's checkout and orders may not reach GA4 and the ad platforms.", detail: "Shopify's checkout doesn't run GTM, so tags placed there miss sales. Reports then show fewer orders than the store made, and checkout drop-off can't be measured." },
          step: "The developer sends begin_checkout and purchase from a Shopify Customer Events custom pixel or each platform's official Shopify app, then removes the GTM checkout tags they replace.",
          doneWhen: "A test order shows begin_checkout and purchase in GA4 DebugView, sent by the custom pixel or app.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your Shopify checkout and orders may not be recorded.", detail: "Shopify's checkout doesn't run the tags your tracking relies on. GA4 and your ads then miss sales, and you can't see where shoppers leave checkout." } },
      },
      media_buyer: {
        fail: { business: { summary: "Shopify checkout purchases may never fire to the platforms, so reported ROAS reads lower than real.", detail: "GTM tags don't run in Shopify's checkout, so purchases go uncounted. Winning campaigns can get cut and the algorithm learns from fewer buyers. The store's developer moves checkout events to a Customer Events pixel or the platform apps." } },
      },
      agency: {
        fail: { business: { summary: "The store's Shopify checkout and orders may not reach GA4 and the ad platforms.", detail: "Shopify's checkout doesn't run GTM, so tags placed there miss sales. Reports undercount orders, and checkout drop-off can't be measured." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "المتجر ليس على Shopify، أو أن begin_checkout و purchase يأتيان من بكسل Customer Events في Shopify أو من تطبيق رسمي بدلًا من وسوم GTM." },
          business: { summary: "الدفع والطلبات تُسجَّل من مصدر يرى صفحة الدفع.", detail: "يستقبل GA4 ومنصات الإعلان بدء الدفع والمشتريات، فتظهر المبيعات والتسرب من الدفع في التقارير." },
          protect: "أعد اختبار الدفع والشراء بعد أي تغيير في الدفع أو تطبيقاته أو إعداد التتبع.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "المتجر على Shopify، و begin_checkout و purchase يعتمدان على وسوم GTM أو لم نجد لهما مصدرًا. لا يعمل GTM داخل صفحة الدفع في Shopify، فتفوت هذه الأحداث معظم الطلبات أو كلها." },
          business: { summary: "قد لا يصل الدفع والطلبات في المتجر إلى GA4 ومنصات الإعلان.", detail: "صفحة الدفع في Shopify لا تشغّل GTM، فالوسوم الموضوعة هناك تفوّت المبيعات. فتُظهر التقارير طلبات أقل من الحقيقية، ولا يمكن قياس التسرب من الدفع." },
          step: "يرسل المطوّر begin_checkout و purchase من بكسل مخصص في Shopify Customer Events أو من التطبيق الرسمي لكل منصة في Shopify، ثم يحذف وسوم الدفع في GTM التي استُبدلت.",
          doneWhen: "يظهر begin_checkout و purchase من طلب تجريبي في DebugView في GA4، مُرسلين من البكسل المخصص أو التطبيق.",
        },
      },
      store_owner: {
        fail: { business: { summary: "الدفع والطلبات في متجرك على Shopify ممكن ما تنسجل.", detail: "صفحة الدفع في Shopify ما تشغّل الأكواد اللي يعتمد عليها التتبع عندك. فـ GA4 وإعلاناتك تفوتها مبيعات، وما تقدر تشوف وين يطلع العميل من الدفع." } },
      },
      media_buyer: {
        fail: { business: { summary: "الـ purchases في checkout بتاع Shopify ممكن متوصلش للمنصات، فالـ ROAS المعروض أقل من الحقيقي.", detail: "الـ GTM tags مش بتشتغل في checkout بتاع Shopify، فالمشتريات مش بتتحسب. حملات كسبانة ممكن تتقفل والـ algorithm بيتعلم من مشترين أقل. مطوّر المتجر ينقل الـ checkout events لـ Customer Events pixel أو تطبيقات المنصات." } },
      },
      agency: {
        fail: { business: { summary: "قد لا يصل الدفع والطلبات في متجر Shopify إلى GA4 ومنصات الإعلان.", detail: "صفحة الدفع في Shopify لا تشغّل GTM، فالوسوم الموضوعة هناك تفوّت المبيعات. وتُظهر التقارير طلبات أقل، ولا يمكن قياس التسرب من الدفع." } },
      },
    },
  },

  "TRK-26": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "No hostname with 5+ sessions in GA4 is a staging, preview, theme-editor, localhost or dev domain. Other hosts outside the store's own domains, if any, are listed for review." },
          business: { summary: "No test or preview sites send data into the live numbers.", detail: "Reported visits and sales come from the real store, so revenue figures can be trusted." },
          protect: "Point any new staging or preview site to a separate GA4 property before it goes up.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "At least one hostname with 5+ sessions in GA4 is a staging, preview, theme-editor, localhost or dev domain. Its sessions, events and test orders count as live data." },
          business: { summary: "Test or preview sites send data into the live numbers.", detail: "Test visits and orders count as real ones, so revenue and conversion figures read higher than what happened." },
          step: "The developer removes the GA4 tag from test and preview sites, or points them to a separate property, and adds a hostname filter that keeps only the store's own domains.",
          doneWhen: "GA4's hostname report shows only the store's domains for new data.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Test and preview sites send data into your real numbers.", detail: "Test visits and orders count as real ones, so your revenue looks higher than it is." } },
      },
      media_buyer: {
        fail: { business: { summary: "Test hosts send purchases into GA4, so reported ROAS can read higher than real.", detail: "Fake orders from staging or preview sites get credited to the channels that were active, so some look better than they are. Anything importing GA4 conversions inherits them. The store's developer cuts the test hosts off." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "لا يوجد اسم مضيف له 5 جلسات أو أكثر في GA4 من نوع staging أو preview أو محرر القالب أو localhost أو نطاق تطوير. وتُعرض المضيفات الأخرى خارج نطاقات المتجر، إن وُجدت، للمراجعة." },
          business: { summary: "لا ترسل مواقع الاختبار أو المعاينة بيانات إلى الأرقام الحقيقية.", detail: "الزيارات والمبيعات المسجلة تأتي من المتجر الحقيقي، فأرقام الإيرادات موثوقة." },
          protect: "اربط أي موقع اختبار أو معاينة جديد بخاصية GA4 منفصلة قبل تشغيله.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "اسم مضيف واحد على الأقل له 5 جلسات أو أكثر في GA4 من نوع staging أو preview أو محرر القالب أو localhost أو نطاق تطوير. تُحسب جلساته وأحداثه وطلباته التجريبية كبيانات حقيقية." },
          business: { summary: "مواقع الاختبار أو المعاينة ترسل بيانات إلى الأرقام الحقيقية.", detail: "تُحسب الزيارات والطلبات التجريبية كأنها حقيقية، فتبدو أرقام الإيرادات والتحويل أعلى مما حدث." },
          step: "يحذف المطوّر وسم GA4 من مواقع الاختبار والمعاينة أو يربطها بخاصية منفصلة، ويضيف فلتر اسم مضيف يُبقي نطاقات المتجر فقط.",
          doneWhen: "يُظهر تقرير أسماء المضيفات في GA4 نطاقات المتجر فقط للبيانات الجديدة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "مواقع التجربة والمعاينة ترسل بيانات لأرقامك الحقيقية.", detail: "الزيارات والطلبات التجريبية تنحسب كأنها حقيقية، فإيراداتك تبين أعلى من الواقع." } },
      },
      media_buyer: {
        fail: { business: { summary: "Hosts تجريبية بتبعت purchases لـ GA4، فالـ ROAS المعروض ممكن يبقى أعلى من الحقيقي.", detail: "أوردرات وهمية من مواقع staging أو preview بتتنسب للقنوات اللي كانت شغالة، فبعضها يبان أحسن من حقيقته. وأي حاجة بتعمل import لـ conversions من GA4 بتورثها. مطوّر المتجر يفصل الـ hosts التجريبية." } },
      },
    },
  },

  "TRK-29": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Each platform uses one ID across all container tags and live hits, and no paused or triggerless tags remain in the container." },
          business: { summary: "Each platform's data goes to one account.", detail: "Sales reach the GA4 property and ad accounts the store works from, with no stray copies." },
          protect: "Remove a platform's old tags and IDs whenever an account is replaced or an agency changes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "A platform uses more than one ID across the container tags or live hits, or paused or triggerless tags remain in the container. A second ID can be a planned second property or an agency pixel, so each one needs an owner check." },
          business: { summary: "Tracking may send data to an account the store doesn't use or own.", detail: "Sales sent to an old or unknown account are missing from the store's own reports, and someone else may see them. Leftover tags make it harder to tell which setup is live." },
          step: "The developer confirms who owns each extra ID. Keep the store's ID in one constant variable used by every tag of that platform, and delete unknown IDs and paused or triggerless tags.",
          doneWhen: "Each platform shows only the store's own ID in the container and in live hits, with no paused or triggerless tags left.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your tracking may send data to an account you don't use or own.", detail: "Sales sent there are missing from your reports, and someone else may see your sales. Old leftover tags also make the setup harder to manage." } },
      },
      media_buyer: {
        fail: { business: { summary: "Events may go to an old or foreign ID, so the account you bid in learns from fewer sales and reported ROAS reads lower than real.", detail: "Every hit sent to a second pixel or property is one the bidding account never sees. Confirm with the store which IDs are theirs; the store's developer removes the rest." } },
      },
      agency: {
        fail: { business: { summary: "The store's tracking may send data to an account it doesn't use or own.", detail: "Sales sent there are missing from the store's reports, and someone else may see them. The store should confirm who owns each extra ID." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "كل منصة تستخدم معرّفًا واحدًا في كل وسوم الحاوية والبيانات المرسلة، ولا توجد وسوم متوقفة أو بلا مشغّل في الحاوية." },
          business: { summary: "بيانات كل منصة تذهب إلى حساب واحد.", detail: "تصل المبيعات إلى خاصية GA4 والحسابات الإعلانية التي يعمل منها المتجر، دون نسخ جانبية." },
          protect: "احذف الوسوم والمعرّفات القديمة لأي منصة عند استبدال حساب أو تغيير الوكالة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "منصة تستخدم أكثر من معرّف في وسوم الحاوية أو البيانات المرسلة، أو توجد وسوم متوقفة أو بلا مشغّل في الحاوية. قد يكون المعرّف الثاني خاصية ثانية مقصودة أو بكسل وكالة، فيلزم التحقق من مالك كل معرّف." },
          business: { summary: "قد يرسل التتبع بيانات إلى حساب لا يستخدمه المتجر أو لا يملكه.", detail: "المبيعات المرسلة إلى حساب قديم أو مجهول تغيب عن تقارير المتجر، وقد يراها طرف آخر. والوسوم المتبقية تصعّب معرفة الإعداد الفعلي." },
          step: "يتحقق المطوّر من مالك كل معرّف إضافي. يُوضع معرّف المتجر في متغير ثابت واحد تستخدمه كل وسوم المنصة، وتُحذف المعرّفات المجهولة والوسوم المتوقفة أو بلا مشغّل.",
          doneWhen: "تُظهر كل منصة معرّف المتجر فقط في الحاوية والبيانات المرسلة، دون وسوم متوقفة أو بلا مشغّل.",
        },
      },
      store_owner: {
        fail: { business: { summary: "التتبع عندك ممكن يرسل بيانات لحساب ما تستخدمه أو مو ملكك.", detail: "المبيعات اللي تروح هناك ما تظهر في تقاريرك، وممكن أحد ثاني يشوف مبيعاتك. والأكواد القديمة المتبقية تصعّب إدارة الإعداد." } },
      },
      media_buyer: {
        fail: { business: { summary: "الـ events ممكن تروح لـ ID قديم أو غريب، فالحساب اللي بتعمل فيه bidding بيتعلم من مبيعات أقل والـ ROAS المعروض أقل من الحقيقي.", detail: "كل hit بيروح لـ Pixel أو property تاني الحساب ده مش بيشوفه. اتأكد مع المتجر أنهي IDs بتاعته، ومطوّر المتجر يشيل الباقي." } },
      },
      agency: {
        fail: { business: { summary: "قد يرسل تتبع المتجر بيانات إلى حساب لا يستخدمه أو لا يملكه.", detail: "المبيعات المرسلة هناك تغيب عن تقارير المتجر، وقد يراها طرف آخر. يتحقق المتجر من مالك كل معرّف إضافي." } },
      },
    },
  },

  "TRK-30": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The visit found wa.me, api.whatsapp.com or tel: links, and a GTM tag fires on clicks to them, or GA4 has a WhatsApp or call click event in the last 28 days." },
          business: { summary: "WhatsApp and call taps are counted.", detail: "Shoppers who reach out to order show up in the reports, so the pages and ads that bring them get credit." },
          protect: "Re-check the click tracking when WhatsApp or call buttons are added or moved.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "The visit found wa.me, api.whatsapp.com or tel: links, but no GTM tag fires on clicks to them and GA4 has no WhatsApp or call click event in the last 28 days." },
          business: { summary: "WhatsApp and call taps aren't counted.", detail: "Shoppers who order through WhatsApp or a call look like visitors who left. The pages and ads that bring them get no credit, so their value is hidden." },
          step: "The developer adds a GTM tag on clicks to wa.me, api.whatsapp.com and tel: links that sends a whatsapp_click or call_click event to GA4, marks it as a key event, and sends it to the ad platforms as a contact or lead event.",
          doneWhen: "A test tap on the WhatsApp and call links shows whatsapp_click and call_click in GA4 DebugView.",
        },
      },
      store_owner: {
        fail: { business: { summary: "WhatsApp and call taps in your store aren't counted.", detail: "Shoppers who order through WhatsApp look like lost visitors. You can't see which pages and ads bring them in." } },
      },
      media_buyer: {
        fail: { business: { summary: "WhatsApp and call taps fire no event, so campaigns look like they sell less and reported ROAS reads lower than real.", detail: "Orders that start in WhatsApp give the platforms no signal, so ads that drive them look weak and can get cut. Once tracked, the tap can feed a contact or lead event. The store's developer adds the click tags." } },
      },
      agency: {
        fail: { business: { summary: "WhatsApp and call taps on the store aren't counted.", detail: "Shoppers who order through WhatsApp look like visitors who left. The pages and ads that bring them get no credit." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "وجدت الزيارة روابط wa.me أو api.whatsapp.com أو tel:، ويعمل وسم في GTM عند النقر عليها، أو يوجد في GA4 حدث نقر واتساب أو اتصال خلال آخر 28 يومًا." },
          business: { summary: "نقرات واتساب والاتصال تُحتسب.", detail: "المتسوقون الذين يتواصلون للطلب يظهرون في التقارير، فتُنسب القيمة للصفحات والإعلانات التي جلبتهم." },
          protect: "أعد فحص تتبع النقرات عند إضافة أزرار واتساب أو الاتصال أو نقلها.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "وجدت الزيارة روابط wa.me أو api.whatsapp.com أو tel:، لكن لا يعمل أي وسم في GTM عند النقر عليها، ولا يوجد في GA4 حدث نقر واتساب أو اتصال خلال آخر 28 يومًا." },
          business: { summary: "نقرات واتساب والاتصال لا تُحتسب.", detail: "المتسوقون الذين يطلبون عبر واتساب أو الاتصال يبدون كزوار غادروا. ولا تُنسب أي قيمة للصفحات والإعلانات التي جلبتهم." },
          step: "يضيف المطوّر وسمًا في GTM عند النقر على روابط wa.me و api.whatsapp.com و tel: يرسل حدث whatsapp_click أو call_click إلى GA4، ويحدده كحدث رئيسي، ويرسله إلى منصات الإعلان كحدث تواصل أو عميل محتمل.",
          doneWhen: "نقرة تجريبية على روابط واتساب والاتصال تُظهر whatsapp_click و call_click في DebugView في GA4.",
        },
      },
      store_owner: {
        fail: { business: { summary: "ضغطات واتساب والاتصال في متجرك ما تنحسب.", detail: "العميل اللي يطلب عن طريق واتساب يبين كأنه زائر طلع. فما تعرف أي صفحات وإعلانات تجيب لك هالعملاء." } },
      },
      media_buyer: {
        fail: { business: { summary: "ضغطات واتساب والاتصال مش بتبعت event، فالحملات بتبان إنها بتبيع أقل والـ ROAS المعروض أقل من الحقيقي.", detail: "الأوردرات اللي بتبدأ في واتساب مش بتدي المنصات أي signal، فالإعلانات اللي بتجيبها تبان ضعيفة وممكن تتقفل. لما تتتبع، الضغطة تقدر تغذي Contact أو Lead event. مطوّر المتجر يضيف الـ click tags." } },
      },
      agency: {
        fail: { business: { summary: "نقرات واتساب والاتصال في المتجر لا تُحتسب.", detail: "المتسوقون الذين يطلبون عبر واتساب يبدون كزوار غادروا. ولا تُنسب أي قيمة للصفحات والإعلانات التي جلبتهم." } },
      },
    },
  },

  "TRK-43": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "A Google Ads account is linked to this GA4 property." },
          business: { summary: "Google Ads is linked to GA4.", detail: "Google Ads can import GA4 purchases and audiences, so bidding works from the store's real sales data." },
          protect: "Re-check the link in GA4 Admin when the Google Ads account or its admin access changes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "No Google Ads account is linked to this GA4 property, so GA4 conversions and audiences can't be imported into Google Ads." },
          business: { summary: "Google Ads isn't linked to GA4.", detail: "Google Ads can't use GA4's sales data or audiences, so its bidding learns from less information than the store already collects." },
          step: "Someone with admin access to both links Google Ads in GA4 Admin, under Product links, then imports the GA4 purchase event into Google Ads as a primary conversion if the account has no Ads conversion tag of its own.",
          doneWhen: "GA4 Admin lists the Google Ads link, and Google Ads shows purchase as a primary conversion.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your Google Ads account isn't linked to GA4.", detail: "Google Ads can't use the sales data you already collect in GA4. Its bidding learns less, so you likely pay more for each sale than needed." } },
      },
      media_buyer: {
        fail: { business: { summary: "Google Ads isn't linked to GA4, so Smart Bidding learns from less signal than it could.", detail: "No GA4 conversion import and no GA4 audiences for remarketing or exclusions. Linking is expected to improve ROAS over time as bidding gets more sales data. Anyone with admin on both accounts can link them." } },
      },
      agency: {
        fail: { business: { summary: "The store's Google Ads isn't linked to GA4.", detail: "Google Ads can't use the sales data and audiences the store already collects in GA4, so bidding learns from less information." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "حساب Google Ads مرتبط بخاصية GA4 هذه." },
          business: { summary: "Google Ads مرتبط بـ GA4.", detail: "يستطيع Google Ads استيراد مشتريات GA4 وجماهيره، فتعمل المزايدة على بيانات مبيعات المتجر الحقيقية." },
          protect: "أعد فحص الربط في إعدادات GA4 عند تغيير حساب Google Ads أو صلاحيات المسؤول فيه.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "لا يوجد حساب Google Ads مرتبط بخاصية GA4 هذه، فلا يمكن استيراد تحويلات GA4 وجماهيره إلى Google Ads." },
          business: { summary: "Google Ads غير مرتبط بـ GA4.", detail: "لا يستطيع Google Ads استخدام بيانات المبيعات والجماهير في GA4، فتتعلم المزايدة من معلومات أقل مما يجمعه المتجر بالفعل." },
          step: "يربط شخص لديه صلاحية مسؤول في الحسابين Google Ads من إعدادات GA4 تحت روابط المنتجات، ثم يستورد حدث الشراء من GA4 إلى Google Ads كتحويل أساسي إذا لم يكن في الحساب وسم تحويل خاص به.",
          doneWhen: "تُظهر إعدادات GA4 ربط Google Ads، ويعرض Google Ads الشراء كتحويل أساسي.",
        },
      },
      store_owner: {
        fail: { business: { summary: "حساب Google Ads عندك مو مربوط بـ GA4.", detail: "Google Ads ما يقدر يستفيد من بيانات المبيعات اللي تجمعها في GA4. فيتعلم أقل، وغالبًا تدفع على كل بيعة أكثر من اللازم." } },
      },
      media_buyer: {
        fail: { business: { summary: "Google Ads مش مربوط بـ GA4، فالـ Smart Bidding بيتعلم من signal أقل من اللي ممكن.", detail: "مفيش import لـ conversions من GA4 ولا audiences من GA4 للـ remarketing أو الـ exclusions. الربط متوقع يحسّن الـ ROAS مع الوقت لما الـ bidding ياخد بيانات مبيعات أكتر. أي حد عنده admin على الحسابين يقدر يربطهم." } },
      },
      agency: {
        fail: { business: { summary: "حساب Google Ads الخاص بالمتجر غير مرتبط بـ GA4.", detail: "لا يستطيع Google Ads استخدام بيانات المبيعات والجماهير التي يجمعها المتجر في GA4، فتتعلم المزايدة من معلومات أقل." } },
      },
    },
  },

  "TRK-44": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The value sent with view_item and add_to_cart equals the price shown on the product page times quantity, and currency is the store's three-letter code in capitals." },
          business: { summary: "Each tracked product carries the right price and currency.", detail: "Sales figures in GA4 and the ad platforms match what shoppers actually pay." },
          protect: "Re-check event values after changing prices, currencies, discounts or the theme.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "The value sent with view_item or add_to_cart doesn't equal the shown price times quantity, or currency isn't the store's three-letter code in capitals. Platforms then record the wrong amount or reject the value." },
          business: { summary: "Tracked sales carry the wrong price or currency.", detail: "Every revenue figure in the reports is off, even when orders are fine. Decisions based on those figures, like which products or campaigns earn most, rest on wrong amounts." },
          step: "The developer sends value as a plain number equal to the shown price times quantity, and currency as the three-letter code the store charges in, such as SAR, on every ecommerce event.",
          doneWhen: "Our re-scan, or GTM Preview on a product page, shows the same price and the correct currency code in the event as on the page.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your tracking sends the wrong price or currency for your products.", detail: "Every sales figure in your reports is off, even when orders are fine. You can't trust which products or ads earn the most." } },
      },
      media_buyer: {
        fail: { business: { summary: "Event value or currency is wrong, so reported ROAS can read high or low and value bidding learns from bad numbers.", detail: "Value-based bidding and ROAS targets work from these amounts. A wrong currency can make each sale worth many times more or less than real. The store's developer fixes the value and currency fields." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "القيمة المرسلة مع view_item و add_to_cart تساوي السعر المعروض في صفحة المنتج مضروبًا في الكمية، والعملة هي رمز المتجر من ثلاثة أحرف كبيرة." },
          business: { summary: "كل منتج يُتتبع بالسعر والعملة الصحيحين.", detail: "أرقام المبيعات في GA4 ومنصات الإعلان تطابق ما يدفعه المتسوقون فعلًا." },
          protect: "أعد فحص قيم الأحداث بعد تغيير الأسعار أو العملات أو الخصومات أو القالب.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "القيمة المرسلة مع view_item أو add_to_cart لا تساوي السعر المعروض مضروبًا في الكمية، أو العملة ليست رمز المتجر من ثلاثة أحرف كبيرة. فتسجل المنصات مبلغًا خاطئًا أو ترفض القيمة." },
          business: { summary: "المبيعات المتتبَّعة تحمل سعرًا أو عملة خاطئة.", detail: "كل رقم إيرادات في التقارير غير دقيق، حتى لو كانت الطلبات سليمة. والقرارات المبنية عليه، مثل أي المنتجات أو الحملات تربح أكثر، تقوم على مبالغ خاطئة." },
          step: "يرسل المطوّر القيمة كرقم مجرد يساوي السعر المعروض مضروبًا في الكمية، والعملة كرمز من ثلاثة أحرف يبيع بها المتجر مثل SAR، في كل أحداث التجارة الإلكترونية.",
          doneWhen: "تُظهر إعادة الفحص، أو معاينة GTM في صفحة منتج، نفس السعر ورمز العملة الصحيح في الحدث كما في الصفحة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "التتبع عندك يرسل سعر أو عملة غلط لمنتجاتك.", detail: "كل أرقام المبيعات في تقاريرك مو دقيقة، حتى لو الطلبات سليمة. فما تقدر تعتمد عليها تعرف أي منتج أو إعلان يربح أكثر." } },
      },
      media_buyer: {
        fail: { business: { summary: "الـ value أو الـ currency في الـ events غلط، فالـ ROAS المعروض ممكن يطلع أعلى أو أقل والـ value bidding بيتعلم من أرقام غلط.", detail: "الـ value-based bidding وأهداف الـ ROAS بتشتغل على المبالغ دي. عملة غلط ممكن تخلي كل بيعة بقيمة أكبر أو أصغر بكتير من الحقيقي. مطوّر المتجر يصلح حقلي الـ value والـ currency." } },
      },
    },
  },

  "SPEED-08": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Only core tags fire on All Pages: the Google tag and consent tags. Other tags fire on the pages or events that need them." },
          business: { summary: "Pages load only the tracking they need.", detail: "Extra scripts stay off pages where they do nothing, which keeps pages lighter for shoppers on phones." },
          protect: "Give every new tag a page or event trigger instead of All Pages.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Tags beyond the Google tag and consent tags fire on All Pages. Each one loads its script on every page view, adding download and main-thread work where the tag may not be needed." },
          business: { summary: "Heavy tracking scripts load on every page.", detail: "Each extra script slows pages a little, most on phones. Slower pages lose shoppers before they see the products." },
          step: "The developer moves each non-core tag from All Pages to a trigger for the pages or events it needs, and removes tags nobody uses.",
          doneWhen: "Only the Google tag and consent tags fire on All Pages in GTM Preview.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Heavy tracking scripts load on every page of your store.", detail: "Each extra script slows your pages a little, most on phones. Slower pages lose shoppers before they reach your products." } },
      },
      media_buyer: {
        fail: { business: { summary: "Heavy tags load on every page, so landing pages are slower and paid CVR likely suffers.", detail: "Extra scripts on the landing page add load time right after the ad click. More visitors bounce before the page shows, which pushes CPA up on the same spend. The store's developer narrows the tag triggers." } },
      },
      agency: {
        fail: { business: { summary: "Heavy tracking scripts load on every page of the store.", detail: "Each extra script slows pages a little, most on phones. Slower pages lose shoppers before they reach the products." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "لا يعمل على كل الصفحات إلا الوسوم الأساسية: وسم Google ووسوم الموافقة. وتعمل الوسوم الأخرى في الصفحات أو الأحداث التي تحتاجها." },
          business: { summary: "الصفحات تحمّل التتبع الذي تحتاجه فقط.", detail: "السكربتات الإضافية تبقى خارج الصفحات التي لا تفيد فيها، فتبقى الصفحات أخف على متسوقي الجوال." },
          protect: "اربط كل وسم جديد بمشغّل صفحة أو حدث بدلًا من كل الصفحات.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "تعمل على كل الصفحات وسوم غير وسم Google ووسوم الموافقة. كل منها يحمّل السكربت الخاص به في كل مشاهدة صفحة، فيضيف تحميلًا وعملًا على المعالج حيث قد لا يلزم." },
          business: { summary: "سكربتات تتبع ثقيلة تُحمَّل في كل صفحة.", detail: "كل سكربت إضافي يبطئ الصفحات قليلًا، خاصة على الجوال. والصفحات الأبطأ تخسر متسوقين قبل أن يروا المنتجات." },
          step: "ينقل المطوّر كل وسم غير أساسي من كل الصفحات إلى مشغّل للصفحات أو الأحداث التي يحتاجها، ويحذف الوسوم غير المستخدمة.",
          doneWhen: "لا يعمل على كل الصفحات في معاينة GTM إلا وسم Google ووسوم الموافقة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "سكربتات تتبع ثقيلة تنحمّل في كل صفحة من متجرك.", detail: "كل سكربت زيادة يبطّئ صفحاتك شوي، خصوصًا على الجوال. والصفحة البطيئة تخسرك عملاء قبل لا يوصلون لمنتجاتك." } },
      },
      media_buyer: {
        fail: { business: { summary: "Tags تقيلة بتتحمل في كل صفحة، فالـ landing pages أبطأ والـ CVR من الإعلانات غالبًا بيتأثر.", detail: "السكربتات الزيادة في الـ landing page بتزود وقت التحميل بعد الكليك على طول. زوار أكتر بيمشوا قبل ما الصفحة تظهر، وده بيرفع الـ CPA على نفس الصرف. مطوّر المتجر يضيّق الـ triggers." } },
      },
      agency: {
        fail: { business: { summary: "سكربتات تتبع ثقيلة تُحمَّل في كل صفحة من المتجر.", detail: "كل سكربت إضافي يبطئ الصفحات قليلًا، خاصة على الجوال. والصفحات الأبطأ تخسر متسوقين قبل أن يصلوا إلى المنتجات." } },
      },
    },
  },

  "SEO-06": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Where the product page clearly shows one price, the Product schema price equals it; where it shows stock status, schema availability matches." },
          business: { summary: "Google sees the same price and stock as shoppers.", detail: "Matching data keeps products eligible for free Google Shopping listings and rich results." },
          protect: "Re-check the schema after changing the theme, price display or stock apps.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "The Product schema price differs from the one price clearly shown on the page, or schema availability differs from the shown stock status. Google reads the schema, so it sees data the shopper doesn't." },
          business: { summary: "Google sees a different price or stock status than shoppers do.", detail: "Google can drop products from free Shopping listings or disapprove them in Shopping ads when page data disagrees. Shoppers who click a listing with a different price may also lose trust." },
          step: "The developer makes the Product schema read the live price and stock from the same source the page shows, including sale prices and the selected variant.",
          doneWhen: "Google's Rich Results Test on a product page shows the same price and stock as the visible page.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Google sees a different price or stock for your products than shoppers do.", detail: "Google can remove your products from its free Shopping listings when the data doesn't match. A shopper who sees one price on Google and another on your page may not buy." } },
      },
      media_buyer: {
        fail: { business: { summary: "Product schema price or stock doesn't match the page, so Shopping products risk disapproval and reach drops.", detail: "Merchant Center checks page data against the feed and schema. Disapproved products stop serving in Shopping and Performance Max, so spend shifts to fewer products. The store's developer fixes the schema." } },
      },
      agency: {
        fail: { business: { summary: "Google sees a different price or stock for the store's products than shoppers do.", detail: "Google can drop products from free Shopping listings or disapprove them in ads when page data disagrees. A price mismatch can also cost trust at the click." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "عندما تعرض صفحة المنتج سعرًا واحدًا بوضوح، يساويه السعر في بيانات Product المنظمة، وعندما تعرض حالة المخزون، تطابقها قيمة availability." },
          business: { summary: "Google يرى نفس السعر والمخزون الذي يراه المتسوق.", detail: "تطابق البيانات يُبقي المنتجات مؤهلة لقوائم Google Shopping المجانية والنتائج المميزة." },
          protect: "أعد فحص البيانات المنظمة بعد تغيير القالب أو طريقة عرض السعر أو تطبيقات المخزون.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "السعر في بيانات Product المنظمة يختلف عن السعر الواحد المعروض بوضوح في الصفحة، أو قيمة availability تختلف عن حالة المخزون المعروضة. يقرأ Google البيانات المنظمة، فيرى بيانات لا يراها المتسوق." },
          business: { summary: "Google يرى سعرًا أو حالة مخزون مختلفة عما يراه المتسوق.", detail: "قد يحذف Google المنتجات من قوائم Shopping المجانية أو يرفضها في إعلانات Shopping عندما تختلف بيانات الصفحة. والمتسوق الذي ينقر على قائمة بسعر مختلف قد يفقد الثقة." },
          step: "يجعل المطوّر بيانات Product المنظمة تقرأ السعر والمخزون الحاليين من نفس مصدر الصفحة، بما فيها أسعار التخفيض والخيار المحدد.",
          doneWhen: "يُظهر اختبار النتائج المميزة من Google في صفحة منتج نفس السعر والمخزون الظاهرين في الصفحة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Google يشوف سعر أو مخزون لمنتجاتك غير اللي يشوفه العميل.", detail: "Google ممكن يشيل منتجاتك من قوائم Shopping المجانية إذا البيانات ما تطابقت. والعميل اللي يشوف سعر في Google وسعر ثاني في صفحتك ممكن ما يشتري." } },
      },
      media_buyer: {
        fail: { business: { summary: "سعر أو مخزون الـ Product schema مش مطابق للصفحة، فمنتجات Shopping معرضة للـ disapproval والـ reach بيقل.", detail: "Merchant Center بيقارن بيانات الصفحة بالـ feed والـ schema. المنتجات المرفوضة بتقف في Shopping و Performance Max، فالصرف بيتركز على منتجات أقل. مطوّر المتجر يصلح الـ schema." } },
      },
      agency: {
        fail: { business: { summary: "Google يرى سعرًا أو مخزونًا لمنتجات المتجر مختلفًا عما يراه المتسوق.", detail: "قد يحذف Google المنتجات من قوائم Shopping المجانية أو يرفضها في الإعلانات عندما تختلف بيانات الصفحة. واختلاف السعر قد يُفقد الثقة عند النقر." } },
      },
    },
  },

  "RISK-01": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "No email or phone number found in page URLs, GA4 page paths, query strings of pixel or GA4 hits, or as plain text in any GTM tag parameter." },
          business: { summary: "No customer emails or phone numbers are sent to trackers.", detail: "GA4 and the ad platforms receive no personal data in the clear, which keeps the store within Google's and the platforms' data rules." },
          protect: "Check new forms, account pages and tags for personal data in URLs or tag fields before they go live.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "An email or phone number appears in a page URL, a GA4 page path, a pixel or GA4 hit's query string, or as plain text in a GTM tag parameter. Google's terms forbid sending personal data to GA4, and pixels may flag or drop such events." },
          business: { summary: "Customer emails or phone numbers are sent to tracking tools.", detail: "Google can delete a GA4 property's data when it holds personal data, and the store would lose its sales history. Ad platforms can also restrict events that carry it." },
          step: "The developer stops forms and pages from putting emails or phone numbers in URLs, removes plain personal data from GTM tag fields (or hashes it where a platform asks for hashed data), and turns on email and query redaction in the GA4 data stream.",
          doneWhen: "No emails or phone numbers appear in GA4 page paths, page URLs or tracking hits on a test run through the forms.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your customers' emails or phone numbers are sent to tracking tools.", detail: "Google can delete your GA4 data for this, and you would lose your sales history. It also puts your customers' details where they shouldn't be." } },
      },
      media_buyer: {
        fail: { business: { summary: "Personal data goes out in URLs or tag fields, so platforms can flag or restrict events and the signal campaigns optimise on shrinks.", detail: "Meta and others can block or strip events that carry emails or phone numbers in the clear. Check Events Manager for data warnings. The store's developer removes the data or hashes it properly." } },
      },
      agency: {
        fail: { business: { summary: "The store's customer emails or phone numbers are sent to tracking tools.", detail: "Google can delete a GA4 property's data for this, and the store would lose its sales history. Ad platforms can also restrict those events." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "لم نجد بريدًا إلكترونيًا أو رقم هاتف في روابط الصفحات أو مسارات الصفحات في GA4 أو معاملات بيانات البكسل و GA4، ولا كنص صريح في أي حقل وسم في GTM." },
          business: { summary: "لا تُرسَل عناوين بريد أو أرقام هواتف العملاء إلى أدوات التتبع.", detail: "لا يستقبل GA4 ومنصات الإعلان بيانات شخصية صريحة، فيبقى المتجر ضمن قواعد Google والمنصات." },
          protect: "افحص النماذج وصفحات الحساب والوسوم الجديدة بحثًا عن بيانات شخصية في الروابط أو حقول الوسوم قبل تشغيلها.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "يظهر بريد إلكتروني أو رقم هاتف في رابط صفحة أو مسار صفحة في GA4 أو معاملات بيانات بكسل أو GA4، أو كنص صريح في حقل وسم في GTM. شروط Google تمنع إرسال بيانات شخصية إلى GA4، وقد تحجب البكسلات هذه الأحداث." },
          business: { summary: "عناوين بريد أو أرقام هواتف العملاء تُرسَل إلى أدوات التتبع.", detail: "قد يحذف Google بيانات خاصية GA4 التي تحمل بيانات شخصية، فيفقد المتجر سجل مبيعاته. وقد تقيّد منصات الإعلان الأحداث التي تحملها." },
          step: "يمنع المطوّر النماذج والصفحات من وضع البريد أو الهاتف في الروابط، ويحذف البيانات الشخصية الصريحة من حقول وسوم GTM (أو يشفّرها حيث تطلب المنصة بيانات مشفرة)، ويفعّل إخفاء البريد ومعاملات الرابط في مصدر بيانات GA4.",
          doneWhen: "لا يظهر بريد أو رقم هاتف في مسارات الصفحات في GA4 أو الروابط أو بيانات التتبع عند تجربة النماذج.",
        },
      },
      store_owner: {
        fail: { business: { summary: "إيميلات أو أرقام جوالات عملائك توصل لأدوات التتبع.", detail: "Google ممكن يحذف بيانات GA4 حقتك بسبب هذا، وتخسر سجل مبيعاتك. وفوق كذا بيانات عملائك تروح لمكان ما المفروض تروح له." } },
      },
      media_buyer: {
        fail: { business: { summary: "بيانات شخصية طالعة في الـ URLs أو حقول الـ tags، فالمنصات ممكن تعمل flag أو تقيّد الـ events والـ signal اللي الحملات بتعمل عليه optimization بيقل.", detail: "Meta وغيرها ممكن تحجب أو تشيل الـ events اللي فيها إيميلات أو أرقام صريحة. شوف تحذيرات البيانات في Events Manager. مطوّر المتجر يشيل البيانات أو يعملها hashing صح." } },
      },
      agency: {
        fail: { business: { summary: "عناوين بريد أو أرقام هواتف عملاء المتجر تُرسَل إلى أدوات التتبع.", detail: "قد يحذف Google بيانات خاصية GA4 بسبب ذلك، فيفقد المتجر سجل مبيعاته. وقد تقيّد منصات الإعلان هذه الأحداث." } },
      },
    },
  },

  "RISK-03": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The consent default fires on Consent Initialization; after refusing, no ad pixel hits were sent; after accepting, consent signals were granted." },
          business: { summary: "The consent banner works before and after the shopper's choice.", detail: "Tracking follows each shopper's answer, so the store keeps both its data and its compliance." },
          protect: "Re-test refuse and accept after any change to the banner, its app or GTM.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "The consent default doesn't fire on Consent Initialization, or ad pixel hits were sent after refusing, or consent signals stayed denied after accepting. A late default lets early tags fire without a consent state." },
          business: { summary: "The consent banner doesn't control tracking the way the shopper chose.", detail: "If tags fire after a refusal, the store is exposed to complaints where consent is required. If they stay blocked after acceptance, real sales go missing from reports and ad platforms." },
          step: "The developer moves the consent default tag to the Consent Initialization trigger, makes every ad tag wait for ad_storage, and checks that the banner's accept button updates consent to granted.",
          doneWhen: "In GTM Preview the consent default fires before any other tag, no ad hits are sent after refusing, and consent shows granted after accepting.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your consent banner doesn't control tracking the way shoppers chose.", detail: "Tracking after a refusal can bring complaints from customers in regions that require consent. Blocking after an accept hides real sales from your reports." } },
      },
      media_buyer: {
        fail: { business: { summary: "Consent state on live hits blocks or ignores ad tags, so reported ROAS can read lower than real when tags are over-blocked.", detail: "Tags stuck on denied after an accept hide real sales from every platform and leave Google's modelling less to work with. Tags firing after a refusal are a compliance risk for the store. The store's developer fixes the consent order and triggers." } },
      },
      agency: {
        fail: { business: { summary: "The store's consent banner doesn't control tracking the way the shopper chose.", detail: "Tags firing after a refusal expose the store to complaints where consent is required. Tags blocked after an accept hide real sales from reports and ad platforms." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "إعداد الموافقة الافتراضي يعمل على مشغّل Consent Initialization، وبعد الرفض لم تُرسل أي بيانات لبكسلات الإعلانات، وبعد القبول مُنحت إشارات الموافقة." },
          business: { summary: "شريط الموافقة يعمل قبل اختيار المتسوق وبعده.", detail: "يتبع التتبع إجابة كل متسوق، فيحافظ المتجر على بياناته والتزامه معًا." },
          protect: "أعد اختبار الرفض والقبول بعد أي تغيير في الشريط أو تطبيقه أو GTM.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "إعداد الموافقة الافتراضي لا يعمل على Consent Initialization، أو أُرسلت بيانات بكسلات إعلانية بعد الرفض، أو بقيت إشارات الموافقة مرفوضة بعد القبول. الإعداد المتأخر يسمح لوسوم مبكرة بالعمل دون حالة موافقة." },
          business: { summary: "شريط الموافقة لا يتحكم في التتبع كما اختار المتسوق.", detail: "إذا عملت الوسوم بعد الرفض، يتعرض المتجر لشكاوى في المناطق التي تتطلب الموافقة. وإذا بقيت محجوبة بعد القبول، تغيب مبيعات حقيقية عن التقارير ومنصات الإعلان." },
          step: "ينقل المطوّر وسم الموافقة الافتراضي إلى مشغّل Consent Initialization، ويجعل كل وسم إعلاني ينتظر ad_storage، ويتحقق من أن زر القبول في الشريط يحدّث الموافقة إلى ممنوحة.",
          doneWhen: "في معاينة GTM يعمل إعداد الموافقة الافتراضي قبل أي وسم آخر، ولا تُرسل بيانات إعلانية بعد الرفض، وتظهر الموافقة ممنوحة بعد القبول.",
        },
      },
      store_owner: {
        fail: { business: { summary: "شريط الموافقة في متجرك ما يتحكم في التتبع حسب اختيار العميل.", detail: "التتبع بعد الرفض ممكن يجيب لك شكاوى من عملاء في مناطق تشترط الموافقة. والحجب بعد القبول يخفي مبيعات حقيقية من تقاريرك." } },
      },
      media_buyer: {
        fail: { business: { summary: "حالة الـ consent على الـ hits بتحجب أو بتتجاهل الـ ad tags، فالـ ROAS المعروض ممكن يبقى أقل من الحقيقي لما الحجب زيادة.", detail: "Tags واقفة على denied بعد القبول بتخفي مبيعات حقيقية عن كل المنصات وبتقلل اللي الـ modelling بتاع Google يشتغل عليه. وtags شغالة بعد الرفض خطر compliance على المتجر. مطوّر المتجر يصلح ترتيب الـ consent والـ triggers." } },
      },
      agency: {
        fail: { business: { summary: "شريط الموافقة في المتجر لا يتحكم في التتبع كما اختار المتسوق.", detail: "الوسوم التي تعمل بعد الرفض تعرّض المتجر لشكاوى في المناطق التي تتطلب الموافقة. والوسوم المحجوبة بعد القبول تُخفي مبيعات حقيقية عن التقارير ومنصات الإعلان." } },
      },
    },
  },

  "RISK-05": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Price text and the Add to Cart button pass WCAG AA contrast: 4.5:1 for normal text, 3:1 for large text." },
          business: { summary: "The price and the buy button are easy to read.", detail: "Shoppers can see what the product costs and where to tap, also outdoors and on dim phone screens." },
          protect: "Check price and button contrast when changing brand colours or the theme.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Price text or the Add to Cart button falls below WCAG AA contrast: 4.5:1 for normal text, 3:1 for large text. Low contrast is hardest to read in sunlight and on dim screens." },
          business: { summary: "The price or the buy button is hard to read.", detail: "Shoppers who can't read the price or spot the button hesitate or leave. The two things every buyer needs on the product page are the ones affected." },
          step: "The designer or developer darkens the price text and the button colour, or lightens their background, until both pass WCAG AA.",
          doneWhen: "A contrast checker shows at least 4.5:1 for the price and button text (3:1 if large).",
        },
      },
      store_owner: {
        fail: { business: { summary: "The price or the Add to Cart button in your store is hard to read.", detail: "Shoppers who can't read the price or find the button hesitate or leave. These are the two things every buyer needs before ordering." } },
      },
      media_buyer: {
        fail: { business: { summary: "Price or Add to Cart text is low contrast, so product page CVR likely runs lower than it should.", detail: "Paid visitors land on the product page and need the price and button first. If either is hard to read, more of them leave, which raises CPA on the same spend. The store's designer or developer fixes the colours." } },
      },
      agency: {
        fail: { business: { summary: "The price or the Add to Cart button on the store is hard to read.", detail: "Shoppers who can't read the price or spot the button hesitate or leave. Both are what every buyer needs on the product page." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "نص السعر وزر الإضافة للسلة يحققان تباين WCAG AA: نسبة 4.5:1 للنص العادي و 3:1 للنص الكبير." },
          business: { summary: "السعر وزر الشراء سهلا القراءة.", detail: "يرى المتسوق كم يكلف المنتج وأين يضغط، حتى في الضوء الخارجي وعلى شاشات الجوال الخافتة." },
          protect: "افحص تباين السعر والزر عند تغيير ألوان العلامة أو القالب.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "نص السعر أو زر الإضافة للسلة أقل من تباين WCAG AA: نسبة 4.5:1 للنص العادي و 3:1 للنص الكبير. التباين المنخفض أصعب في القراءة تحت الشمس وعلى الشاشات الخافتة." },
          business: { summary: "السعر أو زر الشراء صعب القراءة.", detail: "المتسوق الذي لا يقرأ السعر أو لا يجد الزر يتردد أو يغادر. وهما أهم عنصرين يحتاجهما كل مشترٍ في صفحة المنتج." },
          step: "يغمّق المصمم أو المطوّر لون نص السعر ولون الزر، أو يفتّح خلفيتهما، حتى يحققا WCAG AA.",
          doneWhen: "تُظهر أداة فحص التباين نسبة 4.5:1 على الأقل لنص السعر والزر (3:1 للنص الكبير).",
        },
      },
      store_owner: {
        fail: { business: { summary: "السعر أو زر أضف للسلة في متجرك صعب ينقرأ.", detail: "العميل اللي ما يقدر يقرأ السعر أو يلقى الزر يتردد أو يطلع. وهذولي أهم شيئين يحتاجهم أي مشتري قبل لا يطلب." } },
      },
      media_buyer: {
        fail: { business: { summary: "نص السعر أو زرار Add to Cart تباينه ضعيف، فالـ CVR في صفحة المنتج غالبًا أقل من اللازم.", detail: "الزوار المدفوعين بيوصلوا لصفحة المنتج ومحتاجين السعر والزرار الأول. لو أي واحد فيهم صعب يتقري، ناس أكتر بتمشي، وده بيرفع الـ CPA على نفس الصرف. مصمم أو مطوّر المتجر يصلح الألوان." } },
      },
      agency: {
        fail: { business: { summary: "السعر أو زر الإضافة للسلة في المتجر صعب القراءة.", detail: "المتسوق الذي لا يقرأ السعر أو لا يجد الزر يتردد أو يغادر. وكلاهما يحتاجه كل مشترٍ في صفحة المنتج." } },
      },
    },
  },

  "RISK-08": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "After scrolling each audited page, no visible image had naturalWidth 0 and no empty block was taller than 600px." },
          business: { summary: "Pages show no broken images or large empty gaps.", detail: "Shoppers see complete pages, which keeps the store looking cared for." },
          protect: "Scroll through the main pages on a phone after theme, app or image changes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "After scrolling, at least one visible image had naturalWidth 0, meaning it failed to load, or an empty block taller than 600px appeared on an audited page. Typical causes are deleted image files, wrong image URLs, or app and section blocks that render nothing." },
          business: { summary: "Some pages show broken images or large empty gaps.", detail: "A missing picture or a blank stretch makes the store look unfinished. Shoppers trust it less and may leave before they reach the products." },
          step: "The developer replaces or re-uploads the broken images and removes or fixes the sections that leave empty space.",
          doneWhen: "Scrolling each audited page on a phone shows every image loaded and no empty gap taller than 600px.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some pages in your store show broken images or large empty gaps.", detail: "A missing picture or a blank space makes your store look unfinished. Shoppers trust it less and may leave before buying." } },
      },
      media_buyer: {
        fail: { business: { summary: "Landing pages show broken images or empty gaps, so paid visitors trust the store less and CVR likely suffers.", detail: "A broken or half-empty page right after the ad click makes more visitors bounce. That raises CPA on the same spend. The store's developer fixes the images and sections." } },
      },
      agency: {
        fail: { business: { summary: "Some pages on the store show broken images or large empty gaps.", detail: "A missing picture or a blank stretch makes the store look unfinished, so shoppers trust it less and may leave." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "بعد التمرير في كل صفحة مفحوصة، لم تظهر صورة مرئية بقيمة naturalWidth تساوي 0، ولا مساحة فارغة أطول من 600px." },
          business: { summary: "الصفحات خالية من الصور المعطلة والفراغات الكبيرة.", detail: "يرى المتسوق صفحات مكتملة، فيبدو المتجر معتنى به." },
          protect: "مرّر في الصفحات الرئيسية على الجوال بعد تغيير القالب أو التطبيقات أو الصور.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "بعد التمرير، ظهرت صورة مرئية واحدة على الأقل بقيمة naturalWidth تساوي 0، أي أنها لم تُحمَّل، أو مساحة فارغة أطول من 600px في صفحة مفحوصة. الأسباب المعتادة ملفات صور محذوفة أو روابط صور خاطئة أو أقسام وتطبيقات لا تعرض شيئًا." },
          business: { summary: "بعض الصفحات تعرض صورًا معطلة أو فراغات كبيرة.", detail: "الصورة المفقودة أو المساحة الفارغة تجعل المتجر يبدو غير مكتمل. فتقل ثقة المتسوق وقد يغادر قبل أن يصل إلى المنتجات." },
          step: "يستبدل المطوّر الصور المعطلة أو يعيد رفعها، ويحذف أو يصلح الأقسام التي تترك مساحة فارغة.",
          doneWhen: "التمرير في كل صفحة مفحوصة على الجوال يُظهر كل الصور محمّلة ولا فراغ أطول من 600px.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بعض صفحات متجرك فيها صور خربانة أو فراغات كبيرة.", detail: "الصورة الناقصة أو المساحة الفاضية تخلي متجرك يبين ناقص. فالعميل يثق فيه أقل وممكن يطلع قبل لا يشتري." } },
      },
      media_buyer: {
        fail: { business: { summary: "الـ landing pages فيها صور بايظة أو فراغات، فالزوار المدفوعين بيثقوا في المتجر أقل والـ CVR غالبًا بيتأثر.", detail: "صفحة بايظة أو نصها فاضي بعد الكليك على طول بتخلي زوار أكتر يعملوا bounce. وده بيرفع الـ CPA على نفس الصرف. مطوّر المتجر يصلح الصور والأقسام." } },
      },
      agency: {
        fail: { business: { summary: "بعض صفحات المتجر تعرض صورًا معطلة أو فراغات كبيرة.", detail: "الصورة المفقودة أو المساحة الفارغة تجعل المتجر يبدو غير مكتمل، فتقل ثقة المتسوق وقد يغادر." } },
      },
    },
  },

  "RISK-11": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Body text is at least 16px on phone and its contrast meets 4.5:1." },
          business: { summary: "Text is easy to read on a phone.", detail: "Shoppers can read product details and policies without zooming, which keeps them moving toward the cart." },
          protect: "Check text size and colour on a phone after theme or font changes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Body text is under 16px on phone, or its contrast is below 4.5:1. Either makes shoppers zoom or squint to read product details." },
          business: { summary: "Text is hard to read on a phone.", detail: "Shoppers who have to zoom or squint skip the details that answer their questions, like sizes, delivery and returns. Some give up before adding to cart." },
          step: "The developer sets body text to at least 16px on phone in the theme, and darkens light grey text until it reaches 4.5:1 contrast.",
          doneWhen: "On a phone, body text measures 16px or more and a contrast checker shows at least 4.5:1.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Text in your store is hard to read on a phone.", detail: "Shoppers who have to zoom or squint skip details like sizes, delivery and returns. Some give up before adding to cart." } },
      },
      media_buyer: {
        fail: { business: { summary: "Body text is small or low contrast on phone, so mobile CVR likely runs lower than it should.", detail: "Most paid social clicks land on phones. Hard-to-read details slow shoppers down and more of them leave, which pushes CPA up. The store's developer fixes text size and colour in the theme." } },
      },
      agency: {
        fail: { business: { summary: "Text on the store is hard to read on a phone.", detail: "Shoppers who have to zoom or squint skip details like sizes, delivery and returns, and some give up before adding to cart." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "حجم نص المحتوى 16px على الأقل على الجوال وتباينه يحقق 4.5:1." },
          business: { summary: "النص سهل القراءة على الجوال.", detail: "يقرأ المتسوق تفاصيل المنتج والسياسات دون تكبير، فيستمر في طريقه إلى السلة." },
          protect: "افحص حجم النص ولونه على الجوال بعد تغيير القالب أو الخط.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "حجم نص المحتوى أقل من 16px على الجوال، أو تباينه أقل من 4.5:1. وكلاهما يجبر المتسوق على التكبير أو التدقيق لقراءة تفاصيل المنتج." },
          business: { summary: "النص صعب القراءة على الجوال.", detail: "المتسوق الذي يضطر للتكبير أو التدقيق يتجاوز التفاصيل التي تجيب أسئلته، مثل المقاسات والتوصيل والإرجاع. وبعضهم يترك قبل الإضافة للسلة." },
          step: "يضبط المطوّر نص المحتوى على 16px على الأقل للجوال في القالب، ويغمّق النص الرمادي الفاتح حتى يصل التباين إلى 4.5:1.",
          doneWhen: "على الجوال، حجم نص المحتوى 16px أو أكثر وتُظهر أداة فحص التباين نسبة 4.5:1 على الأقل.",
        },
      },
      store_owner: {
        fail: { business: { summary: "الكلام في متجرك صعب ينقرأ على الجوال.", detail: "العميل اللي يضطر يكبّر أو يدقق يتجاوز تفاصيل مثل المقاسات والتوصيل والإرجاع. وبعضهم يترك قبل لا يضغط أضف للسلة." } },
      },
      media_buyer: {
        fail: { business: { summary: "نص الصفحة صغير أو تباينه ضعيف على الموبايل، فالـ CVR على الموبايل غالبًا أقل من اللازم.", detail: "أغلب كليكات السوشيال المدفوعة بتوصل على الموبايل. التفاصيل الصعبة في القراءة بتبطّأ الزوار وناس أكتر بتمشي، وده بيرفع الـ CPA. مطوّر المتجر يصلح حجم النص ولونه في القالب." } },
      },
      agency: {
        fail: { business: { summary: "النص في المتجر صعب القراءة على الجوال.", detail: "المتسوق الذي يضطر للتكبير أو التدقيق يتجاوز تفاصيل مثل المقاسات والتوصيل والإرجاع، وبعضهم يترك قبل الإضافة للسلة." } },
      },
    },
  },
};
