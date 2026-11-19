import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { parseFragment, type DefaultTreeAdapterMap } from "parse5";
import { renderToStaticMarkup } from "react-dom/server";
import { writeups, getWriteup } from "../lib/writeups";
import { tvxCtfResult } from "../lib/competitions";
import {
  readWriteup,
  nodeText,
  renderWriteup,
  resolveWriteupURL,
} from "../lib/writeup-content";

type Node = DefaultTreeAdapterMap["node"];
const walk = (n: Node, p: (n: Node) => boolean): Node[] => [
  ...(p(n) ? [n] : []),
  ...("childNodes" in n ? n.childNodes.flatMap((c) => walk(c, p)) : []),
];
const attr = (n: Node, key: string) =>
  "attrs" in n ? n.attrs.find((a) => a.name === key)?.value : undefined;

test("catalog has unique slugs and only safe, existing source files", async () => {
  assert.ok(writeups.length >= 29);
  assert.equal(new Set(writeups.map((w) => w.slug)).size, writeups.length);
  for (const w of writeups) {
    assert.match(w.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(!w.source.includes(".."));
    assert.ok(
      ["legacy/ctf-portfolio/wrup/", "content/writeups/"].some((prefix) =>
        w.source.startsWith(prefix),
      ),
    );
    await fs.access(w.source);
  }
  assert.equal(getWriteup("../README.md"), undefined);
  assert.equal(getWriteup("constructor"), undefined);
});

test("all original archived files remain byte-for-byte identical", async () => {
  const manifest = JSON.parse(
    await fs.readFile("content/writeups/preserved-archive-sha256.json", "utf8"),
  );
  for (const [file, expected] of Object.entries(manifest)) {
    const bytes = await fs.readFile(file);
    if (/^legacy\/ctf-portfolio\/wrup\/[^/]+\/[^/]+\.html$/.test(file)) {
      assert.ok(
        writeups.some((entry) => entry.source === file),
        "Original casefile must stay indexed: " + file,
      );
    }
    assert.equal(
      crypto.createHash("sha256").update(bytes).digest("hex"),
      expected,
      file,
    );
  }
});

test("imported solver, screenshot and historical narrative match their source provenance", async () => {
  const root = "content/writeups/jordansec-the-will";
  const manifest = JSON.parse(
    await fs.readFile(path.join(root, "provenance.json"), "utf8"),
  );
  for (const [file, expected] of Object.entries(manifest.originalFilesSHA256)) {
    const target = file === "README.md" ? "README.original.md" : file;
    assert.equal(
      crypto
        .createHash("sha256")
        .update(await fs.readFile(path.join(root, target)))
        .digest("hex"),
      expected,
      target,
    );
  }
});

test("new readers preserve all archived code samples, heading order and technical text", async () => {
  for (const entry of writeups.filter((w) => w.format === "html")) {
    const doc = await readWriteup(entry);
    const rendered = parseFragment(
      renderToStaticMarkup(renderWriteup(entry, doc)),
    );
    const sourceCode = walk(
      doc.body,
      (n) => "tagName" in n && n.tagName === "pre",
    ).map(nodeText);
    const renderedCode = walk(
      rendered,
      (n) => "tagName" in n && n.tagName === "pre",
    ).map(nodeText);
    assert.deepEqual(renderedCode, sourceCode, entry.slug + " code");
    for (const tag of ["li", "td", "th"]) {
      assert.deepEqual(
        walk(rendered, (n) => "tagName" in n && n.tagName === tag).map(
          nodeText,
        ),
        walk(doc.body, (n) => "tagName" in n && n.tagName === tag).map(
          nodeText,
        ),
        entry.slug + " " + tag,
      );
    }
    const headings = walk(
      doc.body,
      (n) => "tagName" in n && n.tagName === "h2",
    ).map(nodeText);
    assert.deepEqual(
      doc.toc.map((h) => h.title),
      headings,
      entry.slug + " headings",
    );
    const originalParagraphs = walk(
      doc.body,
      (n) => "tagName" in n && n.tagName === "p",
    ).map(nodeText);
    const text = nodeText(rendered);
    for (const paragraph of originalParagraphs)
      assert.ok(text.includes(paragraph), entry.slug + " paragraph");
    const ids = walk(rendered, (n) => Boolean(attr(n, "id"))).map((n) =>
      attr(n, "id"),
    );
    assert.equal(new Set(ids).size, ids.length, entry.slug + " duplicate IDs");
  }
});

test("renderer excludes executable markup, unsafe links and event handlers", async () => {
  const entry = writeups[0];
  const body = parseFragment(
    '<section><script>alert(1)</script><iframe src="https://evil.example"></iframe><p onclick="alert(1)">Keep this text</p><a href="javascript:alert(1)">Unsafe</a><a href="https://example.com">External</a><img src="data:text/html,bad" onerror="alert(1)"><pre>&lt;script&gt;as code&lt;/script&gt;</pre></section>',
  );
  const html = renderToStaticMarkup(
    renderWriteup(entry, { body, toc: [], headingIds: new Map() }),
  );
  assert.ok(html.includes("Keep this text"));
  assert.ok(html.includes("&lt;script&gt;as code&lt;/script&gt;"));
  assert.doesNotMatch(
    html,
    /<script|<iframe|onclick=|onerror=|href="javascript:|data:text\/html/,
  );
  assert.match(html, /rel="noopener noreferrer"/);
});

test("legacy cross-links resolve to canonical casefiles and image URLs remain valid", async () => {
  for (const entry of writeups) {
    const doc = await readWriteup(entry);
    for (const n of walk(
      doc.body,
      (n) => "tagName" in n && n.tagName === "img",
    )) {
      const src = resolveWriteupURL(attr(n, "src") ?? "", entry);
      assert.ok(src?.startsWith("/"));
      const source = src!.startsWith("/archive/")
        ? "legacy/ctf-portfolio/" + src!.slice("/archive/".length)
        : "content/writeups/" + src!.slice("/writeup-files/".length);
      await fs.access(source);
    }
  }
  assert.equal(
    resolveWriteupURL("../web/borogpt.html", writeups[0]),
    "/writeups/boroctf-borogpt",
  );
  assert.equal(resolveWriteupURL("../index.html", writeups[0]), "/writeups");
  assert.equal(
    resolveWriteupURL("javascript:alert(1)", writeups[0]),
    undefined,
  );
  assert.equal(resolveWriteupURL("#walkthrough", writeups[0]), "#walkthrough");
});

test("MetaCTF original uploads and images remain intact, with internally consistent reported schedule data", async () => {
  const entries = writeups.filter((entry) => entry.collectionId === "metactf");
  assert.equal(entries.length, 4);
  for (const entry of entries) {
    const root = path.dirname(entry.source);
    const manifest = JSON.parse(
      await fs.readFile(path.join(root, "provenance.json"), "utf8"),
    );
    for (const [file, expected] of Object.entries(
      manifest.preservedFilesSHA256,
    )) {
      assert.equal(
        crypto
          .createHash("sha256")
          .update(await fs.readFile(path.join(root, file)))
          .digest("hex"),
        expected,
        entry.slug + " " + file,
      );
    }
    assert.equal(
      entry.date,
      null,
      "Unconfirmed event dates must remain absent",
    );
  }
  const root = "content/writeups/metactf-reliability-update";
  const original = await fs.readFile(
    path.join(root, "README.original.md"),
    "utf8",
  );
  const blocks = [...original.matchAll(/```json\n([\s\S]*?)\n```/g)].map(
    (match) => JSON.parse(match[1]),
  );
  const schedule = JSON.parse(
    await fs.readFile(path.join(root, "driver_control_schedule.json"), "utf8"),
  );
  const result = JSON.parse(
    await fs.readFile(path.join(root, "replay.reported.json"), "utf8"),
  );
  assert.deepEqual(schedule, blocks[0]);
  assert.deepEqual(result, blocks[1]);
  assert.equal(schedule.events.length, 20);
  assert.ok(schedule.events.length <= 24);
  assert.deepEqual(schedule.events[0], {
    at_mm: 0,
    aero_request: "corner",
    boost: false,
  });
  assert.equal(
    schedule.events.filter((event: { at_mm: number }) => event.at_mm >= 1604000)
      .length,
    16,
  );
  for (let i = 1; i < schedule.events.length; i++)
    assert.ok(schedule.events[i].at_mm - schedule.events[i - 1].at_mm >= 3000);
  assert.equal(
    result.approved_lap_ms - result.candidate_lap_ms,
    result.delta_ms,
  );
  assert.equal(result.delta_ms, 820);
  assert.equal(result.candidate_delay_ms, 1380);
  const reading = await fs.readFile(path.join(root, "README.md"), "utf8");
  assert.ok(reading.includes("**16 changes**"));
  assert.ok(reading.includes("**reported original result**"));
});

test("TVX source documents and screenshots remain intact, with honest reproduction limits", async () => {
  const entries = writeups.filter((entry) => entry.collectionId === "tvxctf");
  assert.equal(entries.length, 5);
  for (const entry of entries) {
    const root = path.dirname(entry.source);
    const manifest = JSON.parse(await fs.readFile(path.join(root, "provenance.json"), "utf8"));
    for (const [file, expected] of Object.entries(manifest.preservedFilesSHA256)) {
      assert.equal(crypto.createHash("sha256").update(await fs.readFile(path.join(root, file))).digest("hex"), expected, entry.slug + " " + file);
    }
    assert.equal(entry.date, "2026-11-13", "Solve date is visible in supplied history");
    assert.equal(entry.difficulty, null, "No official difficulty was supplied");
    const doc = await readWriteup(entry);
    assert.ok(doc.toc.length >= 7, entry.slug + " must expose its technical sections");
  }
  const root = "content/writeups/tvx-ending";
  const original = await fs.readFile(path.join(root, "Ending_solve.py"), "utf8");
  const reviewed = await fs.readFile(path.join(root, "Ending_solve.reviewed.py"), "utf8");
  assert.equal(reviewed, original.replace("pc += signed_byte()", "displacement = signed_byte()\n            pc += displacement"));
  const malware = await fs.readFile("content/writeups/tvx-malwarex/README.md", "utf8");
  assert.match(malware, /accepted stage-three flag is \*\*not documented/);
  assert.match(malware, /reported findings from the supplied document/);
  assert.match(malware, /No malware was executed, downloaded, or contacted/);
});

test("TVX embedded-array reconstructions match both documented final flags", async () => {
  const ror8 = (v: number, n: number) => ((v >>> n) | (v << (8 - n))) & 255;
  const data = Buffer.from("a2d809c04ab438478fd5e716e67fbcdb025598ed4ce5e0b68866b0a04340eb2b46df5ebdfacd5b12", "hex");
  const twist = Buffer.from(Array.from(data, (_, i) => {
    const j = (i * 7 + 3) % data.length;
    return ror8(data[j], j % 5 + 1) ^ ((0x37 + j * 11) & 255);
  }));
  assert.equal(twist.length, 40);
  assert.equal(twist.toString("ascii"), "TVX{Fl4ggy_fl4g_fl4g_tw15ty_tw15t_tw15t}");
  const blob = Buffer.from("e99392aa94e4f1b4468f04109d54a3594e398a3e773963fa02fb", "hex");
  const schedule = Buffer.from("6d12a940f327885b", "hex");
  const intermediate = Buffer.from(Array.from(blob, (_, i) => {
    let value = blob[(5 * i + 1) % blob.length];
    value ^= (51 + 11 * i) & 255;
    value ^= schedule[i % schedule.length];
    value = (value - ((3 * i * i + 25) & 255)) & 255;
    return ror8(value, i % 5 + 1) ^ ((33 + 7 * i) & 255);
  }));
  assert.equal(intermediate.toString("ascii"), "{XVT_dn47_0S5_3hS_nu3n1h}5");
  const summer = Buffer.alloc(blob.length);
  for (let i = 0; i < intermediate.length; i++) {
    const base = Math.floor(i / 4) * 4;
    summer[base + Math.min(4, blob.length - base) - 1 - (i - base)] = intermediate[i];
  }
  assert.equal(summer.toString("ascii"), "TVX{4nd_S0_7h3_5un_Sh1n35}");
  for (const [slug, flag] of [["tvx-twist-me-a-twister", twist.toString("ascii")], ["tvx-summer-is-over", summer.toString("ascii")]]) {
    const doc = await readWriteup(getWriteup(slug)!);
    const html = renderToStaticMarkup(renderWriteup(getWriteup(slug)!, doc));
    assert.ok(nodeText(parseFragment(html)).includes(flag), slug);
  }
});

test("TVX achievement keeps the original certificate and its document preview intact", async () => {
  const record = JSON.parse(await fs.readFile("content/certificates/tvx-ctf-2026.json", "utf8"));
  for (const [file, expected] of [[record.document, record.sha256], [record.preview, record.previewSHA256]]) {
    assert.equal(crypto.createHash("sha256").update(await fs.readFile(file)).digest("hex"), expected);
  }
  assert.equal(record.finalTeamRank, tvxCtfResult.teamRank);
  assert.equal(record.teamPoints, tvxCtfResult.teamPoints);
  assert.equal(record.issuedOn, tvxCtfResult.certificate.issuedOn);
  assert.equal(record.document, "public" + tvxCtfResult.certificate.pdf);
  assert.equal(record.preview, "public" + tvxCtfResult.certificate.preview);
  const entry = getWriteup("tvx-ending")!;
  const rendered = renderToStaticMarkup(renderWriteup(entry, await readWriteup(entry)));
  assert.ok(rendered.includes(`href="${tvxCtfResult.certificate.pdf}"`));
});
