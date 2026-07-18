// Film 7 — "Edu-Tainment (SaaS Brain Rot)" — source-frame capture.
// Captures justpercent.com (US locale) mobile states at 432×768 CSS px,
// deviceScaleFactor 2.5 → PNGs exactly 1080×1920.
//
// States per theme:
//   home            homepage plate (search idle) + rects: search, Calculate
//                   Total Price card+CTA (wrong-way gag target), Calculate My
//                   Tip card (right target)
//   key-t/ti/tip    per-keystroke search states with live dropdown portal
//                   (each rebuilt from a FRESH page — the app re-selects input
//                   content ~1s after typing pauses) + Restaurant Tip row rect
//   selected        post-select (mousedown on the Restaurant Tip li):
//                   homepage scrolled to the basic calculator, auto-filled
//                   15 / 60 → 9, pinned banner. + input/result rects
//   inc-pinned      /increased-value-calculator/ Budget Boost pinned
//                   (5,000 + 25% = 6,250) + input/result rects
//   faq             /faqs/tip-calculation-calculator/ default demo state
//                   150 / 10 → 15 (do NOT type — masked inputs mangle
//                   programmatic keystrokes; the default IS the state we want)
//
// Every screenshot only after full stabilization; active element blurred.
// Run: node capture.mjs [sections]  sections ⊆ "hksif". Default all.

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
const RUN = new Set((process.argv[2] || "hkscif").split(""));

let geometry = {};
try {
  geometry = JSON.parse(readFileSync(join(OUT, "geometry.json"), "utf8"));
} catch {}
const saveGeo = () => {
  writeFileSync(join(OUT, "geometry.json"), JSON.stringify(geometry, null, 2));
  writeFileSync(
    join(ROOT, "geometry.js"),
    "window.F7GEO = " + JSON.stringify(geometry, null, 2) + ";\n"
  );
};

// ---- stabilization guard (Film 1 verbatim) ---------------------------------
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

async function shot(page, name, { settle = true } = {}) {
  if (settle) await stabilize(page);
  await page.screenshot({
    path: join(OUT, `${name}.png`),
    fullPage: false,
    animations: "disabled"
  });
  console.log(`captured ${name}.png`);
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

// rect of a solution card + its CTA by card text
const cardRect = (page, text) =>
  page.evaluate((text) => {
    const cards = [
      ...document.querySelectorAll("#solution-mobile-grid .solution-sticky-note")
    ];
    const card = cards.find((c) =>
      (c.textContent || "").toLowerCase().includes(text.toLowerCase())
    );
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
    return { card: rr(card), cta: cta ? rr(cta) : null };
  }, text);

// prep a fresh homepage and type a prefix into the search box
async function typedSearch(ctx, prefix) {
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
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.click("#calculator-search");
  await page
    .locator("#calculator-search")
    .pressSequentially(prefix, { delay: 70 });
  await page.waitForTimeout(700);
  return page;
}

// dropdown row rects from the portal
const dropdownRects = (page) =>
  page.evaluate(() => {
    const portal = document.querySelector("#search-results-list-portal");
    if (!portal) return null;
    const rr = (el) => {
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height)
      };
    };
    const rows = [...portal.querySelectorAll("li")].map((li) => ({
      id: li.id,
      text: (li.textContent || "").trim().slice(0, 60),
      rect: rr(li)
    }));
    return { portal: rr(portal), rows };
  });

// ---------------------------------------------------------------------------
const browser = await chromium.launch();

for (const theme of ["dark", "light"]) {
  const T = theme;
  geometry[T] ||= {};

  // ---------- H. homepage plate + gag-target rects --------------------------
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
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    const home = {};
    home.search = await rectOf(page, "#calculator-search");
    home.totalPrice = await cardRect(page, "Calculate Total Price");
    home.myTip = await cardRect(page, "Calculate My Tip");
    // cards live below the fold — also record document-space y for the FPV sweep
    home.scrollH = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    geometry[T].home = home;
    await shot(page, `home-${T}`);

    // second plate scrolled to the cards region (gag scene backdrop)
    if (home.totalPrice) {
      await page.evaluate(() => {
        const cards = [
          ...document.querySelectorAll(
            "#solution-mobile-grid .solution-sticky-note"
          )
        ];
        const card = cards.find((c) =>
          /calculate total price/i.test(c.textContent || "")
        );
        card?.scrollIntoView({ block: "center" });
      });
      await page.waitForTimeout(700);
      await stabilize(page);
      geometry[T].gag = {
        scrollY: await page.evaluate(() => window.scrollY),
        totalPrice: await cardRect(page, "Calculate Total Price"),
        myTip: await cardRect(page, "Calculate My Tip")
      };
      await shot(page, `home-cards-${T}`, { settle: false });
    }
    saveGeo();
    await ctx.close();
  }

  // ---------- K. per-keystroke search states (fresh page each!) -------------
  if (RUN.has("k")) {
    const ctx = await newThemeContext(browser, theme);
    for (const prefix of ["t", "ti", "tip"]) {
      const page = await typedSearch(ctx, prefix);
      if (prefix === "tip") {
        const dd = await dropdownRects(page);
        geometry[T].dropdown = dd;
        const tipRow = dd?.rows?.find((r) => /restaurant tip/i.test(r.text));
        geometry[T].tipRow = tipRow || null;
        console.log(`tip row (${T}):`, JSON.stringify(tipRow?.text));
      }
      await shot(page, `key-${prefix}-${T}`, { settle: false });
      await page.close();
    }
    saveGeo();
    await ctx.close();
  }

  // ---------- S. post-select pinned basic calculator ------------------------
  if (RUN.has("s")) {
    const ctx = await newThemeContext(browser, theme);
    const page = await typedSearch(ctx, "tip");
    // mousedown on the Restaurant Tip row (click() does NOT work on portal rows)
    await page.evaluate(() => {
      const portal = document.querySelector("#search-results-list-portal");
      const rows = [...(portal?.querySelectorAll("li") || [])];
      const row = rows.find((li) =>
        /restaurant tip/i.test(li.textContent || "")
      );
      row?.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true, cancelable: true })
      );
    });
    await page.waitForTimeout(2200); // clear input + smooth scroll + autofill + pin
    await stabilize(page);
    await page.evaluate(() => document.activeElement?.blur?.());
    await page.waitForTimeout(300);

    // find the auto-filled inputs (15 / 60 → 9) wherever the site scrolled us
    const sel = await page.evaluate(() => {
      const rr = (el) => {
        const r = el.getBoundingClientRect();
        return {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height)
        };
      };
      const ins = [...document.querySelectorAll("input")].filter(
        (i) => i.offsetParent && ["15", "60", "9"].includes(i.value)
      );
      const banner = [...document.querySelectorAll("div,p,span")].find(
        (e) =>
          /selected practical use/i.test(e.textContent || "") &&
          e.children.length <= 3 &&
          e.getBoundingClientRect().height < 200 &&
          e.getBoundingClientRect().height > 10
      );
      return {
        scrollY: window.scrollY,
        inputs: ins.map((i) => ({ value: i.value, id: i.id, rect: rr(i) })),
        banner: banner ? rr(banner) : null
      };
    });
    geometry[T].selected = sel;
    console.log(`selected (${T}):`, JSON.stringify(sel.inputs.map((i) => i.value)));
    await shot(page, `selected-${T}`, { settle: false });
    saveGeo();
    await ctx.close();
  }

  // ---------- C. post-select, re-framed on the basic calculator -------------
  if (RUN.has("c")) {
    const ctx = await newThemeContext(browser, theme);
    const page = await typedSearch(ctx, "tip");
    await page.evaluate(() => {
      const portal = document.querySelector("#search-results-list-portal");
      const rows = [...(portal?.querySelectorAll("li") || [])];
      const row = rows.find((li) =>
        /restaurant tip/i.test(li.textContent || "")
      );
      row?.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true, cancelable: true })
      );
    });
    await page.waitForTimeout(2200);
    await stabilize(page);
    await page.evaluate(() => document.activeElement?.blur?.());
    // re-frame: pull the 15 / 60 inputs into the top of the viewport
    await page.evaluate(() => window.scrollTo(0, Math.max(0, window.scrollY - 150)));
    await page.waitForTimeout(600);
    const calc = await page.evaluate(() => {
      const rr = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height)
        };
      };
      const banner = [...document.querySelectorAll("div,p,span")].find(
        (e) =>
          /selected practical use/i.test(e.textContent || "") &&
          e.children.length <= 3 &&
          e.getBoundingClientRect().height < 220 &&
          e.getBoundingClientRect().height > 10
      );
      return {
        scrollY: window.scrollY,
        pct: rr(document.querySelector("#percentage-input")),
        num: rr(document.querySelector("#number")),
        result: rr(document.querySelector("#basic-percentage-result")),
        banner: rr(banner),
        values: {
          pct: document.querySelector("#percentage-input")?.value,
          num: document.querySelector("#number")?.value,
          result: document.querySelector("#basic-percentage-result")?.value
        }
      };
    });
    geometry[T].calc = calc;
    console.log(`calc (${T}):`, JSON.stringify(calc.values));
    await shot(page, `selected-calc-${T}`, { settle: false });
    saveGeo();
    await ctx.close();
  }

  // ---------- I. /increased-value-calculator/ Budget Boost pinned -----------
  if (RUN.has("i")) {
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
    let found = false;
    for (let i = 1; i <= 20 && !found; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), 600 * i);
      await page.waitForTimeout(450);
      found = await page.evaluate(
        () => !!document.querySelector(".practical-use--interactive")
      );
    }
    const budget = page
      .locator(".practical-use--interactive")
      .filter({ hasText: /budget boost/i })
      .first();
    await budget.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await budget.click();
    await page.waitForTimeout(1800);
    await stabilize(page);
    await page.evaluate(() => document.activeElement?.blur?.());
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    const inc = {};
    inc.original = await rectOf(page, "#increased-value-original-input");
    inc.percent = await rectOf(page, "#increased-value-percentage-input");
    inc.result = await rectOf(page, "#increased-value-result");
    inc.values = await page.evaluate(() => ({
      original: document.querySelector("#increased-value-original-input")?.value,
      percent: document.querySelector("#increased-value-percentage-input")?.value,
      result: document.querySelector("#increased-value-result")?.value
    }));
    geometry[T].inc = inc;
    console.log(`inc (${T}):`, JSON.stringify(inc.values));
    await shot(page, `inc-pinned-${T}`, { settle: false });
    saveGeo();
    await ctx.close();
  }

  // ---------- F. live FAQ (default demo state 150/10→15) --------------------
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
    await page.goto(`${BASE}/faqs/tip-calculation-calculator/?noredirect`, {
      waitUntil: "domcontentloaded"
    });
    await acceptCookies(page);
    await stabilize(page);
    await page.waitForTimeout(1000);
    const faq = {};
    faq.bill = await rectOf(page, "#tip-bill-amount");
    faq.pct = await rectOf(page, "#tip-percent");
    faq.result = await rectOf(page, "#tip-result");
    faq.values = await page.evaluate(() => ({
      bill: document.querySelector("#tip-bill-amount")?.value,
      pct: document.querySelector("#tip-percent")?.value,
      result: document.querySelector("#tip-result")?.value
    }));
    geometry[T].faq = faq;
    console.log(`faq (${T}):`, JSON.stringify(faq.values));
    await shot(page, `faq-${T}`);
    saveGeo();
    await ctx.close();
  }
}

saveGeo();
console.log("geometry.json written");
await browser.close();
