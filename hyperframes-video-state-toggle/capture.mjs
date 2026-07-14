// Capture BEFORE/AFTER source frames from https://justpercent.com (US locale)
// for Technique 4 "State Toggle". Every frame is captured ONLY after full DOM
// stabilization: network idle >= 500ms, document.fonts.ready, no active CSS/JS
// transitions or animations, all images decoded, and zero layout shift for
// >= 500ms. Never captures mid-transition — including AFTER states that follow
// a real click + DOM mutation.
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
    /* banner absent (consent persists per profile) */
  }
}

// viewport-space rects (State Toggle frames are viewport shots)
async function vrects(page, spec) {
  return page.evaluate((spec) => {
    const out = {};
    for (const [key, sel] of Object.entries(spec)) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      out[key] = {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height)
      };
    }
    out.__scrollY = Math.round(window.scrollY);
    return out;
  }, spec);
}

async function rectOfLocator(loc) {
  const r = await loc.boundingBox();
  return r
    ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
    : null;
}

async function shot(page, name, { fullPage = false } = {}) {
  await stabilize(page);
  await page.screenshot({
    path: join(OUT, `${name}.png`),
    fullPage,
    animations: "disabled"
  });
  console.log(`captured ${name}.png${fullPage ? " (full page)" : ""}`);
}

async function waitForGrid(page) {
  await page.waitForSelector("#solution-desktop-grid .solution-sticky-note", {
    timeout: 20000
  });
}

async function scrollUntil(page, selector, { step = 600, max = 12 } = {}) {
  for (let i = 0; i < max; i++) {
    if (await page.locator(selector).first().isVisible().catch(() => false)) return true;
    await page.evaluate((s) => window.scrollBy(0, s), step);
    await page.waitForTimeout(500);
  }
  return false;
}

// ---------------------------------------------------------------------------
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

// ===== 4.1 + 4.3 BEFORE: home, solution grid centered ========================
await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
await waitForGrid(page);
await page.locator("#solution-desktop-grid").scrollIntoViewIfNeeded();
await page.evaluate(() => {
  const el = document.querySelector("#solution-desktop-grid");
  const r = el.getBoundingClientRect();
  window.scrollBy(0, r.top + r.height / 2 - window.innerHeight / 2);
});
await page.waitForTimeout(600);
await shot(page, "home-grid");
geometry["home-grid"] = await vrects(page, { grid: "#solution-desktop-grid" });
geometry["home-grid"].couponCta = await rectOfLocator(
  page.locator("#solution-desktop-grid").getByText("Apply My Coupon", { exact: false }).first()
);
geometry["home-grid"].tipCta = await rectOfLocator(
  page.locator("#solution-desktop-grid").getByText("Calculate My Tip", { exact: false }).first()
);

// ===== 4.1 AFTER: real click on "Apply My Coupon" -> decreased-value =========
await page
  .locator("#solution-desktop-grid")
  .getByText("Apply My Coupon", { exact: false })
  .first()
  .click();
await page.waitForURL(/decreased-value-calculator/, { timeout: 15000 });
await acceptCookies(page);
await page.waitForTimeout(1500); // prefill + result compute + banner mutation
await page.evaluate(() => window.scrollTo(0, 0));
await shot(page, "dec-after-coupon");
geometry["dec-after-coupon"] = await vrects(page, {
  card: "[data-calculator-id]",
  result: "#dec-new"
});

// ===== 4.3 AFTER: real click on "Calculate My Tip" -> basic-percentage =======
await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await waitForGrid(page);
await page.evaluate(() => {
  const el = document.querySelector("#solution-desktop-grid");
  const r = el.getBoundingClientRect();
  window.scrollBy(0, r.top + r.height / 2 - window.innerHeight / 2);
});
await page.waitForTimeout(600);
await page
  .locator("#solution-desktop-grid")
  .getByText("Calculate My Tip", { exact: false })
  .first()
  .click();
await page.waitForURL(/basic-percentage-calculator/, { timeout: 15000 });
await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollTo(0, 0));
await shot(page, "basic-after-tip");
geometry["basic-after-tip"] = await vrects(page, {
  card: "[data-calculator-id]",
  result: "#basic-result"
});

// ===== 4.7 AFTER: real click on "Calculate Total Price" -> increased-value ===
await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await waitForGrid(page);
await page.evaluate(() => {
  const el = document.querySelector("#solution-desktop-grid");
  const r = el.getBoundingClientRect();
  window.scrollBy(0, r.top + r.height / 2 - window.innerHeight / 2);
});
await page.waitForTimeout(600);
await page
  .locator("#solution-desktop-grid")
  .getByText("Calculate Total Price", { exact: false })
  .first()
  .click();
await page.waitForURL(/increased-value-calculator/, { timeout: 15000 });
await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollTo(0, 0));
await shot(page, "inc-after-tax");
geometry["inc-after-tax"] = await vrects(page, {
  card: "[data-calculator-id]",
  result: "#inc-new"
});

// ===== 4.7 + 4.2 BEFORE: increased-value default state =======================
await page.goto(`${BASE}/increased-value-calculator/?noredirect`, {
  waitUntil: "domcontentloaded"
});
await acceptCookies(page);
await page.evaluate(() => window.scrollTo(0, 0));
await shot(page, "inc-default");
geometry["inc-default"] = await vrects(page, {
  card: "[data-calculator-id]",
  result: "#inc-new"
});

// ===== 4.2 BEFORE: Practical Uses list visible (deferred mount -> scroll) ====
const found = await scrollUntil(page, ".practical-use--interactive");
if (!found) throw new Error("Practical Uses never mounted");
const budget = page
  .locator(".practical-use--interactive", { hasText: "Budget Boost" })
  .first();
await budget.scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, -180)); // keep some calc context above
await page.waitForTimeout(600);
await shot(page, "inc-pu-list");
geometry["inc-pu-list"] = await vrects(page, { helpPanel: ".help-panel" });
geometry["inc-pu-list"].budgetRow = await rectOfLocator(budget);

// ===== 4.2 AFTER: real PU click -> values fill, pinned banner ================
await budget.click();
await page.waitForTimeout(1800); // fill + compute + pin mutation settles
await page.evaluate(() => window.scrollTo(0, 0));
await shot(page, "inc-pu-after");
geometry["inc-pu-after"] = await vrects(page, {
  card: "[data-calculator-id]",
  result: "#inc-new"
});

// ===== 4.6: percentage-change default vs rent-hike (aligned pair) ============
await page.goto(`${BASE}/percentage-change-calculator/?noredirect`, {
  waitUntil: "domcontentloaded"
});
await page.evaluate(() => window.scrollTo(0, 0));
await shot(page, "change-default");
geometry["change-default"] = await vrects(page, {
  card: "[data-calculator-id]",
  result: "#change-result"
});

await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await waitForGrid(page);
await page.evaluate(() => {
  const el = document.querySelector("#solution-desktop-grid");
  const r = el.getBoundingClientRect();
  window.scrollBy(0, r.top + r.height / 2 - window.innerHeight / 2);
});
await page.waitForTimeout(600);
await page
  .locator("#solution-desktop-grid")
  .getByText("See % Change", { exact: false })
  .first()
  .click();
await page.waitForURL(/percentage-change-calculator/, { timeout: 15000 });
await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollTo(0, 0));
await shot(page, "change-after-renthike");
geometry["change-after-renthike"] = await vrects(page, {
  card: "[data-calculator-id]",
  result: "#change-result"
});

// ===== 4.5: search box — empty -> portal -> selected (data) ==================
await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await waitForGrid(page);
await page.evaluate(() => window.scrollTo(0, 0));
await page.click("#calculator-search");
await page.waitForTimeout(400);
await shot(page, "home-search-focused");
geometry["home-search-focused"] = await vrects(page, {
  searchBox: "#calculator-search"
});

await page.keyboard.type("tip", { delay: 90 });
await page.waitForTimeout(1200); // results portal opens
await stabilize(page);
await page.screenshot({
  path: join(OUT, "home-search-portal.png"),
  animations: "disabled"
});
console.log("captured home-search-portal.png");
geometry["home-search-portal"] = await vrects(page, {
  searchBox: "#calculator-search",
  portal: "#search-results-list-portal"
});
geometry["home-search-portal"].firstRow = await rectOfLocator(
  page.locator("#search-results-list-portal [role='option']").first()
);

// app's own demo pattern: ArrowDown + Enter selects first result and
// scrolls the homepage to the matching calculator with the PU pinned
await page.keyboard.press("ArrowDown");
await page.waitForTimeout(250);
await page.keyboard.press("Enter");
await page.waitForTimeout(1800); // scroll + pin + fill + compute settles
await shot(page, "home-search-selected");
geometry["home-search-selected"] = await vrects(page, {
  activeCard: "[data-calculator-id]",
  pinnedUse: ".practical-use--pinned"
});

// ===== 4.4: FAQ index -> bill-splitting article ==============================
await page.goto(`${BASE}/faqs/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
const faqLink = page.locator("a[href*='bill-splitting']").first();
await faqLink.scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, -120));
await page.waitForTimeout(600);
await shot(page, "faqs-index");
geometry["faqs-index"] = await vrects(page, { heading: "h1" });
geometry["faqs-index"].billCard = await rectOfLocator(faqLink);

await faqLink.click();
await page.waitForURL(/bill-splitting-calculator/, { timeout: 15000 });
await stabilize(page);
await page.evaluate(() => window.scrollTo(0, 0));
await shot(page, "faq-bill-splitting", { fullPage: true });
geometry["faq-bill-splitting"] = await vrects(page, { heading: "h1" });
geometry["faq-bill-splitting"].pageH = await page.evaluate(
  () => document.documentElement.scrollHeight
);

writeFileSync(join(OUT, "geometry.json"), JSON.stringify(geometry, null, 2));
console.log("geometry.json written");
await browser.close();
