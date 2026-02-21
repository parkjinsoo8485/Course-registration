const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const TARGETS = [
  { key: "teacher-lists", url: "https://www.dbdbschool.kr/sczigi/teacher/lists/sn/2848" },
  { key: "teacher-field", url: "https://www.dbdbschool.kr/sczigi/teacher/field/sn/2848" },
  { key: "teacher-level", url: "https://www.dbdbschool.kr/sczigi/teacher/level/sn/2848" },
  { key: "teacher-clear", url: "https://www.dbdbschool.kr/sczigi/teacher/clear/sn/2848" },
  { key: "student-lists", url: "https://www.dbdbschool.kr/sczigi/student/lists/sn/2848" },
  { key: "student-main", url: "https://www.dbdbschool.kr/sczigi/student/main/sn/2848" },
  { key: "student-field", url: "https://www.dbdbschool.kr/sczigi/student/field/sn/2848" },
  { key: "student-course", url: "https://www.dbdbschool.kr/sczigi/student/course/sn/2848" },
  { key: "student-clear", url: "https://www.dbdbschool.kr/sczigi/student/clear/sn/2848" },
  { key: "sms-tel", url: "https://www.dbdbschool.kr/sczigi/sms_tel/lists/sn/2848" },
  { key: "sms-sin", url: "https://www.dbdbschool.kr/sczigi/sms_sin/lists/sn/2848" },
  { key: "sms-charge", url: "https://www.dbdbschool.kr/sczigi/sms_charge/lists/sn/2848" },
  { key: "sms-report", url: "https://www.dbdbschool.kr/sczigi/sms_report/lists/sn/2848" }
];

async function waitForManualLogin(page, context) {
  const deadline = Date.now() + 10 * 60 * 1000; // 10 minutes
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const url = page.url();
    const title = await page.title();
    const needLogin = /login/i.test(url) || title.includes("로그인");
    if (!needLogin) {
      await context.storageState({ path: "dbdb-storage-state.json" });
      console.log("Login detected. storageState updated.");
      return;
    }
    if (Date.now() > deadline) {
      throw new Error("Manual login timeout (10 minutes)");
    }
    console.log("Waiting for manual login... current:", url);
    await page.waitForTimeout(2000);
  }
}

async function main() {
  const storagePath = path.resolve("dbdb-storage-state.json");
  if (!fs.existsSync(storagePath)) {
    throw new Error("dbdb-storage-state.json not found");
  }

  const outDir = path.resolve("captures", "school-raw");
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: false });
  const context = await browser.newContext({
    storageState: storagePath,
    locale: "ko-KR",
    viewport: { width: 1365, height: 900 }
  });
  const page = await context.newPage();

  // First page: if redirected to login, allow user to login manually and continue.
  await page.goto(TARGETS[0].url, { waitUntil: "domcontentloaded", timeout: 70000 });
  await page.waitForTimeout(1200);
  const firstTitle = await page.title();
  if (/login/i.test(page.url()) || firstTitle.includes("로그인")) {
    console.log("Login page opened. Please login in the browser window.");
    await waitForManualLogin(page, context);
  }

  const summary = [];
  for (const target of TARGETS) {
    let ok = false;
    let title = "";
    try {
      await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 70000 });
      await page.waitForTimeout(1800);
      title = await page.title();
      fs.writeFileSync(path.join(outDir, `${target.key}.html`), await page.content(), "utf8");
      await page.screenshot({ path: path.join(outDir, `${target.key}.png`), fullPage: true });
      ok = true;
    } catch (err) {
      title = String(err && err.message ? err.message : err);
    }
    summary.push({ key: target.key, url: target.url, ok, title });
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
