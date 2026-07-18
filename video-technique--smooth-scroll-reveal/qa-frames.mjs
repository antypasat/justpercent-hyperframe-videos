// Renders control frames of every version via window.__ssrSeek into qa/.
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

const SHOTS = {
  "6.1": [0.1, 1.4, 2.4, 3.4],
  "6.2": [0.3, 1.8, 3.0, 3.9],
  "6.3": [0.4, 2.4, 4.6],
  "6.4": [0.4, 1.8, 3.2, 4.4],
  "6.5": [0.3, 1.6, 2.9, 4.1],
  "6.6": [0.4, 1.3, 2.2, 3.1, 3.9],
  "6.7": [0.4, 2.0, 3.0, 4.0, 5.2]
};

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1680, height: 1020 }, deviceScaleFactor: 1
});
await page.goto(`file://${join(ROOT, "smooth-scroll-reveal.html")}`);
await page.waitForFunction(() => typeof window.__ssrSeek === "function");
await page.evaluate(() => document.fonts.ready);

for (const [v, times] of Object.entries(SHOTS)) {
  for (const t of times) {
    await page.evaluate(async ({ v, t }) => { await window.__ssrSeek(v, t); }, { v, t });
    await page.waitForTimeout(300); // paint settle
    await page.screenshot({
      path: join(ROOT, "qa", `v${v.replace(".", "-")}-t${t.toFixed(1)}.png`)
    });
    console.log(`qa v${v} t=${t}`);
  }
}
await browser.close();
