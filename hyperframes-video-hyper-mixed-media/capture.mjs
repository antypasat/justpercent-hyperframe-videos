// Film 4 — "Hyper-Mixed Media" — source-frame capture.
// Captures justpercent.com (US locale) mobile states at 432×768 CSS px,
// deviceScaleFactor 2.5 → PNGs are exactly 1080×1920 (9:16 Shorts).
//
// Every screenshot is taken ONLY after full stabilization:
//   network idle ≥ 500ms, document.fonts.ready, all images decoded,
//   no active finite CSS/JS animations, zero layout shift ≥ 500ms.
// After every click that mutates the DOM the new structure settles first.
// Never captures mid-transition.
//
// Sections (fresh browser context per section — localStorage persists values
// across pages within a context, PU pin state persists too):
//   f = /faqs/ hub (top frame + frame scrolled to the Bill Splitting card)
//   b = /faqs/bill-splitting-calculator/ (viewport top + fullPage + answer rect)
//   d = /decreased-value-calculator/ (PU rows frame, pinned 300−30%→210 frame,
//       result crop clip)
//
// Run: node capture.mjs [sections]   sections ⊆ "fbd", default all
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
const RUN = new Set((process.argv[2] || "fbd").split(""));

let geometry = {};
try {
  geometry = JSON.parse(readFileSync(join(OUT, "geometry.json"), "utf8"));
} catch {}
const saveGeo = () => {
  writeFileSync(join(OUT, "geometry.json"), JSON.stringify(geometry, null, 2));
  // baked JS mirror so the player works from file:// without fetch()
  writeFileSync(
    join(ROOT, "geometry.js"),
    "window.F4GEO = " + JSON.stringify(geometry, null, 2) + ";\n"
  );
};

// ---- capture guard (stabilization) — Film 1 verbatim ----------------------
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

async function shot(page, name, { settle = true, fullPage = false } = {}) {
  if (settle) await stabilize(page);
  await page.screenshot({
    path: join(OUT, `${name}.png`),
    fullPage,
    animations: "disabled"
  });
  console.log(`captured ${name}.png${fullPage ? " (fullPage)" : ""}`);
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

const rectOf = (page, sel, doc = false) =>
  page.evaluate(
    ({ sel, doc }) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y + (doc ? scrollY : 0)),
        w: Math.round(r.width),
        h: Math.round(r.height)
      };
    },
    { sel, doc }
  );

const scrollTop = async (page) => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
};

// ---------------------------------------------------------------------------
const browser = await chromium.launch();

for (const theme of ["dark", "light"]) {
  const T = theme;
  geometry[T] ||= {};

  // ============ F. /faqs/ hub =============================================
  if (RUN.has("f")) {
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
    await page.goto(`${BASE}/faqs/?noredirect`, {
      waitUntil: "domcontentloaded"
    });
    await acceptCookies(page);
    await page.waitForSelector("a[href*='bill-splitting-calculator']", {
      timeout: 15000
    });
    await stabilize(page);

    // top frame (scrollTo(0,0) + settle first — sticky header trap)
    await scrollTop(page);
    await shot(page, `faqs-top-${T}`);

    // scroll the Bill Splitting card into frame (~y 300 in viewport)
    const docRow = await page.evaluate(() => {
      const a = document.querySelector("a[href*='bill-splitting-calculator']");
      const r = a.getBoundingClientRect();
      return { yDoc: Math.round(r.y + scrollY) };
    });
    const target = Math.max(0, docRow.yDoc - 300);
    await page.evaluate((y) => window.scrollTo(0, y), target);
    await page.waitForTimeout(700);
    await stabilize(page);
    const billRow = await rectOf(
      page,
      "a[href*='bill-splitting-calculator']"
    );
    const scrollY = await page.evaluate(() => Math.round(window.scrollY));
    await shot(page, `faqs-bill-${T}`, { settle: false });
    geometry[T].faqs = {
      pageH: await page.evaluate(() => document.documentElement.scrollHeight),
      billScrollY: scrollY,
      billRow // viewport CSS-px rect inside faqs-bill-<T>.png
    };
    saveGeo();
    await ctx.close();
  }

  // ============ B. /faqs/bill-splitting-calculator/ ========================
  if (RUN.has("b")) {
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
    await page.goto(`${BASE}/faqs/bill-splitting-calculator/?noredirect`, {
      waitUntil: "domcontentloaded"
    });
    await acceptCookies(page);
    await page.waitForSelector("#answer-container", { timeout: 15000 });
    await stabilize(page);
    await scrollTop(page);

    const bill = {};
    bill.pageH = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    bill.h1 = await rectOf(page, "h1", true);
    bill.question = await rectOf(page, "#question-container", true);
    bill.answer = await rectOf(page, "#answer-container", true); // doc coords
    bill.example = await rectOf(page, "#bill-splitting-example", true);
    bill.values = await page.evaluate(() => ({
      myPercent: document.querySelector("#my-percent")?.value,
      roommatePercent: document.querySelector("#roommate-percent")?.value,
      billAmount: document.querySelector("#bill-amount")?.value,
      myResult: document.querySelector("#my-result")?.value,
      roommateResult: document.querySelector("#roommate-result")?.value
    }));
    geometry[T].bill = bill;

    await shot(page, `bill-top-${T}`, { settle: false });
    // fullPage: scrollTo(0,0) + settle FIRST or sticky header bakes mid-image
    await scrollTop(page);
    await shot(page, `bill-full-${T}`, { settle: false, fullPage: true });
    saveGeo();
    await ctx.close();
  }

  // ============ D. /decreased-value-calculator/ PU flow ====================
  if (RUN.has("d")) {
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
    await page.goto(`${BASE}/decreased-value-calculator/?noredirect`, {
      waitUntil: "domcontentloaded"
    });
    await acceptCookies(page);
    await stabilize(page);

    // PU rows mount lazily (IntersectionObserver) — scroll in ~600px steps
    let found = false;
    for (let i = 1; i <= 20 && !found; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), 600 * i);
      await page.waitForTimeout(500);
      found = await page.evaluate(
        () => !!document.querySelector(".practical-use--interactive")
      );
    }
    if (!found) throw new Error("PU rows never mounted");

    // scroll so the Sale Discount row sits ~y 300 in the viewport
    const sale = page
      .locator(".practical-use--interactive")
      .filter({ hasText: /sale discount/i })
      .first();
    const saleDocY = await sale.evaluate((el) =>
      Math.round(el.getBoundingClientRect().y + scrollY)
    );
    await page.evaluate((y) => window.scrollTo(0, y), saleDocY - 300);
    await page.waitForTimeout(700);
    await stabilize(page);
    const puRow = await sale.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height)
      };
    });
    const puScrollY = await page.evaluate(() => Math.round(window.scrollY));
    await shot(page, `dec-pu-${T}`, { settle: false });

    // click → auto-fill 300 − 30% → 210, auto-scroll top, pinned row + banner
    await sale.click();
    await page.waitForSelector(".practical-use--pinned", { timeout: 10000 });
    await page.waitForTimeout(1200); // auto-scroll to top settles
    await stabilize(page);
    await scrollTop(page);
    await stabilize(page);

    const dec = { pu: { scrollY: puScrollY, row: puRow } };
    dec.banner = await rectOf(page, ".practical-use-presentation-container");
    dec.bannerTitle = await rectOf(
      page,
      ".practical-use-presentation-title"
    );
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
    if (
      dec.values.original !== "300" ||
      dec.values.percent !== "30" ||
      dec.values.result !== "210"
    ) {
      throw new Error(
        `pinned values wrong: ${JSON.stringify(dec.values)} (want 300/30/210)`
      );
    }
    await shot(page, `dec-pinned-${T}`, { settle: false });
    if (dec.result)
      dec.resultClip = await clipShot(
        page,
        `dec-result-crop-${T}`,
        dec.result,
        12
      );
    geometry[T].dec = dec;
    saveGeo();
    await ctx.close();
  }
}

saveGeo();
console.log("geometry.json written");
await browser.close();
