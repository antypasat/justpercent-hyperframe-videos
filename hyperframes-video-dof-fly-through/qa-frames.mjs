// Renders control frames of every version via window.__dofSeek into qa/.
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
  "9.1": [0.2, 2.0, 3.8],
  "9.2": [0.3, 1.6, 2.8, 4.3],
  "9.3": [0.4, 1.7, 3.0, 4.4],
  "9.4": [0.3, 1.2, 2.1],
  "9.5": [0.8, 3.6, 5.6],
  "9.6": [0.6, 2.1, 3.6, 4.7],
  "9.7": [0.3, 2.7, 5.2]
};

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1680, height: 1020 }, deviceScaleFactor: 1
});
await page.goto(`file://${join(ROOT, "dof-fly-through.html")}`);
await page.waitForFunction(() => typeof window.__dofSeek === "function");
await page.evaluate(() => document.fonts.ready);

for (const [v, times] of Object.entries(SHOTS)) {
  for (const t of times) {
    await page.evaluate(async ({ v, t }) => { await window.__dofSeek(v, t); }, { v, t });
    await page.waitForTimeout(350); // let strip filters/paint settle
    await page.screenshot({
      path: join(ROOT, "qa", `v${v.replace(".", "-")}-t${t.toFixed(1)}.png`)
    });
    console.log(`qa v${v} t=${t}`);
  }
}
await browser.close();
