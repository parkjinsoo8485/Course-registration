const path = require("path");
const { chromium } = require("playwright");

function fileUrl(relPath) {
  return "file:///" + path.resolve(relPath).replace(/\\/g, "/");
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();

  await page.goto(fileUrl("applicants.html"), {
    waitUntil: "domcontentloaded",
  });

  await page.fill("#s_word", "zzzz-no-match-keyword");
  await page
    .locator("form[name^='fm_list_search'] input[type='submit']")
    .first()
    .click();
  await page.waitForTimeout(200);

  const rowsAfterSearch = await page.locator("table tbody tr:visible").count();
  const emptyAfterSearch = await page
    .locator(".local-empty-row:visible")
    .count();

  await page
    .locator("form[name^='fm_list_search'] input[type='button'][value='전체']")
    .first()
    .click();
  await page.waitForTimeout(200);

  const rowsAfterReset = await page.locator("table tbody tr:visible").count();
  const emptyAfterReset = await page
    .locator(".local-empty-row:visible")
    .count();

  await browser.close();
  console.log(
    JSON.stringify(
      {
        rowsAfterSearch,
        emptyAfterSearch,
        rowsAfterReset,
        emptyAfterReset,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
