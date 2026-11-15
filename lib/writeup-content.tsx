import { readFile } from "node:fs/promises";
import path from "node:path";
import { createElement, type ReactNode } from "react";
import { parse, parseFragment, type DefaultTreeAdapterMap } from "parse5";
import { marked } from "marked";
import { writeups, type Writeup } from "./writeups";
import CopyCode from "@/components/writeups/CopyCode";

type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
const elements = new Set([
  "section",
  "div",
  "p",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "strong",
  "em",
  "b",
  "i",
  "a",
  "img",
  "br",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "caption",
  "details",
  "summary",
  "span",
  "small",
  "dl",
  "dt",
  "dd",
  "figure",
  "figcaption",
  "sup",
  "sub",
  "kbd",
  "samp",
  "mark",
]);
const children = (node: Node): Node[] =>
  "childNodes" in node ? node.childNodes : [];
const attr = (node: Element, key: string) =>
  node.attrs.find((a) => a.name === key)?.value;
export function nodeText(node: Node): string {
  return node.nodeName === "#text"
    ? (node as DefaultTreeAdapterMap["textNode"]).value
    : children(node).map(nodeText).join("");
}
function find(
  node: Node,
  predicate: (node: Node) => boolean,
): Node | undefined {
  if (predicate(node)) return node;
  for (const child of children(node)) {
    const found = find(child, predicate);
    if (found) return found;
  }
}
function hasClass(node: Node, value: string): boolean {
  return (
    "tagName" in node &&
    (attr(node, "class") ?? "").split(/\s+/).includes(value)
  );
}
export async function readWriteup(entry: Writeup) {
  const prefix = entry.format === "html" ? "legacy/ctf-portfolio/wrup/" : "content/writeups/";
  if (!entry.source.startsWith(prefix) || entry.source.includes("..")) {
    throw new Error("Invalid writeup source path");
  }
  const relativeSource = entry.source.slice(prefix.length);
  const source = entry.format === "html"
    ? await readFile(path.join(process.cwd(), "legacy/ctf-portfolio/wrup", relativeSource), "utf8")
    : await readFile(path.join(process.cwd(), "content/writeups", relativeSource), "utf8");
  const tree =
    entry.format === "html"
      ? parse(source)
      : parseFragment(marked.parse(source, { async: false }) as string);
  const body =
    entry.format === "html"
      ? find(
          tree,
          (n) =>
            "tagName" in n &&
            n.tagName === "article" &&
            hasClass(n, "case-body"),
        )
      : tree;
  if (!body) throw new Error(`Missing writeup body: ${entry.slug}`);
  const toc: { id: string; title: string }[] = [];
  const headingIds = new Map<Node, string>();
  function headings(n: Node) {
    if ("tagName" in n && n.tagName === "h2") {
      const title = nodeText(n);
      const id = `read-${toc.length + 1}-${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`;
      headingIds.set(n, id);
      toc.push({ id, title });
    }
    children(n).forEach(headings);
  }
  headings(body);
  return { body, toc, headingIds };
}
export function resolveWriteupURL(
  raw: string,
  entry: Writeup,
): string | undefined {
  if (!raw) return undefined;
  if (raw.startsWith("#")) return raw;
  const base = entry.archivePath ?? `/writeup-files/${entry.slug}/README.md`;
  try {
    const u = new URL(raw, `https://portfolio.invalid${base}`);
    if (!["http:", "https:", "mailto:"].includes(u.protocol)) return undefined;
    if (u.origin !== "https://portfolio.invalid") return u.href;
    const match = writeups.find((w) => w.archivePath === u.pathname);
    if (match) return `/writeups/${match.slug}${u.hash}`;
    if (
      ["/archive/wrup/index.html", "/archive/writeups/index.html"].includes(
        u.pathname,
      )
    )
      return "/writeups" + u.hash;
    if (u.pathname === "/archive/index.html") return "/";
    return u.pathname + u.search + u.hash;
  } catch {
    return undefined;
  }
}
export function renderWriteup(
  entry: Writeup,
  document: Awaited<ReturnType<typeof readWriteup>>,
): ReactNode {
  const render = (node: Node, key: number | string): ReactNode => {
    if (node.nodeName === "#text") return nodeText(node);
    if (!("tagName" in node)) return null;
    const tag = node.tagName;
    if (
      ["script", "style", "iframe", "object", "embed", "h1"].includes(tag) ||
      hasClass(node, "footer-actions") ||
      hasClass(node, "terminal-top")
    )
      return null;
    const body = children(node).map((child, i) => render(child, `${key}-${i}`));
    if (!elements.has(tag)) return body;
    if (tag === "pre") {
      const text = nodeText(node);
      return (
        <div className="writeup-code" key={key}>
          <CopyCode text={text} />
          <pre tabIndex={0} aria-label="Code sample">
            <code>{text}</code>
          </pre>
        </div>
      );
    }
    const props: Record<string, unknown> = { key };
    const id = document.headingIds.get(node) ?? attr(node, "id");
    if (id) props.id = id;
    const className = attr(node, "class");
    if (className) props.className = className;
    if (tag === "a") {
      const href = resolveWriteupURL(attr(node, "href") ?? "", entry);
      if (!href) return <span key={key}>{body}</span>;
      props.href = href;
      if (/^https?:/.test(href)) {
        props.target = "_blank";
        props.rel = "noopener noreferrer";
      }
    }
    if (tag === "img") {
      const src = resolveWriteupURL(attr(node, "src") ?? "", entry);
      if (!src || !src.startsWith("/")) return null;
      props.src = src;
      props.alt = attr(node, "alt") ?? "Writeup evidence";
      props.loading = "lazy";
      props.decoding = "async";
      return createElement("img", props);
    }
    if (tag === "table")
      return (
        <div className="writeup-table" key={key}>
          {createElement(tag, props, body)}
        </div>
      );
    if (["br", "hr"].includes(tag)) return createElement(tag, props);
    if (tag === "ol" && attr(node, "start"))
      props.start = Number(attr(node, "start"));
    return createElement(tag, props, body);
  };
  return children(document.body).map((node, i) => render(node, i));
}
