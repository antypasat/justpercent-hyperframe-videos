// Render QA stills of the marketing master cut: seek key GLOBAL timestamps via
// window.__filmSeek(t) and screenshot into qa/. Deterministic — same t, same pixels.
//
// Run: node qa-frames.mjs [t…]   e.g. node qa-frames.mjs 7.6 47.3
// (no args = the full key-moment list below)

import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(
  "/Users/michael/startups/percentage-calculator/handy-percent/package.json"
);
const { chromium } = require("@playwright/test");

const ROOT = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(ROOT, "qa"), { recursive: true });

// Key moments per scene (global film seconds):
// S1 hook-faq 0–7.0 · S2 search 7.0–21.2 · S3 coupon 21.2–39.5
// S4 tax 39.5–48.1 · S5 live-typing 48.1–64.3 · S6 cta 64.3–71.2
const TIMES = [
  // S1: question, hover, whip, $15 ring + caption
  0.6, 1.8, 2.2, 3.9, 6.2,
  // S2: click search, caret after each keystroke (t/ti/tip), suggestion,
  //     arrival ring (top caption), $9 zoom
  8.4, 9.1, 9.28, 9.5, 12.5, 17.2, 20.5,
  // S3: card ring, arrival, $80, saved, glow, copied
  22.5, 24.2, 28.2, 31.4, 33.0, 36.1, 38.0,
  // S4: card, arrival, $108
  40.5, 42.1, 44.1,
  // S5: greeting, click f1, caret after 5/50/500/5000, caret after 2/25,
  //     6250 ring, emphasis caption
  49.1, 51.9, 52.35, 52.47, 52.6, 52.8, 55.9, 56.1, 59.5, 61.5,
  // S6: plate build, url + caption
  65.6, 68.9,
  // scene-boundary dip
  21.1
];

const only = process.argv.slice(2).map(Number);
const times = only.length ? only : TIMES;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1680, height: 1000 }, deviceScaleFactor: 1
});
await page.goto(`file://${join(ROOT, "index.html")}?rec`, { waitUntil: "load" });
await page.waitForTimeout(600);

for (const t of times) {
  await page.evaluate(async (t) => { await window.__filmSeek(t); }, t);
  await page.waitForTimeout(180);
  const name = `qa-t${t.toFixed(2).replace(".", "_")}.png`;
  await page.screenshot({ path: join(ROOT, "qa", name) });
  console.log("qa:", name);
}
await browser.close();
