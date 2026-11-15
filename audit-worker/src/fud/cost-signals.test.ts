import { test } from "node:test";
import assert from "node:assert/strict";
import { costSignals } from "./cost-signals.js";

const page = (pageType: string, texts: string[], widgets: string[] = []) =>
  ({ pageType, url: "https://x.sa", loaded: true, blocks: texts.map((text, i) => ({ id: `p${i}`, text, tag: "p" })), widgets }) as never;

test("finds Saudi payment methods on product, cart and checkout", () => {
  const s = costSignals({ pages: [
    page("product", ["قسّمها على 4 دفعات مع تابي", "Apple Pay"]),
    page("cart", ["الدفع عند الاستلام متاح"]),
    page("checkout", ["بطاقة مدى", "STC Pay"]),
  ] });
  assert.deepEqual(s.methods, { mada: true, applePay: true, stcPay: true, tabby: true, cod: true });
  assert.deepEqual(s.pages, ["product", "cart", "checkout"]);
});

test("does not read 'مدى' inside other words as mada", () => {
  const s = costSignals({ pages: [page("product", ["على المدى الطويل"])] });
  assert.equal(s.methods.mada, undefined);
});

test("delivery fee, COD fee, VAT and threshold before checkout", () => {
  const s = costSignals({ pages: [
    page("product", ["السعر شامل الضريبة", "التوصيل خلال 2-3 أيام", "شحن مجاني للطلبات فوق 600 ر.س"]),
    page("cart", ["رسوم الدفع عند الاستلام 15 ر.س"]),
  ] });
  assert.equal(s.vatIncluded, true);
  assert.equal(s.codFee, true);
  assert.equal(s.deliveryFee, true);
  assert.equal(s.freeThreshold, 600);
  assert.ok(s.deliveryPromise);
});

test("null, never guessed, when product and cart were not visited", () => {
  const s = costSignals({ pages: [page("checkout", ["Tamara"])] });
  assert.equal(s.deliveryFee, null);
  assert.equal(s.vatIncluded, null);
  assert.equal(s.codFee, null);
  assert.equal(s.methods.tamara, true);
});
