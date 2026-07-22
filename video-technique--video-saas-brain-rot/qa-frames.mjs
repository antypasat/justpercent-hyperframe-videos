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
// includes the roast (7.95), every punch-in (2.1, 10.6, 11.7, 18.2, 21.9) and
// every HUD state: quest spawn/checks, XP popups, minimap pages, toast
const T = times.length
  ? times
  : [0.8, 1.6, 2.1, 3.5, 5.2, 6.5, 7.6, 7.95, 8.6, 9.5, 10.1, 10.6, 11.7,
     12.9, 14.6, 15.9, 16.8, 18.2, 19.5, 20.9, 21.9, 23.0, 26.0, 28.0, 29.7];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1
});
await page.goto(
  `file://${join(ROOT, "saas-brain-rot.html")}?rec&pause&theme=${theme}`,
  { waitUntil: "load" }
);
await page.waitForFunction(() => !!window.__f7Seek, { timeout: 15000 });
await page.waitForTimeout(600);
for (const t of T) {
  await page.evaluate(async ({ t, theme }) => window.__f7Seek(t, theme), { t, theme });
  await page.waitForTimeout(120);
  await page.screenshot({
    path: join(ROOT, "qa", `f7-${theme}-${t.toFixed(2)}s.png`)
  });
  console.log(`qa f7-${theme}-${t.toFixed(2)}s.png`);
}
await browser.close();
