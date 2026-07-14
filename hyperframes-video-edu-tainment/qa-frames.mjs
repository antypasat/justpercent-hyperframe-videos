// QA stills: render exact player frames into qa/ for visual verification.
// Run: node qa-frames.mjs [theme] [t1 t2 ...seconds]
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

const theme = process.argv[2] || "dark";
const times = process.argv.slice(3).map(Number);
const T = times.length
  ? times
  : [0.5, 1.2, 2.2, 4.0, 5.4, 7.9, 10.0, 11.2, 12.8, 13.4, 14.5, 16.0, 18.3,
     19.0, 21.8, 25.0, 26.7, 31.5, 33.6, 37.5, 39.4];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1
});
await page.goto(
  `file://${join(ROOT, "edu-tainment.html")}?rec&pause&theme=${theme}`,
  { waitUntil: "load" }
);
await page.waitForFunction(() => !!window.__f7Seek, { timeout: 15000 });
await page.waitForTimeout(800);
for (const t of T) {
  await page.evaluate(async ({ t, theme }) => window.__f7Seek(t, theme), { t, theme });
  await page.waitForTimeout(140);
  await page.screenshot({
    path: join(ROOT, "qa", `f7-${theme}-${t.toFixed(2)}s.png`)
  });
  console.log(`qa f7-${theme}-${t.toFixed(2)}s.png`);
}
await browser.close();
