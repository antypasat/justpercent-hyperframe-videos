// Renders control frames of every version via window.__leSeek into qa/.
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
  "8.1": [0.2, 1.6, 3.0, 5.2, 7.5],
  "8.2": [0.2, 1.8, 4.0, 6.5],
  "8.3": [0.3, 2.2, 4.5, 7.5],
  "8.4": [0.1, 1.4, 2.8, 6.0],
  "8.5": [0.2, 1.8, 4.0, 7.5],
  "8.6": [0.3, 2.0, 4.5, 7.0, 8.6, 10.2],
  "8.7": [0.2, 2.2, 5.0, 8.0],
};

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1680, height: 1020 },
  deviceScaleFactor: 1,
});
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message.slice(0, 200)));
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE:", m.text().slice(0, 200)); });
await page.goto(`file://${join(ROOT, "layer-explosion.html")}`);
await page.waitForFunction(() => typeof window.__leSeek === "function");
await page.evaluate(() => document.fonts.ready);

for (const [v, times] of Object.entries(SHOTS)) {
  for (const t of times) {
    await page.evaluate(async ({ v, t }) => { await window.__leSeek(v, t); }, { v, t });
    await page.waitForTimeout(350);
    await page.screenshot({
      path: join(ROOT, "qa", `v${v.replace(".", "-")}-t${t.toFixed(1)}.png`),
    });
    console.log(`qa v${v} t=${t}`);
  }
}
await browser.close();
