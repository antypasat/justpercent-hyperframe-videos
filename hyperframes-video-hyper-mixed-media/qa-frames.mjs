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
  : [0.5, 2.5, 5.0, 7.2, 8.5, 9.8, 11.0, 13.0, 15.8, 17.2, 18.5, 20.5, 23.5,
     26.0, 27.2, 28.6, 30.0, 32.0, 34.4];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1
});
await page.goto(
  `file://${join(ROOT, "hyper-mixed-media.html")}?rec&pause&theme=${theme}`,
  { waitUntil: "load" }
);
await page.waitForFunction(() => !!window.__f4Seek, { timeout: 15000 });
await page.waitForTimeout(800);
for (const t of T) {
  await page.evaluate(async ({ t, theme }) => window.__f4Seek(t, theme), { t, theme });
  await page.waitForTimeout(140);
  await page.screenshot({
    path: join(ROOT, "qa", `f4-${theme}-${t.toFixed(2)}s.png`)
  });
  console.log(`qa f4-${theme}-${t.toFixed(2)}s.png`);
}
await browser.close();
