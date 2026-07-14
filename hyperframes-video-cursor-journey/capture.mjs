// Capture source frames from https://justpercent.com (US locale) for the
// Cursor Journey technique (Technique 2). Every screenshot is a 1600×900
// viewport state (@2x) taken ONLY after full DOM stabilization:
// network idle >= 500ms, document.fonts.ready, no active CSS/JS
// transitions/animations, all images decoded, and zero layout shift for
// >= 500ms. After EVERY click that mutates the DOM we wait for the new
// structure to fully settle before capturing. Never captures mid-transition.
//
// Run: node capture.mjs   (playwright resolved from handy-percent)

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
const RUN = new Set((process.argv[2] || "abcdefg").split(""));
let geometry = {};
try {
  geometry = JSON.parse(readFileSync(join(OUT, "geometry.json"), "utf8"));
} catch {}
const saveGeo = () =>
  writeFileSync(join(OUT, "geometry.json"), JSON.stringify(geometry, null, 2));

// ---- capture guard (stabilization) ----------------------------------------
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
  await page.waitForTimeout(250); // final settle margin
}

async function acceptCookies(page) {
  const btn = page.getByRole("button", { name: /accept/i }).first();
  try {
    await btn.click({ timeout: 4000 });
    await page.waitForTimeout(400);
  } catch {
    /* banner absent (consent persisted in profile) */
  }
}

async function waitForCards(page) {
  await page.waitForSelector("#solution-desktop-grid .solution-sticky-note", {
    timeout: 15000
  });
}

// viewport-space rects (screenshots are viewport shots)
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

async function shot(page, name, { settle = true } = {}) {
  if (settle) await stabilize(page);
  await page.screenshot({
    path: join(OUT, `${name}.png`),
    fullPage: false,
    animations: "disabled"
  });
  console.log(`captured ${name}.png`);
}

// ---------------------------------------------------------------------------
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
  reducedMotion: "reduce",
  locale: "en-US",
  timezoneId: "America/New_York",
  serviceWorkers: "block",
  permissions: ["clipboard-read", "clipboard-write"]
});
const page = await ctx.newPage();

// ============ A. HOME — search journey (2.1) ================================
if (RUN.has("a")) {
await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
await waitForCards(page);
await shot(page, "s-home-top");
geometry["s-home-top"] = await vrects(page, {
  searchBox: "#calculator-search",
  grid: "#solution-desktop-grid",
  heading: "h1"
});
// all visible solution card rects + CTA labels (for 2.2/2.5/2.7 waypoints)
geometry["s-home-top"].cards = await page.evaluate(() => {
  return [...document.querySelectorAll(
    "#solution-desktop-grid .solution-sticky-note"
  )].map((el) => {
    const r = el.getBoundingClientRect();
    const cta = el.querySelector(".solution-cta-button");
    const cr = cta ? cta.getBoundingClientRect() : r;
    return {
      cta: (cta?.textContent || "").trim(),
      x: Math.round(r.x), y: Math.round(r.y),
      w: Math.round(r.width), h: Math.round(r.height),
      ctaX: Math.round(cr.x + cr.width / 2),
      ctaY: Math.round(cr.y + cr.height / 2)
    };
  });
});

// focused search box
await page.click("#calculator-search");
await shot(page, "s-home-search-focus");
geometry["s-home-search-focus"] = await vrects(page, {
  searchBox: "#calculator-search"
});

// progressive typing "tip" — one settled state per character
for (const [i, ch] of ["t", "i", "p"].entries()) {
  await page.keyboard.type(ch);
  await page.waitForTimeout(700); // results portal re-renders
  await shot(page, `s-home-search-${"tip".slice(0, i + 1)}`);
}
geometry["s-home-search-tip"] = await vrects(page, {
  searchBox: "#calculator-search",
  results: "#search-results-list-portal"
});
geometry["s-home-search-tip"].firstResult = await page.evaluate(() => {
  const el = document.querySelector(
    "#search-results-list-portal [role='option'], #search-results-list-portal li, #search-results-list-portal a"
  );
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    text: (el.textContent || "").trim().slice(0, 80),
    x: Math.round(r.x), y: Math.round(r.y),
    w: Math.round(r.width), h: Math.round(r.height)
  };
});

// select first result (app's own demo pattern) -> scrolls to calculator
await page.focus("#calculator-search");
await page.keyboard.press("ArrowDown");
await page.waitForTimeout(400);
await page.keyboard.press("Enter");
await page.waitForTimeout(1800); // smooth scroll + pin practical use
await shot(page, "s-home-tip-scrolled");
geometry["s-home-tip-scrolled"] = await vrects(page, {
  activeCard: "[data-calculator-id].search-highlight, [data-calculator-id]",
  pinnedUse: ".practical-use--pinned, .practical-use--interactive"
});
saveGeo();
}

// ============ B. HOME grid hovers (2.5) =====================================
if (RUN.has("b")) {
await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
await waitForCards(page);
await stabilize(page);

async function hoverCard(ctaText, name) {
  const card = page
    .locator("#solution-desktop-grid .solution-sticky-note")
    .filter({ hasText: ctaText })
    .first();
  await card.hover();
  await page.waitForTimeout(600); // glow transition finishes
  await shot(page, name);
}
await hoverCard("Apply My Coupon", "s-home-hover-coupon");
await hoverCard("Calculate My Tip", "s-home-hover-tip");
await hoverCard("Calculate Total Price", "s-home-hover-tax");
// park the mouse away so later shots have no hover
await page.mouse.move(10, 890);
await page.waitForTimeout(500);
saveGeo();
}

// ============ C. Coupon card click -> Value Decrease (2.2, 2.6) =============
if (RUN.has("c")) {
await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
await waitForCards(page);
await stabilize(page);
const coupon = page
  .locator("#solution-desktop-grid")
  .getByText("Apply My Coupon", { exact: false })
  .first();
await coupon.click();
await page.waitForURL(/decreased-value-calculator/, { timeout: 15000 });
await acceptCookies(page);
await stabilize(page);
// pre-check "Expand on save" BEFORE the first shot so the saved panel
// really expands on save and both film states stay visually consistent
const expandBox = page
  .locator(".calculator-card, [data-calculator-id]")
  .locator("input[type='checkbox']")
  .last();
try {
  const label = page.getByText(/expand on save/i).first();
  await label.click({ timeout: 5000 });
} catch {
  await expandBox.click({ timeout: 5000 }).catch(() => {});
}
await page.waitForTimeout(500);
await shot(page, "s-dec-arrived"); // post-click DOM fully settled
geometry["s-dec-arrived"] = await vrects(page, {
  card: "[data-calculator-id]",
  original: "#decreased-value-original-input",
  percent: "#decreased-value-percentage-input",
  result: "#decreased-value-result",
  copyBtn: "#decreased-value-output-copy-btn, .copy-result-btn",
  saveBtn: ".add-to-memos-btn",
  heading: "h1"
});

// 2.6 success flow, step 1 — click "+ Save": memo entry appears in the
// Saved panel (auto-expands on first save)
await page.click(".add-to-memos-btn");
await page.waitForTimeout(900);
await shot(page, "s-dec-saved");
geometry["s-dec-saved"] = await vrects(page, {
  saveBtn: ".add-to-memos-btn",
  memosList: "#decreased-value-memos",
  result: "#decreased-value-result",
  copyBtn: ".copy-result-btn"
});

// 2.6 success flow, step 2 — click Copy: green "Copied!" swaps in for 2s;
// hold it by suppressing the revert timeout (capture-rig only; the pixels
// are the genuine post-click DOM)
await page.evaluate(() => {
  const orig = window.setTimeout;
  window.__origSetTimeout = orig;
  window.setTimeout = (fn, ms, ...a) =>
    ms === 2000 ? -1 : orig(fn, ms, ...a);
});
await page.click(".copy-result-btn");
await page.waitForTimeout(600);
await shot(page, "s-dec-copied");
await page.evaluate(() => {
  window.setTimeout = window.__origSetTimeout;
});
geometry["s-dec-copied"] = await vrects(page, {
  memosList: "#decreased-value-memos",
  copyBtn: ".copy-result-btn",
  result: "#decreased-value-result"
});
saveGeo();
}

// ============ D. Form Fill Walkthrough on clean Value Increase (2.3) ========
// Fresh context: localStorage hints from earlier sections prefill the
// calculator otherwise. Each per-character state is rebuilt from scratch
// (reload + pressSequentially) because the app re-selects the input content
// after a typing pause, which would swallow the next keystroke.
if (RUN.has("d")) {
  const ctxD = await browser.newContext({
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
    reducedMotion: "reduce",
    locale: "en-US",
    timezoneId: "America/New_York",
    serviceWorkers: "block",
    permissions: ["clipboard-read", "clipboard-write"]
  });
  const pageD = await ctxD.newPage();
  const steps = [
    { name: "s-inc-empty", f1: "", f2: "" },
    { name: "s-inc-type-5", f1: "5", f2: "" },
    { name: "s-inc-type-50", f1: "50", f2: "" },
    { name: "s-inc-type-500", f1: "500", f2: "" },
    { name: "s-inc-type-5000", f1: "5000", f2: "" },
    { name: "s-inc-type-25-2", f1: "5000", f2: "2" },
    { name: "s-inc-type-25-25", f1: "5000", f2: "25" }
  ];
  for (const st of steps) {
    await pageD.goto(`${BASE}/increased-value-calculator/?noredirect`, {
      waitUntil: "domcontentloaded"
    });
    await acceptCookies(pageD);
    await stabilize(pageD);
    if (st.f1) {
      await pageD.click("#increased-value-original-input");
      await pageD
        .locator("#increased-value-original-input")
        .pressSequentially(st.f1, { delay: 70 });
    }
    if (st.f2) {
      await pageD.click("#increased-value-percentage-input");
      await pageD
        .locator("#increased-value-percentage-input")
        .pressSequentially(st.f2, { delay: 70 });
    }
    await pageD.waitForTimeout(700);
    await shot(pageD, st.name);
  }
  geometry["s-inc-empty"] = await vrects(pageD, {
    card: "[data-calculator-id]",
    original: "#increased-value-original-input",
    percent: "#increased-value-percentage-input",
    result: "#increased-value-result",
    heading: "h1"
  });
  geometry["s-inc-final"] = geometry["s-inc-empty"];
  saveGeo();
  await ctxD.close();
}

// ============ E. Onboarding: Tax card -> inc page -> Practical Use (2.7) ====
if (RUN.has("e")) {
await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
await waitForCards(page);
await stabilize(page);
const taxCard = page
  .locator("#solution-desktop-grid")
  .getByText("Calculate Total Price", { exact: false })
  .first();
await taxCard.click();
await page.waitForURL(/increased-value-calculator/, { timeout: 15000 });
await acceptCookies(page);
await shot(page, "s-inc-tax-arrived"); // prefilled $100 + 8% = $108
geometry["s-inc-tax-arrived"] = await vrects(page, {
  original: "#increased-value-original-input",
  percent: "#increased-value-percentage-input",
  result: "#increased-value-result",
  heading: "h1"
});

// Practical Uses mount lazily (IntersectionObserver) — scroll in steps
await page.evaluate(async () => {
  for (let y = 0; y < 4000; y += 600) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 350));
    if (document.querySelector(".practical-use--interactive")) break;
  }
});
const budget = page
  .locator(".practical-use--interactive")
  .filter({ hasText: /budget boost/i })
  .first();
// center the row in the viewport (scrollIntoViewIfNeeded is a no-op when
// the row already peeks above the fold)
await budget.evaluate((el) => {
  const r = el.getBoundingClientRect();
  window.scrollBy(0, r.top + r.height / 2 - 450);
});
await page.waitForTimeout(600);
await shot(page, "s-inc-pu");
geometry["s-inc-pu"] = await vrects(page, {
  helpPanel: ".help-panel"
});
geometry["s-inc-pu"].budgetRow = await budget.evaluate((el) => {
  const r = el.getBoundingClientRect();
  return {
    text: (el.textContent || "").trim().slice(0, 90),
    x: Math.round(r.x), y: Math.round(r.y),
    w: Math.round(r.width), h: Math.round(r.height)
  };
});

await budget.click();
await page.waitForTimeout(1600); // values fill, result computes, row pins
// keep the pinned row centered for the post-click frame
await page.evaluate(() => {
  const el = document.querySelector(".practical-use--pinned");
  if (el) {
    const r = el.getBoundingClientRect();
    window.scrollBy(0, r.top + r.height / 2 - 450);
  }
});
await page.waitForTimeout(600);
await shot(page, "s-inc-pu-pinned");
geometry["s-inc-pu-pinned"] = await vrects(page, {
  pinned: ".practical-use--pinned"
});

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(900);
await shot(page, "s-inc-pu-result"); // $5,000 + 25% = $6,250 + SELECTED banner
geometry["s-inc-pu-result"] = await vrects(page, {
  original: "#increased-value-original-input",
  percent: "#increased-value-percentage-input",
  result: "#increased-value-result",
  banner: "[class*='selected'], [id*='selected']"
});
saveGeo();
}

// ============ F. Tip card -> Basic Percentage (2.4 hop 1-2) =================
if (RUN.has("f")) {
await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
await waitForCards(page);
await stabilize(page);
const tipCard = page
  .locator("#solution-desktop-grid")
  .getByText("Calculate My Tip", { exact: false })
  .first();
await tipCard.click();
await page.waitForURL(/basic-percentage-calculator/, { timeout: 15000 });
await acceptCookies(page);
await shot(page, "s-basic-tip-arrived"); // 18% of $50 = $9
geometry["s-basic-tip-arrived"] = await vrects(page, {
  result: "#basic-percentage-result, input[id*='result']",
  copyBtn: ".copy-result-btn",
  heading: "h1"
});
saveGeo();
}

// ============ G. FAQs index + tip FAQ subpage (2.4 hop 3-4) =================
if (RUN.has("g")) {
await page.goto(`${BASE}/faqs/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
await shot(page, "s-faqs-top");
geometry["s-faqs-top"] = await vrects(page, { heading: "h1" });

const tipFaq = page.locator("a[href*='tip-calculation-calculator']").first();
await tipFaq.scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, -250));
await page.waitForTimeout(600);
await stabilize(page);
geometry["s-faqs-tip-row"] = { row: null };
geometry["s-faqs-tip-row"].row = await tipFaq.evaluate((el) => {
  const r = el.getBoundingClientRect();
  return {
    text: (el.textContent || "").trim().slice(0, 100),
    x: Math.round(r.x), y: Math.round(r.y),
    w: Math.round(r.width), h: Math.round(r.height)
  };
});
await shot(page, "s-faqs-tip-row", { settle: false });
await tipFaq.hover();
await page.waitForTimeout(500);
await shot(page, "s-faqs-tip-row-hover", { settle: false });

await tipFaq.click();
await page.waitForURL(/faqs\/tip-calculation-calculator/, { timeout: 15000 });
await acceptCookies(page);
await shot(page, "s-faq-tip");
geometry["s-faq-tip"] = await vrects(page, {
  heading: "h1",
  answer: "[id*='result'], [class*='answer']"
});
saveGeo();
}

saveGeo();
console.log("geometry.json written");
await browser.close();
