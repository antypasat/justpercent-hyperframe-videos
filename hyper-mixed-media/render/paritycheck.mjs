/*
 * paritycheck.mjs — proves the monotonic seek fast-path is state-identical
 * to a full replay, ON THE SAME PAGE (cross-load comparisons only add raster
 * noise). For each sample t:
 *   A) arrive incrementally: forward seeks in 1/30 s steps (fast-path active)
 *   B) forced full replay: seek(0) [backward = full replay] then seek(t)
 *      (nothing ended before lastT=0, so every tween re-applies)
 * A and B must match DOM-for-DOM (style + class + text dump, strict) and
 * pixel-for-pixel. Caveat on pixels: after an incremental walk Chrome's
 * blurred/backdrop-filter layers rasterize with a few-per-255 channel
 * wobble even when the walk is repeated with the OLD full-replay engine
 * (measured: two identical old-engine walks are not byte-equal either;
 * DOM stays strictly identical). So when A and B differ, the harness
 * re-runs the incremental arrival and uses that same-engine repeat as the
 * wobble baseline — B must not differ from A by more than the baseline
 * (+2/255 slack). Real state divergence (wrong text, shifted layout,
 * stale opacity) is orders of magnitude above this.
 *
 *   node render/paritycheck.mjs
 */
import { chromium } from '/Users/michael/startups/percentage-calculator/percentage-calculator-app/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SAMPLES = [2.0, 5.2, 8.5, 9.87, 11.0, 13.95, 15.65, 17.45, 20.65, 21.75,
                 23.7, 25.3, 27.0, 27.95, 30.4, 33.0, 35.5];

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + root + '/index.html', { waitUntil: 'load' });
await page.evaluate(async () => {
  await Promise.all(Array.from(document.fonts, (f) => f.load()));
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 250));
});

const domDump = () => page.evaluate(() => {
  const out = [];
  document.querySelectorAll('#stage *').forEach((el, i) => {
    out.push(i + '|' + (el.getAttribute('style') || '') + '|' + el.className.toString() +
             '|' + (el.children.length === 0 ? el.textContent : ''));
  });
  return out.join('\n');
});
const shoot = () => page.screenshot({ animations: 'disabled' });
const pixDiff = (a, b) => page.evaluate(async ([pa, pb]) => {
  const load = (b64) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + b64; });
  const [ia, ib] = await Promise.all([load(pa), load(pb)]);
  const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(ia, 0, 0); const da = ctx.getImageData(0, 0, c.width, c.height).data;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.drawImage(ib, 0, 0); const db = ctx.getImageData(0, 0, c.width, c.height).data;
  let n = 0, maxd = 0;
  for (let i = 0; i < da.length; i += 4) {
    const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]));
    if (d > 0) { n++; if (d > maxd) maxd = d; }
  }
  return { n, maxd };
}, [a.toString('base64'), b.toString('base64')]);

const arriveIncrementally = (t) => page.evaluate((tt) => {
  const tl = window.__timelines['jp-hyper-mixed-media'];
  tl.seek(0);
  for (let x = 1 / 30; x < tt; x += 1 / 30) tl.seek(x);
  tl.seek(tt);
}, t);

let fail = 0;
for (const t of SAMPLES) {
  // A: incremental forward arrival from 0 (fast-path exercised)
  await arriveIncrementally(t);
  const domA = await domDump();
  const pngA = await shoot();

  // B: forced full replay at the same t on the same page
  await page.evaluate((tt) => {
    const tl = window.__timelines['jp-hyper-mixed-media'];
    tl.seek(0);   // backward => full replay, resets fast-path marker
    tl.seek(tt);  // forward from 0 => nothing skippable => full application
  }, t);
  const domB = await domDump();
  const pngB = await shoot();

  const domOk = domA === domB;
  let pix = { n: 0, maxd: 0 }, base = { n: 0, maxd: 0 };
  if (!pngA.equals(pngB)) {
    pix = await pixDiff(pngA, pngB);
    // same-engine repeat = raster-wobble baseline at this exact beat
    await arriveIncrementally(t);
    const pngA2 = await shoot();
    if (!pngA.equals(pngA2)) base = await pixDiff(pngA, pngA2);
  }
  const pixOk = pix.maxd <= base.maxd + 2;
  if (!domOk || !pixOk) {
    fail++;
    if (!domOk) {
      const a = domA.split('\n'), b = domB.split('\n');
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { console.log(`  first DOM diff @${i}:\n   A: ${a[i]}\n   B: ${b[i]}`); break; }
    }
  }
  const pixMsg = pix.n === 0 ? 'byte-identical'
    : `${pix.n}px maxΔ${pix.maxd}/255 (same-engine wobble baseline maxΔ${base.maxd})`;
  console.log(`${domOk && pixOk ? 'PASS' : 'FAIL'} t=${t}  dom=${domOk ? 'identical' : 'DIFF'}  pixels=${pixMsg}`);
}
await browser.close();
process.exit(fail ? 1 : 0);
