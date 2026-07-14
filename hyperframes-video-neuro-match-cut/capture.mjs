// Film 5 — "Neuro-Editing & Match-Cutting" — source-frame capture.
// Captures justpercent.com (US locale) mobile states at 432×768 CSS px,
// deviceScaleFactor 2.5 → PNGs are exactly 1080×1920 (9:16 Shorts).
// A second hi-DPR pass (deviceScaleFactor 8) captures the two SMALL match-cut
// anchors (theme toggle, FAQ category icon) so they stay crisp when blown up
// to the centered anchor circle.
//
// Every screenshot is taken ONLY after full stabilization:
//   network idle ≥ 500ms, document.fonts.ready, all images decoded,
//   no active finite CSS/JS animations, zero layout shift ≥ 500ms.
// After every click that mutates the DOM the new structure settles first.
// Never captures mid-transition.
//
// Run: node capture.mjs [sections]  sections ⊆ "hdfx"
//      h=home(+crops), d=dec flow, f=faq hub, x=hi-DPR close-ups. Default all.
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
const RUN = new Set((process.argv[2] || "hdfx").split(""));

let geometry = {};
try {
  geometry = JSON.parse(readFileSync(join(OUT, "geometry.json"), "utf8"));
} catch {}
const saveGeo = () => {
  writeFileSync(join(OUT, "geometry.json"), JSON.stringify(geometry, null, 2));
  // baked JS mirror so the player works from file:// without fetch()
  writeFileSync(
    join(ROOT, "geometry.js"),
    "window.F5GEO = " + JSON.stringify(geometry, null, 2) + ";\n"
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

// rect of the "Loans" category icon SVG (round dollar-circle) on /faqs/
const faqIconRects = (page) =>
  page.evaluate(() => {
    const items = [
      ...document.querySelectorAll("#category-icons-container .category-icon-item")
    ];
    const loans = items.find((el) => /loans/i.test(el.textContent || ""));
    if (!loans) return null;
    const svg = loans.querySelector("svg");
    const rr = (el) => {
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height)
      };
    };
    return { item: rr(loans), icon: svg ? rr(svg) : null };
  });

// ---------------------------------------------------------------------------
const browser = await chromium.launch();

for (const theme of ["dark", "light"]) {
  const T = theme;
  geometry[T] ||= {};

  // ============ H + D. HOME plate/crops, then coupon click → dec ==========
  if (RUN.has("h") || RUN.has("d")) {
    const ctx = await newThemeContext(browser, theme);
    const page = await ctx.newPage();
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
      home.toggle = await rectOf(page, "#theme-toggle");
      home.search = await rectOf(page, "#calculator-search");
      // "Apply My Coupon" CTA on the first mobile solution card
      home.cta = await page.evaluate(() => {
        const cards = [
          ...document.querySelectorAll(
            "#solution-mobile-grid .solution-sticky-note"
          )
        ];
        const card = cards.find((c) =>
          /apply my coupon/i.test(c.textContent || "")
        );
        const cta = card ? card.querySelector(".solution-cta-button") : null;
        if (!cta) return null;
        const r = cta.getBoundingClientRect();
        return {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
          text: (cta.textContent || "").trim()
        };
      });
      geometry[T].home = home;

      await shot(page, `home-plate-${T}`);
      if (home.toggle)
        home.toggleClip = await clipShot(page, `toggle-${T}`, home.toggle, 2);
      if (home.search)
        home.searchClip = await clipShot(
          page,
          `search-pill-${T}`,
          home.search,
          4
        );
      if (home.cta)
        home.ctaClip = await clipShot(page, `cta-pill-${T}`, home.cta, 3);
      saveGeo();
    }

    if (RUN.has("d")) {
      // genuine user flow: click "Apply My Coupon" → /decreased-value-calculator/
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
      dec.result = await rectOf(page, "#decreased-value-result");
      dec.values = await page.evaluate(() => ({
        original: document.querySelector("#decreased-value-original-input")
          ?.value,
        percent: document.querySelector("#decreased-value-percentage-input")
          ?.value,
        result: document.querySelector("#decreased-value-result")?.value
      }));
      geometry[T].dec = dec;
      console.log(`dec values (${T}):`, JSON.stringify(dec.values));

      await shot(page, `dec-plate-${T}`);
      if (dec.hint)
        dec.hintClip = await clipShot(page, `hint-banner-${T}`, dec.hint, 4);
      if (dec.result)
        dec.resultClip = await clipShot(
          page,
          `result-field-${T}`,
          dec.result,
          10
        );
      saveGeo();
    }
    await ctx.close();
  }

  // ============ F. FAQ hub plate + round category icon =====================
  if (RUN.has("f")) {
    const ctx = await newThemeContext(browser, theme);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/faqs/?noredirect`, {
      waitUntil: "domcontentloaded"
    });
    await acceptCookies(page);
    await page.waitForSelector(
      "#category-icons-container .category-icon-item",
      { timeout: 15000 }
    );
    await stabilize(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    const faq = (await faqIconRects(page)) || {};
    geometry[T].faq = faq;

    await shot(page, `faq-plate-${T}`);
    if (faq.icon)
      faq.iconClip = await clipShot(page, `faq-icon-${T}`, faq.icon, 3);
    saveGeo();
    await ctx.close();
  }

  // ============ X. hi-DPR close-ups (dsf 8) for tiny anchors ===============
  if (RUN.has("x")) {
    const ctx = await newThemeContext(browser, theme, 8);
    const page = await ctx.newPage();

    // theme toggle on the homepage
    await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
    await acceptCookies(page);
    await page.waitForSelector("#solution-mobile-grid .solution-sticky-note", {
      timeout: 15000
    });
    await stabilize(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    const tg = await rectOf(page, "#theme-toggle");
    if (tg) {
      geometry[T].hi ||= {};
      geometry[T].hi.toggleClip = await clipShot(page, `toggle-hi-${T}`, tg, 2);
    }

    // Loans dollar-circle icon on /faqs/
    await page.goto(`${BASE}/faqs/?noredirect`, {
      waitUntil: "domcontentloaded"
    });
    await acceptCookies(page);
    await page.waitForSelector(
      "#category-icons-container .category-icon-item",
      { timeout: 15000 }
    );
    await stabilize(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    const fi = await faqIconRects(page);
    if (fi && fi.icon) {
      geometry[T].hi ||= {};
      geometry[T].hi.faqIconClip = await clipShot(
        page,
        `faq-icon-hi-${T}`,
        fi.icon,
        3
      );
    }
    saveGeo();
    await ctx.close();
  }
}

saveGeo();
console.log("geometry.json written");
await browser.close();
