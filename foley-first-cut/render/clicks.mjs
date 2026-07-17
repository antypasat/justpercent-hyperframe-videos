/* clicks.mjs — empirical click-precision QA.
   For each click beat: seek(t), read the target's getBoundingClientRect and the
   cursor's transform, print the cursor-tip vs target-rect delta in 540x960 view px.
   Acceptance: tip inside the target rect; residual ±15px at the click instant is
   the intended camera shake (page moves under the cursor). */
import { chromium } from '/Users/michael/startups/percentage-calculator/percentage-calculator-app/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'url';
import path from 'path';

const here = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = path.resolve(here, '..', 'index.html');

// [t, selector, label]  — selector = the INTERACTIVE element the cursor must hit
const CLICKS = [
  [8.92,  '#hl-card6 .cta',    'S2 solution-card CTA "Find Pre-Tax Price"'],
  [14.42, '#pu-inflation',     'S4 practical-use row "Price Before Hike"'],
  [19.38, '#calc-fab-theme',   'S5 theme toggle fab'],
  [21.95, '#hl-search .box',   'S6 search box'],
  [24.75, '#dd-pu-tip',        'S6 dropdown PU row'],
  [30.48, '#hub-tip',          'S7 FAQ hub card "Car Depreciation"'],
  [32.42, '#tip-bill',         'S8 FAQ bill mini-input (drag start)'],
  [33.20, '#tip-bill',         'S8 FAQ bill mini-input (drag end)'],
];

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + indexHtml);
await page.evaluate(() => document.fonts.ready.then(() => undefined));
await page.waitForFunction(() => !!(window.__timelines && window.__timelines['justpercent-foley']));
await page.waitForTimeout(200);

for (const [t, sel, label] of CLICKS) {
  const r = await page.evaluate(([tt, s]) => {
    window.__timelines['justpercent-foley'].seek(tt, false);
    const view = document.getElementById('view');
    const vr = view.getBoundingClientRect();
    const k = vr.width / 540;
    const el = document.querySelector(s);
    if (!el) return { missing: true };
    const tr = el.getBoundingClientRect();
    const rect = {
      x1: (tr.left - vr.left) / k, y1: (tr.top - vr.top) / k,
      x2: (tr.right - vr.left) / k, y2: (tr.bottom - vr.top) / k
    };
    const cur = document.getElementById('cursor');
    const m = new DOMMatrix(getComputedStyle(cur).transform);
    const s0 = m.a || 1;
    // tip of the clay arrow at local (10.5, 6.5) in the 74x74 box, margin -10, origin 50% 50%
    const tip = { x: -10 + m.e + (10.5 - 37) * s0 + 37, y: -10 + m.f + (6.5 - 37) * s0 + 37 };
    const cx = (rect.x1 + rect.x2) / 2, cy = (rect.y1 + rect.y2) / 2;
    return {
      rect, tip, opacity: getComputedStyle(cur).opacity,
      dCenter: { x: +(tip.x - cx).toFixed(1), y: +(tip.y - cy).toFixed(1) },
      inside: tip.x >= rect.x1 && tip.x <= rect.x2 && tip.y >= rect.y1 && tip.y <= rect.y2
    };
  }, [t, sel]);
  if (r.missing) { console.log(`t=${t}  ${label}  !! selector missing: ${sel}`); continue; }
  console.log(
    `t=${t}  ${label}\n` +
    `   tip=(${r.tip.x.toFixed(1)},${r.tip.y.toFixed(1)})  target=[${r.rect.x1.toFixed(0)}..${r.rect.x2.toFixed(0)} x ${r.rect.y1.toFixed(0)}..${r.rect.y2.toFixed(0)}]` +
    `  dCenter=(${r.dCenter.x},${r.dCenter.y})  inside=${r.inside}  cursorOpacity=${r.opacity}`
  );
}
await browser.close();
