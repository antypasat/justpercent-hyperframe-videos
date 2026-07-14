// Re-capture frames that were contaminated by persisted localStorage state
// (SolutionCard hint banners + prefills survive navigation within a profile)
// or badly framed. Each group runs in a FRESH browser context. Same capture
// guard as capture.mjs: capture only after full stabilization.
//
// Run: node capture-fix.mjs

import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(
  "/Users/michael/startups/percentage-calculator/handy-percent/package.json"
);
const { chromium } = require("@playwright/test");

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "assets");
const BASE = "https://justpercent.com";
const geometry = JSON.parse(readFileSync(join(OUT, "geometry.json"), "utf8"));

async function stabilize(page, { maxWaitMs = 20000 } = {}) {
  await page.waitForLoadState("domcontentloaded");
  try {
    await page.waitForLoadState("networkidle", { timeout: maxWaitMs });
  } catch {}
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
  await page.waitForTimeout(250);
}

async function acceptCookies(page) {
  const btn = page.getByRole("button", { name: /accept/i }).first();
  try {
    await btn.click({ timeout: 4000 });
    await page.waitForTimeout(400);
  } catch {}
}

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

async function shot(page, name) {
  await stabilize(page);
  await page.screenshot({
    path: join(OUT, `${name}.png`),
    animations: "disabled"
  });
  console.log(`captured ${name}.png`);
}

async function closeHintBanner(page) {
  // SolutionCard hint banner has a dismiss X; closing realigns layout with
  // the default (banner-free) state so before/after frames register 1:1
  const x = page
    .locator("button[aria-label*='lose'], button[aria-label*'ismiss']")
    .first();
  try {
    await x.click({ timeout: 2500 });
  } catch {
    // fallback: any button inside the hint region
    try {
      await page
        .locator("[class*='hint'] button, [id*='hint'] button")
        .first()
        .click({ timeout: 2500 });
    } catch {}
  }
  await page.waitForTimeout(600);
}

const browser = await chromium.launch();
const ctxOpts = {
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
  reducedMotion: "reduce",
  locale: "en-US",
  timezoneId: "America/New_York",
  serviceWorkers: "block"
};

async function freshPage() {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  return { ctx, page };
}

// ===== group 1: home grid, better framing (grid top at ~110px) ==============
{
  const { ctx, page } = await freshPage();
  await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
  await acceptCookies(page);
  await page.waitForSelector("#solution-desktop-grid .solution-sticky-note", {
    timeout: 20000
  });
  await page.evaluate(() => {
    const r = document
      .querySelector("#solution-desktop-grid")
      .getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - 110);
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
  await ctx.close();
}

// ===== group 2: increased-value — clean default, PU list, PU after ===========
{
  const { ctx, page } = await freshPage();
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

  // PU list mounts lazily via IntersectionObserver — walk the page down
  for (let i = 0; i < 12; i++) {
    const n = await page.locator(".practical-use--interactive").count();
    if (n > 0) break;
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(500);
  }
  const budget = page
    .locator(".practical-use--interactive", { hasText: "Budget Boost" })
    .first();
  await budget.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" })
  );
  await page.waitForTimeout(700);
  await shot(page, "inc-pu-list");
  geometry["inc-pu-list"] = await vrects(page, {});
  geometry["inc-pu-list"].budgetRow = await rectOfLocator(budget);

  await budget.click();
  await page.waitForTimeout(1800); // fill + compute + pin mutation settles
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "inc-pu-after");
  geometry["inc-pu-after"] = await vrects(page, {
    card: "[data-calculator-id]",
    result: "#inc-new"
  });
  await ctx.close();
}

// ===== group 3: aligned AFTER frames (hint banner dismissed) =================
{
  const { ctx, page } = await freshPage();
  await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
  await acceptCookies(page);
  await page.waitForSelector("#solution-desktop-grid .solution-sticky-note", {
    timeout: 20000
  });
  await page.evaluate(() => {
    const r = document
      .querySelector("#solution-desktop-grid")
      .getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - 110);
  });
  await page.waitForTimeout(600);
  await page
    .locator("#solution-desktop-grid")
    .getByText("Calculate Total Price", { exact: false })
    .first()
    .click();
  await page.waitForURL(/increased-value-calculator/, { timeout: 15000 });
  await page.waitForTimeout(1500);
  await closeHintBanner(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "inc-after-tax-nobanner");
  geometry["inc-after-tax-nobanner"] = await vrects(page, {
    card: "[data-calculator-id]",
    result: "#inc-new"
  });

  await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#solution-desktop-grid .solution-sticky-note", {
    timeout: 20000
  });
  await page.evaluate(() => {
    const r = document
      .querySelector("#solution-desktop-grid")
      .getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - 110);
  });
  await page.waitForTimeout(600);
  await page
    .locator("#solution-desktop-grid")
    .getByText("See % Change", { exact: false })
    .first()
    .click();
  await page.waitForURL(/percentage-change-calculator/, { timeout: 15000 });
  await page.waitForTimeout(1500);
  await closeHintBanner(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "change-after-renthike-nobanner");
  geometry["change-after-renthike-nobanner"] = await vrects(page, {
    card: "[data-calculator-id]",
    result: "#change-result"
  });
  await ctx.close();
}

// ===== group 4: search flow in a clean profile ================================
{
  const { ctx, page } = await freshPage();
  await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
  await acceptCookies(page);
  await page.waitForSelector("#solution-desktop-grid .solution-sticky-note", {
    timeout: 20000
  });
  // put the search box comfortably in frame before focusing it
  await page.evaluate(() => {
    const r = document
      .querySelector("#calculator-search")
      .getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.top - 140);
  });
  await page.waitForTimeout(500);
  await page.click("#calculator-search");
  await page.waitForTimeout(600);
  await shot(page, "home-search-focused");
  geometry["home-search-focused"] = await vrects(page, {
    searchBox: "#calculator-search"
  });

  await page.keyboard.type("tip", { delay: 90 });
  await page.waitForTimeout(1200);
  await shot(page, "home-search-portal");
  geometry["home-search-portal"] = await vrects(page, {
    searchBox: "#calculator-search",
    portal: "#search-results-list-portal"
  });
  geometry["home-search-portal"].firstRow = await rectOfLocator(
    page.locator("#search-results-list-portal [role='option']").first()
  );

  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(250);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1800); // scroll + pin + fill + compute settles
  await page.evaluate(() => window.scrollBy(0, -170)); // show calc card header
  await page.waitForTimeout(600);
  await shot(page, "home-search-selected");
  geometry["home-search-selected"] = await vrects(page, {
    activeCard: "[data-calculator-id]",
    pinnedUse: ".practical-use--pinned"
  });
  await ctx.close();
}

writeFileSync(join(OUT, "geometry.json"), JSON.stringify(geometry, null, 2));
console.log("geometry.json updated");
await browser.close();
