import type { PointTemplate } from "./types.js";

// Frames for AI-judged points: fixed text, the AI's finding in {observation} (types.ts).
export const FRAMES_PATH: Record<string, PointTemplate> = {
  // Code proves the pass (item reached the cart); a fail is the AI's call.
  "PATH-01": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "A phone tap on Add to Cart on a product page opened a drawer or message with the item, or raised the cart count, within 2 seconds, and the cart page listed the item." },
          business: { summary: "Add to Cart puts the product in the cart.", detail: "A shopper who decides to buy gets the item in the cart on the first tap and can move on to checkout." },
          protect: "Test Add to Cart on a phone after every theme, app or product page change.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We tapped Add to Cart on a phone and checked for a drawer or message with the item, or a higher cart count, within 2 seconds, then for the item on the cart page. One of these did not happen. The usual cause is the theme's add-to-cart script or an app that overrides it." },
          business: { summary: "Add to Cart does not clearly put the product in the cart.", detail: "A shopper who taps it and sees nothing happen, or finds an empty cart, has no way to buy. Every visitor who reached this point was ready to order." },
          step: "The developer reproduces the tap on a phone and fixes the Add to Cart button or the theme script behind it, then checks any app that changes the button.",
          doneWhen: "On a phone, tapping Add to Cart shows the item in a drawer or message, or raises the cart count, and the cart page lists it.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Add to Cart in your store does not clearly add the product.", detail: "A customer who decided to buy taps it and nothing happens, or the cart stays empty. Each of these customers leaves without an order." } },
      },
      media_buyer: {
        fail: { business: { summary: "Paid visitors can tap Add to Cart without the item clearly reaching the cart, so CVR drops and CPA rises.", detail: "Clicks that cannot fill the cart cannot buy, and the platforms get fewer add-to-cart and purchase signals to learn from. Forward this to the store's developer: the fix is the button or its script." } },
      },
      agency: {
        fail: { business: { summary: "Add to Cart on the store does not clearly add the product.", detail: "Shoppers who decided to buy tap it and see nothing happen, or find an empty cart. That loses orders from every traffic source at the step closest to a sale." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "ضغطة على زر الإضافة للسلة من الجوال فتحت نافذة أو رسالة بالمنتج، أو رفعت عدد السلة، خلال ثانيتين، وظهر المنتج في صفحة السلة." },
          business: { summary: "زر الإضافة للسلة يضيف المنتج فعلًا.", detail: "العميل الذي يقرر الشراء يجد المنتج في السلة من أول ضغطة وينتقل إلى الدفع." },
          protect: "اختبر زر الإضافة للسلة من الجوال بعد كل تغيير في القالب أو التطبيقات أو صفحة المنتج.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "ضغطنا زر الإضافة للسلة من الجوال وتحققنا من ظهور نافذة أو رسالة بالمنتج، أو ارتفاع عدد السلة، خلال ثانيتين، ثم من وجود المنتج في صفحة السلة. لم يحدث أحد هذه الأمور. السبب المعتاد سكربت الإضافة في القالب أو تطبيق يتجاوزه." },
          business: { summary: "زر الإضافة للسلة لا يضيف المنتج بوضوح.", detail: "العميل الذي يضغطه ولا يرى شيئًا، أو يجد السلة فارغة، لا يستطيع الشراء. وكل زائر وصل إلى هذه الخطوة كان جاهزًا للطلب." },
          step: "يعيد المطوّر الضغطة من الجوال ويصلح زر الإضافة للسلة أو سكربت القالب خلفه، ثم يراجع أي تطبيق يغيّر الزر.",
          doneWhen: "من الجوال، الضغط على الزر يُظهر المنتج في نافذة أو رسالة أو يرفع عدد السلة، وصفحة السلة تعرضه.",
        },
      },
      store_owner: {
        fail: { business: { summary: "زر أضف للسلة في متجرك ما يضيف المنتج بشكل واضح.", detail: "العميل اللي قرر يشتري يضغط الزر وما يصير شي، أو يلقى السلة فاضية. وكل واحد منهم يطلع بدون طلب." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين بيضغطوا Add to Cart والمنتج مش بيوصل للسلة بوضوح، فالـ CVR بينزل والـ CPA بيطلع.", detail: "الكليك اللي مش بيملا السلة مش هيشتري، والمنصات بتاخد signals أقل للـ add to cart والـ purchase. ابعت النقطة دي لمطوّر المتجر: الحل في الزرار أو السكربت بتاعه." } },
      },
      agency: {
        fail: { business: { summary: "زر الإضافة للسلة في المتجر لا يضيف المنتج بوضوح.", detail: "العملاء الذين قرروا الشراء يضغطونه فلا يحدث شيء، أو يجدون السلة فارغة. وهذا يخسر المتجر طلبات من كل مصادر الزيارات في أقرب خطوة إلى البيع." } },
      },
    },
  },

  "PATH-04": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The phone cart has one checkout button with checkout wording, inside the first screen or sticky, with no popup, chat widget or upsell covering it." },
          business: { summary: "The checkout button in the cart is easy to find on a phone.", detail: "Shoppers who added to cart see the next step right away and can go to checkout in one tap." },
          protect: "Check the phone cart after adding any upsell, chat or popup app.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We looked for one checkout button with checkout wording (checkout, إتمام الطلب, الدفع) on the phone cart, inside the first screen or sticky, and not covered by a popup, chat widget or upsell. The button failed one of these: missing, unclear wording, more than one competing button, below the first screen, or covered." },
          business: { summary: "The checkout button in the phone cart is hard to find or reach.", detail: "Shoppers who already added to cart need an obvious next step. When it is hidden, covered or unclear, some of them stop in the cart and leave without buying." },
          step: "Make checkout the main button in the cart with clear checkout wording, keep it in the first phone screen or sticky, and move any popup, chat or upsell off it.",
          doneWhen: "A phone screenshot of the cart shows one clear checkout button without scrolling, with nothing on top of it.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The checkout button in your phone cart is hard to find or reach.", detail: "Customers who already added to cart can't see their next step clearly, and some leave the cart without paying." } },
      },
      media_buyer: {
        fail: { business: { summary: "Shoppers from ads add to cart but the checkout button is hard to find on phone, so CVR reads lower than the traffic deserves.", detail: "Clicks that stall in the cart raise CPA on the same spend. The fix is in the store's cart layout: forward it to the store owner or developer." } },
      },
      agency: {
        fail: { business: { summary: "The checkout button in the store's phone cart is hard to find or reach.", detail: "Shoppers who already added to cart need an obvious next step. Without it, some stop in the cart and the store loses orders it had almost won." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "سلة الجوال فيها زر دفع واحد بصياغة واضحة، ضمن الشاشة الأولى أو ثابت، ولا تغطيه نافذة منبثقة أو أداة دردشة أو عرض إضافي." },
          business: { summary: "زر إتمام الطلب في السلة سهل الوصول على الجوال.", detail: "العميل الذي أضاف للسلة يرى الخطوة التالية مباشرة وينتقل إلى الدفع بضغطة واحدة." },
          protect: "افحص سلة الجوال بعد إضافة أي تطبيق عروض إضافية أو دردشة أو نوافذ منبثقة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "بحثنا في سلة الجوال عن زر دفع واحد بصياغة دفع واضحة (checkout، إتمام الطلب، الدفع)، ضمن الشاشة الأولى أو ثابت، ولا تغطيه نافذة أو دردشة أو عرض إضافي. الزر أخفق في أحد هذه الشروط: غير موجود، أو صياغته غير واضحة، أو تنافسه أزرار أخرى، أو أسفل الشاشة الأولى، أو مغطى." },
          business: { summary: "زر إتمام الطلب في سلة الجوال صعب الإيجاد أو الوصول.", detail: "العميل الذي أضاف للسلة يحتاج خطوة تالية واضحة. حين تكون مخفية أو مغطاة أو غير واضحة، يتوقف بعض العملاء في السلة ويغادرون دون شراء." },
          step: "اجعل زر إتمام الطلب الزر الرئيسي في السلة بصياغة دفع واضحة، وأبقه في الشاشة الأولى على الجوال أو ثابتًا، وأبعد عنه أي نافذة أو دردشة أو عرض إضافي.",
          doneWhen: "لقطة شاشة لسلة الجوال تُظهر زر دفع واحدًا واضحًا دون تمرير، ولا شيء فوقه.",
        },
      },
      store_owner: {
        fail: { business: { summary: "زر إتمام الطلب في سلة متجرك على الجوال صعب تلقاه أو توصله.", detail: "العميل اللي أضاف للسلة ما يشوف الخطوة الجاية بوضوح، وبعضهم يطلع من السلة بدون ما يدفع." } },
      },
      media_buyer: {
        fail: { business: { summary: "الناس اللي جاية من الإعلانات بتضيف للسلة بس زرار الـ checkout صعب يتلاقى على الموبايل، فالـ CVR أقل من المفروض.", detail: "الكليكات اللي بتقف في السلة بترفع الـ CPA على نفس الصرف. الحل في تصميم سلة المتجر: ابعتها لصاحب المتجر أو المطوّر." } },
      },
      agency: {
        fail: { business: { summary: "زر إتمام الطلب في سلة المتجر على الجوال صعب الإيجاد أو الوصول.", detail: "العميل الذي أضاف للسلة يحتاج خطوة تالية واضحة. وبدونها يتوقف بعضهم في السلة ويخسر المتجر طلبات كادت تكتمل." } },
      },
    },
  },

  "PATH-05": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Checkout opened in one click from the cart, and the first checkout screen accepts guest or phone-number entry with no login wall." },
          business: { summary: "Shoppers can check out without creating an account.", detail: "First-time buyers go straight from the cart to entering their details, which is where most new customers would otherwise drop off." },
          protect: "Keep guest or phone-number checkout on when changing checkout or login apps.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We checked that checkout opens in one click from the cart and that its first screen allows guest or phone-number entry. Instead, the shopper meets a login or sign-up wall, or extra steps before checkout." },
          business: { summary: "Shoppers must sign in or create an account before they can check out.", detail: "Most first-time buyers have no account and don't want one. A forced login at this point makes many of them leave with a full cart." },
          step: "Turn on guest checkout or phone-number checkout in the store's checkout settings, and remove any login step between the cart and checkout.",
          doneWhen: "From the cart, one click opens checkout, and its first screen lets a new shopper continue without an account.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your customers must sign in or create an account before paying.", detail: "Most new customers have no account and won't make one just to order. Many of them leave with a full cart." } },
      },
      media_buyer: {
        fail: { business: { summary: "Checkout forces sign-in, so new shoppers from cold ads drop off and CVR falls.", detail: "Cold traffic rarely has an account, so the most expensive clicks hit the wall first, which raises CPA. The store owner turns on guest or phone checkout in the store settings." } },
      },
      agency: {
        fail: { business: { summary: "The store forces sign-in or account creation before checkout.", detail: "Most first-time buyers have no account. A login wall here makes many leave with a full cart, which hits new-customer sales from every channel." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "الدفع يفتح بنقرة واحدة من السلة، وأول شاشة دفع تقبل الشراء كضيف أو برقم الجوال دون جدار تسجيل دخول." },
          business: { summary: "العملاء يستطيعون الدفع دون إنشاء حساب.", detail: "المشترون لأول مرة ينتقلون من السلة إلى إدخال بياناتهم مباشرة، وهي النقطة التي يغادر عندها كثير من العملاء الجدد عادة." },
          protect: "أبقِ الدفع كضيف أو برقم الجوال مفعّلًا عند تغيير تطبيقات الدفع أو تسجيل الدخول.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "تحققنا من أن الدفع يفتح بنقرة واحدة من السلة وأن أول شاشة فيه تقبل الشراء كضيف أو برقم الجوال. بدلًا من ذلك يواجه العميل جدار تسجيل دخول أو إنشاء حساب، أو خطوات إضافية قبل الدفع." },
          business: { summary: "على العميل تسجيل الدخول أو إنشاء حساب قبل أن يدفع.", detail: "معظم المشترين لأول مرة ليس لديهم حساب ولا يريدون إنشاءه. وفرض تسجيل الدخول هنا يجعل كثيرين منهم يغادرون والسلة ممتلئة." },
          step: "فعّل الدفع كضيف أو برقم الجوال من إعدادات الدفع في المتجر، واحذف أي خطوة تسجيل دخول بين السلة والدفع.",
          doneWhen: "من السلة تفتح نقرة واحدة صفحة الدفع، وأول شاشة فيها تسمح للعميل الجديد بالمتابعة دون حساب.",
        },
      },
      store_owner: {
        fail: { business: { summary: "عملاء متجرك لازم يسجلون دخول أو يسوون حساب قبل الدفع.", detail: "أغلب العملاء الجدد ما عندهم حساب وما يبون يسوون واحد عشان طلب. وكثير منهم يطلعون والسلة مليانة." } },
      },
      media_buyer: {
        fail: { business: { summary: "الـ checkout بيجبر الناس تعمل login، فالزوار الجداد من الـ cold ads بيخرجوا والـ CVR بينزل.", detail: "الـ cold traffic نادرًا ما يكون عنده حساب، فأغلى كليكات بتخبط في الحيطة دي الأول وده بيرفع الـ CPA. صاحب المتجر يفعّل الدفع كضيف أو برقم الموبايل من الإعدادات." } },
      },
      agency: {
        fail: { business: { summary: "المتجر يفرض تسجيل الدخول أو إنشاء حساب قبل الدفع.", detail: "معظم المشترين لأول مرة ليس لديهم حساب. وجدار تسجيل الدخول هنا يجعل كثيرين يغادرون والسلة ممتلئة، فتتأثر مبيعات العملاء الجدد من كل القنوات." } },
      },
    },
  },

  "PATH-09": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "In the cart, changing an item's quantity updated the line and the total with no error, and an item could be removed." },
          business: { summary: "Shoppers can change quantities and remove items in the cart.", detail: "Adjusting the cart works as expected, so shoppers keep going to checkout instead of starting over." },
          protect: "Re-test quantity and remove in the cart after theme, discount or cart app changes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We checked that changing quantity in the cart updates the line and the total with no error, and that an item can be removed. One of these failed: the total did not follow the quantity, an error showed, or the item could not be removed." },
          business: { summary: "Changing quantities or removing items in the cart doesn't work properly.", detail: "Shoppers who adjust their cart and see a wrong total or an error stop trusting the order. Many leave instead of trying again." },
          step: "Send the developer the steps that broke the cart (change quantity, remove an item) to fix the cart update script, then re-test with a discount applied.",
          doneWhen: "In the cart, changing quantity updates the line and total, and removing an item takes it out with no error.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Changing quantities or removing items in your cart doesn't work properly.", detail: "A customer who adjusts the cart and sees a wrong total or an error loses trust in the order, and many leave without paying." } },
      },
      media_buyer: {
        fail: { business: { summary: "The cart breaks when shoppers adjust it, so orders from paid clicks are lost and CVR reads lower.", detail: "Each lost cart is a click already paid for, which raises CPA. The store's developer fixes the cart script." } },
      },
      agency: {
        fail: { business: { summary: "Changing quantities or removing items in the store's cart doesn't work properly.", detail: "Shoppers who see a wrong total or an error after adjusting the cart stop trusting the order, and the store loses sales at the last steps." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "في السلة، تغيير كمية المنتج حدّث السطر والإجمالي دون خطأ، وأمكن حذف المنتج." },
          business: { summary: "العملاء يستطيعون تغيير الكميات وحذف المنتجات في السلة.", detail: "تعديل السلة يعمل كما يجب، فيكمل العملاء إلى الدفع بدل البدء من جديد." },
          protect: "أعد اختبار تغيير الكمية والحذف في السلة بعد أي تغيير في القالب أو الخصومات أو تطبيقات السلة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "تحققنا من أن تغيير الكمية في السلة يحدّث السطر والإجمالي دون خطأ، وأن المنتج يمكن حذفه. أحد هذه الأمور أخفق: الإجمالي لم يتغير مع الكمية، أو ظهر خطأ، أو تعذّر حذف المنتج." },
          business: { summary: "تغيير الكميات أو حذف المنتجات في السلة لا يعمل كما يجب.", detail: "العميل الذي يعدّل سلته فيرى إجماليًا خاطئًا أو خطأ يفقد ثقته بالطلب، وكثيرون يغادرون بدل المحاولة مرة أخرى." },
          step: "أرسل للمطوّر الخطوات التي أعطلت السلة (تغيير الكمية، حذف منتج) ليصلح سكربت تحديث السلة، ثم أعد الاختبار مع خصم مطبّق.",
          doneWhen: "في السلة، تغيير الكمية يحدّث السطر والإجمالي، وحذف المنتج يزيله دون خطأ.",
        },
      },
      store_owner: {
        fail: { business: { summary: "تغيير الكمية أو حذف المنتجات في سلة متجرك ما يشتغل صح.", detail: "العميل اللي يعدّل السلة ويشوف إجمالي غلط أو خطأ يفقد ثقته بالطلب، وكثير منهم يطلعون بدون ما يدفعون." } },
      },
      media_buyer: {
        fail: { business: { summary: "السلة بتبوظ لما الناس تعدّل فيها، فأوردرات من كليكات مدفوعة بتضيع والـ CVR أقل.", detail: "كل سلة ضايعة هي كليك اندفع تمنه، وده بيرفع الـ CPA. مطوّر المتجر يصلح سكربت السلة." } },
      },
      agency: {
        fail: { business: { summary: "تغيير الكميات أو حذف المنتجات في سلة المتجر لا يعمل كما يجب.", detail: "العميل الذي يرى إجماليًا خاطئًا أو خطأ بعد تعديل السلة يفقد ثقته بالطلب، فيخسر المتجر مبيعات في آخر الخطوات." } },
      },
    },
  },

  // Code proves presence only; absence may be our headless browser (registry note).
  "PATH-10": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Apple Pay, Google Pay, Shop Pay or PayPal buttons show in the cart or at the top of the first checkout screen." },
          business: { summary: "Shoppers can pay in one tap with a wallet they already use.", detail: "Express buttons skip typing card and address details, which shortens checkout most on phones." },
          protect: "Keep express pay buttons on when changing payment providers or the cart layout.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We looked for Apple Pay, Google Pay, Shop Pay or PayPal buttons in the cart and at the top of the first checkout screen, where the platform supports them, and found none. Express buttons often load late inside frames and Apple Pay only shows on Apple devices, so confirm on a real iPhone and Android phone before changing settings." },
          business: { summary: "No express pay buttons showed in the cart or at the start of checkout.", detail: "Without them, every shopper types card and address details on a small screen. Shoppers who usually pay with a wallet are more likely to give up." },
          step: "Open the cart and checkout on an iPhone and an Android phone. If no express buttons show, turn on Apple Pay and Google Pay (or Shop Pay and PayPal) in the store's payment settings and enable them in the cart.",
          doneWhen: "On a real phone, an express pay button shows in the cart or at the top of the first checkout screen.",
        },
      },
      store_owner: {
        fail: { business: { summary: "We saw no Apple Pay or similar one-tap pay buttons in your cart or checkout.", detail: "Without them, customers type card and address details on the phone, and some give up before paying. Check on your own iPhone first: these buttons sometimes don't show to our scanner." } },
      },
      media_buyer: {
        fail: { business: { summary: "No express pay buttons showed in cart or checkout, so phone checkout is slower and CVR likely lower.", detail: "Paid phone traffic has to type every detail to buy, which raises CPA. Confirm on a real phone first; if they are missing, the store owner turns them on in payment settings." } },
      },
      agency: {
        fail: { business: { summary: "No express pay buttons showed in the store's cart or checkout.", detail: "Without them, phone shoppers type every detail to pay, and some give up. Confirm on a real iPhone and Android phone before asking the client to change settings." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "أزرار Apple Pay أو Google Pay أو Shop Pay أو PayPal تظهر في السلة أو أعلى أول شاشة دفع." },
          business: { summary: "العملاء يستطيعون الدفع بضغطة واحدة بمحفظة يستخدمونها.", detail: "أزرار الدفع السريع توفّر كتابة بيانات البطاقة والعنوان، فتختصر الدفع خاصة على الجوال." },
          protect: "أبقِ أزرار الدفع السريع مفعّلة عند تغيير مزوّد الدفع أو تصميم السلة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "بحثنا عن أزرار Apple Pay أو Google Pay أو Shop Pay أو PayPal في السلة وأعلى أول شاشة دفع، حيث تدعمها المنصة، ولم نجد أيًا منها. هذه الأزرار تتأخر غالبًا داخل إطارات، و Apple Pay يظهر على أجهزة Apple فقط، لذا تحقق من جوال iPhone وجوال Android حقيقيين قبل تغيير الإعدادات." },
          business: { summary: "لم تظهر أزرار دفع سريع في السلة أو بداية الدفع.", detail: "بدونها يكتب كل عميل بيانات البطاقة والعنوان على شاشة صغيرة، والعملاء المعتادون على الدفع بالمحفظة أكثر ميلًا للتراجع." },
          step: "افتح السلة والدفع من iPhone ومن جوال Android. إن لم تظهر أزرار سريعة، فعّل Apple Pay و Google Pay (أو Shop Pay و PayPal) من إعدادات الدفع في المتجر وفعّلها في السلة.",
          doneWhen: "على جوال حقيقي، يظهر زر دفع سريع في السلة أو أعلى أول شاشة دفع.",
        },
      },
      store_owner: {
        fail: { business: { summary: "ما شفنا أزرار Apple Pay أو دفع سريع مثلها في سلة متجرك أو صفحة الدفع.", detail: "بدونها العميل يكتب بيانات البطاقة والعنوان من الجوال، وبعضهم يتراجع قبل الدفع. جرّب من جوالك الآيفون أول: هالأزرار أحيانًا ما تطلع لأداة الفحص." } },
      },
      media_buyer: {
        fail: { business: { summary: "مفيش أزرار express pay ظهرت في السلة أو الـ checkout، فالدفع على الموبايل أبطأ والـ CVR غالبًا أقل.", detail: "الترافيك المدفوع على الموبايل لازم يكتب كل البيانات عشان يشتري، وده بيرفع الـ CPA. اتأكد من موبايل حقيقي الأول؛ لو مش موجودة، صاحب المتجر يفعّلها من إعدادات الدفع." } },
      },
      agency: {
        fail: { business: { summary: "لم تظهر أزرار دفع سريع في سلة المتجر أو صفحة الدفع.", detail: "بدونها يكتب عملاء الجوال كل البيانات للدفع، وبعضهم يتراجع. تحقق من iPhone وجوال Android حقيقيين قبل أن تطلب من العميل تغيير الإعدادات." } },
      },
    },
  },

  "PATH-11": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Every field on the first checkout screen has a visible label in the page language saying what to type, and the address fields cover local needs such as city, area and landmark." },
          business: { summary: "Checkout fields are clear and fit local addresses.", detail: "Shoppers know what to type in each field, and couriers get an address they can deliver to." },
          protect: "Check the field labels in both languages after any checkout or address app change.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We checked every field on the first checkout screen for a visible label in the page language that says what to type, and the address fields for local needs (city, area, landmark). Some fields rely on placeholder text only, use the wrong language, are unclear, or the address form misses a local field." },
          business: { summary: "Some checkout fields are unclear or don't fit local addresses.", detail: "Shoppers hesitate or type the wrong thing when a field isn't clear, and a form without city, area or landmark leads to failed deliveries. Both cost orders." },
          step: "Give every checkout field a visible label in the page language, and add city, area and landmark fields to the address form in the checkout settings or app.",
          doneWhen: "On the first checkout screen, every field shows a label in the page language and the address form asks for city, area and landmark.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some fields in your checkout are unclear or don't fit local addresses.", detail: "Customers hesitate when they don't know what to type, and a missing area or landmark field means orders that can't be delivered." } },
      },
      media_buyer: {
        fail: { business: { summary: "Checkout fields are unclear or miss local address needs, so paid shoppers stall at the form and CVR drops.", detail: "Shoppers who hesitate at checkout raise CPA, and bad addresses add failed deliveries after the sale. The store owner fixes the labels and address fields in the checkout settings." } },
      },
      agency: {
        fail: { business: { summary: "Some of the store's checkout fields are unclear or don't fit local addresses.", detail: "Unclear fields slow shoppers at the last step, and a form without city, area or landmark leads to failed deliveries." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "كل حقل في أول شاشة دفع له تسمية ظاهرة بلغة الصفحة توضح ما يُكتب فيه، وحقول العنوان تغطي الاحتياجات المحلية مثل المدينة والحي والمعلم القريب." },
          business: { summary: "حقول الدفع واضحة وتناسب العناوين المحلية.", detail: "العميل يعرف ماذا يكتب في كل حقل، وشركة التوصيل تحصل على عنوان يمكن الوصول إليه." },
          protect: "افحص تسميات الحقول باللغتين بعد أي تغيير في تطبيق الدفع أو العناوين.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا كل حقل في أول شاشة دفع بحثًا عن تسمية ظاهرة بلغة الصفحة توضح ما يُكتب فيه، وحقول العنوان بحثًا عن الاحتياجات المحلية (المدينة، الحي، المعلم القريب). بعض الحقول تعتمد على نص توضيحي داخل الحقل فقط، أو بلغة خاطئة، أو غير واضحة، أو نموذج العنوان ينقصه حقل محلي." },
          business: { summary: "بعض حقول الدفع غير واضحة أو لا تناسب العناوين المحلية.", detail: "العميل يتردد أو يكتب معلومة خاطئة حين لا يكون الحقل واضحًا، ونموذج بلا مدينة أو حي أو معلم يؤدي إلى توصيل فاشل. وكلاهما يكلّف طلبات." },
          step: "أعطِ كل حقل في الدفع تسمية ظاهرة بلغة الصفحة، وأضف حقول المدينة والحي والمعلم القريب إلى نموذج العنوان من إعدادات الدفع أو التطبيق.",
          doneWhen: "في أول شاشة دفع، كل حقل يعرض تسمية بلغة الصفحة، ونموذج العنوان يطلب المدينة والحي والمعلم القريب.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بعض الحقول في صفحة الدفع بمتجرك مو واضحة أو ما تناسب العناوين عندنا.", detail: "العميل يتردد إذا ما عرف وش يكتب، وإذا ما فيه حقل للحي أو المعلم، الطلبات ما توصل." } },
      },
      media_buyer: {
        fail: { business: { summary: "حقول الـ checkout مش واضحة أو ناقصها بيانات العنوان المحلي، فالزوار المدفوعين بيقفوا عند الفورم والـ CVR بينزل.", detail: "التردد في الـ checkout بيرفع الـ CPA، والعناوين الغلط بتزوّد التوصيل الفاشل بعد البيع. صاحب المتجر يصلح التسميات وحقول العنوان من إعدادات الدفع." } },
      },
      agency: {
        fail: { business: { summary: "بعض حقول الدفع في المتجر غير واضحة أو لا تناسب العناوين المحلية.", detail: "الحقول غير الواضحة تبطئ العملاء في آخر خطوة، ونموذج بلا مدينة أو حي أو معلم يؤدي إلى توصيل فاشل." } },
      },
    },
  },

  "PATH-13": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The first checkout screen shows items, quantities, discounts, shipping and total, or one tap expands them on phone." },
          business: { summary: "Shoppers can see what they're paying for at checkout.", detail: "Items, discounts, delivery and total are in view, so shoppers pay without going back to the cart to check." },
          protect: "Check the order summary on a phone after changing checkout, discount or delivery settings.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We checked that the first checkout screen shows items, quantities, discounts, shipping and total, or expands them in one tap on phone. Some of these are missing or take more than one tap to see." },
          business: { summary: "The checkout doesn't clearly show what the shopper is paying for.", detail: "Shoppers who can't see their items, discount, delivery fee or total hesitate, go back to the cart, or leave. A surprise at this step costs orders." },
          step: "Show the full order summary (items, quantities, discounts, delivery and total) on the first checkout screen, or make it open in one tap on phone, in the checkout settings or theme.",
          doneWhen: "On a phone, the first checkout screen shows items, quantities, discounts, delivery and total, or one tap opens them.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your checkout doesn't clearly show what the customer is paying for.", detail: "Customers who can't see their items, discount, delivery fee or total hesitate or go back, and some leave without paying." } },
      },
      media_buyer: {
        fail: { business: { summary: "Checkout hides parts of the order summary, so paid shoppers hesitate at the last step and CVR drops.", detail: "Shoppers who go back to check the cart or leave over a surprise fee raise CPA. The store owner fixes the summary in the checkout settings." } },
      },
      agency: {
        fail: { business: { summary: "The store's checkout doesn't clearly show what the shopper is paying for.", detail: "Shoppers who can't see items, discount, delivery fee or total hesitate or leave at the last step." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "أول شاشة دفع تعرض المنتجات والكميات والخصومات والتوصيل والإجمالي، أو تفتحها ضغطة واحدة على الجوال." },
          business: { summary: "العميل يرى ما يدفع مقابله في صفحة الدفع.", detail: "المنتجات والخصومات والتوصيل والإجمالي ظاهرة، فيدفع العميل دون العودة إلى السلة للتأكد." },
          protect: "افحص ملخص الطلب على الجوال بعد تغيير إعدادات الدفع أو الخصومات أو التوصيل.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "تحققنا من أن أول شاشة دفع تعرض المنتجات والكميات والخصومات والتوصيل والإجمالي، أو تفتحها بضغطة واحدة على الجوال. بعض هذه العناصر غير موجود أو يحتاج أكثر من ضغطة لرؤيته." },
          business: { summary: "صفحة الدفع لا تُظهر بوضوح ما يدفع العميل مقابله.", detail: "العميل الذي لا يرى منتجاته أو خصمه أو رسوم التوصيل أو الإجمالي يتردد أو يعود إلى السلة أو يغادر. والمفاجأة في هذه الخطوة تكلّف طلبات." },
          step: "اعرض ملخص الطلب كاملًا (المنتجات والكميات والخصومات والتوصيل والإجمالي) في أول شاشة دفع، أو اجعله يفتح بضغطة واحدة على الجوال، من إعدادات الدفع أو القالب.",
          doneWhen: "على الجوال، أول شاشة دفع تعرض المنتجات والكميات والخصومات والتوصيل والإجمالي، أو تفتحها ضغطة واحدة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحة الدفع في متجرك ما توضح للعميل وش بيدفع.", detail: "العميل اللي ما يشوف منتجاته أو الخصم أو رسوم التوصيل أو الإجمالي يتردد أو يرجع، وبعضهم يطلع بدون ما يدفع." } },
      },
      media_buyer: {
        fail: { business: { summary: "الـ checkout مخبّي أجزاء من ملخص الأوردر، فالزوار المدفوعين بيترددوا في آخر خطوة والـ CVR بينزل.", detail: "اللي بيرجع يراجع السلة أو بيمشي بسبب رسوم مفاجئة بيرفع الـ CPA. صاحب المتجر يصلح الملخص من إعدادات الدفع." } },
      },
      agency: {
        fail: { business: { summary: "صفحة الدفع في المتجر لا تُظهر بوضوح ما يدفع العميل مقابله.", detail: "العميل الذي لا يرى المنتجات أو الخصم أو رسوم التوصيل أو الإجمالي يتردد أو يغادر في آخر خطوة." } },
      },
    },
  },

  "PATH-14": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Each cart line shows the product image, name, chosen variant and price, with the old price when the item is on sale." },
          business: { summary: "The cart shows exactly what the shopper picked.", detail: "Shoppers can confirm the item, size or colour and price at a glance before they pay." },
          protect: "Check cart lines for variant and sale price after theme or cart app changes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We checked each cart line for image, name, chosen variant and price, plus the old price for sale items. Some lines miss one or more of these." },
          business: { summary: "Cart lines don't show everything the shopper picked.", detail: "When the image, variant or price is missing, shoppers can't confirm they chose the right item, and a hidden sale price hides the saving they came for. Some go back to check or leave." },
          step: "Edit the cart template so every line shows the image, name, chosen variant (size, colour) and price, with the old price crossed out for sale items.",
          doneWhen: "Every line in the cart shows image, name, variant and price, and sale items show the old price.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The lines in your cart don't show everything the customer picked.", detail: "Without the image, size or colour, or the old price on sale items, customers aren't sure they picked right or that they got the discount, and some leave to check." } },
      },
      media_buyer: {
        fail: { business: { summary: "Cart lines miss the variant, image or sale price, so shoppers from ads doubt the order and CVR drops.", detail: "A shopper who came for a discounted item and can't see the saving in the cart is less likely to pay, which raises CPA. The fix is in the store's cart template." } },
      },
      agency: {
        fail: { business: { summary: "The store's cart lines don't show everything the shopper picked.", detail: "Missing images, variants or sale prices leave shoppers unsure of their order, and some leave before paying." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "كل سطر في السلة يعرض صورة المنتج واسمه والخيار المختار والسعر، مع السعر القديم عند وجود تخفيض." },
          business: { summary: "السلة تعرض بالضبط ما اختاره العميل.", detail: "العميل يتأكد من المنتج والمقاس أو اللون والسعر بنظرة واحدة قبل الدفع." },
          protect: "افحص أسطر السلة للخيار وسعر التخفيض بعد أي تغيير في القالب أو تطبيقات السلة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا كل سطر في السلة بحثًا عن الصورة والاسم والخيار المختار والسعر، والسعر القديم لمنتجات التخفيض. بعض الأسطر ينقصها عنصر أو أكثر." },
          business: { summary: "أسطر السلة لا تعرض كل ما اختاره العميل.", detail: "حين تغيب الصورة أو الخيار أو السعر لا يتأكد العميل من اختياره، وغياب السعر القديم يخفي التوفير الذي جاء من أجله. بعضهم يعود للتأكد أو يغادر." },
          step: "عدّل قالب السلة ليعرض كل سطر الصورة والاسم والخيار المختار (المقاس، اللون) والسعر، مع السعر القديم مشطوبًا لمنتجات التخفيض.",
          doneWhen: "كل سطر في السلة يعرض الصورة والاسم والخيار والسعر، ومنتجات التخفيض تعرض السعر القديم.",
        },
      },
      store_owner: {
        fail: { business: { summary: "أسطر السلة في متجرك ما تعرض كل اللي اختاره العميل.", detail: "إذا ما فيه صورة أو مقاس أو لون، أو السعر القديم للمنتج المخفّض، العميل ما يتأكد إنه اختار صح أو إن الخصم انحسب، وبعضهم يطلع يتأكد وما يرجع." } },
      },
      media_buyer: {
        fail: { business: { summary: "أسطر السلة ناقصها الـ variant أو الصورة أو سعر الخصم، فالناس الجاية من الإعلانات بتشك في الأوردر والـ CVR بينزل.", detail: "اللي جاي عشان منتج عليه خصم ومش شايف التوفير في السلة احتمال يدفع أقل، وده بيرفع الـ CPA. الحل في قالب السلة بتاع المتجر." } },
      },
      agency: {
        fail: { business: { summary: "أسطر السلة في المتجر لا تعرض كل ما اختاره العميل.", detail: "غياب الصور أو الخيارات أو أسعار التخفيض يترك العميل غير متأكد من طلبه، وبعضهم يغادر قبل الدفع." } },
      },
    },
  },

  // Rule is short and "needs sharpening" (registry note): count, close, full width.
  "PATH-17": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The cart drawer header shows the item count and a visible close (×), and on phone the drawer covers the full width." },
          business: { summary: "The cart drawer is clear and easy to close on a phone.", detail: "Shoppers see how many items they have and can close the drawer to keep browsing or go on to checkout." },
          protect: "Check the drawer on a phone after theme or cart app updates.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We checked the cart drawer for an item count in the header, a visible close (×), and full width on phone. One or more of these is missing: no count, a close that is hidden or too small, or a narrow drawer that leaves the page showing beside it." },
          business: { summary: "The cart drawer is unclear or hard to close on a phone.", detail: "Shoppers who can't see the item count or find the close button feel stuck in the drawer. Some leave the site instead of going on to buy or browse." },
          step: "In the theme's cart drawer, show 'Your cart (N items)' in the header, add a clear close (×) button, and make the drawer full width on phone.",
          doneWhen: "On a phone, the cart drawer covers the screen width and its header shows the item count and a visible close button.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The cart drawer in your store is unclear or hard to close on a phone.", detail: "Customers who can't see how many items they have, or can't find the close button, feel stuck, and some leave instead of buying." } },
      },
      media_buyer: {
        fail: { business: { summary: "The cart drawer is unclear or hard to close on phone, so some paid shoppers get stuck and CVR drops.", detail: "Most paid traffic is on phones, and a confusing drawer right after Add to Cart loses buyers at a costly point, which raises CPA. The fix is in the store's theme." } },
      },
      agency: {
        fail: { business: { summary: "The store's cart drawer is unclear or hard to close on a phone.", detail: "Shoppers who can't see the count or find the close button feel stuck right after adding to cart, and some leave." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "رأس نافذة السلة الجانبية يعرض عدد المنتجات وزر إغلاق (×) ظاهرًا، والنافذة تغطي كامل عرض الجوال." },
          business: { summary: "نافذة السلة واضحة وسهلة الإغلاق على الجوال.", detail: "العميل يرى عدد منتجاته ويستطيع إغلاق النافذة لمتابعة التصفح أو الانتقال إلى الدفع." },
          protect: "افحص نافذة السلة على الجوال بعد تحديثات القالب أو تطبيقات السلة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا نافذة السلة الجانبية بحثًا عن عدد المنتجات في الرأس، وزر إغلاق (×) ظاهر، وعرض كامل على الجوال. عنصر أو أكثر غير متوفر: لا يوجد عدد، أو زر الإغلاق مخفي أو صغير جدًا، أو النافذة ضيقة وتترك الصفحة ظاهرة بجانبها." },
          business: { summary: "نافذة السلة غير واضحة أو صعبة الإغلاق على الجوال.", detail: "العميل الذي لا يرى عدد المنتجات أو لا يجد زر الإغلاق يشعر أنه عالق في النافذة، وبعضهم يغادر الموقع بدل متابعة الشراء أو التصفح." },
          step: "في نافذة السلة في القالب، اعرض «سلتك (N منتجات)» في الرأس، وأضف زر إغلاق (×) واضحًا، واجعل النافذة بكامل العرض على الجوال.",
          doneWhen: "على الجوال، نافذة السلة تغطي عرض الشاشة ورأسها يعرض عدد المنتجات وزر إغلاق ظاهرًا.",
        },
      },
      store_owner: {
        fail: { business: { summary: "نافذة السلة في متجرك مو واضحة أو صعب تتسكر على الجوال.", detail: "العميل اللي ما يشوف كم منتج عنده أو ما يلقى زر الإغلاق يحس إنه علق، وبعضهم يطلع بدل ما يشتري." } },
      },
      media_buyer: {
        fail: { business: { summary: "نافذة السلة مش واضحة أو صعب تتقفل على الموبايل، فبعض الزوار المدفوعين بيعلقوا والـ CVR بينزل.", detail: "أغلب الترافيك المدفوع على الموبايل، والنافذة المربكة بعد Add to Cart مباشرة بتخسر مشترين في نقطة غالية، وده بيرفع الـ CPA. الحل في قالب المتجر." } },
      },
      agency: {
        fail: { business: { summary: "نافذة السلة في المتجر غير واضحة أو صعبة الإغلاق على الجوال.", detail: "العميل الذي لا يرى العدد أو لا يجد زر الإغلاق يشعر أنه عالق بعد الإضافة للسلة مباشرة، وبعضهم يغادر." } },
      },
    },
  },

  // Rule is vague ("apps that no longer do anything"); text stays on loaded scripts with no visible job.
  "PATH-18": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The scripts loaded on home, collection, product and cart pages each belong to an app or tool that still shows or does something on the store." },
          business: { summary: "No leftover code from removed apps is slowing the store.", detail: "Pages load only what the store uses, which keeps them faster and lowers the chance of one app breaking another." },
          protect: "When removing an app, delete its theme code and check its scripts no longer load.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We compared the scripts loaded on home, collection, product and cart pages with what each app visibly does on the store. Some scripts belong to apps that show or do nothing, usually code left in the theme after the app was removed." },
          business: { summary: "Code from apps that no longer do anything still loads on the store.", detail: "It slows every page it loads on and can clash with the apps still in use, with nothing gained. Slower pages lose shoppers, most of all on phones." },
          step: "The developer removes the leftover app code from the theme files and the store's script settings, after confirming each app is no longer in use.",
          doneWhen: "The page source of home, collection, product and cart loads no scripts from removed apps.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Code from apps you removed still loads in your store.", detail: "It slows your pages and can break other features, with nothing gained. Uninstalling an app often leaves its code behind in the theme." } },
      },
      media_buyer: {
        fail: { business: { summary: "Leftover app scripts still load on the store, so landing pages are slower and CVR likely lower.", detail: "Paid phone visitors wait for code that does nothing, and some bounce before the page loads, which raises CPA. The store's developer removes the code from the theme." } },
      },
      agency: {
        fail: { business: { summary: "Code from apps that no longer do anything still loads on the store.", detail: "It slows the pages and can clash with the apps still in use, with nothing gained." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "السكربتات المحمّلة في الرئيسية والتصنيفات وصفحة المنتج والسلة يتبع كل منها تطبيقًا أو أداة ما زالت تعرض أو تفعل شيئًا في المتجر." },
          business: { summary: "لا توجد بقايا كود من تطبيقات محذوفة تبطئ المتجر.", detail: "الصفحات تحمّل ما يستخدمه المتجر فقط، فتبقى أسرع ويقل احتمال أن يعطّل تطبيق تطبيقًا آخر." },
          protect: "عند حذف أي تطبيق، احذف كوده من القالب وتأكد أن سكربتاته لم تعد تُحمَّل.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "قارنّا السكربتات المحمّلة في الرئيسية والتصنيفات وصفحة المنتج والسلة بما يفعله كل تطبيق فعلًا في المتجر. بعض السكربتات تتبع تطبيقات لا تعرض ولا تفعل شيئًا، وهي غالبًا كود بقي في القالب بعد حذف التطبيق." },
          business: { summary: "كود تطبيقات لم تعد تفعل شيئًا ما زال يُحمَّل في المتجر.", detail: "يبطئ كل صفحة يُحمَّل فيها وقد يتعارض مع التطبيقات المستخدمة، دون أي فائدة. والصفحات الأبطأ تخسر عملاء، خاصة على الجوال." },
          step: "يحذف المطوّر بقايا كود التطبيقات من ملفات القالب وإعدادات السكربتات في المتجر، بعد التأكد أن كل تطبيق لم يعد مستخدمًا.",
          doneWhen: "مصدر صفحات الرئيسية والتصنيفات والمنتج والسلة لا يحمّل أي سكربت من تطبيقات محذوفة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "كود تطبيقات حذفتها ما زال يتحمّل في متجرك.", detail: "يبطّئ صفحاتك وممكن يخرّب مزايا ثانية بدون أي فايدة. حذف التطبيق كثير مرات يخلي كوده في القالب." } },
      },
      media_buyer: {
        fail: { business: { summary: "سكربتات تطبيقات قديمة لسه بتتحمّل في المتجر، فصفحات الهبوط أبطأ والـ CVR غالبًا أقل.", detail: "زوار الموبايل المدفوعين بيستنوا كود مالوش لازمة، وبعضهم بيعمل bounce قبل ما الصفحة تفتح، وده بيرفع الـ CPA. مطوّر المتجر يشيل الكود من القالب." } },
      },
      agency: {
        fail: { business: { summary: "كود تطبيقات لم تعد تفعل شيئًا ما زال يُحمَّل في المتجر.", detail: "يبطئ الصفحات وقد يتعارض مع التطبيقات المستخدمة، دون أي فائدة." } },
      },
    },
  },

  "COL-01": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "A search field or icon is visible in the header on phone and desktop, and searching a real product's exact name returned it in the top 3 results." },
          business: { summary: "Shoppers can find search and it finds the right product.", detail: "Visitors who know what they want reach it in a few taps instead of browsing menus." },
          protect: "Re-test search with a real product name after changing the theme, search app or product titles.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We checked for a visible search field or icon in the header on phone and desktop, then searched a real product's exact name and expected it in the top 3 results. Either search isn't visible in the header, or the product didn't come back near the top." },
          business: { summary: "Search is hard to find or doesn't return the right product.", detail: "Shoppers who know what they want and can't find it through search usually leave. They are often the visitors closest to buying." },
          step: "Ask the developer to show search in the phone and desktop header, and fix the search setup or app so a real product's name returns it at the top.",
          doneWhen: "Search shows in the header on phone and desktop, and searching a real product's exact name returns it in the top 3 results.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Search in your store is hard to find or doesn't return the right product.", detail: "Customers who know what they want and can't find it leave. These are often the customers most ready to buy." } },
      },
      media_buyer: {
        fail: { business: { summary: "Search is hard to find or misses real products, so paid visitors who want something else leave and CVR drops.", detail: "A visitor who lands on the wrong product and can't search for the right one is a wasted click, which raises CPA. The store's developer fixes the header or the search app." } },
      },
      agency: {
        fail: { business: { summary: "Search on the store is hard to find or doesn't return the right product.", detail: "Shoppers who know what they want and can't find it usually leave, and they are often the closest to buying." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "حقل البحث أو أيقونته ظاهر في رأس الصفحة على الجوال والكمبيوتر، والبحث باسم منتج حقيقي أعاده ضمن أول 3 نتائج." },
          business: { summary: "العملاء يجدون البحث، والبحث يجد المنتج الصحيح.", detail: "الزائر الذي يعرف ما يريد يصل إليه بضغطات قليلة دون التنقل في القوائم." },
          protect: "أعد اختبار البحث باسم منتج حقيقي بعد تغيير القالب أو تطبيق البحث أو أسماء المنتجات.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "تحققنا من وجود حقل بحث أو أيقونة ظاهرة في رأس الصفحة على الجوال والكمبيوتر، ثم بحثنا بالاسم الكامل لمنتج حقيقي وتوقعنا ظهوره ضمن أول 3 نتائج. إما أن البحث غير ظاهر في الرأس، أو أن المنتج لم يظهر في أعلى النتائج." },
          business: { summary: "البحث صعب الإيجاد أو لا يُظهر المنتج الصحيح.", detail: "العميل الذي يعرف ما يريد ولا يجده بالبحث يغادر غالبًا، وهو عادة من أقرب الزوار إلى الشراء." },
          step: "اطلب من المطوّر إظهار البحث في رأس الصفحة على الجوال والكمبيوتر، وإصلاح إعداد البحث أو تطبيقه بحيث يُظهر اسم المنتج الحقيقي المنتج في الأعلى.",
          doneWhen: "البحث ظاهر في الرأس على الجوال والكمبيوتر، والبحث بالاسم الكامل لمنتج حقيقي يُظهره ضمن أول 3 نتائج.",
        },
      },
      store_owner: {
        fail: { business: { summary: "البحث في متجرك صعب تلقاه أو ما يطلّع المنتج الصح.", detail: "العميل اللي يعرف وش يبي وما يلقاه يطلع، وهذا غالبًا أكثر عميل جاهز يشتري." } },
      },
      media_buyer: {
        fail: { business: { summary: "البحث صعب يتلاقى أو مش بيطلّع منتجات حقيقية، فالزوار المدفوعين اللي عايزين حاجة تانية بيمشوا والـ CVR بينزل.", detail: "الزائر اللي وصل لمنتج غلط ومش عارف يدوّر على الصح كليك ضايع، وده بيرفع الـ CPA. مطوّر المتجر يصلح الهيدر أو تطبيق البحث." } },
      },
      agency: {
        fail: { business: { summary: "البحث في المتجر صعب الإيجاد أو لا يُظهر المنتج الصحيح.", detail: "العميل الذي يعرف ما يريد ولا يجده يغادر غالبًا، وهو عادة من أقرب الزوار إلى الشراء." } },
      },
    },
  },

  "COL-06": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Collection filters show a count for each option, offer a one-tap clear, and the filter types fit the catalogue (such as size, price or type)." },
          business: { summary: "Collection filters help shoppers narrow down fast.", detail: "Shoppers see how many products each option has, pick the filters that matter for this catalogue, and reset in one tap." },
          protect: "Review the filters when adding new product types or attributes to the catalogue.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We checked collection filters for a count on each option, a one-tap clear, and filter types that fit the catalogue (size, price, type). Filters are missing, show no counts, have no quick clear, or don't match how this catalogue is chosen." },
          business: { summary: "Collection filters don't help shoppers narrow down.", detail: "Without counts, shoppers pick options that return little or nothing. Without a quick clear, or with the wrong filter types, they scroll long lists or give up." },
          step: "Set up collection filters that match the catalogue (for example size, price and type), turn on option counts, and add a one-tap clear button in the filter settings or app.",
          doneWhen: "On a collection page, filters fit the catalogue, each option shows a count, and one tap clears them all.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The filters on your collection pages don't help customers find products.", detail: "Without counts, a quick clear, or the right filters like size and price, customers scroll through long lists or give up." } },
      },
      media_buyer: {
        fail: { business: { summary: "Collection filters are weak, so paid visitors landing on collections struggle to find a product and CVR drops.", detail: "Collection-page campaigns pay for clicks that then scroll and leave, which raises CPA. The store owner fixes the filter settings or app." } },
      },
      agency: {
        fail: { business: { summary: "The store's collection filters don't help shoppers narrow down.", detail: "Without counts, a quick clear, or filters that fit the catalogue, shoppers scroll long lists or give up." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "فلاتر صفحات التصنيف تعرض عدد المنتجات لكل خيار، وتتيح المسح بضغطة واحدة، وأنواع الفلاتر تناسب المنتجات (مثل المقاس أو السعر أو النوع)." },
          business: { summary: "فلاتر التصنيفات تساعد العملاء على التضييق بسرعة.", detail: "العميل يرى عدد المنتجات في كل خيار، ويختار الفلاتر المهمة لهذه المنتجات، ويعيد الضبط بضغطة واحدة." },
          protect: "راجع الفلاتر عند إضافة أنواع أو خصائص منتجات جديدة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا فلاتر صفحات التصنيف بحثًا عن عدد لكل خيار، ومسح بضغطة واحدة، وأنواع فلاتر تناسب المنتجات (المقاس، السعر، النوع). الفلاتر غير موجودة، أو بلا أعداد، أو بلا مسح سريع، أو لا تناسب طريقة اختيار هذه المنتجات." },
          business: { summary: "فلاتر التصنيفات لا تساعد العملاء على التضييق.", detail: "بدون الأعداد يختار العميل خيارات تعيد منتجات قليلة أو لا شيء. وبدون مسح سريع، أو مع فلاتر غير مناسبة، يمرّر قوائم طويلة أو يستسلم." },
          step: "أعدّ فلاتر تناسب المنتجات (مثل المقاس والسعر والنوع)، وفعّل عرض الأعداد، وأضف زر مسح بضغطة واحدة من إعدادات الفلاتر أو التطبيق.",
          doneWhen: "في صفحة التصنيف، الفلاتر تناسب المنتجات، وكل خيار يعرض عددًا، وضغطة واحدة تمسحها كلها.",
        },
      },
      store_owner: {
        fail: { business: { summary: "الفلاتر في صفحات التصنيفات بمتجرك ما تساعد العميل يلقى المنتج.", detail: "بدون أعداد أو مسح سريع أو فلاتر مناسبة مثل المقاس والسعر، العميل يقعد يمرّر قوائم طويلة أو يطلع." } },
      },
      media_buyer: {
        fail: { business: { summary: "فلاتر التصنيفات ضعيفة، فالزوار المدفوعين اللي بيوصلوا لصفحات التصنيف بيتعبوا يلاقوا منتج والـ CVR بينزل.", detail: "حملات صفحات التصنيف بتدفع في كليكات بتعمل scroll وتمشي، وده بيرفع الـ CPA. صاحب المتجر يصلح إعدادات الفلاتر أو التطبيق." } },
      },
      agency: {
        fail: { business: { summary: "فلاتر التصنيفات في المتجر لا تساعد العملاء على التضييق.", detail: "بدون أعداد أو مسح سريع أو فلاتر تناسب المنتجات، يمرّر العملاء قوائم طويلة أو يستسلمون." } },
      },
    },
  },

  "COL-07": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Product cards on home and collection pages show an Add to cart button, or a quick-pick button for products with variants." },
          business: { summary: "Shoppers can add to cart straight from the product lists.", detail: "Shoppers who already know what they want skip a page load and add the item in one or two taps." },
          protect: "Check that cards keep their quick add button after theme or collection layout changes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We checked product cards on home and collection pages for an Add to cart button, or a quick-pick button for variant products. Cards show neither, so every purchase needs a full product page visit." },
          business: { summary: "Product cards have no quick add to cart.", detail: "Shoppers who already know what they want must open each product page to buy. Each extra page load loses some of them, most of all on phones and for repeat buyers." },
          step: "Turn on quick add in the theme's product card settings: an Add to cart button for single-variant products and a quick-pick button that opens size or colour options for the rest.",
          doneWhen: "Product cards on the home page and a collection page show an Add to cart or quick-pick button.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your product cards have no quick add to cart.", detail: "Customers who already know what they want must open every product to buy it, and some drop off on the way, especially repeat customers on the phone." } },
      },
      media_buyer: {
        fail: { business: { summary: "Product cards have no quick add, so paid visitors on collections take extra steps to buy and CVR likely drops.", detail: "Every extra page load between the ad and the cart loses some buyers, which raises CPA on collection and catalogue campaigns. The fix is a theme setting on the store." } },
      },
      agency: {
        fail: { business: { summary: "The store's product cards have no quick add to cart.", detail: "Shoppers who already know what they want must open each product page to buy, and some drop off along the way." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "بطاقات المنتجات في الرئيسية وصفحات التصنيف تعرض زر إضافة للسلة، أو زر اختيار سريع للمنتجات ذات الخيارات." },
          business: { summary: "العملاء يضيفون للسلة مباشرة من قوائم المنتجات.", detail: "العميل الذي يعرف ما يريد يتجاوز فتح صفحة المنتج ويضيفه بضغطة أو ضغطتين." },
          protect: "تأكد أن البطاقات تحتفظ بزر الإضافة السريعة بعد تغيير القالب أو تصميم التصنيفات.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا بطاقات المنتجات في الرئيسية وصفحات التصنيف بحثًا عن زر إضافة للسلة، أو زر اختيار سريع للمنتجات ذات الخيارات. البطاقات لا تعرض أيًا منهما، فكل عملية شراء تتطلب فتح صفحة المنتج." },
          business: { summary: "بطاقات المنتجات بلا إضافة سريعة للسلة.", detail: "العميل الذي يعرف ما يريد مضطر لفتح كل صفحة منتج ليشتري. وكل صفحة إضافية تخسر بعض العملاء، خاصة على الجوال وعند العملاء العائدين." },
          step: "فعّل الإضافة السريعة من إعدادات بطاقة المنتج في القالب: زر إضافة للسلة للمنتجات بخيار واحد، وزر اختيار سريع يفتح المقاسات أو الألوان لبقية المنتجات.",
          doneWhen: "بطاقات المنتجات في الرئيسية وفي صفحة تصنيف تعرض زر إضافة للسلة أو زر اختيار سريع.",
        },
      },
      store_owner: {
        fail: { business: { summary: "بطاقات المنتجات في متجرك ما فيها زر أضف للسلة سريع.", detail: "العميل اللي يعرف وش يبي لازم يفتح كل منتج عشان يشتريه، وبعضهم يطلع في النص، خصوصًا العملاء اللي يرجعون من الجوال." } },
      },
      media_buyer: {
        fail: { business: { summary: "بطاقات المنتجات مفيهاش quick add، فالزوار المدفوعين على صفحات التصنيف بياخدوا خطوات زيادة عشان يشتروا والـ CVR غالبًا بينزل.", detail: "كل صفحة زيادة بين الإعلان والسلة بتخسر مشترين، وده بيرفع الـ CPA في حملات التصنيف والكتالوج. الحل إعداد في قالب المتجر." } },
      },
      agency: {
        fail: { business: { summary: "بطاقات المنتجات في المتجر بلا إضافة سريعة للسلة.", detail: "العميل الذي يعرف ما يريد مضطر لفتح كل صفحة منتج ليشتري، وبعضهم يتوقف في الطريق." } },
      },
    },
  },

  "NAV-03": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "The phone menu opened on the first tap and listed the main product categories first." },
          business: { summary: "The phone menu opens right away and leads with the main categories.", detail: "Shoppers reach the products they came for in a tap or two." },
          protect: "Check the phone menu after adding menu items, pages or apps that change the header.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We tapped the phone menu once and checked that it opened and listed the main product categories first. Either it needed more than one tap, opened slowly or not at all, or it led with other links (pages, account, policies) before the categories." },
          business: { summary: "The phone menu is slow to open or doesn't lead with the main categories.", detail: "Shoppers use the menu to find products. When it doesn't open on the first tap, or the categories are buried under other links, many give up browsing." },
          step: "Fix the menu script so it opens on the first tap, and reorder the phone menu so the main product categories come first, above pages and account links.",
          doneWhen: "On a phone, one tap opens the menu and the main product categories are the first items in it.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The phone menu in your store is slow to open or hides your main categories.", detail: "Customers open the menu to find products. If it needs several taps or the categories are buried, many stop browsing." } },
      },
      media_buyer: {
        fail: { business: { summary: "The phone menu is slow or buries the categories, so paid visitors who want to browse leave and CVR drops.", detail: "Visitors whose landing product isn't right rely on the menu. When it fails, the click is wasted and CPA rises. The store's developer fixes the menu." } },
      },
      agency: {
        fail: { business: { summary: "The store's phone menu is slow to open or doesn't lead with the main categories.", detail: "Shoppers who can't open the menu or find the categories quickly stop browsing." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "قائمة الجوال فُتحت من أول ضغطة وعرضت تصنيفات المنتجات الرئيسية أولًا." },
          business: { summary: "قائمة الجوال تفتح فورًا وتبدأ بالتصنيفات الرئيسية.", detail: "العميل يصل إلى المنتجات التي جاء من أجلها بضغطة أو ضغطتين." },
          protect: "افحص قائمة الجوال بعد إضافة عناصر أو صفحات أو تطبيقات تغيّر رأس الصفحة.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "ضغطنا قائمة الجوال مرة واحدة وتحققنا من أنها تفتح وتعرض تصنيفات المنتجات الرئيسية أولًا. إما أنها احتاجت أكثر من ضغطة، أو فُتحت ببطء أو لم تُفتح، أو بدأت بروابط أخرى (صفحات، حساب، سياسات) قبل التصنيفات." },
          business: { summary: "قائمة الجوال بطيئة الفتح أو لا تبدأ بالتصنيفات الرئيسية.", detail: "العملاء يستخدمون القائمة للوصول إلى المنتجات. حين لا تفتح من أول ضغطة، أو تُدفن التصنيفات تحت روابط أخرى، يتوقف كثيرون عن التصفح." },
          step: "أصلح سكربت القائمة لتفتح من أول ضغطة، وأعد ترتيب قائمة الجوال لتأتي تصنيفات المنتجات الرئيسية أولًا، فوق الصفحات وروابط الحساب.",
          doneWhen: "على الجوال، ضغطة واحدة تفتح القائمة، وتصنيفات المنتجات الرئيسية هي أول عناصرها.",
        },
      },
      store_owner: {
        fail: { business: { summary: "قائمة الجوال في متجرك بطيئة تفتح أو مخبية التصنيفات الرئيسية.", detail: "العملاء يفتحون القائمة عشان يلقون المنتجات. إذا احتاجت كذا ضغطة أو التصنيفات مدفونة، كثير منهم يوقفون التصفح." } },
      },
      media_buyer: {
        fail: { business: { summary: "قائمة الموبايل بطيئة أو مخبية التصنيفات، فالزوار المدفوعين اللي عايزين يتفرجوا بيمشوا والـ CVR بينزل.", detail: "الزائر اللي المنتج اللي وصله مش مناسب بيعتمد على القائمة. لو مش شغالة، الكليك بيضيع والـ CPA بيطلع. مطوّر المتجر يصلح القائمة." } },
      },
      agency: {
        fail: { business: { summary: "قائمة الجوال في المتجر بطيئة الفتح أو لا تبدأ بالتصنيفات الرئيسية.", detail: "العميل الذي لا يستطيع فتح القائمة أو إيجاد التصنيفات بسرعة يتوقف عن التصفح." } },
      },
    },
  },

  "NAV-08": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Arabic pages set html lang=ar and dir=rtl, containers compute rtl, text is right-aligned, arrows face the right way, and nothing overflows a 390px phone width." },
          business: { summary: "The Arabic pages read right to left correctly on a phone.", detail: "Arabic shoppers see a layout that looks native and trustworthy, including the cart." },
          protect: "Check Arabic product and cart pages on a phone after every theme or app update.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We checked Arabic pages for html lang=ar and dir=rtl, rtl on containers, right-aligned text, arrows facing the right way, and no overflow at 390px. One or more failed: missing lang or dir, left-to-right blocks, left-aligned text, reversed arrows, or content wider than the phone screen." },
          business: { summary: "The Arabic pages don't mirror correctly on a phone.", detail: "Left-aligned text, reversed arrows or content spilling off the screen make the store look broken to Arabic shoppers. On the cart, that doubt comes at the moment they decide to pay." },
          step: "Ask the developer or theme support to fix the right-to-left layout for Arabic: set lang=ar and dir=rtl, mirror containers, text and arrows, and fix anything wider than the phone screen, starting with the product page and cart.",
          doneWhen: "Arabic product page and cart screenshots on a phone show a correct right-to-left layout with nothing overlapping or cut off.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your Arabic pages don't read right to left properly on the phone.", detail: "Text on the wrong side, reversed arrows or a broken Arabic cart make the store look unsafe at the moment the customer decides to pay." } },
      },
      media_buyer: {
        fail: { business: { summary: "Arabic pages don't mirror correctly on phone, so Arabic ad traffic lands on a broken-looking store and CVR drops.", detail: "Arabic campaigns pay for clicks that then doubt the store, most of all in the cart, which raises CPA. The store's developer or theme support fixes the layout." } },
      },
      agency: {
        fail: { business: { summary: "The store's Arabic pages don't mirror correctly on a phone.", detail: "A broken right-to-left layout makes the store look unsafe to Arabic shoppers, most of all in the cart where they decide to pay." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "الصفحات العربية تضبط html lang=ar و dir=rtl، والحاويات بالاتجاه rtl، والنص محاذى لليمين، والأسهم في الاتجاه الصحيح، ولا شيء يتجاوز عرض جوال 390px." },
          business: { summary: "الصفحات العربية تُقرأ من اليمين لليسار بشكل صحيح على الجوال.", detail: "العميل العربي يرى تصميمًا طبيعيًا وموثوقًا، بما في ذلك السلة." },
          protect: "افحص صفحة المنتج والسلة بالعربية على الجوال بعد كل تحديث للقالب أو التطبيقات.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا الصفحات العربية بحثًا عن html lang=ar و dir=rtl، واتجاه rtl في الحاويات، ونص محاذى لليمين، وأسهم في الاتجاه الصحيح، وعدم تجاوز عرض 390px. أخفق عنصر أو أكثر: غياب lang أو dir، أو أقسام من اليسار لليمين، أو نص محاذى لليسار، أو أسهم معكوسة، أو محتوى أعرض من شاشة الجوال." },
          business: { summary: "الصفحات العربية لا تنعكس بشكل صحيح على الجوال.", detail: "النص المحاذى لليسار أو الأسهم المعكوسة أو المحتوى الخارج عن الشاشة تجعل المتجر يبدو معطلًا للعميل العربي. وفي السلة يأتي هذا الشك لحظة قرار الدفع." },
          step: "اطلب من المطوّر أو دعم القالب إصلاح الاتجاه من اليمين لليسار للعربية: ضبط lang=ar و dir=rtl، وعكس الحاويات والنص والأسهم، وإصلاح أي عنصر أعرض من شاشة الجوال، بدءًا بصفحة المنتج والسلة.",
          doneWhen: "لقطات صفحة المنتج والسلة بالعربية على الجوال تُظهر اتجاهًا صحيحًا من اليمين لليسار دون تداخل أو قص.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحات متجرك العربية ما تنقرأ من اليمين لليسار صح على الجوال.", detail: "النص في الجهة الغلط أو الأسهم المعكوسة أو السلة العربية الخربانة تخلي المتجر يبان غير آمن في اللحظة اللي العميل يقرر يدفع فيها." } },
      },
      media_buyer: {
        fail: { business: { summary: "الصفحات العربية مش معكوسة صح على الموبايل، فترافيك الإعلانات العربي بيوصل لمتجر شكله بايظ والـ CVR بينزل.", detail: "الحملات العربية بتدفع في كليكات بتشك في المتجر، خصوصًا في السلة، وده بيرفع الـ CPA. مطوّر المتجر أو دعم القالب يصلح الاتجاه." } },
      },
      agency: {
        fail: { business: { summary: "الصفحات العربية في المتجر لا تنعكس بشكل صحيح على الجوال.", detail: "الاتجاه المعطل من اليمين لليسار يجعل المتجر يبدو غير آمن للعميل العربي، خاصة في السلة حيث يقرر الدفع." } },
      },
    },
  },

  "NAV-09": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "Arabic pages are fully translated: product titles, menus and buttons are in Arabic, with natural wording, no spelling errors and no leftover English." },
          business: { summary: "The Arabic version reads naturally.", detail: "Arabic-speaking shoppers find and trust products faster when everything is in their language and reads well." },
          protect: "Add the Arabic title and text with every new product, and review new menu items and buttons in Arabic.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We checked Arabic pages for full translation: product titles, menus and buttons in Arabic, natural wording, no spelling errors and no leftover English. Some text is still in English, reads like a machine translation, or has spelling errors." },
          business: { summary: "The Arabic version isn't fully translated or doesn't read naturally.", detail: "Arabic shoppers trust a store less when product names stay in English or the wording feels machine-made. They find products more slowly and some leave for a store that speaks their language." },
          step: "Add Arabic titles to every product in the product editor, starting with the best sellers, keeping brand names as they are. Then translate the remaining menus and buttons and have a native speaker review the wording.",
          doneWhen: "On the Arabic collection and product pages, every product title, menu item and button is in natural, correctly spelled Arabic.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your Arabic pages aren't fully in Arabic or don't read naturally.", detail: "Customers trust and find products faster when names and buttons are in their language. English leftovers or machine wording make some of them leave." } },
      },
      media_buyer: {
        fail: { business: { summary: "Arabic pages have English leftovers or awkward wording, so Arabic ad traffic trusts the store less and CVR drops.", detail: "Arabic creatives send shoppers to pages that don't match their language, which loses buyers and raises CPA. The store owner fixes the product titles and translations." } },
      },
      agency: {
        fail: { business: { summary: "The store's Arabic version isn't fully translated or doesn't read naturally.", detail: "English product names and machine wording lower trust with Arabic shoppers, and some leave for a store that reads naturally." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "الصفحات العربية مترجمة بالكامل: أسماء المنتجات والقوائم والأزرار بالعربية، بصياغة طبيعية، دون أخطاء إملائية أو بقايا إنجليزية." },
          business: { summary: "النسخة العربية تُقرأ بشكل طبيعي.", detail: "العميل العربي يجد المنتجات ويثق بها أسرع حين يكون كل شيء بلغته ومكتوبًا بشكل جيد." },
          protect: "أضف الاسم والنص العربي مع كل منتج جديد، وراجع عناصر القوائم والأزرار الجديدة بالعربية.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "فحصنا الصفحات العربية بحثًا عن ترجمة كاملة: أسماء المنتجات والقوائم والأزرار بالعربية، بصياغة طبيعية، دون أخطاء إملائية أو بقايا إنجليزية. بعض النصوص ما زالت بالإنجليزية، أو تبدو كترجمة آلية، أو فيها أخطاء إملائية." },
          business: { summary: "النسخة العربية غير مترجمة بالكامل أو لا تُقرأ بشكل طبيعي.", detail: "العميل العربي يثق أقل بالمتجر حين تبقى أسماء المنتجات بالإنجليزية أو تبدو الصياغة آلية. يجد المنتجات أبطأ، وبعضهم يغادر إلى متجر يتحدث لغته." },
          step: "أضف أسماء عربية لكل المنتجات من محرر المنتج، بدءًا بالأكثر مبيعًا، مع إبقاء أسماء العلامات كما هي. ثم ترجم القوائم والأزرار المتبقية واطلب من متحدث عربي مراجعة الصياغة.",
          doneWhen: "في صفحة التصنيف وصفحة المنتج بالعربية، كل اسم منتج وعنصر قائمة وزر بعربية طبيعية وسليمة الإملاء.",
        },
      },
      store_owner: {
        fail: { business: { summary: "صفحات متجرك العربية مو كلها عربي أو كلامها مو طبيعي.", detail: "العميل يثق ويلقى المنتج أسرع إذا الأسماء والأزرار بلغته. الكلام الإنجليزي أو الترجمة الآلية تخلي بعضهم يطلع." } },
      },
      media_buyer: {
        fail: { business: { summary: "الصفحات العربية فيها إنجليزي متساب أو صياغة غريبة، فترافيك الإعلانات العربي بيثق أقل والـ CVR بينزل.", detail: "الكريتيف العربي بيبعت الناس لصفحات مش بلغتهم، وده بيخسر مشترين ويرفع الـ CPA. صاحب المتجر يصلح أسماء المنتجات والترجمة." } },
      },
      agency: {
        fail: { business: { summary: "النسخة العربية من المتجر غير مترجمة بالكامل أو لا تُقرأ بشكل طبيعي.", detail: "أسماء المنتجات الإنجليزية والصياغة الآلية تقلل ثقة العميل العربي، وبعضهم يغادر إلى متجر بلغة طبيعية." } },
      },
    },
  },

  // Roles: store_owner only.
  "NAV-12": {
    en: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "A language switch (Arabic/English) is easy to find on phone, prices show in the store currency the same way on product, cart and collection pages, and any currency switch works." },
          business: { summary: "Shoppers can switch language and see prices in the right currency.", detail: "Visitors read the store in their language and see one familiar currency from collection to cart." },
          protect: "Check the language switch and currency on product, cart and collection pages after theme or currency app changes.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "We checked for an easy-to-find language switch on phone, prices in the store currency shown the same way on product, cart and collection pages, and a working currency switch if there is one. One of these failed: the switch is missing or hidden, the currency differs or is formatted differently between pages, or the currency switch doesn't apply." },
          business: { summary: "The language switch is hard to find, or prices don't show in the store currency the same way on every page.", detail: "Shoppers who can't read the page in their language, or see an unexpected currency or a price that changes between pages, lose trust and often don't buy." },
          step: "Show the language switch in the phone header, and set prices to show in the store currency the same way on collection, product and cart pages. Fix or remove a currency switch that doesn't work.",
          doneWhen: "The language switch shows in the phone header, and collection, product and cart pages show prices in the same currency and format.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Customers can't easily switch language in your store, or prices don't show in your currency the same way on every page.", detail: "A customer who can't read the page in their language, or sees a strange currency or a price that changes between pages, often leaves without buying." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "{observation}", detail: "مبدّل اللغة (عربي/إنجليزي) سهل الإيجاد على الجوال، والأسعار تظهر بعملة المتجر وبنفس الطريقة في صفحات المنتج والسلة والتصنيف، وأي مبدّل عملة يعمل." },
          business: { summary: "العملاء يغيّرون اللغة ويرون الأسعار بالعملة الصحيحة.", detail: "الزائر يقرأ المتجر بلغته ويرى عملة واحدة مألوفة من التصنيف حتى السلة." },
          protect: "افحص مبدّل اللغة والعملة في صفحات المنتج والسلة والتصنيف بعد تغيير القالب أو تطبيق العملات.",
        },
        fail: {
          technical: { summary: "{observation}", detail: "تحققنا من وجود مبدّل لغة سهل الإيجاد على الجوال، وأسعار بعملة المتجر تظهر بنفس الطريقة في صفحات المنتج والسلة والتصنيف، ومبدّل عملة يعمل إن وُجد. أحد هذه أخفق: المبدّل غير موجود أو مخفي، أو العملة أو تنسيقها يختلف بين الصفحات، أو مبدّل العملة لا يطبّق التغيير." },
          business: { summary: "مبدّل اللغة صعب الإيجاد، أو الأسعار لا تظهر بعملة المتجر بنفس الطريقة في كل الصفحات.", detail: "العميل الذي لا يقرأ الصفحة بلغته، أو يرى عملة غير متوقعة أو سعرًا يتغير بين الصفحات، يفقد الثقة وغالبًا لا يشتري." },
          step: "أظهر مبدّل اللغة في رأس الصفحة على الجوال، واضبط الأسعار لتظهر بعملة المتجر بنفس الطريقة في صفحات التصنيف والمنتج والسلة. أصلح مبدّل العملة الذي لا يعمل أو احذفه.",
          doneWhen: "مبدّل اللغة ظاهر في رأس الصفحة على الجوال، وصفحات التصنيف والمنتج والسلة تعرض الأسعار بنفس العملة والتنسيق.",
        },
      },
      store_owner: {
        pass: { business: { summary: "العميل يقدر يغيّر اللغة في متجرك ويشوف الأسعار بعملتك.", detail: "الزائر يقرأ المتجر بلغته ويشوف نفس العملة من التصنيف لين السلة." } },
        fail: { business: { summary: "العميل ما يلقى تغيير اللغة بسهولة في متجرك، أو الأسعار ما تطلع بعملتك بنفس الشكل في كل الصفحات.", detail: "العميل اللي ما يقدر يقرأ الصفحة بلغته، أو يشوف عملة غريبة أو سعر يتغير بين الصفحات، غالبًا يطلع بدون ما يشتري." } },
      },
    },
  },
};
