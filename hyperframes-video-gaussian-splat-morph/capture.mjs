// Film 6 — "Gaussian Splatting & AI Morphing" — source-frame capture.
// Captures justpercent.com (US locale) mobile states at 432×768 CSS px.
// Two kinds of assets per page & theme:
//   tex-*  fullPage texture for the strip fly-through (dsf auto-lowered so
//          pageH × dsf ≤ 16000 px — Chromium texture limit guard; the player
//          normalizes via background-size:1080px auto, so math is dsf-free)
//   top-*  1080×1920 viewport plate of the page top (pull-back slabs)
// Geometry: page heights, texScale used, document-space rects of hero
// elements (drive the depth profile + focus racks).
//
// Every screenshot only after full stabilization (network idle ≥500ms,
// fonts.ready, images decoded, no finite animations, CLS quiet ≥500ms).
// Run: node capture.mjs [sections]  sections ⊆ "hif"  (home/inc/faq). Default all.

import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
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
const RUN = new Set((process.argv[2] || "hif").split(""));

let geometry = {};
try {
  geometry = JSON.parse(readFileSync(join(OUT, "geometry.json"), "utf8"));
} catch {}
const saveGeo = () => {
  writeFileSync(join(OUT, "geometry.json"), JSON.stringify(geometry, null, 2));
  writeFileSync(
    join(ROOT, "geometry.js"),
    "window.F6GEO = " + JSON.stringify(geometry, null, 2) + ";\n"
  );
};

// ---- capture guard (stabilization) — Film 1 verbatim -----------------------
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
                Number.isFinite(a.effect?.getTiming().iterations)
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
  try {
    await page
      .getByRole("button", { name: /accept/i })
      .first()
      .click({ timeout: 4000 });
    await page.waitForTimeout(400);
  } catch {}
  await page.addStyleTag({
    content: ".cky-btn-revisit-wrapper{display:none!important}"
  });
}

async function newThemeContext(browser, theme, dsf = 2.5) {
  const ctx = await browser.newContext({
    viewport: { width: 432, height: 768 },
    deviceScaleFactor: dsf,
    reducedMotion: "reduce",
    locale: "en-US",
    timezoneId: "America/New_York",
    serviceWorkers: "block"
  });
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem(
        "jp:config:v1",
        JSON.stringify({ theme: t, locale: "us" })
      );
    } catch {}
  }, theme);
  return ctx;
}

// document-space rects (page must be scrolled to 0,0 first)
const docRects = (page, sels) =>
  page.evaluate((sels) => {
    const out = {};
    for (const [key, sel] of Object.entries(sels)) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      out[key] = {
        x: Math.round(r.x),
        y: Math.round(r.y + window.scrollY),
        w: Math.round(r.width),
        h: Math.round(r.height)
      };
    }
    out.pageH = document.documentElement.scrollHeight;
    return out;
  }, sels);

const pageHeight = (page) =>
  page.evaluate(() => document.documentElement.scrollHeight);

// pick largest dsf from the ladder that keeps the texture under the limit
const texDsf = (pageH) =>
  [2.5, 2, 1.5, 1.25, 1].find((d) => pageH * d <= 16000) || 1;

const blurActive = (page) =>
  page.evaluate(() => {
    document.activeElement?.blur?.();
    const sel = window.getSelection?.();
    sel?.removeAllRanges?.();
  });

async function topShot(page, name) {
  await blurActive(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await stabilize(page);
  await page.screenshot({
    path: join(OUT, `${name}.png`),
    fullPage: false,
    animations: "disabled"
  });
  console.log(`captured ${name}.png`);
}

async function texShot(page, name) {
  await blurActive(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await stabilize(page);
  await page.screenshot({
    path: join(OUT, `${name}.png`),
    fullPage: true,
    animations: "disabled"
  });
  console.log(`captured ${name}.png (fullPage)`);
}

// per-page flows -------------------------------------------------------------

async function prepHome(page) {
  await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
  await acceptCookies(page);
  await page.waitForSelector("#solution-mobile-grid .solution-sticky-note", {
    timeout: 15000
  });
  await stabilize(page);
}

async function prepInc(page) {
  // Budget Boost pinned: 5,000 + 25% = 6,250
  await page.goto(`${BASE}/increased-value-calculator/?noredirect`, {
    waitUntil: "domcontentloaded"
  });
  await acceptCookies(page);
  await stabilize(page);
  // PUs mount lazily — scroll down in steps until interactive rows exist
  let found = false;
  for (let i = 1; i <= 20 && !found; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), 600 * i);
    await page.waitForTimeout(450);
    found = await page.evaluate(
      () => !!document.querySelector(".practical-use--interactive")
    );
  }
  if (!found) throw new Error("practical uses never mounted");
  const budget = page
    .locator(".practical-use--interactive")
    .filter({ hasText: /budget boost/i })
    .first();
  await budget.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await budget.click();
  await page.waitForTimeout(1800); // auto-fill + scroll-top + banner
  await stabilize(page);
  const values = await page.evaluate(() => ({
    original: document.querySelector("#increased-value-original-input")?.value,
    percent: document.querySelector("#increased-value-percentage-input")?.value,
    result: document.querySelector("#increased-value-result")?.value
  }));
  console.log("inc pinned values:", JSON.stringify(values));
  return values;
}

async function prepFaq(page) {
  // live FAQ: 150 / 10 → 15
  await page.goto(`${BASE}/faqs/tip-calculation-calculator/?noredirect`, {
    waitUntil: "domcontentloaded"
  });
  await acceptCookies(page);
  await stabilize(page);
  // page ships with the exact demo state we want: 150 / 10 → 15.
  // Do NOT type — the autosize/masked inputs mangle programmatic keystrokes.
  await page.waitForTimeout(1200);
  const values = await page.evaluate(() => ({
    bill: document.querySelector("#tip-bill-amount")?.value,
    pct: document.querySelector("#tip-percent")?.value,
    result: document.querySelector("#tip-result")?.value ??
      document.querySelector("#tip-result")?.textContent?.trim()
  }));
  console.log("faq values:", JSON.stringify(values));
  return values;
}

const HOME_SELS = {
  h1: "h1",
  search: "#calculator-search",
  grid: "#solution-mobile-grid"
};
const INC_SELS = {
  h1: "h1",
  original: "#increased-value-original-input",
  percent: "#increased-value-percentage-input",
  result: "#increased-value-result",
  pinned: ".practical-use--pinned"
};
const FAQ_SELS = {
  h1: "h1",
  bill: "#tip-bill-amount",
  pct: "#tip-percent",
  result: "#tip-result"
};

// ---------------------------------------------------------------------------
const browser = await chromium.launch();

for (const theme of ["dark", "light"]) {
  const T = theme;
  geometry[T] ||= {};

  const sections = [
    { key: "h", name: "home", prep: prepHome, sels: HOME_SELS },
    { key: "i", name: "inc", prep: prepInc, sels: INC_SELS },
    { key: "f", name: "faq", prep: prepFaq, sels: FAQ_SELS }
  ];

  for (const s of sections) {
    if (!RUN.has(s.key)) continue;

    // pass 1 — dsf 2.5: run flow, top plate, rects, measure page height
    let ctx = await newThemeContext(browser, theme);
    let page = await ctx.newPage();
    await s.prep(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    const rects = await docRects(page, s.sels);
    await topShot(page, `top-${s.name}-${T}`);
    const pageH = await pageHeight(page);
    const dsf = texDsf(pageH);
    if (dsf === 2.5) {
      await texShot(page, `tex-${s.name}-${T}`);
    }
    await ctx.close();

    // pass 2 — lower dsf texture when the page is too tall
    if (dsf !== 2.5) {
      ctx = await newThemeContext(browser, theme, dsf);
      page = await ctx.newPage();
      await s.prep(page);
      await texShot(page, `tex-${s.name}-${T}`);
      await ctx.close();
    }

    geometry[T][s.name] = { ...rects, texScale: dsf };
    console.log(
      `${s.name}-${T}: pageH=${pageH} texDsf=${dsf} rects=${Object.keys(rects).join(",")}`
    );
    saveGeo();
  }
}

saveGeo();
console.log("geometry.json written");
await browser.close();
