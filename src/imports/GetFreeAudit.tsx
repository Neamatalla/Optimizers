"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useLanguage } from "../app/contexts/LanguageContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isBlockedAuditDomain, BLOCKED_DOMAIN_MESSAGE } from "../../api/_lib/blocked-domains.js";

// Kept off until Google's sensitive-scope verification actually clears —
// flipping this on while unverified means every visitor sees Google's
// "unverified app" warning screen mid-consent. Build-time flag (Vite env),
// not runtime-toggleable — flip and redeploy once verification is done.
const OAUTH_ENABLED = import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === "true";

// Test mode: typing a leading "-" on BOTH the website and the email runs
// the real pipeline but delivers differently — the report goes to a separate
// Supabase Storage bucket and is emailed straight to the address in the form,
// with no internal review step and no 2-day delay, and the run is exempt from
// the one-audit-per-site/email limit. The server is the authority on all of
// that (api/_lib/audit-intake.js's parseTestPrefix); everything here just
// keeps the prefix from tripping the format validators, and tells the visitor
// what they've switched on.
const TEST_PREFIX = "-";
const stripTestPrefix = (value: string): string => {
  const trimmed = value.trim();
  return trimmed.startsWith(TEST_PREFIX) ? trimmed.slice(TEST_PREFIX.length).trim() : trimmed;
};
const hasTestPrefix = (value: string): boolean => value.trim().startsWith(TEST_PREFIX);

// --- Validation & Helpers (mirrors src/imports/StrategySession.tsx) ---
const validateWebsite = (url: string): string => {
  if (!url.trim()) return "";
  let urlToValidate = stripTestPrefix(url);
  if (!urlToValidate) return "Please enter a valid website URL";
  if (!urlToValidate.startsWith("http://") && !urlToValidate.startsWith("https://")) {
    urlToValidate = "https://" + urlToValidate;
  }
  try {
    const urlObj = new URL(urlToValidate);
    if (!urlObj.hostname.includes(".")) return "Please enter a valid website URL";
    if (isBlockedAuditDomain(urlObj.hostname)) return BLOCKED_DOMAIN_MESSAGE;
    return "";
  } catch {
    return "Please enter a valid website URL";
  }
};

const validateEmail = (email: string): string => {
  if (!email.trim()) return "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(stripTestPrefix(email))) return "Please enter a valid email address";
  return "";
};

const validateRequired = (value: string, label: string): string => {
  if (!value.trim()) return `${label} is required`;
  return "";
};

const normalizeWebsiteUrl = (url: string): string => {
  const trimmed = stripTestPrefix(url);
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return "https://" + trimmed;
  }
  return trimmed;
};

// --- Tool selection ---
// Hotjar and Clarity aren't offered — no MCP or live-data integration exists
// for either (Clarity's manual-token flow was removed in favor of this
// website-first auto-detect + OAuth property picker; no equivalent path
// exists for it).
type ToolId = "GA4" | "GTM";

const TOOL_OPTIONS: { id: ToolId; label: string; hint: string }[] = [
  { id: "GA4", label: "Google Analytics 4", hint: "GA4 tracking" },
  { id: "GTM", label: "Google Tag Manager", hint: "GTM container" },
];

// Full property/container objects returned by api/oauth/google/callback.js
// (fetchAllGA4Properties / fetchAllGTMContainers) — every one the connected
// account can see, not just a single exact-matched one. The google-access
// step renders these as dropdowns; whichever field's own submission shape
// the worker expects lives alongside the rest (details/dataStreams/etc for
// GA4, liveVersion/etc for GTM) so picking an option needs no second fetch.
interface Ga4DataStream {
  webStreamData?: { measurementId?: string; defaultUri?: string };
  [key: string]: unknown;
}
interface Ga4Property {
  propertyName: string;
  displayName: string;
  measurementId: string;
  dataStreams?: Ga4DataStream[];
  [key: string]: unknown;
}
interface GtmContainer {
  accountId: string;
  containerId: string;
  publicId: string;
  containerName: string;
  // GA4 IDs found inside this container's own tag config server-side (see
  // api/_lib/google-oauth.js) — the fix for a real gap a plain HTML crawl
  // can't cover: a site that deploys GA4 entirely through GTM, with the
  // actual gtag.js snippet injected client-side at runtime, never server-
  // rendered anywhere the JS-free site crawl could see it.
  discoveredGa4MeasurementIds?: string[];
  // Domains the container owner associated with it in GTM itself, when set.
  domainName?: string[];
  [key: string]: unknown;
}

// Unions every connected GTM container's own discovered GA4 IDs — used
// alongside the pre-OAuth site crawl's candidates to decide which GA4
// property gets starred/defaulted. Checked across ALL containers, not just
// whichever one ends up selected, since GA4 is sometimes configured in a
// different container than the one being audited.
function gtmDiscoveredGa4Ids(gtmContainers: GtmContainer[]): string[] {
  const found = new Set<string>();
  for (const container of gtmContainers) {
    for (const id of container.discoveredGa4MeasurementIds ?? []) {
      found.add(id.toUpperCase());
    }
  }
  return Array.from(found);
}

// Bare, lowercase, no "www." hostname — the common form to compare a
// user-entered website against API-returned domain/URI fields that were
// typed independently (some with protocol, some without, some with www).
//
// Strips the test-mode prefix first, same as every other reader of the
// website field. Without that, a test-mode submission produced garbage here
// rather than an error: "-https://www.tharaa.shop" parses as the URL
// "https://-https://www.tharaa.shop", whose hostname is "-https" — which
// silently matches no GA4 data stream and no GTM container domain, so the
// property/container auto-selection quietly fell back to whatever happened
// to be first in an agency account's list.
function normalizeHostname(input: string): string {
  const value = stripTestPrefix(input);
  if (!value) return "";
  try {
    const withProtocol = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
    return new URL(withProtocol).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

// A GA4 property "belongs" to the entered site when one of its own web data
// streams (fetched directly from the Admin API — ground truth, not a guess)
// points at that hostname. Far more precise than the tag-config scan below:
// this is the account owner's own declared site for the property.
function ga4PropertyMatchesDomain(prop: Ga4Property, hostname: string): boolean {
  if (!hostname) return false;
  return (prop.dataStreams ?? []).some(ds => normalizeHostname(ds.webStreamData?.defaultUri ?? "") === hostname);
}

// Same idea for GTM: containers can optionally declare their own domains in
// GTM's UI (Container.domainName via the API). When present, it's a direct
// signal instead of relying only on the live site crawl.
function gtmContainerMatchesDomain(container: GtmContainer, hostname: string): boolean {
  if (!hostname) return false;
  return (container.domainName ?? []).some(d => normalizeHostname(d) === hostname);
}

// Website goes FIRST now, not last: entering the URL triggers a background
// crawl (see handleWebsiteNext below) that prefills the GA4/GTM ID fields on
// the later google-access step from whatever's actually detected on the
// site — so the visitor sees their own IDs already filled in by the time
// they get there, instead of having to go find and paste them.
// Email lives on the website step now, not its own step at the end — asking
// for it before the (OAuth-gated) google-access step means a visitor who
// bails at "Connect Google" has still left a captured lead, instead of the
// highest-friction step gating the lowest-friction one.
type StepKey = "website" | "tools" | "google-access";

function buildSteps(tools: ToolId[]): StepKey[] {
  const steps: StepKey[] = ["website", "tools"];
  // No manual fallback anymore — Connect Google is the only way to grant
  // access, so only show this step when OAuth is actually live. Off, GA4/GTM
  // still get audited, just from public detection instead of live data.
  if (OAUTH_ENABLED && (tools.includes("GA4") || tools.includes("GTM"))) steps.push("google-access");
  return steps;
}

const STEP_LABELS: Record<StepKey, string> = {
  website: "Website & Email",
  tools: "Your Tools",
  "google-access": "Connect Google",
};

// --- UI pieces ---

// Same step-question style as StrategySession.tsx's book-a-call form.
const QUESTION_CLASS =
  "css-4hzbpn font-['Sora:SemiBold',sans-serif] font-semibold leading-[22px] lg:leading-[1.3] text-[16px] lg:text-[2.4vw] text-center tracking-[0px] w-full lg:w-auto text-balance bg-gradient-to-b from-white to-[#c4c4c4] bg-clip-text text-transparent";

function ToolCard({ label, hint, isSelected, onClick, className = "" }: { label: string; hint: string; isSelected: boolean; onClick: () => void; className?: string }) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-row items-center gap-[14px] px-[20px] py-[18px] lg:px-[28px] lg:py-[24px] relative rounded-[12px] lg:rounded-[16px] shrink-0 w-full cursor-pointer transition-all duration-300 ${isSelected ? "scale-[0.97]" : "lg:hover:scale-[1.02]"} ${className}`}
      style={{ background: isSelected ? "linear-gradient(90deg, rgba(0, 255, 90, 0.1) 0%, rgba(0, 255, 90, 0.1) 100%), #777" : "#777" }}
    >
      <div
        className={`flex-shrink-0 w-[22px] h-[22px] rounded-[6px] flex items-center justify-center transition-all duration-200 ${isSelected ? "bg-[#31da72]" : "bg-transparent border-2 border-white/30"}`}
      >
        {isSelected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="#020601" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <p className={`font-['Sora:SemiBold',sans-serif] font-semibold text-[15px] lg:text-[17px] leading-tight truncate transition-colors duration-300 ${isSelected ? "text-[#31da72]" : "text-white"}`}>{label}</p>
        <p className="font-['Sora:Regular',sans-serif] font-normal text-[12px] lg:text-[13px] text-white/70">{hint}</p>
      </div>

      {!isSelected && (
        <>
          <div aria-hidden="true" className="lg:hidden absolute border border-white/40 border-solid inset-0 pointer-events-none rounded-[12px]" />
          <div
            aria-hidden="true"
            className="hidden lg:block absolute inset-0 pointer-events-none rounded-[16px]"
            style={{
              padding: "1px",
              background: "radial-gradient(ellipse 50% 60% at 0% 0%, #4ade80 0%, transparent 100%), radial-gradient(ellipse 50% 60% at 100% 100%, #4ade80 0%, transparent 100%)",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
        </>
      )}
      {isSelected && (
        <>
          <div aria-hidden="true" className="lg:hidden absolute border border-[#31da72] border-solid inset-0 pointer-events-none rounded-[12px]" />
          <div aria-hidden="true" className="hidden lg:block absolute border-2 border-[#31da72] border-solid inset-0 pointer-events-none rounded-[16px]" style={{ boxShadow: "0 0 16px rgba(49,218,114,0.25), inset 0 0 12px rgba(49,218,114,0.08)" }} />
        </>
      )}
    </div>
  );
}

// Claims here must stay true to api/_lib/google-oauth.js: read-only scopes, access_type "online" (no refresh token), token discarded after the one fetch.
function PrivacyNote() {
  const { t } = useLanguage();
  return (
    <div className="flex items-start gap-[10px] w-full max-w-[560px] rounded-xl border border-[#31da72]/25 bg-[#31da72]/[0.06] px-[16px] py-[12px]">
      <svg className="shrink-0 mt-[2px]" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3L4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3z" stroke="#31da72" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8.8 12.2l2.2 2.2 4.3-4.6" stroke="#31da72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="font-['Sora:Regular',sans-serif] text-[12.5px] lg:text-[13px] leading-[1.6] text-white/65 text-start">
        <span className="font-['Sora:SemiBold',sans-serif] font-semibold text-white/90">{t("Your data stays yours")}</span>
        {" — "}
        {t("If you connect Google, we take a one-time, read-only snapshot of your GA4 and GTM setup to build a more accurate, data-driven audit. We never see your password, can't change anything in your account, and don't keep access afterwards.")}{" "}
        <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer" className="text-[#31da72] underline underline-offset-2">
          {t("You can also remove the connection anytime in your Google account.")}
        </a>
      </p>
    </div>
  );
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-[8px] w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-[6px] rounded-[100px] transition-all duration-300"
          style={{
            width: i === current ? "24px" : "6px",
            background: i <= current ? "#31da72" : "rgba(255,255,255,0.2)",
          }}
        />
      ))}
    </div>
  );
}

// --- Main Export ---

export default function GetFreeAudit() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    tools: [] as ToolId[],
    ga4MeasurementId: "",
    gtmContainerId: "",
    googleAccessConfirmed: false,
    website: "",
    email: "",
    // The one selected property/container's full detail — opaque to this
    // component, passed through as-is to the backend. Looked up from
    // ga4Properties/gtmContainers below whenever the visitor picks a
    // different dropdown option (see selectGa4Property/selectGtmContainer).
    ga4OAuthData: null as unknown,
    gtmOAuthData: null as unknown,
    // Full lists from the OAuth callback — every accessible property/
    // container, not just one exact match. Empty until "Connect Google"
    // completes; drive the google-access step's dropdowns.
    ga4Properties: [] as Ga4Property[],
    gtmContainers: [] as GtmContainer[],
  });
  const [oauthStatus, setOauthStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [oauthErrorMessage, setOauthErrorMessage] = useState("");
  // Per-side listing failure (a 403, a disabled API, a quota hit). Distinct
  // from oauthErrorMessage, which is a whole-connection failure: here the
  // connection worked and one of the two listings didn't, which the form
  // used to render as "no accessible properties found" — indistinguishable
  // from an account that genuinely has none.
  const [ga4ListError, setGa4ListError] = useState<string | null>(null);
  const [gtmListError, setGtmListError] = useState<string | null>(null);
  // Populated by runDetection's background crawl call to
  // /api/detect-tracking — consumed by the OAuth handler (to pick a default
  // dropdown selection) and by renderStepContent (to star that same match).
  const [detectionResult, setDetectionResult] = useState<{ ga4MeasurementIds: string[]; gtmContainerIds: string[] } | null>(null);
  const detectedForUrlRef = useRef<string | null>(null);
  // Set once the visitor picks a dropdown option by hand (selectGa4Property/
  // selectGtmContainer) — stops the auto-default effect below from
  // overwriting a deliberate choice the next time it re-runs (e.g. once a
  // late-arriving site crawl result comes in after OAuth already completed).
  const ga4ManuallySelectedRef = useRef(false);
  const gtmManuallySelectedRef = useRef(false);
  const [validationErrors, setValidationErrors] = useState({
    website: "",
    email: "",
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStepIndexReached, setMaxStepIndexReached] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  // Only ever set in dev, by the local Supabase-bypass path in vite.config.ts
  // (see that file's /api/audit-request handler) — the real production path
  // delivers the report by email only, no reportUrl in the response body.
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  // Set from a 409 on submit: this website or email address already used up
  // its one free audit (api/_lib/audit-intake.js). Rendered as a persistent
  // panel rather than only a toast — it's a final answer, not a transient
  // error, and the visitor shouldn't be left re-pressing the button.
  const [alreadyAuditedMessage, setAlreadyAuditedMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checkingSite, setCheckingSite] = useState(false);

  const steps = useMemo(() => buildSteps(formData.tools), [formData.tools]);
  // Both fields prefixed = test mode; exactly one = the server rejects it
  // with a 400, so say so here before the visitor gets that far.
  const websitePrefixed = hasTestPrefix(formData.website);
  const emailPrefixed = hasTestPrefix(formData.email);
  const isTestSubmission = websitePrefixed && emailPrefixed;
  const testPrefixMismatch = websitePrefixed !== emailPrefixed;
  const clampedIndex = Math.min(stepIndex, steps.length - 1);
  const currentStepKey = steps[clampedIndex];

  const submitAuditMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/audit-request", data),
    // Not optimistic: the request only queues the audit (the pipeline runs
    // later in the worker), so it answers quickly. Showing the thank-you
    // screen before the server confirmed meant a rejected request flashed
    // "thank you" and then silently dropped the visitor back on the form.
    onMutate: () => {
      setAlreadyAuditedMessage(null);
      setSubmitError(null);
    },
    onSuccess: (data: any) => {
      setSubmitted(true);
      if (data?.reportUrl) {
        toast({ title: "Audit ready!", description: "Your report link is ready below." });
        setReportUrl(data.reportUrl);
      } else {
        toast({ title: t("Request received!"), description: t("Expect your audit within 2 to 3 business days.") });
      }
    },
    onError: (error: any) => {
      // 409 = the one-audit-per-website/email limit, not a failure: there's
      // nothing to retry, so it gets its own panel.
      if (error?.status === 409) {
        setAlreadyAuditedMessage(error.message || "A free audit has already been requested for this website or email address.");
        return;
      }
      // Shown inside the card, next to the button, not only as a corner toast
      // that is easy to miss.
      setSubmitError(error?.message || t("We couldn't submit your request. Please try again."));
    },
  });

  const toggleTool = (id: ToolId) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(id) ? prev.tools.filter(t => t !== id) : [...prev.tools, id],
    }));
  };

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, website: value }));
    setValidationErrors(prev => ({ ...prev, website: validateRequired(value, "Website") || validateWebsite(value) }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    setValidationErrors(prev => ({ ...prev, email: validateRequired(value, "Email") || validateEmail(value) }));
  };

  // Dropdown selection, not free text — the value is always one of
  // formData.ga4Properties'/gtmContainers' own measurementId/publicId, so
  // there's nothing to format-validate here the way the old text inputs
  // needed. Looks the full property/container object back up so
  // ga4OAuthData/gtmOAuthData (what actually gets submitted) always matches
  // whichever option is currently selected.
  const selectGa4Property = (measurementId: string) => {
    ga4ManuallySelectedRef.current = true;
    const prop = formData.ga4Properties.find(p => p.measurementId === measurementId) ?? null;
    setFormData(prev => ({ ...prev, ga4MeasurementId: measurementId, ga4OAuthData: prop }));
  };

  const selectGtmContainer = (publicId: string) => {
    gtmManuallySelectedRef.current = true;
    const container = formData.gtmContainers.find(c => c.publicId === publicId) ?? null;
    setFormData(prev => ({ ...prev, gtmContainerId: publicId, gtmOAuthData: container }));
  };

  // Fired once, right when the visitor advances past the (now-first) website
  // step — best-effort background crawl for the literal GA4/GTM IDs on their
  // site. Never blocks navigation: fire-and-forget. The result isn't applied
  // to any field directly any more (the google-access step is dropdowns now,
  // not free text) — it's consumed two ways: the OAuth handler below uses it
  // to pick a sensible default once the real property/container list comes
  // back, and renderStepContent uses it to star that same match in the
  // dropdown. detectedForUrlRef guards against re-firing for the same URL if
  // the visitor goes back to the website step and forward again unchanged.
  // Resolves to whether the site answered: true/false from the crawl, or null
  // when the check itself failed on our side (never blocks the visitor then).
  const reachableRef = useRef<boolean | null>(null);
  const runDetection = useCallback(async (rawWebsite: string): Promise<boolean | null> => {
    const normalized = normalizeWebsiteUrl(rawWebsite);
    if (detectedForUrlRef.current === normalized) return reachableRef.current;
    try {
      const data = await (await fetch(`/api/detect-tracking?website=${encodeURIComponent(normalized)}`)).json();
      setDetectionResult({ ga4MeasurementIds: data.ga4MeasurementIds || [], gtmContainerIds: data.gtmContainerIds || [] });
      reachableRef.current = typeof data.reachable === "boolean" ? data.reachable : null;
    } catch {
      setDetectionResult({ ga4MeasurementIds: [], gtmContainerIds: [] });
      reachableRef.current = null;
    }
    detectedForUrlRef.current = normalized;
    return reachableRef.current;
  }, []);

  // Popup OAuth flow — the callback page posts its result here rather than a
  // full-page redirect, so this multi-step form's state never has to survive
  // a page reload. Ignores messages from any other origin/shape. Only stores
  // the raw property/container lists here — picking the default/starred
  // selection is the separate effect below, which can react to a site-crawl
  // result that arrives either before OR after this message (see that
  // effect's own doc comment for why that split matters).
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== "google-oauth-result") return;

      if (event.data.error) {
        setOauthStatus("error");
        setOauthErrorMessage(event.data.error);
        return;
      }

      const ga4Properties: Ga4Property[] = Array.isArray(event.data.ga4Properties) ? event.data.ga4Properties : [];
      const gtmContainers: GtmContainer[] = Array.isArray(event.data.gtmContainers) ? event.data.gtmContainers : [];
      setGa4ListError(event.data.ga4Error ?? null);
      setGtmListError(event.data.gtmError ?? null);

      // A fresh connection is fresh information: whatever the visitor picked
      // by hand against a PREVIOUS connection's list shouldn't freeze the
      // new one's auto-selection. Without this reset, reconnecting (a
      // different Google account, or a retry after fixing access) left the
      // dropdowns pinned to the earlier manual choice with no ★ logic
      // running at all.
      ga4ManuallySelectedRef.current = false;
      gtmManuallySelectedRef.current = false;

      setFormData(prev => ({
        ...prev,
        ga4Properties,
        gtmContainers,
        // A successful connection is itself proof of access — stronger
        // than the manual checkbox, so it satisfies the same gate
        // automatically.
        googleAccessConfirmed: true,
      }));
      setOauthStatus("connected");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Picks the default/starred GA4 property + GTM container once real data is
  // available for either side of that decision — the OAuth-returned lists
  // (formData.ga4Properties/gtmContainers) or the background site crawl
  // (detectionResult). Split out from the OAuth message handler above
  // specifically because those two can resolve in either order: the OAuth
  // popup often completes in a couple of seconds (especially with an
  // already-logged-in Google session), while the site crawl has to actually
  // fetch and parse the target page — a visitor connecting Google fast
  // enough could easily beat the crawl. GA4 mostly tolerated that race
  // anyway (ga4PropertyMatchesDomain works off the property's own
  // always-populated defaultUri, independent of crawl timing), but GTM
  // containers essentially never have their optional `domainName` field set
  // in practice, so a GTM container's crawl-based match was the ONLY signal
  // it had — losing that race meant it silently never got starred, even
  // when the crawl would have found the exact right ID moments later. This
  // effect re-runs whenever either input changes, so a late-arriving crawl
  // result still corrects the selection after the fact. Only touches
  // whichever side the visitor hasn't already picked by hand (see the
  // ga4ManuallySelectedRef/gtmManuallySelectedRef guards).
  useEffect(() => {
    if (formData.ga4Properties.length === 0 && formData.gtmContainers.length === 0) return;

    setFormData(prev => {
      const hostname = normalizeHostname(prev.website);
      const crawledGtm = new Set((detectionResult?.gtmContainerIds ?? []).map(id => id.toUpperCase()));
      // A container counts as matched either because the live site crawl saw
      // its ID directly, or because the account owner declared this exact
      // domain on the container in GTM itself (ground truth from the Admin
      // API, not inferred from page content).
      const matchedGtmContainers = prev.gtmContainers.filter(
        c => crawledGtm.has(c.publicId.toUpperCase()) || gtmContainerMatchesDomain(c, hostname)
      );
      // Only scan the GTM container(s) actually matched to this site for a
      // GA4 ID — not every container the connected account can see. The
      // account is typically an agency login with containers/properties for
      // many unrelated clients, so pulling from all of them would match
      // whichever other client's GA4 ID happens to appear first.
      const crawledGa4 = new Set([
        ...(detectionResult?.ga4MeasurementIds ?? []).map(id => id.toUpperCase()),
        ...gtmDiscoveredGa4Ids(matchedGtmContainers),
      ]);

      const next = { ...prev };

      if (!ga4ManuallySelectedRef.current) {
        // Prefer whichever property the site crawl (or a matched GTM
        // container's own tags) actually found; fall back to the first one
        // in the list so there's always a sensible default the visitor can
        // just confirm instead of an empty dropdown.
        const defaultGa4 =
          prev.ga4Properties.find(p => crawledGa4.has(p.measurementId.toUpperCase()) || ga4PropertyMatchesDomain(p, hostname)) ??
          prev.ga4Properties[0] ??
          null;
        next.ga4MeasurementId = defaultGa4?.measurementId ?? "";
        next.ga4OAuthData = defaultGa4;
      }

      if (!gtmManuallySelectedRef.current) {
        const defaultGtm = matchedGtmContainers[0] ?? prev.gtmContainers[0] ?? null;
        next.gtmContainerId = defaultGtm?.publicId ?? "";
        next.gtmOAuthData = defaultGtm;
      }

      return next;
    });
  }, [formData.ga4Properties, formData.gtmContainers, detectionResult]);

  const handleConnectGoogle = useCallback(() => {
    setOauthStatus("connecting");
    setOauthErrorMessage("");
    // No candidate IDs passed any more — the callback returns every
    // accessible property/container, and the crawl-match star is computed
    // client-side once they come back (see the effect above).
    const popup = window.open("/api/oauth/google/authorize", "google-oauth", "width=520,height=680");
    if (!popup) {
      setOauthStatus("error");
      setOauthErrorMessage("Popup was blocked — allow popups for this site and try again.");
    }
  }, []);

  const isNextDisabled = () => {
    if (submitAuditMutation.isPending || checkingSite) return true;
    switch (currentStepKey) {
      case "google-access": {
        // "Ready" also when the connected account simply has no
        // properties/containers for a selected tool — nothing to pick, so
        // that tool just degrades to public detection rather than blocking
        // the form.
        const ga4Ready = !formData.tools.includes("GA4") || !!formData.ga4MeasurementId;
        const gtmReady = !formData.tools.includes("GTM") || !!formData.gtmContainerId;
        return !formData.googleAccessConfirmed || !ga4Ready || !gtmReady;
      }
      case "website":
        return !formData.website.trim() || !!validationErrors.website || !formData.email.trim() || !!validationErrors.email || testPrefixMismatch;
      default:
        return false;
    }
  };

  // "tools" and "google-access" can each end up being the last step (no
  // OAuth-eligible tool picked → "tools" is last; one is → "google-access"
  // is) — submission fires off whichever step is actually last, not a
  // hardcoded key.
  const isLastStep = clampedIndex === steps.length - 1;

  const submitAudit = (fields: {
    tools: ToolId[];
    ga4MeasurementId?: string;
    gtmContainerId?: string;
    ga4OAuthData?: unknown;
    gtmOAuthData?: unknown;
  }) => {
    // A half-prefixed pair is a 400 from the server; stop it here so the
    // visitor sees the inline explanation instead of a failed request.
    if (testPrefixMismatch) return;
    submitAuditMutation.mutate({
      ...fields,
      // The prefix goes back on both fields (never just one) so the
      // server's own parseTestPrefix is what decides this is a test run —
      // the client never gets to assert it with a flag of its own.
      website: `${isTestSubmission ? TEST_PREFIX : ""}${normalizeWebsiteUrl(formData.website)}`,
      email: `${isTestSubmission ? TEST_PREFIX : ""}${stripTestPrefix(formData.email)}`,
    });
  };

  // "Changed my mind" on the google-access step: no Google data at all. The
  // server requires a valid ID for every selected tool, so only tools the
  // public site crawl found an ID for are kept; with none, this becomes the
  // same code/speed/CRO audit as "None of these".
  const handleSkipGoogleAccess = () => {
    if (submitAuditMutation.isPending) return;
    const ga4Id = formData.tools.includes("GA4") ? detectionResult?.ga4MeasurementIds[0] : undefined;
    const gtmId = formData.tools.includes("GTM") ? detectionResult?.gtmContainerIds[0] : undefined;
    submitAudit({
      tools: formData.tools.filter(tool => (tool === "GA4" ? !!ga4Id : !!gtmId)),
      ga4MeasurementId: ga4Id,
      gtmContainerId: gtmId,
    });
  };

  const handleNext = async () => {
    if (submitAuditMutation.isPending || checkingSite) return;

    if (currentStepKey === "website") {
      const websiteErr = validateRequired(formData.website, "Website") || validateWebsite(formData.website);
      const emailErr = validateRequired(formData.email, "Email") || validateEmail(formData.email);
      setValidationErrors(prev => ({ ...prev, website: websiteErr, email: emailErr }));
      if (websiteErr || emailErr || testPrefixMismatch) return;
      setCheckingSite(true);
      const reachable = await runDetection(formData.website);
      setCheckingSite(false);
      if (reachable === false) {
        setValidationErrors(prev => ({ ...prev, website: t("We couldn't reach this website. Please check the address and try again.") }));
        return;
      }
    }

    if (currentStepKey === "google-access") {
      // Dropdown values always come straight from formData.ga4Properties/
      // gtmContainers, so there's nothing left to format-validate — just
      // the same readiness check isNextDisabled already gates the button on.
      const ga4Ready = !formData.tools.includes("GA4") || !!formData.ga4MeasurementId;
      const gtmReady = !formData.tools.includes("GTM") || !!formData.gtmContainerId;
      if (!ga4Ready || !gtmReady || !formData.googleAccessConfirmed) return;
    }

    if (isLastStep) {
      submitAudit({
        tools: formData.tools,
        ga4MeasurementId: formData.tools.includes("GA4") ? formData.ga4MeasurementId.trim() || undefined : undefined,
        gtmContainerId: formData.tools.includes("GTM") ? formData.gtmContainerId.trim() || undefined : undefined,
        ga4OAuthData: formData.ga4OAuthData ?? undefined,
        gtmOAuthData: formData.gtmOAuthData ?? undefined,
      });
      return;
    }

    const nextIndex = clampedIndex + 1;
    setStepIndex(nextIndex);
    setMaxStepIndexReached(prev => Math.max(prev, nextIndex));
  };

  // Enter advances like "Next" (and submits on the last step). Skipped when a
  // button/select/link has focus, so Enter keeps its native meaning there.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" || e.shiftKey || submitted) return;
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "BUTTON" || tag === "SELECT" || tag === "A" || tag === "TEXTAREA") return;
    e.preventDefault();
    if (!isNextDisabled()) handleNext();
  };

  const handleBack = () => {
    if (submitAuditMutation.isPending) return;
    if (clampedIndex > 0) {
      submitAuditMutation.reset();
      setStepIndex(clampedIndex - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStepKey) {
      case "tools":
        return (
          <div className="flex flex-col gap-[20px] items-center w-full">
            <p className={QUESTION_CLASS} style={{ wordSpacing: "3px" }}>
              {t("Which of these does your site already have?")}
            </p>
            <p className="text-[13px] text-white/60 font-['Sora:Regular',sans-serif] text-center">
              {t("Select any that apply — or tell us you have none and we'll dig into your site's code and speed instead.")}
            </p>
            <PrivacyNote />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] w-full max-w-[560px]">
              {TOOL_OPTIONS.map(opt => (
                <ToolCard key={opt.id} label={opt.label} hint={opt.hint} isSelected={formData.tools.includes(opt.id)} onClick={() => toggleTool(opt.id)} />
              ))}
              <ToolCard
                label={t("None of these")}
                hint={t("We'll audit your site's code, speed & CRO instead")}
                isSelected={formData.tools.length === 0}
                onClick={() => setFormData(prev => ({ ...prev, tools: [] }))}
                className="sm:col-span-2"
              />
            </div>
          </div>
        );
      case "google-access": {
        const hostname = normalizeHostname(formData.website);
        const crawledGtm = new Set((detectionResult?.gtmContainerIds ?? []).map(id => id.toUpperCase()));
        // Same scoping as the OAuth message handler above: only the GTM
        // container(s) actually matched to this site — either the live crawl
        // saw its ID directly, or the container declares this exact domain
        // in GTM itself — not every container the connected (often
        // multi-client agency) account can see.
        const matchedGtmContainers = formData.gtmContainers.filter(
          c => crawledGtm.has(c.publicId.toUpperCase()) || gtmContainerMatchesDomain(c, hostname)
        );
        const isGtmMatched = (c: GtmContainer) => matchedGtmContainers.includes(c);
        const crawledGa4 = new Set([
          ...(detectionResult?.ga4MeasurementIds ?? []).map(id => id.toUpperCase()),
          ...gtmDiscoveredGa4Ids(matchedGtmContainers),
        ]);
        const isGa4Matched = (p: Ga4Property) => crawledGa4.has(p.measurementId.toUpperCase()) || ga4PropertyMatchesDomain(p, hostname);
        const selectClass = "bg-white/10 border-2 border-[#31da72]/30 text-white h-9 w-full rounded-md px-2 text-sm";

        return (
          <div className="flex flex-col gap-[16px] items-center w-full max-w-[440px]">
            <p className={QUESTION_CLASS} style={{ wordSpacing: "3px" }}>
              {t("Connect Google for a deeper audit")}
            </p>
            <p className="text-[13px] text-white/60 font-['Sora:Regular',sans-serif] text-center">
              {oauthStatus === "connected"
                ? t("Pick the ones for this website. ★ marks the one we found live on your site.")
                : t("We read your Google Analytics and Tag Manager setup to check what is tracked, what is missing, and where your sales data breaks. After connecting, you just pick your website from a list.")}
            </p>
            <PrivacyNote />

            {oauthStatus !== "connected" && (
              <Button
                onClick={handleConnectGoogle}
                disabled={oauthStatus === "connecting"}
                className="px-6 py-2.5 border border-[#31da72] bg-[#31da72] text-[#020601] hover:bg-[#31da72]/90 rounded-xl h-auto text-sm font-semibold transition-all"
              >
                {oauthStatus === "connecting" ? t("Connecting...") : t("Connect Google")}
              </Button>
            )}
            {oauthStatus === "error" && <p className="text-red-500 text-xs text-center">{oauthErrorMessage}</p>}

            {oauthStatus === "connected" && (
              <div className="w-full flex flex-col gap-3">
                {formData.tools.includes("GA4") && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] text-white/50">{t("GA4 property")}</label>
                    {ga4ListError ? (
                      <p className="text-[12px] text-[#f2b75e]">
                        {t("Couldn't read your GA4 properties:")} {ga4ListError}
                      </p>
                    ) : formData.ga4Properties.length === 0 ? (
                      <p className="text-[12px] text-[#f2b75e]">{t("This Google account has no Google Analytics 4 property. Connect the account that manages your site, or run the audit without access using the link below.")}</p>
                    ) : (
                      <select className={selectClass} value={formData.ga4MeasurementId} onChange={e => selectGa4Property(e.target.value)}>
                        {formData.ga4Properties.map(prop => (
                          <option key={prop.measurementId} value={prop.measurementId} className="bg-[#020601]">
                            {isGa4Matched(prop) ? "★ " : ""}{prop.displayName} ({prop.measurementId})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
                {formData.tools.includes("GTM") && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] text-white/50">{t("GTM container")}</label>
                    {gtmListError ? (
                      <p className="text-[12px] text-[#f2b75e]">
                        {t("Couldn't read your GTM containers:")} {gtmListError}
                      </p>
                    ) : formData.gtmContainers.length === 0 ? (
                      <p className="text-[12px] text-[#f2b75e]">{t("This Google account has no Tag Manager container. Connect the account that manages your site, or run the audit without access using the link below.")}</p>
                    ) : (
                      <select className={selectClass} value={formData.gtmContainerId} onChange={e => selectGtmContainer(e.target.value)}>
                        {formData.gtmContainers.map(container => (
                          <option key={container.publicId} value={container.publicId} className="bg-[#020601]">
                            {isGtmMatched(container) ? "★ " : ""}{container.containerName} ({container.publicId})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
                {(formData.tools.includes("GA4") && !formData.ga4MeasurementId) || (formData.tools.includes("GTM") && !formData.gtmContainerId) ? (
                  <button type="button" onClick={handleConnectGoogle} className="self-center text-[13px] font-semibold text-[#31da72] underline underline-offset-4 bg-transparent border-0 p-0 cursor-pointer">
                    {t("Connect a different Google account")}
                  </button>
                ) : (
                  <p className="text-[#31da72] text-xs text-center">{t("✓ Access confirmed.")}</p>
                )}
              </div>
            )}
          </div>
        );
      }
      case "website":
        return (
          <div className="flex flex-col gap-[16px] items-center w-full">
            <p className={QUESTION_CLASS} style={{ wordSpacing: "3px" }}>
              {t("What's your website?")}
            </p>
            <div className="w-full max-w-[380px] flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label htmlFor="audit-website" className="text-[13px] text-white/80 font-['Sora:Regular',sans-serif] text-start">
                  {t("Enter your website URL")}
                </label>
                <Input
                  id="audit-website"
                  name="website"
                  type="url"
                  inputMode="url"
                  value={formData.website}
                  onChange={handleWebsiteChange}
                  placeholder={t("e.g. yourstore.com")}
                  className={`bg-white/10 border-2 ${validationErrors.website ? "border-red-500" : "border-[#31da72]/30"} text-white h-9`}
                />
                {validationErrors.website && <p className="text-red-500 text-sm">{validationErrors.website}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="audit-email" className="text-[13px] text-white/80 font-['Sora:Regular',sans-serif] text-start">
                  {t("Enter the email address where you want to receive your report")}
                </label>
                <Input
                  id="audit-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  placeholder={t("e.g. you@yourcompany.com")}
                  className={`bg-white/10 border-2 ${validationErrors.email ? "border-red-500" : "border-[#31da72]/30"} text-white h-9`}
                />
                {validationErrors.email && <p className="text-red-500 text-sm">{validationErrors.email}</p>}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#020601] relative w-full h-auto py-[40px] lg:py-[6vw] flex flex-col items-center" id="free-audit">
      <p className="font-['Sora:SemiBold',sans-serif] font-semibold leading-[1.15] text-[32px] lg:text-[3.6vw] text-center tracking-[-1px] mb-[32px] lg:mb-[3vw] px-4 bg-gradient-to-b from-white to-[#c4c4c4] bg-clip-text text-transparent">
        {t("Get a Free Audit")}
      </p>

      <div
        className="relative flex flex-col items-center justify-center mx-auto rounded-[16px] lg:rounded-[24px] w-[96%] md:w-[90%] lg:w-full max-w-[96vw] md:max-w-[700px] lg:max-w-[840px] z-10 animate-wave-fast"
        style={{
          backgroundImage: "linear-gradient(155.126deg, rgba(255, 255, 255, 0.05) 2.6545%, rgba(255, 255, 255, 0) 44.796%), url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1240 733\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(196.13 40.783 -59.815 70.828 573.8 102.21)\\'><stop stop-color=\\'rgba(0,0,0,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(0,0,0,1)\\' offset=\\'0.55823\\'/><stop stop-color=\\'rgba(0,0,0,0.3)\\' offset=\\'0.73997\\'/><stop stop-color=\\'rgba(0,0,0,0)\\' offset=\\'1\\'/></radialGradient></defs></svg>'), linear-gradient(87.1906deg, rgb(66, 102, 164) 0%, rgb(146, 235, 180) 25%, rgb(66, 102, 164) 50%, rgb(146, 235, 180) 75%, rgb(66, 102, 164) 100%)",
          backgroundSize: "100% 100%, 100% 100%, 400% 400%",
        }}
      >
        <style>{`
          @keyframes wave-gradient {
            0% { background-position: 0% 0%, 0% 0%, 0% 0%; }
            50% { background-position: 0% 0%, 0% 0%, 100% 100%; }
            100% { background-position: 0% 0%, 0% 0%, 0% 0%; }
          }
          .animate-wave-fast {
            animation: wave-gradient 8s ease-in-out infinite;
          }
        `}</style>
        <div aria-hidden="true" className="absolute border border-transparent lg:border-[1.5px] lg:border-white/40 border-solid inset-0 pointer-events-none rounded-[16px] lg:rounded-[24px]" />

        <div onKeyDown={handleKeyDown} className="flex flex-col gap-[24px] lg:gap-[32px] items-center relative w-full pt-[28px] lg:pt-[40px] px-[16px] lg:px-[48px] pb-[24px] lg:pb-[32px]">
          {!submitted && <ProgressDots total={steps.length} current={clampedIndex} />}

          {submitted ? (
            <div className="flex flex-col items-center gap-[12px] py-[24px]">
              <div className="w-[56px] h-[56px] rounded-full bg-[#31da72]/15 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12L9 17L20 6" stroke="#31da72" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="font-['Sora:SemiBold',sans-serif] font-semibold text-[20px] text-white text-center">
                {reportUrl ? t("Your audit is ready") : t("Thank you! Your audit is on its way")}
              </p>
              <p className="font-['Sora:Regular',sans-serif] text-[14px] text-white/60 text-center max-w-[380px]">
                {reportUrl
                  ? t("Generated locally for this dev session — production delivers this by email instead.")
                  : t("Every audit is reviewed by an expert on our team before it's sent. Expect yours in your inbox within 2 to 3 business days, and keep an eye on your spam folder too, just in case.")}
              </p>
              {!reportUrl && isTestSubmission && (
                <p className="font-['Sora:Regular',sans-serif] text-[12px] text-[#f2b75e] text-center max-w-[380px]">
                  {t("Test run: this one skips the review and arrives as soon as it's ready.")}
                </p>
              )}
              {reportUrl && (
                <a
                  href={reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-[8px] px-6 py-2.5 border border-[#31da72] bg-[#31da72] text-[#020601] hover:bg-[#31da72]/90 rounded-xl h-auto text-sm font-semibold transition-all"
                >
                  {t("View your audit report →")}
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="w-full min-h-[220px] flex flex-col items-center justify-center">{renderStepContent()}</div>

              {testPrefixMismatch && (
                <p className="text-[#f2b75e] text-xs text-center max-w-[420px]">
                  {t("Test mode needs the \"-\" prefix on both the website and the email, or on neither.")}
                </p>
              )}

              {isTestSubmission && (
                <div className="w-full max-w-[560px] rounded-xl border border-[#f2b75e]/40 bg-[#f2b75e]/10 px-[18px] py-[12px]">
                  <p className="font-['Sora:SemiBold',sans-serif] font-semibold text-[13px] text-[#f2b75e]">
                    {t("Test mode")}
                  </p>
                  <p className="font-['Sora:Regular',sans-serif] text-[12.5px] text-white/70 leading-[1.6] mt-[4px]">
                    {t("Runs the real audit, then emails the report straight to the address above — no internal review, no delay, and it won't use up this site's one free audit. The report is stored separately from real client reports.")}
                  </p>
                </div>
              )}

              {alreadyAuditedMessage && (
                <div className="w-full max-w-[560px] rounded-xl border border-[#f2b75e]/40 bg-[#f2b75e]/10 px-[18px] py-[14px] flex flex-col gap-[10px]">
                  <p className="font-['Sora:SemiBold',sans-serif] font-semibold text-[14px] text-[#f2b75e]">
                    {t("Already audited")}
                  </p>
                  <p className="font-['Sora:Regular',sans-serif] text-[13px] text-white/70 leading-[1.6]">
                    {alreadyAuditedMessage}
                  </p>
                  <a
                    href="/#contact"
                    className="self-start text-[13px] font-semibold text-[#31da72] underline underline-offset-4"
                  >
                    {t("Talk to us instead →")}
                  </a>
                </div>
              )}

              {submitError && (
                <div role="alert" className="w-full max-w-[560px] rounded-xl border border-red-500/50 bg-red-500/10 px-[18px] py-[12px]">
                  <p className="font-['Sora:SemiBold',sans-serif] font-semibold text-[13px] text-red-400">
                    {t("Your request wasn't sent")}
                  </p>
                  <p className="font-['Sora:Regular',sans-serif] text-[12.5px] text-white/75 leading-[1.6] mt-[4px]">
                    {submitError}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 w-full">
                {clampedIndex > 0 && (
                  <Button onClick={handleBack} disabled={submitAuditMutation.isPending} variant="outline" className="px-5 py-2 border-[#31da72] text-[#31da72] bg-black hover:bg-black/80 hover:text-[#31da72] rounded-xl h-auto text-sm font-semibold transition-all">
                    {t("Back")}
                  </Button>
                )}
                <Button onClick={handleNext} disabled={isNextDisabled()} className="px-5 py-2 border border-[#31da72] bg-[#31da72] text-[#020601] hover:bg-[#31da72]/90 rounded-xl h-auto text-sm font-semibold min-w-[80px] transition-all">
                  {submitAuditMutation.isPending ? t("Submitting...") : checkingSite ? t("Checking your website...") : isLastStep ? t("Get My Audit") : t("Next")}
                </Button>
              </div>

              {currentStepKey === "google-access" && (
                <button
                  type="button"
                  onClick={handleSkipGoogleAccess}
                  disabled={submitAuditMutation.isPending || testPrefixMismatch}
                  className="-mt-[8px] font-['Sora:Regular',sans-serif] text-[13px] text-[#31da72] underline underline-offset-4 decoration-[#31da72]/50 hover:decoration-[#31da72] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-transparent border-0 p-0"
                >
                  {t("I changed my mind — run the audit that doesn't need access")}
                </button>
              )}
            </>
          )}
        </div>

        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-16.5px_36.9px_0px_rgba(255,255,255,0.25)] lg:shadow-[inset_0px_16.5px_36.9px_0px_rgba(255,255,255,0.12)]" />
      </div>
    </div>
  );
}
