// One-off probe: "stacked discounts" dropdown -> click through -> verify FAQ selectors + 40/20 calc.
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
const page = await ctx.newPage();
await ctx.addInitScript(() => {
  try {
    const k = "jp:config:v1";
    const cfg = JSON.parse(localStorage.getItem(k) || "{}");
    cfg.locale = "us";
    cfg.theme = "light";
    localStorage.setItem(k, JSON.stringify(cfg));
  } catch {}
  const hide = () => {
    const w = document.querySelector("#cookie-widget-app");
    if (w) w.style.display = "none";
  };
  document.addEventListener("DOMContentLoaded", hide);
  setInterval(hide, 500);
});

await page.goto("https://justpercent.com/", { waitUntil: "load", timeout: 60000 });
await page.waitForSelector("#calculator-search", { state: "visible", timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2000);

const input = page.locator("#calculator-search");
await input.click();
await input.pressSequentially("stacked discounts", { delay: 30 });
await page.waitForTimeout(2500);

const items = await page.locator('[id^="search-item-"]').all();
console.log(`dropdown items: ${items.length}`);
for (const [i, item] of items.entries()) {
  const text = (await item.innerText().catch(() => "")).replace(/\n+/g, " | ").slice(0, 160);
  console.log(`  ${i}: ${text}`);
}
await page.screenshot({ path: OUT + "probe-stacked-dropdown.png" });

if (items.length) {
  await items[0].click();
  await page.waitForLoadState("load");
  await page.waitForTimeout(3000);
  console.log("URL after click:", page.url());

  // verify selectors used by record.mjs still exist
  for (const sel of [
    "#successive-discounts-example",
    "#stacked-discounts-example",
    "#discount-one",
    "#discount-two",
    "#result-final-price",
    "#result-effective"
  ]) {
    const n = await page.locator(sel).count();
    console.log(`${sel}: ${n ? "OK" : "MISSING"}`);
  }

  // 40 / 20 calc QC
  const d1 = page.locator("#discount-one").first();
  await d1.click({ clickCount: 3 });
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("40");
  const d2 = page.locator("#discount-two").first();
  await d2.click({ clickCount: 3 });
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("20");
  await page.keyboard.press("Tab");
  await page.waitForTimeout(1500);
  const finalPrice = await page.locator("#result-final-price").first().inputValue().catch(() => "?");
  const effective = await page.locator("#result-effective").first().inputValue().catch(() => "?");
  console.log("final:", finalPrice, "| effective:", effective);
  const exampleId = await page.evaluate(() => document.querySelector('[id$="-example"]')?.id || "NONE");
  console.log("example container id:", exampleId);
  const commaHits = await page.evaluate(() => (document.body.innerText.match(/\d,\d+/g) || []).slice(0, 20));
  console.log("comma-number hits:", JSON.stringify(commaHits));
  await page.locator('[id$="-example"]').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + "probe-stacked-page.png" });
}
await browser.close();
