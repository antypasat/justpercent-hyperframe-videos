// Batch-test candidate search phrases against justpercent.com dropdown results.
import { createRequire } from "module";
const require = createRequire("/Users/michael/startups/percentage-calculator/handy-percent/package.json");
const { chromium } = require("@playwright/test");

const PHRASES = [
  "double discount",
  "stacked discounts",
  "extra 20% off at checkout",
  "40% off plus an extra 20% off",
  "discount on top of discount",
  "combine two discounts final price"
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 405, height: 720 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: "en-US"
});
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
await page.goto("https://justpercent.com/", { waitUntil: "load", timeout: 60000 });
await page.waitForSelector("#calculator-search", { state: "visible", timeout: 30000 });
await page.evaluate(() => {
  const w = document.querySelector("#cookie-widget-app");
  if (w) w.style.display = "none";
});
await page.waitForTimeout(3000);

const input = page.locator("#calculator-search");
for (const phrase of PHRASES) {
  await input.click();
  await input.fill("");
  await input.pressSequentially(phrase, { delay: 25 });
  await page.waitForTimeout(2500);
  const items = await page.locator('[id^="search-item-"]').all();
  console.log(`\n=== "${phrase}" -> ${items.length} items`);
  for (const [i, item] of items.entries()) {
    const text = (await item.innerText().catch(() => "")).replace(/\n+/g, " | ").slice(0, 120);
    console.log(`  ${i}: ${text}`);
  }
}
await browser.close();
