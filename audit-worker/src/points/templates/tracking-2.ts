import type { PointTemplate } from "./types.js";

// Second tracking file, so two writers can work on tracking points at once.
// GA4 points: each maps one fact (or two, for allOf) from ga4-facts.ts, and
// every threshold below is the one that file uses.
export const TRACKING_2: Record<string, PointTemplate> = {
  // GA4-02: view_item > add_to_cart, benchmark 8%, 50+ users, tracking gap rule.
  "TRK-01": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "add_to_cart users divided by view_item users over 28 days, from GA4's funnel events. The benchmark is 8%, and the step is judged only with 50+ view_item users." },
          business: { summary: "Enough product visitors add items to the cart.", detail: "Every sale starts with an add to cart. A healthy rate here keeps the rest of the buying path supplied." },
          protect: "Re-check this rate after changing product page layout, prices or photos.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "add_to_cart users divided by view_item users over 28 days, against an 8% benchmark. If add_to_cart sits under 30% of the benchmark, or has over 5% more users than view_item, the event is most likely misfiring and the tracking is fixed before the page is judged." },
          business: { summary: "Too few product visitors add anything to the cart, or adding to cart isn't recorded properly.", detail: "Every sale starts with an add to cart. A weak rate here caps sales from all your traffic. If the rate is far too low, the tracking is probably broken and the real rate is unknown." },
          step: "Your developer checks in GTM Preview that add_to_cart fires once per click on every product page. If it does, fix the product page issues in the Conversion review: price, photos, sizes and the add to cart button.",
          doneWhen: "In GA4, add_to_cart users are at least 8% of view_item users over 28 days.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Few visitors who open a product in your store add it to the cart.", detail: "Every sale starts with an add to cart, so this step limits all your sales. If the rate is far too low, adding to cart may not be recorded at all. Then the real number is unknown." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid clicks reach product pages but few add to cart, so CVR is low and CPA is higher than it should be.", detail: "Fixing this step converts more of the same paid traffic: ROAS up, CPA down. If GA4 flags a tracking gap instead, add_to_cart isn't firing properly and platforms on the same tags may get fewer add-to-cart signals. The fix is on the store's product pages or tags, done by the store's developer." } },
      },
      agency: {
        fail: { business: { summary: "Few product visitors on the store add to cart, or adding to cart isn't recorded properly.", detail: "Every sale starts at this step, so it caps the store's sales from all traffic. A rate far under the benchmark points to a tracking fault to fix before the pages are judged." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "معدل الإضافة للسلة من مشاهدات المنتجات عند 8% أو أعلى خلال 28 يومًا في GA4.", detail: "مستخدمو add_to_cart مقسومون على مستخدمي view_item خلال 28 يومًا. لا تُقيَّم الخطوة إلا مع 50 مستخدمًا أو أكثر لحدث view_item." },
          business: { summary: "عدد كافٍ من زوار صفحات المنتجات يضيفون منتجات إلى السلة.", detail: "كل عملية بيع تبدأ بإضافة للسلة، ومعدل جيد هنا يغذي بقية مسار الشراء." },
          protect: "أعد فحص هذا المعدل بعد أي تغيير في تصميم صفحة المنتج أو الأسعار أو الصور.",
        },
        fail: {
          technical: { summary: "أقل من 8% من مستخدمي view_item أضافوا للسلة خلال 28 يومًا، أو أن حدث add_to_cart لا يُسجَّل بشكل صحيح.", detail: "المعيار 8%. إذا كان add_to_cart أقل من 30% من المعيار، أو أعلى من view_item بأكثر من 5%، فالحدث على الأرجح لا يعمل كما يجب، ويُصلَح التتبع قبل الحكم على الصفحة." },
          business: { summary: "قلة من زوار صفحات المنتجات يضيفون إلى السلة، أو أن الإضافة لا تُسجَّل بشكل صحيح.", detail: "كل عملية بيع تبدأ بإضافة للسلة، فضعف هذه الخطوة يحدّ من المبيعات من كل الزيارات. وإذا كان المعدل منخفضًا جدًا فالتتبع غالبًا معطل والمعدل الحقيقي غير معروف." },
          step: "يتحقق المطوّر في معاينة GTM من أن add_to_cart يعمل مرة واحدة مع كل نقرة في كل صفحات المنتجات. إن كان يعمل، أصلح مشكلات صفحة المنتج في مراجعة التحويل: السعر والصور والمقاسات وزر الإضافة للسلة.",
          doneWhen: "في GA4، مستخدمو add_to_cart يساوون 8% على الأقل من مستخدمي view_item خلال 28 يومًا.",
        },
      },
      store_owner: {
        fail: { business: { summary: "قليل من اللي يفتحون منتجات متجرك يضغطون أضف للسلة.", detail: "كل بيعة تبدأ بإضافة للسلة، فهالخطوة تحدد كل مبيعاتك. وإذا الرقم واجد منخفض، ممكن الإضافة ما تنسجل أصلًا والرقم الحقيقي مو معروف." } },
      },
      media_buyer: {
        fail: { business: { summary: "الكليكات المدفوعة بتوصل لصفحات المنتج بس قليل اللي بيعمل add to cart، فالـ CVR واطي والـ CPA أعلى من اللازم.", detail: "تصليح الخطوة دي بيحوّل أكتر من نفس الترافيك المدفوع: الـ ROAS يطلع والـ CPA ينزل. لو GA4 بيقول إنها tracking gap، يبقى add_to_cart مش شغال صح والمنصات اللي على نفس الـ tags ممكن تاخد signals أقل. الحل في صفحات المنتج أو الـ tags عند مطوّر المتجر." } },
      },
      agency: {
        fail: { business: { summary: "قلة من زوار صفحات المنتجات في المتجر يضيفون إلى السلة، أو أن الإضافة لا تُسجَّل بشكل صحيح.", detail: "كل عملية بيع تبدأ من هذه الخطوة، فضعفها يحدّ من مبيعات المتجر من كل الزيارات. والمعدل المنخفض جدًا عن المعيار يشير إلى خلل في التتبع يُصلَح قبل الحكم على الصفحات." } },
      },
    },
  },

  // GA4-03: add_to_cart > begin_checkout 50% (or > add_shipping_info 40%).
  "TRK-02": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "begin_checkout users divided by add_to_cart users over 28 days, against a 50% benchmark (add_shipping_info against 40% when the store has no begin_checkout). Judged only with 50+ add_to_cart users." },
          business: { summary: "Shoppers who fill a cart move on to checkout at a healthy rate.", detail: "A cart that reaches checkout is one step from a sale. This rate protects the sales your product pages already won." },
          protect: "Re-check this rate after changing delivery fees, cart apps or the cart layout.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "begin_checkout users divided by add_to_cart users over 28 days, against a 50% benchmark (or add_shipping_info against 40%). A rate under 30% of the benchmark, or a later step with over 5% more users, points to an event that doesn't fire, so tracking is fixed before the cart is judged." },
          business: { summary: "Many shoppers fill a cart and leave before checkout, or the checkout step isn't recorded properly.", detail: "These people already picked a product. They often leave when the delivery cost, payment options or next step aren't clear in the cart. If the rate is far too low, the tracking is likely broken and the real rate is unknown." },
          step: "Your developer first checks in GTM Preview that begin_checkout fires when checkout opens. If it does, fix the cart issues in the Conversion review: show the delivery cost, the payment options and a clear checkout button.",
          doneWhen: "In GA4, begin_checkout users are at least 50% of add_to_cart users over 28 days (add_shipping_info at least 40% if the store has no begin_checkout).",
        },
      },
      store_owner: {
        fail: { business: { summary: "Many shoppers fill a cart in your store and leave before checkout.", detail: "They already picked what they want. Most leave when the delivery cost or the next step isn't clear in the cart. If the rate is far too low, checkout may not be recorded properly." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid shoppers add to cart and stall before checkout, so CVR is low and CPA is higher than it should be.", detail: "Fixing the cart converts more of the same paid traffic: ROAS up, CPA down. If GA4 flags a tracking gap, begin_checkout isn't firing and platforms miss checkout signals. The fix is on the store's cart page or tags, done by the store's developer." } },
      },
      agency: {
        fail: { business: { summary: "Many shoppers leave the store's cart before checkout, or checkout isn't recorded properly.", detail: "These shoppers already chose a product, so each one lost here is a near sale. The cart's delivery cost, payment options and next step are the first things to check." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "معدل الانتقال من السلة إلى الدفع عند المعيار أو أعلى خلال 28 يومًا في GA4.", detail: "مستخدمو begin_checkout مقسومون على مستخدمي add_to_cart، والمعيار 50% (أو add_shipping_info مقابل 40% إذا لم يوجد begin_checkout). لا تُقيَّم الخطوة إلا مع 50 مستخدمًا أو أكثر لحدث add_to_cart." },
          business: { summary: "من يملأ السلة ينتقل إلى الدفع بمعدل جيد.", detail: "السلة التي تصل إلى الدفع على بُعد خطوة من البيع، وهذا المعدل يحمي ما كسبته صفحات المنتجات." },
          protect: "أعد فحص هذا المعدل بعد تغيير رسوم التوصيل أو تطبيقات السلة أو تصميمها.",
        },
        fail: {
          technical: { summary: "أقل من 50% ممن أضافوا للسلة بدأوا الدفع خلال 28 يومًا، أو أن حدث الدفع لا يُسجَّل بشكل صحيح.", detail: "المعيار 50% لحدث begin_checkout (أو 40% لحدث add_shipping_info إذا لم يوجد begin_checkout). معدل أقل من 30% من المعيار، أو خطوة لاحقة أعلى بأكثر من 5%، يعني أن حدثًا لا يعمل، فيُصلَح التتبع قبل الحكم على السلة." },
          business: { summary: "كثير من العملاء يملؤون السلة ويغادرون قبل الدفع، أو أن خطوة الدفع لا تُسجَّل بشكل صحيح.", detail: "هؤلاء اختاروا منتجًا بالفعل، وغالبًا يغادرون حين لا تتضح تكلفة التوصيل أو طرق الدفع أو الخطوة التالية في السلة. وإذا كان المعدل منخفضًا جدًا فالتتبع غالبًا معطل والمعدل الحقيقي غير معروف." },
          step: "يتحقق المطوّر أولًا في معاينة GTM من أن begin_checkout يعمل عند فتح صفحة الدفع. إن كان يعمل، أصلح مشكلات السلة في مراجعة التحويل: أظهر تكلفة التوصيل وطرق الدفع وزر دفع واضحًا.",
          doneWhen: "في GA4، مستخدمو begin_checkout يساوون 50% على الأقل من مستخدمي add_to_cart خلال 28 يومًا (أو add_shipping_info بنسبة 40% على الأقل إذا لم يوجد begin_checkout).",
        },
      },
      store_owner: {
        fail: { business: { summary: "واجد من عملائك يعبّون السلة ويطلعون قبل الدفع.", detail: "هم اختاروا اللي يبونه، وأغلبهم يطلعون إذا تكلفة التوصيل أو الخطوة الجاية مو واضحة في السلة. وإذا الرقم واجد منخفض، ممكن الدفع ما ينسجل صح." } },
      },
      media_buyer: {
        fail: { business: { summary: "الترافيك المدفوع بيعمل add to cart وبيقف قبل الـ checkout، فالـ CVR واطي والـ CPA أعلى من اللازم.", detail: "تصليح السلة بيحوّل أكتر من نفس الترافيك المدفوع: الـ ROAS يطلع والـ CPA ينزل. لو GA4 بيقول إنها tracking gap، يبقى begin_checkout مش شغال والمنصات مش شايفة signals الـ checkout. الحل في صفحة السلة أو الـ tags عند مطوّر المتجر." } },
      },
      agency: {
        fail: { business: { summary: "كثير من العملاء يغادرون سلة المتجر قبل الدفع، أو أن خطوة الدفع لا تُسجَّل بشكل صحيح.", detail: "هؤلاء اختاروا منتجًا بالفعل، فكل عميل يغادر هنا بيع شبه مكتمل. أول ما يُفحص في السلة: تكلفة التوصيل وطرق الدفع والخطوة التالية." } },
      },
    },
  },

  // GA4-04: begin_checkout > purchase 50% (or add_shipping_info > purchase 60%).
  "TRK-03": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "purchase users divided by begin_checkout users over 28 days, against a 50% benchmark (add_shipping_info against 60% when the store has no begin_checkout). Judged only with 50+ users at the earlier step." },
          business: { summary: "Shoppers who start checkout finish the purchase at a healthy rate.", detail: "These buyers already decided. Keeping them through payment protects the sales your ads and pages earned." },
          protect: "Place a test order on a phone after any change to payment, delivery or checkout settings.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "purchase users divided by begin_checkout users over 28 days, against a 50% benchmark (or 60% from add_shipping_info). Over 5% more purchase users than checkout users, or a rate under 30% of the benchmark, means one of the two events misfires, so tracking is fixed first." },
          business: { summary: "Many shoppers start checkout and don't pay, or checkout isn't recorded properly.", detail: "These people already decided to buy. They usually drop at a surprise delivery fee, a missing payment method, a forced account or an error. If the rate is far off, the tracking is broken and the real rate is unknown." },
          step: "Place one test order on a phone. Check that the delivery cost shows before the last step, cash on delivery and local payment options are offered, no account is forced, and nothing errors. If GA4 flags a tracking gap, your developer fixes begin_checkout and purchase first.",
          doneWhen: "In GA4, purchase users are at least 50% of begin_checkout users over 28 days (at least 60% of add_shipping_info users if the store has no begin_checkout).",
        },
      },
      store_owner: {
        fail: { business: { summary: "Many shoppers start checkout in your store and leave without paying.", detail: "These are sales you almost had. Most drop at a surprise delivery fee, a missing payment method or a forced account. If the rate is far off, checkout may not be recorded properly." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid shoppers reach checkout and don't pay, so CVR is low and CPA is higher than it should be.", detail: "These clicks are already paid for and nearly converted. Fixing checkout converts more of them: ROAS up, CPA down. If GA4 flags a tracking gap, purchase or begin_checkout misfires and platforms on the same tags may see the wrong number of sales, so the store's developer fixes the tags first." } },
      },
      agency: {
        fail: { business: { summary: "Many shoppers start the store's checkout and don't pay, or checkout isn't recorded properly.", detail: "These shoppers already decided to buy, so each one lost is a near sale. A phone test order shows the usual causes: delivery fees shown late, missing payment methods, forced accounts or errors." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "معدل إتمام الشراء بعد بدء الدفع عند المعيار أو أعلى خلال 28 يومًا في GA4.", detail: "مستخدمو purchase مقسومون على مستخدمي begin_checkout، والمعيار 50% (أو 60% من add_shipping_info إذا لم يوجد begin_checkout). لا تُقيَّم الخطوة إلا مع 50 مستخدمًا أو أكثر في الخطوة السابقة." },
          business: { summary: "من يبدأ الدفع يُكمل الشراء بمعدل جيد.", detail: "هؤلاء قرروا الشراء بالفعل، وإبقاؤهم حتى الدفع يحمي المبيعات التي جلبتها الإعلانات والصفحات." },
          protect: "نفّذ طلبًا تجريبيًا على الجوال بعد أي تغيير في إعدادات الدفع أو التوصيل.",
        },
        fail: {
          technical: { summary: "أقل من 50% ممن بدأوا الدفع أكملوا الشراء خلال 28 يومًا، أو أن أحد حدثي الدفع والشراء لا يُسجَّل بشكل صحيح.", detail: "المعيار 50% من begin_checkout (أو 60% من add_shipping_info). إذا زاد مستخدمو purchase بأكثر من 5%، أو كان المعدل أقل من 30% من المعيار، فأحد الحدثين لا يعمل كما يجب، ويُصلَح التتبع أولًا." },
          business: { summary: "كثير من العملاء يبدؤون الدفع ولا يُكملون، أو أن الدفع لا يُسجَّل بشكل صحيح.", detail: "هؤلاء قرروا الشراء بالفعل، وغالبًا يتوقفون عند رسوم توصيل مفاجئة أو طريقة دفع ناقصة أو حساب إجباري أو خطأ. وإذا كان المعدل بعيدًا جدًا عن المعيار فالتتبع معطل والمعدل الحقيقي غير معروف." },
          step: "نفّذ طلبًا تجريبيًا واحدًا على الجوال. تأكد أن تكلفة التوصيل تظهر قبل الخطوة الأخيرة، وأن الدفع عند الاستلام وطرق الدفع المحلية متاحة، ولا يُفرض إنشاء حساب، ولا تظهر أخطاء. إذا أشار GA4 إلى خلل في التتبع، يُصلح المطوّر begin_checkout و purchase أولًا.",
          doneWhen: "في GA4، مستخدمو purchase يساوون 50% على الأقل من مستخدمي begin_checkout خلال 28 يومًا (أو 60% على الأقل من مستخدمي add_shipping_info إذا لم يوجد begin_checkout).",
        },
      },
      store_owner: {
        fail: { business: { summary: "واجد من عملائك يبدون الدفع ويطلعون بدون ما يدفعون.", detail: "هذي مبيعات كانت بيدك تقريبًا. أغلبهم يطلعون عند رسوم توصيل مفاجئة أو طريقة دفع ناقصة أو تسجيل حساب إجباري. وإذا الرقم بعيد واجد، ممكن الدفع ما ينسجل صح." } },
      },
      media_buyer: {
        fail: { business: { summary: "الترافيك المدفوع بيوصل للـ checkout ومبيدفعش، فالـ CVR واطي والـ CPA أعلى من اللازم.", detail: "الكليكات دي مدفوعة وكانت قربت تتحوّل. تصليح الـ checkout بيحوّل أكتر منها: الـ ROAS يطلع والـ CPA ينزل. لو GA4 بيقول إنها tracking gap، يبقى purchase أو begin_checkout مش شغال صح والمنصات اللي على نفس الـ tags ممكن تشوف عدد مبيعات غلط، فمطوّر المتجر يصلّح الـ tags الأول." } },
      },
      agency: {
        fail: { business: { summary: "كثير من العملاء يبدؤون الدفع في المتجر ولا يُكملون، أو أن الدفع لا يُسجَّل بشكل صحيح.", detail: "هؤلاء قرروا الشراء، فكل عميل يغادر هنا بيع شبه مكتمل. طلب تجريبي على الجوال يكشف الأسباب المعتادة: رسوم توصيل متأخرة أو طرق دفع ناقصة أو حساب إجباري أو أخطاء." } },
      },
    },
  },

  // GA4-07: paid campaign, sessions >= max(150, 2% of all), CR < 1/4 of store average.
  "TRK-04": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Paid campaigns in the last 28 days with at least 150 sessions and 2% of all sessions, each compared with the store's conversion rate. None converts under a quarter of it." },
          business: { summary: "No paid campaign is bringing lots of visits with almost no sales.", detail: "Campaigns with real traffic turn some of it into orders, so ad money isn't going to a dead campaign." },
          protect: "Check each new campaign's sales in GA4 after its first week of spend.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Paid campaigns with at least 150 sessions and 2% of all sessions in 28 days fail when they convert under a quarter of the store's rate. The campaign with the most visits among them is named, with the landing page most of its visits hit." },
          business: { summary: "A paid campaign brings lots of visits but almost no sales.", detail: "Its visits buy at under a quarter of the store's usual rate. Every day it runs, ad money goes to visits that don't buy. Either the ad reaches the wrong people or its landing page doesn't sell." },
          step: "Whoever runs the ads pauses the named campaign, or points it to a page that sells, such as the product it advertises.",
          doneWhen: "The campaign is paused, or its conversion rate in GA4 reaches at least a quarter of the store average over 28 days.",
        },
      },
      store_owner: {
        pass: { business: { summary: "None of your ad campaigns brings lots of visits with almost no sales.", detail: "Your campaigns with real traffic bring orders too, so ad money isn't going to a dead campaign." } },
        fail: { business: { summary: "One of your ad campaigns brings lots of visits but almost no sales.", detail: "You pay for every one of these visits. They buy at under a quarter of your store's usual rate. Every day it runs, that money comes back as almost nothing." } },
      },
      media_buyer: {
        fail: { business: { summary: "A paid campaign is buying clicks that almost never convert, so its CAC is far higher than it needs to be.", detail: "Its sessions convert at under a quarter of the store average in GA4, and CAC stays high every day it runs. Check the landing page first, then the audience and placements. You pause or redirect it." } },
      },
      agency: {
        fail: { business: { summary: "One paid campaign brings the store lots of visits but almost no sales.", detail: "Its visits convert at under a quarter of the store's average rate, so its spend returns little. The landing page and the audience are the two places to check." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لا توجد حملة مدفوعة ذات زيارات كافية تحوّل بأقل من ربع متوسط المتجر خلال 28 يومًا.", detail: "تُقارن كل حملة مدفوعة لها 150 جلسة على الأقل و 2% من كل الجلسات بمعدل تحويل المتجر." },
          business: { summary: "لا توجد حملة مدفوعة تجلب زيارات كثيرة بلا مبيعات تقريبًا.", detail: "الحملات ذات الزيارات الحقيقية تحوّل جزءًا منها إلى طلبات، فميزانية الإعلانات لا تذهب لحملة ميتة." },
          protect: "راجع مبيعات كل حملة جديدة في GA4 بعد أسبوعها الأول.",
        },
        fail: {
          technical: { summary: "حملة مدفوعة ذات زيارات كافية تحوّل بأقل من ربع متوسط المتجر خلال 28 يومًا.", detail: "تُقيَّم الحملات المدفوعة التي لها 150 جلسة على الأقل و 2% من كل الجلسات، وتفشل تحت ربع معدل المتجر. تُذكر الحملة الأكثر زيارات منها مع صفحة الهبوط التي تصلها معظم زياراتها." },
          business: { summary: "حملة مدفوعة تجلب زيارات كثيرة لكن مبيعاتها شبه معدومة.", detail: "زياراتها تشتري بأقل من ربع المعدل المعتاد للمتجر، وكل يوم تعمل فيه تذهب ميزانية الإعلان لزيارات لا تشتري. إما أن الإعلان يصل للجمهور الخطأ أو أن صفحة الهبوط لا تبيع." },
          step: "يوقف مسؤول الإعلانات الحملة المذكورة، أو يوجهها إلى صفحة تبيع، مثل صفحة المنتج الذي تعلن عنه.",
          doneWhen: "الحملة متوقفة، أو يصل معدل تحويلها في GA4 إلى ربع متوسط المتجر على الأقل خلال 28 يومًا.",
        },
      },
      store_owner: {
        pass: { business: { summary: "ما فيه حملة إعلانية عندك تجيب زيارات واجد بدون مبيعات.", detail: "حملاتك اللي عليها زيارات تجيب طلبات بعد، ففلوس الإعلان ما تروح لحملة ميتة." } },
        fail: { business: { summary: "عندك حملة إعلانية تجيب زيارات واجد بس مبيعاتها شبه صفر.", detail: "أنت تدفع على كل زيارة منها، وهي تشتري بأقل من ربع المعدل المعتاد لمتجرك. كل يوم تشتغل فيه، فلوسك ترجع لك تقريبًا ولا شي." } },
      },
      media_buyer: {
        fail: { business: { summary: "فيه حملة مدفوعة بتشتري كليكات تقريبًا مبتتحوّلش، فالـ CAC بتاعها أعلى بكتير من اللازم.", detail: "الـ sessions بتاعتها بتحوّل بأقل من ربع متوسط المتجر في GA4، والـ CAC هيفضل عالي كل يوم وهي شغالة. بص على الـ landing page الأول، بعدين الـ audience والـ placements. وقّفها أو غيّر وجهتها." } },
      },
      agency: {
        fail: { business: { summary: "حملة مدفوعة تجلب للمتجر زيارات كثيرة لكن مبيعاتها شبه معدومة.", detail: "زياراتها تحوّل بأقل من ربع متوسط المتجر، فإنفاقها لا يعود بالكثير. صفحة الهبوط والجمهور هما أول ما يُفحص." } },
      },
    },
  },

  // allOf GA4-19 (gateway source, 5+ sessions) and GA4-P06 (own domain as referral).
  "TRK-06": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "No payment gateway is a session source with 5+ sessions, and no store domain, myshopify.com or Shopify checkout host shows as a referral source in GA4's source/medium data." },
          business: { summary: "Sales stay credited to the ads and links that brought each shopper.", detail: "Payment pages like Tabby or Tamara and your own website don't show up as traffic sources." },
          protect: "Add each new payment provider to GA4's unwanted referrals list when you switch it on.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "When a shopper returns from a payment page, or crosses between the store's own domains without cross-domain setup, GA4 starts a new session credited to that site. The purchase then lands on the gateway or the store itself instead of the source that started the visit." },
          business: { summary: "Payment pages or your own website show up as where buyers came from.", detail: "A shopper coming back from a payment page or another of your domains gets counted as a new visit. The sale goes to that page instead of the ad or link that brought them. So you can't see which ads really sell." },
          step: "Whoever manages GA4 opens Admin, the web data stream, then Configure tag settings. Add each payment gateway under List unwanted referrals, and every store domain, including the checkout domain, under Configure your domains.",
          doneWhen: "Over 28 days after the change, GA4's session source/medium report shows no payment gateway with 5 or more sessions and no store domain with medium referral.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Payment pages like Tabby or Tamara, or your own website, get credit for your sales.", detail: "When a buyer comes back from paying, GA4 can count it as a new visit. The sale then goes to the payment page instead of the ad that brought them. You can't see which ads really bring sales." } },
      },
      media_buyer: {
        fail: { business: { summary: "Payment gateways or the store's own domain take credit for sales, so paid ROAS in GA4 reads lower than real.", detail: "Sales credited to a gateway or to the store itself are missing from your campaigns in GA4. Winning campaigns can look weak and get cut. Whoever manages GA4 fixes it in the data stream's tag settings." } },
      },
      agency: {
        fail: { business: { summary: "Payment pages or the store's own website get credit for the store's sales.", detail: "Shoppers coming back from a payment page or another store domain are counted as new visits. Their sales go to that page instead of the ad or link that brought them, so channel results in GA4 are understated." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لا تظهر بوابة دفع ولا نطاق المتجر نفسه كمصدر زيارات في GA4.", detail: "لا توجد بوابة دفع كمصدر جلسات بـ 5 جلسات أو أكثر، ولا يظهر نطاق المتجر أو myshopify.com أو نطاق دفع Shopify كمصدر إحالة (referral)." },
          business: { summary: "المبيعات تُنسب للإعلانات والروابط التي جلبت كل عميل.", detail: "صفحات الدفع مثل تابي وتمارا وموقع المتجر نفسه لا تظهر كمصادر زيارات." },
          protect: "أضف كل مزوّد دفع جديد إلى قائمة الإحالات غير المرغوبة في GA4 عند تفعيله.",
        },
        fail: {
          technical: { summary: "بوابة دفع أو نطاق المتجر نفسه يظهر كمصدر زيارات في GA4.", detail: "عندما يعود العميل من صفحة الدفع، أو ينتقل بين نطاقات المتجر دون إعداد النطاقات المتعددة، يبدأ GA4 جلسة جديدة منسوبة لذلك الموقع. فيُنسب الشراء للبوابة أو للمتجر نفسه بدل المصدر الذي بدأ الزيارة." },
          business: { summary: "صفحات الدفع أو موقع المتجر نفسه تظهر كمصدر جاء منه المشترون.", detail: "العميل العائد من صفحة دفع أو من نطاق آخر للمتجر يُحسب زيارة جديدة، فيُنسب البيع لتلك الصفحة بدل الإعلان أو الرابط الذي جلبه. والنتيجة أنك لا ترى أي الإعلانات تبيع فعلًا." },
          step: "يفتح مسؤول GA4 لوحة الإدارة ثم مصدر بيانات الويب ثم إعدادات العلامة. يضيف كل بوابة دفع في قائمة الإحالات غير المرغوبة، وكل نطاقات المتجر ومنها نطاق الدفع في إعداد النطاقات.",
          doneWhen: "خلال 28 يومًا بعد التعديل، لا يظهر في تقرير مصدر/وسيط الجلسة في GA4 أي بوابة دفع بـ 5 جلسات أو أكثر، ولا أي نطاق للمتجر بوسيط referral.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحات الدفع مثل تابي وتمارا، أو موقعك نفسه، تاخذ الفضل في مبيعاتك.", detail: "لما يرجع العميل من الدفع، GA4 ممكن يحسبها زيارة جديدة. فالبيعة تنحسب لصفحة الدفع بدل الإعلان اللي جابه، وما تقدر تعرف أي إعلان يجيب مبيعات فعلًا." } },
      },
      media_buyer: {
        fail: { business: { summary: "بوابات الدفع أو دومين المتجر نفسه واخدين الفضل في المبيعات، فالـ ROAS المدفوع في GA4 أقل من الحقيقي.", detail: "المبيعات المنسوبة لبوابة دفع أو للمتجر نفسه ناقصة من حملاتك في GA4. حملات كسبانة ممكن تبان ضعيفة وتتقفل. اللي ماسك GA4 يصلّحها من إعدادات الـ tag في الـ data stream." } },
      },
      agency: {
        fail: { business: { summary: "صفحات الدفع أو موقع المتجر نفسه تُنسب لها مبيعات المتجر.", detail: "العملاء العائدون من صفحة دفع أو نطاق آخر للمتجر يُحسبون زيارات جديدة، فتُنسب مبيعاتهم لتلك الصفحة بدل الإعلان أو الرابط الذي جلبهم. لذلك تظهر نتائج القنوات في GA4 أقل من حقيقتها." } },
      },
    },
  },

  // allOf GA4-15 (week on week) and GA4-P15 (realtime, drop, unengaged spike).
  "TRK-07": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Checked realtime users, the last 7 days against the 7 before, and each day of the last 28 for a spike of unengaged visits. No check failed." },
          business: { summary: "GA4 is recording visits now, with no sudden drop or jump.", detail: "Live visitors show up and weekly visits hold steady. No day in the last 28 had a burst of visits that did nothing." },
          protect: "Look at GA4 Realtime after every GTM publish or site release.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Fails on any of: no realtime users while the store averages 5+ visits per 30 minutes, zero visits in the last 7 days, a week-on-week fall over 40% (prior week 200+), or a day in the last 28 above twice the median day with 50+ extra visits that were almost all unengaged." },
          business: { summary: "GA4 shows signs of broken tracking: no live visitors, a sudden drop, or a jump of fake-looking visits.", detail: "A drop usually means tracking broke, so sales go unrecorded. A one-day jump of visits that do nothing is likely bots, and it drags your conversion rate down. Decisions made on these days use wrong numbers." },
          step: "Your developer checks the last GTM publish and site release for a removed or broken GA4 tag, then confirms in GTM Preview that it fires on every page. For a bot spike, find its source in GA4 and block or exclude it.",
          doneWhen: "GA4 Realtime shows active users, last 7 days' visits are no more than 40% below the week before, and no day in the last 28 has a spike of unengaged visits.",
        },
      },
      store_owner: {
        fail: { business: { summary: "GA4 isn't recording your visits properly right now, or it counted a burst of fake visits.", detail: "When tracking breaks, your sales stop showing up in reports. A day of fake visits makes your store look like it sells worse than it does. Any decision made on those days uses wrong numbers." } },
      },
      media_buyer: {
        fail: { business: { summary: "GA4 shows a tracking drop or a bot spike, so it misses sales and reported ROAS reads lower than real, or bot visits drag CVR down.", detail: "Judging campaigns on these days can cut ones that are working. Compare platform conversions with GA4 for the same dates before you act. The tag fix is for the store's developer." } },
      },
      agency: {
        fail: { business: { summary: "The store's GA4 shows a tracking drop or a burst of fake-looking visits.", detail: "A drop means sales go unrecorded, and bot visits push the conversion rate down. Reports covering these days understate the store's results." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "GA4 يسجل زوارًا الآن، بلا هبوط مفاجئ أسبوعي ولا قفزة زيارات غير متفاعلة خلال 28 يومًا.", detail: "فحصنا المستخدمين في الوقت الفعلي، وآخر 7 أيام مقابل الأسبوع السابق، وكل يوم من آخر 28 يومًا بحثًا عن قفزة زيارات غير متفاعلة." },
          business: { summary: "GA4 يسجل الزيارات الآن، بلا هبوط مفاجئ أو قفزة غريبة.", detail: "الزوار الحاليون يظهرون والزيارات الأسبوعية ثابتة، ولم يشهد أي يوم من آخر 28 يومًا موجة زيارات بلا تفاعل." },
          protect: "راجع تقرير الوقت الفعلي في GA4 بعد كل نشر في GTM أو تحديث للموقع.",
        },
        fail: {
          technical: { summary: "علامات على خلل في التتبع: لا مستخدمين حاليين، أو هبوط حاد في الزيارات، أو قفزة زيارات غير متفاعلة.", detail: "يفشل البند عند أي من: لا مستخدمين في الوقت الفعلي بينما يستقبل المتجر 5 زيارات أو أكثر كل 30 دقيقة في المتوسط، أو صفر زيارات في آخر 7 أيام، أو هبوط أسبوعي يتجاوز 40% (مع 200 زيارة أو أكثر في الأسبوع السابق)، أو يوم في آخر 28 يومًا تجاوز ضعف اليوم الوسيط بـ 50 زيارة إضافية أو أكثر شبه خالية من التفاعل." },
          business: { summary: "GA4 يُظهر علامات على تتبع معطل: لا زوار حاليين، أو هبوط مفاجئ، أو قفزة زيارات تبدو وهمية.", detail: "الهبوط يعني غالبًا أن التتبع تعطل فلا تُسجَّل المبيعات. وقفزة يوم واحد من زيارات بلا تفاعل غالبًا روبوتات، وتخفض معدل التحويل. أي قرار يُبنى على هذه الأيام يعتمد على أرقام خاطئة." },
          step: "يراجع المطوّر آخر نشر في GTM وآخر تحديث للموقع بحثًا عن علامة GA4 محذوفة أو معطلة، ثم يتأكد في معاينة GTM أنها تعمل في كل الصفحات. في حالة قفزة الروبوتات، حدد مصدرها في GA4 واحجبه أو استبعده.",
          doneWhen: "تقرير الوقت الفعلي في GA4 يعرض مستخدمين، وزيارات آخر 7 أيام لا تقل بأكثر من 40% عن الأسبوع السابق، ولا يوجد يوم في آخر 28 يومًا به قفزة زيارات غير متفاعلة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "GA4 ما يسجل زيارات متجرك صح الحين، أو حسب موجة زيارات وهمية.", detail: "إذا التتبع خرب، مبيعاتك ما تطلع في التقارير. ويوم فيه زيارات وهمية يخلي متجرك يبان إنه يبيع أقل من الحقيقة. وأي قرار على هالأيام مبني على أرقام غلط." } },
      },
      media_buyer: {
        fail: { business: { summary: "GA4 فيه هبوط في التتبع أو spike من bots، فبيفوّت مبيعات والـ ROAS المعروض أقل من الحقيقي، أو الـ bots بتنزّل الـ CVR.", detail: "لو حكمت على الحملات بالأيام دي ممكن تقفل حملات شغالة كويس. قارن conversions المنصة بـ GA4 لنفس التواريخ قبل ما تاخد قرار. تصليح الـ tag عند مطوّر المتجر." } },
      },
      agency: {
        fail: { business: { summary: "GA4 في المتجر يُظهر هبوطًا في التتبع أو موجة زيارات تبدو وهمية.", detail: "الهبوط يعني مبيعات غير مسجلة، والزيارات الوهمية تخفض معدل التحويل. التقارير التي تغطي هذه الأيام تُظهر نتائج المتجر أقل من حقيقتها." } },
      },
    },
  },

  // GA4-17: core funnel events present in 28 days, no tracking-gap step.
  "TRK-08": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "view_item, add_to_cart, begin_checkout (or add_shipping_info) and purchase all record in 28 days. No step has over 5% more users than the step before or a rate under 30% of its benchmark." },
          business: { summary: "Every step of the buying path is recorded in GA4.", detail: "You can see where shoppers drop off, from product view to purchase, and fix the right step." },
          protect: "Test each funnel event in GTM Preview after theme, app or checkout changes.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Checked view_item, add_to_cart, begin_checkout (or add_shipping_info) and purchase over 28 days. A step fails as a tracking gap when it has over 5% more users than the step before, or a rate under 30% of its benchmark: product to cart 8%, cart to checkout 50% (40% to add_shipping_info), checkout to purchase 50% (60% from add_shipping_info)." },
          business: { summary: "Some steps of the buying path are missing in GA4, or their counts don't add up.", detail: "Where a step isn't recorded, you can't see where shoppers drop off. Ad platforms that use the same events also get fewer signals to learn from." },
          step: "Your developer adds or fixes the missing events in GTM, then tests each step in GTM Preview and GA4 DebugView: view a product, add to cart, start checkout, buy.",
          doneWhen: "All four events record in GA4 over 28 days, and no step has over 5% more users than the step before or a rate under 30% of its benchmark.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some steps of buying in your store aren't recorded properly.", detail: "If a step isn't recorded, you can't tell where customers give up. Your ads also learn from fewer signals, so finding buyers costs more." } },
      },
      media_buyer: {
        fail: { business: { summary: "Funnel events are missing or miscounted, so platforms get a weaker signal and retargeting audiences shrink.", detail: "Fewer add-to-cart and checkout events mean the algorithm learns slower and CAC stays higher. Fixing them lifts ROAS over time. The store's developer fixes the events in GTM." } },
      },
      agency: {
        fail: { business: { summary: "Some steps of the store's buying path are missing in GA4, or their counts don't add up.", detail: "Without every step recorded, the drop-off point can't be found. Ad platforms using the same events also learn from fewer signals." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "كل أحداث مسار الشراء الأساسية تُسجَّل في GA4 خلال 28 يومًا بلا خلل في أي خطوة.", detail: "تُسجَّل view_item و add_to_cart و begin_checkout (أو add_shipping_info) و purchase، ولا توجد خطوة أعلى من سابقتها بأكثر من 5% أو بمعدل أقل من 30% من معيارها." },
          business: { summary: "كل خطوات مسار الشراء تُسجَّل في GA4.", detail: "يمكنك رؤية أين يتوقف العملاء من مشاهدة المنتج حتى الشراء، وإصلاح الخطوة الصحيحة." },
          protect: "اختبر كل حدث في معاينة GTM بعد أي تغيير في القالب أو التطبيقات أو صفحة الدفع.",
        },
        fail: {
          technical: { summary: "حدث أساسي في مسار الشراء غائب عن GA4 خلال 28 يومًا، أو خطوة بها خلل في التتبع.", detail: "الأحداث المفحوصة: view_item و add_to_cart و begin_checkout (أو add_shipping_info) و purchase. تفشل الخطوة إذا زادت عن سابقتها بأكثر من 5% أو قل معدلها عن 30% من معيارها: المنتج إلى السلة 8%، والسلة إلى الدفع 50% (أو 40% إلى add_shipping_info)، والدفع إلى الشراء 50% (أو 60% من add_shipping_info)." },
          business: { summary: "بعض خطوات مسار الشراء غائبة عن GA4، أو أن أرقامها غير منطقية.", detail: "حين لا تُسجَّل خطوة، لا يمكن معرفة أين يتوقف العملاء. ومنصات الإعلان التي تستخدم الأحداث نفسها تتعلم من إشارات أقل." },
          step: "يضيف المطوّر الأحداث الناقصة أو يصلحها في GTM، ثم يختبر كل خطوة في معاينة GTM و DebugView في GA4: مشاهدة منتج، ثم إضافة للسلة، ثم بدء الدفع، ثم الشراء.",
          doneWhen: "الأحداث الأربعة تُسجَّل في GA4 خلال 28 يومًا، ولا توجد خطوة أعلى من سابقتها بأكثر من 5% أو بمعدل أقل من 30% من معيارها.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بعض خطوات الشراء في متجرك ما تنسجل صح.", detail: "إذا خطوة ما تنسجل، ما تقدر تعرف وين العملاء يتركون. وإعلاناتك تتعلم من إشارات أقل، فيصير الوصول للمشترين أغلى." } },
      },
      media_buyer: {
        fail: { business: { summary: "أحداث الـ funnel ناقصة أو متعدّة غلط، فالمنصات بتاخد signal أضعف والـ retargeting audiences بتصغر.", detail: "أحداث add to cart و checkout أقل معناها الـ algorithm بيتعلم أبطأ والـ CAC بيفضل عالي. تصليحها بيرفع الـ ROAS مع الوقت. مطوّر المتجر يصلّح الأحداث في GTM." } },
      },
      agency: {
        fail: { business: { summary: "بعض خطوات مسار الشراء في المتجر غائبة عن GA4، أو أن أرقامها غير منطقية.", detail: "دون تسجيل كل خطوة لا يمكن تحديد نقطة توقف العملاء. ومنصات الإعلان التي تستخدم الأحداث نفسها تتعلم من إشارات أقل." } },
      },
    },
  },

  // GA4-06: landing page with sessions >= max(200, 3% of all), CR < 1/3 of store average.
  "TRK-21": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Landing pages with at least 200 sessions and 3% of all sessions in 28 days, each compared with the store's conversion rate. None converts under a third of it." },
          business: { summary: "Every busy entry page on your site turns some visits into sales.", detail: "Traffic landing on your main pages has a fair chance to buy, wherever it comes from." },
          protect: "Check a new landing page's conversion in GA4 before sending ads to it at scale.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Landing pages with at least 200 sessions and 3% of all sessions in 28 days fail when they convert under a third of the store's rate. The one with the most sessions is named. Traffic from every channel counts, paid or not." },
          business: { summary: "A page where many visits start sells far less than the rest of the store.", detail: "Visitors who land there buy at under a third of your usual rate. Whatever sends them there pays off less than it could. The page itself, or a mismatch with the ad or link, is the usual cause." },
          step: "Open the named page on a phone and fix what the Conversion review flagged there. Until it sells, point ads at a page that does.",
          doneWhen: "That page converts at a third of the store average or better in GA4 over 28 days.",
        },
      },
      store_owner: {
        fail: { business: { summary: "One of your busiest entry pages brings visits but very few sales.", detail: "People who start their visit there buy at under a third of your store's usual rate. If you pay for ads to that page, that money returns little." } },
      },
      media_buyer: {
        fail: { business: { summary: "A busy landing page converts at under a third of the store average, so any paid clicks sent there have low CVR and high CAC.", detail: "This counts all traffic, so check in Ads Manager which campaigns land there. Moving those ads to a page that sells, or fixing this one, raises ROAS on the same spend. The page fix is for the store's developer or content team." } },
      },
      agency: {
        fail: { business: { summary: "One of the store's busiest landing pages converts far below the store average.", detail: "Visits starting there buy at under a third of the store's usual rate. Any campaign or link pointing to it returns less than it could." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لا توجد صفحة هبوط ذات زيارات كافية تحوّل بأقل من ثلث متوسط المتجر خلال 28 يومًا.", detail: "تُقارن كل صفحة هبوط لها 200 جلسة على الأقل و 3% من كل الجلسات بمعدل تحويل المتجر." },
          business: { summary: "كل صفحة دخول مزدحمة في الموقع تحوّل جزءًا من زياراتها إلى مبيعات.", detail: "الزوار الذين يصلون إلى الصفحات الرئيسية لديهم فرصة جيدة للشراء أيًا كان مصدرهم." },
          protect: "راجع تحويل أي صفحة هبوط جديدة في GA4 قبل توجيه إعلانات كثيرة إليها.",
        },
        fail: {
          technical: { summary: "صفحة هبوط ذات زيارات كافية تحوّل بأقل من ثلث متوسط المتجر خلال 28 يومًا.", detail: "تُقيَّم صفحات الهبوط التي لها 200 جلسة على الأقل و 3% من كل الجلسات، وتفشل تحت ثلث معدل المتجر. تُذكر الصفحة الأكثر جلسات منها، وتُحسب زيارات كل القنوات المدفوعة وغير المدفوعة." },
          business: { summary: "صفحة تبدأ منها زيارات كثيرة تبيع أقل بكثير من بقية المتجر.", detail: "من يصل إليها يشتري بأقل من ثلث المعدل المعتاد، فمصدر هذه الزيارات يعود بأقل مما يمكن. السبب المعتاد هو الصفحة نفسها أو عدم تطابقها مع الإعلان أو الرابط." },
          step: "افتح الصفحة المذكورة على الجوال وأصلح ما رصدته مراجعة التحويل فيها. وإلى أن تبيع، وجّه الإعلانات إلى صفحة تبيع.",
          doneWhen: "تحوّل تلك الصفحة بثلث متوسط المتجر أو أكثر في GA4 خلال 28 يومًا.",
        },
      },
      store_owner: {
        fail: { business: { summary: "وحدة من أكثر صفحات الدخول زيارة في متجرك تجيب زيارات بس مبيعاتها قليلة واجد.", detail: "اللي يبدون زيارتهم منها يشترون بأقل من ثلث المعدل المعتاد لمتجرك. وإذا تدفع إعلانات لهالصفحة، فلوسها ترجع لك قليل." } },
      },
      media_buyer: {
        fail: { business: { summary: "Landing page عليها ترافيك كتير بتحوّل بأقل من ثلث متوسط المتجر، فأي كليكات مدفوعة رايحة لها الـ CVR بتاعها واطي والـ CAC عالي.", detail: "الرقم ده لكل الترافيك، فشوف في Ads Manager أنهي حملات بتنزل عليها. نقل الإعلانات دي لصفحة بتبيع، أو تصليح الصفحة، بيرفع الـ ROAS على نفس الصرف. تصليح الصفحة عند مطوّر المتجر أو فريق المحتوى." } },
      },
      agency: {
        fail: { business: { summary: "إحدى أكثر صفحات الهبوط زيارة في المتجر تحوّل بأقل بكثير من متوسط المتجر.", detail: "الزيارات التي تبدأ منها تشتري بأقل من ثلث المعدل المعتاد للمتجر، فأي حملة أو رابط يوجّه إليها يعود بأقل مما يمكن." } },
      },
    },
  },

  // GA4-10: product page with views >= max(100, 2% of product views), add rate < half the average.
  "TRK-22": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Product pages with at least 100 views and 2% of all product views in 28 days, each compared with the add-to-cart rate across product pages. None is under half of it." },
          business: { summary: "Your most-viewed products get added to cart at a normal rate.", detail: "No popular product is soaking up visits without turning them into carts." },
          protect: "Watch this when a product's price, stock or photos change.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Product pages with at least 100 views and 2% of all product views in 28 days fail when their add-to-cart rate is under half the average across product pages. The one losing the most adds is named." },
          business: { summary: "A popular product gets many views but few adds to cart.", detail: "Shoppers open it but add it to cart at under half the usual rate. The cause is usually on that page: the price, photos, sizes or stock." },
          step: "Fix the named product page: check the price, photos, stock and sizes. The Conversion review checks this exact product.",
          doneWhen: "That product's add-to-cart rate is at least half the average across product pages in GA4 over 28 days.",
        },
      },
      store_owner: {
        fail: { business: { summary: "One of your most-viewed products gets opened a lot but rarely added to cart.", detail: "People want to see it but don't take it. Check its price, photos, sizes and stock. Each visit to that page that ends without a cart is a sale you could have had." } },
      },
      media_buyer: {
        fail: { business: { summary: "A popular product page gets views but few adds to cart, so paid clicks sent there are wasted and CVR drops.", detail: "If your ads feature this product, CAC on them is higher than it needs to be. Fixing the page, or switching the featured product, is expected to lift CVR and ROAS. The page fix is for the store owner or content team." } },
      },
      agency: {
        fail: { business: { summary: "One of the store's most-viewed products is rarely added to cart.", detail: "Its add-to-cart rate is under half the store's product average. Price, photos, sizes and stock on that page are the first things to check." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لا يوجد منتج ذو مشاهدات كافية يُضاف للسلة بأقل من نصف متوسط المنتجات خلال 28 يومًا.", detail: "يُقارن كل منتج له 100 مشاهدة على الأقل و 2% من كل مشاهدات المنتجات بمعدل الإضافة للسلة عبر صفحات المنتجات." },
          business: { summary: "المنتجات الأكثر مشاهدة تُضاف للسلة بمعدل طبيعي.", detail: "لا يوجد منتج شائع يستهلك الزيارات دون أن يحوّلها إلى سلات." },
          protect: "راقب هذا المعدل عند تغيير سعر منتج أو مخزونه أو صوره.",
        },
        fail: {
          technical: { summary: "منتج ذو مشاهدات كافية يُضاف للسلة بأقل من نصف متوسط المنتجات خلال 28 يومًا.", detail: "تُقيَّم صفحات المنتجات التي لها 100 مشاهدة على الأقل و 2% من كل مشاهدات المنتجات، وتفشل إذا قل معدل إضافتها للسلة عن نصف المتوسط. يُذكر المنتج الذي يخسر أكبر عدد من الإضافات." },
          business: { summary: "منتج شائع يحصل على مشاهدات كثيرة وإضافات قليلة للسلة.", detail: "العملاء يفتحونه لكن يضيفونه للسلة بأقل من نصف المعدل المعتاد. السبب غالبًا في الصفحة نفسها: السعر أو الصور أو المقاسات أو المخزون." },
          step: "أصلح صفحة المنتج المذكور: راجع السعر والصور والمخزون والمقاسات. مراجعة التحويل تفحص هذا المنتج نفسه.",
          doneWhen: "معدل إضافة ذلك المنتج للسلة يساوي نصف متوسط صفحات المنتجات على الأقل في GA4 خلال 28 يومًا.",
        },
      },
      store_owner: {
        fail: { business: { summary: "واحد من أكثر منتجاتك مشاهدة ينفتح واجد بس قليل أحد يضغط أضف للسلة.", detail: "الناس تبي تشوفه بس ما تاخذه. شيّك على سعره وصوره ومقاساته والمخزون. كل زيارة لهالصفحة تنتهي بدون سلة هي بيعة كانت ممكن تصير." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحة منتج شعبية عليها views كتير بس add to cart قليل، فالكليكات المدفوعة اللي رايحة لها ضايعة والـ CVR بينزل.", detail: "لو إعلاناتك بتعرض المنتج ده، الـ CAC عليها أعلى من اللازم. تصليح الصفحة، أو تغيير المنتج اللي في الإعلان، متوقع يرفع الـ CVR والـ ROAS. تصليح الصفحة عند صاحب المتجر أو فريق المحتوى." } },
      },
      agency: {
        fail: { business: { summary: "أحد أكثر منتجات المتجر مشاهدة نادرًا ما يُضاف للسلة.", detail: "معدل إضافته للسلة أقل من نصف متوسط منتجات المتجر. أول ما يُفحص في صفحته: السعر والصور والمقاسات والمخزون." } },
      },
    },
  },
};
