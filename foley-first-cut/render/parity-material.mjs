/* parity-material.mjs — compares MATERIAL computed state (opacity, visibility,
   display, transform matrix, geometry, text) between incremental-forward,
   full-replay and backward seeks, ignoring inline-style residue that does not
   change rendering. */
import { chromium } from '/Users/michael/startups/percentage-calculator/percentage-calculator-app/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'url';
import path from 'path';

const here = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = path.resolve(here, '..', 'index.html');
const CHECKPOINTS = [8.92, 12.3, 17.1, 20.8, 24.5, 26.8, 30.5, 33.5, 37.6];
const FPS = 30, DUR = 38.5;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + indexHtml);
await page.evaluate(() => document.fonts.ready.then(() => undefined));
await page.waitForFunction(() => !!(window.__timelines && window.__timelines['justpercent-foley']));
await page.waitForTimeout(200);

const seek = t => page.evaluate(tt => { window.__timelines['justpercent-foley'].seek(tt, false); }, t);
const dump = () => page.evaluate(() => {
  const r2 = v => Math.round(v * 100) / 100;
  const out = [];
  document.querySelectorAll('#view *').forEach((el, i) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none') { out.push(i + '|none'); return; }
    const b = el.getBoundingClientRect();
    out.push([i, el.id || el.tagName, cs.opacity, cs.visibility,
      r2(b.left), r2(b.top), r2(b.width), r2(b.height),
      el.children.length === 0 ? el.textContent.trim() : ''].join('|'));
  });
  return out;
});

async function capture(order) {
  const res = {};
  if (order === 'A') {
    let ci = 0;
    for (let f = 0; f <= Math.round(DUR * FPS); f++) {
      const t = f / FPS;
      await seek(Math.min(t, DUR));
      while (ci < CHECKPOINTS.length && t >= CHECKPOINTS[ci] - 1e-9) {
        await seek(CHECKPOINTS[ci]); res[CHECKPOINTS[ci]] = await dump(); await seek(t); ci++;
      }
    }
  } else if (order === 'B') {
    for (const t of CHECKPOINTS) { await seek(0); await seek(t); res[t] = await dump(); }
  } else {
    for (const t of [...CHECKPOINTS].reverse()) { await seek(DUR); await seek(t); res[t] = await dump(); }
  }
  return res;
}

const A = await capture('A'), B = await capture('B'), C = await capture('C');
let fails = 0;
for (const t of CHECKPOINTS) {
  const diffs = [];
  for (let i = 0; i < A[t].length; i++) {
    if (A[t][i] !== B[t][i]) diffs.push(['A!=B', A[t][i], B[t][i]]);
    if (A[t][i] !== C[t][i]) diffs.push(['A!=C', A[t][i], C[t][i]]);
  }
  console.log(`t=${t}  material diffs: ${diffs.length}`);
  diffs.slice(0, 6).forEach(d => console.log('   ', d[0], '\n      A:', d[1], '\n      X:', d[2]));
  if (diffs.length) fails++;
}
console.log(fails === 0 ? 'MATERIAL PARITY OK' : 'MATERIAL FAILURES at ' + fails + ' checkpoints');
await browser.close();
