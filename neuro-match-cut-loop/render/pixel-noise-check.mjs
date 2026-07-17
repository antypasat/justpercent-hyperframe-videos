// Quantify the parity pixel diffs: same page, direct seek vs wander+seek,
// decode both PNGs in-browser and measure differing pixels + max channel
// delta. Tiny deltas confined to blurred layers = GPU raster noise, not a
// composition-state divergence (DOM parity already passes).
import { chromium } from "/Users/michael/startups/percentage-calculator/handy-percent/node_modules/.pnpm/playwright@1.58.2/node_modules/playwright/index.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto("file://" + join(ROOT, "index-qa.html"), { waitUntil: "load", timeout: 60000 });
await page.evaluate(async () => { await document.fonts.ready; });
await page.waitForTimeout(1500);
const seek = (t) => page.evaluate((tt) => { window.__timelines.main.seek(tt, false); }, t);
const WANDER = [31.4, 9.4, 25.0, 2.0, 35.9, 17.6, 11.05, 23.0, 8.3, 28.0];

// warm-up: visit every scene once so lazy image decode/raster is done before
// the A/B comparison (first-paint warm-up is not a seek-determinism issue)
for (const w of [0.5, 5, 8.45, 12.7, 16.6, 17.6, 20.65, 23.6, 26.6, 33]) {
  await seek(w); await page.waitForTimeout(400);
}

for (const t of [5.0, 12.7, 20.65, 23.6]) {
  await seek(0); await seek(t); await page.waitForTimeout(80);
  const a = (await page.screenshot({ type: "png" })).toString("base64");
  for (const w of WANDER) await seek(w);
  await seek(t); await page.waitForTimeout(80);
  const b = (await page.screenshot({ type: "png" })).toString("base64");
  const m = await page.evaluate(async ([pa, pb]) => {
    const dec = async (b64) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const bmp = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
      const cv = new OffscreenCanvas(bmp.width, bmp.height);
      const cx = cv.getContext("2d");
      cx.drawImage(bmp, 0, 0);
      return cx.getImageData(0, 0, bmp.width, bmp.height).data;
    };
    const A = await dec(pa), B = await dec(pb);
    let diff = 0, maxد = 0, max = 0, minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
    for (let i = 0; i < A.length; i += 4) {
      const d = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
      if (d > 0) {
        diff++; if (d > max) max = d;
        const p = i / 4, x = p % 1080, y = (p / 1080) | 0;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    return { totalPx: A.length / 4, diffPx: diff, maxChannelDelta: max, bbox: diff ? [minX, minY, maxX, maxY] : null };
  }, [a, b]);
  console.log("t=" + t, JSON.stringify(m));
}
await browser.close();
