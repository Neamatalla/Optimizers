import type { PointTemplate } from "./types.js";

export const HOMEPAGE: Record<string, PointTemplate> = {
  // collect.ts home05: first grid of 4+ cards must start above 1688px (2 x 844px), every card with image, name and price;
  // if the store has reviews, fails only when no card shows a rating.
  "HOME-05": {
    en: {
      default: {
        pass: {
          technical: { summary: "{reason}", detail: "The first home grid of {cards} product cards starts {firstGridTop}px down, inside the 1688px limit (2 phone screens of 844px)." },
          business: { summary: "Your products show early on the home page, with photo, name and price.", detail: "Shoppers who land on the home page reach products within two scrolls and can judge them at a glance." },
          protect: "Keep a product grid in the top two screens when adding new banners or sections to the home page.",
        },
        fail: {
          technical: { summary: "{reason}", detail: "First home grid: {cards} cards starting {firstGridTop}px down, against a 1688px limit (2 phone screens of 844px). Cards with an image: {withImage}, a name: {withName}, a price: {withPrice}, a rating: {withRating}." },
          business: { summary: "Products show too far down the home page, or their cards miss a photo, name, price or rating.", detail: "Many shoppers who land on the home page never scroll past the banners. If products sit low, or the cards don't show the basics, fewer of them open a product." },
          step: "Move a best-seller grid into the first two phone screens of the home page, above extra banners. Make every card show a photo, name and price, and turn on star ratings on cards if the store has reviews.",
          doneWhen: "On a phone, the home page shows a grid of 4 or more product cards starting within the first 1688px, every card shows an image, name and price, and if the store has reviews, at least one card shows a rating.",
        },
      },
      store_owner: {
        fail: { business: { summary: "Your products show too far down the home page, or their cards miss a photo, name, price or rating.", detail: "Many visitors never scroll past the banners on your home page. If they don't see products with prices early, fewer of them open one and buy." } },
      },
      media_buyer: {
        fail: { business: { summary: "Products sit low on the home page or their cards lack basics, so paid traffic sent to home reaches fewer products.", detail: "Clicks landing on home have to find a product before they can convert. Burying the grid lowers CVR and raises CPA for any campaign that lands there. The owner reorders the home page." } },
      },
      agency: {
        pass: { business: { summary: "The store's products show early on the home page, with photo, name and price.", detail: "Shoppers who land on the home page reach products within two scrolls and can judge them at a glance." } },
        fail: { business: { summary: "Products show too far down the store's home page, or their cards miss a photo, name, price or rating.", detail: "Many shoppers who land on the home page never scroll past the banners. If products sit low, or the cards don't show the basics, fewer of them open a product." } },
      },
    },
    ar: {
      default: {
        pass: {
          technical: { summary: "شبكة منتجات تبدأ ضمن أول شاشتين من الصفحة الرئيسية على الجوال، وكل البطاقات فيها صورة واسم وسعر.", detail: "أول شبكة في الرئيسية فيها {cards} بطاقة وتبدأ على بعد {firstGridTop}px، ضمن الحد 1688px (شاشتا جوال بارتفاع 844px)." },
          business: { summary: "المنتجات تظهر مبكرًا في الصفحة الرئيسية بصورتها واسمها وسعرها.", detail: "من يصل إلى الرئيسية يرى المنتجات خلال تمريرتين ويقيّمها بنظرة." },
          protect: "أبقِ شبكة منتجات ضمن أول شاشتين عند إضافة بانرات أو أقسام جديدة إلى الرئيسية.",
        },
        fail: {
          technical: { summary: "شبكة المنتجات في الرئيسية تبدأ بعد أول شاشتين على الجوال، أو بطاقاتها ينقصها صورة أو اسم أو سعر أو تقييم.", detail: "أول شبكة: {cards} بطاقة تبدأ على بعد {firstGridTop}px، والحد 1688px (شاشتا جوال بارتفاع 844px). بطاقات بصورة: {withImage}، باسم: {withName}، بسعر: {withPrice}، بتقييم: {withRating}." },
          business: { summary: "المنتجات تظهر في مكان منخفض من الرئيسية، أو بطاقاتها ينقصها صورة أو اسم أو سعر أو تقييم.", detail: "كثير ممن يصلون إلى الرئيسية لا يمررون بعد البانرات. وإذا كانت المنتجات منخفضة أو البطاقات ناقصة، يفتح عدد أقل منهم صفحة منتج." },
          step: "انقل شبكة الأكثر مبيعًا إلى أول شاشتين من الرئيسية على الجوال، فوق البانرات الإضافية. اجعل كل بطاقة تعرض صورة واسمًا وسعرًا، وفعّل التقييمات على البطاقات إذا كان للمتجر تقييمات.",
          doneWhen: "على الجوال، تعرض الرئيسية شبكة من 4 بطاقات منتجات أو أكثر تبدأ ضمن أول 1688px، وكل بطاقة فيها صورة واسم وسعر، وإذا كان للمتجر تقييمات يظهر التقييم على بطاقة واحدة على الأقل.",
        },
      },
      store_owner: {
        fail: { business: { summary: "منتجاتك تطلع تحت واجد في الصفحة الرئيسية، أو بطاقاتها ناقصة صورة أو اسم أو سعر أو تقييم.", detail: "كثير من الزوار ما ينزلون بعد البانرات في متجرك. وإذا ما شافوا منتجات بأسعارها بدري، قليل منهم يفتح منتج ويشتري." } },
      },
      media_buyer: {
        fail: { business: { summary: "المنتجات واطية في الهوم بيج أو بطاقاتها ناقصة، فالترافيك المدفوع اللي رايح للهوم بيوصل لمنتجات أقل.", detail: "الكليك اللي بيهبط على الهوم لازم يلاقي منتج الأول عشان يتحوّل. دفن الشبكة تحت بيقلل الـ CVR ويرفع الـ CPA لأي حملة بتهبط هناك. صاحب المتجر يرتّب الصفحة الرئيسية." } },
      },
      agency: {
        fail: { business: { summary: "المنتجات تظهر في مكان منخفض من رئيسية المتجر، أو بطاقاتها ينقصها صورة أو اسم أو سعر أو تقييم.", detail: "كثير ممن يصلون إلى الرئيسية لا يمررون بعد البانرات، وإذا كانت المنتجات منخفضة أو البطاقات ناقصة يفتح عدد أقل منهم صفحة منتج." } },
      },
    },
  },
};
