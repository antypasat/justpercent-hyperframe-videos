// Deterministic MP4 render: seek frame-by-frame, pipe PNGs to ffmpeg.
// Run: node record.mjs [theme] [fps]   → out/hyper-mixed-media-<theme>.mp4
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(
  "/Users/michael/startups/percentage-calculator/handy-percent/package.json"
);
const { chromium } = require("@playwright/test");

const ROOT = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(ROOT, "out"), { recursive: true });

const theme = process.argv[2] || "dark";
const fps = +(process.argv[3] || 30);
const DURATION = 35; // seconds (configs.js meta.duration)
const frames = Math.round(DURATION * fps);

const ff = spawn("/opt/homebrew/bin/ffmpeg", [
  "-y", "-f", "image2pipe", "-vcodec", "png", "-r", String(fps), "-i", "-",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
  "-movflags", "+faststart",
  join(ROOT, "out", `hyper-mixed-media-${theme}.mp4`)
], { stdio: ["pipe", "inherit", "inherit"] });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1
});
await page.goto(
  `file://${join(ROOT, "hyper-mixed-media.html")}?rec&pause&theme=${theme}`,
  { waitUntil: "load" }
);
await page.waitForFunction(() => !!window.__f4Seek, { timeout: 15000 });
await page.waitForTimeout(800);

for (let i = 0; i < frames; i++) {
  const t = i / fps;
  await page.evaluate(
    async ({ t, theme }) => window.__f4Seek(t, theme), { t, theme }
  );
  const buf = await page.screenshot({ type: "png" });
  ff.stdin.write(buf);
  if (i % 120 === 0) console.log(`frame ${i}/${frames}`);
}
ff.stdin.end();
await new Promise((res) => ff.on("close", res));
await browser.close();
console.log(`out/hyper-mixed-media-${theme}.mp4 done`);
