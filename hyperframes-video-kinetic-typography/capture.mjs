// Film 2 — "Kinetic Typography & Font Bending" — source-frame capture.
// Captures justpercent.com (US locale) mobile states at 432×768 CSS px,
// deviceScaleFactor 2.5 → PNGs exactly 1080×1920 (9:16 Shorts).
//
// Every screenshot taken ONLY after full stabilization: network idle ≥500ms,
// document.fonts.ready, all images decoded, no active finite animations,
// zero layout shift ≥500ms. Exception (documented): the per-keystroke search
// states — the app RE-SELECTS the input content ~1s after typing pauses, so
// the page is FULLY stabilized *before* typing, then only the typed text +
// dropdown portal change; we run a light animation-quiet guard + fixed settle
// and shoot within the <1s window. Never mid-transition.
//
// Sections (argv[1], default "hks"):
//   h = home top + search focused
//   k = per-keystroke "t" / "ti" / "tip" (fresh context each — localStorage!)
//   s = keyboard-select "Restaurant Tip" → pinned basic calculator 15/60→9
//
// Run: node capture.mjs [hks]

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
const RUN = new Set((process.argv[2] || "hks").split(""));

let geometry = {};
try {
  geometry = JSON.parse(readFileSync(join(OUT, "geometry.json"), "utf8"));
} catch {}
const saveGeo = () => {
  writeFileSync(join(OUT, "geometry.json"), JSON.stringify(geometry, null, 2));
  // baked JS mirror so the player works from file:// without fetch()
  writeFileSync(
    join(ROOT, "geometry.js"),
    "window.F2GEO = " + JSON.stringify(geometry, null, 2) + ";\n"
  );
};

// ---- capture guard (stabilization) — copied verbatim from Film 1 ----------
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

// light guard for the keystroke window: finite animations quiet (fast)
async function animQuiet(page, maxWaitMs = 2500) {
  await page.evaluate(
    (maxWaitMs) =>
      new Promise((resolve) => {
        const start = performance.now();
        const check = () => {
          const busy = document
            .getAnimations()
            .filter(
              (a) =>
                a.playState === "running" &&
                Number.isFinite(a.effect?.getTiming().iterations)
            ).length;
          if (!busy || performance.now() - start > maxWaitMs) resolve();
          else setTimeout(check, 60);
        };
        check();
      }),
    maxWaitMs
  );
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

async function shot(page, name, { settle = true } = {}) {
  if (settle) await stabilize(page);
  await page.screenshot({
    path: join(OUT, `${name}.png`),
    fullPage: false,
    animations: "disabled"
  });
  console.log(`captured ${name}.png`);
}

async function clipShot(page, name, r, pad = 2) {
  const clip = {
    x: Math.max(0, r.x - pad),
    y: Math.max(0, r.y - pad),
    width: Math.min(432, r.w + pad * 2),
    height: r.h + pad * 2
  };
  await page.screenshot({ path: join(OUT, `${name}.png`), clip });
  console.log(`captured ${name}.png (clip)`);
  return { x: clip.x, y: clip.y, w: clip.width, h: clip.height };
}

async function newThemeContext(browser, theme) {
  const ctx = await browser.newContext({
    viewport: { width: 432, height: 768 },
    deviceScaleFactor: 2.5,
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

const rectOf = (page, sel) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height)
    };
  }, sel);

async function freshHome(browser, theme) {
  const ctx = await newThemeContext(browser, theme);
  const page = await ctx.newPage();
  // site chrome that must never appear in captures:
  // floating nav, minimap (wrapper + hitbox)
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const s = document.createElement("style");
      s.textContent = "#floating-nav-container, .floating-nav-container, [data-minimap-wrapper], [data-minimap-hitbox] { display: none !important; }";
      document.head.appendChild(s);
    });
  });
  await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
  await acceptCookies(page);
  await page.waitForSelector("#solution-mobile-grid .solution-sticky-note", {
    timeout: 15000
  });
  await stabilize(page);
  return { ctx, page };
}

// ---------------------------------------------------------------------------
const browser = await chromium.launch();

for (const theme of ["dark", "light"]) {
  const T = theme;
  geometry[T] ||= {};

  // ============ H. home top + search focused ==============================
  if (RUN.has("h")) {
    const { ctx, page } = await freshHome(browser, theme);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    geometry[T].home = {
      search: await rectOf(page, "#calculator-search"),
      h1: await rectOf(page, "h1")
    };
    await shot(page, `home-top-${T}`);

    // focused search (no text typed yet)
    await page.click("#calculator-search");
    await page.waitForTimeout(400);
    await stabilize(page);
    await shot(page, `search-focused-${T}`);
    await ctx.close();
    saveGeo();
  }

  // ============ K. per-keystroke "t" / "ti" / "tip" ========================
  // Fresh context per state (values persist in localStorage!). Page is fully
  // stabilized BEFORE typing; after typing only the input text + dropdown
  // portal change → light animation guard + fixed settle, shot taken within
  // the <1s window before the app re-selects the input content.
  if (RUN.has("k")) {
    geometry[T].keys = {};
    for (const prefix of ["t", "ti", "tip"]) {
      const { ctx, page } = await freshHome(browser, theme);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.click("#calculator-search");
      await page.waitForTimeout(250);
      await page
        .locator("#calculator-search")
        .pressSequentially(prefix, { delay: 70 });
      await page.waitForSelector("#search-results-list-portal li", {
        timeout: 6000
      });
      await animQuiet(page);
      await page.waitForTimeout(500);
      await shot(page, `key-${prefix}-${T}`, { settle: false });
      geometry[T].keys[prefix] = {
        search: await rectOf(page, "#calculator-search"),
        portal: await rectOf(page, "#search-results-list-portal"),
        rows: await page.evaluate(() =>
          [...document.querySelectorAll("#search-results-list-portal li")].map(
            (li) => (li.textContent || "").replace(/\s+/g, " ").trim().slice(0, 70)
          )
        )
      };
      console.log(
        `  [${T}/${prefix}] rows:`,
        JSON.stringify(geometry[T].keys[prefix].rows)
      );
      await ctx.close();
      saveGeo();
    }
  }

  // ============ S. keyboard-select "Restaurant Tip" ========================
  // ArrowDown+Enter on #calculator-search → input clears, page auto-scrolls
  // to the homepage basic calculator, fills 15 / 60 → 9, pins the
  // "Selected Practical Use Example" banner.
  if (RUN.has("s")) {
    const { ctx, page } = await freshHome(browser, theme);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.click("#calculator-search");
    await page.waitForTimeout(250);
    await page
      .locator("#calculator-search")
      .pressSequentially("tip", { delay: 70 });
    await page.waitForSelector("#search-results-list-portal li", {
      timeout: 6000
    });
    await page.waitForTimeout(350);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(200);
    await page.keyboard.press("Enter");
    await page.waitForFunction(
      () => /Selected Practical Use Example/i.test(document.body.innerText),
      null,
      { timeout: 10000 }
    );
    await stabilize(page); // full guard after the DOM-mutating selection
    // the auto-scroll leaves the filled inputs + pinned banner just above the
    // viewport — nudge up (genuine user scroll) so banner/15/60/9 all frame
    await page.evaluate(() => window.scrollBy(0, -320));
    await page.waitForTimeout(400);
    await stabilize(page);

    const info = await page.evaluate(() => {
      const rect = (el) => {
        const r = el.getBoundingClientRect();
        return {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height)
        };
      };
      const inVp = (r) => r.y + r.h > 0 && r.y < innerHeight && r.w > 0;
      const cards = [...document.querySelectorAll("[data-calculator-id]")]
        .map((el) => ({
          id: el.getAttribute("data-calculator-id"),
          r: rect(el),
          inputs: [...el.querySelectorAll("input")].map((i) => ({
            id: i.id,
            value: i.value,
            r: rect(i)
          }))
        }))
        .filter((c) => inVp(c.r));
      // pinned banner: smallest element containing the banner text
      let banner = null,
        bannerArea = Infinity;
      for (const el of document.querySelectorAll("div,section,p,span")) {
        if (/Selected Practical Use Example/i.test(el.textContent || "")) {
          const r = el.getBoundingClientRect();
          const a = r.width * r.height;
          if (a > 0 && a < bannerArea) {
            bannerArea = a;
            banner = rect(el);
          }
        }
      }
      return { scrollY: Math.round(scrollY), cards, banner };
    });
    console.log(`  [${T}/selected]`, JSON.stringify(info, null, 2));
    geometry[T].selected = info;
    await shot(page, `selected-${T}`);

    // punch-in clips: calculator card + result region
    const card = info.cards.find((c) => c.inputs.length >= 2) || info.cards[0];
    if (card) {
      geometry[T].selected.cardClip = await clipShot(
        page,
        `selected-card-${T}`,
        card.r,
        6
      );
      const result = card.inputs.find((i) => /result/i.test(i.id || ""));
      if (result) {
        geometry[T].selected.resultClip = await clipShot(
          page,
          `selected-result-${T}`,
          result.r,
          10
        );
        geometry[T].selected.resultValue = result.value;
      }
    }
    if (info.banner) {
      geometry[T].selected.bannerClip = await clipShot(
        page,
        `selected-banner-${T}`,
        info.banner,
        4
      );
    }
    await ctx.close();
    saveGeo();
  }
}

saveGeo();
console.log("geometry.json written");
await browser.close();
