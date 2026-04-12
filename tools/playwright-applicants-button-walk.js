const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

function fileUrl(name) {
  return "file:///" + path.resolve(name).replace(/\\/g, "/");
}

async function main() {
  const outDir = path.resolve("captures", "applicants-actions");
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1365, height: 900 },
  });

  const targets = [
    { key: "to-waitlist", label: "대기자목록" },
    { key: "sin", label: "신청자등록" },
    { key: "input", label: "신청자일괄입력" },
    { key: "pay", label: "수강료입력" },
    { key: "copy", label: "신청자복사" },
    { key: "com", label: "추가/취소자조회" },
    { key: "list1", label: "미신청자목록" },
    { key: "pdf", label: "수강신청서출력" },
    { key: "pdf1", label: "고지서출력" },
    { key: "pdf2", label: "시간표출력" },
  ];

  const results = [];
  for (const t of targets) {
    await page.goto(fileUrl("applicants.html"), {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(400);

    let ok = false;
    let title = "";
    let url = "";
    let error = "";
    try {
      const button = page.getByRole("button", { name: t.label }).first();
      const link = page.getByRole("link", { name: t.label }).first();
      if (await button.count()) {
        await button.click();
      } else {
        await link.click();
      }
      await page.waitForTimeout(600);
      title = await page.title();
      url = page.url();
      ok = true;
      await page.screenshot({
        path: path.join(outDir, `${t.key}.png`),
        fullPage: true,
      });
    } catch (e) {
      error = String(e && e.message ? e.message : e);
    }
    results.push({ key: t.key, label: t.label, ok, title, url, error });
  }

  await browser.close();
  const outPath = path.join(outDir, "summary.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf8");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
