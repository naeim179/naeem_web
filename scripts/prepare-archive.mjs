import { cp, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const archive = new URL("../public/archive/", import.meta.url);
await mkdir(archive, { recursive: true });
await cp(new URL("../legacy/ctf-portfolio/", import.meta.url), archive, {
  recursive: true,
});
await writeFile(
  new URL("index.html", archive),
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Back to Naim’s portfolio</title><meta http-equiv="refresh" content="0;url=/"><p><a href="/">Return to the portfolio</a></p></html>',
);
console.log(`Prepared legacy archive in ${fileURLToPath(archive)}`);
