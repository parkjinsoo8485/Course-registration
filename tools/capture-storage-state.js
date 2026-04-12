const path = require("path");
const { chromium } = require("playwright");

async function main() {
  const outputPath = path.resolve("dbdb-storage-state.json");
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    locale: "ko-KR",
  });

  const page = await context.newPage();
  await page.goto("https://www.dbdbschool.kr/member/login/sn/2848", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  console.log("[INFO] 브라우저 창에서 로그인하세요.");
  console.log(
    "[INFO] 로그인 후 강좌관리 목록 페이지(/af/ad_lec/lists/sn/2848)까지 이동하면 자동 저장됩니다.",
  );

  const deadline = Date.now() + 10 * 60 * 1000;
  while (Date.now() < deadline) {
    const url = page.url();
    if (url.includes("/af/ad_lec/lists/sn/2848")) {
      await context.storageState({ path: outputPath });
      console.log("[OK] storageState 저장 완료:", outputPath);
      await browser.close();
      return;
    }
    await page.waitForTimeout(1000);
  }

  console.log("[TIMEOUT] 10분 내 목록 페이지 진입이 감지되지 않았습니다.");
  await browser.close();
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
