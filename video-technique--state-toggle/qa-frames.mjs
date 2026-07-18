// Renders control frames of every version via window.__stSeek into qa/.
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

// per version: establish / pre-click / mid-transition / after / final
const SHOTS = {
  "4.1": [0.8, 2.9, 3.15, 3.8, 6.0],
  "4.2": [0.8, 2.9, 3.25, 4.0, 6.2],
  "4.3": [0.8, 2.5, 2.72, 3.4, 5.5],
  "4.4": [0.8, 2.7, 3.1, 4.5, 7.0],
  "4.5": [0.7, 2.0, 3.4, 3.8, 6.2],
  "4.6": [0.8, 2.0, 2.6, 5.0],
  "4.7": [0.8, 2.2, 3.3, 4.2, 7.0]
};

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1680, height: 1020 }, deviceScaleFactor: 1
});
await page.goto(`file://${join(ROOT, "state-toggle.html")}`);
await page.waitForFunction(() => typeof window.__stSeek === "function");
await page.evaluate(() => document.fonts.ready);

for (const [v, times] of Object.entries(SHOTS)) {
  for (const t of times) {
    await page.evaluate(async ({ v, t }) => { await window.__stSeek(v, t); }, { v, t });
    await page.waitForTimeout(350);
    await page.screenshot({
      path: join(ROOT, "qa", `v${v.replace(".", "-")}-t${t.toFixed(2)}.png`)
    });
    console.log(`qa v${v} t=${t}`);
  }
}
await browser.close();
