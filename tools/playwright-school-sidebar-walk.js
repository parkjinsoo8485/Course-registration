const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

function fileUrl(name) {
  return "file:///" + path.resolve(name).replace(/\\/g, "/");
}

async function main() {
  const outDir = path.resolve("captures", "school-local");
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  await page.goto(fileUrl("school.html"), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);

  const links = await page.$$eval("#left_menu a[href$='.html']", (els) => {
    const seen = new Set();
    return els
      .map((a) => ({
        href: (a.getAttribute("href") || "").replace(/^\.\//, ""),
        text: (a.textContent || "").replace(/\s+/g, " ").trim()
      }))
      .filter((x) => {
        if (!x.href) return false;
        if (seen.has(x.href)) return false;
        seen.add(x.href);
        return true;
      });
  });

  const report = [];
  for (const link of links) {
    let ok = false;
    let title = "";
    try {
      await page.goto(fileUrl(link.href), { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);
      title = await page.title();
      await page.screenshot({
        path: path.join(outDir, link.href.replace(/\.html$/i, "") + ".png"),
        fullPage: true
      });
      ok = true;
    } catch (err) {
      title = String(err && err.message ? err.message : err);
    }
    report.push({ href: link.href, text: link.text, ok, title });
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
