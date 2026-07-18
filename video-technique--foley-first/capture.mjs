// Film 3 — "Foley-First Editing" — source-frame capture.
// Captures justpercent.com (US locale) mobile states at 432×768 CSS px,
// deviceScaleFactor 2.5 → PNGs exactly 1080×1920 (9:16 Shorts).
//
// Every screenshot taken ONLY after full stabilization:
// network idle ≥ 500ms, document.fonts.ready, all images decoded,
// no active finite CSS/JS animations, zero layout shift ≥ 500ms.
// After every DOM-mutating click the new structure settles first.
// Never captures mid-transition.
//
// Traps handled (see README):
// - Value Increase calculator has DEFAULTS 240 + 15% = 276 — no empty state.
// - App RE-SELECTS input content ~1s after a typing pause → every
//   per-keystroke state is rebuilt from scratch in a FRESH context
//   (values persist in localStorage across reloads within a context).
// - fill() doesn't trigger the input mask → pressSequentially only.
// - Saved panel expands on save only if "Expand on save" pre-checked.
// - Green "Copied!" reverts after exactly 2000ms → scoped setTimeout hold.
//
// Run: node capture.mjs [sections]  sections ⊆ "khs"
//   k = per-keystroke series on /increased-value-calculator/
//   h = home plate + "Calculate Total Price" card + genuine click arrival
//   s = success chain (presave / saved / copied) + result crop clip

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
const RUN = new Set((process.argv[2] || "khs").split(""));

let geometry = {};
try {
  geometry = JSON.parse(readFileSync(join(OUT, "geometry.json"), "utf8"));
} catch {}
const saveGeo = () => {
  writeFileSync(join(OUT, "geometry.json"), JSON.stringify(geometry, null, 2));
  writeFileSync(
    join(ROOT, "geometry.js"),
    "window.F3GEO = " + JSON.stringify(geometry, null, 2) + ";\n"
  );
};

// ---- capture guard (stabilization) — verbatim Film 1 ----------------------
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
    width: Math.min(432 - Math.max(0, r.x - pad), r.w + pad * 2),
    height: r.h + pad * 2
  };
  await page.screenshot({ path: join(OUT, `${name}.png`), clip });
  console.log(`captured ${name}.png`);
  return { x: clip.x, y: clip.y, w: clip.width, h: clip.height };
}

async function newThemeContext(browser, theme) {
  const ctx = await browser.newContext({
    viewport: { width: 432, height: 768 },
    deviceScaleFactor: 2.5,
    reducedMotion: "reduce",
    locale: "en-US",
    timezoneId: "America/New_York",
    serviceWorkers: "block",
    permissions: ["clipboard-read", "clipboard-write"]
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

const incValues = (page) =>
  page.evaluate(() => ({
    original: document.querySelector("#increased-value-original-input")?.value,
    percent: document.querySelector("#increased-value-percentage-input")
      ?.value,
    result: document.querySelector("#increased-value-result")?.value
  }));

// open a fresh inc-calculator page and (optionally) type f1 / f2 from scratch
async function freshIncState(browser, theme, f1, f2) {
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
  await page.goto(`${BASE}/increased-value-calculator/?noredirect`, {
    waitUntil: "domcontentloaded"
  });
  await acceptCookies(page);
  await stabilize(page);
  if (f1) {
    await page.click("#increased-value-original-input");
    await page
      .locator("#increased-value-original-input")
      .pressSequentially(f1, { delay: 70 });
  }
  if (f2) {
    await page.click("#increased-value-percentage-input");
    await page
      .locator("#increased-value-percentage-input")
      .pressSequentially(f2, { delay: 70 });
  }
  if (f1 || f2) await page.waitForTimeout(700);
  return { ctx, page };
}

// ---------------------------------------------------------------------------
const browser = await chromium.launch();

for (const theme of ["dark", "light"]) {
  const T = theme;
  geometry[T] ||= {};

  // ============ K. per-keystroke series (fresh context per state!) =========
  if (RUN.has("k")) {
    const steps = [
      { name: "default", f1: "", f2: "" },
      { name: "k5", f1: "5", f2: "" },
      { name: "k50", f1: "50", f2: "" },
      { name: "k500", f1: "500", f2: "" },
      { name: "k5000", f1: "5000", f2: "" },
      { name: "p2", f1: "5000", f2: "2" },
      { name: "p25", f1: "5000", f2: "25" }
    ];
    for (const st of steps) {
      const { ctx, page } = await freshIncState(browser, theme, st.f1, st.f2);
      await stabilize(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      await shot(page, `ff-inc-${st.name}-${T}`, { settle: false });
      const v = await incValues(page);
      console.log(`  values[${st.name}/${T}]`, JSON.stringify(v));
      if (st.name === "default" || st.name === "p25") {
        const key = st.name === "default" ? "incDefault" : "inc";
        geometry[T][key] = {
          h1: await rectOf(page, "h1"),
          card: await rectOf(page, "[data-calculator-id]"),
          original: await rectOf(page, "#increased-value-original-input"),
          percent: await rectOf(page, "#increased-value-percentage-input"),
          result: await rectOf(page, "#increased-value-result"),
          values: v
        };
      }
      if (st.name === "p25") {
        // result crop clip for the DING zoom
        const rr = geometry[T].inc.result;
        if (rr)
          geometry[T].inc.resultClip = await clipShot(
            page,
            `ff-inc-result-clip-${T}`,
            rr,
            12
          );
      }
      await ctx.close();
      saveGeo();
    }
  }

  // ============ H. home plate + Total Price card + genuine arrival =========
  if (RUN.has("h")) {
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

    const card = page
      .locator("#solution-mobile-grid .solution-sticky-note")
      .filter({ hasText: "Calculate Total Price" })
      .first();
    // center the card in the viewport so the THUNK press is on-screen
    await card.evaluate((el) => {
      const r = el.getBoundingClientRect();
      window.scrollBy(0, r.top + r.height / 2 - 384);
    });
    await page.waitForTimeout(700);
    await stabilize(page);
    await shot(page, `ff-home-${T}`, { settle: false });

    const cardGeo = await card.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const cta = el.querySelector(".solution-cta-button");
      const cr = cta ? cta.getBoundingClientRect() : r;
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
        cta: (cta?.textContent || "").trim(),
        ctaCx: Math.round(cr.x + cr.width / 2),
        ctaCy: Math.round(cr.y + cr.height / 2)
      };
    });
    geometry[T].home = { card: cardGeo };
    console.log(`  home card[${T}]`, JSON.stringify(cardGeo));
    // padded card clip (pad 10 so the 6px press sink stays covered)
    geometry[T].home.cardClip = await clipShot(
      page,
      `ff-home-card-clip-${T}`,
      cardGeo,
      10
    );
    saveGeo();

    // genuine click flow → /increased-value-calculator/ pre-filled 100+8=108
    await card.locator(".solution-cta-button").click();
    await page.waitForURL(/increased-value-calculator/, { timeout: 20000 });
    await acceptCookies(page);
    await stabilize(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.waitForSelector(".solution-card-hint.visible", {
      timeout: 8000
    }).catch(() => console.log("  WARN: hint banner not visible"));
    await stabilize(page);
    await shot(page, `ff-inc-arrival-${T}`, { settle: false });
    const av = await incValues(page);
    console.log(`  values[arrival/${T}]`, JSON.stringify(av));
    geometry[T].arrival = {
      hint: await rectOf(page, ".solution-card-hint.visible"),
      original: await rectOf(page, "#increased-value-original-input"),
      percent: await rectOf(page, "#increased-value-percentage-input"),
      result: await rectOf(page, "#increased-value-result"),
      values: av
    };
    await ctx.close();
    saveGeo();
  }

  // ============ S. success chain: presave → saved (TICK) → copied (SNAP) ===
  if (RUN.has("s")) {
    const { ctx, page } = await freshIncState(browser, theme, "5000", "25");
    const v = await incValues(page);
    console.log(`  values[success/${T}]`, JSON.stringify(v));

    // pre-check "Expand on save" BEFORE saving so the Saved panel really
    // expands on save (click the label; fall back to opening the panel)
    let expanded = false;
    try {
      await page.getByText(/expand on save/i).first().click({ timeout: 4000 });
      expanded = true;
    } catch {
      // checkbox may live inside the collapsed Saved panel → open it first
      try {
        await page
          .getByRole("button", { name: /toggle saved|saved/i })
          .first()
          .click({ timeout: 4000 });
        await page.waitForTimeout(600);
        await page
          .getByText(/expand on save/i)
          .first()
          .click({ timeout: 4000 });
        expanded = true;
      } catch {
        console.log("  WARN: could not pre-check Expand on save");
      }
    }
    console.log(`  expand-on-save pre-checked[${T}]: ${expanded}`);
    await page.waitForTimeout(500);
    await stabilize(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await shot(page, `ff-inc-presave-${T}`, { settle: false });
    geometry[T].presave = {
      saveBtn: await rectOf(page, ".add-to-memos-btn"),
      copyBtn: await rectOf(page, ".copy-result-btn"),
      result: await rectOf(page, "#increased-value-result")
    };

    // TICK — "+ Save": memo entry appears in the expanded Saved panel
    await page.click(".add-to-memos-btn");
    await page.waitForTimeout(900);
    await stabilize(page);
    // bring result + buttons + memos panel into one frame
    const scrollY = await page.evaluate(() => {
      const memos = document.querySelector("#increased-value-memos");
      const result = document.querySelector("#increased-value-result");
      if (memos && result) {
        const mr = memos.getBoundingClientRect();
        const target = window.scrollY + mr.top + mr.height / 2 - 520;
        window.scrollTo(0, Math.max(0, target));
      }
      return Math.round(window.scrollY);
    });
    await page.waitForTimeout(500);
    await shot(page, `ff-inc-saved-${T}`, { settle: false });
    geometry[T].saved = {
      scrollY,
      saveBtn: await rectOf(page, ".add-to-memos-btn"),
      copyBtn: await rectOf(page, ".copy-result-btn"),
      memos: await rectOf(page, "#increased-value-memos"),
      result: await rectOf(page, "#increased-value-result")
    };
    console.log(`  saved geo[${T}]`, JSON.stringify(geometry[T].saved));

    // SNAP — "Copy": hold green "Copied!" (reverts after exactly 2000ms)
    await page.evaluate(() => {
      const orig = window.setTimeout;
      window.__origSetTimeout = orig;
      window.setTimeout = (fn, ms, ...a) =>
        ms === 2000 ? -1 : orig(fn, ms, ...a);
    });
    await page.click(".copy-result-btn");
    await page.waitForTimeout(600);
    // keep the exact same scroll position as the saved shot (clean SNAP cut)
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(400);
    await shot(page, `ff-inc-copied-${T}`, { settle: false });
    await page.evaluate(() => {
      window.setTimeout = window.__origSetTimeout;
    });
    geometry[T].copied = {
      scrollY,
      copyBtn: await rectOf(page, ".copy-result-btn"),
      memos: await rectOf(page, "#increased-value-memos"),
      result: await rectOf(page, "#increased-value-result")
    };
    await ctx.close();
    saveGeo();
  }
}

saveGeo();
console.log("geometry.json written");
await browser.close();
