import type { PointTemplate } from "./types.js";

// GA4 points TRK-09, TRK-10, TRK-25, TRK-27, TRK-35, TRK-36, TRK-37, TRK-38.
// Thresholds and conditions follow ga4-facts.ts (GA4-18, P01, P03, P04, 08,
// P09, P16, 20, 09, 12, 13, 22). The allOf points (09, 10, 25) hand over only
// {facts}, the list of fact ids; the others only {fact}. None carry money.
export const TRACKING_3: Record<string, PointTemplate> = {
  "TRK-09": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Over 28 days, purchase events and transactions are within 10% of each other, purchases carry revenue and a currency, and no order ID sits on more than one purchase event." },
          business: { summary: "Each order shows up in GA4 once, with its value.", detail: "The sales and revenue figures in this report rest on this count, so they start from real orders." },
          protect: "Place a test order after any checkout, theme or tag change and check it appears once in GA4.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Failing checks: {facts}. GA4-18 fails when purchase events and transactions differ by more than 10%, revenue is zero, no currency is sent, or no purchase is recorded at all. GA4-P01 fails when one order ID is counted on more than one purchase event." },
          business: { summary: "GA4 does not count your orders one by one.", detail: "Orders may be counted twice, go missing, or arrive without a value or currency. Every sales and revenue figure built on GA4 is then off, and budget decisions follow the wrong numbers." },
          step: "Ask your developer to fire the purchase tag once per order, with the order ID, the value and the currency.",
          doneWhen: "Over 28 days in GA4, no order ID is on more than one purchase event, purchase events and transactions are within 10% of each other, and purchases carry revenue and a currency.",
        },
      },
      store_owner: {
        fail: { business: { summary: "GA4 does not count your orders correctly.", detail: "Some of your orders show twice, go missing, or show without their value. Every money figure you see in GA4 is then wrong. You can't tell which ads or products earn the most." } },
      },
      media_buyer: {
        fail: { business: { summary: "GA4 counts some orders twice or without value, so GA4 revenue and imported Google Ads conversions read higher than real.", detail: "A repeated order ID adds a purchase that never happened, so losing campaigns can look like winners in GA4. A purchase/transaction gap, a missing value or currency, or no purchase at all makes the count unreliable. The developer fixes it in the purchase tag. Reported ROAS may drop after it, which is the real number showing." } },
      },
      agency: {
        fail: { business: { summary: "GA4 does not count the store's orders one by one.", detail: "Orders may be counted twice, go missing, or arrive without a value or currency. Every revenue figure in the store's GA4 is then off, and so is any report built on it." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "كل طلب يُسجَّل مرة واحدة في GA4 مع إيراده وعملته خلال 28 يومًا.", detail: "أحداث الشراء والمعاملات متقاربة في حدود 10%، والمشتريات تحمل إيرادًا وعملة، ولا يتكرر رقم طلب على أكثر من حدث شراء." },
          business: { summary: "كل طلب يظهر في GA4 مرة واحدة بقيمته.", detail: "أرقام المبيعات والإيراد في هذا التقرير مبنية على هذا العدد، فهي تبدأ من طلبات حقيقية." },
          protect: "أجرِ طلبًا تجريبيًا بعد أي تغيير في الدفع أو القالب أو الوسوم وتأكد أنه يظهر مرة واحدة في GA4.",
        },
        fail: {
          technical: { summary: "عدّ المشتريات في GA4 لا يطابق الطلبات: رقم طلب مكرر، أو فرق أكبر من 10% بين أحداث الشراء والمعاملات، أو مشتريات بلا إيراد أو عملة.", detail: "الفحوص الفاشلة: {facts}. يفشل GA4-18 عند فرق أكبر من 10% بين أحداث الشراء والمعاملات، أو إيراد صفري، أو غياب العملة، أو عدم تسجيل أي شراء. ويفشل GA4-P01 عند تكرار رقم طلب على أكثر من حدث شراء." },
          business: { summary: "GA4 لا يعدّ الطلبات واحدًا واحدًا.", detail: "بعض الطلبات تُحسب مرتين أو لا تُسجَّل أو تصل بلا قيمة أو عملة. فكل رقم مبيعات أو إيراد مبني على GA4 غير دقيق، وتُبنى قرارات الميزانية على أرقام خاطئة." },
          step: "اطلب من المطوّر أن يُطلق وسم الشراء مرة واحدة لكل طلب، مع رقم الطلب والقيمة والعملة.",
          doneWhen: "خلال 28 يومًا في GA4: لا يتكرر رقم طلب على أكثر من حدث شراء، والفرق بين أحداث الشراء والمعاملات 10% أو أقل، والمشتريات تحمل إيرادًا وعملة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "GA4 ما يحسب طلباتك صح.", detail: "بعض طلباتك تطلع مرتين، أو ما تطلع أبدًا، أو تطلع بدون قيمتها. فكل رقم فلوس تشوفه في GA4 غلط. وما تقدر تعرف أي إعلان أو منتج يجيب لك أكثر." } },
      },
      media_buyer: {
        fail: { business: { summary: "GA4 بيعدّ أوردرات مرتين أو من غير قيمة، فالإيراد في GA4 والـ conversions اللي بتتسحب لـ Google Ads أعلى من الحقيقي.", detail: "الـ order ID المكرر بيضيف Purchase محصلش، فحملات خسرانة تبان كسبانة في GA4. والفرق بين الـ purchases والـ transactions، أو غياب القيمة أو العملة، أو عدم تسجيل أي Purchase بيخلي العدّ مش مضمون. التصليح في وسم الشراء عند المطوّر، والـ ROAS المعروض ممكن ينزل بعده لأنه الرقم الحقيقي." } },
      },
      agency: {
        fail: { business: { summary: "GA4 لا يعدّ طلبات «المتجر» واحدًا واحدًا.", detail: "بعض الطلبات تُحسب مرتين أو لا تُسجَّل أو تصل بلا قيمة أو عملة. فكل رقم إيراد في GA4 الخاص بـ«المتجر» غير دقيق، وكذلك أي تقرير مبني عليه." } },
      },
    },
  },
  "TRK-10": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Over 28 days, purchases carry a non-zero value in one currency with none unset, at most 5% of items sold lack a product name, and item revenue is within 5% of order revenue." },
          business: { summary: "Each sale reaches GA4 with its value and the products in it.", detail: "Revenue per product and per campaign comes from these values, so product and budget choices rest on real sales." },
          protect: "Check one test order's value, currency and items in GA4 DebugView after any change to products or checkout.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Failing checks: {facts}. GA4-P03 fails on zero purchase revenue, more than one currency, purchases with no currency, or item revenue missing or over 5% above purchase revenue. GA4-P04 fails when no items are recorded, over 5% of items sold have no product name, or item revenue is more than 5% away from order revenue." },
          business: { summary: "Sales reach GA4 with a missing or wrong value, or without the products in them.", detail: "Revenue per campaign and per product is then wrong or blank. You can't see which products sell, and ad spend is judged on values that don't match your orders." },
          step: "Ask your developer to send the purchase event with value as a number, the store currency, and the full items list with product names.",
          doneWhen: "Over 28 days in GA4, purchase revenue is above zero in one currency with none unset, at most 5% of items sold have no product name, and item revenue is within 5% of order revenue.",
        },
      },
      store_owner: {
        fail: { business: { summary: "GA4 doesn't record your sales value or your products correctly.", detail: "You can't see which products sell, or how much each one brings in. Restock and promotion choices end up based on guesses." } },
      },
      media_buyer: {
        fail: { business: { summary: "GA4 purchase values are zero, in mixed currencies, or don't match their items, so reported ROAS reads lower than real.", detail: "Value-based bidding in Google Ads learns from these numbers, and winning campaigns can look weak and get cut. Product-level ROAS is blank or wrong when items have no names. The developer fixes it in the purchase event." } },
      },
      agency: {
        fail: { business: { summary: "Sales reach the store's GA4 with a missing or wrong value, or without their products.", detail: "Revenue per campaign and per product is then wrong or blank. The store can't see which products sell, and ad results are judged on values that don't match its orders." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "المشتريات في GA4 تحمل قيمة بعملة واحدة وقائمة منتجات مكتملة خلال 28 يومًا.", detail: "القيمة أكبر من صفر بعملة واحدة دون مشتريات بلا عملة، و5% أو أقل من القطع المباعة بلا اسم منتج، وإيراد المنتجات في حدود 5% من إيراد الطلبات." },
          business: { summary: "كل عملية بيع تصل إلى GA4 بقيمتها ومنتجاتها.", detail: "إيراد كل منتج وكل حملة يأتي من هذه القيم، فقرارات المنتجات والميزانية مبنية على مبيعات حقيقية." },
          protect: "افحص قيمة طلب تجريبي وعملته ومنتجاته في DebugView بعد أي تغيير في المنتجات أو الدفع.",
        },
        fail: {
          technical: { summary: "قيمة المشتريات في GA4 صفرية أو بأكثر من عملة أو بلا عملة، أو منتجاتها ناقصة أو لا تطابق إيراد الطلبات.", detail: "الفحوص الفاشلة: {facts}. يفشل GA4-P03 عند إيراد صفري، أو أكثر من عملة، أو مشتريات بلا عملة، أو إيراد منتجات غائب أو أعلى من إيراد الشراء بأكثر من 5%. ويفشل GA4-P04 عند غياب المنتجات، أو أكثر من 5% من القطع المباعة بلا اسم، أو فرق أكبر من 5% بين إيراد المنتجات وإيراد الطلبات." },
          business: { summary: "المبيعات تصل إلى GA4 بقيمة ناقصة أو خاطئة، أو بلا منتجاتها.", detail: "إيراد كل حملة وكل منتج يصبح خاطئًا أو فارغًا. فلا يظهر ما يُباع من المنتجات، ويُحكم على الإنفاق الإعلاني بقيم لا تطابق الطلبات." },
          step: "اطلب من المطوّر إرسال حدث الشراء مع القيمة كرقم، وعملة المتجر، وقائمة المنتجات كاملة بأسمائها.",
          doneWhen: "خلال 28 يومًا في GA4: إيراد الشراء أكبر من صفر بعملة واحدة دون مشتريات بلا عملة، و5% أو أقل من القطع المباعة بلا اسم منتج، وإيراد المنتجات في حدود 5% من إيراد الطلبات.",
        },
      },
      store_owner: {
        fail: { business: { summary: "GA4 ما يسجّل قيمة مبيعاتك أو منتجاتك صح.", detail: "ما تقدر تعرف أي منتج يبيع، ولا كم يجيب لك كل منتج. فقرارات التخزين والعروض تصير على التخمين." } },
      },
      media_buyer: {
        fail: { business: { summary: "قيم الـ Purchase في GA4 صفر أو بأكتر من عملة أو مش مطابقة للمنتجات، فالـ ROAS المعروض أقل من الحقيقي.", detail: "الـ value-based bidding في Google Ads بيتعلم من الأرقام دي، فحملات كسبانة ممكن تبان ضعيفة وتتقفل. والـ ROAS على مستوى المنتج فاضي أو غلط لو المنتجات من غير أسماء. التصليح عند المطوّر في حدث الشراء." } },
      },
      agency: {
        fail: { business: { summary: "المبيعات تصل إلى GA4 الخاص بـ«المتجر» بقيمة ناقصة أو خاطئة، أو بلا منتجاتها.", detail: "إيراد كل حملة وكل منتج يصبح خاطئًا أو فارغًا. فلا يرى «المتجر» ما يُباع من منتجاته، ويُحكم على نتائج الإعلانات بقيم لا تطابق طلباته." } },
      },
    },
  },
  "TRK-25": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Unassigned, (not set) and (other) sessions are 10% of sessions or less, and no tagged campaign traffic with 5+ visits lands in Unassigned or Referral." },
          business: { summary: "GA4 knows where almost every visit comes from.", detail: "Each channel and campaign gets credit for its own visits and sales, so budget can follow results." },
          protect: "Put UTM tags on every new ad, bio link, WhatsApp and SMS link before it goes live.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Failing checks: {facts}. GA4-08 fails when Unassigned, (not set) and (other) sessions are over 10% of sessions. GA4-P09 also fails when tagged traffic with 5+ visits lands in Unassigned, or in Referral with a campaign set, which usually means an unrecognised utm_medium." },
          business: { summary: "Too many visits reach GA4 with no known source.", detail: "Sales from those visits are not credited to the ad, post or message that brought them. Channels that work look weaker than they are, and budget decisions on them are guesses." },
          step: "Add UTM tags to every link you share (ads, bio links, WhatsApp, SMS), using mediums GA4 knows such as cpc, paid_social, email or sms.",
          doneWhen: "Unassigned, (not set) and (other) visits are 10% or less of visits in GA4 over 28 days, and no tagged campaign traffic with 5+ visits lands in Unassigned or Referral.",
        },
      },
      store_owner: {
        fail: { business: { summary: "For many visits, GA4 can't tell where they came from.", detail: "Sales from those visits are not linked to any ad or post. You can't see what brings buyers, so you can't put more money into it." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid sessions land in Unassigned or Referral, so paid ROAS in GA4 reads lower than real.", detail: "Sales from those sessions are not credited to your campaigns, so working ads look weaker in GA4 than in Ads Manager. Most cases are missing or non-standard UTM mediums on ad links. You fix it in the ad URLs and UTM templates." } },
      },
      agency: {
        fail: { business: { summary: "Too many of the store's visits reach GA4 with no known source.", detail: "Sales from those visits are not credited to the ad, post or message that brought them. The store's working channels look weaker than they are." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "زيارات Unassigned و(not set) و(other) لا تتجاوز 10% من الزيارات، ولا تقع زيارات حملات موسومة خارج القنوات المدفوعة.", detail: "لا توجد زيارات حملات موسومة بخمس زيارات أو أكثر في Unassigned أو Referral." },
          business: { summary: "GA4 يعرف مصدر كل الزيارات تقريبًا.", detail: "كل قناة وحملة تأخذ نصيبها من الزيارات والمبيعات، فتتبع الميزانية النتائج." },
          protect: "ضع وسوم UTM على كل إعلان أو رابط بايو أو رسالة واتساب أو SMS جديدة قبل نشرها.",
        },
        fail: {
          technical: { summary: "زيارات بلا مصدر معروف تتجاوز 10%، أو زيارات حملات موسومة تقع في Unassigned أو Referral.", detail: "الفحوص الفاشلة: {facts}. يفشل GA4-08 عندما تتجاوز زيارات Unassigned و(not set) و(other) نسبة 10% من الزيارات. ويفشل GA4-P09 أيضًا عندما تقع زيارات موسومة بخمس زيارات أو أكثر في Unassigned، أو في Referral مع اسم حملة، وغالبًا السبب utm_medium غير معروف لـ GA4." },
          business: { summary: "زيارات كثيرة تصل إلى GA4 بلا مصدر معروف.", detail: "مبيعات هذه الزيارات لا تُنسب إلى الإعلان أو المنشور أو الرسالة التي جلبتها. فتبدو القنوات الناجحة أضعف مما هي، وتصبح قرارات الميزانية تخمينًا." },
          step: "أضف وسوم UTM لكل رابط تشاركه (إعلانات، روابط بايو، واتساب، SMS) بقيم medium يعرفها GA4 مثل cpc أو paid_social أو email أو sms.",
          doneWhen: "زيارات Unassigned و(not set) و(other) 10% أو أقل من الزيارات في GA4 خلال 28 يومًا، ولا تقع زيارات حملات موسومة بخمس زيارات أو أكثر في Unassigned أو Referral.",
        },
      },
      store_owner: {
        fail: { business: { summary: "زيارات كثيرة ما يعرف GA4 من وين جات.", detail: "مبيعات هالزيارات ما تنربط بأي إعلان أو منشور. فما تعرف وش يجيب لك المشترين، وما تقدر تزيد صرفك عليه." } },
      },
      media_buyer: {
        fail: { business: { summary: "سيشنز مدفوعة بتقع في Unassigned أو Referral، فالـ ROAS المدفوع في GA4 أقل من الحقيقي.", detail: "مبيعات السيشنز دي مش بتتنسب لحملاتك، فإعلانات شغالة تبان أضعف في GA4 من Ads Manager. غالبًا السبب UTM medium ناقص أو مش قياسي على روابط الإعلانات. التصليح عندك في روابط الإعلانات وقوالب الـ UTM." } },
      },
      agency: {
        fail: { business: { summary: "زيارات كثيرة لـ«المتجر» تصل إلى GA4 بلا مصدر معروف.", detail: "مبيعات هذه الزيارات لا تُنسب إلى الإعلان أو المنشور أو الرسالة التي جلبتها. فتبدو القنوات الناجحة لـ«المتجر» أضعف مما هي." } },
      },
    },
  },
  "TRK-27": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Key events from the GA4 property ({fact}): purchase is marked key, and none of page_view, scroll, session_start, first_visit, user_engagement, click, view_item or form_start is." },
          business: { summary: "Sales count as conversions in GA4, and browsing events such as page views and clicks don't.", detail: "The conversion count and any goal Google Ads imports from GA4 follow real purchases." },
          protect: "Review the key events list whenever a new event is created in GA4 or GTM.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Checked by {fact}. It fails when purchase is not a key event, when any of page_view, scroll, session_start, first_visit, user_engagement, click, view_item or form_start is marked key, or (GA4-P16) when a key event recorded nothing in 90 days." },
          business: { summary: "GA4's list of conversions doesn't match your real sales.", detail: "Browsing events may count as conversions, purchase may be left out, or a listed conversion records nothing. The conversion rate then stops following sales, and any ad goal built on it chases the wrong action." },
          step: "In GA4 Admin > Key events, mark purchase as key, unmark browsing events, and remove key events that no longer record data.",
          doneWhen: "GA4's key events include purchase, none of page_view, scroll, session_start, first_visit, user_engagement, click, view_item or form_start, and each key event recorded data in the last 90 days.",
        },
      },
      store_owner: {
        fail: { business: { summary: "GA4's conversions don't match your real sales.", detail: "Page views or clicks may count as conversions, or your sales may be left out. Your conversion rate can look good while sales stay flat. Ads that learn from GA4 then look for browsers instead of buyers." } },
      },
      media_buyer: {
        fail: { business: { summary: "GA4 key events include browsing events, miss purchase, or list dead events, so Google Ads bidding optimizes toward the wrong signal.", detail: "If Google Ads imports GA4 conversions, it bids for people who browse or click instead of people who buy, and CPA on real sales rises. GA4's own conversion count is also wrong. The Meta Pixel is not affected. You or the GA4 admin fix it in Key events." } },
      },
      agency: {
        fail: { business: { summary: "The store's list of GA4 conversions doesn't match its real sales.", detail: "Browsing events may count as conversions, purchase may be left out, or a listed conversion records nothing. The store's conversion rate then stops following its sales, and any ad goal built on it chases the wrong action." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "purchase حدث رئيسي في GA4، ولا يوجد حدث تصفح ضمن الأحداث الرئيسية.", detail: "لا يوجد ضمن الأحداث الرئيسية أي من page_view أو scroll أو session_start أو first_visit أو user_engagement أو click أو view_item أو form_start ({fact})." },
          business: { summary: "المبيعات تُحسب تحويلات في GA4، وأحداث التصفح مثل مشاهدة الصفحات والنقرات لا تُحسب.", detail: "عدد التحويلات وأي هدف يستورده Google Ads من GA4 يتبع المشتريات الحقيقية." },
          protect: "راجع قائمة الأحداث الرئيسية كلما أُنشئ حدث جديد في GA4 أو GTM.",
        },
        fail: {
          technical: { summary: "قائمة الأحداث الرئيسية في GA4 لا تضم purchase، أو تضم أحداث تصفح، أو فيها حدث لم يسجّل بيانات خلال 90 يومًا.", detail: "الفحص من {fact}. يفشل عندما لا يكون purchase حدثًا رئيسيًا، أو عندما يكون أي من page_view أو scroll أو session_start أو first_visit أو user_engagement أو click أو view_item أو form_start حدثًا رئيسيًا، أو (في GA4-P16) عندما لا يسجّل حدث رئيسي أي بيانات خلال 90 يومًا." },
          business: { summary: "قائمة التحويلات في GA4 لا تطابق المبيعات الحقيقية.", detail: "قد تُحسب أحداث التصفح تحويلات، أو يغيب الشراء عنها، أو يوجد تحويل مدرج لا يسجّل شيئًا. فلا يتبع معدل التحويل المبيعات، وأي هدف إعلاني مبني عليه يلاحق الإجراء الخطأ." },
          step: "في GA4 من Admin ثم Key events: اجعل purchase حدثًا رئيسيًا، وألغِ أحداث التصفح، واحذف الأحداث الرئيسية التي لم تعد تسجّل بيانات.",
          doneWhen: "الأحداث الرئيسية في GA4 تضم purchase، ولا تضم أيًا من page_view أو scroll أو session_start أو first_visit أو user_engagement أو click أو view_item أو form_start، وكل حدث رئيسي سجّل بيانات خلال آخر 90 يومًا.",
        },
      },
      store_owner: {
        fail: { business: { summary: "التحويلات في GA4 ما تطابق مبيعاتك الحقيقية.", detail: "ممكن مشاهدات الصفحات أو النقرات تنحسب تحويلات، أو مبيعاتك ما تنحسب. معدل التحويل عندك يبان زين والمبيعات واقفة. والإعلانات اللي تتعلم من GA4 تدور على ناس تتفرج بدل ناس تشتري." } },
      },
      media_buyer: {
        fail: { business: { summary: "الـ key events في GA4 فيها أحداث تصفح، أو ناقصها purchase، أو فيها أحداث ميتة، فالـ bidding في Google Ads بيتعلم من signal غلط.", detail: "لو Google Ads بيستورد conversions من GA4، هيزايد على ناس بتتصفح أو بتكليك بدل ناس بتشتري، والـ CPA على البيع الحقيقي بيعلى. والـ Meta Pixel مش متأثر. التصليح عندك أو عند أدمن GA4 في Key events." } },
      },
      agency: {
        fail: { business: { summary: "قائمة التحويلات في GA4 الخاص بـ«المتجر» لا تطابق مبيعاته الحقيقية.", detail: "قد تُحسب أحداث التصفح تحويلات، أو يغيب الشراء عنها، أو يوجد تحويل مدرج لا يسجّل شيئًا. فلا يتبع معدل التحويل لدى «المتجر» مبيعاته، وأي هدف إعلاني مبني عليه يلاحق الإجراء الخطأ." } },
      },
    },
  },
  "TRK-35": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Countries other than the top one, each with 3%+ of sessions and zero sales in 28 days, add up to under 5% of sessions." },
          business: { summary: "Countries that send real traffic also bring sales.", detail: "Little of your traffic, paid or free, comes from places that never buy." },
          protect: "Re-check the country report when you launch a campaign in a new market.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "GA4 country report over 28 days. Countries other than the top one, each with 3%+ of sessions and zero sales, add up to 5% of sessions or more." },
          business: { summary: "A real share of your visits comes from countries that never buy.", detail: "These visitors may be outside your delivery area, or reached by ads aimed too widely. Any ad money spent on them can't turn into sales." },
          step: "Check ad geo-targeting and exclude the listed countries you don't deliver to.",
          doneWhen: "In GA4 over 28 days, countries other than the top one with 3% or more of visits and no sales add up to under 5% of visits.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Part of your visits comes from countries where you make no sales.", detail: "If you don't deliver there, those visitors can never buy. If your ads reach them, part of your ad budget is wasted." } },
      },
      media_buyer: {
        fail: { business: { summary: "Countries with a real share of sessions bring zero sales, so CAC is higher than it needs to be.", detail: "Paid clicks from countries the store doesn't sell to cannot convert, so CPA rises on the same spend. Compare the country breakdown in Ads Manager with these countries, and tighten geo-targeting in the campaigns." } },
      },
      agency: {
        fail: { business: { summary: "A real share of the store's visits comes from countries that never buy.", detail: "These visitors may be outside the store's delivery area, or reached by ads aimed too widely. Ad money spent on them can't turn into sales." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "الدول التي تجلب نسبة حقيقية من الزيارات تجلب مبيعات أيضًا خلال 28 يومًا في GA4.", detail: "الدول غير الأولى التي لكل منها 3% أو أكثر من الزيارات دون مبيعات مجموعها أقل من 5% من الزيارات." },
          business: { summary: "الدول التي ترسل زيارات حقيقية تجلب مبيعات أيضًا.", detail: "جزء صغير فقط من الزيارات، مدفوعة أو مجانية، يأتي من أماكن لا تشتري." },
          protect: "أعد فحص تقرير الدول عند إطلاق حملة في سوق جديد.",
        },
        fail: {
          technical: { summary: "دول بلا أي مبيعات تجلب 5% أو أكثر من الزيارات خلال 28 يومًا في GA4.", detail: "تقرير الدول في GA4. الدول غير الأولى التي لكل منها 3% أو أكثر من الزيارات دون أي مبيعات مجموعها 5% أو أكثر من الزيارات." },
          business: { summary: "نسبة حقيقية من الزيارات تأتي من دول لا تشتري أبدًا.", detail: "قد يكون هؤلاء الزوار خارج منطقة التوصيل، أو وصلت إليهم إعلانات استهدافها واسع. وأي إنفاق إعلاني عليهم لا يتحول إلى مبيعات." },
          step: "راجع الاستهداف الجغرافي في الإعلانات واستبعد الدول المذكورة التي لا توصّل إليها.",
          doneWhen: "خلال 28 يومًا في GA4، الدول غير الأولى التي لكل منها 3% أو أكثر من الزيارات دون مبيعات مجموعها أقل من 5% من الزيارات.",
        },
      },
      store_owner: {
        fail: { business: { summary: "جزء من زياراتك يجيك من دول ما تبيع فيها شي.", detail: "إذا ما توصّل لهالدول، هالزوار ما راح يشترون أبدًا. وإذا إعلاناتك توصل لهم، جزء من ميزانيتك رايح على الفاضي." } },
      },
      media_buyer: {
        fail: { business: { summary: "دول جايبة نسبة حقيقية من السيشنز ومفيش منها ولا بيعة، فالـ CAC أعلى من اللازم.", detail: "الكليكات المدفوعة من دول المتجر مش بيبيع فيها مستحيل تحوّل، فالـ CPA بيعلى على نفس الصرف. قارن تقسيم الدول في Ads Manager بالدول دي، وضيّق الـ geo-targeting في الحملات." } },
      },
      agency: {
        fail: { business: { summary: "نسبة حقيقية من زيارات «المتجر» تأتي من دول لا تشتري أبدًا.", detail: "قد يكون هؤلاء الزوار خارج منطقة توصيل «المتجر»، أو وصلت إليهم إعلانات استهدافها واسع. والإنفاق الإعلاني عليهم لا يتحول إلى مبيعات." } },
      },
    },
  },
  "TRK-36": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Purchase conversion of returning vs new sessions in GA4 (200+ new, 50+ returning). It passes at 2x or more, or below that when the visit found an email or phone signup field." },
          business: { summary: "Past visitors come back and buy, or the site already collects a way to reach them.", detail: "A visitor who comes back costs less to sell to than a new one, so each repeat sale lowers what a sale costs." },
          protect: "Send a message after every purchase and keep the signup field on the site.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Purchase conversion of returning vs new sessions in GA4 (200+ new, 50+ returning). Returning visitors convert at under 2x new ones, and no email or phone signup field was found on the pages visited." },
          business: { summary: "Past visitors rarely come back to buy, and the site has no way to keep in touch.", detail: "Without an email or WhatsApp signup, every repeat sale has to be bought again with ads. Visitors who liked the store leave and are not reminded." },
          step: "Add an email or WhatsApp signup with a first-order offer, and send a message after each purchase.",
          doneWhen: "An email or phone signup field shows on the site, or returning visitors convert at 2x new visitors or more in GA4.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Past visitors rarely come back to buy from your store.", detail: "You don't collect emails or WhatsApp numbers, so you can't remind them. Every repeat sale costs you a new ad." } },
      },
      media_buyer: {
        fail: { business: { summary: "No email or phone capture and weak repeat buying, so retargeting reach and ROAS are lower than they could be.", detail: "Without a contact list there are no customer-list audiences or lookalikes from buyers, and retargeting rests on Pixel data alone. Repeat sales have to be bought again, which keeps blended CAC up. The store (marketing and developer) adds the signup." } },
      },
      agency: {
        fail: { business: { summary: "Past visitors rarely come back to buy, and the store has no way to keep in touch.", detail: "Without an email or WhatsApp signup, every repeat sale has to be bought again with ads. Visitors who liked the store leave and are not reminded." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "الزوار العائدون يحوّلون بضعف الزوار الجدد أو أكثر، أو الموقع يجمع البريد أو رقم الهاتف.", detail: "تحويل المشتريات للزيارات العائدة مقابل الجديدة في GA4 (200 جديدة و50 عائدة على الأقل). ينجح عند ضعفين أو أكثر، أو أقل من ذلك إذا وُجد حقل تسجيل بريد أو هاتف." },
          business: { summary: "الزوار السابقون يعودون ويشترون، أو الموقع يجمع وسيلة للتواصل معهم.", detail: "الزائر العائد أقل تكلفة في البيع من الزائر الجديد، فكل بيع متكرر يخفض تكلفة البيع." },
          protect: "أرسل رسالة بعد كل عملية شراء وأبقِ حقل التسجيل على الموقع.",
        },
        fail: {
          technical: { summary: "الزوار العائدون يحوّلون بأقل من ضعف الزوار الجدد، ولم يُعثر على حقل تسجيل بريد أو هاتف.", detail: "تحويل المشتريات للزيارات العائدة مقابل الجديدة في GA4 (200 جديدة و50 عائدة على الأقل). النسبة أقل من ضعفين، ولا يوجد حقل بريد أو هاتف في الصفحات التي زرناها." },
          business: { summary: "الزوار السابقون نادرًا ما يعودون للشراء، ولا توجد وسيلة للتواصل معهم.", detail: "بدون تسجيل بريد أو واتساب، كل بيع متكرر يحتاج إعلانًا جديدًا. والزوار الذين أعجبهم المتجر يغادرون دون تذكير." },
          step: "أضف تسجيلًا بالبريد أو واتساب مع عرض على أول طلب، وأرسل رسالة بعد كل عملية شراء.",
          doneWhen: "يظهر حقل تسجيل بريد أو هاتف على الموقع، أو يحوّل الزوار العائدون بضعف الزوار الجدد أو أكثر في GA4.",
        },
      },
      store_owner: {
        fail: { business: { summary: "الزوار اللي جوا قبل نادرًا يرجعون يشترون من متجرك.", detail: "ما تجمع إيميلات ولا أرقام واتساب، فما تقدر تذكّرهم. وكل بيعة متكررة تكلفك إعلان جديد." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش تجميع إيميل أو موبايل والشراء المتكرر ضعيف، فالـ retargeting reach والـ ROAS أقل مما ينفع.", detail: "من غير contact list مفيش customer-list audiences ولا lookalikes من المشترين، والـ retargeting معتمد على داتا الـ Pixel بس. والبيع المتكرر لازم يتشترى تاني بإعلانات، فالـ CAC الإجمالي فاضل عالي. التسجيل يضيفه فريق التسويق والمطوّر في المتجر." } },
      },
      agency: {
        fail: { business: { summary: "الزوار السابقون لـ«المتجر» نادرًا ما يعودون للشراء، ولا توجد وسيلة للتواصل معهم.", detail: "بدون تسجيل بريد أو واتساب، كل بيع متكرر يحتاج إعلانًا جديدًا. والزوار الذين أعجبهم «المتجر» يغادرون دون تذكير." } },
      },
    },
  },
  "TRK-37": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "The search box is visible in the phone homepage header, and GA4 records search or view_search_results events in 28 days." },
          business: { summary: "Shoppers can search on phones, and you can see what they search for.", detail: "Search terms show which products people want and which searches find nothing." },
          protect: "Read the top search terms each month and make sure each one returns products.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "It fails in three cases: GA4 records searches but no search box was found on the phone homepage, a search box exists but GA4 records no search or view_search_results events in 28 days, or search is tracked but hidden behind the menu on phones." },
          business: { summary: "Search on phones is hidden, missing, or not recorded.", detail: "Shoppers who search know what they want and are close to buying. When search is hard to find, they leave, and untracked search hides which products they wanted." },
          step: "Ask your developer to show the search box in the phone header and to send a search event with the term to GA4.",
          doneWhen: "The search box shows on the phone homepage without opening the menu, and GA4 records search or view_search_results events in 28 days.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Search on your store is hard to find on phones, or you can't see what shoppers search for.", detail: "A shopper who searches already knows what they want. If they can't search, or find nothing, you lose that sale and never learn what they wanted." } },
      },
      media_buyer: {
        fail: { business: { summary: "Search on phones is hidden, missing or untracked, so CVR on paid traffic is lower than it could be.", detail: "Paid visitors who land on the wrong product often search for the right one. When they can't, they leave, and CPA rises on the same spend. Untracked searches also hide which products to advertise. The developer fixes it on the store." } },
      },
      agency: {
        fail: { business: { summary: "Search on the store is hidden, missing or not recorded on phones.", detail: "Shoppers who search know what they want and are close to buying. When search is hard to find, they leave, and untracked search hides which products they wanted." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "مربع البحث ظاهر في الصفحة الرئيسية على الجوال، وGA4 يسجّل أحداث البحث خلال 28 يومًا.", detail: "مربع البحث ظاهر في رأس الصفحة الرئيسية على الجوال، وGA4 يسجّل أحداث search أو view_search_results." },
          business: { summary: "المتسوقون يبحثون بسهولة على الجوال، وعبارات بحثهم مسجّلة.", detail: "عبارات البحث تكشف المنتجات المطلوبة والبحث الذي لا يجد نتيجة." },
          protect: "راجع أكثر عبارات البحث كل شهر وتأكد أن كل واحدة تعرض منتجات.",
        },
        fail: {
          technical: { summary: "البحث على الجوال مخفي أو غير موجود أو غير مسجّل في GA4.", detail: "يفشل في ثلاث حالات: GA4 يسجّل عمليات بحث ولا يوجد مربع بحث في الصفحة الرئيسية على الجوال، أو يوجد مربع بحث ولا يسجّل GA4 أحداث search أو view_search_results خلال 28 يومًا، أو البحث مسجّل لكنه مخفي داخل القائمة على الجوال." },
          business: { summary: "البحث على الجوال مخفي أو غير موجود أو غير مسجّل.", detail: "من يبحث يعرف ما يريد وهو قريب من الشراء. عندما يصعب العثور على البحث يغادر، والبحث غير المسجّل يخفي المنتجات التي أرادها." },
          step: "اطلب من المطوّر إظهار مربع البحث في رأس الصفحة على الجوال وإرسال حدث بحث مع العبارة إلى GA4.",
          doneWhen: "يظهر مربع البحث في الصفحة الرئيسية على الجوال دون فتح القائمة، وGA4 يسجّل أحداث search أو view_search_results خلال 28 يومًا.",
        },
      },
      store_owner: {
        fail: { business: { summary: "البحث في متجرك صعب تلقاه على الجوال، أو ما تعرف وش يدورون عليه العملاء.", detail: "العميل اللي يبحث يعرف وش يبي. إذا ما قدر يبحث أو ما لقى شي، تخسر البيعة وما تعرف وش كان يبي." } },
      },
      media_buyer: {
        fail: { business: { summary: "البحث على الموبايل مخفي أو مش موجود أو مش متتبَّع، فالـ CVR على الترافيك المدفوع أقل مما ينفع.", detail: "الزائر المدفوع اللي ينزل على منتج غلط غالبًا بيدوّر على الصح. لو مقدرش، بيمشي، والـ CPA بيعلى على نفس الصرف. والبحث اللي مش متسجل بيخبّي المنتجات اللي تستاهل تتعلن. التصليح عند المطوّر في المتجر." } },
      },
      agency: {
        fail: { business: { summary: "البحث في «المتجر» مخفي أو غير موجود أو غير مسجّل على الجوال.", detail: "من يبحث يعرف ما يريد وهو قريب من الشراء. عندما يصعب العثور على البحث يغادر، والبحث غير المسجّل يخفي المنتجات التي أرادها." } },
      },
    },
  },
  "TRK-38": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Property currency matches the currency of the country with the most visits, and the property time zone has that country's UTC offset." },
          business: { summary: "GA4 reports money in your currency and days in your local time.", detail: "Revenue and daily sales in GA4 line up with your store admin and your ad accounts." },
          protect: "Keep these settings if the store moves to a new market or opens a second property.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Compared with the country that brings the most visits: the property currency differs from its currency, or the property time zone has a different UTC offset. Both are set in GA4 Admin > Property details." },
          business: { summary: "GA4 reports money in another currency, or cuts days at the wrong hour.", detail: "Revenue and daily sales then don't match your store admin or ad accounts. Comparing days, hours or campaigns in GA4 gives the wrong picture." },
          step: "In GA4 Admin > Property details, set the currency and time zone of the country that brings most of your visits.",
          doneWhen: "GA4 property details show the currency of the country with the most visits and a time zone with that country's UTC offset.",
        },
      },
      store_owner: {
        fail: { business: { summary: "GA4 shows your sales in the wrong currency or the wrong time zone.", detail: "Your GA4 numbers won't match your store admin. Daily sales and best-selling hours are shifted." } },
      },
      media_buyer: {
        fail: { business: { summary: "GA4 currency or timezone doesn't match the store's market, so GA4 ROAS checks against Ads Manager read off, often lower.", detail: "Revenue in the wrong currency and days cut at the wrong midnight make GA4 disagree with Ads Manager and the store admin. Campaigns can look weaker in GA4 than they are. Whoever has GA4 admin access fixes it in Property details." } },
      },
      agency: {
        fail: { business: { summary: "The store's GA4 reports money in another currency, or cuts days at the wrong hour.", detail: "Revenue and daily sales then don't match the store admin or its ad accounts. Comparing days, hours or campaigns in GA4 gives the wrong picture." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "عملة خاصية GA4 ومنطقتها الزمنية تطابقان الدولة التي تجلب أكثر الزيارات.", detail: "العملة هي عملة الدولة الأعلى زيارات، والمنطقة الزمنية بنفس فرق التوقيت عن UTC لتلك الدولة." },
          business: { summary: "GA4 يعرض المال بعملتك والأيام بتوقيتك المحلي.", detail: "الإيراد والمبيعات اليومية في GA4 تتطابق مع لوحة المتجر وحسابات الإعلانات." },
          protect: "حافظ على هذه الإعدادات إذا انتقل المتجر إلى سوق جديد أو فُتحت خاصية ثانية.",
        },
        fail: {
          technical: { summary: "عملة خاصية GA4 أو منطقتها الزمنية لا تطابق الدولة التي تجلب أكثر الزيارات.", detail: "مقارنة بالدولة الأعلى زيارات: عملة الخاصية مختلفة عن عملتها، أو المنطقة الزمنية بفرق توقيت مختلف عن UTC. الإعدادان في GA4 من Admin ثم Property details." },
          business: { summary: "GA4 يعرض المال بعملة أخرى، أو يقسّم الأيام في ساعة خاطئة.", detail: "فلا يطابق الإيراد والمبيعات اليومية لوحة المتجر أو حسابات الإعلانات. ومقارنة الأيام أو الساعات أو الحملات في GA4 تعطي صورة خاطئة." },
          step: "في GA4 من Admin ثم Property details، اضبط العملة والمنطقة الزمنية على الدولة التي تجلب معظم الزيارات.",
          doneWhen: "إعدادات الخاصية في GA4 تعرض عملة الدولة الأعلى زيارات ومنطقة زمنية بنفس فرق توقيتها عن UTC.",
        },
      },
      store_owner: {
        fail: { business: { summary: "GA4 يعرض مبيعاتك بعملة غلط أو بتوقيت غلط.", detail: "أرقام GA4 ما راح تطابق لوحة متجرك. والمبيعات اليومية وساعات الذروة كلها مزحوزة." } },
      },
      media_buyer: {
        fail: { business: { summary: "عملة أو timezone الـ GA4 مش مطابقة لسوق المتجر، فمقارنة الـ ROAS بين GA4 و Ads Manager مضروبة، وغالبًا أقل.", detail: "الإيراد بعملة غلط والأيام اللي بتتقسم على نص ليل غلط بيخلوا GA4 مختلف عن Ads Manager ولوحة المتجر. فحملات ممكن تبان أضعف في GA4 من حقيقتها. التصليح عند اللي معاه admin على GA4 في Property details." } },
      },
      agency: {
        fail: { business: { summary: "GA4 الخاص بـ«المتجر» يعرض المال بعملة أخرى، أو يقسّم الأيام في ساعة خاطئة.", detail: "فلا يطابق الإيراد والمبيعات اليومية لوحة «المتجر» أو حسابات إعلاناته. ومقارنة الأيام أو الساعات أو الحملات في GA4 تعطي صورة خاطئة." } },
      },
    },
  },
};
