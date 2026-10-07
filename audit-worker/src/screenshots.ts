import { existsSync, readdirSync } from "fs";
import path from "path";
import os from "os";
import puppeteer from "puppeteer-core";

/**
 * Full-length screenshots of the audited homepage at a desktop and a mobile
 * viewport, for the report's "Your store" frames, which scroll through them
 * top to bottom (html-report.ts). Capped in height (DESKTOP_CAP/MOBILE_CAP)
 * so a very long page can't bloat the report file.
 *
 * puppeteer-CORE, not puppeteer: the full package bundles its own ~300MB
 * Chromium, and this machine class already has a browser — the audit's own
 * website route drives real Chrome through chrome-devtools-mcp, so the
 * README already requires one to be installed. Reusing it keeps the worker's
 * install small and avoids a second copy of Chrome on the VPS.
 *
 * Everything here is best-effort by design: a screenshot is a nice-to-have
 * illustration, not audit evidence, so a missing browser or a site that
 * won't load returns nulls and the report simply renders without the mockup
 * (see buildAuditHtmlReport). It must never fail an audit that otherwise
 * produced 50 real findings.
 */

export interface SiteScreenshots {
  // JPEG data URIs, ready to drop straight into an <img src> — the report is
  // a single self-contained file (fonts and icons are inlined the same way),
  // so it cannot reference anything on disk.
  desktop: string | null;
  mobile: string | null;
  // Why they're missing, when they are — surfaced in the worker log rather
  // than swallowed, so "no mockup in the report" is diagnosable.
  error?: string;
}

// The report shows these at roughly 560px (desktop) and 200px (mobile) wide,
// so a reduced pixel ratio still looks sharp on a retina screen while
// keeping a full-length capture to a reasonable size.
const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 0.75 };
// iPhone 14-ish.
const MOBILE = { width: 390, height: 844, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true };
// Longest page captured, in CSS pixels. Also keeps the image under Chrome's
// 16,384px texture limit at the pixel ratios above.
const DESKTOP_CAP = 7200;
const MOBILE_CAP = 8000;

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

/**
 * Where Chrome actually is. No single answer works across the operator's
 * Windows dev box and a Linux VPS, and puppeteer-core deliberately ships no
 * browser of its own, so this checks the conventional install paths for each
 * platform plus the Chrome-for-Testing cache that puppeteer tooling may have
 * populated. CHROME_PATH overrides everything for anything unusual (the
 * Docker image sets it to its own Chrome).
 */
function findChrome(): string | null {
  const fromEnv = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const candidates: string[] = [];
  if (process.platform === "win32") {
    const programFiles = [process.env["PROGRAMFILES"], process.env["PROGRAMFILES(X86)"], process.env["LOCALAPPDATA"]].filter(Boolean) as string[];
    for (const base of programFiles) {
      candidates.push(path.join(base, "Google", "Chrome", "Application", "chrome.exe"));
      candidates.push(path.join(base, "Microsoft", "Edge", "Application", "msedge.exe"));
    }
  } else if (process.platform === "darwin") {
    candidates.push("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
    candidates.push("/Applications/Chromium.app/Contents/MacOS/Chromium");
  } else {
    candidates.push(
      "/usr/bin/google-chrome-stable",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      "/snap/bin/chromium",
    );
  }

  // Chrome for Testing, as installed by puppeteer/@puppeteer/browsers.
  const cache = path.join(os.homedir(), ".cache", "puppeteer");
  if (existsSync(cache)) {
    const exe = process.platform === "win32" ? "chrome.exe" : "chrome";
    for (const dir of ["chrome", "chrome-headless-shell"]) {
      const base = path.join(cache, dir);
      if (!existsSync(base)) continue;
      // Any versioned subdir will do; take them in reverse order so a newer
      // build wins without needing to parse version strings.
      try {
        const versions = readdirSync(base).sort().reverse();
        for (const v of versions) {
          for (const inner of ["chrome-win64", "chrome-linux64", "chrome-mac-x64", "chrome-mac-arm64", ""]) {
            const candidate = path.join(base, v, inner, exe);
            if (existsSync(candidate)) return candidate;
          }
        }
      } catch {
        // Unreadable cache dir is just one more place Chrome isn't.
      }
    }
  }

  return candidates.find(p => existsSync(p)) ?? null;
}

export async function captureSiteScreenshots(url: string): Promise<SiteScreenshots> {
  const executablePath = findChrome();
  if (!executablePath) {
    return {
      desktop: null,
      mobile: null,
      error: "no Chrome/Chromium found — set CHROME_PATH to enable the device mockup",
    };
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      // --hide-scrollbars: a scrollbar gutter in the shot reads as a
      // rendering artifact inside the device frame.
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
    });

    const shoot = async (viewport: typeof DESKTOP | typeof MOBILE, cap: number, userAgent?: string) => {
      const page = await browser!.newPage();
      try {
        await page.setViewport(viewport as any);
        if (userAgent) await page.setUserAgent(userAgent);
        // domcontentloaded rather than networkidle: an ecommerce homepage with
        // chat widgets and pixels may never go idle, and this is an
        // illustration — a 25s ceiling on a page that keeps talking is better
        // than waiting for silence that never comes.
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25_000 });
        // Give lazy-loaded hero imagery a moment to paint; without this the
        // shot is often the skeleton state, which misrepresents the site.
        await new Promise(r => setTimeout(r, 2500));
        // Walk down the page once so lazy-loaded sections and scroll-reveal
        // animations paint, then return to the top for the capture.
        const height = await page.evaluate(async (limit: number) => {
          const step = Math.max(300, Math.round(window.innerHeight * 0.8));
          const end = Math.min(document.documentElement.scrollHeight, limit);
          for (let y = 0; y < end; y += step) {
            window.scrollTo(0, y);
            await new Promise(r => setTimeout(r, 180));
          }
          window.scrollTo(0, 0);
          return Math.min(document.documentElement.scrollHeight, limit);
        }, cap);
        await new Promise(r => setTimeout(r, 700));
        // captureBeyondViewport keeps the layout viewport as it is, so 100vh
        // heroes don't stretch to the full page height in the capture.
        const buffer = await page.screenshot({
          type: "jpeg",
          quality: 66,
          encoding: "base64",
          captureBeyondViewport: true,
          clip: { x: 0, y: 0, width: viewport.width, height: Math.max(viewport.height, height) },
        });
        return `data:image/jpeg;base64,${buffer}`;
      } finally {
        await page.close().catch(() => {});
      }
    };

    // Sequential, not parallel: two Chrome tabs racing on the same VPS core
    // makes both shots more likely to catch a half-painted page.
    const desktop = await shoot(DESKTOP, DESKTOP_CAP).catch(() => null);
    const mobile = await shoot(MOBILE, MOBILE_CAP, MOBILE_UA).catch(() => null);

    return {
      desktop,
      mobile,
      error: desktop || mobile ? undefined : "both screenshots failed (page load or render)",
    };
  } catch (err) {
    return { desktop: null, mobile: null, error: err instanceof Error ? err.message : String(err) };
  } finally {
    await browser?.close().catch(() => {});
  }
}
