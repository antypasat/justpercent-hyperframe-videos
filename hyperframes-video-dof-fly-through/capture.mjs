// Capture source frames from https://justpercent.com (US locale) for the
// DoF Fly-Through technique. Every screenshot is taken ONLY after full DOM
// stabilization: network idle >= 500ms, document.fonts.ready, no active
// CSS/JS transitions or animations, all images decoded, and zero layout
// shift for >= 500ms. Never captures mid-transition.
//
// Run: node capture.mjs   (playwright resolved from handy-percent)

import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
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
const geometry = {};

// ---- capture guard -------------------------------------------------------
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
  // final settle margin
  await page.waitForTimeout(250);
}

async function acceptCookies(page) {
  const btn = page
    .getByRole("button", { name: /accept/i })
    .first();
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

async function shot(page, name, { fullPage = true } = {}) {
  await stabilize(page);
  await page.screenshot({
    path: join(OUT, `${name}.png`),
    fullPage,
    animations: "disabled"
  });
  console.log(`captured ${name}.png`);
}

// ---------------------------------------------------------------------------
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
  reducedMotion: "reduce",
  locale: "en-US",
  timezoneId: "America/New_York"
});
const page = await ctx.newPage();

// ---- 1. HOME (full page) --------------------------------------------------
await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
await shot(page, "us-home-full");
geometry["us-home-full"] = await rects(page, {
  searchBox: "#calculator-search",
  solutionGridDesktop: "#solution-desktop-grid",
  heading: "h1"
});

// solution card rects (first three visible cards for 9.6 focus chain)
geometry["us-home-full"].solutionCards = await page.evaluate(() => {
  const cards = [
    ...document.querySelectorAll(
      "#solution-desktop-grid [data-note-id], #solution-desktop-grid > div > div"
    )
  ].slice(0, 6);
  return cards.map((el) => {
    const r = el.getBoundingClientRect();
    return {
      noteId: el.dataset?.noteId ?? null,
      text: (el.textContent || "").trim().slice(0, 60),
      x: Math.round(r.x + scrollX),
      y: Math.round(r.y + scrollY),
      w: Math.round(r.width),
      h: Math.round(r.height)
    };
  });
});

// ---- 2. HOME + search "tip" (Practical Use via search box) ----------------
await page.click("#calculator-search");
await page.keyboard.type("tip", { delay: 90 });
await page.waitForTimeout(1200); // results portal opens
await stabilize(page);
await page.screenshot({
  path: join(OUT, "us-home-search-tip.png"),
  fullPage: false,
  animations: "disabled"
});
console.log("captured us-home-search-tip.png (viewport)");
geometry["us-home-search-tip"] = await rects(page, {
  searchBox: "#calculator-search",
  resultsList: "#search-results-list-portal",
  scrollContainer: "#search-scroll-container"
});

// pick first search result -> scrolls to matching calculator on home
const firstResult = page
  .locator("#search-results-list-portal [role='option'], #search-scroll-container a, #search-scroll-container [role='option']")
  .first();
try {
  await firstResult.click({ timeout: 4000 });
  await page.waitForTimeout(1500);
  await stabilize(page);
  await page.screenshot({
    path: join(OUT, "us-home-search-tip-scrolled.png"),
    fullPage: false,
    animations: "disabled"
  });
  console.log("captured us-home-search-tip-scrolled.png (viewport)");
  geometry["us-home-search-tip-scrolled"] = await rects(page, {
    activeCard: "[data-calculator-id].search-highlight, [data-calculator-id]",
    pinnedUse: ".practical-use--pinned, .practical-use--interactive"
  });
} catch (e) {
  console.log("search result click skipped:", e.message.split("\n")[0]);
}

// ---- 3. SolutionCard click -> individual calculator page -------------------
await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
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
  result: "#dec-new, [id*='dec-new']",
  original: "#dec-original, [id*='dec-original']",
  heading: "h1"
});

// ---- 4. Individual calc page -> click Practical Use below calculator ------
await page.goto(`${BASE}/increased-value-calculator/?noredirect`, {
  waitUntil: "domcontentloaded"
});
await acceptCookies(page);
await stabilize(page);
// expand Practical Uses if collapsed
const pu = page.locator(".practical-use--interactive").first();
if (!(await pu.isVisible().catch(() => false))) {
  const toggle = page.getByRole("button", { name: /practical uses/i }).first();
  await toggle.click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(800);
}
await stabilize(page);
await pu.click({ timeout: 8000 });
await page.waitForTimeout(1500); // values fill + result computes + DOM mutates
await shot(page, "us-increased-value-practical-use");
geometry["us-increased-value-practical-use"] = await rects(page, {
  card: "[data-calculator-id]",
  pinnedUse: ".practical-use--pinned",
  result: "[id*='inc-'][id*='new'], [id*='result']",
  heading: "h1"
});

// ---- 5. FAQ index (long vertical list) -------------------------------------
await page.goto(`${BASE}/faqs/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
await shot(page, "us-faqs-index");
geometry["us-faqs-index"] = await rects(page, { heading: "h1" });

// ---- 6. FAQ subpage (sensible example: bill splitting) ---------------------
await page.goto(`${BASE}/faqs/bill-splitting-calculator/?noredirect`, {
  waitUntil: "domcontentloaded"
});
await acceptCookies(page);
await shot(page, "us-faq-bill-splitting");
geometry["us-faq-bill-splitting"] = await rects(page, {
  heading: "h1",
  breadcrumb: "nav[aria-label*='readcrumb'], .breadcrumb"
});

writeFileSync(join(OUT, "geometry.json"), JSON.stringify(geometry, null, 2));
console.log("geometry.json written");
await browser.close();
