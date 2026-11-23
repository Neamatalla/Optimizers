import type { PointTemplate } from "./types.js";

// Offer points OFFER-03, 04, 06, 08, 15, 16, 18. Thresholds follow the code
// rules: collect.ts (03, 08, 16), ga4-facts.ts GA4-11 via ga4.ts (04, hands
// over only {fact}), visit.ts (06, 18) and account.ts (15).
export const OFFERS: Record<string, PointTemplate> = {
  "OFFER-03": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "After our Add to Cart click, a cart amount equals the product page price ({productPrice}) in the same currency, and a crossed-out old price on the page is kept in the cart." },
          business: { summary: "The cart shows the same price as the product page.", detail: "Shoppers see no surprise between choosing the product and paying for it." },
          protect: "Add a product to the cart after any price, discount or currency change and compare the two prices.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Product page price (from its schema or our add_to_cart hit): {productPrice}. Amounts read in the cart: {cartAmounts}. It fails when no cart amount equals the page price, when the cart currency differs from the page's, or when the page crosses out an old price and the cart shows none." },
          business: { summary: "The cart shows a different price, currency or offer than the product page.", detail: "Shoppers who see the price change after adding to cart stop trusting the store. Many leave the cart instead of checking out." },
          step: "Ask your developer to make the cart show the same unit price and currency as the product page, and keep the crossed-out old price on sale items.",
          doneWhen: "After adding the product to the cart, the cart shows the product page price in the same currency, and a sale item keeps its crossed-out old price.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your cart shows a different price than your product page.", detail: "A shopper adds the product at one price and sees another in the cart. Many of them leave without buying, after you already paid to bring them." } },
      },
      media_buyer: {
        fail: { business: { summary: "The cart price or currency differs from the product page, so CVR on paid traffic drops after the add to cart.", detail: "Shoppers who clicked an ad at one price and meet another in the cart drop out before checkout, which raises CPA on the same spend. The owner or developer fixes it in the store's pricing or cart settings." } },
      },
      agency: {
        fail: { business: { summary: "The store's cart shows a different price, currency or offer than its product page.", detail: "Shoppers who see the price change after adding to cart stop trusting the store. Many leave the cart instead of checking out." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "السعر في السلة يطابق سعر صفحة المنتج وعملتها.", detail: "بعد نقرة الإضافة للسلة، يظهر في السلة مبلغ يساوي سعر صفحة المنتج ({productPrice}) بالعملة نفسها، ويبقى السعر القديم المشطوب إن وُجد." },
          business: { summary: "السلة تعرض السعر نفسه الظاهر في صفحة المنتج.", detail: "لا يجد العميل أي مفاجأة بين اختيار المنتج ودفع ثمنه." },
          protect: "أضف منتجًا إلى السلة بعد أي تغيير في الأسعار أو الخصومات أو العملة وقارن السعرين.",
        },
        fail: {
          technical: { summary: "السعر أو العملة في السلة لا يطابقان صفحة المنتج، أو السعر القديم المشطوب يختفي في السلة.", detail: "سعر صفحة المنتج: {productPrice}. المبالغ المقروءة في السلة: {cartAmounts}. يفشل البند عندما لا يساوي أي مبلغ في السلة سعر الصفحة، أو تختلف عملة السلة عن عملة الصفحة، أو تشطب الصفحة سعرًا قديمًا ولا تعرضه السلة." },
          business: { summary: "السلة تعرض سعرًا أو عملة أو عرضًا مختلفًا عن صفحة المنتج.", detail: "العميل الذي يرى السعر يتغير بعد الإضافة للسلة يفقد الثقة في المتجر. وكثيرون يغادرون السلة بدل إتمام الطلب." },
          step: "اطلب من المطوّر أن تعرض السلة سعر الوحدة والعملة نفسيهما الظاهرين في صفحة المنتج، مع إبقاء السعر القديم المشطوب للمنتجات المخفّضة.",
          doneWhen: "بعد إضافة المنتج للسلة، تعرض السلة سعر صفحة المنتج بالعملة نفسها، ويبقى السعر القديم المشطوب للمنتج المخفّض.",
        },
      },
      store_owner: {
        fail: { business: { summary: "السلة عندك تعرض سعر غير اللي في صفحة المنتج.", detail: "العميل يضيف المنتج بسعر ويلقى سعر ثاني في السلة. وكثير منهم يطلعون بدون ما يشترون، بعد ما دفعت عشان توصلهم." } },
      },
      media_buyer: {
        fail: { business: { summary: "سعر أو عملة السلة مختلفين عن صفحة المنتج، فالـ CVR على الترافيك المدفوع بيقع بعد الـ add to cart.", detail: "اللي داس على إعلان بسعر ولقى سعر تاني في السلة بيخرج قبل الـ checkout، والـ CPA بيعلى على نفس الصرف. التصليح عند صاحب المتجر أو المطوّر في إعدادات الأسعار أو السلة." } },
      },
      agency: {
        fail: { business: { summary: "سلة «المتجر» تعرض سعرًا أو عملة أو عرضًا مختلفًا عن صفحة المنتج.", detail: "العميل الذي يرى السعر يتغير بعد الإضافة للسلة يفقد الثقة في «المتجر». وكثيرون يغادرون السلة بدل إتمام الطلب." } },
      },
    },
  },
  "OFFER-04": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Checked by {fact}: the free-delivery threshold found on the visited pages sits between 1.1 and 1.6 times the GA4 average order value, in the same currency." },
          business: { summary: "Free delivery starts a little above the usual order.", detail: "Shoppers close to the threshold have a reason to add one more item, which lifts order value." },
          protect: "Re-check the threshold against average order value when prices or the product range change.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Checked by {fact}. It passes when the free-delivery threshold found on the visited pages is 1.1 to 1.6 times the GA4 average order value. Under 1.1, most orders already qualify; over 1.6, the gap is too large for most shoppers to try to close." },
          business: { summary: "The free-delivery threshold doesn't fit how much shoppers usually spend.", detail: "Set too low, it gives free delivery to orders that would have come anyway. Set too high, few shoppers try to reach it, so it adds nothing to the basket." },
          step: "Set the free-delivery threshold between 1.1 and 1.6 times your GA4 average order value (about 1.3 times is a common start) and show it on the site.",
          doneWhen: "The free-delivery threshold shown on the site is between 1.1 and 1.6 times the GA4 average order value.",
        },
      },
      store_owner: {
        pass: { business: { summary: "Your free delivery starts a little above your usual order.", detail: "Shoppers close to it add one more item to get free delivery, so each order brings in more." } },
        fail: { business: { summary: "Your free-delivery amount doesn't match what your customers usually spend.", detail: "If it's too low, you pay for delivery on orders that would have come anyway. If it's too high, nobody tries to reach it, so it doesn't make orders bigger." } },
      },
      media_buyer: {
        fail: { business: { summary: "The free-delivery threshold sits outside 1.1 to 1.6 times AOV, so AOV and ROAS stay lower than they could be at the same CAC.", detail: "A threshold just above AOV pushes paid buyers to add an item, which raises order value for the same acquisition cost. Too low gives margin away; too high is ignored. The store owner sets it." } },
      },
      agency: {
        pass: { business: { summary: "The store's free delivery starts a little above its usual order.", detail: "Shoppers close to the threshold have a reason to add one more item, which lifts order value." } },
        fail: { business: { summary: "The store's free-delivery threshold doesn't fit how much its shoppers usually spend.", detail: "Set too low, it gives free delivery to orders that would have come anyway. Set too high, few shoppers try to reach it, so it adds nothing to the basket." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "حد التوصيل المجاني بين 1.1 و1.6 ضعف متوسط قيمة الطلب في GA4.", detail: "الفحص من {fact}: حد التوصيل المجاني الظاهر في الصفحات التي زرناها بين 1.1 و1.6 ضعف متوسط قيمة الطلب في GA4، وبالعملة نفسها." },
          business: { summary: "التوصيل المجاني يبدأ فوق الطلب المعتاد بقليل.", detail: "العميل القريب من الحد لديه سبب لإضافة منتج آخر، فترتفع قيمة الطلب." },
          protect: "أعد مقارنة الحد بمتوسط قيمة الطلب عند تغيير الأسعار أو المنتجات.",
        },
        fail: {
          technical: { summary: "حد التوصيل المجاني أقل من 1.1 أو أكثر من 1.6 ضعف متوسط قيمة الطلب في GA4.", detail: "الفحص من {fact}. ينجح البند عندما يكون حد التوصيل المجاني الظاهر في الصفحات التي زرناها بين 1.1 و1.6 ضعف متوسط قيمة الطلب في GA4. تحت 1.1 تستحقه معظم الطلبات أصلًا، وفوق 1.6 تصبح الفجوة أكبر من أن يحاول معظم العملاء سدّها." },
          business: { summary: "حد التوصيل المجاني لا يناسب ما ينفقه العملاء عادة.", detail: "إن كان منخفضًا جدًا، يُمنح التوصيل المجاني لطلبات كانت ستأتي على أي حال. وإن كان مرتفعًا جدًا، قلّما يحاول العملاء الوصول إليه، فلا يزيد السلة شيئًا." },
          step: "اضبط حد التوصيل المجاني بين 1.1 و1.6 ضعف متوسط قيمة الطلب في GA4 (نحو 1.3 ضعف بداية شائعة) واعرضه على الموقع.",
          doneWhen: "حد التوصيل المجاني الظاهر على الموقع بين 1.1 و1.6 ضعف متوسط قيمة الطلب في GA4.",
        },
      },
      store_owner: {
        pass: { business: { summary: "التوصيل المجاني عندك يبدأ فوق طلبك المعتاد بشوي.", detail: "العميل القريب منه يضيف منتج زيادة عشان ياخذ التوصيل مجانًا، فكل طلب يجيب لك أكثر." } },
        fail: { business: { summary: "مبلغ التوصيل المجاني عندك ما يناسب اللي يصرفه عملاؤك عادة.", detail: "إذا كان قليل، تدفع توصيل طلبات كانت بتجيك على أي حال. وإذا كان عالي، محد يحاول يوصله، فما يكبّر الطلبات." } },
      },
      media_buyer: {
        fail: { business: { summary: "حد التوصيل المجاني برا 1.1 لـ 1.6 من الـ AOV، فالـ AOV والـ ROAS أقل مما ينفع على نفس الـ CAC.", detail: "الحد اللي فوق الـ AOV بشوية بيخلي المشتري الجاي من الإعلان يزوّد منتج، فقيمة الأوردر بتعلى على نفس تكلفة الاستحواذ. لو واطي بيضيّع هامش، ولو عالي محدش بيبص له. صاحب المتجر هو اللي بيظبطه." } },
      },
      agency: {
        pass: { business: { summary: "التوصيل المجاني لدى «المتجر» يبدأ فوق طلبه المعتاد بقليل.", detail: "العميل القريب من الحد لديه سبب لإضافة منتج آخر، فترتفع قيمة الطلب." } },
        fail: { business: { summary: "حد التوصيل المجاني لدى «المتجر» لا يناسب ما ينفقه عملاؤه عادة.", detail: "إن كان منخفضًا جدًا، يُمنح التوصيل المجاني لطلبات كانت ستأتي على أي حال. وإن كان مرتفعًا جدًا، قلّما يحاول العملاء الوصول إليه، فلا يزيد السلة شيئًا." } },
      },
    },
  },
  "OFFER-06": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "On a phone, the nearest instalment line (\"{line}\") sits {distancePx}px from the product price; the limit is 300px." },
          business: { summary: "The instalment amount shows right by the price.", detail: "Shoppers see the smaller monthly figure while they weigh the price, which makes higher-priced items easier to commit to." },
          protect: "Keep the Tabby or Tamara widget under the price when the product page layout changes.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "On a phone, the nearest instalment line (\"{line}\") sits {distancePx}px from the product price block. It passes at 300px or less." },
          business: { summary: "The instalment option sits far from the price, where shoppers miss it.", detail: "Shoppers decide on the price first. If they don't see the smaller instalment amount next to it, the full price can put them off before they find the option." },
          step: "Move the Tabby or Tamara product-page widget so the instalment line sits right under the price.",
          doneWhen: "On a phone, the instalment line sits within 300px of the product price.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your instalment option is far from the price, so shoppers miss it.", detail: "A shopper looks at the price first. If they don't see they can split it into smaller payments, the full price can stop them from buying." } },
      },
      media_buyer: {
        fail: { business: { summary: "The instalment line sits far from the price, so CVR on higher-priced products is lower than it could be.", detail: "Paid visitors judge the price in the first seconds. Without the smaller instalment amount next to it, some drop off, which raises CPA on those products. The owner moves the widget in the app or payment settings." } },
      },
      agency: {
        fail: { business: { summary: "The store's instalment option sits far from the price, where shoppers miss it.", detail: "Shoppers decide on the price first. If they don't see the smaller instalment amount next to it, the full price can put them off before they find the option." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "سطر التقسيط قريب من سعر المنتج على الجوال.", detail: "على الجوال، أقرب سطر تقسيط (\"{line}\") يبعد {distancePx} بكسل عن سعر المنتج، والحد 300 بكسل." },
          business: { summary: "مبلغ القسط يظهر بجانب السعر مباشرة.", detail: "يرى العميل المبلغ الأصغر وهو يقيّم السعر، فيسهل عليه قرار شراء المنتجات الأعلى سعرًا." },
          protect: "أبقِ أداة تابي أو تمارا تحت السعر عند تغيير تصميم صفحة المنتج.",
        },
        fail: {
          technical: { summary: "سطر التقسيط يبعد أكثر من 300 بكسل عن سعر المنتج على الجوال.", detail: "على الجوال، أقرب سطر تقسيط (\"{line}\") يبعد {distancePx} بكسل عن السعر. ينجح البند عند 300 بكسل أو أقل." },
          business: { summary: "خيار التقسيط بعيد عن السعر فلا يلاحظه العملاء.", detail: "العميل يحسم رأيه في السعر أولًا. وإن لم يرَ مبلغ القسط الأصغر بجانبه، قد يصرفه السعر الكامل قبل أن يجد الخيار." },
          step: "انقل أداة تابي أو تمارا في صفحة المنتج ليظهر سطر التقسيط تحت السعر مباشرة.",
          doneWhen: "على الجوال، يظهر سطر التقسيط على بعد 300 بكسل أو أقل من سعر المنتج.",
        },
      },
      store_owner: {
        fail: { business: { summary: "خيار التقسيط عندك بعيد عن السعر، فالعميل ما ينتبه له.", detail: "العميل يشوف السعر أول. وإذا ما شاف إنه يقدر يقسّطه على دفعات أصغر، السعر الكامل ممكن يوقفه عن الشراء." } },
      },
      media_buyer: {
        fail: { business: { summary: "سطر التقسيط بعيد عن السعر، فالـ CVR على المنتجات الغالية أقل مما ينفع.", detail: "الزائر المدفوع بيحكم على السعر في أول ثواني. من غير مبلغ القسط جنبه، ناس بتمشي، والـ CPA على المنتجات دي بيعلى. صاحب المتجر بينقل الأداة من إعدادات التطبيق أو الدفع." } },
      },
      agency: {
        fail: { business: { summary: "خيار التقسيط لدى «المتجر» بعيد عن السعر فلا يلاحظه العملاء.", detail: "العميل يحسم رأيه في السعر أولًا. وإن لم يرَ مبلغ القسط الأصغر بجانبه، قد يصرفه السعر الكامل قبل أن يجد الخيار." } },
      },
    },
  },
  "OFFER-08": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Collection cards: {cards}. Product page: {product}." },
          business: { summary: "Discounts show clearly where shoppers compare prices.", detail: "Deal-seeking shoppers can see the old price and how much they save, which gives them a reason to act." },
          protect: "Set the old (compare-at) price on every new discount so the saving shows by itself.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "The product page crosses out an old price within 400px of the buy button, but no text within 500px of it states the saving as an amount with currency or a percentage. Collection cards: {cards}." },
          business: { summary: "The product page shows a sale price but doesn't say how much shoppers save.", detail: "A crossed-out price alone makes shoppers work out the saving themselves. A stated amount or percentage is what makes a deal feel real and gets them to act." },
          step: "Show the saving next to the price on discounted product pages, as an amount with currency or a percentage (for example Save 20%).",
          doneWhen: "On a discounted product page, a line near the price and buy button states the saving as an amount with currency or a percentage.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your sale products don't say how much the customer saves.", detail: "The old price is crossed out, but the saving isn't written. Shoppers who look for deals act faster when they see Save 20% or the amount they keep." } },
      },
      media_buyer: {
        fail: { business: { summary: "Sale product pages hide the saving amount, so CVR on discount campaigns is lower than it could be.", detail: "Shoppers who clicked a sale ad expect to see the deal stated. A crossed-out price alone is weaker, so fewer of them buy and CPA rises on those campaigns. The owner or developer adds the saving line in the theme." } },
      },
      agency: {
        fail: { business: { summary: "The store's product page shows a sale price but doesn't say how much shoppers save.", detail: "A crossed-out price alone makes shoppers work out the saving themselves. A stated amount or percentage is what makes a deal feel real and gets them to act." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "التخفيضات المعروضة واضحة في بطاقات التصنيف وصفحة المنتج.",detail: "بطاقات التصنيف تعرض السعر القديم المشطوب أو لا تحمل تخفيضات، وصفحة المنتج تذكر التوفير أو المنتج غير مخفّض." },
          business: { summary: "التخفيضات واضحة حيث يقارن العملاء الأسعار.", detail: "العميل الباحث عن العروض يرى السعر القديم ومقدار التوفير، فيجد سببًا للشراء." },
          protect: "أدخل السعر القديم (السعر قبل الخصم) لكل تخفيض جديد ليظهر التوفير تلقائيًا.",
        },
        fail: {
          technical: { summary: "صفحة المنتج تشطب سعرًا قديمًا لكنها لا تذكر مقدار التوفير.", detail: "صفحة المنتج تشطب سعرًا قديمًا على بعد 400 بكسل أو أقل من زر الشراء، ولا يوجد نص على بعد 500 بكسل منه يذكر التوفير كمبلغ بعملة أو كنسبة مئوية." },
          business: { summary: "صفحة المنتج تعرض سعر التخفيض دون أن تذكر كم يوفّر العميل.", detail: "السعر المشطوب وحده يترك للعميل حساب التوفير بنفسه. أما المبلغ أو النسبة المكتوبة فهي ما يجعل العرض مقنعًا ويدفعه إلى الشراء." },
          step: "اعرض التوفير بجانب السعر في صفحات المنتجات المخفّضة، كمبلغ بالعملة أو كنسبة مئوية (مثل: وفّر 20%).",
          doneWhen: "في صفحة منتج مخفّض، يظهر قرب السعر وزر الشراء سطر يذكر التوفير كمبلغ بعملة أو كنسبة مئوية.",
        },
      },
      store_owner: {
        fail: { business: { summary: "منتجاتك المخفّضة ما تقول كم يوفّر العميل.", detail: "السعر القديم مشطوب، بس التوفير مو مكتوب. والعميل اللي يدور عروض يقرر أسرع لما يشوف وفّر 20% أو المبلغ اللي يوفّره." } },
      },
      media_buyer: {
        fail: { business: { summary: "صفحات المنتجات المخفّضة مش كاتبة مقدار التوفير، فالـ CVR على حملات الخصم أقل مما ينفع.", detail: "اللي داس على إعلان خصم مستني يشوف العرض مكتوب. السعر المشطوب لوحده أضعف، فناس أقل بتشتري والـ CPA على الحملات دي بيعلى. صاحب المتجر أو المطوّر يضيف سطر التوفير في القالب." } },
      },
      agency: {
        fail: { business: { summary: "صفحة المنتج لدى «المتجر» تعرض سعر التخفيض دون أن تذكر كم يوفّر العميل.", detail: "السعر المشطوب وحده يترك للعميل حساب التوفير بنفسه. أما المبلغ أو النسبة المكتوبة فهي ما يجعل العرض مقنعًا ويدفعه إلى الشراء." } },
      },
    },
  },
  "OFFER-15": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "GA4 item units sold divided by transactions over 28 days: {itemsPerOrder}. It passes at 1.2 or more." },
          business: { summary: "Many orders include more than one item.", detail: "Each extra item adds to the order without the cost of bringing in a new shopper." },
          protect: "Keep related products and bundles on best sellers and in the cart.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "GA4 item units sold divided by transactions over 28 days: {itemsPerOrder}. It passes at 1.2 or more. Units count, so three of one product count as 3." },
          business: { summary: "Most orders hold a single item.", detail: "Each order then has to carry the full cost of bringing that shopper in. Suggesting a second item is one of the cheapest ways to raise what each order brings." },
          step: "Add related products or a bundle on your best-selling product pages and in the cart.",
          doneWhen: "GA4 shows 1.2 or more item units per order on average over 28 days.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Most of your orders have only one item.", detail: "You pay to bring each customer, and they buy one thing and leave. Suggesting a matching product or a bundle makes each order bring in more." } },
      },
      media_buyer: {
        fail: { business: { summary: "Orders average under 1.2 items, so AOV and ROAS stay lower than they could be at the same CAC.", detail: "Every paid buyer leaves with one item, so the order value has to cover the full acquisition cost. Cross-sells and bundles raise AOV without more spend. The owner adds them on product pages and in the cart." } },
      },
      agency: {
        fail: { business: { summary: "Most of the store's orders hold a single item.", detail: "Each order then has to carry the full cost of bringing that shopper in. Suggesting a second item is one of the cheapest ways to raise what each order brings." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "متوسط القطع في الطلب 1.2 أو أكثر خلال 28 يومًا في GA4.", detail: "القطع المباعة مقسومة على المعاملات في GA4 خلال 28 يومًا: {itemsPerOrder}. ينجح البند عند 1.2 أو أكثر." },
          business: { summary: "طلبات كثيرة تضم أكثر من منتج.", detail: "كل منتج إضافي يرفع قيمة الطلب دون تكلفة جلب عميل جديد." },
          protect: "أبقِ المنتجات المقترحة والباقات على المنتجات الأكثر مبيعًا وفي السلة.",
        },
        fail: {
          technical: { summary: "متوسط القطع في الطلب أقل من 1.2 خلال 28 يومًا في GA4.", detail: "القطع المباعة مقسومة على المعاملات في GA4 خلال 28 يومًا: {itemsPerOrder}. ينجح البند عند 1.2 أو أكثر. تُحسب القطع، فثلاث قطع من المنتج نفسه تُحسب 3." },
          business: { summary: "معظم الطلبات تضم منتجًا واحدًا.", detail: "فيتحمّل كل طلب تكلفة جلب العميل كاملة. واقتراح منتج ثانٍ من أرخص الطرق لرفع ما يجلبه كل طلب." },
          step: "أضف منتجات مقترحة أو باقة في صفحات المنتجات الأكثر مبيعًا وفي السلة.",
          doneWhen: "يعرض GA4 متوسط 1.2 قطعة أو أكثر في الطلب خلال 28 يومًا.",
        },
      },
      store_owner: {
        fail: { business: { summary: "أغلب طلباتك فيها منتج واحد بس.", detail: "تدفع عشان تجيب كل عميل، ويشتري شي واحد ويطلع. اقتراح منتج يناسبه أو باقة يخلي كل طلب يجيب لك أكثر." } },
      },
      media_buyer: {
        fail: { business: { summary: "متوسط القطع في الأوردر أقل من 1.2، فالـ AOV والـ ROAS أقل مما ينفع على نفس الـ CAC.", detail: "كل مشتري جاي من إعلان بيخرج بمنتج واحد، فقيمة الأوردر لازم تغطي تكلفة الاستحواذ كلها. الـ cross-sell والباقات بيرفعوا الـ AOV من غير صرف زيادة. صاحب المتجر يضيفهم في صفحات المنتجات والسلة." } },
      },
      agency: {
        fail: { business: { summary: "معظم طلبات «المتجر» تضم منتجًا واحدًا.", detail: "فيتحمّل كل طلب تكلفة جلب العميل كاملة. واقتراح منتج ثانٍ من أرخص الطرق لرفع ما يجلبه كل طلب." } },
      },
    },
  },
  "OFFER-16": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "After our Add to Cart click, the cart shows a crossed-out price or a line naming the saving." },
          business: { summary: "The cart reminds shoppers what they save.", detail: "Seeing the saving again just before checkout keeps the deal in mind when they decide to pay." },
          protect: "Check a discounted item in the cart after any theme or cart app change.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "The product we added has a crossed-out old price near its buy button. The cart page shows no crossed-out price and no saving line (You saved, Save, % off and the Arabic forms)." },
          business: { summary: "The cart drops the saving on discounted items.", detail: "Shoppers chose the product partly for the deal. When the cart shows only the final price, the reason to buy fades just before they pay." },
          step: "Ask your developer to show the crossed-out old price on cart lines, or a You saved line with the amount.",
          doneWhen: "With a discounted item in the cart, the cart page shows its crossed-out old price or a saving line.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your cart doesn't show customers what they saved.", detail: "They picked the product because of the discount, then the cart shows only the final price. Reminding them of the saving right before paying helps them finish the order." } },
      },
      media_buyer: {
        fail: { business: { summary: "The cart hides the saving on discounted items, so CVR from cart to checkout is lower than it could be.", detail: "Shoppers from discount ads lose sight of the deal at the last step, and some drop off, which raises CPA. The developer adds the old price or a saving line to the cart." } },
      },
      agency: {
        fail: { business: { summary: "The store's cart drops the saving on discounted items.", detail: "Shoppers chose the product partly for the deal. When the cart shows only the final price, the reason to buy fades just before they pay." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "السلة تعرض سعرًا مشطوبًا أو سطرًا بمقدار التوفير.", detail: "بعد نقرة الإضافة للسلة، تعرض السلة سعرًا قديمًا مشطوبًا أو سطرًا يذكر التوفير." },
          business: { summary: "السلة تذكّر العميل بما يوفّره.", detail: "رؤية التوفير مرة أخرى قبل الدفع تبقي العرض حاضرًا وقت القرار." },
          protect: "افحص منتجًا مخفّضًا في السلة بعد أي تغيير في القالب أو تطبيق السلة.",
        },
        fail: {
          technical: { summary: "المنتج المضاف مخفّض، لكن صفحة السلة لا تعرض سعرًا مشطوبًا ولا سطر توفير.", detail: "المنتج الذي أضفناه يحمل سعرًا قديمًا مشطوبًا قرب زر الشراء. وصفحة السلة لا تعرض سعرًا مشطوبًا ولا سطرًا يذكر التوفير." },
          business: { summary: "السلة تُسقط التوفير عن المنتجات المخفّضة.", detail: "اختار العميل المنتج جزئيًا بسبب العرض. وعندما تعرض السلة السعر النهائي فقط، يضعف سبب الشراء قبل الدفع مباشرة." },
          step: "اطلب من المطوّر عرض السعر القديم المشطوب في بنود السلة، أو سطر «وفّرت» مع المبلغ.",
          doneWhen: "عند وجود منتج مخفّض في السلة، تعرض صفحة السلة سعره القديم المشطوب أو سطر توفير.",
        },
      },
      store_owner: {
        fail: { business: { summary: "السلة عندك ما توري العميل كم وفّر.", detail: "اختار المنتج عشان الخصم، وبعدين السلة توريه السعر النهائي بس. تذكيره بالتوفير قبل الدفع يساعده يكمل الطلب." } },
      },
      media_buyer: {
        fail: { business: { summary: "السلة مخبّية التوفير على المنتجات المخفّضة، فالـ CVR من السلة للـ checkout أقل مما ينفع.", detail: "اللي جاي من إعلانات الخصم بينسى العرض في آخر خطوة، وناس بتمشي، والـ CPA بيعلى. المطوّر يضيف السعر القديم أو سطر التوفير في السلة." } },
      },
      agency: {
        fail: { business: { summary: "سلة «المتجر» تُسقط التوفير عن المنتجات المخفّضة.", detail: "اختار العميل المنتج جزئيًا بسبب العرض. وعندما تعرض السلة السعر النهائي فقط، يضعف سبب الشراء قبل الدفع مباشرة." } },
      },
    },
  },
  "OFFER-18": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "On a phone, the nearest stock or sale message (\"{message}\") sits {distancePx}px from the product price; the limit is 200px." },
          business: { summary: "The stock or sale message sits right by the price.", detail: "Shoppers read it together with the price, so a real reason to buy now reaches them at the moment they decide." },
          protect: "Show stock and sale-end messages only when they are true, and keep them next to the price.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "On a phone, the nearest stock or sale message (\"{message}\") sits {distancePx}px from the product price block. It passes at 200px or less. A page with no such message is not a fail." },
          business: { summary: "The stock or sale message sits far from the price, so shoppers miss it.", detail: "A low-stock or sale-end note only helps when it is read with the price. Placed elsewhere on the page, it rarely changes the decision." },
          step: "Move the stock or sale-end message right under the price, and show it only when it is true.",
          doneWhen: "On a phone, the stock or sale-end message sits within 200px of the product price.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your stock or sale message is far from the price, so shoppers don't see it.", detail: "A line like Only 3 left helps a shopper decide, but only when they read it next to the price. Keep it true: false urgency costs trust." } },
      },
      media_buyer: {
        fail: { business: { summary: "The stock or sale-end message sits far from the price, so CVR on paid product traffic is lower than it could be.", detail: "Paid visitors read the price area first and often nothing else. A real stock or sale-end note there gives them a reason to buy now; placed lower, it's missed. The owner or developer moves it in the theme." } },
      },
      agency: {
        fail: { business: { summary: "The store's stock or sale message sits far from the price, so shoppers miss it.", detail: "A low-stock or sale-end note only helps when it is read with the price. Placed elsewhere on the page, it rarely changes the decision." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "رسالة المخزون أو انتهاء العرض قريبة من سعر المنتج على الجوال.", detail: "على الجوال، أقرب رسالة مخزون أو عرض (\"{message}\") تبعد {distancePx} بكسل عن السعر، والحد 200 بكسل." },
          business: { summary: "رسالة المخزون أو العرض بجانب السعر مباشرة.", detail: "يقرأها العميل مع السعر، فيصله سبب حقيقي للشراء الآن لحظة القرار." },
          protect: "اعرض رسائل المخزون وانتهاء العرض فقط عندما تكون صحيحة، وأبقها بجانب السعر.",
        },
        fail: {
          technical: { summary: "رسالة المخزون أو انتهاء العرض تبعد أكثر من 200 بكسل عن سعر المنتج على الجوال.", detail: "على الجوال، أقرب رسالة مخزون أو عرض (\"{message}\") تبعد {distancePx} بكسل عن السعر. ينجح البند عند 200 بكسل أو أقل، وغياب الرسالة لا يُعد فشلًا." },
          business: { summary: "رسالة المخزون أو العرض بعيدة عن السعر فلا يلاحظها العملاء.", detail: "تنبيه المخزون القليل أو انتهاء العرض لا يفيد إلا إذا قُرئ مع السعر. وفي مكان آخر من الصفحة نادرًا ما يغيّر القرار." },
          step: "انقل رسالة المخزون أو انتهاء العرض تحت السعر مباشرة، واعرضها فقط عندما تكون صحيحة.",
          doneWhen: "على الجوال، تظهر رسالة المخزون أو انتهاء العرض على بعد 200 بكسل أو أقل من سعر المنتج.",
        },
      },
      store_owner: {
        fail: { business: { summary: "رسالة المخزون أو العرض عندك بعيدة عن السعر، فالعميل ما يشوفها.", detail: "جملة مثل باقي 3 قطع تساعد العميل يقرر، بس لما يقراها جنب السعر. وخلها صادقة، لأن الاستعجال الكذاب يضيّع الثقة." } },
      },
      media_buyer: {
        fail: { business: { summary: "رسالة المخزون أو نهاية العرض بعيدة عن السعر، فالـ CVR على ترافيك المنتجات المدفوع أقل مما ينفع.", detail: "الزائر المدفوع بيقرا منطقة السعر الأول وغالبًا مش بيكمل. رسالة مخزون أو نهاية عرض حقيقية هناك بتديله سبب يشتري دلوقتي، ولو تحت بتضيع. صاحب المتجر أو المطوّر ينقلها في القالب." } },
      },
      agency: {
        fail: { business: { summary: "رسالة المخزون أو العرض لدى «المتجر» بعيدة عن السعر فلا يلاحظها العملاء.", detail: "تنبيه المخزون القليل أو انتهاء العرض لا يفيد إلا إذا قُرئ مع السعر. وفي مكان آخر من الصفحة نادرًا ما يغيّر القرار." } },
      },
    },
  },
};
