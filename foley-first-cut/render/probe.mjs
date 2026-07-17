/* probe.mjs — deterministic QA stills for the foley-first-cut composition.
   Usage: node render/probe.mjs [outdir] [t1 t2 ...]
   Seeks window.__timelines["justpercent-foley"] to each t on a settled page
   and screenshots the 1080x1920 stage. Also dumps console errors. */
import { chromium } from '/Users/michael/startups/percentage-calculator/percentage-calculator-app/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = path.resolve(here, '..', 'index.html');
const args = process.argv.slice(2);
const outDir = args[0] && isNaN(parseFloat(args[0])) ? args[0] : path.join(here, 'probe-out');
const times = args.filter(a => !isNaN(parseFloat(a))).map(parseFloat);

const DEFAULT_TIMES = [
  0.5, 1.4, 2.6, 3.0,                 // cold open: keycap + headlines
  4.0, 5.3, 6.2, 8.3,                 // homepage assembly, caption, scroll to card6
  8.92, 9.15,                         // click card6 + ring
  9.8, 10.5, 11.3, 12.3, 13.0,        // calc page: hint state, typing 8/108, result 100
  13.9, 14.42, 14.7, 15.2, 15.9, 16.4, 17.1, 18.2, // PU scroll, pin, presentation, chips, result
  19.0, 19.4, 20.0, 20.8, 21.35,      // theme fab click + 3D flip
  22.0, 22.6, 23.3, 23.8, 24.5, 24.77, // search click, typing, dropdown, dd click
  25.5, 26.1, 26.45, 26.8, 27.4,      // scroll to basic, presentation, fills, result
  28.3, 29.2, 30.0, 30.5, 30.9,       // faq hub, scroll, click hub card
  31.7, 32.2, 32.9, 33.5, 34.5,       // faq page, drag 80000->90000, result
  36.0, 36.6, 37.6, 38.3              // outro
];

const ts = times.length ? times : DEFAULT_TIMES;
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const consoleMsgs = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') consoleMsgs.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => consoleMsgs.push('pageerror: ' + e.message));

await page.goto('file://' + indexHtml);
await page.evaluate(() => document.fonts.ready.then(() => undefined));
await page.waitForFunction(() => !!(window.__timelines && window.__timelines['justpercent-foley']));
await page.waitForTimeout(300);

for (const t of ts) {
  await page.evaluate(tt => { window.__timelines['justpercent-foley'].seek(tt, false); }, t);
  await page.waitForTimeout(60);
  const name = 't' + t.toFixed(2).replace('.', '_') + '.png';
  await page.screenshot({ path: path.join(outDir, name), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  process.stdout.write(name + '\n');
}

fs.writeFileSync(path.join(outDir, 'console.txt'), consoleMsgs.join('\n') || '(no console errors/warnings)');
console.log('console messages:', consoleMsgs.length);
await browser.close();
