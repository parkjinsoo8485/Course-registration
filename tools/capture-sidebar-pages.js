const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const TARGETS = [
  { key: "manual", url: "https://www.dbdbschool.kr/af/ad_faq/main/sn/2848" },
  { key: "qanda", url: "https://www.dbdbschool.kr/af/qanda/lists/sn/2848" },
  {
    key: "school",
    url: "https://www.dbdbschool.kr/sczigi/service/lists/sn/2848",
  },
  { key: "lecture", url: "https://www.dbdbschool.kr/af/ad_lec/lists/sn/2848" },
  {
    key: "applicants",
    url: "https://www.dbdbschool.kr/af/ad_app/lists/sn/2848",
  },
  { key: "wait", url: "https://www.dbdbschool.kr/af/ad_wait/lists/sn/2848" },
  { key: "refund", url: "https://www.dbdbschool.kr/af/ad_ref/lists/sn/2848" },
  {
    key: "fund-target",
    url: "https://www.dbdbschool.kr/af/ad_free2_stu/lists/sn/2848",
  },
  {
    key: "fund-app",
    url: "https://www.dbdbschool.kr/af/ad_free2_app/lists/sn/2848",
  },
  {
    key: "fund-cfg",
    url: "https://www.dbdbschool.kr/af/ad_free2_cfg/main/sn/2848",
  },
  {
    key: "fund-rank",
    url: "https://www.dbdbschool.kr/af/ad_free2_cfg/free1/sn/2848",
  },
  { key: "teacher", url: "https://www.dbdbschool.kr/af/ad_tea/lists/sn/2848" },
  { key: "survey", url: "https://www.dbdbschool.kr/af/ad_sur/lists/sn/2848" },
  {
    key: "survey-sample",
    url: "https://www.dbdbschool.kr/af/ad_surs/lists/sn/2848",
  },
  { key: "cfg-basic", url: "https://www.dbdbschool.kr/af/ad_cfg/main/sn/2848" },
  {
    key: "cfg-period",
    url: "https://www.dbdbschool.kr/af/ad_time/lists/sn/2848",
  },
  {
    key: "cfg-lecture-time",
    url: "https://www.dbdbschool.kr/af/ad_cfg/period/sn/2848",
  },
  {
    key: "cfg-division",
    url: "https://www.dbdbschool.kr/af/ad_cfg/afDiv/sn/2848",
  },
  {
    key: "cfg-group",
    url: "https://www.dbdbschool.kr/af/ad_cfg/appLiGrp/sn/2848",
  },
  {
    key: "cfg-verify",
    url: "https://www.dbdbschool.kr/af/ad_verify/main/sn/2848",
  },
  {
    key: "cfg-neis",
    url: "https://www.dbdbschool.kr/af/ad_neis_edufine/lists/sn/2848",
  },
  {
    key: "notification",
    url: "https://www.dbdbschool.kr/af/notification/lists/sn/2848",
  },
];

async function main() {
  const storagePath = path.resolve("dbdb-storage-state.json");
  if (!fs.existsSync(storagePath)) {
    throw new Error("dbdb-storage-state.json not found");
  }

  const outDir = path.resolve("captures", "sidebar");
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: false });
  const context = await browser.newContext({
    storageState: storagePath,
    locale: "ko-KR",
    viewport: { width: 1365, height: 900 },
  });
  const page = await context.newPage();

  const summary = [];
  for (const target of TARGETS) {
    let ok = false;
    let title = "";
    try {
      await page.goto(target.url, {
        waitUntil: "domcontentloaded",
        timeout: 70000,
      });
      await page.waitForTimeout(2000);

      title = await page.title();
      const html = await page.content();
      fs.writeFileSync(path.join(outDir, `${target.key}.html`), html, "utf8");
      await page.screenshot({
        path: path.join(outDir, `${target.key}.png`),
        fullPage: true,
      });
      ok = true;
    } catch (err) {
      title = String(err && err.message ? err.message : err);
    }
    summary.push({ key: target.key, url: target.url, ok, title });
  }

  await browser.close();
  fs.writeFileSync(
    path.join(outDir, "summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8",
  );
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
