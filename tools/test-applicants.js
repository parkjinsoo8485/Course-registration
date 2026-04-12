const path = require("path");
const { chromium } = require("playwright");
(async () => {
  console.log("start");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  await page.goto(
    "file:///" + path.resolve("applicants.html").replace(/\\/g, "/"),
    { waitUntil: "domcontentloaded" },
  );
  console.log("title", await page.title());
  await browser.close();
  console.log("done");
})();
