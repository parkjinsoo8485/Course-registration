const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const files = fs
  .readdirSync(root)
  .filter((f) => f.toLowerCase().endsWith(".html"));
const names = new Set();

for (const file of files) {
  const full = path.join(root, file);
  const text = fs.readFileSync(full, "utf8");
  const handlers =
    text.match(/on(?:click|change|submit|keyup|blur|load)\s*=\s*"[^"]+"/g) ||
    [];
  for (const h of handlers) {
    const calls = h.match(/[A-Za-z_][A-Za-z0-9_]*\s*\(/g) || [];
    for (const c of calls) {
      const n = c.replace(/\(.*/, "").trim();
      if (
        ![
          "if",
          "for",
          "while",
          "switch",
          "return",
          "alert",
          "confirm",
          "location",
          "history",
        ].includes(n)
      ) {
        names.add(n);
      }
    }
  }
}

const out = Array.from(names).sort();
fs.writeFileSync(
  path.join(__dirname, "inline-handler-functions.txt"),
  out.join("\n") + "\n",
  "utf8",
);
console.log(out.join("\n"));
