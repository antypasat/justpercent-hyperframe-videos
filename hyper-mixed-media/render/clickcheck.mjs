/*
 * clickcheck.mjs — empirical cursor-precision check.
 *
 * For every hand tap: seek(t_tap), read the target's getBoundingClientRect()
 * and the hand fingertip position (parsed from #hand's style.transform;
 * fingertip = element point (50,8), #view is scale(2) at origin 0 0), print
 * the delta. Pass = fingertip inside the target rect (±15 px residual at the
 * tap instant is the seeded camera shake and is acceptable).
 *
 *   node render/clickcheck.mjs
 */
import { chromium } from '/Users/michael/startups/percentage-calculator/percentage-calculator-app/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TAPS = [
  { name: 'hand1 coupon CTA', t: 8.50, sel: '#cta-coupon' },
  { name: 'hand2 PU sale row', t: 13.95, sel: '#pu-sale' },
  { name: 'hand3 dropdown PU row', t: 21.75, sel: '#dd-pu-tip' },
  { name: 'hand4 hub tip card', t: 27.95, sel: '#hub-tip' },
];

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + root + '/index.html', { waitUntil: 'load' });
await page.evaluate(async () => {
  await Promise.all(Array.from(document.fonts, (f) => f.load()));
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 250));
});

let fail = 0;
for (const tap of TAPS) {
  const r = await page.evaluate(({ t, sel }) => {
    window.__timelines['jp-hyper-mixed-media'].seek(t);
    const el = document.querySelector(sel);
    const rect = el.getBoundingClientRect();
    const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(document.getElementById('hand').style.transform);
    const tip = { x: (parseFloat(m[1]) + 50) * 2, y: (parseFloat(m[2]) + 8) * 2 };
    return { rect: { l: rect.left, t: rect.top, r: rect.right, b: rect.bottom,
                     cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 }, tip };
  }, tap);
  const inside = r.tip.x >= r.rect.l && r.tip.x <= r.rect.r && r.tip.y >= r.rect.t && r.tip.y <= r.rect.b;
  const dx = (r.tip.x - r.rect.cx).toFixed(1), dy = (r.tip.y - r.rect.cy).toFixed(1);
  if (!inside) fail++;
  console.log(`${inside ? 'PASS' : 'FAIL'} ${tap.name} t=${tap.t}  tip=(${r.tip.x.toFixed(1)},${r.tip.y.toFixed(1)})  rect=[${r.rect.l.toFixed(1)},${r.rect.t.toFixed(1)} .. ${r.rect.r.toFixed(1)},${r.rect.b.toFixed(1)}]  d-center=(${dx},${dy})`);
}
await browser.close();
process.exit(fail ? 1 : 0);
