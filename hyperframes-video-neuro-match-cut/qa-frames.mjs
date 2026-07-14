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
  : [0.5, 1.9, 2.4, 4.4, 5.9, 6.6, 7.7, 9.5, 11.0, 12.1, 13.4, 15.2, 16.9,
     18.0, 20.1, 22.0, 24.2, 27.0, 29.9];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1
});
await page.goto(
  `file://${join(ROOT, "neuro-match-cut.html")}?rec&pause&theme=${theme}`,
  { waitUntil: "load" }
);
await page.waitForFunction(() => !!window.__f5Seek, { timeout: 15000 });
await page.waitForTimeout(600);
for (const t of T) {
  await page.evaluate(async ({ t, theme }) => window.__f5Seek(t, theme), { t, theme });
  await page.waitForTimeout(120);
  await page.screenshot({
    path: join(ROOT, "qa", `f5-${theme}-${t.toFixed(2)}s.png`)
  });
  console.log(`qa f5-${theme}-${t.toFixed(2)}s.png`);
}
await browser.close();
