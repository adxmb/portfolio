import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const file = "src/config/portfolioData.ts";
const lines = readFileSync(resolve(process.cwd(), file), "utf8").split("\n");
const pattern = /\[\[[^\]]*\]\]|@placeholder/;

let count = 0;
lines.forEach((line, index) => {
  if (!pattern.test(line)) return;
  // Skip the documentation comment at the top of the file.
  if (line.trimStart().startsWith("*") || line.trimStart().startsWith("//")) return;
  count += 1;
  console.log(`${String(index + 1).padStart(4)}  ${line.trim()}`);
});

console.log(
  count === 0
    ? "\nNo placeholders left in " + file + "."
    : `\n${count} placeholder line(s) left in ${file}.`,
);
