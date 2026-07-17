// Probe stills for QA (PROMPT-KOREKTA-QA): deterministic seek(t) frames of
// index-qa.html (srcdoc variant works from file://). Never judge this film by
// live playback — the settled frame after seek(t) is the only truth.
//
//   node render/probe.mjs <outDir> [t t t ...]
//
// With no explicit times: shoots every interaction beat (+0.2-0.5s after),
// measures ripple-center vs click-target delta for rip1..rip4, and reports
// console errors. Exits non-zero on console/page errors.
import { chromium } from "/Users/michael/startups/percentage-calculator/handy-percent/node_modules/.pnpm/playwright@1.58.2/node_modules/playwright/index.mjs";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = process.argv[2] || join(ROOT, "render", "probe-frames");
const onlyTimes = process.argv.slice(3).map(Number).filter((n) => !Number.isNaN(n));
mkdirSync(outDir, { recursive: true });

const BEATS = [
  ["000-zero", 0.0], ["badge", 0.5], ["intro1", 1.2], ["intro2", 2.4],
  ["home-land", 3.3], ["home", 5.0], ["rip1-click", 7.35], ["cta-push", 8.1],
  ["calc-land", 8.45], ["calc-top", 9.4], ["scroll-mid", 10.3], ["scroll-end", 11.05],
  ["rip2-click", 11.3], ["pin-in", 11.9], ["pin-hold", 12.3], ["type-orig", 12.7],
  ["type-pct", 13.3], ["count-mid", 14.0], ["result", 14.4], ["fab-glide", 15.6],
  ["rip3-click", 15.9], ["flip-mid", 16.6], ["flip-end", 17.1], ["dark-home", 17.6],
  ["type-tip-mid", 18.8], ["type-tip-end", 19.35], ["dropdown", 19.6],
  ["rip4-click", 20.65], ["whoosh-mid", 21.3], ["target-land", 21.7],
  ["type-p2", 22.15], ["type-n2", 22.7], ["count2", 23.3], ["result2", 23.6],
  ["faq-hub", 24.6], ["type-faq-mid", 25.3], ["type-faq-end", 25.75],
  ["filt-swap", 25.95], ["faq-scroll-mid", 26.3], ["faq-scroll-end", 26.65],
  ["rip5-click", 26.8], ["card-push", 27.3], ["faq-land", 27.7],
  ["roll-mid", 28.8], ["roll-end", 29.4], ["faq-hold", 29.8], ["card-out", 30.4],
  ["endcard-build", 31.2], ["endcard", 33.0], ["collapse", 35.0],
  ["loop-tail", 35.98], ["036-loop", 36.0]
];

// ripple-vs-target: measured just after tap start (ripple hidden at e=0)
const RIPS = [
  { id: "rip1", t: 7.35, frame: "#scHomeL iframe",
    find: `(d)=>[...d.querySelectorAll('a,button')].filter(e=>/Calculate My Score/.test(e.textContent)&&e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0).sort((a,b)=>a.getBoundingClientRect().width*a.getBoundingClientRect().height-b.getBoundingClientRect().width*b.getBoundingClientRect().height)[0]` },
  { id: "rip2", t: 11.3, frame: "#scCalcDef iframe",
    find: `(d)=>[...d.querySelectorAll('li.practical-use')].find(e=>e.textContent.includes('Grade Points'))` },
  { id: "rip3", t: 15.9, frame: "#ifCalcPinL",
    find: `(d)=>d.getElementById('theme-toggle')` },
  { id: "rip4", t: 20.65, frame: "#scSearchD iframe",
    find: `(d)=>d.getElementById('search-item-0')` },
  { id: "rip5", t: 26.8, frame: "#scFaqFilt iframe",
    find: `(d)=>d.querySelector('a[href*="bank-deposit-interest"]')` }
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push("[console] " + m.text()); });
page.on("pageerror", (e) => errors.push("[pageerror] " + e.message));

await page.goto("file://" + join(ROOT, "index-qa.html"), { waitUntil: "load", timeout: 60000 });
await page.evaluate(async () => {
  await document.fonts.ready;
  for (const f of document.querySelectorAll("iframe")) {
    try { await f.contentDocument.fonts.ready; } catch (e) {}
  }
});
await page.waitForTimeout(1500);

const seek = (t) => page.evaluate((tt) => { window.__timelines.main.seek(tt, false); }, t);

if (onlyTimes.length) {
  for (const t of onlyTimes) {
    await seek(t);
    await page.waitForTimeout(120);
    await page.screenshot({ path: join(outDir, "t" + t.toFixed(2) + ".jpg"), type: "jpeg", quality: 60 });
    console.log("shot t=" + t);
  }
} else {
  for (const [name, t] of BEATS) {
    await seek(t);
    await page.waitForTimeout(120);
    await page.screenshot({ path: join(outDir, name + "-t" + t.toFixed(2) + ".jpg"), type: "jpeg", quality: 60 });
  }
  console.log("beats done:", BEATS.length, "frames ->", outDir);

  for (const r of RIPS) {
    await seek(r.t);
    await page.waitForTimeout(60);
    const m = await page.evaluate(({ id, frame, find }) => {
      const rip = document.getElementById(id).getBoundingClientRect();
      const rc = { x: rip.x + rip.width / 2, y: rip.y + rip.height / 2 };
      const f = document.querySelector(frame);
      const fr = f.getBoundingClientRect();
      const el = eval(find)(f.contentDocument);
      if (!el) return { id, error: "target not found" };
      const e = el.getBoundingClientRect();
      const k = fr.width / 432; // iframe CSS width 432, rect includes all transforms
      const tr = { x: fr.x + e.x * k, y: fr.y + e.y * k, w: e.width * k, h: e.height * k };
      return { id, rip: rc,
        target: { x: +tr.x.toFixed(1), y: +tr.y.toFixed(1), w: +tr.w.toFixed(1), h: +tr.h.toFixed(1),
                  cx: +(tr.x + tr.w / 2).toFixed(1), cy: +(tr.y + tr.h / 2).toFixed(1) },
        dx: +(rc.x - (tr.x + tr.w / 2)).toFixed(1), dy: +(rc.y - (tr.y + tr.h / 2)).toFixed(1),
        inside: rc.x >= tr.x && rc.x <= tr.x + tr.w && rc.y >= tr.y && rc.y <= tr.y + tr.h };
    }, r);
    console.log(JSON.stringify(m));
  }
}

if (errors.length) { console.log("CONSOLE ERRORS:"); errors.forEach((e) => console.log(" ", e)); }
else console.log("no console errors");
await browser.close();
process.exit(errors.length ? 1 : 0);
