// Find the English (US) / International selector and how the choice persists.
import { createRequire } from "module";
const require = createRequire("/Users/michael/startups/percentage-calculator/handy-percent/package.json");
const { chromium } = require("@playwright/test");

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
await page.goto("https://justpercent.com/", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(3000);

// find elements containing the selector texts
const info = await page.evaluate(() => {
  const hits = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  while (walk.nextNode()) {
    const el = walk.currentNode;
    const t = (el.childElementCount === 0 ? el.textContent : "").trim();
    if (/^(English \(US\)|International)$/.test(t)) {
      hits.push({
        tag: el.tagName,
        id: el.id,
        cls: el.className?.toString?.().slice(0, 120),
        text: t,
        parentTag: el.parentElement?.tagName,
        parentId: el.parentElement?.id,
        parentCls: el.parentElement?.className?.toString?.().slice(0, 120)
      });
    }
  }
  // also selects/options
  const selects = [...document.querySelectorAll("select")].map((s) => ({
    id: s.id,
    name: s.name,
    cls: s.className?.toString?.().slice(0, 120),
    value: s.value,
    options: [...s.options].map((o) => ({ v: o.value, t: o.textContent.trim() }))
  }));
  return { hits, selects, ls: { ...localStorage } };
});
console.log(JSON.stringify(info, null, 1));
console.log("cookies:", (await ctx.cookies()).map((c) => c.name + "=" + c.value.slice(0, 60)).join("\n"));
await browser.close();
