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
// morph midpoints (8.45, 11.9, 14.9, 17.0, 20.9) + every assembled-plate
// moment (6.8, 10.5, 13.4, 16.2, 18.6, 24.0) + intro/endcard beats
const T = times.length
  ? times
  : [0.6, 1.9, 2.7, 4.0, 5.9, 6.8, 8.45, 10.5, 11.9, 13.4, 14.9, 16.2,
     17.0, 18.6, 20.9, 22.0, 24.0, 25.8, 27.5, 29.9];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1
});
await page.goto(
  `file://${join(ROOT, "gaussian-morph.html")}?rec&pause&theme=${theme}`,
  { waitUntil: "load" }
);
await page.waitForFunction(() => !!window.__f6Seek, { timeout: 15000 });
await page.waitForTimeout(600);
for (const t of T) {
  await page.evaluate(async ({ t, theme }) => window.__f6Seek(t, theme), { t, theme });
  await page.waitForTimeout(120);
  await page.screenshot({
    path: join(ROOT, "qa", `f6-${theme}-${t.toFixed(2)}s.png`)
  });
  console.log(`qa f6-${theme}-${t.toFixed(2)}s.png`);
}
await browser.close();
