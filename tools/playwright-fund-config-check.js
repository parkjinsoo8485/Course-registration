const path = require("path");
const { chromium } = require("playwright");

function fileUrl(relPath) {
  return "file:///" + path.resolve(relPath).replace(/\\/g, "/");
}

async function openFromSidebar(page) {
  await page.goto(fileUrl("index.html"), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);

  const link = page.locator("#left_menu a[href='./fund-config.html']").first();
  const found = (await link.count()) > 0;
  if (!found) return { found: false, navigated: false, title: "" };

  await link.click();
  await page.waitForTimeout(300);
  return {
    found: true,
    navigated: /fund-config\.html$/i.test(page.url()),
    title: await page.title()
  };
}

async function testCheckAll(page) {
  const master = page.locator("#check_all_month1");
  const items = page.locator("input[name='free2_data1_month[]']");
  if (!(await master.count())) return { available: false, allUnchecked: false, allChecked: false };

  await master.check();
  const checkedCount = await items.evaluateAll((els) => els.filter((el) => el.checked).length);
  const total = await items.count();

  await master.uncheck();
  const uncheckedCount = await items.evaluateAll((els) => els.filter((el) => !el.checked).length);

  return {
    available: true,
    allUnchecked: total > 0 && uncheckedCount === total,
    allChecked: total > 0 && checkedCount === total,
    total
  };
}

async function testMoneyFormat(page) {
  const input = page.locator("#free2_data2_max_amount");
  if (!(await input.count())) return { available: false, value: "" };

  await input.fill("12ab3,4!5");
  await input.blur();
  const value = await input.inputValue();
  return { available: true, value, numericOnly: /^\d+$/.test(value) };
}

async function testApplySubmit(page) {
  const form = page.locator("form#fm_edit2");
  const submit = form.locator("input[type='submit'][value='적용']").first();
  if (!(await submit.count())) return { available: false, stayedOnPage: false };

  await submit.click();
  await page.waitForTimeout(300);
  return {
    available: true,
    stayedOnPage: /fund-config\.html$/i.test(page.url())
  };
}

async function testSortPopup(page) {
  const btn = page.getByRole("link", { name: "지원금 차감 순서 변경" }).first();
  if (!(await btn.count())) return { available: false, popupOpened: false, popupUrl: "" };

  const popupPromise = page.waitForEvent("popup", { timeout: 2000 }).catch(() => null);
  await btn.click();
  const popup = await popupPromise;
  if (!popup) return { available: true, popupOpened: false, popupUrl: "" };

  await popup.waitForTimeout(200);
  const popupUrl = popup.url();
  await popup.close().catch(() => {});
  return {
    available: true,
    popupOpened: true,
    popupUrl
  };
}

async function testSortPersistence(page) {
  const formCount = await page.locator("form[id^='fm_edit']").count();
  const titleCount = await page.locator("form[id^='fm_edit'] input[id$='_title']").count();
  const firstTitle = page.locator("form[id^='fm_edit']").first().locator("input[id$='_title']").first();
  if (!(await firstTitle.count())) return { available: false, changed: false, persisted: false, formCount, titleCount, url: page.url() };

  const before = (await firstTitle.inputValue()).trim();
  const btn = page.getByRole("link", { name: "지원금 차감 순서 변경" }).first();
  if (!(await btn.count())) return { available: false, changed: false, persisted: false };

  const popupPromise = page.waitForEvent("popup", { timeout: 2000 }).catch(() => null);
  await btn.click();
  const popup = await popupPromise;
  if (!popup) return { available: true, changed: false, persisted: false };

  await popup.waitForLoadState("domcontentloaded");
  const firstDown = popup.locator("#sort_table tbody tr").first().locator("button.down");
  if (await firstDown.count()) await firstDown.click();

  popup.once("dialog", async (d) => {
    await d.accept();
  });
  await popup.locator("#btn_apply").click();
  await popup.waitForEvent("close", { timeout: 2000 }).catch(() => {});

  await page.waitForTimeout(300);
  const after = (await page.locator("form[id^='fm_edit']").first().locator("input[id$='_title']").first().inputValue()).trim();
  const changed = before !== after;

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  const afterReload = (await page.locator("form[id^='fm_edit']").first().locator("input[id$='_title']").first().inputValue()).trim();

  return {
    available: true,
    formCount,
    titleCount,
    before,
    after,
    afterReload,
    changed,
    persisted: after === afterReload
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  const report = {
    generatedAt: new Date().toISOString(),
    sidebar: await openFromSidebar(page),
    checkAll: await testCheckAll(page),
    moneyFormat: await testMoneyFormat(page),
    applySubmit: await testApplySubmit(page),
    sortPopup: await testSortPopup(page),
    sortPersistence: await testSortPersistence(page)
  };

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
