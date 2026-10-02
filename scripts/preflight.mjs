import { existsSync } from "node:fs";
import { resolve } from "node:path";

const required = [
  {
    path: "src/fonts/CabinetGrotesk-Variable.woff2",
    hint:
      "Cabinet Grotesk is the display font and is self-hosted.\n" +
      "  1. Download it free from https://www.fontshare.com/fonts/cabinet-grotesk\n" +
      "  2. Unzip it and copy the variable .woff2 file to src/fonts/CabinetGrotesk-Variable.woff2",
  },
];

const missing = required.filter((item) => !existsSync(resolve(process.cwd(), item.path)));

if (missing.length > 0) {
  console.error("\nMissing required file(s):\n");
  for (const item of missing) {
    console.error(`- ${item.path}\n  ${item.hint}\n`);
  }
  process.exit(1);
}
