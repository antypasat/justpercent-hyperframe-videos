// Layered source capture from https://justpercent.com (US locale) for the
// Layer Explosion / Z-Axis Separation technique (8.1–8.7).
//
// Capture guard: every screenshot is taken ONLY after full DOM stabilization —
// network idle >= 500ms, document.fonts.ready resolved, all images decoded,
// no active finite CSS/JS animations, and zero layout shift for >= 500ms.
// Post-click captures wait for the triggered mutation/animation to settle too.
//
// Per scene it produces:
//   assets/layers/<scene>-full.png   reference shot (viewport)
//   assets/layers/<scene>-bg.png     background with elevated layers hidden
//   assets/layers/<scene>-<id>.png   one PNG per elevated layer
//   assets/layers/<scene>.json       layer bounding boxes (viewport coords)
//
// Run: node capture.mjs   (playwright resolved from handy-percent)

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(
  "/Users/michael/startups/percentage-calculator/handy-percent/package.json"
);
const { chromium } = require("@playwright/test");

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, "assets", "layers");
fs.mkdirSync(OUT, { recursive: true });

const BASE = "https://justpercent.com";
const VP = { width: 1600, height: 900 };

// ---- capture guard ---------------------------------------------------------
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
        const imagesDecoded = () => [...document.images].every((i) => i.complete);
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
            (await Promise.race([document.fonts.ready, "pending"])) !== "pending";
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
    await page.locator(".cky-btn-accept").first().click({ timeout: 3000 });
    await page.waitForTimeout(400);
  } catch {}
  await page.evaluate(() => {
    // NOTE: [class*="cky-"] would also match "solution-sticky-note" — prefix only!
    document.querySelectorAll('[class^="cky-"]').forEach((el) => el.remove());
    document.body.style.overflow = "";
  });
}

// ---- layered scene capture -------------------------------------------------
async function mark(page, id, candidates) {
  return page.evaluate(
    ([id, candidates]) => {
      for (const sel of candidates) {
        for (const el of document.querySelectorAll(sel)) {
          const r = el.getBoundingClientRect();
          if (r.width > 8 && r.height > 8 && r.bottom > 0 && r.top < innerHeight) {
            el.setAttribute("data-cap", id);
            return {
              id,
              sel,
              box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
            };
          }
        }
      }
      return null;
    },
    [id, candidates]
  );
}

async function captureScene(page, scene, layerDefs) {
  await stabilize(page);
  const manifest = { scene, url: page.url(), viewport: VP, dpr: 2, layers: [] };
  await page.evaluate(() =>
    document.querySelectorAll("[data-cap]").forEach((el) => el.removeAttribute("data-cap"))
  );
  for (const def of layerDefs) {
    const hit = await mark(page, def.id, def.candidates);
    if (hit) manifest.layers.push(hit);
    else console.warn(`  !! layer ${def.id} NOT FOUND in ${scene}`);
  }
  await page.screenshot({ path: path.join(OUT, `${scene}-full.png`), animations: "disabled" });
  await page.evaluate(() => {
    document.querySelectorAll("[data-cap]").forEach((el) => {
      el.dataset.capVis = el.style.visibility || "";
      el.style.visibility = "hidden";
    });
  });
  await page.screenshot({ path: path.join(OUT, `${scene}-bg.png`), animations: "disabled" });
  await page.evaluate(() => {
    document.querySelectorAll("[data-cap]").forEach((el) => {
      el.style.visibility = el.dataset.capVis;
      delete el.dataset.capVis;
    });
  });
  for (const l of manifest.layers) {
    // clip-based shot: immune to "element not stable" timeouts (portals etc.)
    const clip = {
      x: Math.max(0, l.box.x),
      y: Math.max(0, l.box.y),
      width: Math.min(l.box.w, VP.width - Math.max(0, l.box.x)),
      height: Math.min(l.box.h, VP.height - Math.max(0, l.box.y)),
    };
    if (clip.width < 4 || clip.height < 4) continue;
    await page
      .screenshot({ path: path.join(OUT, `${scene}-${l.id}.png`), clip, animations: "disabled" })
      .catch((e) => console.warn(`  !! shot failed ${scene}-${l.id}: ${e.message.split("\n")[0]}`));
  }
  fs.writeFileSync(path.join(OUT, `${scene}.json`), JSON.stringify(manifest, null, 2));
  console.log(`scene ${scene}: ${manifest.layers.map((l) => l.id).join(", ") || "NONE"}`);
}

const NAV = ["header", "nav"];
const SEARCH = ["#calculator-search-container", "form:has(#calculator-search)", "#calculator-search"];

// mark up to `max` elements matching first selector that yields results
async function markMany(page, tag, selectors, max) {
  return page.evaluate(
    ([tag, selectors, max]) => {
      document
        .querySelectorAll(`[data-le-${tag}]`)
        .forEach((el) => el.removeAttribute(`data-le-${tag}`));
      let els = [];
      for (const sel of selectors) {
        els = Array.from(document.querySelectorAll(sel)).filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 40 && r.height > 30 && r.bottom > 0 && r.top < innerHeight;
        });
        if (els.length) break;
      }
      return els.slice(0, max).map((el, i) => {
        el.setAttribute(`data-le-${tag}`, `${tag}${i + 1}`);
        return `${tag}${i + 1}`;
      });
    },
    [tag, selectors, max]
  );
}
const many = (tag, ids) => ids.map((c) => ({ id: c, candidates: [`[data-le-${tag}="${c}"]`] }));

// mark up to 4 visible content blocks in main (drill down while too few)
async function markBlocks(page) {
  return page.evaluate(() => {
    document.querySelectorAll("[data-le-block]").forEach((el) => el.removeAttribute("data-le-block"));
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      return r.height > 40 && r.width > 200 && r.top < innerHeight && r.bottom > 0;
    };
    const main = document.querySelector("main") || document.body;
    let level = Array.from(main.children).filter(visible);
    for (let depth = 0; depth < 3 && level.length < 3; depth++) {
      const next = level.flatMap((el) => Array.from(el.children).filter(visible));
      if (!next.length) break;
      level = next;
    }
    return level.slice(0, 4).map((el, i) => {
      el.setAttribute("data-le-block", `block${i + 1}`);
      return `block${i + 1}`;
    });
  });
}

// ---------------------------------------------------------------------------
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: VP,
  deviceScaleFactor: 2,
  colorScheme: "light",
  reducedMotion: "reduce",
  locale: "en-US",
  timezoneId: "America/New_York",
  serviceWorkers: "block", // PWA SW otherwise serves the offline page on goto
});
const page = await ctx.newPage();

// ---- 1. HOME: nav / heading / search / picker panel ------------------------
await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
await stabilize(page);
await page.evaluate(() => {
  // smallest element containing "Pick a Calculator", climbed to its card box
  const holders = Array.from(document.querySelectorAll("main *"))
    .filter((el) => /pick a calculator/i.test(el.textContent || ""))
    .sort((a, b) => (a.textContent || "").length - (b.textContent || "").length);
  let el = holders[0];
  while (el && el.parentElement) {
    const r = el.getBoundingClientRect();
    if (r.height > 320 && r.width > 500) break;
    el = el.parentElement;
  }
  if (el) el.setAttribute("data-lepicker", "1");
});
await captureScene(page, "home", [
  { id: "nav", candidates: NAV },
  { id: "heading", candidates: ["main h1", "h1"] },
  { id: "search", candidates: SEARCH },
]);

// ---- 1b. HOME-PICKER: "Pick a Calculator" card (#quick-example-cards) ------
await page.evaluate(() => {
  document.querySelector("#quick-example-cards")?.scrollIntoView({ block: "center" });
});
await stabilize(page);
await captureScene(page, "home-picker", [
  { id: "nav", candidates: NAV },
  { id: "picker", candidates: ["#quick-example-cards"] },
]);
await page.evaluate(() => window.scrollTo(0, 0));
await stabilize(page);

// ---- 2. HOME-CARDS: solution sticky notes grid ------------------------------
await page.waitForSelector("#solution-desktop-grid .solution-sticky-note", { timeout: 15000 });
await page.evaluate(() => {
  const grid = document.querySelector("#solution-desktop-grid");
  if (grid) {
    grid.scrollIntoView({ block: "start" });
    window.scrollBy(0, -110);
  }
});
await stabilize(page);
const cardIds = await markMany(
  page,
  "card",
  [
    "#solution-desktop-grid [data-note-id]",
    "#solution-desktop-grid .solution-sticky-note",
    "#solution-desktop-grid > div > div",
  ],
  6
);
await captureScene(page, "home-cards", [{ id: "nav", candidates: NAV }, ...many("card", cardIds)]);

// record which card is the coupon card (8.1 click target)
const couponBox = await page.evaluate(() => {
  for (const el of document.querySelectorAll("[data-le-card]")) {
    if (/apply my coupon/i.test(el.textContent || "")) {
      const r = el.getBoundingClientRect();
      return {
        id: el.getAttribute("data-le-card"),
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    }
  }
  return null;
});
fs.writeFileSync(path.join(OUT, "meta-coupon.json"), JSON.stringify({ couponBox }, null, 2));

// ---- 3. HOME-SEARCH: "tip" typed, results portal open -----------------------
await page.evaluate(() => window.scrollTo(0, 0));
await stabilize(page);
await page.click("#calculator-search");
await page.keyboard.type("tip", { delay: 90 });
await page.waitForTimeout(1200); // results portal opens
await stabilize(page);
const rowIds = await markMany(
  page,
  "row",
  [
    "#search-results-list-portal [role='option']",
    "#search-results-list-portal li",
    "#search-results-list-portal a",
    "#search-scroll-container [role='option']",
  ],
  3
);
await captureScene(page, "home-search", [
  { id: "nav", candidates: NAV },
  { id: "search", candidates: SEARCH },
  { id: "portal", candidates: ["#search-results-list-portal", "#search-scroll-container"] },
  ...many("row", rowIds),
]);

// ---- 4. HOME-SCROLLED: first result clicked -> scrolls to matching calc -----
try {
  // select first result the way the app's own search demo does
  await page.locator("#calculator-search").press("ArrowDown");
  await page.waitForTimeout(500);
  await page.locator("#calculator-search").press("Enter");
  await page.waitForTimeout(1500);
  await stabilize(page);
  await page.evaluate(() => {
    const el =
      document.querySelector("[data-calculator-id].search-highlight") ||
      Array.from(document.querySelectorAll("[data-calculator-id]")).find((e) => {
        const r = e.getBoundingClientRect();
        return r.top < innerHeight * 0.6 && r.bottom > innerHeight * 0.2;
      });
    if (el) el.setAttribute("data-leactive", "1");
  });
  await captureScene(page, "home-scrolled", [
    { id: "nav", candidates: NAV },
    { id: "activecard", candidates: ["[data-leactive]", "[data-calculator-id]"] },
  ]);
} catch (e) {
  console.log("home-scrolled skipped:", e.message.split("\n")[0]);
}

// ---- 5. CALC: SolutionCard "Apply My Coupon" click -> decreased-value page ---
await page.goto(`${BASE}/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
await stabilize(page);
await page.waitForSelector("#solution-desktop-grid .solution-sticky-note", { timeout: 15000 });
const coupon = page
  .locator("#solution-desktop-grid")
  .getByText("Apply My Coupon", { exact: false })
  .first();
await coupon.scrollIntoViewIfNeeded();
await coupon.click();
await page.waitForURL(/decreased-value-calculator/, { timeout: 15000 });
await acceptCookies(page);
await stabilize(page);
await captureScene(page, "calc", [
  { id: "nav", candidates: NAV },
  { id: "heading", candidates: ["main h1", "h1"] },
  { id: "panel", candidates: ["[data-calculator-id]"] },
]);

// ---- 6. CALC-PU: increased-value page, practical uses below calculator ------
await page.goto(`${BASE}/increased-value-calculator/?noredirect`, {
  waitUntil: "domcontentloaded",
});
await acceptCookies(page);
await stabilize(page);
// practical uses mount deferred — scroll down in steps to trigger observer
await page.evaluate(async () => {
  for (let y = 0; y <= document.documentElement.scrollHeight; y += 600) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 220));
    if (document.querySelector(".practical-use--interactive")) return;
  }
});
let puFound = true;
try {
  await page.waitForSelector(".practical-use--interactive", { timeout: 15000 });
} catch {
  puFound = false;
  console.log("practical uses did not mount — trying toggle");
  await page
    .getByRole("button", { name: /practical uses/i })
    .first()
    .click({ timeout: 5000 })
    .catch(() => {});
  await page.waitForTimeout(900);
  puFound = (await page.locator(".practical-use--interactive").count()) > 0;
}
if (puFound) {
  const pu = page.locator(".practical-use--interactive").first();
  await pu.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -140));
  await stabilize(page);
  const puIds = await markMany(page, "pu", [".practical-use--interactive"], 3);
  await captureScene(page, "calc-pu", [
    { id: "nav", candidates: NAV },
    { id: "panel", candidates: ["[data-calculator-id]"] },
    ...many("pu", puIds),
  ]);

  // ---- 7. CALC-PU-OPEN: practical use clicked (fills calculator, pins) ------
  await pu.click({ timeout: 8000 });
  await page.waitForTimeout(1500); // values fill + result computes + DOM mutates
  await stabilize(page);
  await captureScene(page, "calc-pu-open", [
    { id: "nav", candidates: NAV },
    { id: "panel", candidates: ["[data-calculator-id]"] },
    {
      id: "pu-open",
      candidates: [
        ".practical-use--pinned",
        ".practical-use-presentation-container",
        ".practical-use--interactive",
      ],
    },
  ]);
}

// ---- 8. FAQS index ----------------------------------------------------------
await page.goto(`${BASE}/faqs/?noredirect`, { waitUntil: "domcontentloaded" });
await acceptCookies(page);
await stabilize(page);
const faqIds = await markBlocks(page);
await captureScene(page, "faqs", [
  { id: "nav", candidates: NAV },
  { id: "heading", candidates: ["main h1", "h1"] },
  ...many("block", faqIds),
]);

// ---- 9. FAQ example subpage: tip calculation --------------------------------
await page.goto(`${BASE}/faqs/tip-calculation-calculator/?noredirect`, {
  waitUntil: "domcontentloaded",
});
await acceptCookies(page);
await stabilize(page);
const exIds = await markBlocks(page);
await captureScene(page, "faq-ex", [
  { id: "nav", candidates: NAV },
  { id: "heading", candidates: ["main h1", "h1"] },
  ...many("block", exIds),
]);

await browser.close();
console.log("DONE →", OUT);
