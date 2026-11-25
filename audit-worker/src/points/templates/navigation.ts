import type { PointTemplate } from "./types.js";

export const NAVIGATION: Record<string, PointTemplate> = {
  // net.ts nav01: dead = 404/410 only; the 404 page needs search or links to /products/ or /collections/.
  "NAV-01": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "We fetched {linksChecked} menu and footer link(s). Only a 404 or 410 counts as dead, and a made-up URL showed that {notFound}." },
          business: { summary: "Every menu and footer link opens a working page.", detail: "Shoppers who browse through your menu reach the page they picked, and a mistyped address still leads them back to products." },
          protect: "Re-check the menu and footer after deleting a product, collection or page, and redirect the old address.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "We fetched {linksChecked} menu and footer link(s); a link is dead when it answers 404 or 410. The 404 page passes when it has a search box or links to products or collections, and here {notFound}." },
          business: { summary: "Some menu or footer links lead to a missing page, or the missing-page screen offers no way back to products.", detail: "A shopper who taps a dead link lands on an error page. Without search or product links there, most of them leave the store." },
          step: "Your developer fixes or removes each dead link named in this finding, redirects deleted pages to the closest live collection, and adds a search box and best-seller links to the 404 page.",
          doneWhen: "Every menu and footer link answers without a 404 or 410, and a made-up address on the store shows a 404 page with a search box or links to products or collections.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Some links in your menu or footer open an error page.", detail: "A shopper who taps one hits a dead end in your store. If the error page shows no search or products, most of them leave and don't come back." } },
      },
      media_buyer: {
        fail: { business: { summary: "Some menu or footer links on the store are dead, so paid visitors who browse hit error pages.", detail: "Clicks that reach a dead end are spend with no chance to convert, which pushes CPA up. The store's developer fixes the links and the 404 page." } },
      },
      agency: {
        pass: { business: { summary: "Every menu and footer link on the store opens a working page.", detail: "Shoppers who browse through the menu reach the page they picked, and a mistyped address still leads back to products." } },
        fail: { business: { summary: "Some menu or footer links on the store lead to a missing page, or the missing-page screen offers no way back.", detail: "A shopper who taps a dead link lands on an error page. Without search or product links there, most of them leave the store." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "كل روابط القائمة والتذييل تعمل، وصفحة 404 تعرض بحثًا أو روابط منتجات.", detail: "فحصنا {linksChecked} رابطًا في القائمة والتذييل. لا يُعد الرابط معطلًا إلا إذا أعاد 404 أو 410." },
          business: { summary: "كل روابط القائمة والتذييل تفتح صفحة تعمل.", detail: "من يتصفح عبر القائمة يصل إلى الصفحة التي اختارها، والعنوان المكتوب خطأ يعيده إلى المنتجات." },
          protect: "أعد فحص القائمة والتذييل بعد حذف أي منتج أو تصنيف أو صفحة، ووجّه العنوان القديم إلى صفحة قائمة.",
        },
        fail: {
          technical: { summary: "روابط في القائمة أو التذييل تعيد صفحة غير موجودة، أو صفحة 404 بلا بحث ولا روابط منتجات.", detail: "فحصنا {linksChecked} رابطًا، والرابط المعطل هو ما يعيد 404 أو 410. تنجح صفحة 404 إذا احتوت على مربع بحث أو روابط إلى المنتجات أو التصنيفات." },
          business: { summary: "بعض روابط القائمة أو التذييل تقود إلى صفحة غير موجودة، أو صفحة الخطأ لا تعيد العميل إلى المنتجات.", detail: "العميل الذي ينقر رابطًا معطلًا يصل إلى صفحة خطأ. وبدون بحث أو روابط منتجات فيها يغادر أغلبهم المتجر." },
          step: "يصلح المطوّر كل رابط معطل أو يحذفه، ويوجّه الصفحات المحذوفة إلى أقرب تصنيف قائم، ويضيف مربع بحث وروابط للأكثر مبيعًا في صفحة 404.",
          doneWhen: "كل روابط القائمة والتذييل تعمل بدون 404 أو 410، وعنوان وهمي على المتجر يعرض صفحة 404 فيها مربع بحث أو روابط إلى المنتجات أو التصنيفات.",
        },
      },
      store_owner: {
        fail: { business: { summary: "فيه روابط في قائمة متجرك أو أسفل الصفحة تفتح صفحة خطأ.", detail: "العميل اللي يضغط عليها يوصل لطريق مسدود. وإذا صفحة الخطأ ما فيها بحث ولا منتجات، أغلبهم يطلعون وما يرجعون." } },
      },
      media_buyer: {
        fail: { business: { summary: "فيه روابط ميتة في المنيو أو الفوتر، فالزوار المدفوعين اللي بيتصفحوا بيقابلوا صفحات error.", detail: "الكليك اللي بيوصل لطريق مسدود صرف من غير أي فرصة تحويل، وده بيرفع الـ CPA. مطوّر المتجر هو اللي يصلّح الروابط وصفحة الـ 404." } },
      },
      agency: {
        fail: { business: { summary: "بعض روابط القائمة أو التذييل في المتجر تقود إلى صفحة غير موجودة، أو صفحة الخطأ لا تعيد العميل إلى المنتجات.", detail: "العميل الذي ينقر رابطًا معطلًا يصل إلى صفحة خطأ، وبدون بحث أو روابط منتجات فيها يغادر أغلبهم المتجر." } },
      },
    },
  },

  // visit.ts nav02: desktop header; fail when more than 6 links (Home counted) or a weak link sits ahead of a shopping link.
  "NAV-02": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Desktop header menu: {menu}. The limit is 6 top-level links, with Blog, About, Contact, FAQ, Careers and order tracking after the shopping links." },
          business: { summary: "Your main menu is short and leads with what you sell.", detail: "Shoppers see your categories first and pick one without reading a long list." },
          protect: "Add new categories inside an existing menu item instead of a new top-level link.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Desktop header menu ({links} links): {menu}. The rule allows 6 top-level links at most, and puts Blog, About, Contact, FAQ, Careers and order tracking after every shopping link." },
          business: { summary: "Your main menu is long, or puts pages like Blog or About ahead of what you sell.", detail: "Shoppers scan the menu to find a category. A long list, or info pages first, slows that search and sends some of them to pages that don't sell." },
          step: "Cut the top menu to 6 links or fewer by grouping categories under a parent item, and move Blog, About, Contact and FAQ to the end or to the footer.",
          doneWhen: "The desktop header menu has 6 links or fewer, and Blog, About, Contact, FAQ, Careers and order tracking links all come after the shopping links.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The menu in your store is long, or shows pages like Blog or About before your products.", detail: "Shoppers look at the menu to find what they want. A long list, or info pages first, makes them work harder to reach your products." } },
      },
      media_buyer: {
        fail: { business: { summary: "The store's main menu is long or leads with info pages, so paid visitors who browse take longer to reach products.", detail: "Visitors who don't buy from the landing page use the menu next. A cluttered menu loses some of them, which keeps CVR lower on the same traffic. The owner or developer fixes the menu." } },
      },
      agency: {
        pass: { business: { summary: "The store's main menu is short and leads with what it sells.", detail: "Shoppers see the categories first and pick one without reading a long list." } },
        fail: { business: { summary: "The store's main menu is long, or puts pages like Blog or About ahead of the products.", detail: "Shoppers scan the menu to find a category. A long list, or info pages first, slows that search and sends some of them to pages that don't sell." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "القائمة الرئيسية قصيرة وروابط التسوق في أولها.", detail: "قائمة رأس الصفحة على سطح المكتب: {menu}. الحد 6 روابط، وتأتي المدونة ومن نحن وتواصل معنا والأسئلة الشائعة وتتبع الطلب بعد روابط التسوق." },
          business: { summary: "القائمة الرئيسية قصيرة وتبدأ بما يبيعه المتجر.", detail: "يرى العملاء التصنيفات أولًا ويختارون منها بدون قراءة قائمة طويلة." },
          protect: "أضف التصنيفات الجديدة داخل بند قائم في القائمة بدل رابط جديد في المستوى الأول.",
        },
        fail: {
          technical: { summary: "القائمة الرئيسية فيها أكثر من 6 روابط، أو تضع روابط غير شرائية قبل روابط التسوق.", detail: "قائمة رأس الصفحة على سطح المكتب ({links} روابط): {menu}. القاعدة 6 روابط على الأكثر في المستوى الأول، مع المدونة ومن نحن وتواصل معنا والأسئلة الشائعة والوظائف وتتبع الطلب بعد كل روابط التسوق." },
          business: { summary: "القائمة الرئيسية طويلة، أو تعرض صفحات مثل المدونة ومن نحن قبل المنتجات.", detail: "العميل يتصفح القائمة ليجد تصنيفًا. القائمة الطويلة أو صفحات المعلومات في أولها تبطئ بحثه وترسل بعض العملاء إلى صفحات لا تبيع." },
          step: "اختصر القائمة العلوية إلى 6 روابط أو أقل بجمع التصنيفات تحت بند رئيسي، وانقل المدونة ومن نحن وتواصل معنا والأسئلة الشائعة إلى آخر القائمة أو إلى التذييل.",
          doneWhen: "قائمة رأس الصفحة على سطح المكتب فيها 6 روابط أو أقل، وروابط المدونة ومن نحن وتواصل معنا والأسئلة الشائعة والوظائف وتتبع الطلب كلها بعد روابط التسوق.",
        },
      },
      store_owner: {
        fail: { business: { summary: "القائمة في متجرك طويلة، أو تعرض صفحات مثل المدونة ومن نحن قبل منتجاتك.", detail: "العميل يشوف القائمة عشان يلقى اللي يبيه. القائمة الطويلة أو صفحات المعلومات في أولها تتعبه قبل ما يوصل لمنتجاتك." } },
      },
      media_buyer: {
        fail: { business: { summary: "المنيو الرئيسي طويل أو بيبدأ بصفحات معلومات، فالزوار المدفوعين اللي بيتصفحوا بياخدوا وقت أطول عشان يوصلوا للمنتجات.", detail: "اللي مبيشتريش من صفحة الهبوط بيروح للمنيو بعدها. المنيو الزحمة بيخسّر جزء منهم، وده بيخلّي الـ CVR أقل على نفس الترافيك. صاحب المتجر أو المطوّر هو اللي يصلّحه." } },
      },
      agency: {
        fail: { business: { summary: "القائمة الرئيسية في المتجر طويلة، أو تعرض صفحات مثل المدونة ومن نحن قبل المنتجات.", detail: "العميل يتصفح القائمة ليجد تصنيفًا، والقائمة الطويلة أو صفحات المعلومات في أولها تبطئ بحثه وترسل بعض العملاء إلى صفحات لا تبيع." } },
      },
    },
  },

  // visit.ts nav04: home page header only; phone must show search without the menu, desktop too when it was checked.
  "NAV-04": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Read on the home page header: a search box or icon counts when it is visible without opening the menu." },
          business: { summary: "Shoppers can search your store straight from the header.", detail: "People who already know what they want type it and reach the product in one step." },
          protect: "Keep the search icon in the header when changing themes or header apps.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Read on the home page header on a 390px phone and on desktop. Search counts only when its box or icon is visible without opening the menu." },
          business: { summary: "Search is missing from the header, or hidden behind the menu.", detail: "Shoppers who know what they want look for search first. When they can't see it, many scroll for a while and give up before finding the product." },
          step: "Turn on the search icon in the header in your theme settings, for both the phone and desktop header, outside the menu.",
          doneWhen: "On the home page, a search box or icon shows in the header without opening the menu, on a phone and on desktop.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Shoppers can't see a search button at the top of your store.", detail: "People who know what they want look for search first. If they can't find it, many give up before they reach the product." } },
      },
      media_buyer: {
        fail: { business: { summary: "The store hides search, so paid visitors who want a different product than the ad showed struggle to find it.", detail: "Visitors who search tend to convert better. Hiding search loses some of them, which keeps CVR down and CPA up on the same spend. The owner turns it on in the theme settings." } },
      },
      agency: {
        pass: { business: { summary: "Shoppers can search the store straight from the header.", detail: "People who already know what they want type it and reach the product in one step." } },
        fail: { business: { summary: "Search is missing from the store's header, or hidden behind the menu.", detail: "Shoppers who know what they want look for search first. When they can't see it, many give up before finding the product." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "البحث ظاهر في رأس الصفحة.", detail: "فحصنا رأس الصفحة الرئيسية: يُحتسب مربع البحث أو أيقونته إذا ظهر بدون فتح القائمة." },
          business: { summary: "يستطيع العملاء البحث في المتجر مباشرة من رأس الصفحة.", detail: "من يعرف ما يريده يكتبه ويصل إلى المنتج بخطوة واحدة." },
          protect: "أبقِ أيقونة البحث في رأس الصفحة عند تغيير القالب أو تطبيقات الرأس.",
        },
        fail: {
          technical: { summary: "البحث غير ظاهر في رأس الصفحة، أو مخفي داخل القائمة.", detail: "فحصنا رأس الصفحة الرئيسية على جوال بعرض 390px وعلى سطح المكتب. لا يُحتسب البحث إلا إذا ظهر مربعه أو أيقونته بدون فتح القائمة." },
          business: { summary: "البحث غير موجود في رأس الصفحة، أو مخفي خلف القائمة.", detail: "العميل الذي يعرف ما يريده يبحث عن البحث أولًا. وحين لا يجده يتصفح قليلًا ثم يستسلم قبل الوصول إلى المنتج." },
          step: "فعّل أيقونة البحث في رأس الصفحة من إعدادات القالب، للجوال وسطح المكتب، خارج القائمة.",
          doneWhen: "في الصفحة الرئيسية، يظهر مربع البحث أو أيقونته في رأس الصفحة بدون فتح القائمة، على الجوال وعلى سطح المكتب.",
        },
      },
      store_owner: {
        fail: { business: { summary: "العميل ما يشوف زر البحث فوق في متجرك.", detail: "اللي يعرف وش يبي يدور على البحث أول شي. وإذا ما لقاه، كثير منهم يتركون قبل ما يوصلون للمنتج." } },
      },
      media_buyer: {
        fail: { business: { summary: "البحث مستخبي، فالزائر المدفوع اللي عايز منتج غير اللي في الإعلان بيتعب عشان يلاقيه.", detail: "اللي بيستخدموا البحث غالبًا بيتحوّلوا أكتر. إخفاء البحث بيخسّر جزء منهم، فالـ CVR بيقل والـ CPA بيعلى على نفس الصرف. صاحب المتجر يفعّله من إعدادات الثيم." } },
      },
      agency: {
        fail: { business: { summary: "البحث غير موجود في رأس صفحة المتجر، أو مخفي خلف القائمة.", detail: "العميل الذي يعرف ما يريده يبحث عن البحث أولًا، وحين لا يجده يستسلم كثيرون قبل الوصول إلى المنتج." } },
      },
    },
  },

  // facts.ts nav05: icon in the header of home/collection/product/cart; after our add, the count on the cart page is 1+ and it opens the cart.
  "NAV-05": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "After our add to cart, the header icon showed {count} and opens the cart." },
          business: { summary: "The cart icon is always in the header and shows what's inside.", detail: "Shoppers see their item count and get back to the cart in one tap from any page." },
          protect: "Add a product and check the count on the cart icon after any theme or cart app change.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "We look for a cart icon in the header of the home, collection, product and cart pages, then add a product and read the count on the icon. It fails when a page has no icon, or the count reads 0 after adding." },
          business: { summary: "The cart icon is missing from some pages, or doesn't show the items added.", detail: "Shoppers who can't see their cart, or think it is empty, lose track of what they picked. Some leave with items still in the cart." },
          step: "Turn on the cart icon with an item count in the header in your theme settings, and check it updates after adding a product.",
          doneWhen: "The header shows a cart icon on the home, collection, product and cart pages, and after adding a product it shows a count of 1 or more.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The cart icon is missing on some pages of your store, or doesn't show what the shopper added.", detail: "If shoppers can't see their cart, or it looks empty, they lose track of what they picked. Some leave without paying for items already in it." } },
      },
      media_buyer: {
        fail: { business: { summary: "The store's cart icon is missing or shows no count after adding, so paid shoppers lose track of their cart.", detail: "Shoppers who added but can't find the cart again don't check out, which lowers CVR and raises CPA. The owner fixes it in the theme settings." } },
      },
      agency: {
        pass: { business: { summary: "The store's cart icon is always in the header and shows what's inside.", detail: "Shoppers see their item count and get back to the cart in one tap from any page." } },
        fail: { business: { summary: "The store's cart icon is missing from some pages, or doesn't show the items added.", detail: "Shoppers who can't see their cart, or think it is empty, lose track of what they picked. Some leave with items still in the cart." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "أيقونة السلة ظاهرة في رأس الصفحة وتعرض عدد المنتجات بعد الإضافة.", detail: "بعد إضافتنا للسلة، عرضت الأيقونة {count} وتفتح السلة." },
          business: { summary: "أيقونة السلة موجودة دائمًا في رأس الصفحة وتعرض ما بداخلها.", detail: "يرى العميل عدد منتجاته ويعود إلى السلة بنقرة من أي صفحة." },
          protect: "أضف منتجًا وتأكد من العدد على أيقونة السلة بعد أي تغيير في القالب أو تطبيقات السلة.",
        },
        fail: {
          technical: { summary: "أيقونة السلة غير موجودة في رأس بعض الصفحات، أو لا تعرض عددًا بعد الإضافة.", detail: "نبحث عن أيقونة السلة في رأس الصفحة الرئيسية والتصنيف والمنتج والسلة، ثم نضيف منتجًا ونقرأ العدد على الأيقونة. يفشل الفحص إذا غابت الأيقونة عن صفحة، أو ظهر العدد 0 بعد الإضافة." },
          business: { summary: "أيقونة السلة غائبة عن بعض الصفحات، أو لا تعرض المنتجات المضافة.", detail: "العميل الذي لا يرى سلته، أو يظنها فارغة، يفقد أثر ما اختاره. وبعضهم يغادر والمنتجات ما زالت في السلة." },
          step: "فعّل أيقونة السلة مع عدد المنتجات في رأس الصفحة من إعدادات القالب، وتأكد أنها تتحدث بعد إضافة منتج.",
          doneWhen: "يعرض رأس الصفحة أيقونة السلة في الرئيسية والتصنيف والمنتج والسلة، وبعد إضافة منتج تعرض عددًا 1 أو أكثر.",
        },
      },
      store_owner: {
        fail: { business: { summary: "أيقونة السلة مو موجودة في بعض صفحات متجرك، أو ما تبين اللي أضافه العميل.", detail: "إذا العميل ما شاف سلته أو حسبها فاضية، يضيع عليه اللي اختاره. وبعضهم يطلع بدون ما يدفع والمنتجات في السلة." } },
      },
      media_buyer: {
        fail: { business: { summary: "أيقونة السلة مش موجودة أو مش بتعرض عدد بعد الإضافة، فالعميل المدفوع بيتوه عن سلته.", detail: "اللي ضاف للسلة ومش لاقيها تاني مبيكملش الـ checkout، وده بيقلل الـ CVR ويرفع الـ CPA. صاحب المتجر يصلّحها من إعدادات الثيم." } },
      },
      agency: {
        fail: { business: { summary: "أيقونة السلة في المتجر غائبة عن بعض الصفحات، أو لا تعرض المنتجات المضافة.", detail: "العميل الذي لا يرى سلته، أو يظنها فارغة، يفقد أثر ما اختاره، وبعضهم يغادر والمنتجات ما زالت في السلة." } },
      },
    },
  },

  // facts.ts nav06: home page on phone; pass only when the switch is visible in the header, fail when only in the footer or page body.
  "NAV-06": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Read on the home page on a 390px phone screen: the language switch shows in the header without opening the menu." },
          business: { summary: "Shoppers can switch language from the top of the page.", detail: "Visitors who land in the wrong language change it in one tap and keep shopping." },
          protect: "Keep the language switch in the phone header when changing themes or header apps.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Read on the home page on a 390px phone screen. The switch passes when it is visible in the header; here it sits only in the footer or the page body." },
          business: { summary: "The language switch is hidden down the page, outside the header.", detail: "A visitor who lands in a language they don't read won't scroll down the page to change it. Most of them leave before they find it." },
          step: "Move the language switch into the phone header, next to the cart or menu icon, in your theme settings.",
          doneWhen: "On the home page on a phone, the language switch shows in the header.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The language button in your store is hidden down the page, outside the header.", detail: "A shopper who lands on the language they don't read won't scroll down to find it. Most of them leave your store instead." } },
      },
      media_buyer: {
        fail: { business: { summary: "The store's language switch sits outside the header, so paid visitors who land in the wrong language struggle to change it.", detail: "Clicks from Arabic or English audiences that land in the other language mostly bounce. That lowers CVR and raises CPA on those campaigns. The owner moves the switch to the header." } },
      },
      agency: {
        pass: { business: { summary: "Shoppers can switch the store's language from the top of the page.", detail: "Visitors who land in the wrong language change it in one tap and keep shopping." } },
        fail: { business: { summary: "The store's language switch is hidden down the page, outside the header.", detail: "A visitor who lands in a language they don't read won't scroll down the page to change it. Most of them leave before they find it." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "زر تغيير اللغة ظاهر في رأس الصفحة على الجوال.", detail: "فحصنا الصفحة الرئيسية على شاشة جوال بعرض 390px: زر اللغة ظاهر في رأس الصفحة بدون فتح القائمة." },
          business: { summary: "يستطيع العملاء تغيير اللغة من أعلى الصفحة.", detail: "الزائر الذي يصل بلغة غير لغته يغيرها بنقرة ويكمل التسوق." },
          protect: "أبقِ زر اللغة في رأس الصفحة على الجوال عند تغيير القالب أو تطبيقات الرأس.",
        },
        fail: {
          technical: { summary: "زر تغيير اللغة موجود فقط في التذييل أو في جسم الصفحة.", detail: "فحصنا الصفحة الرئيسية على شاشة جوال بعرض 390px. ينجح الفحص إذا ظهر الزر في رأس الصفحة، وهنا وُجد فقط في التذييل أو جسم الصفحة." },
          business: { summary: "زر تغيير اللغة مخفي في مكان أسفل من الصفحة خارج رأسها.", detail: "الزائر الذي يصل بلغة لا يقرؤها لن يمرر في الصفحة بحثًا عنه. وأغلبهم يغادرون قبل أن يجدوه." },
          step: "انقل زر اللغة إلى رأس الصفحة على الجوال، بجانب أيقونة السلة أو القائمة، من إعدادات القالب.",
          doneWhen: "في الصفحة الرئيسية على الجوال، يظهر زر تغيير اللغة في رأس الصفحة.",
        },
      },
      store_owner: {
        fail: { business: { summary: "زر تغيير اللغة في متجرك مخفي تحت في الصفحة مو فوق.", detail: "العميل اللي يدخل بلغة ما يقراها ما راح ينزل في الصفحة يدوره. أغلبهم يطلعون من متجرك على طول." } },
      },
      media_buyer: {
        fail: { business: { summary: "زرار اللغة مش في الهيدر، فالزائر المدفوع اللي داخل على اللغة الغلط بيتعب عشان يغيّرها.", detail: "الكليكات من جمهور عربي أو إنجليزي اللي بتوصل على اللغة التانية أغلبها بيعمل bounce، فالـ CVR بيقل والـ CPA بيعلى في الحملات دي. صاحب المتجر ينقل الزرار للهيدر." } },
      },
      agency: {
        fail: { business: { summary: "زر تغيير اللغة في المتجر مخفي في مكان أسفل من الصفحة خارج رأسها.", detail: "الزائر الذي يصل بلغة لا يقرؤها لن يمرر في الصفحة بحثًا عنه، وأغلبهم يغادرون قبل أن يجدوه." } },
      },
    },
  },

  // facts.ts nav07: home page footer, 3+ links; needs phone, WhatsApp or email, plus shipping, returns, privacy and terms links.
  "NAV-07": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "Read on the home page footer. Policy links found: {links}, with a phone number, WhatsApp link or email for contact." },
          business: { summary: "Your footer shows how to reach you and links to your policies.", detail: "Shoppers who check delivery, returns or who runs the store before paying find it at the bottom of any page." },
          protect: "Keep the footer links pointing to live policy pages when you rename or rewrite them.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Read on the home page footer. It needs a phone number, WhatsApp link or email, and links to shipping, returns, privacy and terms pages." },
          business: { summary: "Your footer is missing contact details or some policy links.", detail: "Many first-time shoppers scroll to the footer to check delivery, returns and who runs the store before they pay. When it isn't there, some of them don't buy." },
          step: "Add a phone number, WhatsApp link or email to the footer, and links to your shipping, returns, privacy and terms pages. Create any page that doesn't exist yet.",
          doneWhen: "The home page footer shows a phone number, WhatsApp link or email, and links to shipping, returns, privacy and terms pages.",
        },
      },
      store_owner: {
        fail: { business: { summary: "The bottom of your store is missing your contact details or some policy pages.", detail: "New shoppers scroll down to check delivery, returns and who you are before they pay. If they can't find it, some of them don't order." } },
      },
      media_buyer: {
        fail: { business: { summary: "The store's footer lacks contact details or policy links, so cold paid shoppers find less to trust.", detail: "First-time visitors from ads check the footer before paying, and a missing policy page loses some of them: CVR down, CPA up. Ad and Merchant Center reviews also look for these pages. The owner adds them." } },
      },
      agency: {
        pass: { business: { summary: "The store's footer shows how to reach it and links to its policies.", detail: "Shoppers who check delivery, returns or who runs the store before paying find it at the bottom of any page." } },
        fail: { business: { summary: "The store's footer is missing contact details or some policy links.", detail: "Many first-time shoppers scroll to the footer to check delivery, returns and who runs the store before they pay. When it isn't there, some of them don't buy." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "التذييل فيه وسيلة تواصل وروابط سياسات التوصيل والاسترجاع والخصوصية والشروط.", detail: "فحصنا تذييل الصفحة الرئيسية: فيه رقم هاتف أو رابط واتساب أو بريد إلكتروني، وروابط السياسات كلها." },
          business: { summary: "التذييل يعرض طريقة التواصل وروابط السياسات.", detail: "العميل الذي يتحقق من التوصيل أو الاسترجاع أو هوية المتجر قبل الدفع يجدها أسفل أي صفحة." },
          protect: "أبقِ روابط التذييل تشير إلى صفحات سياسات قائمة عند تغيير أسمائها أو إعادة كتابتها.",
        },
        fail: {
          technical: { summary: "التذييل ينقصه وسيلة تواصل أو بعض روابط السياسات.", detail: "فحصنا تذييل الصفحة الرئيسية. المطلوب رقم هاتف أو رابط واتساب أو بريد إلكتروني، وروابط لصفحات التوصيل والاسترجاع والخصوصية والشروط." },
          business: { summary: "التذييل ينقصه بيانات التواصل أو بعض روابط السياسات.", detail: "كثير من العملاء الجدد ينزلون إلى التذييل ليتحققوا من التوصيل والاسترجاع وهوية المتجر قبل الدفع. وحين لا يجدونها لا يشتري بعضهم." },
          step: "أضف إلى التذييل رقم هاتف أو رابط واتساب أو بريدًا إلكترونيًا، وروابط لصفحات التوصيل والاسترجاع والخصوصية والشروط. أنشئ أي صفحة غير موجودة.",
          doneWhen: "تذييل الصفحة الرئيسية يعرض رقم هاتف أو رابط واتساب أو بريدًا إلكترونيًا، وروابط لصفحات التوصيل والاسترجاع والخصوصية والشروط.",
        },
      },
      store_owner: {
        fail: { business: { summary: "أسفل متجرك ناقص بيانات التواصل أو بعض صفحات السياسات.", detail: "العميل الجديد ينزل تحت يتأكد من التوصيل والاسترجاع ومن أنتم قبل ما يدفع. وإذا ما لقاها، بعضهم ما يطلب." } },
      },
      media_buyer: {
        fail: { business: { summary: "الفوتر ناقص بيانات تواصل أو روابط سياسات، فالعميل المدفوع الجديد بيلاقي حاجات أقل يثق فيها.", detail: "الزائر الجديد من الإعلان بيبص على الفوتر قبل ما يدفع، وغياب صفحة سياسة بيخسّر جزء منهم: الـ CVR بيقل والـ CPA بيعلى. ومراجعات الإعلانات و Merchant Center بتدور على الصفحات دي برضه. صاحب المتجر يضيفها." } },
      },
      agency: {
        fail: { business: { summary: "تذييل المتجر ينقصه بيانات التواصل أو بعض روابط السياسات.", detail: "كثير من العملاء الجدد ينزلون إلى التذييل ليتحققوا من التوصيل والاسترجاع وهوية المتجر قبل الدفع، وحين لا يجدونها لا يشتري بعضهم." } },
      },
    },
  },

  "NAV-10": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "No overlay covering 30% or more of the phone screen appeared on the home page in the first seconds (cookie banners are judged separately)." },
          business: { summary: "Nothing gets in the way when a shopper arrives.", detail: "Visitors see your offer and products straight away instead of a popup to close." },
          protect: "Show signup or discount popups after a shopper scrolls or spends time, not on arrival.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "Overlays on arrival: {popups}." },
          business: { summary: "A popup covers the screen the moment a shopper arrives.", detail: "The first thing a visitor sees is something to close, not your products. Many phone visitors leave at that point, especially ones coming from an ad." },
          step: "Delay the popup until the shopper scrolls or has been on the page for a while, and make it easy to close with one tap.",
          doneWhen: "Opening the home page on a phone shows the page itself first, with no overlay covering it.",
        },
      },
      media_buyer: {
        fail: { business: { summary: "Paid visitors hit a full-screen popup on arrival, so part of every click bounces before seeing the offer.", detail: "Ad traffic is the least patient: an overlay on arrival lowers CVR and raises CPA on the same spend. Ask the owner to delay it or show it only to returning visitors." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "لا توجد نافذة منبثقة تغطي الشاشة عند وصول الزائر.", detail: "لم تظهر نافذة تغطي 30% أو أكثر من شاشة الجوال في الصفحة الرئيسية خلال الثواني الأولى." },
          business: { summary: "لا شيء يعترض العميل عند وصوله.", detail: "الزائر يرى عرضك ومنتجاتك مباشرة بدل نافذة يجب إغلاقها." },
          protect: "اعرض نوافذ التسجيل أو الخصم بعد تمرير العميل أو بقائه فترة، لا عند الوصول.",
        },
        fail: {
          technical: { summary: "نافذة منبثقة تغطي شاشة الجوال عند الوصول.", detail: "{popups}" },
          business: { summary: "نافذة منبثقة تغطي الشاشة لحظة وصول العميل.", detail: "أول ما يراه الزائر شيء يجب إغلاقه وليس منتجاتك. كثير من زوار الجوال يغادرون عند هذه النقطة، خاصة القادمين من إعلان." },
          step: "أخّر النافذة حتى يمرر العميل أو يبقى في الصفحة قليلًا، واجعل إغلاقها سهلًا بضغطة واحدة.",
          doneWhen: "فتح الصفحة الرئيسية على الجوال يعرض الصفحة نفسها أولًا بدون نافذة تغطيها.",
        },
      },
      store_owner: {
        fail: { business: { summary: "فيه نافذة تطلع وتغطي الشاشة أول ما يدخل العميل متجرك.", detail: "أول شي يشوفه العميل شي لازم يسكره مو منتجاتك، وكثير من زوار الجوال يطلعون من هنا." } },
      },
      media_buyer: {
        fail: { business: { summary: "الزوار المدفوعين بيقابلوا popup مغطي الشاشة أول ما يدخلوا، فجزء من كل كليك بيعمل bounce.", detail: "ترافيك الإعلانات أقل صبر: أي overlay أول ما يدخل بيقلل الـ CVR ويرفع الـ CPA على نفس الصرف. اطلب من صاحب المتجر يأخّره أو يعرضه للزوار الراجعين بس." } },
      },
    },
  },
};
