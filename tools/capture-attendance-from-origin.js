const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

async function main() {
  const storagePath = path.resolve("dbdb-storage-state.json");
  if (!fs.existsSync(storagePath)) {
    throw new Error("dbdb-storage-state.json not found");
  }

  const outDir = path.resolve("captures", "attendance");
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: false });
  const context = await browser.newContext({
    storageState: storagePath,
    locale: "ko-KR",
    viewport: { width: 1365, height: 900 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  const result = {
    mode: "unknown",
    lectureUrl: "",
    finalUrl: "",
    title: "",
    downloaded: null,
  };

  await page.goto("https://www.dbdbschool.kr/af/ad_lec/lists/sn/2848", {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.waitForTimeout(1800);
  const firstTitle = await page.title();
  if (firstTitle.indexOf("403") > -1 || /member\/login/.test(page.url())) {
    console.log(
      "[INFO] 403/로그인 상태 감지. 브라우저에서 직접 로그인해 주세요. (최대 5분 대기)",
    );
    await page.goto("https://www.dbdbschool.kr/member/login", {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });
    await page.waitForURL(/\/af\/ad_lec\/lists\/sn\/2848/i, {
      timeout: 300000,
    });
    await context.storageState({ path: storagePath });
    await page.waitForTimeout(1500);
  }
  result.lectureUrl = page.url();

  const btn = page.locator("input[type='button'][value*='출석부']");
  if (!(await btn.count())) {
    result.mode = "button_not_found";
    result.finalUrl = page.url();
    result.title = await page.title();
    const html = await page.content();
    fs.writeFileSync(path.join(outDir, "attendance-result.html"), html, "utf8");
    await page.screenshot({
      path: path.join(outDir, "attendance-result.png"),
      fullPage: true,
    });
    fs.writeFileSync(
      path.join(outDir, "summary.json"),
      JSON.stringify(result, null, 2),
      "utf8",
    );
    await browser.close();
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const navPromise = page
    .waitForNavigation({ waitUntil: "domcontentloaded", timeout: 12000 })
    .catch(() => null);
  const dlPromise = page
    .waitForEvent("download", { timeout: 12000 })
    .catch(() => null);
  await btn.first().click();

  const [nav, dl] = await Promise.all([navPromise, dlPromise]);
  if (dl) {
    result.mode = "download";
    const suggested = dl.suggestedFilename();
    const savePath = path.join(outDir, suggested || "attendance-download.bin");
    await dl.saveAs(savePath);
    result.downloaded = { suggested, savedAs: savePath };
  }
  if (nav) {
    result.mode =
      result.mode === "download" ? "download+navigation" : "navigation";
  }

  result.finalUrl = page.url();
  result.title = await page.title();
  const html = await page.content();
  fs.writeFileSync(path.join(outDir, "attendance-result.html"), html, "utf8");
  await page.screenshot({
    path: path.join(outDir, "attendance-result.png"),
    fullPage: true,
  });
  fs.writeFileSync(
    path.join(outDir, "summary.json"),
    JSON.stringify(result, null, 2),
    "utf8",
  );

  await browser.close();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
