// Film 6 — "Gaussian Splatting & AI Morphing" — source-frame capture.
// Captures justpercent.com (US locale) mobile states at 432×768 CSS px,
// deviceScaleFactor 2.5 → PNGs are exactly 1080×1920 (9:16 Shorts).
// Additionally exports, per captured plate and theme, a downsampled pixel grid
// assets/splats-<scene>-<theme>.json (90×160 cells ≈ 14.4k points) sampled in
// Node via a Playwright scratch page (data: URL image → canvas, never a
// CORS-tainted file:// canvas), plus a baked splats.js mirror for file://.
//
// Every screenshot is taken ONLY after full stabilization:
//   network idle ≥ 500ms, document.fonts.ready, all images decoded,
//   no active finite CSS/JS animations, zero layout shift ≥ 500ms.
// After every click that mutates the DOM the new structure settles first.
// Never captures mid-transition.
//
// Run: node capture.mjs [sections]  sections ⊆ "hcpfs"
//      h=home(+card crop), c=genuine card click → calculator, p=Practical Uses
//      unpinned/pinned + result crop, f=FAQ page, s=splat grids (from PNGs).
//      Both themes are captured in every run.

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
const RUN = new Set((process.argv[2] || "hcpfs").split(""));

// the film's featured card (not yet used by films 1–5) + its contract
const CARD_TEXT = "See My New Pay";
const VERIFIED_ROUTES = [
  "basic-percentage-calculator",
  "increased-value-calculator",
  "decreased-value-calculator",
  "percentage-change-calculator",
  "original-value-calculator",
  "part-to-whole-percentage-calculator",
  "original-before-decrease-calculator",
  "original-before-increase-calculator"
];
const FAQ_SLUG = "salary-raise-calculator"; // exists in handy-percent/src/pages/faqs/

let geometry = {};
try {
  geometry = JSON.parse(readFileSync(join(OUT, "geometry.json"), "utf8"));
} catch {}
const saveGeo = () => {
  writeFileSync(join(OUT, "geometry.json"), JSON.stringify(geometry, null, 2));
  // baked JS mirror so the player works from file:// without fetch()
  writeFileSync(
    join(ROOT, "geometry.js"),
    "window.F6GEO = " + JSON.stringify(geometry, null, 2) + ";\n"
  );
};

// ---- capture guard (stabilization) — Film 5 verbatim -----------------------
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

// site chrome that must never appear in captures:
// floating nav, minimap (wrapper + hitbox)
const hideChrome = (page) =>
  page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const s = document.createElement("style");
      s.textContent = "#floating-nav-container, .floating-nav-container, [data-minimap-wrapper], [data-minimap-hitbox] { display: none !important; }";
      document.head.appendChild(s);
    });
  });

// ---- splat grid sampling (Node-side; scratch page + data: URL) -------------
// 90×160 grid over the 1080×1920 plate → 14 400 points, cell 12×12 px.
// Per cell: mean of a 2×2 pixel block at the cell center. Stored as base64
// RGB triplets, row-major; x/y are implicit ((col+.5)*12, (row+.5)*12) and
// lum is derived in the player — same data as {x,y,rgb,lum}, 10× smaller.
const GRID = { cols: 90, rows: 160, cellW: 12, cellH: 12 };

async function sampleSplats(scratch, pngName) {
  const b64 = readFileSync(join(OUT, `${pngName}.png`)).toString("base64");
  return await scratch.evaluate(
    async ({ b64, g }) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64;
      await img.decode();
      const cv = document.createElement("canvas");
      cv.width = img.naturalWidth;
      cv.height = img.naturalHeight;
      const cx = cv.getContext("2d", { willReadFrequently: true });
      cx.drawImage(img, 0, 0);
      const data = cx.getImageData(0, 0, cv.width, cv.height).data;
      const out = new Uint8Array(g.cols * g.rows * 3);
      const px = (x, y) => {
        const i =
          (Math.min(cv.height - 1, y) * cv.width + Math.min(cv.width - 1, x)) * 4;
        return [data[i], data[i + 1], data[i + 2]];
      };
      let o = 0;
      for (let r = 0; r < g.rows; r++) {
        for (let c = 0; c < g.cols; c++) {
          const cxp = Math.round((c + 0.5) * g.cellW);
          const cyp = Math.round((r + 0.5) * g.cellH);
          let R = 0, G = 0, B = 0;
          for (const [dx, dy] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) {
            const p = px(cxp + dx, cyp + dy);
            R += p[0]; G += p[1]; B += p[2];
          }
          out[o++] = R >> 2; out[o++] = G >> 2; out[o++] = B >> 2;
        }
      }
      let s = "";
      for (let i = 0; i < out.length; i += 0x8000)
        s += String.fromCharCode(...out.subarray(i, i + 0x8000));
      return btoa(s);
    },
    { b64, g: GRID }
  );
}

// ---------------------------------------------------------------------------
const browser = await chromium.launch();

for (const theme of ["dark", "light"]) {
  const T = theme;
  geometry[T] ||= {};

  // ============ H + C + P. HOME → genuine card click → calculator → PU =====
  if (RUN.has("h") || RUN.has("c") || RUN.has("p")) {
    const ctx = await newThemeContext(browser, theme);
    const page = await ctx.newPage();
    await hideChrome(page);
    await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
    await acceptCookies(page);
    await page.waitForSelector("#solution-mobile-grid .solution-sticky-note", {
      timeout: 15000
    });
    await stabilize(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    if (RUN.has("h")) {
      const home = {};
      await shot(page, `home-plate-${T}`);

      // the featured "See My New Pay" (salary raise) card sits below the fold:
      // scroll it to the viewport center → second "grid" plate for the dolly
      home.gridScrollY = await page.evaluate((cardText) => {
        const cards = [
          ...document.querySelectorAll(
            "#solution-mobile-grid .solution-sticky-note"
          )
        ];
        const card = cards.find((c) =>
          (c.textContent || "").includes(cardText)
        );
        if (!card) return null;
        const r = card.getBoundingClientRect();
        const y = Math.round(r.top + window.scrollY - (768 - r.height) / 2);
        window.scrollTo(0, y);
        return y;
      }, CARD_TEXT);
      if (home.gridScrollY == null)
        throw new Error(`card "${CARD_TEXT}" not found on home`);
      await stabilize(page);
      await page.evaluate((y) => window.scrollTo(0, y), home.gridScrollY);
      await page.waitForTimeout(600);
      home.card = await page.evaluate((cardText) => {
        const cards = [
          ...document.querySelectorAll(
            "#solution-mobile-grid .solution-sticky-note"
          )
        ];
        const card = cards.find((c) =>
          (c.textContent || "").includes(cardText)
        );
        const rr = (el) => {
          const r = el.getBoundingClientRect();
          return {
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height)
          };
        };
        const cta = card.querySelector(".solution-cta-button");
        return { rect: rr(card), cta: cta ? rr(cta) : null };
      }, CARD_TEXT);
      geometry[T].home = home;

      await shot(page, `home-grid-plate-${T}`, { settle: false });
      home.cardClip = await clipShot(page, `card-${T}`, home.card.rect, 3);
      saveGeo();
      // back to the top so the genuine click flow starts from a clean state
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);
    }

    if (RUN.has("c") || RUN.has("p")) {
      // genuine user flow: click the card CTA → its real destination
      const cta = page
        .locator("#solution-mobile-grid .solution-sticky-note")
        .filter({ hasText: CARD_TEXT })
        .first()
        .locator(".solution-cta-button");
      await cta.click();
      await page.waitForURL(/\/[a-z-]+-calculator\//, { timeout: 20000 });
      const destUrl = page.url();
      const destRoute = (destUrl.match(/\/([a-z-]+-calculator)\//) || [])[1];
      if (!VERIFIED_ROUTES.includes(destRoute))
        throw new Error(`destination ${destUrl} is not a verified route`);
      console.log(`genuine click destination (${T}): ${destUrl}`);
      await acceptCookies(page);
      await stabilize(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);

      const calc = { url: destUrl, route: destRoute };
      calc.result = await rectOf(page, "#increased-value-result");
      calc.values = await page.evaluate(() => ({
        original: document.querySelector("#increased-value-original-input")
          ?.value,
        percent: document.querySelector("#increased-value-percentage-input")
          ?.value,
        result: document.querySelector("#increased-value-result")?.value
      }));
      geometry[T].calc = calc;
      console.log(`calc values (${T}):`, JSON.stringify(calc.values));

      if (RUN.has("c")) await shot(page, `calc-plate-${T}`);
      saveGeo();

      if (RUN.has("p")) {
        // scroll the calculator page to the Practical Uses rows: result field
        // parked in the upper third, rows filling the rest of the viewport
        const scrollY = await page.evaluate(() => {
          const res = document.querySelector("#increased-value-result");
          const y = res
            ? res.getBoundingClientRect().top + window.scrollY - 150
            : 600;
          window.scrollTo(0, y);
          return y;
        });
        await stabilize(page);
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await page.waitForTimeout(600);

        const pu = { scrollY };
        pu.rows = await page.evaluate(() => {
          const rr = (el) => {
            const r = el.getBoundingClientRect();
            return {
              x: Math.round(r.x),
              y: Math.round(r.y),
              w: Math.round(r.width),
              h: Math.round(r.height)
            };
          };
          return [
            ...document.querySelectorAll(".practical-use--interactive")
          ]
            .map((el) => ({ ...rr(el), text: (el.textContent || "").trim().slice(0, 80) }))
            .filter((r) => r.y > 0 && r.y + r.h < 768);
        });
        if (!pu.rows.length) throw new Error("no Practical Uses rows in view");
        await shot(page, `pu-plate-${T}`);

        // click the first fully-visible row → pins its values (genuine click)
        const rowText = pu.rows[0].text.slice(0, 30);
        pu.clickedRow = pu.rows[0];
        await page.evaluate((y) => {
          const rows = [...document.querySelectorAll(".practical-use--interactive")];
          const row = rows.find((el) => {
            const r = el.getBoundingClientRect();
            return r.top > 0 && r.bottom < 768;
          });
          row.click();
        }, scrollY);
        await stabilize(page);
        // restore the exact framing so unpinned/pinned plates are congruent
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await page.waitForTimeout(600);

        pu.pinnedValues = await page.evaluate(() => ({
          original: document.querySelector("#increased-value-original-input")
            ?.value,
          percent: document.querySelector("#increased-value-percentage-input")
            ?.value,
          result: document.querySelector("#increased-value-result")?.value
        }));
        console.log(`pinned values (${T}):`, JSON.stringify(pu.pinnedValues));
        pu.result = await rectOf(page, "#increased-value-result");
        geometry[T].pu = pu;

        await shot(page, `pu-pinned-plate-${T}`, { settle: false });
        if (pu.result)
          pu.resultClip = await clipShot(
            page,
            `result-field-${T}`,
            pu.result,
            10
          );
        saveGeo();
      }
    }
    await ctx.close();
  }

  // ============ F. FAQ page related to the calculator ======================
  if (RUN.has("f")) {
    const ctx = await newThemeContext(browser, theme);
    const page = await ctx.newPage();
    await hideChrome(page);
    const resp = await page.goto(`${BASE}/faqs/${FAQ_SLUG}/?noredirect`, {
      waitUntil: "domcontentloaded"
    });
    if (!resp || resp.status() >= 400)
      throw new Error(`FAQ page /faqs/${FAQ_SLUG}/ returned ${resp?.status()}`);
    await acceptCookies(page);
    await stabilize(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    geometry[T].faq = { url: `${BASE}/faqs/${FAQ_SLUG}/`, slug: FAQ_SLUG };
    await shot(page, `faq-plate-${T}`);
    saveGeo();
    await ctx.close();
  }
}

// ============ S. splat grids from the captured plates ======================
if (RUN.has("s")) {
  const ctx = await browser.newContext();
  const scratch = await ctx.newPage();
  await scratch.goto("about:blank");
  const splats = {};
  for (const T of ["dark", "light"]) {
    splats[T] = {};
    for (const scene of ["home", "home-grid", "calc", "pu", "pu-pinned", "faq"]) {
      const png = `${scene}-plate-${T}`;
      const rgbB64 = await sampleSplats(scratch, png);
      const grid = { ...GRID, rgbB64 };
      splats[T][scene] = grid;
      writeFileSync(
        join(OUT, `splats-${scene}-${T}.json`),
        JSON.stringify(grid)
      );
      console.log(`splats-${scene}-${T}.json written`);
    }
  }
  // baked JS mirror so the player works from file:// without fetch()
  writeFileSync(
    join(ROOT, "splats.js"),
    "window.F6SPLATS = " + JSON.stringify(splats) + ";\n"
  );
  console.log("splats.js written");
  await ctx.close();
}

saveGeo();
console.log("geometry.json written");
await browser.close();
