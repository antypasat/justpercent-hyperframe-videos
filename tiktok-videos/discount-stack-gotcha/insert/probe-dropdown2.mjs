// Post-deploy dropdown check for "stacked discounts".
import { createRequire } from "module";
const require = createRequire("/Users/michael/startups/percentage-calculator/handy-percent/package.json");
const { chromium } = require("@playwright/test");

const OUT = new URL("./", import.meta.url).pathname;
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 405, height: 720 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: "en-US",
  timezoneId: "America/New_York"
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
await ctx.addInitScript(() => {
  try {
    const k = "jp:config:v1";
    const cfg = JSON.parse(localStorage.getItem(k) || "{}");
    cfg.locale = "us";
    cfg.theme = "light";
    localStorage.setItem(k, JSON.stringify(cfg));
  } catch {}
});
const page = await ctx.newPage();
await page.goto("https://justpercent.com/", { waitUntil: "load", timeout: 60000 });
await page.waitForSelector("#calculator-search", { state: "visible", timeout: 30000 });
await page.waitForTimeout(3000);

const input = page.locator("#calculator-search");
await input.click();
await input.pressSequentially("stacked discounts", { delay: 40 });
await page.waitForTimeout(4000);

const items = await page.locator('[id^="search-item-"]').all();
console.log(`[id^=search-item-] items: ${items.length}`);
for (const [i, item] of items.entries()) {
  console.log(`  ${i}: ${(await item.innerText().catch(() => "")).replace(/\n+/g, " | ").slice(0, 160)}`);
}
// fallback: dump whatever dropdown-ish container is visible
const dump = await page.evaluate(() => {
  const els = [...document.querySelectorAll('[id*="search"], [class*="search-result"], [class*="dropdown"], [role="listbox"], [role="option"]')];
  return els
    .filter((e) => e.offsetParent !== null)
    .map((e) => `${e.tagName}#${e.id}.${(e.className?.toString?.() || "").slice(0, 60)} :: ${e.textContent.trim().slice(0, 100)}`)
    .slice(0, 25);
});
console.log(dump.join("\n"));
await page.screenshot({ path: OUT + "probe-dropdown2.png" });
await browser.close();
