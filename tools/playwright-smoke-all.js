const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

function fileUrl(relPath) {
  return "file:///" + path.resolve(relPath).replace(/\\/g, "/");
}

async function withDialogCapture(page, fn) {
  let message = null;
  const handler = async (dialog) => {
    message = dialog.message();
    await dialog.accept();
  };
  page.on("dialog", handler);
  try {
    await fn();
    await page.waitForTimeout(150);
  } finally {
    page.off("dialog", handler);
  }
  return message;
}

async function submitAttendanceAndCapture(page) {
  const downloadPromise = page
    .waitForEvent("download", { timeout: 8000 })
    .then((download) => download)
    .catch(() => null);
  const dialogPromise = page
    .waitForEvent("dialog", { timeout: 8000 })
    .then(async (dialog) => {
      const message = dialog.message();
      await dialog.accept();
      return message;
    })
    .catch(() => null);

  await page.locator("#fm_attendance button[type='submit']").click();
  const [download, dialogMessage] = await Promise.all([downloadPromise, dialogPromise]);
  return { download, dialogMessage };
}

async function testIndex(page) {
  const out = {};
  await page.goto(fileUrl("index.html"), { waitUntil: "domcontentloaded" });
  const checkAll = (await page.locator("#check_all").count()) ? page.locator("#check_all") : page.locator("#chk-all");
  await checkAll.check();
  const total = await page.locator(".chk-row").count();
  const checked = await page.locator(".chk-row:checked").count();
  out.checkAll = total > 0 && total === checked;

  await page.locator(".lecture-table tbody tr").first().locator(".max-wait-link").click();
  await page.locator(".lecture-table tbody tr").first().locator(".max_wait_box .max-input").fill("8");
  await page.locator(".lecture-table tbody tr").first().locator(".btn-wait-save").click();
  out.maxWait = ((await page.locator(".lecture-table tbody tr").first().locator(".max-wait-link").textContent()) || "").trim() === "8";

  const excelDl = page.waitForEvent("download");
  await page.locator("#btn-excel").click();
  const dl1 = await excelDl;
  out.excelDownload = !!dl1.suggestedFilename();

  await page.locator("#btn-attendance").click();
  await page.waitForLoadState("domcontentloaded");
  out.attendancePage = (await page.title()).includes("출석부");
  out.attendanceDivWithRows = "";
  const divValues = await page.$$eval("#att_div option", (opts) =>
    opts.map((o) => String(o.value || "").trim()).filter(Boolean)
  );
  for (const divValue of divValues) {
    await page.selectOption("#att_div", divValue);
    await page.waitForTimeout(180);
    const rowCount = await page.locator(".att-lec").count();
    if (rowCount > 0) {
      out.attendanceDivWithRows = divValue;
      break;
    }
  }

  const firstSubmit = await submitAttendanceAndCapture(page);
  out.attendanceConfirmShown = !!firstSubmit.dialogMessage;
  out.attendanceConfirmMessage = firstSubmit.dialogMessage || "";
  out.attendanceDownload = !!firstSubmit.download;

  if (firstSubmit.download) {
    const attPath = path.resolve("playwright-attendance-check.csv");
    await firstSubmit.download.saveAs(attPath);
    const attCsv = fs.readFileSync(attPath, "utf8").replace(/^\uFEFF/, "");
    const firstLine = (attCsv.split(/\r?\n/)[0] || "").trim();
    out.attendanceHeaderOk = firstLine.split(",").length >= 5;
    out.attendanceRowCount = attCsv.split(/\r?\n/).filter((x) => x.trim()).length;
  } else {
    out.attendanceHeaderOk = false;
    out.attendanceRowCount = 0;
  }

  await page.evaluate(() => {
    document.querySelectorAll(".att-lec").forEach((el) => {
      el.checked = false;
    });
  });

  const noSelectSubmit = await submitAttendanceAndCapture(page);
  out.attendanceNoSelectAlert = noSelectSubmit.dialogMessage || "";
  out.attendanceNoSelectDownload = !!noSelectSubmit.download;

  return out;
}

async function testBulkInput(page, sampleFile) {
  const out = {};
  await page.goto(fileUrl("lec_bulk_input.html"), { waitUntil: "domcontentloaded" });

  const tplDl = page.waitForEvent("download");
  await page.locator("#btn-template-download").click();
  out.templateDownload = !!(await tplDl).suggestedFilename();

  out.noFileAlert = await withDialogCapture(page, async () => {
    await page.locator("#btn-bulk-input-submit").click();
  });

  await page.setInputFiles("#bulk-input-file", sampleFile);
  out.withFileAlert = await withDialogCapture(page, async () => {
    await page.locator("#btn-bulk-input-submit").click();
  });

  return out;
}

async function testBulkModify(page, sampleFile) {
  const out = {};
  await page.goto(fileUrl("lec_bulk_modify.html"), { waitUntil: "domcontentloaded" });

  const tplDl = page.waitForEvent("download");
  await page.locator("#btn-modify-template-download").click();
  out.templateDownload = !!(await tplDl).suggestedFilename();

  out.noFileAlert = await withDialogCapture(page, async () => {
    await page.locator("#btn-bulk-modify-submit").click();
  });

  const firstId = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem("dbdb_lectures_v2");
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) && list.length ? list[0].id : "";
    } catch {
      return "";
    }
  });

  if (firstId) {
    fs.writeFileSync(sampleFile, "강좌번호,강좌명\n" + String(firstId) + ",수정테스트강좌\n", "utf8");
  }

  await page.setInputFiles("#bulk-modify-file", sampleFile);
  out.withFileAlert = await withDialogCapture(page, async () => {
    await page.locator("#btn-bulk-modify-submit").click();
  });

  return out;
}

async function testCopy(page) {
  const out = {};
  await page.goto(fileUrl("lec_copy.html"), { waitUntil: "domcontentloaded" });
  const fromVal = await page.locator("#copy-from-div").inputValue();
  if (!fromVal) {
    await page.selectOption("#copy-from-div", { index: 1 });
  }
  const fromNow = await page.locator("#copy-from-div").inputValue();
  const options = await page.$$eval("#copy-to-div option", (els) => els.map((e) => e.value).filter(Boolean));
  const toVal = options.find((v) => v !== fromNow);
  if (toVal) {
    await page.selectOption("#copy-to-div", toVal);
  }
  out.alert = await withDialogCapture(page, async () => {
    await page.locator("#btn-copy-submit").click();
  });
  return out;
}

async function testStats(page) {
  const out = {};
  await page.goto(fileUrl("lec_stats.html"), { waitUntil: "domcontentloaded" });
  const statsDl = page.waitForEvent("download");
  await page.locator("#btn-stats-download").click();
  out.download = !!(await statsDl).suggestedFilename();
  return out;
}

async function testWrite(page) {
  const out = {};
  await page.goto(fileUrl("lec_write.html"), { waitUntil: "domcontentloaded" });
  await page.fill("#lec_name", "자동테스트 강좌");
  await page.selectOption("#lec_div", "1");
  await page.selectOption("#lec_pro_type", "3");
  await page.fill("#tea_id", "teacher01");
  await page.evaluate(() => {
    const display = document.getElementById("lec_time_");
    const hidden = document.getElementById("lec_time");
    if (display) display.value = "월 3-4교시";
    if (hidden) hidden.value = "MON_3_4";
  });

  out.alert = await withDialogCapture(page, async () => {
    await page.locator("#fm_edit button[type='submit']").first().click();
  });
  return out;
}

async function testManual(page) {
  const out = {};
  await page.goto(fileUrl("manual.html"), { waitUntil: "domcontentloaded" });
  const btn = page.locator(".manual_btn").first();
  if (await btn.count()) {
    const href = (await btn.getAttribute("href")) || "";
    out.linkHref = href;
    out.linkHasHttp = /^https?:\/\//.test(href);

    const popupPromise = page.waitForEvent("popup", { timeout: 5000 }).catch(() => null);
    await btn.click();
    const popup = await popupPromise;
    out.popupOpened = !!popup;
    if (popup) await popup.close();
  } else {
    out.linkHasHttp = false;
    out.popupOpened = false;
  }
  return out;
}

async function testApplicants(page) {
  const out = {};
  await page.goto(fileUrl("applicants.html"), { waitUntil: "domcontentloaded" });
  out.titleOk = (await page.title()).includes("신청");

  const tableRows = page.locator("#fm_list table tbody tr").filter({ has: page.locator("td") });
  out.rowCountBefore = await tableRows.count();

  const searchDlPromise = page.waitForEvent("download");
  await page.evaluate(() => window.chk_excel());
  const searchDl = await searchDlPromise;
  out.searchResultDownload = !!searchDl.suggestedFilename();

  const allResultBtn = page.locator(".applicants-actions-row a.btn.btn-success.btn-sm", {
    hasText: "신청결과엑셀출력"
  }).first();
  await allResultBtn.waitFor({ state: "visible", timeout: 10000 });
  const allDlPromise = page.waitForEvent("download");
  await allResultBtn.click();
  const allDl = await allDlPromise;
  out.allResultDownload = !!allDl.suggestedFilename();

  if (out.rowCountBefore > 0) {
    await page.locator("#fm_list input[name='data_checked[]']").first().check();
    await page.selectOption("#fm_list select[name='update_type']", "del");
    const confirmPromise = page.waitForEvent("dialog");
    await page.evaluate(() => {
      const form = document.getElementById("fm_list");
      if (!form) return;
      if (typeof form.requestSubmit === "function") form.requestSubmit();
      else form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    const confirmDialog = await confirmPromise;
    out.bulkDeleteConfirmText = confirmDialog.message();
    await confirmDialog.accept();
    out.rowCountAfterDelete = await tableRows.count();
    out.bulkDeleteApplied = out.rowCountAfterDelete === out.rowCountBefore - 1;
  } else {
    out.bulkDeleteApplied = false;
  }

  return out;
}

async function main() {
  const sampleFile = path.resolve("tools", "sample-upload.csv");
  fs.mkdirSync(path.dirname(sampleFile), { recursive: true });
  fs.writeFileSync(sampleFile, "name,value\nexample,1\n", "utf8");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  const report = {
    generatedAt: new Date().toISOString(),
    index: await testIndex(page),
    bulkInput: await testBulkInput(page, sampleFile),
    bulkModify: await testBulkModify(page, sampleFile),
    copy: await testCopy(page),
    stats: await testStats(page),
    write: await testWrite(page),
    manual: await testManual(page),
    applicants: await testApplicants(page)
  };

  await browser.close();
  fs.writeFileSync("playwright-smoke-report.json", JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
