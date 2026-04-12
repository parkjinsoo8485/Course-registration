const path = require("path");
const { chromium } = require("playwright");

function fileUrl(name) {
  return "file:///" + path.resolve(name).replace(/\\/g, "/");
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  await page.addInitScript(() => {
    window.__downloadMeta = [];
    const originalClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function patchedClick() {
      if (this && this.download) {
        window.__downloadMeta.push({
          filename: this.download,
          href: this.getAttribute("href") || "",
        });
      }
      return originalClick.apply(this, arguments);
    };
  });

  const out = {};
  await page.goto(fileUrl("waitlist.html"), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);

  out.titleOk = (await page.title()).includes("대기자");
  out.monthLabel = (
    (await page.locator("select[name='sld'] option").first().textContent()) ||
    ""
  ).trim();
  out.courseLabel = (
    (await page.locator("select[name='slp'] option").first().textContent()) ||
    ""
  ).trim();
  out.applyButtonText = (
    (await page.locator("button[onclick*='chk_app(']").first().textContent()) ||
    ""
  ).trim();

  const excelLink = page
    .getByRole("link", { name: /대기자엑셀출력|엑셀출력/ })
    .first();
  await excelLink.click();
  await page.waitForTimeout(300);
  const metas = await page.evaluate(() => window.__downloadMeta || []);
  out.downloadFile = metas.length ? metas[metas.length - 1].filename : "";
  out.downloadCaptured = !!out.downloadFile;

  await browser.close();
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
