/* parity.mjs — same-page determinism test.
   For each checkpoint t: (A) reach t by incremental 30fps forward seeks,
   (B) force full replay via seek(0) -> seek(t), (C) reach t by a backward seek
   from DUR. Screenshots + DOM dumps (style attr, class, textContent of all
   [id] elements) must be identical across A/B/C. */
import { chromium } from '/Users/michael/startups/percentage-calculator/percentage-calculator-app/node_modules/playwright/index.mjs';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = path.resolve(here, '..', 'index.html');
const outDir = path.join(here, 'parity-out');
fs.mkdirSync(outDir, { recursive: true });

const CHECKPOINTS = [8.92, 12.3, 17.1, 20.8, 24.5, 26.8, 30.5, 33.5, 37.6];
const FPS = 30, DUR = 38.5;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + indexHtml);
await page.evaluate(() => document.fonts.ready.then(() => undefined));
await page.waitForFunction(() => !!(window.__timelines && window.__timelines['justpercent-foley']));
await page.waitForTimeout(200);

const seek = t => page.evaluate(tt => { window.__timelines['justpercent-foley'].seek(tt, false); }, t);
const domDump = () => page.evaluate(() => {
  const out = [];
  document.querySelectorAll('[id]').forEach(el => {
    out.push(el.id + '|' + (el.getAttribute('style') || '') + '|' + el.className + '|' +
      (el.children.length === 0 ? el.textContent : ''));
  });
  return out.join('\n') + '\n#stage.class=' + document.getElementById('stage').className;
});
const shot = () => page.screenshot({ clip: { x: 0, y: 0, width: 1080, height: 1920 } });

// --- pass A: incremental forward, capture at checkpoints
const A = {};
let ci = 0;
for (let f = 0; f <= Math.round(DUR * FPS); f++) {
  const t = f / FPS;
  await seek(Math.min(t, DUR));
  while (ci < CHECKPOINTS.length && t >= CHECKPOINTS[ci] - 1e-9) {
    await seek(CHECKPOINTS[ci]);
    A[CHECKPOINTS[ci]] = { dom: await domDump(), png: await shot() };
    await seek(t);
    ci++;
  }
}

// --- pass B: forced full replay (seek(0) then target)
const B = {};
for (const t of CHECKPOINTS) {
  await seek(0);
  await seek(t);
  B[t] = { dom: await domDump(), png: await shot() };
}

// --- pass C: backward seek from DUR
const C = {};
for (const t of [...CHECKPOINTS].reverse()) {
  await seek(DUR);
  await seek(t);
  C[t] = { dom: await domDump(), png: await shot() };
}

let fails = 0;
for (const t of CHECKPOINTS) {
  const domAB = A[t].dom === B[t].dom, domAC = A[t].dom === C[t].dom;
  const pxAB = A[t].png.equals(B[t].png), pxAC = A[t].png.equals(C[t].png);
  console.log(`t=${t}  dom A==B:${domAB}  A==C:${domAC}   px A==B:${pxAB}  A==C:${pxAC}`);
  if (!(domAB && domAC && pxAB && pxAC)) {
    fails++;
    for (const [k, v] of [['A', A[t]], ['B', B[t]], ['C', C[t]]]) {
      fs.writeFileSync(path.join(outDir, `t${t}-${k}.dom.txt`), v.dom);
      fs.writeFileSync(path.join(outDir, `t${t}-${k}.png`), v.png);
    }
  }
}
console.log(fails === 0 ? 'PARITY OK — incremental, full-replay and backward seeks are identical.' : `PARITY FAILURES: ${fails} checkpoint(s), dumps in ${outDir}`);
await browser.close();
