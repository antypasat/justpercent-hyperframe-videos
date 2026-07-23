// Probe: verify search phrase surfaces the successive-discounts FAQ and clicking navigates to it.
// Run with: node insert/probe.mjs (from discount-stack-gotcha/) — uses handy-percent's playwright install.
import { createRequire } from "module";
const require = createRequire("/Users/michael/startups/percentage-calculator/handy-percent/package.json");
const { chromium } = require("@playwright/test");

const PHRASE = process.argv[2] || "40% off then extra 20% off at checkout";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 405, height: 720 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: "en-US",
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
});
const page = await ctx.newPage();
await page.goto("https://justpercent.com/", { waitUntil: "load", timeout: 60000 });
await page.waitForSelector("#calculator-search", { state: "visible", timeout: 30000 });
// Dismiss CookieYes banner (repo test pattern) and hide the cookie widget
try {
  await page.getByRole("button", { name: "Accept" }).click({ timeout: 5000 });
} catch {}
await page
  .evaluate(() => {
    const w = document.querySelector("#cookie-widget-app");
    if (w) w.style.display = "none";
  })
  .catch(() => {});
await page.waitForTimeout(3000);

const input = page.locator("#calculator-search");
await input.click();
await input.pressSequentially(PHRASE, { delay: 40 });
await page.waitForTimeout(2500); // let semantic search settle

const portal = page.locator("#search-results-list-portal");
const visible = await portal.isVisible().catch(() => false);
console.log("dropdown visible:", visible);

const items = await page.locator('[id^="search-item-"]').all();
console.log("result count:", items.length);
for (const [i, item] of items.entries()) {
  const text = (await item.innerText().catch(() => "")).replace(/\n+/g, " | ").slice(0, 140);
  console.log(`item ${i}: ${text}`);
}

// find the successive-discounts FAQ item and click it
const target = page
  .locator('[id^="search-item-"]', { hasText: "stacked discounts" })
  .first();
if (await target.count()) {
  await target.click();
  await page.waitForURL("**/faqs/successive-discounts-calculator/**", { timeout: 10000 });
  console.log("navigated to:", page.url());
  await page.waitForTimeout(2000);
  // inspect FAQ inputs
  for (const id of ["#item-price", "#discount-one", "#discount-two"]) {
    const el = page.locator(id).first();
    console.log(id, "visible:", await el.isVisible().catch(() => false), "value:", await el.inputValue().catch(() => "?"));
  }
  await page.screenshot({ path: new URL("./probe-faq.png", import.meta.url).pathname });
} else {
  console.log("NO stacked-discounts item found for phrase:", PHRASE);
  await page.screenshot({ path: new URL("./probe-dropdown.png", import.meta.url).pathname });
}
const cookies = await ctx.cookies("https://justpercent.com");
console.log(
  "consent cookies:",
  JSON.stringify(cookies.filter((c) => /cookieyes|cky/i.test(c.name)))
);
await browser.close();
