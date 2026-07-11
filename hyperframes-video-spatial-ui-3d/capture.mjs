// Film 1 — "Spatial UI & 3D Screencasting" — source-frame capture.
// Captures justpercent.com (US locale) mobile states at 432×768 CSS px,
// deviceScaleFactor 2.5 → PNGs are exactly 1080×1920 (9:16 Shorts).
//
// Every screenshot is taken ONLY after full stabilization:
//   network idle ≥ 500ms, document.fonts.ready, all images decoded,
//   no active finite CSS/JS animations, zero layout shift ≥ 500ms.
// After every click that mutates the DOM the new structure settles first.
// Never captures mid-transition.
//
// Layered capture (for the Layer Peel effect): per-element clips via
// page.screenshot({clip}) + a background plate with those elements
// visibility:hidden (Technique-8 pattern).
//
// Run: node capture.mjs [sections]   sections ⊆ "hd" (h=home, d=dec), default all
//      both themes are captured in every run.

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
const RUN = new Set((process.argv[2] || "hd").split(""));

let geometry = {};
try {
  geometry = JSON.parse(readFileSync(join(OUT, "geometry.json"), "utf8"));
} catch {}
const saveGeo = () => {
  writeFileSync(join(OUT, "geometry.json"), JSON.stringify(geometry, null, 2));
  // baked JS mirror so the player works from file:// without fetch()
  writeFileSync(
    join(ROOT, "geometry.js"),
    "window.F1GEO = " + JSON.stringify(geometry, null, 2) + ";\n"
  );
};

// ---- capture guard (stabilization) ----------------------------------------
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

// ---------------------------------------------------------------------------
const browser = await chromium.launch();

for (const theme of ["dark", "light"]) {
  const T = theme;
  geometry[T] ||= {};

  // ============ H. HOME — plate + peel layers ==============================
  const ctx = await newThemeContext(browser, theme);
  const page = await ctx.newPage();

  if (RUN.has("h") || RUN.has("d")) {
    await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
    await acceptCookies(page);
    await page.waitForSelector("#solution-mobile-grid .solution-sticky-note", {
      timeout: 15000
    });
    await stabilize(page);
  }

  if (RUN.has("h")) {
    // collect layer targets (viewport CSS-px rects)
    const layers = await page.evaluate(() => {
      const out = {};
      const grab = (key, el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) return;
        out[key] = {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height)
        };
      };
      grab("header", document.querySelector("header"));
      grab("h1", document.querySelector("h1"));
      // the visual search panel = closest padded container of the input
      const search = document.querySelector("#calculator-search");
      grab("search", search ? search.closest("div") : null);
      // All / Favorites toggle: closest container of the Favorites button
      const fav = [...document.querySelectorAll("button")].find((b) =>
        /favorites/i.test(b.textContent || "")
      );
      grab("toggle", fav ? fav.parentElement : null);
      const cards = [
        ...document.querySelectorAll(
          "#solution-mobile-grid .solution-sticky-note"
        )
      ];
      cards.slice(0, 4).forEach((c, i) => {
        grab(`card${i}`, c);
        const cta = c.querySelector(".solution-cta-button");
        if (cta) {
          const r = cta.getBoundingClientRect();
          out[`card${i}`].cta = (cta.textContent || "").trim();
          out[`card${i}`].ctaCx = Math.round(r.x + r.width / 2);
          out[`card${i}`].ctaCy = Math.round(r.y + r.height / 2);
        }
      });
      return out;
    });
    geometry[T].home = { layers };

    await shot(page, `home-plate-${T}`);

    // per-layer clips
    for (const [key, r] of Object.entries(layers)) {
      geometry[T].home.layers[key].clip = await clipShot(
        page,
        `home-layer-${key}-${T}`,
        r
      );
    }

    // background plate with peel layers hidden
    await page.evaluate(() => {
      const hide = [];
      const push = (el) => el && hide.push(el);
      push(document.querySelector("header"));
      push(document.querySelector("h1"));
      const search = document.querySelector("#calculator-search");
      push(search ? search.closest("div") : null);
      const fav = [...document.querySelectorAll("button")].find((b) =>
        /favorites/i.test(b.textContent || "")
      );
      push(fav ? fav.parentElement : null);
      [
        ...document.querySelectorAll(
          "#solution-mobile-grid .solution-sticky-note"
        )
      ]
        .slice(0, 4)
        .forEach((c) => push(c));
      window.__hidden = hide;
      hide.forEach((el) => (el.style.visibility = "hidden"));
    });
    await page.waitForTimeout(300);
    await shot(page, `home-bg-${T}`, { settle: false });
    await page.evaluate(() => {
      (window.__hidden || []).forEach((el) => (el.style.visibility = ""));
    });
    await page.waitForTimeout(200);
    saveGeo();
  }

  // ============ D. Coupon card click → Value Decrease ======================
  if (RUN.has("d")) {
    // genuine user flow: click the "Apply My Coupon" CTA on the mobile card
    const cta = page
      .locator("#solution-mobile-grid .solution-sticky-note")
      .filter({ hasText: "Apply My Coupon" })
      .first()
      .locator(".solution-cta-button");
    await cta.click();
    await page.waitForURL(/decreased-value-calculator/, { timeout: 20000 });
    await acceptCookies(page);
    await stabilize(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    const dec = {};
    dec.hint = await rectOf(page, ".solution-card-hint.visible");
    dec.h1 = await rectOf(page, "h1");
    dec.card = await rectOf(page, "[data-calculator-id]");
    dec.original = await rectOf(page, "#decreased-value-original-input");
    dec.percent = await rectOf(page, "#decreased-value-percentage-input");
    dec.result = await rectOf(page, "#decreased-value-result");
    dec.values = await page.evaluate(() => ({
      original: document.querySelector("#decreased-value-original-input")
        ?.value,
      percent: document.querySelector("#decreased-value-percentage-input")
        ?.value,
      result: document.querySelector("#decreased-value-result")?.value
    }));
    geometry[T].dec = dec;

    await shot(page, `dec-plate-${T}`);

    // glass-panel layer clips (input rows padded to include their labels)
    if (dec.hint)
      dec.hintClip = await clipShot(page, `dec-layer-hint-${T}`, dec.hint, 4);
    if (dec.original)
      dec.originalClip = await clipShot(
        page,
        `dec-layer-original-${T}`,
        dec.original,
        10
      );
    if (dec.percent)
      dec.percentClip = await clipShot(
        page,
        `dec-layer-percent-${T}`,
        dec.percent,
        10
      );
    if (dec.result)
      dec.resultClip = await clipShot(
        page,
        `dec-layer-result-${T}`,
        dec.result,
        10
      );

    // background plate with the floating panels hidden
    await page.evaluate(() => {
      const hide = [];
      const push = (s) => {
        const el = document.querySelector(s);
        if (el) hide.push(el);
      };
      push(".solution-card-hint.visible");
      window.__hidden = hide;
      hide.forEach((el) => (el.style.visibility = "hidden"));
    });
    await page.waitForTimeout(300);
    await shot(page, `dec-bg-${T}`, { settle: false });
    await page.evaluate(() => {
      (window.__hidden || []).forEach((el) => (el.style.visibility = ""));
    });
    saveGeo();
  }

  await ctx.close();
}

saveGeo();
console.log("geometry.json written");
await browser.close();
