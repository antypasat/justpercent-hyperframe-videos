// Records the real-app insert for the TikTok short (segment 17-27s).
// Flow: justpercent.com home -> search "double discount" -> click Successive Discounts FAQ
// -> type 40 / 20 -> live answer $96 / 52% -> slow scroll through explanation.
// Raw recording is intentionally long; it gets trimmed in the edit.
import { createRequire } from "module";
const require = createRequire("/Users/michael/startups/percentage-calculator/handy-percent/package.json");
const { chromium } = require("@playwright/test");
import { rename, readdir } from "fs/promises";

const OUT_DIR = new URL("./recording/", import.meta.url).pathname;
const PHRASE = "double discount";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 405, height: 720 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: "en-US",
  timezoneId: "America/New_York",
  recordVideo: { dir: OUT_DIR, size: { width: 405, height: 720 } }
});
// Pre-seed cookie consent so the banner never appears on camera
await ctx.addCookies([
  {
    name: "cookieyes-consent",
    value:
      "consentid:MGxVTmZMQUlaZkpCcWFVazZ3ZldVWHJucFl4a0h4ZGg,consent:yes,action:yes,necessary:yes,functional:yes,analytics:yes,performance:yes,advertisement:yes",
    domain: "justpercent.com",
    path: "/",
    secure: true,
    sameSite: "Strict"
  }
]);
const page = await ctx.newPage();
// Keep the floating cookie widget out of frame on every page
await ctx.addInitScript(() => {
  const hide = () => {
    const w = document.querySelector("#cookie-widget-app");
    if (w) w.style.display = "none";
  };
  document.addEventListener("DOMContentLoaded", hide);
  setInterval(hide, 500);
});

const human = (ms) => ms + Math.floor(Math.random() * 120);

// --- 1. Homepage, full stabilization + 5s buffer -------------------------
await page.goto("https://justpercent.com/", { waitUntil: "load", timeout: 60000 });
await page.waitForSelector("#calculator-search", { state: "visible", timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(5500);

// --- 2. Type the phrase like a human --------------------------------------
const input = page.locator("#calculator-search");
await input.click();
await page.waitForTimeout(700);
for (const ch of PHRASE) {
  await page.keyboard.type(ch);
  await page.waitForTimeout(human(85));
}
await page.waitForTimeout(2600); // let FAQ semantic results settle

// --- 3. Find + click the Successive Discounts FAQ row ---------------------
const target = page.locator('[id^="search-item-"]', { hasText: "Successive Discounts" }).first();
await target.waitFor({ state: "visible", timeout: 10000 }).catch(async () => {
  await target.scrollIntoViewIfNeeded();
});
await target.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200); // small read pause
await page.screenshot({ path: OUT_DIR + "shot-dropdown.png" }); // crisp 2x still
await target.click();
await page.waitForURL("**/faqs/successive-discounts-calculator/**", { timeout: 15000 });

// --- 4. FAQ page stabilization + 5s buffer ---------------------------------
await page.waitForSelector("#successive-discounts-example", { state: "visible", timeout: 20000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(5000);

// Bring the question card (inputs) into view
const faqCard = page.locator("#successive-discounts-example");
await faqCard.scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);

// --- 5. Type the story's numbers: 40 then 20 -------------------------------
const d1 = page.locator("#discount-one").first();
await d1.click({ clickCount: 3 });
await page.waitForTimeout(500);
for (const ch of "40") {
  await page.keyboard.type(ch);
  await page.waitForTimeout(human(140));
}
await page.waitForTimeout(900);

const d2 = page.locator("#discount-two").first();
await d2.click({ clickCount: 3 });
await page.waitForTimeout(500);
for (const ch of "20") {
  await page.keyboard.type(ch);
  await page.waitForTimeout(human(140));
}
await page.keyboard.press("Tab");
await page.waitForTimeout(1500);
await page.screenshot({ path: OUT_DIR + "shot-typed.png" }); // crisp 2x still

// --- 6. Slow scroll through explanation to the live answer -----------------
await page.evaluate(async () => {
  const step = 3;
  const total = 700; // px of gentle scroll through details -> answer
  for (let y = 0; y < total; y += step) {
    window.scrollBy(0, step);
    await new Promise((r) => setTimeout(r, 16));
  }
});
await page.waitForTimeout(1000);
// Log final values for QC
const finalPrice = await page.locator("#result-final-price").first().inputValue();
const effective = await page.locator("#result-effective").first().inputValue();
console.log("final price:", finalPrice, "| effective discount:", effective);

await page.waitForTimeout(4000);
// scroll back up a touch so the answer sits centered
await page.evaluate(async () => {
  for (let y = 0; y < 200; y += 3) {
    window.scrollBy(0, -3);
    await new Promise((r) => setTimeout(r, 16));
  }
});
await page.screenshot({ path: OUT_DIR + "shot-answer.png" }); // crisp 2x still
await page.waitForTimeout(5000); // tail buffer

await ctx.close(); // flushes the video
await browser.close();

// Rename the produced webm to a stable name
const files = await readdir(OUT_DIR);
const webm = files.find((f) => f.endsWith(".webm"));
if (webm) {
  await rename(OUT_DIR + webm, OUT_DIR + "insert-raw.webm");
  console.log("saved:", OUT_DIR + "insert-raw.webm");
}
