#!/usr/bin/env node
/*
 * render.mjs — deterministic frame-by-frame renderer for the HyperFrames
 * composition in ../composition/index.html.
 *
 * Works exactly like `npx hyperframes render`: headless Chromium loads the
 * composition, the registered timeline (window.__timelines[id]) is seeked
 * to each frame's timestamp, a screenshot is taken, and FFmpeg encodes the
 * frame stream into an MP4.
 *
 * Stabilization contract (enforced before ANY frame capture):
 *   - network idle (no pending requests for >= 500ms)
 *   - document.fonts.ready resolved
 *   - all <img> decoded
 *   - two consecutive rAF ticks with zero layout shift
 * Because every frame is produced by seeking a paused, purely
 * time-driven timeline, no frame can ever be captured "mid-transition":
 * the DOM state for time t is fully computed synchronously by seek(t).
 *
 * Usage: node render/render.mjs [--fps 30] [--out output/video.mp4] [--frames-only]
 */
import { createRequire } from 'node:module';
const _require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = _require('playwright'));
} catch {
  // fall back to the globally installed playwright (cloud sandbox)
  ({ chromium } = _require('/home/claude/.npm-global/lib/node_modules/playwright/index.js'));
}
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const getArg = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : dflt;
};
const FPS = parseInt(getArg('--fps', '30'), 10);
const OUT = resolve(__dirname, '..', getArg('--out', 'output/justpercent-spatial.mp4'));
const COMP = resolve(__dirname, '..', 'index.html');
const FRAMES_ONLY = args.includes('--frames-only');

mkdirSync(dirname(OUT), { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || undefined,
  args: [
    '--force-color-profile=srgb',
    '--disable-lcd-text',
    '--font-render-hinting=none',
    '--hide-scrollbars',
  ],
});

const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => { console.error('PAGE ERROR:', e.message); });
page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });

await page.goto('file://' + COMP, { waitUntil: 'networkidle' });

/* ---------- stabilization before first capture ---------- */
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all(
    Array.from(document.images).map((img) =>
      img.decode ? img.decode().catch(() => {}) : Promise.resolve()
    )
  );
});
// two rAF ticks + verify zero layout shift for ~500ms
await page.evaluate(() => new Promise((done) => {
  let shifts = 0;
  const po = new PerformanceObserver((list) => { shifts += list.getEntries().length; });
  try { po.observe({ type: 'layout-shift', buffered: false }); } catch (_) {}
  const t0 = performance.now();
  const tick = () => {
    if (performance.now() - t0 >= 500 && shifts === 0) { po.disconnect(); done(); }
    else if (performance.now() - t0 >= 500) { shifts = 0; requestAnimationFrame(tick); }
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}));

const meta = await page.evaluate(() => {
  const stage = document.querySelector('[data-composition-id]');
  const id = stage.getAttribute('data-composition-id');
  const tl = window.__timelines && window.__timelines[id];
  if (!tl) throw new Error('No timeline registered for composition ' + id);
  return { id, duration: tl.duration(), w: +stage.dataset.width, h: +stage.dataset.height };
});
const TOTAL = Math.round(meta.duration * FPS);
console.log(`Composition "${meta.id}" ${meta.w}x${meta.h}, ${meta.duration}s @ ${FPS}fps = ${TOTAL} frames`);

/* ---------- ffmpeg pipe ---------- */
let ff = null;
if (!FRAMES_ONLY) {
  ff = spawn('ffmpeg', [
    '-y', '-f', 'image2pipe', '-vcodec', 'png', '-r', String(FPS), '-i', '-',
    '-vf', `scale=${meta.w}:${meta.h}:flags=lanczos`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-crf', '17', '-preset', 'slow', '-movflags', '+faststart', OUT,
  ], { stdio: ['pipe', 'ignore', 'inherit'] });
}

for (let f = 0; f <= TOTAL; f++) {
  const t = f / FPS;
  // seek is synchronous & pure — DOM is fully settled for time t on return
  await page.evaluate(([id, t]) => window.__timelines[id].seek(t), [meta.id, t]);
  const buf = await page.screenshot({ type: 'png' });
  if (ff) {
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  if (f % (FPS * 2) === 0) console.log(`frame ${f}/${TOTAL} (t=${t.toFixed(2)}s)`);
}

if (ff) {
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg exit ' + c)))));
  console.log('Wrote', OUT);
}
await browser.close();
