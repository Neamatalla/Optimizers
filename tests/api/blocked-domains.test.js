import { test } from "node:test";
import assert from "node:assert/strict";
import { isBlockedAuditDomain } from "../../api/_lib/blocked-domains.js";

test("big platforms are blocked, with or without www", () => {
  for (const host of ["google.com", "www.amazon.ae", "noon.com", "LinkedIn.com"]) {
    assert.equal(isBlockedAuditDomain(host), true, host);
  }
});

test("subdomains of big platforms are blocked too", () => {
  assert.equal(isBlockedAuditDomain("sites.google.com"), true);
  assert.equal(isBlockedAuditDomain("shop.tiktok.com"), true);
});

test("store builders are blocked only on their own domain", () => {
  assert.equal(isBlockedAuditDomain("shopify.com"), true);
  assert.equal(isBlockedAuditDomain("salla.sa"), true);
  assert.equal(isBlockedAuditDomain("mystore.myshopify.com"), false);
  assert.equal(isBlockedAuditDomain("mystore.salla.sa"), false);
});

test("look-alike domains are not blocked", () => {
  assert.equal(isBlockedAuditDomain("notgoogle.com"), false);
  assert.equal(isBlockedAuditDomain("google.com.mystore.sa"), false);
});

test("normal stores are not blocked", () => {
  assert.equal(isBlockedAuditDomain("tharaa.shop"), false);
  assert.equal(isBlockedAuditDomain(""), false);
});
