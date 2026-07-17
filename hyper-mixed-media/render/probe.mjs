/*
 * probe.mjs — deterministic probe stills for QA.
 *
 * The live preview is NOT a QA tool (heavy blur/3D layers make Chrome show
 * stale rasters during playback). The only truth is the deterministic frame:
 * seek(t) on a settled page, then screenshot — exactly what the mp4 renderer
 * does. Usage:
 *
 *   node render/probe.mjs <outDir> <t1> <t2> ...
 *   node render/probe.mjs shots 8.5 8.9 13.95
 */
import { chromium } from '/Users/michael/startups/percentage-calculator/percentage-calculator-app/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [outDir, ...timeArgs] = process.argv.slice(2);
if (!outDir || timeArgs.length === 0) {
  console.error('usage: node render/probe.mjs <outDir> <t...>');
  process.exit(1);
}
const times = timeArgs.map(Number);
mkdirSync(outDir, { recursive: true });

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('file://' + root + '/index.html', { waitUntil: 'load' });
// fonts + the composition's own fonts-driven rebuild must settle first
await page.evaluate(async () => {
  await Promise.all(Array.from(document.fonts, (f) => f.load()));
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 250));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
});

for (const t of times) {
  await page.evaluate((tt) => window.__timelines['jp-hyper-mixed-media'].seek(tt), t);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: `${outDir}/t${t.toFixed(2).replace('.', '_')}.png` });
  console.log('shot t=' + t);
}
console.log('console errors:', errors.length ? errors : 'none');
await browser.close();
