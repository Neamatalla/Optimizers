import type { PointTemplate } from "./types.js";

// Frames for AI-judged points: fixed text, the AI's finding in {observation} (types.ts).
export const FRAMES_OFFERS: Record<string, PointTemplate> = {
  "OFFER-01": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the product page and cart for the shipping cost, how it is worked out, or the free-shipping rule, shown before the checkout button." },
          business: { summary: "Shoppers see the delivery cost before checkout.", detail: "There is no surprise fee at the last step, so shoppers who added to cart have one less reason to drop out." },
          protect: "Update the delivery line on the product page and cart whenever delivery prices or the free-delivery amount change.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the product page and cart for the shipping cost, how it is worked out, or the free-shipping rule before the checkout button. None of these was found there, so shoppers first meet the cost inside checkout." },
          business: { summary: "Shoppers can't see the delivery cost until checkout.", detail: "A cost that appears only at the last step is a common reason buyers leave after adding to cart. They already chose the product, so each one lost is a sale nearly made." },
          step: "Write the delivery cost in the cart and on the product page, for example the price per city or 'Free delivery above X', and link the delivery policy page from both.",
          doneWhen: "A phone shopper can read the delivery cost on the product page or in the cart before tapping checkout.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your customers don't see the delivery cost until checkout.", detail: "A delivery fee that shows up only at the last step is a common reason buyers leave after adding to cart, even though they already picked the product." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid shoppers meet the shipping cost only in checkout, so clicks are lost at the last step.", detail: "A surprise cost at checkout drops shoppers you already paid to bring, which lowers CVR and raises CPA on the same spend. Forward this to the store owner: the delivery cost belongs in the cart and on the product page." } },
      },
      agency: {
        fail: { business: { summary: "The store shows the delivery cost only at checkout.", detail: "A cost that appears at the last step is a common reason buyers leave after adding to cart, so the store loses sales it had nearly made." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فحصنا صفحة المنتج والسلة بحثًا عن تكلفة الشحن أو طريقة حسابها أو شرط الشحن المجاني قبل زر إتمام الطلب." },
          business: { summary: "يرى العميل تكلفة التوصيل قبل الدفع.", detail: "لا توجد رسوم مفاجئة في الخطوة الأخيرة، فيقلّ سبب من أسباب خروج من أضافوا منتجًا إلى السلة." },
          protect: "حدّث سطر التوصيل في صفحة المنتج والسلة كلما تغيّرت أسعار التوصيل أو حد التوصيل المجاني.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا صفحة المنتج والسلة بحثًا عن تكلفة الشحن أو طريقة حسابها أو شرط الشحن المجاني قبل زر إتمام الطلب، ولم نجد أيًا منها هناك، فيرى العميل التكلفة لأول مرة داخل صفحة الدفع." },
          business: { summary: "العميل لا يرى تكلفة التوصيل إلا عند الدفع.", detail: "التكلفة التي تظهر في الخطوة الأخيرة فقط سبب شائع لخروج العملاء بعد الإضافة إلى السلة. هؤلاء اختاروا المنتج بالفعل، فكل خروج منهم بيع كاد يتم." },
          step: "اكتب تكلفة التوصيل في السلة وصفحة المنتج، مثل السعر لكل مدينة أو «توصيل مجاني فوق X»، واربط صفحة سياسة التوصيل من الاثنتين.",
          doneWhen: "يستطيع العميل على الجوال قراءة تكلفة التوصيل في صفحة المنتج أو السلة قبل الضغط على إتمام الطلب.",
        },
      },
      store_owner: {
        fail: { business: { summary: "عملاؤك ما يشوفون سعر التوصيل إلا عند الدفع.", detail: "رسوم التوصيل اللي تطلع فجأة في آخر خطوة سبب شائع يخلي العميل يطلع بعد ما ضاف للسلة، مع إنه اختار المنتج خلاص." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين بيشوفوا تكلفة الشحن في الـ checkout بس، فالكليكات بتضيع في آخر خطوة.", detail: "التكلفة المفاجئة في الـ checkout بتخرّج ناس انت دفعت عشان تجيبهم، فالـ CVR بيقل والـ CPA بيعلى على نفس الصرف. ابعت النقطة دي لصاحب المتجر: تكلفة التوصيل لازم تتكتب في السلة وصفحة المنتج." } },
      },
      agency: {
        fail: { business: { summary: "المتجر لا يعرض تكلفة التوصيل إلا عند الدفع.", detail: "التكلفة التي تظهر في الخطوة الأخيرة سبب شائع لخروج العملاء بعد الإضافة إلى السلة، فيخسر المتجر مبيعات كادت تتم." } },
      },
    },
  },

  "OFFER-02": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked that the product price sits next to the title in local currency, shows 'From X' when variants differ in price, and changes when another variant is picked." },
          business: { summary: "The price on the product page is clear.", detail: "Shoppers see what they will pay, in their own currency, for the option they picked." },
          protect: "Check that the price still updates after adding variants or changing the theme.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked that the price sits next to the title in local currency, shows 'From X' when variants differ, and changes with the selected variant. At least one of these is missing, so the price a shopper reads may not be the price they pay." },
          business: { summary: "The product price is unclear.", detail: "A price that sits far from the title, shows in another currency, or stays the same when the option changes leaves shoppers unsure what they will pay. Unsure shoppers hesitate, and some only find out at checkout and leave there." },
          step: "Place the price right under the title in the local currency, show 'From X' when options differ in price, and make sure the price changes when another option is picked. The theme settings or the developer handle the last part.",
          doneWhen: "On a phone, the price shows under the title in local currency and changes when another option is picked.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The price on your product page isn't clear.", detail: "If the price is far from the product name, in the wrong currency, or doesn't change with the size or colour picked, customers don't know what they'll pay and many leave." } },
      },
      media_buyer: {
        fail: { business: { summary: "The product page price is unclear, so paid visitors hesitate before adding to cart.", detail: "When the price is hard to find, in the wrong currency or wrong for the variant, shoppers from ads doubt the offer, so CVR drops and CPA rises. A gap between the ad price and the page price makes it worse. Forward this to the store owner or developer." } },
      },
      agency: {
        fail: { business: { summary: "The store's product price is unclear.", detail: "A price away from the title, in another currency, or not updating with the variant leaves shoppers unsure what they'll pay, and the store loses some of them before the cart." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "تحققنا من أن السعر بجانب اسم المنتج بالعملة المحلية، ويظهر «يبدأ من X» عند اختلاف أسعار الخيارات، ويتغير عند اختيار خيار آخر." },
          business: { summary: "السعر في صفحة المنتج واضح.", detail: "يرى العميل ما سيدفعه بعملته، للخيار الذي اختاره." },
          protect: "تأكد أن السعر ما زال يتغير مع الخيارات بعد إضافة خيارات جديدة أو تغيير القالب.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "تحققنا من أن السعر بجانب اسم المنتج بالعملة المحلية، ويظهر «يبدأ من X» عند اختلاف الخيارات، ويتغير مع الخيار المحدد. أحد هذه الشروط على الأقل غير متحقق، فقد لا يكون السعر الذي يقرؤه العميل هو ما سيدفعه." },
          business: { summary: "سعر المنتج غير واضح.", detail: "السعر البعيد عن اسم المنتج، أو بعملة أخرى، أو الذي لا يتغير مع الخيار، يترك العميل غير متأكد مما سيدفعه. العميل المتردد يؤجل، وبعضهم يكتشف السعر عند الدفع ويغادر." },
          step: "ضع السعر مباشرة تحت اسم المنتج بالعملة المحلية، واعرض «يبدأ من X» عند اختلاف أسعار الخيارات، وتأكد أن السعر يتغير عند اختيار خيار آخر. الجزء الأخير من إعدادات القالب أو المطوّر.",
          doneWhen: "على الجوال، يظهر السعر تحت اسم المنتج بالعملة المحلية ويتغير عند اختيار خيار آخر.",
        },
      },
      store_owner: {
        fail: { business: { summary: "السعر في صفحة منتجك مو واضح.", detail: "إذا كان السعر بعيد عن اسم المنتج، أو بعملة ثانية، أو ما يتغير مع المقاس أو اللون، العميل ما يعرف كم بيدفع وكثير منهم يطلعون." } },
      },
      media_buyer: {
        fail: { business: { summary: "السعر في صفحة المنتج مش واضح، فالزوار المدفوعين بيترددوا قبل ما يضيفوا للسلة.", detail: "لما السعر يكون صعب يتلاقي، أو بعملة غلط، أو مش مظبوط مع الـ variant، الجاي من الإعلان بيشك في العرض، فالـ CVR بيقل والـ CPA بيعلى. ولو مختلف عن السعر في الإعلان الموضوع بيبقى أسوأ. ابعت النقطة دي لصاحب المتجر أو المطوّر." } },
      },
      agency: {
        fail: { business: { summary: "سعر المنتج في المتجر غير واضح.", detail: "السعر البعيد عن اسم المنتج، أو بعملة أخرى، أو الذي لا يتغير مع الخيار، يترك العميل غير متأكد مما سيدفعه، فيخسر المتجر بعضهم قبل السلة." } },
      },
    },
  },

  "OFFER-05": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the product page and collection cards for a delivery time estimate, in days, as a date or by city, near the buy box." },
          business: { summary: "Shoppers see when the order will arrive before buying.", detail: "Knowing the delivery time removes a reason to wait, which matters most for gifts and occasions." },
          protect: "Update the delivery time line when couriers or delivery areas change.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the product page and collection cards for a delivery time estimate, in days, as a date or by city, near the buy box. None was found there, so shoppers have to guess or search the policy pages." },
          business: { summary: "Shoppers can't see when the order will arrive.", detail: "Shoppers who don't know the delivery time hesitate, most of all when buying a gift or for a date. Some put the purchase off and don't come back." },
          step: "Add a short line under the price: 'Delivery in X to Y days', by city if it differs.",
          doneWhen: "The product page shows a delivery time on a phone.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your customers can't see when their order will arrive.", detail: "When the delivery time isn't clear, customers hesitate, especially for a gift or an occasion, and many leave to think about it." } },
      },
      media_buyer: {
        fail: { business: { summary: "No delivery time near the buy box, so paid shoppers hesitate.", detail: "Shoppers from ads who don't know when it arrives hold off on the product page or in the cart, so CVR likely drops and CPA rises. Forward this to the store owner: it is one line under the price." } },
      },
      agency: {
        fail: { business: { summary: "The store doesn't show a delivery time before buying.", detail: "Shoppers who don't know when the order arrives hesitate, most of all for gifts and occasions, and the store loses some of those sales." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فحصنا صفحة المنتج وبطاقات التصنيفات بحثًا عن مدة توصيل متوقعة بالأيام أو بتاريخ أو حسب المدينة، قرب زر الشراء." },
          business: { summary: "يعرف العميل موعد وصول طلبه قبل الشراء.", detail: "معرفة مدة التوصيل تزيل سببًا للتأجيل، وهذا أهم ما يكون في الهدايا والمناسبات." },
          protect: "حدّث سطر مدة التوصيل عند تغيير شركة التوصيل أو مناطق التوصيل.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا صفحة المنتج وبطاقات التصنيفات بحثًا عن مدة توصيل متوقعة بالأيام أو بتاريخ أو حسب المدينة، قرب زر الشراء، ولم نجدها، فعلى العميل أن يخمّن أو يبحث في صفحات السياسات." },
          business: { summary: "العميل لا يعرف متى سيصل طلبه.", detail: "العميل الذي لا يعرف مدة التوصيل يتردد، خاصة عند شراء هدية أو لموعد محدد. بعضهم يؤجل الشراء ولا يعود." },
          step: "أضف سطرًا قصيرًا تحت السعر: «التوصيل خلال X إلى Y أيام»، وحسب المدينة إن اختلفت المدة.",
          doneWhen: "تظهر مدة التوصيل في صفحة المنتج على الجوال.",
        },
      },
      store_owner: {
        fail: { business: { summary: "عملاؤك ما يعرفون متى بيوصلهم الطلب.", detail: "إذا مدة التوصيل مو واضحة، العميل يتردد، خصوصًا لو هدية أو لمناسبة، وكثير منهم يطلعون يفكرون وما يرجعون." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش مدة توصيل جنب زرار الشراء، فالزوار المدفوعين بيترددوا.", detail: "الجاي من الإعلان ومش عارف الأوردر هيوصل إمتى بيتأخر في صفحة المنتج أو السلة، فالـ CVR غالبًا بيقل والـ CPA بيعلى. ابعت النقطة دي لصاحب المتجر: هي سطر واحد تحت السعر." } },
      },
      agency: {
        fail: { business: { summary: "المتجر لا يعرض مدة التوصيل قبل الشراء.", detail: "العميل الذي لا يعرف موعد وصول الطلب يتردد، خاصة في الهدايا والمناسبات، فيخسر المتجر جزءًا من هذه المبيعات." } },
      },
    },
  },

  "OFFER-07": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked for icons or text for GCC payment methods (mada, Apple Pay, Tabby or Tamara, cash on delivery) and a secure-checkout line by Add to cart and the cart checkout button, beyond the footer." },
          business: { summary: "Shoppers see their payment methods next to the buy button.", detail: "A shopper knows they can pay their usual way before starting checkout." },
          protect: "When a payment method is added or removed at checkout, update the icons by the buttons to match.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked for icons or text for GCC payment methods (mada, Apple Pay, Tabby or Tamara, cash on delivery) and a secure-checkout line by Add to cart and the cart checkout button. The methods, the secure-checkout line, or both are missing there or show only in the footer." },
          business: { summary: "Payment methods aren't visible next to the buy button.", detail: "Shoppers who don't see mada, Apple Pay, instalments or cash on delivery near the button don't know they can pay their way. Some stop before checkout, after already choosing the product." },
          step: "Show the accepted payment icons and a short secure-checkout line under Add to cart and by the cart checkout button. If the store offers Tabby or Tamara, the developer adds their widget.",
          doneWhen: "Payment icons or an instalment widget show next to Add to cart and the cart checkout button on a phone.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your customers don't see how they can pay before checkout.", detail: "If mada, Apple Pay, Tabby, Tamara or cash on delivery don't show next to the Add to cart button, some customers stop before checkout, after they already chose the product." } },
      },
      media_buyer: {
        fail: { business: { summary: "Local payment options aren't visible by the buy button, so paid shoppers drop before checkout.", detail: "Shoppers who can't see mada, Apple Pay or BNPL near the button stall, so CVR reads lower and CPA higher than the traffic deserves. Forward this to the store owner: it is icons and a widget by the buttons." } },
      },
      agency: {
        fail: { business: { summary: "The store doesn't show its payment methods next to the buy button.", detail: "Shoppers who don't see mada, Apple Pay, instalments or cash on delivery near the button don't know they can pay their way, and some stop before checkout." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فحصنا وجود أيقونات أو نص لطرق الدفع الخليجية (مدى، Apple Pay، تابي أو تمارا، الدفع عند الاستلام) وسطر الدفع الآمن بجانب زر الإضافة إلى السلة وزر إتمام الطلب، وليس في التذييل فقط." },
          business: { summary: "يرى العميل طرق الدفع المناسبة له بجانب زر الشراء.", detail: "يعرف العميل أنه يستطيع الدفع بطريقته المعتادة قبل أن يبدأ إتمام الطلب." },
          protect: "عند إضافة طريقة دفع أو إزالتها من صفحة الدفع، حدّث الأيقونات بجانب الأزرار لتطابقها.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا وجود أيقونات أو نص لطرق الدفع الخليجية (مدى، Apple Pay، تابي أو تمارا، الدفع عند الاستلام) وسطر الدفع الآمن بجانب زر الإضافة إلى السلة وزر إتمام الطلب. طرق الدفع أو سطر الدفع الآمن أو كلاهما غير موجود هناك، أو يظهر في التذييل فقط." },
          business: { summary: "طرق الدفع لا تظهر بجانب زر الشراء.", detail: "العميل الذي لا يرى مدى أو Apple Pay أو التقسيط أو الدفع عند الاستلام قرب الزر لا يعرف أنه يستطيع الدفع بطريقته. بعضهم يتوقف قبل إتمام الطلب بعد أن اختار المنتج." },
          step: "اعرض أيقونات طرق الدفع المقبولة وسطرًا قصيرًا عن الدفع الآمن تحت زر الإضافة إلى السلة وبجانب زر إتمام الطلب في السلة. إن كان المتجر يقدم تابي أو تمارا، يضيف المطوّر الأداة الخاصة بها.",
          doneWhen: "تظهر أيقونات الدفع أو أداة التقسيط بجانب زر الإضافة إلى السلة وزر إتمام الطلب على الجوال.",
        },
      },
      store_owner: {
        fail: { business: { summary: "عملاؤك ما يشوفون كيف يقدرون يدفعون قبل الدفع.", detail: "إذا مدى وApple Pay وتابي وتمارا والدفع عند الاستلام ما تطلع جنب زر أضف للسلة، بعض العملاء يوقفون قبل الدفع، مع إنهم اختاروا المنتج." } },
      },
      media_buyer: {
        fail: { business: { summary: "طرق الدفع المحلية مش ظاهرة جنب زرار الشراء، فالزوار المدفوعين بيخرجوا قبل الـ checkout.", detail: "اللي مش شايف مدى أو Apple Pay أو BNPL جنب الزرار بيقف، فالـ CVR بيبان أقل والـ CPA أعلى من اللي الترافيك يستاهله. ابعت النقطة دي لصاحب المتجر: هي أيقونات وwidget جنب الأزرار." } },
      },
      agency: {
        fail: { business: { summary: "المتجر لا يعرض طرق الدفع بجانب زر الشراء.", detail: "العميل الذي لا يرى مدى أو Apple Pay أو التقسيط أو الدفع عند الاستلام قرب الزر لا يعرف أنه يستطيع الدفع بطريقته، وبعضهم يتوقف قبل إتمام الطلب." } },
      },
    },
  },

  "OFFER-09": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the cart for a progress bar or line naming the exact amount left for free shipping or a free gift." },
          business: { summary: "The cart tells shoppers how much is left for free delivery.", detail: "An exact amount gives shoppers a clear reason to add one more item, which raises order value." },
          protect: "Change the amount in the bar on the same day the free-delivery threshold changes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the cart for a progress bar or line naming the exact amount left for free shipping or a free gift. None was found, or it doesn't name the amount left, so shoppers can't tell how close they are." },
          business: { summary: "The cart doesn't show how much is left for free delivery.", detail: "Shoppers who don't see the gap have no nudge to add one more item, so orders stay smaller than they could be." },
          step: "Turn on a free-delivery progress bar in the cart that names the amount left, for example 'Add X more for free delivery'.",
          doneWhen: "The cart shows the exact amount left for free delivery or a free gift, and it updates when an item is added.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your cart doesn't tell customers how much is left for free delivery.", detail: "A line like 'Add X more for free delivery' gives customers a reason to add another item. Without it, orders stay smaller." } },
      },
      media_buyer: {
        fail: { business: { summary: "The cart doesn't show the amount left for free shipping, so AOV stays lower than it could.", detail: "A progress bar nudges paid shoppers to add one more item, which lifts AOV and ROAS at the same CAC. Forward this to the store owner: it is a cart setting or app." } },
      },
      agency: {
        fail: { business: { summary: "The store's cart doesn't show how much is left for free delivery.", detail: "Shoppers who don't see the gap have no nudge to add one more item, so the store's orders stay smaller than they could be." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فحصنا السلة بحثًا عن شريط تقدّم أو سطر يذكر المبلغ المتبقي بالضبط للتوصيل المجاني أو لهدية مجانية." },
          business: { summary: "السلة تخبر العميل بالمبلغ المتبقي للتوصيل المجاني.", detail: "المبلغ الدقيق يعطي العميل سببًا واضحًا لإضافة منتج آخر، فترتفع قيمة الطلب." },
          protect: "غيّر المبلغ في الشريط في نفس يوم تغيير حد التوصيل المجاني.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا السلة بحثًا عن شريط تقدّم أو سطر يذكر المبلغ المتبقي بالضبط للتوصيل المجاني أو لهدية مجانية. لم نجده، أو لا يذكر المبلغ المتبقي، فلا يعرف العميل كم بقي له." },
          business: { summary: "السلة لا تُظهر المبلغ المتبقي للتوصيل المجاني.", detail: "العميل الذي لا يرى الفرق لا يجد دافعًا لإضافة منتج آخر، فتبقى الطلبات أصغر مما يمكن." },
          step: "فعّل شريط تقدّم للتوصيل المجاني في السلة يذكر المبلغ المتبقي، مثل «أضف X للحصول على توصيل مجاني».",
          doneWhen: "تُظهر السلة المبلغ المتبقي بالضبط للتوصيل المجاني أو للهدية، ويتحدّث عند إضافة منتج.",
        },
      },
      store_owner: {
        fail: { business: { summary: "سلة متجرك ما تقول للعميل كم باقي له على التوصيل المجاني.", detail: "سطر مثل «أضف X وتحصل توصيل مجاني» يعطي العميل سبب يضيف منتج ثاني. بدونه الطلبات تظل أصغر." } },
      },
      media_buyer: {
        fail: { business: { summary: "السلة مش بتوضح الباقي على الشحن المجاني، فالـ AOV أقل من اللي ممكن يوصله.", detail: "شريط التقدّم بيشجع الزائر المدفوع يضيف منتج كمان، فالـ AOV والـ ROAS بيعلوا على نفس الـ CAC. ابعت النقطة دي لصاحب المتجر: هي إعداد في السلة أو تطبيق." } },
      },
      agency: {
        fail: { business: { summary: "سلة المتجر لا تُظهر المبلغ المتبقي للتوصيل المجاني.", detail: "العميل الذي لا يرى الفرق لا يجد دافعًا لإضافة منتج آخر، فتبقى طلبات المتجر أصغر مما يمكن." } },
      },
    },
  },

  "OFFER-10": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Compared the offer and free-shipping amount in the announcement bar with those shown in the cart." },
          business: { summary: "The cart matches the offer in the announcement bar.", detail: "Shoppers find the deal they were promised when they reach the cart, so the offer builds trust." },
          protect: "Change the cart rule and the announcement bar together whenever an offer starts, ends or changes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Compared the offer and free-shipping amount in the announcement bar with those shown in the cart. They differ, so the cart doesn't show or apply what the bar promises." },
          business: { summary: "The cart doesn't match the offer in the announcement bar.", detail: "A shopper who comes for the advertised deal and finds a different one in the cart feels misled. Many leave, and some stop trusting the store's next offer." },
          step: "Make the announcement bar and the cart say the same thing: the same discount and the same free-shipping amount. Remove the bar text when an offer ends.",
          doneWhen: "The offer and free-shipping amount in the announcement bar match what the cart shows and applies.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your cart doesn't match the offer in your announcement bar.", detail: "A customer who comes for the deal at the top of the site and finds something different in the cart feels misled, and many leave without buying." } },
      },
      media_buyer: {
        fail: { business: { summary: "The cart doesn't match the offer on the site, so shoppers who came for it drop.", detail: "If the announcement bar promises one deal and the cart shows another, paid shoppers feel misled, so CVR drops and CPA rises. Check the offer in your ads against the cart too. Forward this to the store owner." } },
      },
      agency: {
        fail: { business: { summary: "The store's cart doesn't match the offer in its announcement bar.", detail: "A shopper who comes for the advertised deal and finds a different one in the cart feels misled, and the store loses many of them at that point." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "قارنّا العرض ومبلغ التوصيل المجاني في الشريط الإعلاني بما يظهر في السلة." },
          business: { summary: "السلة تطابق العرض المكتوب في الشريط الإعلاني.", detail: "يجد العميل في السلة العرض الذي وُعد به، فيبني العرض الثقة." },
          protect: "غيّر قاعدة السلة والشريط الإعلاني معًا كلما بدأ عرض أو انتهى أو تغيّر.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "قارنّا العرض ومبلغ التوصيل المجاني في الشريط الإعلاني بما يظهر في السلة. هناك اختلاف، فالسلة لا تعرض أو لا تطبّق ما يعد به الشريط." },
          business: { summary: "السلة لا تطابق العرض المكتوب في الشريط الإعلاني.", detail: "العميل الذي جاء من أجل العرض المعلن ثم وجد غيره في السلة يشعر بالخداع. كثيرون يغادرون، وبعضهم يفقد الثقة في عروض المتجر القادمة." },
          step: "اجعل الشريط الإعلاني والسلة يقولان الشيء نفسه: الخصم نفسه ومبلغ التوصيل المجاني نفسه. واحذف نص الشريط عند انتهاء العرض.",
          doneWhen: "العرض ومبلغ التوصيل المجاني في الشريط الإعلاني يطابقان ما تعرضه السلة وتطبّقه.",
        },
      },
      store_owner: {
        fail: { business: { summary: "سلتك ما تطابق العرض المكتوب في شريط أعلى متجرك.", detail: "العميل اللي جاي عشان العرض اللي فوق ويلقى شي ثاني في السلة يحس إنه انخدع، وكثير منهم يطلعون بدون ما يشترون." } },
      },
      media_buyer: {
        fail: { business: { summary: "السلة مش مطابقة للعرض اللي على الموقع، فاللي جاي عشانه بيخرج.", detail: "لو الشريط بيوعد بعرض والسلة بتوري عرض تاني، الزائر المدفوع بيحس إنه اتضحك عليه، فالـ CVR بيقل والـ CPA بيعلى. قارن كمان العرض اللي في إعلاناتك بالسلة. ابعت النقطة دي لصاحب المتجر." } },
      },
      agency: {
        fail: { business: { summary: "سلة المتجر لا تطابق العرض في شريطه الإعلاني.", detail: "العميل الذي جاء من أجل العرض المعلن ثم وجد غيره في السلة يشعر بالخداع، فيخسر المتجر كثيرين منهم في هذه النقطة." } },
      },
    },
  },

  "OFFER-11": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the product page for a bundle or quantity offer next to the price or button that states the exact saving, as an amount or %." },
          business: { summary: "The product page shows a bundle offer with a clear saving.", detail: "Shoppers see exactly what they save by buying more, which gives them a reason to add a second item." },
          protect: "Recheck the stated saving whenever bundle prices or the product price change.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the product page for a bundle or quantity offer next to the price or button that states the exact saving, as an amount or %. None was found there, or the offer gives no exact saving, for example only '2x1'." },
          business: { summary: "No bundle offer with a clear saving sits by the price.", detail: "Shoppers add a second item when they see exactly what it saves them. Without a stated saving next to the button, that reason is missing and orders stay smaller." },
          step: "Add a bundle or multi-buy offer next to the price or Add to cart button and state the exact saving, for example 'Buy 2, save X%'. A bundle app or the developer can add it.",
          doneWhen: "A bundle or multi-buy offer with its saving as an amount or % shows next to the Add to cart button.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your product page has no bundle offer with a clear saving.", detail: "Customers add a second item when they see exactly how much they save. Without that next to the button, most orders stay at one item." } },
      },
      media_buyer: {
        fail: { business: { summary: "No quantified bundle near the button, so AOV stays lower than it could.", detail: "A clear multi-buy saving gets paid shoppers to add a second item, which lifts AOV and ROAS at the same CAC. Forward this to the store owner: it is an offer setting or a bundle app." } },
      },
      agency: {
        fail: { business: { summary: "The store's product page has no bundle offer with a clear saving.", detail: "Shoppers add a second item when they see exactly what it saves them. Without a stated saving next to the button, the store's orders stay smaller." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فحصنا صفحة المنتج بحثًا عن عرض باقة أو كمية بجانب السعر أو الزر يذكر التوفير الدقيق بالمبلغ أو بالنسبة." },
          business: { summary: "صفحة المنتج تعرض باقة بتوفير واضح.", detail: "يرى العميل بالضبط كم يوفّر عند شراء أكثر، فيجد سببًا لإضافة قطعة ثانية." },
          protect: "راجع التوفير المكتوب كلما تغيّر سعر الباقة أو سعر المنتج.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا صفحة المنتج بحثًا عن عرض باقة أو كمية بجانب السعر أو الزر يذكر التوفير الدقيق بالمبلغ أو بالنسبة. لم نجد عرضًا هناك، أو العرض لا يذكر توفيرًا دقيقًا، مثل «2x1» فقط." },
          business: { summary: "لا توجد باقة بتوفير واضح بجانب السعر.", detail: "يضيف العميل قطعة ثانية عندما يرى بالضبط كم توفّر له. بدون توفير مكتوب بجانب الزر يغيب هذا السبب وتبقى الطلبات أصغر." },
          step: "أضف عرض باقة أو كمية بجانب السعر أو زر الإضافة إلى السلة واذكر التوفير الدقيق، مثل «اشترِ 2 ووفّر X%». يمكن إضافته بتطبيق باقات أو عبر المطوّر.",
          doneWhen: "يظهر عرض باقة أو كمية مع التوفير بالمبلغ أو بالنسبة بجانب زر الإضافة إلى السلة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحة منتجك ما فيها باقة بتوفير واضح.", detail: "العميل يضيف قطعة ثانية لما يشوف بالضبط كم بيوفّر. بدون هالشي جنب الزر، أغلب الطلبات تظل قطعة وحدة." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش باقة بتوفير واضح جنب الزرار، فالـ AOV أقل من اللي ممكن يوصله.", detail: "التوفير الواضح على الكمية بيخلي الزائر المدفوع يضيف قطعة تانية، فالـ AOV والـ ROAS بيعلوا على نفس الـ CAC. ابعت النقطة دي لصاحب المتجر: هي إعداد عرض أو تطبيق باقات." } },
      },
      agency: {
        fail: { business: { summary: "صفحة المنتج في المتجر لا تعرض باقة بتوفير واضح.", detail: "يضيف العميل قطعة ثانية عندما يرى بالضبط كم توفّر له. بدون توفير مكتوب بجانب الزر تبقى طلبات المتجر أصغر." } },
      },
    },
  },

  "OFFER-12": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the product page and cart for 2 to 3 relevant add-ons, each with an image, a price and a one-tap Add button." },
          business: { summary: "Shoppers are offered matching add-ons they can add in one tap.", detail: "A buyer can add a matching item to the same order without leaving the page, which raises order value." },
          protect: "Keep the suggested add-ons in stock and matched to the product when the catalogue changes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the product page and cart for 2 to 3 relevant add-ons, each with an image, a price and a one-tap Add button. None were found, or they miss one of these or don't match the product." },
          business: { summary: "The product page and cart don't offer easy add-ons.", detail: "Buyers who would take a matching item don't see one, or have to open another page to add it. Each missed add-on is order value the store doesn't get." },
          step: "Turn on related products on the product page and a 'you may also like' block in the cart, with 2 to 3 matching items, each with an image, a price and an Add button.",
          doneWhen: "The product page and cart each show at least one in-stock matching add-on with an image, a price and a one-tap Add button.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your store doesn't suggest matching items to add to the order.", detail: "A customer who would happily add a matching item doesn't see one, or has to go looking for it. Each missed add-on is money left out of the order." } },
      },
      media_buyer: {
        fail: { business: { summary: "No one-tap add-ons on the product page or cart, so AOV stays lower than it could.", detail: "Matching add-ons get paid shoppers to put more in the same order, which lifts AOV and ROAS at the same CAC. Forward this to the store owner: it is a related-products setting or app." } },
      },
      agency: {
        fail: { business: { summary: "The store doesn't offer easy add-ons on the product page or in the cart.", detail: "Buyers who would take a matching item don't see one, or have to open another page to add it, so the store misses order value." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فحصنا صفحة المنتج والسلة بحثًا عن 2 إلى 3 منتجات مكمّلة مناسبة، لكل منها صورة وسعر وزر إضافة بضغطة واحدة." },
          business: { summary: "يُعرض على العميل منتجات مكمّلة يضيفها بضغطة واحدة.", detail: "يستطيع المشتري إضافة منتج مناسب إلى الطلب نفسه دون مغادرة الصفحة، فترتفع قيمة الطلب." },
          protect: "أبقِ المنتجات المقترحة متوفرة ومناسبة للمنتج كلما تغيّرت المنتجات في المتجر.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا صفحة المنتج والسلة بحثًا عن 2 إلى 3 منتجات مكمّلة مناسبة، لكل منها صورة وسعر وزر إضافة بضغطة واحدة. لم نجدها، أو ينقصها أحد هذه العناصر، أو لا تناسب المنتج." },
          business: { summary: "صفحة المنتج والسلة لا تقترحان منتجات مكمّلة سهلة الإضافة.", detail: "المشتري الذي كان سيضيف منتجًا مناسبًا لا يراه، أو يضطر لفتح صفحة أخرى لإضافته. كل إضافة ضائعة قيمة طلب لا يحصل عليها المتجر." },
          step: "فعّل قسم المنتجات ذات الصلة في صفحة المنتج وقسم «قد يعجبك أيضًا» في السلة، بـ 2 إلى 3 منتجات مناسبة، لكل منها صورة وسعر وزر إضافة.",
          doneWhen: "تعرض صفحة المنتج والسلة كل منهما منتجًا مكمّلًا متوفرًا واحدًا على الأقل، بصورة وسعر وزر إضافة بضغطة واحدة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "متجرك ما يقترح منتجات تكمّل الطلب.", detail: "العميل اللي كان بيضيف منتج يناسب طلبه ما يشوفه، أو لازم يدوّر عليه. كل إضافة ضايعة فلوس طلعت من الطلب." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش منتجات مكمّلة بضغطة واحدة في صفحة المنتج أو السلة، فالـ AOV أقل من اللي ممكن يوصله.", detail: "المنتجات المكمّلة بتخلي الزائر المدفوع يحط أكتر في نفس الأوردر، فالـ AOV والـ ROAS بيعلوا على نفس الـ CAC. ابعت النقطة دي لصاحب المتجر: هي إعداد منتجات ذات صلة أو تطبيق." } },
      },
      agency: {
        fail: { business: { summary: "المتجر لا يقترح منتجات مكمّلة سهلة الإضافة في صفحة المنتج أو السلة.", detail: "المشتري الذي كان سيضيف منتجًا مناسبًا لا يراه، أو يضطر لفتح صفحة أخرى، فيفوت المتجر جزءًا من قيمة الطلب." } },
      },
    },
  },

  "OFFER-14": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the product page for competing offer messages: a promo bar, a floating discount tab and a pop-up showing at the same time." },
          business: { summary: "The product page shows one offer message at a time.", detail: "Shoppers read one clear offer and keep their attention on the product and the buy button." },
          protect: "Before adding a promo app or pop-up, check which offer messages already show on the product page.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the product page for competing offer messages: a promo bar, a floating discount tab and a pop-up showing at the same time. More than one is visible at once, so they compete with each other and with the buy button." },
          business: { summary: "Several offer messages compete on the product page.", detail: "More than one offer at once pulls attention away from the product and the button, and shoppers may not know which deal applies to them." },
          step: "Keep one offer message on the product page. Pick the strongest one, then turn off or delay the others, for example show the pop-up only when a shopper is about to leave.",
          doneWhen: "On a phone, the product page shows one offer message at a time.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Too many offers compete on your product page.", detail: "When a promo bar, a discount tab and a pop-up show together, customers lose focus on the product and may not know which deal they get." } },
      },
      media_buyer: {
        fail: { business: { summary: "Competing offer messages on the product page distract paid visitors from the buy button.", detail: "Shoppers from ads land on a page where several offers fight for attention, so fewer reach Add to cart and CVR likely drops. If the ad promises one offer and the page shows three, it is unclear which applies. Forward this to the store owner." } },
      },
      agency: {
        fail: { business: { summary: "Several offer messages compete on the store's product page.", detail: "More than one offer at once pulls attention away from the product and the button, and shoppers may not know which deal applies to them." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فحصنا صفحة المنتج بحثًا عن رسائل عروض متنافسة: شريط عرض، وزر خصم عائم، ونافذة منبثقة تظهر في الوقت نفسه." },
          business: { summary: "صفحة المنتج تعرض رسالة عرض واحدة في كل مرة.", detail: "يقرأ العميل عرضًا واحدًا واضحًا ويبقى انتباهه على المنتج وزر الشراء." },
          protect: "قبل إضافة تطبيق عروض أو نافذة منبثقة، تحقق من رسائل العروض الموجودة أصلًا في صفحة المنتج.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا صفحة المنتج بحثًا عن رسائل عروض متنافسة: شريط عرض، وزر خصم عائم، ونافذة منبثقة تظهر في الوقت نفسه. أكثر من رسالة تظهر معًا، فتتنافس فيما بينها ومع زر الشراء." },
          business: { summary: "عدة رسائل عروض تتنافس في صفحة المنتج.", detail: "أكثر من عرض في الوقت نفسه يسحب الانتباه عن المنتج والزر، وقد لا يعرف العميل أي عرض ينطبق عليه." },
          step: "أبقِ رسالة عرض واحدة في صفحة المنتج. اختر الأقوى، ثم أوقف الباقي أو أخّره، مثل إظهار النافذة المنبثقة فقط عندما يهمّ العميل بالمغادرة.",
          doneWhen: "على الجوال، تعرض صفحة المنتج رسالة عرض واحدة في كل مرة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "عروض كثيرة تتزاحم في صفحة منتجك.", detail: "لما يطلع شريط عرض وزر خصم ونافذة منبثقة مع بعض، العميل يتشتت عن المنتج وممكن ما يعرف أي عرض له." } },
      },
      media_buyer: {
        fail: { business: { summary: "رسايل عروض كتير في صفحة المنتج بتشتت الزوار المدفوعين عن زرار الشراء.", detail: "الجاي من الإعلان بيدخل صفحة فيها كذا عرض بيتخانقوا على الانتباه، فعدد أقل بيوصل لـ Add to cart والـ CVR غالبًا بيقل. ولو الإعلان بيوعد بعرض والصفحة فيها تلاتة، مش واضح أنهي اللي ينطبق. ابعت النقطة دي لصاحب المتجر." } },
      },
      agency: {
        fail: { business: { summary: "عدة رسائل عروض تتنافس في صفحة المنتج في المتجر.", detail: "أكثر من عرض في الوقت نفسه يسحب الانتباه عن المنتج والزر، وقد لا يعرف العميل أي عرض ينطبق عليه." } },
      },
    },
  },

  "OFFER-17": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the cart and checkout for a discount code field that is collapsed or behind a small link." },
          business: { summary: "There is a place for discount codes, and it stays out of the way.", detail: "Shoppers with a code can use it, and shoppers without one aren't prompted to go hunting for one." },
          protect: "Keep the field collapsed when the theme or checkout app changes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the cart and checkout for a discount code field that is collapsed or behind a small link. The field is missing, or it shows as a large open box." },
          business: { summary: "The discount code field is missing or too prominent.", detail: "With no field, shoppers holding a code from an ad or an influencer can't use it and may leave. A large open box tells shoppers without a code that others pay less, and some leave to look for one." },
          step: "If there is no field, add a small 'Have a discount code?' link in the cart that opens it. If the field is a large open box, collapse it behind that link.",
          doneWhen: "The cart or checkout has a discount code field behind a small link or in a collapsed section.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The discount code box in your store is missing or too big.", detail: "Without a code box, customers who got a code from an ad or influencer can't use it. A big open box makes customers without a code feel they're paying more, and some leave to search for one." } },
      },
      media_buyer: {
        fail: { business: { summary: "The promo code field is missing or too loud, which costs conversions.", detail: "Without a field, shoppers from code-based ads can't redeem the code, so CVR on those campaigns drops. A large open box sends shoppers off to search for codes, which also lowers CVR. Ask the store owner for a collapsed field, or use auto-apply discount links in the ads." } },
      },
      agency: {
        fail: { business: { summary: "The store's discount code field is missing or too prominent.", detail: "With no field, shoppers holding a code can't use it. A large open box tells shoppers without a code that others pay less, and some leave the store to look for one." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فحصنا السلة وصفحة الدفع بحثًا عن خانة كود خصم مطويّة أو خلف رابط صغير." },
          business: { summary: "يوجد مكان لكود الخصم، ولا يلفت الانتباه أكثر من اللازم.", detail: "العميل الذي معه كود يستخدمه، والعميل الذي ليس معه كود لا يُدفع للبحث عن واحد." },
          protect: "أبقِ الخانة مطويّة عند تغيير القالب أو تطبيق الدفع.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا السلة وصفحة الدفع بحثًا عن خانة كود خصم مطويّة أو خلف رابط صغير. الخانة غير موجودة، أو تظهر كمربع كبير مفتوح." },
          business: { summary: "خانة كود الخصم غير موجودة أو بارزة أكثر من اللازم.", detail: "بدون خانة، العميل الذي معه كود من إعلان أو مؤثر لا يستطيع استخدامه وقد يغادر. والمربع الكبير المفتوح يُشعر من ليس معه كود أن غيره يدفع أقل، فيغادر بعضهم للبحث عن كود." },
          step: "إن لم توجد خانة، أضف رابطًا صغيرًا في السلة «لديك كود خصم؟» يفتحها. وإن كانت مربعًا كبيرًا مفتوحًا، اطوِها خلف هذا الرابط.",
          doneWhen: "في السلة أو صفحة الدفع خانة كود خصم خلف رابط صغير أو في قسم مطويّ.",
        },
      },
      store_owner: {
        fail: { business: { summary: "خانة كود الخصم في متجرك ناقصة أو كبيرة زيادة.", detail: "بدون خانة، العميل اللي معه كود من إعلان أو مشهور ما يقدر يستخدمه. والخانة الكبيرة المفتوحة تخلي اللي ما معه كود يحس إنه يدفع أكثر من غيره، وبعضهم يطلع يدوّر على كود." } },
      },
      media_buyer: {
        fail: { business: { summary: "خانة الـ promo code ناقصة أو بارزة زيادة، وده بيضيّع conversions.", detail: "من غير خانة، الجاي من إعلانات الأكواد مش هيعرف يستخدم الكود، فالـ CVR بتاع الحملات دي بيقل. والمربع الكبير المفتوح بيخلي الناس تخرج تدوّر على أكواد، وده كمان بيقلل الـ CVR. اطلب من صاحب المتجر خانة مطويّة، أو استخدم لينكات خصم بتتطبق أوتوماتيك في الإعلانات." } },
      },
      agency: {
        fail: { business: { summary: "خانة كود الخصم في المتجر غير موجودة أو بارزة أكثر من اللازم.", detail: "بدون خانة، العميل الذي معه كود لا يستطيع استخدامه. والمربع الكبير المفتوح يُشعر من ليس معه كود أن غيره يدفع أقل، فيغادر بعضهم المتجر للبحث عن كود." } },
      },
    },
  },

  "OFFER-20": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the first screen and footer for an email signup form or WhatsApp link that states a clear incentive, such as a discount or early access." },
          business: { summary: "Visitors are given a reason to join the email or WhatsApp list.", detail: "Visitors who don't buy today can still be reached later with an offer." },
          protect: "Keep the incentive current and check that the signup still sends the promised code.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the first screen and footer for an email signup form or WhatsApp link that states a clear incentive, such as a discount or early access. No signup was found there, or it gives no clear reason to join." },
          business: { summary: "There is no signup with a clear reason to join.", detail: "Many visitors leave without buying on their first visit. Without a signup offer, the store has no way to bring them back except paying for another ad." },
          step: "Add an email or WhatsApp signup to the first screen or the footer with a clear first-order offer, for example 'X% off your first order'.",
          doneWhen: "An email or WhatsApp signup with a first-order offer is live on the site.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your store gives visitors no reason to sign up.", detail: "Many visitors leave without buying the first time. Without a signup offer, you can't reach them again unless you pay for another ad." } },
      },
      media_buyer: {
        fail: { business: { summary: "No signup with an incentive, so visitors you paid for leave with no way to reach them again.", detail: "Every visitor who leaves without signing up has to be bought back with retargeting spend. A signup with an offer builds an owned list, which lowers blended CAC over time. Forward this to the store owner or the marketing team." } },
      },
      agency: {
        fail: { business: { summary: "The store has no signup with a clear reason to join.", detail: "Many visitors leave without buying on their first visit. Without a signup offer, the store can only bring them back by paying for another ad." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فحصنا الشاشة الأولى والتذييل بحثًا عن نموذج اشتراك بالبريد أو رابط واتساب يذكر حافزًا واضحًا، مثل خصم أو وصول مبكر." },
          business: { summary: "يُعطى الزائر سببًا للانضمام إلى قائمة البريد أو واتساب.", detail: "الزائر الذي لا يشتري اليوم يمكن الوصول إليه لاحقًا بعرض." },
          protect: "أبقِ الحافز ساريًا، وتحقق أن الاشتراك ما زال يرسل الكود الموعود.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا الشاشة الأولى والتذييل بحثًا عن نموذج اشتراك بالبريد أو رابط واتساب يذكر حافزًا واضحًا، مثل خصم أو وصول مبكر. لم نجد اشتراكًا هناك، أو لا يذكر سببًا واضحًا للانضمام." },
          business: { summary: "لا يوجد اشتراك بسبب واضح للانضمام.", detail: "كثير من الزوار يغادرون دون شراء في زيارتهم الأولى. بدون عرض للاشتراك، لا يملك المتجر طريقة لإعادتهم إلا بدفع ثمن إعلان آخر." },
          step: "أضف اشتراكًا بالبريد أو واتساب في الشاشة الأولى أو التذييل مع عرض واضح لأول طلب، مثل «خصم X% على أول طلب».",
          doneWhen: "يوجد في الموقع اشتراك بالبريد أو واتساب مع عرض لأول طلب.",
        },
      },
      store_owner: {
        fail: { business: { summary: "متجرك ما يعطي الزوار سبب يشتركون.", detail: "كثير من الزوار يطلعون بدون ما يشترون أول مرة. بدون عرض اشتراك، ما تقدر توصل لهم مرة ثانية إلا إذا دفعت على إعلان جديد." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش اشتراك بحافز، فالزوار اللي دفعت عشانهم بيخرجوا ومفيش طريقة توصلهم تاني.", detail: "كل زائر بيخرج من غير ما يشترك لازم تشتريه تاني بصرف retargeting. الاشتراك بعرض بيبني قائمة ملكك، وده بيقلل الـ blended CAC مع الوقت. ابعت النقطة دي لصاحب المتجر أو فريق التسويق." } },
      },
      agency: {
        fail: { business: { summary: "المتجر لا يقدم اشتراكًا بسبب واضح للانضمام.", detail: "كثير من الزوار يغادرون دون شراء في زيارتهم الأولى. بدون عرض للاشتراك، لا يستطيع المتجر إعادتهم إلا بدفع ثمن إعلان آخر." } },
      },
    },
  },

  "OFFER-22": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the cart, above the checkout button, for a subtotal, a clear statement of how shipping is handled, and a discount field or note." },
          business: { summary: "The cart shows the full cost before checkout.", detail: "Shoppers know what they will pay before starting checkout, so a late fee doesn't push them out." },
          protect: "Recheck the cart lines when adding a fee, such as cash on delivery, or changing how VAT is shown.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the cart, above the checkout button, for a subtotal, a clear statement of how shipping is handled, and a discount field or note. At least one is missing, so part of the cost first appears in checkout." },
          business: { summary: "The cart doesn't show the full cost.", detail: "When the subtotal, delivery or fees are unclear in the cart, shoppers meet extra costs in checkout. Late costs are a common reason shoppers leave checkout after deciding to buy." },
          step: "Show the subtotal, the delivery cost or rule, and any fee such as cash on delivery or VAT in the cart, with a discount field or note, all above the checkout button.",
          doneWhen: "The cart shows a subtotal, the delivery cost or rule, and any fee above the checkout button.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your cart doesn't show the full cost before checkout.", detail: "If delivery, VAT or a cash-on-delivery fee only appears in checkout, customers who already decided to buy meet a surprise, and many leave there." } },
      },
      media_buyer: {
        fail: { business: { summary: "The cart hides part of the total, so paid shoppers drop in checkout.", detail: "Fees that appear late push shoppers you already paid for out of checkout, so CVR drops and CPA rises. Forward this to the store owner: the total and fees belong in the cart." } },
      },
      agency: {
        fail: { business: { summary: "The store's cart doesn't show the full cost.", detail: "When the subtotal, delivery or fees are unclear in the cart, shoppers meet extra costs in checkout, and the store loses buyers who had already decided." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فحصنا السلة فوق زر إتمام الطلب بحثًا عن المجموع الفرعي، وبيان واضح لطريقة احتساب الشحن، وخانة أو ملاحظة لكود الخصم." },
          business: { summary: "السلة تعرض التكلفة الكاملة قبل الدفع.", detail: "يعرف العميل ما سيدفعه قبل بدء إتمام الطلب، فلا تخرجه رسوم متأخرة." },
          protect: "راجع أسطر السلة عند إضافة رسوم، مثل رسوم الدفع عند الاستلام، أو تغيير طريقة عرض الضريبة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا السلة فوق زر إتمام الطلب بحثًا عن المجموع الفرعي، وبيان واضح لطريقة احتساب الشحن، وخانة أو ملاحظة لكود الخصم. أحدها على الأقل غير موجود، فيظهر جزء من التكلفة لأول مرة في صفحة الدفع." },
          business: { summary: "السلة لا تعرض التكلفة الكاملة.", detail: "عندما يكون المجموع أو التوصيل أو الرسوم غير واضحة في السلة، يواجه العميل تكاليف إضافية في صفحة الدفع. التكاليف المتأخرة سبب شائع لخروج العملاء بعد أن قرروا الشراء." },
          step: "اعرض في السلة المجموع الفرعي، وتكلفة التوصيل أو قاعدتها، وأي رسوم مثل الدفع عند الاستلام أو الضريبة، مع خانة أو ملاحظة لكود الخصم، وكلها فوق زر إتمام الطلب.",
          doneWhen: "تعرض السلة المجموع الفرعي وتكلفة التوصيل أو قاعدتها وأي رسوم فوق زر إتمام الطلب.",
        },
      },
      store_owner: {
        fail: { business: { summary: "سلة متجرك ما توضح المبلغ الكامل قبل الدفع.", detail: "إذا التوصيل أو الضريبة أو رسوم الدفع عند الاستلام ما تطلع إلا في صفحة الدفع، العميل اللي قرر يشتري يتفاجأ، وكثير منهم يطلعون هناك." } },
      },
      media_buyer: {
        fail: { business: { summary: "السلة مخبية جزء من الإجمالي، فالزوار المدفوعين بيخرجوا في الـ checkout.", detail: "الرسوم اللي بتظهر متأخر بتخرّج ناس انت دفعت عشانهم من الـ checkout، فالـ CVR بيقل والـ CPA بيعلى. ابعت النقطة دي لصاحب المتجر: الإجمالي والرسوم لازم يبانوا في السلة." } },
      },
      agency: {
        fail: { business: { summary: "سلة المتجر لا تعرض التكلفة الكاملة.", detail: "عندما يكون المجموع أو التوصيل أو الرسوم غير واضحة في السلة، يواجه العميل تكاليف إضافية في صفحة الدفع، فيخسر المتجر مشترين كانوا قد قرروا." } },
      },
    },
  },

  "OFFER-23": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked the product page and collection cards for delivery details together: a delivery estimate, and the shipping cost or free-shipping threshold." },
          business: { summary: "Shoppers see when it arrives and what delivery costs in one place.", detail: "Both answers sit together, so shoppers don't leave the page to look for them." },
          protect: "Update the delivery block when delivery times, prices or the free-delivery amount change.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked the product page and collection cards for delivery details together: a delivery estimate, and the shipping cost or free-shipping threshold. The estimate, the cost or threshold, or both are missing there." },
          business: { summary: "Delivery time and cost aren't shown together before buying.", detail: "Shoppers who have to search for when it arrives and what it costs often put the purchase off. A specific line, such as order today and get it by a named day, answers the first question at a glance." },
          step: "Add a delivery block under the price: the delivery estimate, or 'Order within X hours, delivered by [day]' if the store can promise it, and below it the delivery cost or free-delivery amount.",
          doneWhen: "On a phone, the product page shows the delivery estimate and the delivery cost or free-delivery amount together.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your product page doesn't show delivery time and cost together.", detail: "When customers have to look for when it arrives and how much delivery costs, many put off buying. One short block under the price answers both." } },
      },
      media_buyer: {
        fail: { business: { summary: "Delivery time and cost aren't shown together on the product page, so paid shoppers hesitate.", detail: "Shoppers from ads who have to hunt for delivery details hold off, so CVR likely drops and CPA rises. Forward this to the store owner: it is one block under the price." } },
      },
      agency: {
        fail: { business: { summary: "The store doesn't show delivery time and cost together before buying.", detail: "Shoppers who have to search for when it arrives and what it costs often put the purchase off, and the store loses some of those sales." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فحصنا صفحة المنتج وبطاقات التصنيفات بحثًا عن تفاصيل التوصيل معًا: مدة التوصيل المتوقعة، وتكلفة الشحن أو حد الشحن المجاني." },
          business: { summary: "يرى العميل موعد الوصول وتكلفة التوصيل في مكان واحد.", detail: "الإجابتان معًا، فلا يغادر العميل الصفحة للبحث عنهما." },
          protect: "حدّث قسم التوصيل عند تغيّر مدد التوصيل أو أسعاره أو حد التوصيل المجاني.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا صفحة المنتج وبطاقات التصنيفات بحثًا عن تفاصيل التوصيل معًا: مدة التوصيل المتوقعة، وتكلفة الشحن أو حد الشحن المجاني. المدة أو التكلفة أو كلاهما غير موجود هناك." },
          business: { summary: "مدة التوصيل وتكلفته لا تظهران معًا قبل الشراء.", detail: "العميل الذي يبحث عن موعد الوصول وتكلفته يؤجل الشراء غالبًا. سطر محدد، مثل اطلب اليوم واستلم يوم كذا، يجيب عن السؤال الأول بنظرة واحدة." },
          step: "أضف قسم توصيل تحت السعر: مدة التوصيل المتوقعة، أو «اطلب خلال X ساعات واستلم يوم [اليوم]» إن كان المتجر يستطيع الالتزام به، وتحته تكلفة التوصيل أو حد التوصيل المجاني.",
          doneWhen: "على الجوال، تعرض صفحة المنتج مدة التوصيل وتكلفة التوصيل أو حد التوصيل المجاني معًا.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحة منتجك ما تعرض مدة التوصيل وسعره مع بعض.", detail: "لما العميل يدوّر متى بيوصله الطلب وكم سعر التوصيل، كثير منهم يأجلون الشراء. قسم صغير تحت السعر يجاوب على الاثنين." } },
      },
      media_buyer: {
        fail: { business: { summary: "مدة التوصيل وتكلفته مش ظاهرين مع بعض في صفحة المنتج، فالزوار المدفوعين بيترددوا.", detail: "الجاي من الإعلان ولازم يدوّر على تفاصيل التوصيل بيأجل، فالـ CVR غالبًا بيقل والـ CPA بيعلى. ابعت النقطة دي لصاحب المتجر: هي قسم واحد تحت السعر." } },
      },
      agency: {
        fail: { business: { summary: "المتجر لا يعرض مدة التوصيل وتكلفته معًا قبل الشراء.", detail: "العميل الذي يبحث عن موعد الوصول وتكلفته يؤجل الشراء غالبًا، فيخسر المتجر جزءًا من هذه المبيعات." } },
      },
    },
  },

  "OFFER-24": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checked for one or more short reassurance lines, such as returns, delivery or payment security, directly by the Add to cart or checkout button." },
          business: { summary: "Short reassurance sits right by the buy button.", detail: "Shoppers get an answer to last doubts, like returns or delivery, at the moment they decide." },
          protect: "Keep the lines short and true to the policy when the returns or delivery terms change.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "Checked for one or more short reassurance lines, such as returns, delivery or payment security, directly by the Add to cart or checkout button. None sits by the button; any such text is elsewhere on the page or missing." },
          business: { summary: "Nothing by the buy button answers last doubts.", detail: "At the moment of tapping the button, shoppers wonder about returns, delivery and payment safety. If the answer isn't right there, some go looking for it and don't come back." },
          step: "Add one or two short lines right under Add to cart and the cart checkout button, for example 'Free returns within X days' and 'Secure payment'. Use only what the store's policy really offers.",
          doneWhen: "A short reassurance line (returns, delivery, payment) sits right under the Add to cart button.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Nothing under your buy button answers customers' last doubts.", detail: "Right before tapping the button, customers wonder about returns, delivery and whether payment is safe. If the answer isn't there, some leave to look for it and don't come back." } },
      },
      media_buyer: {
        fail: { business: { summary: "No reassurance by the buy button, so paid shoppers stall at the last tap.", detail: "First-time shoppers from ads don't know the store yet, and doubts about returns or payment stop some of them at the button, so CVR likely drops and CPA rises. Forward this to the store owner: it is one or two lines under the button." } },
      },
      agency: {
        fail: { business: { summary: "Nothing by the store's buy button answers last doubts.", detail: "At the moment of tapping the button, shoppers wonder about returns, delivery and payment safety. If the answer isn't right there, the store loses some of them." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فحصنا وجود سطر طمأنة قصير أو أكثر، مثل الإرجاع أو التوصيل أو أمان الدفع، مباشرة بجانب زر الإضافة إلى السلة أو زر إتمام الطلب." },
          business: { summary: "سطر طمأنة قصير بجانب زر الشراء مباشرة.", detail: "يجد العميل إجابة لآخر تردد لديه، مثل الإرجاع أو التوصيل، في لحظة القرار." },
          protect: "أبقِ الأسطر قصيرة ومطابقة للسياسة عند تغيير شروط الإرجاع أو التوصيل.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا وجود سطر طمأنة قصير أو أكثر، مثل الإرجاع أو التوصيل أو أمان الدفع، مباشرة بجانب زر الإضافة إلى السلة أو زر إتمام الطلب. لا يوجد شيء بجانب الزر، وأي نص من هذا النوع موجود في مكان آخر من الصفحة أو غير موجود." },
          business: { summary: "لا شيء بجانب زر الشراء يجيب عن آخر تردد.", detail: "في لحظة الضغط على الزر، يتساءل العميل عن الإرجاع والتوصيل وأمان الدفع. إن لم يجد الإجابة هناك، يذهب بعضهم للبحث عنها ولا يعود." },
          step: "أضف سطرًا أو سطرين قصيرين تحت زر الإضافة إلى السلة وزر إتمام الطلب في السلة، مثل «إرجاع مجاني خلال X أيام» و«دفع آمن». اكتب فقط ما تقدمه سياسة المتجر فعلًا.",
          doneWhen: "يوجد سطر طمأنة قصير (الإرجاع، التوصيل، الدفع) مباشرة تحت زر الإضافة إلى السلة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "ما فيه شي تحت زر الشراء يطمّن العميل.", detail: "قبل ما يضغط الزر، العميل يفكر في الإرجاع والتوصيل وهل الدفع آمن. إذا ما لقى الجواب هناك، بعضهم يطلع يدوّر عليه وما يرجع." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش طمأنة جنب زرار الشراء، فالزوار المدفوعين بيقفوا عند آخر ضغطة.", detail: "اللي جاي من الإعلان لأول مرة لسه ميعرفش المتجر، والقلق من الإرجاع أو الدفع بيوقف بعضهم عند الزرار، فالـ CVR غالبًا بيقل والـ CPA بيعلى. ابعت النقطة دي لصاحب المتجر: هي سطر أو اتنين تحت الزرار." } },
      },
      agency: {
        fail: { business: { summary: "لا شيء بجانب زر الشراء في المتجر يجيب عن آخر تردد.", detail: "في لحظة الضغط على الزر، يتساءل العميل عن الإرجاع والتوصيل وأمان الدفع. إن لم يجد الإجابة هناك، يخسر المتجر بعضهم." } },
      },
    },
  },
};
