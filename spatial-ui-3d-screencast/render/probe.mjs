#!/usr/bin/env node
/* probe.mjs — capture individual frames at given timestamps for QA.
   Usage: node render/probe.mjs 0.5 5 9 12 ... (seconds) */
import { createRequire } from 'node:module';
const _require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = _require('playwright')); }
catch { ({ chromium } = _require('/home/claude/.npm-global/lib/node_modules/playwright/index.js')); }
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMP = resolve(__dirname, '..', 'index.html');
const OUT = resolve(__dirname, '..', 'output/probe');
mkdirSync(OUT, { recursive: true });

const times = process.argv.slice(2).map(Number);
const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });
await page.goto('file://' + COMP, { waitUntil: 'networkidle' });
await page.evaluate(async () => { await document.fonts.ready; });
for (const t of times) {
  await page.evaluate((t) => window.__timelines.justpercent.seek(t), t);
  await page.screenshot({ path: `${OUT}/t${String(t).replace('.', '_')}.png` });
  console.log('captured t=' + t);
}
await browser.close();
