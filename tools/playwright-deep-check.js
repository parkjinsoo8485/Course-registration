const path = require("path");
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
    await page.waitForTimeout(120);
  } finally {
    page.off("dialog", handler);
  }
  return message;
}

async function checkApplicants(page) {
  const out = { page: "applicants" };
  await page.goto(fileUrl("applicants.html"), {
    waitUntil: "domcontentloaded",
  });

  const checkAll = page.locator("#check_all");
  if (await checkAll.count()) {
    await checkAll.check();
    out.checkAllChecked =
      (await page.locator("input[name='data_checked[]']:checked").count()) > 0;
  } else {
    out.checkAllChecked = false;
  }

  const excelButton = page
    .locator("a.btn.btn-success.btn-sm")
    .filter({ hasText: "검색결과출력" })
    .first();
  if (await excelButton.count()) {
    const dl = page.waitForEvent("download");
    await excelButton.click();
    out.excelDownloaded = !!(await dl).suggestedFilename();
  } else {
    out.excelDownloaded = false;
  }

  const deleteLink = page.locator("a[onclick*='chk_cancel(']").first();
  out.deleteAlert = null;
  if (await deleteLink.count()) {
    out.deleteAlert = await withDialogCapture(page, async () => {
      await deleteLink.click();
    });
  }

  return out;
}

async function checkCfgDivision(page) {
  const out = { page: "cfg-division" };
  await page.goto(fileUrl("cfg-division.html"), {
    waitUntil: "domcontentloaded",
  });

  const applyBtn = page.locator("a[onclick*='chkModify(']").first();
  out.modifyAlert = null;
  if (await applyBtn.count()) {
    out.modifyAlert = await withDialogCapture(page, async () => {
      await applyBtn.click();
    });
  }

  const delBtn = page.locator("a[onclick*='chkDel(']").first();
  out.deleteAlert = null;
  if (await delBtn.count()) {
    out.deleteAlert = await withDialogCapture(page, async () => {
      await delBtn.click();
    });
  }
  return out;
}

async function checkSchoolStudentMain(page) {
  const out = { page: "school-student-main" };
  await page.goto(fileUrl("school-student-main.html"), {
    waitUntil: "domcontentloaded",
  });

  const maxClass = page.locator("#maxClass");
  const useClassName = page.locator("#useClassName");
  if ((await maxClass.count()) && (await useClassName.count())) {
    await maxClass.fill("4");
    await useClassName.check();
    await useClassName.click();
    await useClassName.check();
    out.classNameRows = await page.locator("#class_name_box input").count();
  } else {
    out.classNameRows = 0;
  }
  return out;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  const report = {
    generatedAt: new Date().toISOString(),
    applicants: await checkApplicants(page),
    cfgDivision: await checkCfgDivision(page),
    schoolStudentMain: await checkSchoolStudentMain(page),
  };

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
