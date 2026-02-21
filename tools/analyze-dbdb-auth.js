const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

function normalizeText(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

async function extractPageShape(page, label) {
  return await page.evaluate((inputLabel) => {
    const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
    const pick = (sel) => Array.from(document.querySelectorAll(sel));

    const buttons = pick("button, a.btn, input[type='button'], input[type='submit']").map((el) => ({
      tag: el.tagName.toLowerCase(),
      id: el.id || "",
      cls: el.className || "",
      text: norm(el.textContent || el.value || ""),
      href: el.getAttribute("href") || "",
      type: el.getAttribute("type") || ""
    }));

    const links = pick("a").map((a) => ({
      text: norm(a.textContent),
      href: a.getAttribute("href") || "",
      cls: a.className || ""
    }));

    const inputs = pick("input, select, textarea").map((el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute("type") || "",
      id: el.id || "",
      name: el.getAttribute("name") || "",
      cls: el.className || "",
      placeholder: el.getAttribute("placeholder") || ""
    }));

    const headers = pick("table thead th").map((th) => norm(th.textContent));
    const rowCount = document.querySelectorAll("table tbody tr").length;

    return {
      label: inputLabel,
      url: location.href,
      title: document.title,
      h1: norm((document.querySelector("h1") || {}).textContent || ""),
      buttons,
      links,
      inputs,
      headers,
      rowCount
    };
  }, label);
}

function indexByText(items) {
  const set = new Set();
  items.forEach((x) => {
    const t = normalizeText(x.text);
    if (t) set.add(t);
  });
  return set;
}

function diffSets(baseSet, compareSet) {
  const missing = [];
  baseSet.forEach((x) => {
    if (!compareSet.has(x)) missing.push(x);
  });
  return missing.sort();
}

async function main() {
  const storagePath = path.resolve("dbdb-storage-state.json");
  if (!fs.existsSync(storagePath)) {
    throw new Error("dbdb-storage-state.json not found");
  }

  const browser = await chromium.launch({ channel: "chrome", headless: false });

  const realCtx = await browser.newContext({
    storageState: storagePath,
    locale: "ko-KR",
    viewport: { width: 1440, height: 900 }
  });
  const realPage = await realCtx.newPage();
  await realPage.goto("https://www.dbdbschool.kr/af/ad_lec/lists/sn/2848", {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });
  await realPage.waitForTimeout(3000);
  const realShape = await extractPageShape(realPage, "real");
  await realPage.screenshot({ path: "dbdb-real-auth.png", fullPage: true });

  const localCtx = await browser.newContext({
    locale: "ko-KR",
    viewport: { width: 1440, height: 900 }
  });
  const localPage = await localCtx.newPage();
  await localPage.goto("file:///" + path.resolve("index.html").replace(/\\/g, "/"), {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });
  await localPage.waitForTimeout(1000);
  const localShape = await extractPageShape(localPage, "local");
  await localPage.screenshot({ path: "dbdb-local-current.png", fullPage: true });

  await browser.close();

  const realButtons = indexByText(realShape.buttons);
  const localButtons = indexByText(localShape.buttons);
  const realLinks = indexByText(realShape.links);
  const localLinks = indexByText(localShape.links);
  const realHeaders = new Set(realShape.headers.filter(Boolean));
  const localHeaders = new Set(localShape.headers.filter(Boolean));

  const report = {
    generatedAt: new Date().toISOString(),
    realUrl: realShape.url,
    localUrl: localShape.url,
    realTitle: realShape.title,
    localTitle: localShape.title,
    counts: {
      realButtons: realShape.buttons.length,
      localButtons: localShape.buttons.length,
      realLinks: realShape.links.length,
      localLinks: localShape.links.length,
      realInputs: realShape.inputs.length,
      localInputs: localShape.inputs.length,
      realRows: realShape.rowCount,
      localRows: localShape.rowCount
    },
    missingInLocal: {
      buttonTexts: diffSets(realButtons, localButtons),
      linkTexts: diffSets(realLinks, localLinks),
      tableHeaders: diffSets(realHeaders, localHeaders)
    },
    samples: {
      realButtons: realShape.buttons.slice(0, 40),
      localButtons: localShape.buttons.slice(0, 40),
      realInputs: realShape.inputs.slice(0, 60),
      localInputs: localShape.inputs.slice(0, 60)
    }
  };

  fs.writeFileSync("dbdb-auth-analysis-report.json", JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
