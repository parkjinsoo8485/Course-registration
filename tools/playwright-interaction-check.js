const path = require("path");
const { chromium } = require("playwright");

function fileUrl(relPath) {
  return "file:///" + path.resolve(relPath).replace(/\\/g, "/");
}

async function testToggle(page) {
  await page.goto(fileUrl("teacher.html"), { waitUntil: "domcontentloaded" });
  const drop = page.locator("#main_control_box_drop");
  const btn = page.locator("#main_control_box_btn02");
  const before = await drop.isVisible().catch(() => false);
  await btn.click();
  const afterOpen = await drop.isVisible().catch(() => false);
  await btn.click();
  const afterClose = await drop.isVisible().catch(() => false);
  return { before, afterOpen, afterClose };
}

async function testDateQuick(page) {
  await page.goto(fileUrl("school-sms-report.html"), {
    waitUntil: "domcontentloaded",
  });
  const s0 = await page.locator("#sdate").inputValue();
  const e0 = await page.locator("#edate").inputValue();
  await page.getByRole("button", { name: "최근1달" }).click();
  await page.waitForTimeout(120);
  const s1 = await page.locator("#sdate").inputValue();
  const e1 = await page.locator("#edate").inputValue();
  return { s0, e0, s1, e1, changed: s0 !== s1 || e0 !== e1 };
}

async function testRefundWrite(page) {
  await page.goto(fileUrl("refund.html"), { waitUntil: "domcontentloaded" });
  const before = await page.locator("input[name='data_checked[]']").count();

  page.once("dialog", async (d) => {
    if (d.type() === "prompt") await d.accept("테스트 사유");
    else await d.accept();
  });

  await page.getByRole("button", { name: "환불/취소자등록" }).click();
  await page.waitForTimeout(200);
  const after = await page.locator("input[name='data_checked[]']").count();
  const hasLocal =
    (await page
      .locator("input[name='data_checked[]'][value^='local_']")
      .count()) > 0;
  return { before, after, added: after > before || hasLocal };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();

  const report = {
    generatedAt: new Date().toISOString(),
    toggle: await testToggle(page),
    dateQuick: await testDateQuick(page),
    refundWrite: await testRefundWrite(page),
  };

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
