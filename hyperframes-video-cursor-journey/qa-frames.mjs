// Render QA stills of the player: for every version, seek key timestamps via
// window.__cjSeek and screenshot into qa/. Deterministic — same t, same pixels.
//
// Run: node qa-frames.mjs [version…]   e.g. node qa-frames.mjs 2.1 2.4

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

const TIMES = {
  "2.1": [0.5, 1.5, 3.0, 4.6, 6.3, 7.4, 9.2],
  "2.2": [0.5, 2.3, 2.7, 3.4, 5.6, 7.6],
  "2.3": [0.8, 1.6, 2.7, 3.6, 5.5, 6.2, 9.0],
  "2.4": [0.5, 1.3, 2.5, 3.6, 4.3, 5.7],
  "2.5": [0.8, 2.5, 4.6, 6.9, 8.2],
  "2.6": [0.6, 2.8, 4.0, 5.9, 7.4],
  "2.7": [0.8, 2.9, 4.8, 6.6, 8.0, 9.2, 11.5]
};

const only = process.argv.slice(2);
const keys = only.length ? only : Object.keys(TIMES);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1680, height: 1000 }, deviceScaleFactor: 1
});
await page.goto(`file://${join(ROOT, "cursor-journey.html")}?rec`, {
  waitUntil: "load"
});
await page.waitForTimeout(600);

for (const key of keys) {
  for (const t of TIMES[key]) {
    await page.evaluate(
      async ({ key, t }) => { await window.__cjSeek(key, t); },
      { key, t }
    );
    await page.waitForTimeout(180);
    const name = `qa-${key.replace(".", "-")}-t${t.toFixed(1).replace(".", "_")}.png`;
    await page.screenshot({ path: join(ROOT, "qa", name) });
    console.log("qa:", name);
  }
}
await browser.close();
