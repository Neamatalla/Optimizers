import type { PointTemplate } from "./types.js";

export const BUYING_PATH: Record<string, PointTemplate> = {
  "PATH-08": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Every wa.me, api.whatsapp.com and tel: link found on the visited pages carries 8 to 15 digits with the country code: {links}." },
          business: { summary: "Your WhatsApp and call buttons reach you.", detail: "A shopper with a question before buying can message or call you in one tap." },
          protect: "Keep the full number with the country code when you change the WhatsApp button or app.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "These links have a missing or short number, so WhatsApp or the dialler opens with nothing to reach: {broken}." },
          business: { summary: "Your WhatsApp or call button doesn't reach you.", detail: "A shopper who taps it to ask before buying gets an error or a blank chat, and many leave instead of trying again." },
          step: "Fix the WhatsApp or phone link to the full international number, for example https://wa.me/9665XXXXXXXX.",
          doneWhen: "Tapping the button on a phone opens a chat or call with your number.",
        },
      },
      media_buyer: {
        fail: { business: { summary: "The WhatsApp button paid visitors use to ask before buying is broken, so those clicks are wasted.", detail: "In the Gulf many shoppers message before a first order. A broken link turns those ready-to-buy clicks into bounces, which raises CPA. Forward this to the store owner: it is a one-line fix in the store settings." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "روابط واتساب والاتصال تحمل الرقم الدولي كاملًا.", detail: "{links}" },
          business: { summary: "زر واتساب والاتصال يصل إليك.", detail: "العميل الذي لديه سؤال قبل الشراء يراسلك أو يتصل بك بضغطة واحدة." },
          protect: "احتفظ بالرقم كاملًا مع رمز الدولة عند تغيير زر واتساب أو تطبيقه.",
        },
        fail: {
          technical: { summary: "رابط واتساب أو اتصال برقم ناقص أو قصير.", detail: "{broken}" },
          business: { summary: "زر واتساب أو الاتصال لا يصل إليك.", detail: "العميل الذي يضغطه ليسأل قبل الشراء يرى خطأ أو محادثة فارغة، وكثيرون يغادرون بدل المحاولة مرة أخرى." },
          step: "صحّح رابط واتساب أو الهاتف إلى الرقم الدولي كاملًا، مثل https://wa.me/9665XXXXXXXX.",
          doneWhen: "الضغط على الزر من الجوال يفتح محادثة أو اتصالًا برقمك.",
        },
      },
      store_owner: {
        pass: { business: { summary: "زر الواتساب والاتصال في متجرك شغال ويوصلك.", detail: "أي عميل عنده سؤال قبل ما يشتري يقدر يراسلك بضغطة وحدة." } },
        fail: { business: { summary: "زر الواتساب أو الاتصال في متجرك ما يوصلك.", detail: "العميل اللي يبي يسأل قبل الشراء يطلع له خطأ أو محادثة فاضية، وكثير منهم يطلعون بدون ما يشترون." } },
      },
      media_buyer: {
        fail: { business: { summary: "زرار الواتساب اللي الزوار المدفوعين بيسألوا منه قبل الشراء بايظ، فالكليكات دي ضايعة.", detail: "في الخليج ناس كتير بتسأل على واتساب قبل أول أوردر. اللينك البايظ بيحوّل الكليكات الجاهزة للشراء لـ bounce وبيرفع الـ CPA. ابعت النقطة دي لصاحب المتجر: تصليحها سطر واحد في الإعدادات." } },
      },
    },
  },
  // PATH-02: collect.ts path02. Fail facts hold only the page(s) that threw
  // ({cart} and/or {checkout}), so fail text uses no slots.
  "PATH-02": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "With an item in the cart, we opened the cart page and the first checkout screen on a phone and logged uncaught errors from the store's own code and the platform. Errors from other sites' scripts and bare \"Script error.\" lines don't count." },
          business: { summary: "The cart and checkout open cleanly.", detail: "Shoppers who chose to buy reach the payment step without a broken page in the way." },
          protect: "Open the cart and checkout on a phone after every theme or app change, and check the browser console for red errors.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "The error comes from the store's own scripts or the platform. An uncaught error stops the rest of that script, so buttons such as quantity, discount code or checkout can stop responding." },
          business: { summary: "The cart or checkout page has an error in its code.", detail: "These shoppers already decided to buy. An error here can stop a button working, and the order is lost at the last step." },
          step: "Send the error to your developer. They open the cart and checkout on a phone, read the browser console, and fix the errors coming from the theme or store code.",
          doneWhen: "With an item in the cart, the cart page and the first checkout screen load with no uncaught error from the store's own code in the browser console.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your cart or checkout page has an error in its code.", detail: "These shoppers already picked a product and want to pay. An error can stop the checkout button working. Each one lost here is a sale you nearly had." } },
      },
      media_buyer: {
        fail: { business: { summary: "The cart or checkout throws a code error, so paid shoppers who already added to cart can fail to finish and CVR drops.", detail: "This is the step closest to the order, after you paid for the click and won the add. Lower CVR on the same spend raises CPA. The store's developer fixes it: forward this to them." } },
      },
      agency: {
        fail: { business: { summary: "The store's cart or checkout page has an error in its code.", detail: "These shoppers already decided to buy. An error here can stop a button working, and the store loses the order at the last step." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "صفحة السلة وأول شاشة دفع تُحمَّلان دون أخطاء برمجية غير معالجة من كود المتجر.", detail: "فتحنا السلة وفيها منتج وأول شاشة دفع على الجوال، وسجّلنا الأخطاء غير المعالجة من كود المتجر والمنصة. لا تُحسب أخطاء سكربتات المواقع الأخرى ولا أسطر \"Script error.\" المجردة." },
          business: { summary: "السلة وصفحة الدفع تفتحان بلا أخطاء.", detail: "العميل الذي قرر الشراء يصل إلى خطوة الدفع دون صفحة معطلة في طريقه." },
          protect: "افتح السلة والدفع على الجوال بعد كل تغيير في القالب أو التطبيقات، وراجع وحدة التحكم في المتصفح بحثًا عن أخطاء.",
        },
        fail: {
          technical: { summary: "صفحة السلة أو أول شاشة دفع تُطلق خطأً برمجيًا غير معالج من كود المتجر.", detail: "الخطأ صادر من سكربتات المتجر أو المنصة. الخطأ غير المعالج يوقف بقية السكربت، فقد تتوقف أزرار مثل الكمية أو كود الخصم أو إتمام الطلب عن العمل." },
          business: { summary: "صفحة السلة أو الدفع فيها خطأ برمجي.", detail: "هؤلاء العملاء قرروا الشراء بالفعل. الخطأ هنا قد يعطّل زرًا، فيضيع الطلب في الخطوة الأخيرة." },
          step: "أرسل الخطأ إلى المطوّر ليفتح السلة والدفع على الجوال، ويقرأ وحدة التحكم في المتصفح، ويصلح الأخطاء الصادرة من القالب أو كود المتجر.",
          doneWhen: "مع وجود منتج في السلة، تُحمَّل صفحة السلة وأول شاشة دفع دون أي خطأ غير معالج من كود المتجر في وحدة التحكم.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحة السلة أو الدفع في متجرك فيها خطأ برمجي.", detail: "العميل هنا اختار المنتج ويبي يدفع. الخطأ ممكن يوقف زر إتمام الطلب، وكل عميل يروح هنا طلب كان بيدخل لك." } },
      },
      media_buyer: {
        fail: { business: { summary: "السلة أو صفحة الدفع فيها error في الكود، فزوار مدفوعين عملوا add to cart ممكن ميكمّلوش والـ CVR بينزل.", detail: "دي أقرب خطوة للأوردر، بعد ما دفعت تمن الكليك وكسبت الـ add. نزول الـ CVR على نفس الصرف بيرفع الـ CPA. التصليح عند مطوّر المتجر: ابعتله النقطة دي." } },
      },
      agency: {
        fail: { business: { summary: "صفحة السلة أو الدفع في «المتجر» فيها خطأ برمجي.", detail: "هؤلاء العملاء قرروا الشراء بالفعل. الخطأ هنا قد يعطّل زرًا، فيخسر «المتجر» الطلب في الخطوة الأخيرة." } },
      },
    },
  },
  // PATH-03: visit.ts path03. Fail facts differ by path (soldOutBadges, or
  // url + button), so fail text uses no slots; pass always has {url}.
  "PATH-03": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "No sold-out badge sits in the first screens of the home or collection page, and the Add to Cart button on {url} is enabled." },
          business: { summary: "The products shoppers see first can be bought.", detail: "Featured products are in stock, so a shopper who clicks one can add it to the cart." },
          protect: "When a featured product sells out, swap it out of the first screens and check where ads point.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "The check fails on any sold-out badge in the first screens of the home or collection page, or a disabled Add to Cart on the product page we opened. Shoppers clicking those products can't add them to the cart." },
          business: { summary: "Some products shown first can't be bought.", detail: "Shoppers click the products in the first screens most. When those are sold out or the buy button is off, the visit ends without a sale." },
          step: "Restock the products in the first screens of the home and collection pages, or swap them for ones in stock. Pause or relink any ad that sends traffic to a sold-out product.",
          doneWhen: "No sold-out badge shows in the first screens of the home or collection page, and Add to Cart is enabled on the product page.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Products at the top of your store are sold out or can't be added to the cart.", detail: "These are the products people click first. A sold-out item there sends shoppers away empty-handed. Restock them or move items in stock into those spots." } },
      },
      media_buyer: {
        fail: { business: { summary: "Products shown first are sold out or can't be added, so clicks landing on them can't convert and CAC goes up.", detail: "Check which ads point to these products and pause them or move them to items in stock. Restocking or swapping the featured products is the store owner's job." } },
      },
      agency: {
        fail: { business: { summary: "Some products the store shows first can't be bought.", detail: "Shoppers click the products in the first screens most. When those are sold out or the buy button is off, the store loses the visit without a sale." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لا توجد شارة نفاد في الشاشات الأولى، وزر الإضافة للسلة مفعّل في صفحة المنتج.", detail: "زر الإضافة للسلة مفعّل في {url}، ولا شارة \"نفد\" في الشاشات الأولى للصفحة الرئيسية أو صفحة التصنيف." },
          business: { summary: "المنتجات التي يراها العميل أولًا قابلة للشراء.", detail: "المنتجات المميزة متوفرة، فالعميل الذي يضغط أحدها يستطيع إضافته للسلة." },
          protect: "عندما ينفد منتج مميز، أخرجه من الشاشات الأولى وراجع إلى أين تقود الإعلانات.",
        },
        fail: {
          technical: { summary: "شارة نفاد في الشاشات الأولى، أو زر الإضافة للسلة معطّل في صفحة المنتج.", detail: "يفشل الفحص عند أي شارة نفاد في الشاشات الأولى للصفحة الرئيسية أو صفحة التصنيف، أو زر إضافة للسلة معطّل في صفحة المنتج التي فتحناها. العميل الذي يضغط هذه المنتجات لا يستطيع إضافتها." },
          business: { summary: "بعض المنتجات المعروضة أولًا غير قابلة للشراء.", detail: "منتجات الشاشات الأولى هي الأكثر نقرًا. عندما تكون نافدة أو زر الشراء معطّلًا، تنتهي الزيارة بلا بيع." },
          step: "أعد تخزين منتجات الشاشات الأولى في الصفحة الرئيسية والتصنيفات أو استبدلها بمنتجات متوفرة، وأوقف أو غيّر رابط أي إعلان يقود إلى منتج نافد.",
          doneWhen: "لا تظهر شارة نفاد في الشاشات الأولى للصفحة الرئيسية أو صفحة التصنيف، وزر الإضافة للسلة مفعّل في صفحة المنتج.",
        },
      },
      store_owner: {
        fail: { business: { summary: "منتجات في أول متجرك خلصت أو ما ينضاف للسلة.", detail: "هذي أول منتجات يضغطها العميل. لو كانت خالصة يطلع بدون ما يشتري. رجّع توفرها أو حط مكانها منتجات متوفرة." } },
      },
      media_buyer: {
        fail: { business: { summary: "المنتجات اللي بتظهر الأول خلصانة أو مش بتتضاف للسلة، فالكليكات اللي بتوصلها مش هتتحول والـ CAC بيعلى.", detail: "شوف أي إعلانات بتودّي على المنتجات دي ووقّفها أو حوّلها لمنتجات متوفرة. إعادة التخزين أو تبديل المنتجات المميزة شغل صاحب المتجر." } },
      },
      agency: {
        fail: { business: { summary: "بعض المنتجات التي يعرضها «المتجر» أولًا غير قابلة للشراء.", detail: "منتجات الشاشات الأولى هي الأكثر نقرًا. عندما تكون نافدة أو زر الشراء معطّلًا، يخسر «المتجر» الزيارة بلا بيع." } },
      },
    },
  },
  // PATH-06: account.ts path06 (Clarity). {sessions} is on pass and fail; the
  // per-behaviour shares are only there when Clarity returned them.
  "PATH-06": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Across {sessions} Clarity sessions on product and cart pages, the share of sessions with script errors and with error clicks is at or below the site-wide share." },
          business: { summary: "The product and cart pages break no more often than the rest of the store.", detail: "The pages where shoppers choose and add products run as cleanly as the site average." },
          protect: "Check Clarity's script-error numbers for product and cart pages after each theme or app change.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Across {sessions} Clarity sessions on product and cart pages, more sessions than site-wide hit a script error or an error click. An error click is a tap followed by a script error, often on options, quantity or Add to Cart." },
          business: { summary: "Shoppers hit more errors on product and cart pages than anywhere else in the store.", detail: "These are the pages where people pick options and add to cart. An error there can stop the button working right before an order." },
          step: "Send this to your developer. They open the product and cart pages on a phone, read the browser console, and fix the errors that fire when someone picks an option or taps Add to Cart.",
          doneWhen: "In the next Clarity snapshot, with 100 or more sessions on product and cart pages, their script-error and error-click session shares are at or below the site-wide share.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your product and cart pages throw more errors than the rest of your store.", detail: "Shoppers on these pages are close to paying. An error can stop the option picker or Add to Cart from working, and that order is lost." } },
      },
      agency: {
        fail: { business: { summary: "The store's product and cart pages throw more errors than its other pages.", detail: "These are the pages where shoppers pick options and add to cart. An error there can stop the button working right before an order." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "نسبة جلسات الأخطاء البرمجية ونقرات الأخطاء في صفحات المنتج والسلة لا تتجاوز نسبتها في الموقع كله.", detail: "عبر {sessions} جلسة في Clarity على صفحات المنتج والسلة." },
          business: { summary: "صفحات المنتج والسلة لا تتعطل أكثر من بقية المتجر.", detail: "الصفحات التي يختار فيها العميل المنتج ويضيفه تعمل بمستوى متوسط الموقع." },
          protect: "راجع أرقام الأخطاء البرمجية في Clarity لصفحات المنتج والسلة بعد كل تغيير في القالب أو التطبيقات.",
        },
        fail: {
          technical: { summary: "نسبة جلسات الأخطاء البرمجية أو نقرات الأخطاء في صفحات المنتج والسلة أعلى من نسبتها في الموقع كله.", detail: "عبر {sessions} جلسة في Clarity على صفحات المنتج والسلة. نقرة الخطأ ضغطة يتبعها خطأ برمجي، وغالبًا تكون على الخيارات أو الكمية أو زر الإضافة للسلة." },
          business: { summary: "العملاء يواجهون أخطاء في صفحات المنتج والسلة أكثر من أي مكان آخر في المتجر.", detail: "في هذه الصفحات يختار العميل ويضيف للسلة. الخطأ هنا قد يعطّل الزر قبل الطلب مباشرة." },
          step: "أرسل هذا إلى المطوّر ليفتح صفحات المنتج والسلة على الجوال، ويقرأ وحدة التحكم في المتصفح، ويصلح الأخطاء التي تظهر عند اختيار خيار أو الضغط على زر الإضافة للسلة.",
          doneWhen: "في لقطة Clarity التالية، مع 100 جلسة أو أكثر على صفحات المنتج والسلة، تكون نسبة جلسات الأخطاء البرمجية ونقرات الأخطاء فيها مساوية لنسبة الموقع كله أو أقل.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحات المنتج والسلة في متجرك فيها أخطاء أكثر من باقي المتجر.", detail: "العميل في هالصفحات قريب من الدفع. الخطأ ممكن يوقف اختيار المقاس أو زر أضف للسلة، ويروح عليك الطلب." } },
      },
      agency: {
        fail: { business: { summary: "صفحات المنتج والسلة في «المتجر» فيها أخطاء أكثر من بقية صفحاته.", detail: "في هذه الصفحات يختار العميل ويضيف للسلة. الخطأ هنا قد يعطّل الزر قبل الطلب مباشرة." } },
      },
    },
  },
  // PATH-07: collect.ts path07. Fail always has {failed} (up to 6 "page:
  // status url" lines); a bare ERR_FAILED is unverified, never a fail.
  "PATH-07": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "No request on home, collection, product or cart returned 404, a 5xx error or a network error such as a failed DNS lookup. A cart drawer is covered by the product page's log." },
          business: { summary: "Every image, script and file on the selling pages loaded.", detail: "Photos show and app scripts run, so buttons and widgets work on the way to the cart." },
          protect: "When you remove an app, check that its scripts are gone from the theme too.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Failed files: {failed}. Each returned 404, a 5xx error or a network error such as a failed DNS lookup or refused connection. Files from removed apps often stay in the theme and fail like this." },
          business: { summary: "Some images or files fail to load on the pages that sell.", detail: "A missing photo makes the store look unfinished. A failed script can stop a button or widget working before the shopper reaches the cart." },
          step: "Ask your developer to fix or remove each failed file. Scripts left behind by apps you removed are usually in the theme code.",
          doneWhen: "No request on home, collection, product or cart returns 404, a 5xx error or a network error.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some photos or files on your selling pages don't load.", detail: "A missing photo makes your store look unfinished. A broken script can stop a button working. Both cost you shoppers on the way to the cart." } },
      },
      media_buyer: {
        fail: { business: { summary: "Files fail on the pages paid visitors land on, so CVR drops on the same clicks.", detail: "Missing images and broken scripts make landing pages look broken or stop buttons working, so fewer visitors act. CPA rises on the same spend. The store's developer fixes it: forward this to them." } },
      },
      agency: {
        fail: { business: { summary: "Some images or files fail to load on the store's selling pages.", detail: "A missing photo makes the store look unfinished. A failed script can stop a button or widget working before the shopper reaches the cart." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لا ملف يُرجع 404 أو خطأ 5xx أو خطأ شبكة في الصفحة الرئيسية والتصنيف والمنتج والسلة.", detail: "سجل صفحة المنتج يغطي السلة عندما تكون درجًا جانبيًا." },
          business: { summary: "كل الصور والسكربتات والملفات في صفحات البيع تُحمَّل.", detail: "الصور تظهر وسكربتات التطبيقات تعمل، فالأزرار والأدوات تعمل في الطريق إلى السلة." },
          protect: "عند حذف أي تطبيق، تأكد أن سكربتاته حُذفت من القالب أيضًا.",
        },
        fail: {
          technical: { summary: "ملفات تفشل في صفحات البيع بخطأ 404 أو 5xx أو خطأ شبكة.", detail: "الملفات الفاشلة: {failed}. كثيرًا ما تبقى ملفات التطبيقات المحذوفة في القالب وتفشل بهذا الشكل." },
          business: { summary: "بعض الصور أو الملفات لا تُحمَّل في صفحات البيع.", detail: "الصورة المفقودة تجعل المتجر يبدو غير مكتمل. والسكربت الفاشل قد يعطّل زرًا أو أداة قبل وصول العميل إلى السلة." },
          step: "اطلب من المطوّر إصلاح كل ملف فاشل أو حذفه. السكربتات المتبقية من تطبيقات محذوفة تكون عادة في كود القالب.",
          doneWhen: "لا يُرجع أي طلب في الصفحة الرئيسية والتصنيف والمنتج والسلة خطأ 404 أو 5xx أو خطأ شبكة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بعض الصور أو الملفات في صفحات البيع بمتجرك ما تفتح.", detail: "الصورة الناقصة تخلي متجرك يبان مو مكتمل، والسكربت الخربان ممكن يوقف زر. الثنتين تخسرك عملاء قبل السلة." } },
      },
      media_buyer: {
        fail: { business: { summary: "فيه ملفات بتفشل في الصفحات اللي الزوار المدفوعين بيوصلوها، فالـ CVR بينزل على نفس الكليكات.", detail: "الصور الناقصة والسكربتات البايظة بتخلي الـ landing page شكلها بايظ أو بتوقف زراير، فناس أقل بتتحرك. الـ CPA بيعلى على نفس الصرف. التصليح عند مطوّر المتجر: ابعتله النقطة دي." } },
      },
      agency: {
        fail: { business: { summary: "بعض الصور أو الملفات لا تُحمَّل في صفحات البيع في «المتجر».", detail: "الصورة المفقودة تجعل «المتجر» يبدو غير مكتمل. والسكربت الفاشل قد يعطّل زرًا أو أداة قبل وصول العميل إلى السلة." } },
      },
    },
  },
  // PATH-12: facts.ts path12. Pass and fail both carry fields, phoneFields,
  // emailFields, shortest and noAutocomplete.
  "PATH-12": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Read {fields} fields: {phoneFields} phone and {emailFields} email field(s) open the right keyboard, the shortest field is {shortest}px tall, and every text, phone and email field outside discount, gift and note fields has autocomplete." },
          business: { summary: "Typing details at checkout is quick on a phone.", detail: "Shoppers get the number pad for phone numbers, autofill for their details and boxes big enough to tap." },
          protect: "Re-check the phone keyboard and autofill after any checkout app or theme change.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Of {fields} fields, the shortest is {shortest}px tall and {noAutocomplete} have no autocomplete or autocomplete=off. Phone fields need type=tel or a numeric inputmode, email fields type=email, and every field needs a height of 44px or more." },
          business: { summary: "Typing details at checkout is slower than it should be on a phone.", detail: "Shoppers get the wrong keyboard, small boxes or no autofill. Each slip slows them down, and some give up before paying." },
          step: "Ask your developer to set type=\"tel\" on phone fields and type=\"email\" on email fields, add autocomplete values such as name, tel, email and street-address, and make each field at least 44px tall. If the platform owns the checkout, raise it with the platform's support.",
          doneWhen: "On the first checkout screen, phone fields open a numeric keyboard, email fields an email keyboard, every text, phone and email field outside discount and note fields has autocomplete set and not off, and every field is at least 44px tall.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Filling in your checkout on a phone is slower than it should be.", detail: "Customers get the wrong keyboard, small boxes or no autofill for their details. Some give up halfway and you lose the order." } },
      },
      media_buyer: {
        fail: { business: { summary: "Checkout fields fight phone users, so mobile paid traffic converts lower and CVR drops.", detail: "Wrong keyboards, small boxes and no autofill slow down the last step, where most ad traffic arrives on a phone. Fewer finished orders raise CPA. The store's developer or platform fixes it: forward this to them." } },
      },
      agency: {
        fail: { business: { summary: "Filling in the store's checkout on a phone is slower than it should be.", detail: "Shoppers get the wrong keyboard, small boxes or no autofill. Each slip slows them down, and some give up before paying." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "حقول الدفع بارتفاع 44px أو أكثر، وحقول الهاتف والبريد تفتح لوحة المفاتيح الصحيحة، والإكمال التلقائي مفعّل.", detail: "قرأنا {fields} حقلًا: {phoneFields} حقل هاتف و{emailFields} حقل بريد بلوحة المفاتيح الصحيحة، وأقصر حقل بارتفاع {shortest}px." },
          business: { summary: "إدخال البيانات في الدفع سريع على الجوال.", detail: "العميل يحصل على لوحة الأرقام لرقم الهاتف، والإكمال التلقائي لبياناته، وحقول كبيرة يسهل الضغط عليها." },
          protect: "أعد فحص لوحة مفاتيح الهاتف والإكمال التلقائي بعد أي تغيير في تطبيق الدفع أو القالب.",
        },
        fail: {
          technical: { summary: "حقول في نموذج الدفع بلوحة مفاتيح خاطئة، أو بارتفاع أقل من 44px، أو بلا إكمال تلقائي.", detail: "من {fields} حقلًا، أقصرها بارتفاع {shortest}px و{noAutocomplete} بلا autocomplete أو بقيمة off. حقل الهاتف يحتاج type=tel أو inputmode رقمي، وحقل البريد type=email، وكل حقل ارتفاعه 44px أو أكثر." },
          business: { summary: "إدخال البيانات في الدفع أبطأ مما يجب على الجوال.", detail: "العميل يحصل على لوحة مفاتيح خاطئة أو حقول صغيرة أو بلا إكمال تلقائي. كل تعثّر يبطئه، وبعض العملاء يتركون قبل الدفع." },
          step: "اطلب من المطوّر ضبط type=\"tel\" لحقول الهاتف وtype=\"email\" لحقول البريد، وإضافة قيم autocomplete مثل name وtel وemail وstreet-address، وجعل كل حقل بارتفاع 44px على الأقل. إن كانت صفحة الدفع تابعة للمنصة، فارفع الطلب إلى دعم المنصة.",
          doneWhen: "في أول شاشة دفع: حقول الهاتف تفتح لوحة أرقام، وحقول البريد لوحة بريد، وكل حقل نص وهاتف وبريد خارج حقول الخصم والملاحظات فيه autocomplete بقيمة غير off، وكل حقل بارتفاع 44px أو أكثر.",
        },
      },
      store_owner: {
        fail: { business: { summary: "تعبئة بيانات الدفع في متجرك من الجوال أبطأ من اللازم.", detail: "العميل يطلع له كيبورد غلط أو خانات صغيرة أو ما تنعبى بياناته تلقائي. بعضهم يوقف في النص وتخسر الطلب." } },
      },
      media_buyer: {
        fail: { business: { summary: "حقول الدفع متعبة على الموبايل، فالترافيك المدفوع من الموبايل بيتحول أقل والـ CVR بينزل.", detail: "الكيبورد الغلط والخانات الصغيرة وغياب الـ autofill بيبطّأوا آخر خطوة، وأغلب ترافيك الإعلانات جاي من الموبايل. أوردرات أقل يعني CPA أعلى. التصليح عند مطوّر المتجر أو المنصة: ابعتلهم النقطة دي." } },
      },
      agency: {
        fail: { business: { summary: "تعبئة بيانات الدفع في «المتجر» من الجوال أبطأ مما يجب.", detail: "العميل يحصل على لوحة مفاتيح خاطئة أو حقول صغيرة أو بلا إكمال تلقائي. كل تعثّر يبطئه، وبعض العملاء يتركون قبل الدفع." } },
      },
    },
  },
  // PATH-15: probes.ts path15. Fail always has {url}; {continueButton} only
  // on the "says empty, missing links" fail, so fail text uses {url} only.
  "PATH-15": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "The empty cart at {url} offers \"{continueButton}\" and links to {onwardLinks}." },
          business: { summary: "An empty cart sends shoppers back to the products.", detail: "A shopper who opens the cart with nothing in it gets a clear way to keep shopping." },
          protect: "Keep the continue-shopping button and collection link when you change the cart page or theme.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "We opened {url} with a fresh, empty cart. It needs a line saying the cart is empty, a continue-shopping button, and a link to a collection or best sellers." },
          business: { summary: "An empty cart leaves shoppers with nowhere to go.", detail: "Returning shoppers often open the cart first. With no message or link to products, some close the tab instead of browsing." },
          step: "On the empty cart page, add a line saying the cart is empty, a Continue shopping button, and a link to best sellers or a main collection.",
          doneWhen: "The empty cart page says the cart is empty and shows a continue-shopping button and a link to a collection or best sellers.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your empty cart page doesn't point shoppers back to your products.", detail: "People who come back to your store often open the cart first. If it's a dead end, some leave without looking at anything." } },
      },
      media_buyer: {
        fail: { business: { summary: "The empty cart is a dead end, so retargeted visitors who open it first can drop off and CVR slips.", detail: "Returning visitors from retargeting often tap the cart first. With no link back to products, some of those paid clicks end there. The store owner adds the links in the cart page settings." } },
      },
      agency: {
        fail: { business: { summary: "The store's empty cart leaves shoppers with nowhere to go.", detail: "Returning shoppers often open the cart first. With no message or link to products, some close the tab instead of browsing." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "صفحة السلة الفارغة تقول إنها فارغة وفيها زر متابعة التسوق ورابط إلى تصنيف أو الأكثر مبيعًا.", detail: "السلة الفارغة في {url} تعرض \"{continueButton}\" وروابط إلى {onwardLinks}." },
          business: { summary: "السلة الفارغة تعيد العميل إلى المنتجات.", detail: "العميل الذي يفتح السلة وهي فارغة يجد طريقًا واضحًا لمتابعة التسوق." },
          protect: "أبقِ زر متابعة التسوق ورابط التصنيف عند تغيير صفحة السلة أو القالب.",
        },
        fail: {
          technical: { summary: "صفحة السلة الفارغة لا تقول إنها فارغة، أو ليس فيها زر متابعة التسوق أو رابط إلى تصنيف.", detail: "فتحنا {url} بسلة جديدة فارغة. تحتاج إلى سطر يقول إن السلة فارغة، وزر متابعة التسوق، ورابط إلى تصنيف أو الأكثر مبيعًا." },
          business: { summary: "السلة الفارغة لا تدلّ العميل إلى أي مكان.", detail: "العميل العائد يفتح السلة أولًا في الغالب. بلا رسالة أو رابط للمنتجات، يغلق بعضهم الصفحة بدل التصفح." },
          step: "في صفحة السلة الفارغة، أضف سطرًا يقول إن السلة فارغة، وزر متابعة التسوق، ورابطًا إلى الأكثر مبيعًا أو تصنيف رئيسي.",
          doneWhen: "صفحة السلة الفارغة تقول إن السلة فارغة وتعرض زر متابعة التسوق ورابطًا إلى تصنيف أو الأكثر مبيعًا.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحة السلة الفاضية في متجرك ما ترجّع العميل لمنتجاتك.", detail: "اللي يرجعون لمتجرك كثير منهم يفتحون السلة أول. لو كانت طريق مسدود، بعضهم يطلع بدون ما يشوف شي." } },
      },
      media_buyer: {
        fail: { business: { summary: "السلة الفاضية طريق مسدود، فزوار الـ retargeting اللي بيفتحوها الأول ممكن يمشوا والـ CVR بيقل.", detail: "الزوار الراجعين من الـ retargeting كتير بيدوسوا على السلة الأول. من غير لينك يرجّعهم للمنتجات، جزء من الكليكات المدفوعة دي بيخلص هناك. صاحب المتجر يضيف اللينكات من إعدادات صفحة السلة." } },
      },
      agency: {
        fail: { business: { summary: "السلة الفارغة في «المتجر» لا تدلّ العميل إلى أي مكان.", detail: "العميل العائد يفتح السلة أولًا في الغالب. بلا رسالة أو رابط للمنتجات، يغلق بعضهم الصفحة بدل التصفح." } },
      },
    },
  },
  // PATH-16: visit.ts path16. Fail has {navLinks} and {popups}; pass has
  // {navLinks}. More than 2 header links or any non-cookie popup fails.
  "PATH-16": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "The checkout header has {navLinks} link(s), within the limit of 2, and no popup other than a cookie banner opens on load." },
          business: { summary: "Checkout keeps the shopper on the order.", detail: "No menu or popup offers a way out between the cart and payment." },
          protect: "Keep menus, banners and popup apps off the checkout pages when you add new ones to the store.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "The first checkout screen shows {navLinks} header link(s) and {popups} popup(s) on load. More than 2 links, or any popup other than a cookie banner, gives the shopper an exit or a distraction mid-checkout." },
          business: { summary: "Checkout shows a menu or popup that pulls shoppers away.", detail: "Each link out of checkout is a chance to wander off before paying. A popup here gets in the way of the payment form." },
          step: "Use a checkout header with only the logo and a back-to-cart link, and switch off popups on the checkout pages.",
          doneWhen: "The first checkout screen shows 2 or fewer header links and no popup other than a cookie banner.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your checkout shows a menu or popup that pulls customers away from paying.", detail: "Every extra link is a way out right before the payment. Some customers tap it and never come back to finish." } },
      },
      media_buyer: {
        fail: { business: { summary: "Checkout shows a menu or popup, so paid shoppers get exits mid-checkout and CVR slips.", detail: "Shoppers who reached checkout from an ad are close to buying. Links and popups here give them reasons to leave, which raises CPA. The store owner or developer removes them from the checkout settings." } },
      },
      agency: {
        fail: { business: { summary: "The store's checkout shows a menu or popup that pulls shoppers away.", detail: "Each link out of checkout is a chance to wander off before paying. A popup here gets in the way of the payment form." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "أول شاشة دفع بلا قائمة رئيسية وبلا نوافذ منبثقة.", detail: "رأس صفحة الدفع فيه {navLinks} رابط، ضمن حد الرابطين، ولا تظهر نافذة منبثقة غير شريط الكوكيز." },
          business: { summary: "صفحة الدفع تُبقي العميل على طلبه.", detail: "لا قائمة ولا نافذة منبثقة تفتح طريقًا للخروج بين السلة والدفع." },
          protect: "أبقِ القوائم والبانرات وتطبيقات النوافذ المنبثقة خارج صفحات الدفع عند إضافة أي جديد للمتجر.",
        },
        fail: {
          technical: { summary: "أول شاشة دفع فيها {navLinks} رابط في الرأس و{popups} نافذة منبثقة.", detail: "أكثر من رابطين في الرأس، أو أي نافذة منبثقة غير شريط الكوكيز، يعطي العميل مخرجًا أو مشتتًا في منتصف الدفع." },
          business: { summary: "صفحة الدفع تعرض قائمة أو نافذة منبثقة تشتت العميل.", detail: "كل رابط يخرج من الدفع فرصة لأن يبتعد العميل قبل أن يدفع. والنافذة المنبثقة هنا تعترض نموذج الدفع." },
          step: "استخدم رأسًا لصفحة الدفع فيه الشعار ورابط العودة للسلة فقط، وأوقف النوافذ المنبثقة في صفحات الدفع.",
          doneWhen: "أول شاشة دفع تعرض رابطين أو أقل في الرأس، ولا نافذة منبثقة غير شريط الكوكيز.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحة الدفع في متجرك فيها قائمة أو نافذة تشتت العميل عن الدفع.", detail: "كل رابط زيادة طريق للخروج قبل الدفع بلحظة. بعض العملاء يضغطونه وما يرجعون يكملون." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحة الدفع فيها منيو أو popup، فالزوار المدفوعين بيلاقوا مخارج في نص الـ checkout والـ CVR بيقل.", detail: "اللي وصل للـ checkout من إعلان قريب جدًا من الشراء. اللينكات والـ popups هنا بتديله سبب يمشي، وده بيرفع الـ CPA. صاحب المتجر أو المطوّر يشيلهم من إعدادات الدفع." } },
      },
      agency: {
        fail: { business: { summary: "صفحة الدفع في «المتجر» تعرض قائمة أو نافذة منبثقة تشتت العميل.", detail: "كل رابط يخرج من الدفع فرصة لأن يبتعد العميل قبل أن يدفع. والنافذة المنبثقة هنا تعترض نموذج الدفع." } },
      },
    },
  },
};
