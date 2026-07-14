// Capture source frames from https://justpercent.com (US locale) for the
// Smooth Scroll Reveal technique (Technique 6). Every screenshot is taken
// ONLY after full DOM stabilization: network idle >= 500ms,
// document.fonts.ready, no active CSS/JS transitions or animations, all
// images decoded, and zero layout shift for >= 500ms. Never mid-transition.
//
// Run: node capture.mjs [home|postclick|faqindex|pu|searchpin|faqsub]...
//      (no args = all sections; playwright resolved from handy-percent)

import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(
  "/Users/michael/startups/percentage-calculator/handy-percent/package.json"
);
const { chromium } = require("@playwright/test");

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "assets");
mkdirSync(OUT, { recursive: true });

const BASE = "https://justpercent.com";
const GEO_FILE = join(OUT, "geometry.json");
const geometry = existsSync(GEO_FILE)
  ? JSON.parse(readFileSync(GEO_FILE, "utf8"))
  : {};
const sections = process.argv.slice(2);
const want = (s) => sections.length === 0 || sections.includes(s);

// ---- capture guard ---------------------------------------------------------
async function stabilize(page, { maxWaitMs = 20000 } = {}) {
  await page.waitForLoadState("domcontentloaded");
  try {
    await page.waitForLoadState("networkidle", { timeout: maxWaitMs });
  } catch {
    /* ads may trickle; CLS/animation checks below still gate the capture */
  }
  await page.evaluate(
    ({ maxWaitMs }) =>
      new Promise((resolve) => {
        const start = performance.now();
        let lastShift = performance.now();
        const po = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!e.hadRecentInput && e.value > 0) lastShift = performance.now();
          }
        });
        try {
          po.observe({ type: "layout-shift", buffered: true });
        } catch {}

        const imagesDecoded = () =>
          [...document.images].every((img) => img.complete);
        const noActiveAnimations = () =>
          document
            .getAnimations()
            .filter(
              (a) =>
                a.playState === "running" &&
                a.effect?.getTiming().iterations !== Infinity
            ).length === 0;

        const tick = async () => {
          const quiet = performance.now() - lastShift >= 500;
          const fontsReady =
            (await Promise.race([document.fonts.ready, "pending"])) !==
            "pending";
          if (
            document.readyState === "complete" &&
            fontsReady &&
            imagesDecoded() &&
            noActiveAnimations() &&
            quiet
          ) {
            po.disconnect();
            resolve(true);
          } else if (performance.now() - start > maxWaitMs) {
            po.disconnect();
            resolve(false);
          } else {
            setTimeout(tick, 120);
          }
        };
        tick();
      }),
    { maxWaitMs }
  );
  await page.waitForTimeout(250); // final settle margin
}

async function acceptCookies(page) {
  const btn = page.getByRole("button", { name: /accept/i }).first();
  try {
    await btn.click({ timeout: 4000 });
    await page.waitForTimeout(400);
  } catch {
    /* banner absent */
  }
}

async function rects(page, spec) {
  return page.evaluate((spec) => {
    const out = {};
    for (const [key, sel] of Object.entries(spec)) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      out[key] = {
        x: Math.round(r.x + window.scrollX),
        y: Math.round(r.y + window.scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height)
      };
    }
    out.__page = {
      scrollHeight: document.documentElement.scrollHeight,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
      scrollY: window.scrollY
    };
    return out;
  }, spec);
}

// page-space rects of headings + CTA-ish elements (to place highlights/zooms)
async function landmarks(page) {
  return page.evaluate(() => {
    const grab = (els) =>
      [...els].slice(0, 40).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 70),
          x: Math.round(r.x + scrollX),
          y: Math.round(r.y + scrollY),
          w: Math.round(r.width),
          h: Math.round(r.height)
        };
      });
    return {
      headings: grab(document.querySelectorAll("h1, h2, h3")),
      ctas: grab(
        document.querySelectorAll("main a[class*='btn'], main button, .cta, a[href*='calculator']")
      ).filter((c) => c.text)
    };
  });
}

async function shot(page, name, { fullPage = true } = {}) {
  await stabilize(page);
  await page.screenshot({
    path: join(OUT, `${name}.png`),
    fullPage,
    animations: "disabled"
  });
  console.log(`captured ${name}.png`);
}

// -----------------------------------------------------------------------------
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
  reducedMotion: "reduce",
  locale: "en-US",
  timezoneId: "America/New_York",
  serviceWorkers: "block"
});
const page = await ctx.newPage();

// ---- 1. HOME (full page) — 6.1 Classic Scan / 6.6 Highlight-on-Scroll ------
if (want("home")) {
  await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
  await acceptCookies(page);
  await page.waitForSelector("#solution-desktop-grid .solution-sticky-note", {
    timeout: 15000
  });
  await shot(page, "us-home-full");
  geometry["us-home-full"] = await rects(page, {
    searchBox: "#calculator-search",
    quickExamples: "#quick-example-cards",
    solutionGridDesktop: "#solution-desktop-grid",
    heading: "h1"
  });
  geometry["us-home-full"].solutionCards = await page.evaluate(() => {
    const cards = [
      ...document.querySelectorAll("#solution-desktop-grid .solution-sticky-note")
    ].slice(0, 12);
    return cards.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50),
        x: Math.round(r.x + scrollX),
        y: Math.round(r.y + scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height)
      };
    });
  });
}

// ---- 2. SolutionCard click -> calculator page — 6.2 Post-Click Loaded List -
if (want("postclick")) {
  await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
  await acceptCookies(page);
  await page.waitForSelector("#solution-desktop-grid .solution-sticky-note", {
    timeout: 15000
  });
  await stabilize(page);
  const coupon = page
    .locator("#solution-desktop-grid")
    .getByText("Apply My Coupon", { exact: false })
    .first();
  await coupon.click();
  await page.waitForURL(/decreased-value-calculator/, { timeout: 15000 });
  await acceptCookies(page);
  await shot(page, "us-decreased-value-after-card-click");
  geometry["us-decreased-value-after-card-click"] = await rects(page, {
    card: "[data-calculator-id]",
    helpPanel: ".help-panel",
    result: "#decreased-value-result",
    heading: "h1",
    practicalUses: ".practical-use--interactive"
  });
  geometry["us-decreased-value-after-card-click"].landmarks =
    await landmarks(page);
}

// ---- 3. FAQ index — 6.3 Slow Log Read --------------------------------------
if (want("faqindex")) {
  await page.goto(`${BASE}/faqs/?noredirect`, { waitUntil: "domcontentloaded" });
  await acceptCookies(page);
  await shot(page, "us-faqs-index");
  geometry["us-faqs-index"] = await rects(page, { heading: "h1" });
}

// ---- 4. Calc page -> click Practical Use — 6.4 Long Form -------------------
if (want("pu")) {
  await page.goto(`${BASE}/increased-value-calculator/?noredirect`, {
    waitUntil: "domcontentloaded"
  });
  await acceptCookies(page);
  await stabilize(page);
  const pu = page.locator(".practical-use--interactive").first();
  await pu.scrollIntoViewIfNeeded();
  await stabilize(page);
  await pu.click({ timeout: 8000 });
  await page.waitForTimeout(1500); // values fill + result computes
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "us-increased-value-practical-use");
  geometry["us-increased-value-practical-use"] = await rects(page, {
    card: "[data-calculator-id]",
    pinnedUse: ".practical-use--pinned",
    result: "#increased-value-result",
    heading: "h1"
  });
  geometry["us-increased-value-practical-use"].landmarks = await landmarks(page);
}

// ---- 5. HOME + search "tip" -> pick result — 6.5 Cursor-Assisted Scroll ----
if (want("searchpin")) {
  await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
  await acceptCookies(page);
  await page.waitForSelector("#solution-desktop-grid .solution-sticky-note", {
    timeout: 15000
  });
  await stabilize(page);
  await page.click("#calculator-search");
  await page.keyboard.type("tip", { delay: 90 });
  await page.waitForSelector("#search-results-list-portal", { timeout: 8000 });
  await page.waitForTimeout(1000);
  // app's own demo pattern: ArrowDown + Enter picks first result,
  // scrolls home to the matching calculator and pins the Practical Use
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1800); // scroll + pin + banner settle
  // back to top BEFORE the fullPage shot: otherwise the sticky header and
  // fixed minimap get baked mid-page at the app's scroll position
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await shot(page, "us-home-tip-pinned-full");
  geometry["us-home-tip-pinned-full"] = await rects(page, {
    searchBox: "#calculator-search",
    pinnedUse: ".practical-use--pinned",
    banner: "[class*='selected-practical'], [class*='practical-use-banner']",
    activeCalc: "[data-calculator-id].search-highlight, .search-highlight"
  });
  geometry["us-home-tip-pinned-full"].landmarks = await landmarks(page);
}

// ---- 6. FAQ subpage (bill splitting) — 6.7 Scroll + Zoom Finish ------------
if (want("faqsub")) {
  await page.goto(`${BASE}/faqs/bill-splitting-calculator/?noredirect`, {
    waitUntil: "domcontentloaded"
  });
  await acceptCookies(page);
  await shot(page, "us-faq-bill-splitting");
  geometry["us-faq-bill-splitting"] = await rects(page, {
    heading: "h1",
    breadcrumb: "nav[aria-label*='readcrumb'], .breadcrumb"
  });
  geometry["us-faq-bill-splitting"].landmarks = await landmarks(page);
}

writeFileSync(GEO_FILE, JSON.stringify(geometry, null, 2));
console.log("geometry.json written");
await browser.close();
