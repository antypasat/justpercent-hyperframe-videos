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
  : [0.5, 1.8, 3.5, 5.5, 7.8, 9.6, 10.18, 10.5, 12.1, 13.6, 15.5, 17.5, 19.9, 22, 26.5, 29.5, 31.5];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1
});
await page.goto(
  `file://${join(ROOT, "spatial-ui-3d.html")}?rec&pause&theme=${theme}`,
  { waitUntil: "load" }
);
await page.waitForFunction(() => !!window.__f1Seek, { timeout: 15000 });
await page.waitForTimeout(600);
for (const t of T) {
  await page.evaluate(async ({ t, theme }) => window.__f1Seek(t, theme), { t, theme });
  await page.waitForTimeout(120);
  await page.screenshot({
    path: join(ROOT, "qa", `f1-${theme}-${t.toFixed(2)}s.png`)
  });
  console.log(`qa f1-${theme}-${t.toFixed(2)}s.png`);
}
await browser.close();
