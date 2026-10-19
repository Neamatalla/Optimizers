import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  ownerDomain,
  emailMatchesWebsite,
  ga4StreamUrlMatches,
  gtmContainerDomainMatches,
  gtmSiteTagMatches,
  ga4SiteTagMatches,
  verifyOwnership,
} from "../../api/_lib/ownership-verification.js";
import { offlineAndQuiet, mockFetch } from "./helpers.js";

offlineAndQuiet();

const ga4 = { measurementId: "G-ABC1234", dataStreams: [{ webStreamData: { defaultUri: "https://www.brand.com" } }] };
const gtm = { publicId: "GTM-XYZ9", domainName: ["brand.com"], discoveredGa4MeasurementIds: ["G-ABC1234"] };

describe("ownerDomain", () => {
  test("collapses subdomains to the part one owner controls", () => {
    assert.equal(ownerDomain("shop.brand.com.sa"), "brand.com.sa");
    assert.equal(ownerDomain("https://www.brand.com/path"), "brand.com");
  });

  test("store-builder subdomains stay whole", () => {
    assert.equal(ownerDomain("mystore.myshopify.com"), "mystore.myshopify.com");
    assert.equal(ownerDomain("mystore.salla.sa"), "mystore.salla.sa");
    assert.equal(ownerDomain("salla.sa"), "");
  });

  test("nothing for IPs or empty input", () => {
    assert.equal(ownerDomain("192.168.1.1"), "");
    assert.equal(ownerDomain(""), "");
  });
});

describe("single checks", () => {
  test("email domain", () => {
    assert.equal(emailMatchesWebsite("omar@brand.com", "shop.brand.com"), true);
    assert.equal(emailMatchesWebsite("omar@gmail.com", "brand.com"), false);
    assert.equal(emailMatchesWebsite("a@one.myshopify.com", "two.myshopify.com"), false);
  });

  test("GA4 stream URL", () => {
    assert.equal(ga4StreamUrlMatches(ga4, "brand.com"), true);
    assert.equal(ga4StreamUrlMatches(ga4, "other.com"), false);
    assert.equal(ga4StreamUrlMatches({ dataStreams: "bad" }, "brand.com"), false);
    assert.equal(ga4StreamUrlMatches(null, "brand.com"), false);
  });

  test("GTM container domain", () => {
    assert.equal(gtmContainerDomainMatches(gtm, "brand.com"), true);
    assert.equal(gtmContainerDomainMatches(gtm, "other.com"), false);
    assert.equal(gtmContainerDomainMatches([gtm], "brand.com"), false);
  });

  test("GTM tag live on the site", () => {
    assert.equal(gtmSiteTagMatches(gtm, { gtmContainerIds: ["gtm-xyz9"] }), true);
    assert.equal(gtmSiteTagMatches(gtm, { gtmContainerIds: [] }), false);
    assert.equal(gtmSiteTagMatches(gtm, null), false);
  });

  test("GA4 tag live in the HTML", () => {
    assert.equal(ga4SiteTagMatches(ga4, null, { ga4MeasurementIds: ["G-ABC1234"] }, "brand.com"), true);
    assert.equal(ga4SiteTagMatches(ga4, null, { ga4MeasurementIds: [] }, "brand.com"), false);
  });

  test("GA4 tag live through a GTM container that is itself on the site", () => {
    assert.equal(ga4SiteTagMatches(ga4, gtm, { ga4MeasurementIds: [], gtmContainerIds: [] }, "brand.com"), true);
    const unrelatedGtm = { ...gtm, domainName: ["other.com"] };
    assert.equal(ga4SiteTagMatches(ga4, unrelatedGtm, { ga4MeasurementIds: [], gtmContainerIds: [] }, "brand.com"), false);
  });
});

describe("verifyOwnership", () => {
  test("without Google data, only the email is checked and the site is not fetched", async () => {
    const result = await verifyOwnership({ email: "omar@brand.com", website: "https://brand.com", websiteHostname: "brand.com" });
    assert.deepEqual(result, ["email_domain"]);
    assert.equal(globalThis.fetch.mock.callCount(), 0);
  });

  test("with Google data, every passing check is listed in a fixed order", async () => {
    mockFetch(() => new Response(
      '<script src="https://www.googletagmanager.com/gtag/js?id=G-ABC1234"></script><script src="https://www.googletagmanager.com/gtm.js?id=GTM-XYZ9"></script>',
    ));
    const result = await verifyOwnership({ email: "omar@brand.com", website: "https://brand.com", websiteHostname: "brand.com", ga4OAuthData: ga4, gtmOAuthData: gtm });
    assert.deepEqual(result, ["email_domain", "ga4_stream_url", "ga4_site_tag", "gtm_container_domain", "gtm_site_tag"]);
  });

  test("a failed site scan only drops the site-tag checks", async () => {
    const result = await verifyOwnership({ email: "omar@gmail.com", website: "https://brand.com", websiteHostname: "brand.com", ga4OAuthData: ga4 });
    assert.deepEqual(result, ["ga4_stream_url"]);
  });
});
