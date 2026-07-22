// Film 7 — "Edu-Tainment: SaaS Brain Rot" — source-frame capture.
// Captures justpercent.com (US locale) mobile states at 432×768 CSS px,
// deviceScaleFactor 2.5 → viewport PNGs exactly 1080×1920 (9:16 Shorts),
// plus FULLPAGE plates (1080×N) that the FPV camera flies over.
//
// Every screenshot is taken ONLY after full stabilization:
//   network idle ≥ 500ms, document.fonts.ready, all images decoded,
//   no active finite CSS/JS animations, zero layout shift ≥ 500ms.
// EXCEPT keystroke states: the search/calculator inputs re-select their
// content ~1 s after typing pauses, so keystroke shots stabilize BEFORE
// typing, use pressSequentially, and shoot inside the <1 s window with a
// light animation-quiet guard. Each keystroke state runs in a FRESH browser
// context (values persist in localStorage).
//
// Run: node capture.mjs [sections]  sections ⊆ "hqckpf"
//      h=home plates+card crops, q=search keystrokes (verifies the query!),
//      c=genuine card click → calculator plates, k=input keystrokes,
//      p=Practical Uses unpinned/pinned + result crop, f=faqs hub + FAQ page.
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
const RUN = new Set((process.argv[2] || "hqckpf").split(""));

const QUERY = "sale";                 // verified against the live dropdown below
const RIGHT_CARD = "See My Savings";  // the clearance-rack savings card
const WRONG_CARD = "Calculate My Tip";// cursor drifts here first — BRUH.
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
const FAQ_SLUG = "product-discount-calculator"; // exists in handy-percent/src/pages/faqs/

let geometry = {};
try {
  geometry = JSON.parse(readFileSync(join(OUT, "geometry.json"), "utf8"));
} catch {}
const saveGeo = () => {
  writeFileSync(join(OUT, "geometry.json"), JSON.stringify(geometry, null, 2));
  // baked JS mirror so the player works from file:// without fetch()
  writeFileSync(
    join(ROOT, "geometry.js"),
    "window.F7GEO = " + JSON.stringify(geometry, null, 2) + ";\n"
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

// light guard for the <1 s post-keystroke window (no networkidle round-trip)
async function quietAnimations(page, maxWaitMs = 700) {
  try {
    await page.waitForFunction(
      () =>
        document
          .getAnimations()
          .filter(
            (a) =>
              a.playState === "running" &&
              Number.isFinite(a.effect?.getTiming().iterations)
          ).length === 0,
      { timeout: maxWaitMs }
    );
  } catch {}
  await page.waitForTimeout(120);
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

// rect of a solution card (and its CTA) found by text, in viewport coords,
// plus the current scrollY so the player can map into fullPage coords
const cardRects = (page, text) =>
  page.evaluate((text) => {
    const cards = [
      ...document.querySelectorAll("#solution-mobile-grid .solution-sticky-note")
    ];
    const card = cards.find((c) => (c.textContent || "").includes(text));
    if (!card) return null;
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
    return { rect: rr(card), cta: cta ? rr(cta) : null, scrollY: window.scrollY };
  }, text);

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

async function openHome(browser, theme) {
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
  return { ctx, page };
}

// ---------------------------------------------------------------------------
const browser = await chromium.launch();

for (const theme of ["dark", "light"]) {
  const T = theme;
  geometry[T] ||= {};

  // ============ H. HOME viewport + fullPage plates, card crops =============
  if (RUN.has("h")) {
    const { ctx, page } = await openHome(browser, theme);
    const home = {};
    home.search = await rectOf(page, "#calculator-search");
    home.pageH = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    await shot(page, `home-plate-${T}`);
    await shot(page, `home-full-${T}`, { fullPage: true, settle: false });

    // right + wrong card: scroll each into view, record fullPage coords + crop
    for (const [key, text] of [["right", RIGHT_CARD], ["wrong", WRONG_CARD]]) {
      await page.evaluate((text) => {
        const cards = [
          ...document.querySelectorAll(
            "#solution-mobile-grid .solution-sticky-note"
          )
        ];
        const card = cards.find((c) => (c.textContent || "").includes(text));
        card.scrollIntoView({ block: "center" });
      }, text);
      await page.waitForTimeout(500);
      await quietAnimations(page);
      const c = await cardRects(page, text);
      if (!c) throw new Error(`card "${text}" not found`);
      c.clip = await clipShot(page, `card-${key}-${T}`, c.rect, 3);
      // fullPage-space rect (viewport rect + scrollY at shot time)
      c.full = { x: c.rect.x, y: c.rect.y + c.scrollY, w: c.rect.w, h: c.rect.h };
      home[key] = c;
    }
    geometry[T].home = home;
    saveGeo();
    await ctx.close();
  }

  // ============ Q. search keystrokes ("sale") — fresh context each =========
  if (RUN.has("q")) {
    const states = [];
    for (let n = 1; n <= QUERY.length; n++) states.push(QUERY.slice(0, n));
    const search = { query: QUERY, states: [] };
    for (const st of states) {
      const { ctx, page } = await openHome(browser, theme);
      // fully stabilized BEFORE typing (input re-select trap); shoot fast after
      await page.click("#calculator-search");
      await page.locator("#calculator-search").pressSequentially(st, { delay: 70 });
      await quietAnimations(page);
      await shot(page, `search-${st}-${T}`, { settle: false });
      const rec = {
        typed: st,
        box: await rectOf(page, "#calculator-search"),
        dropdown: await rectOf(page, ".search-dropdown-scroll-container"),
        items: await page.evaluate(() =>
          [...document.querySelectorAll(".search-dropdown-item")]
            .slice(0, 6)
            .map((el) => {
              const r = el.getBoundingClientRect();
              return {
                x: Math.round(r.x), y: Math.round(r.y),
                w: Math.round(r.width), h: Math.round(r.height),
                text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 90)
              };
            })
        )
      };
      search.states.push(rec);
      await ctx.close();
    }
    // VERIFY the query really matches before committing to it
    const last = search.states[search.states.length - 1];
    const match = last.items.find((i) => /sav|sale|clearance|discount/i.test(i.text));
    if (!match)
      throw new Error(
        `query "${QUERY}" returned no matching result — pick another real query`
      );
    search.verified = { matchText: match.text, matchRect: match };
    console.log(`search "${QUERY}" verified (${T}): ${match.text}`);
    geometry[T].search = search;
    saveGeo();
  }

  // ============ C. genuine card click → calculator plates ==================
  if (RUN.has("c")) {
    const { ctx, page } = await openHome(browser, theme);
    const cta = page
      .locator("#solution-mobile-grid .solution-sticky-note")
      .filter({ hasText: RIGHT_CARD })
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
    calc.px = await rectOf(page, "#percentage-input");
    calc.num = await rectOf(page, "#number");
    calc.result = await rectOf(page, "#basic-percentage-result");
    calc.values = await page.evaluate(() => ({
      percent: document.querySelector("#percentage-input")?.value,
      number: document.querySelector("#number")?.value,
      result: document.querySelector("#basic-percentage-result")?.value
    }));
    calc.pageH = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    geometry[T].calc = calc;
    console.log(`calc values (${T}):`, JSON.stringify(calc.values));

    await shot(page, `calc-plate-${T}`);
    await shot(page, `calc-full-${T}`, { fullPage: true, settle: false });
    saveGeo();
    await ctx.close();
  }

  // ============ K. input keystroke states — fresh context each =============
  if (RUN.has("k")) {
    // states: percentage "2" → "25", then number "8" → "80" (25 already in)
    const states = [
      { name: "p2", px: "2", num: null },
      { name: "p25", px: "25", num: null },
      { name: "n8", px: "25", num: "8" },
      { name: "n80", px: "25", num: "80" }
    ];
    const keys = { states: [] };
    for (const st of states) {
      const ctx = await newThemeContext(browser, theme);
      const page = await ctx.newPage();
      await hideChrome(page);
      await page.goto(`${BASE}/basic-percentage-calculator/?noredirect`, {
        waitUntil: "domcontentloaded"
      });
      await acceptCookies(page);
      await page.waitForSelector("#percentage-input", { timeout: 15000 });
      await stabilize(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);
      // replace-by-selection, then pressSequentially (never fill(): input mask)
      await page.click("#percentage-input");
      await page.keyboard.press("ControlOrMeta+a");
      await page.locator("#percentage-input").pressSequentially(st.px, { delay: 70 });
      if (st.num != null) {
        await page.click("#number");
        await page.keyboard.press("ControlOrMeta+a");
        await page.locator("#number").pressSequentially(st.num, { delay: 70 });
      }
      await quietAnimations(page);
      await shot(page, `key-${st.name}-${T}`, { settle: false });
      keys.states.push({
        name: st.name,
        values: await page.evaluate(() => ({
          percent: document.querySelector("#percentage-input")?.value,
          number: document.querySelector("#number")?.value,
          result: document.querySelector("#basic-percentage-result")?.value
        }))
      });
      await ctx.close();
    }
    geometry[T].keys = keys;
    console.log(`key states (${T}):`, JSON.stringify(keys.states.at(-1)));
    saveGeo();
  }

  // ============ P. Practical Uses rows: unpinned → pinned + result crop ====
  if (RUN.has("p")) {
    const ctx = await newThemeContext(browser, theme);
    const page = await ctx.newPage();
    await hideChrome(page);
    await page.goto(`${BASE}/basic-percentage-calculator/?noredirect`, {
      waitUntil: "domcontentloaded"
    });
    await acceptCookies(page);
    await page.waitForSelector("#percentage-input", { timeout: 15000 });
    await stabilize(page);

    const scrollY = await page.evaluate(() => {
      const res = document.querySelector("#basic-percentage-result");
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
          x: Math.round(r.x), y: Math.round(r.y),
          w: Math.round(r.width), h: Math.round(r.height)
        };
      };
      return [...document.querySelectorAll(".practical-use--interactive")]
        .map((el) => ({ ...rr(el), text: (el.textContent || "").trim().slice(0, 80) }))
        .filter((r) => r.y > 0 && r.y + r.h < 768);
    });
    if (!pu.rows.length) throw new Error("no Practical Uses rows in view");
    await shot(page, `pu-plate-${T}`);

    pu.clickedRow = pu.rows[0];
    await page.evaluate(() => {
      const rows = [...document.querySelectorAll(".practical-use--interactive")];
      const row = rows.find((el) => {
        const r = el.getBoundingClientRect();
        return r.top > 0 && r.bottom < 768;
      });
      row.click();
    });
    await stabilize(page);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(600);

    pu.pinnedValues = await page.evaluate(() => ({
      percent: document.querySelector("#percentage-input")?.value,
      number: document.querySelector("#number")?.value,
      result: document.querySelector("#basic-percentage-result")?.value
    }));
    console.log(`pinned values (${T}):`, JSON.stringify(pu.pinnedValues));
    pu.result = await rectOf(page, "#basic-percentage-result");
    geometry[T].pu = pu;

    await shot(page, `pu-pinned-plate-${T}`, { settle: false });
    if (pu.result)
      pu.resultClip = await clipShot(page, `result-field-${T}`, pu.result, 10);
    saveGeo();
    await ctx.close();
  }

  // ============ F. faqs hub + the related FAQ page =========================
  if (RUN.has("f")) {
    const ctx = await newThemeContext(browser, theme);
    const page = await ctx.newPage();
    await hideChrome(page);
    await page.goto(`${BASE}/faqs/?noredirect`, { waitUntil: "domcontentloaded" });
    await acceptCookies(page);
    await page.waitForSelector(
      "#category-icons-container .category-icon-item",
      { timeout: 15000 }
    );
    await stabilize(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    await shot(page, `faq-hub-plate-${T}`);

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
    await shot(page, `faq-page-plate-${T}`);
    saveGeo();
    await ctx.close();
  }
}

saveGeo();
console.log("geometry.json written");
await browser.close();
