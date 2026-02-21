const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

async function extractPageData(page, label) {
  const data = await page.evaluate(() => {
    const getText = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.textContent.trim() : null;
    };

    const tableHeaders = Array.from(
      document.querySelectorAll(".lecture-table thead th, table thead th")
    ).map((th) => th.textContent.replace(/\s+/g, " ").trim());

    const rowCells = Array.from(
      document.querySelectorAll(".lecture-table tbody tr:first-child td, table tbody tr:first-child td")
    ).map((td) => td.textContent.replace(/\s+/g, " ").trim());

    const statusMenuItems = Array.from(document.querySelectorAll(".isu-option")).map((a) =>
      a.textContent.trim()
    );

    return {
      title: document.title,
      topbarTitle: getText(".topbar-title"),
      pageMainTitle: getText(".title-main"),
      sidebarSchool: getText(".sidebar-school"),
      rowCount: document.querySelectorAll(".lecture-table tbody tr").length,
      hasFilterForm: !!document.querySelector("#fm_list_search"),
      hasCheckAll: !!document.querySelector("#chk-all"),
      hasExcelButton: !!document.querySelector("#btn-excel"),
      hasAttendanceButton: !!document.querySelector("#btn-attendance"),
      hasStatusDropdown: !!document.querySelector(".isu_wrap"),
      tableHeaders,
      firstRowCells: rowCells,
      statusMenuItems,
      scripts: Array.from(document.querySelectorAll("script[src]")).map((s) => s.getAttribute("src"))
    };
  });

  return { label, ...data };
}

async function testInteractions(page) {
  const results = {
    checkAllWorks: false,
    statusChangeWorks: false,
    maxSinEditWorks: false,
    maxWaitEditWorks: false,
    deleteRowWorks: false
  };

  const rowCountBefore = await page.locator(".lecture-table tbody tr").count();
  if (rowCountBefore === 0) return results;

  const firstRow = page.locator(".lecture-table tbody tr").first();

  await page.locator("#chk-all").check();
  const checkedCount = await page.locator(".chk-row:checked").count();
  results.checkAllWorks = checkedCount === rowCountBefore;

  await firstRow.locator(".isu_check_box").click();
  await firstRow.locator(".isu-option[data-status='2']").click();
  const statusLabel = await firstRow.locator(".isu_status_sm").textContent();
  results.statusChangeWorks = (statusLabel || "").includes("종료");

  await firstRow.locator(".max-sin-link").scrollIntoViewIfNeeded();
  await firstRow.locator(".max-sin-link").click();
  const sinInput = firstRow.locator(".max_sin_box .max-input");
  if (await sinInput.count()) {
    await sinInput.fill("99");
    await firstRow.locator(".btn-max-save").click();
    const sinText = await firstRow.locator(".max-sin-link").textContent();
    results.maxSinEditWorks = (sinText || "").trim() === "99";
  }

  await firstRow.locator(".max-wait-link").scrollIntoViewIfNeeded();
  await firstRow.locator(".max-wait-link").click();
  const waitInput = firstRow.locator(".max_wait_box .max-input");
  if (await waitInput.count()) {
    await waitInput.fill("7");
    await firstRow.locator(".btn-wait-save").click();
    const waitText = await firstRow.locator(".max-wait-link").textContent();
    results.maxWaitEditWorks = (waitText || "").trim() === "7";
  }

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });
  await firstRow.locator(".del-link").click();
  const rowCountAfter = await page.locator(".lecture-table tbody tr").count();
  results.deleteRowWorks = rowCountAfter === rowCountBefore - 1;

  return results;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  const targetUrl = "https://www.dbdbschool.kr/af/ad_lec/lists/sn/2848";
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  const real = await extractPageData(page, "real-site");
  await page.screenshot({ path: "playwright-real.png", fullPage: true });

  const localFile = "file:///" + path.resolve("index.html").replace(/\\/g, "/");
  await page.goto(localFile, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1000);
  const local = await extractPageData(page, "local-clone");
  const localInteraction = await testInteractions(page);
  await page.screenshot({ path: "playwright-local.png", fullPage: true });

  await browser.close();

  const report = {
    generatedAt: new Date().toISOString(),
    targetUrl,
    real,
    local,
    localInteraction
  };

  fs.writeFileSync("playwright-analysis.json", JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
