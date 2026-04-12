const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

function fileUrl(name) {
  return "file:///" + path.resolve(name).replace(/\\/g, "/");
}

async function main() {
  const outDir = path.resolve("captures", "local-sidebar");
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1365, height: 900 },
  });

  await page.goto(fileUrl("index.html"), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);

  const links = await page.$$eval(
    "#left_menu .side-nav a[href$='.html']",
    (els) => {
      const seen = new Set();
      return els
        .map((a) => ({
          href: a.getAttribute("href") || "",
          text: (a.textContent || "").replace(/\s+/g, " ").trim(),
        }))
        .filter((x) => {
          if (!x.href) return false;
          if (seen.has(x.href)) return false;
          seen.add(x.href);
          return true;
        });
    },
  );

  const results = [];
  for (const link of links) {
    const href = link.href.replace(/^\.\//, "");
    const target = href.split("?")[0];
    let ok = false;
    let title = "";
    try {
      await page.goto(fileUrl(target), { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(600);
      title = await page.title();
      const shot = target.replace(/\.html$/i, "") + ".png";
      await page.screenshot({ path: path.join(outDir, shot), fullPage: true });
      ok = true;
    } catch (err) {
      title = String(err && err.message ? err.message : err);
    }
    results.push({ href: target, text: link.text, ok, title });
  }

  await browser.close();
  fs.writeFileSync(
    path.join(outDir, "summary.json"),
    JSON.stringify(results, null, 2),
    "utf8",
  );
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
