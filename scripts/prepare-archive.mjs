import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
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

// Markdown writeup folders are the only editable asset source for new casefiles.
const writeupFiles = new URL("../public/writeup-files/", import.meta.url);
await mkdir(writeupFiles, { recursive: true });
const catalog = JSON.parse(
  await readFile(
    new URL("../content/writeups/catalog.json", import.meta.url),
    "utf8",
  ),
);
for (const entry of catalog.filter((entry) => entry.format === "markdown")) {
  await cp(
    new URL(`../${dirname(entry.source)}/`, import.meta.url),
    new URL(`${entry.slug}/`, writeupFiles),
    { recursive: true },
  );
}
