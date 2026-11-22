import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { studioConfigured } from "@/auth";

export const runtime = "nodejs";
const repo = "naeim179/naeem_web";
const allowedExtensions = new Set(["png", "jpg", "jpeg", "webp", "pdf", "md", "txt", "py", "zip", "wav", "docx"]);
const maxFileSize = 2 * 1024 * 1024;

async function github(token: string, path: string, init: RequestInit = {}) {
  const response = await fetch(`https://api.github.com/repos/${repo}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`GitHub ${response.status} at ${path}`);
  return response.json();
}
function textField(data: FormData, name: string, limit: number) {
  const value = data.get(name);
  if (typeof value !== "string") throw new Error(`Missing ${name}`);
  const result = value.trim();
  if (!result || result.length > limit) throw new Error(`Invalid ${name}`);
  return result;
}
function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
}
export async function POST(request: NextRequest) {
  if (!studioConfigured) return Response.json({ error: "Studio is not configured." }, { status: 404 });
  if (Number(request.headers.get("content-length") || 0) > 4 * 1024 * 1024)
    return Response.json({ error: "Upload exceeds the 4 MB request limit." }, { status: 413 });
  const identity = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  if (identity?.ownerId !== "130230895")
    return Response.json({ error: "Access denied." }, { status: 403 });
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    const data = await request.formData();
    const title = textField(data, "title", 100);
    const collection = textField(data, "collection", 90);
    const category = textField(data, "category", 30);
    const date = textField(data, "date", 10);
    const difficulty = textField(data, "difficulty", 15);
    const summary = textField(data, "summary", 400);
    const body = textField(data, "body", 100000);
    const pointsRaw = data.get("points");
    if (!["Web", "Reverse", "Crypto", "Pwn", "Machine", "Misc"].includes(category) ||
        !["Easy", "Medium", "Hard", "Insane"].includes(difficulty) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) ||
        body.length < 80 || (typeof pointsRaw === "string" && pointsRaw !== "" && !/^\d{1,6}$/.test(pointsRaw)))
      throw new Error("Check the form fields and try again.");
    const collectionId = slugify(collection);
    const slug = `${collectionId}-${slugify(title)}`;
    if (!collectionId || !slugify(title)) throw new Error("Use a title and competition name with Latin letters or numbers.");
    const files = data.getAll("attachments").filter((entry): entry is File => entry instanceof File && entry.size > 0);
    if (files.length > 5) throw new Error("Attach no more than five files.");
    if (files.reduce((total, file) => total + file.size, 0) > 3 * 1024 * 1024)
      throw new Error("Attachments exceed the 3 MB total limit.");
    const names = new Set<string>();
    for (const file of files) {
      const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 100);
      const extension = name.split(".").pop()?.toLowerCase();
      if (!name || !extension || !allowedExtensions.has(extension) || file.size > maxFileSize || names.has(name.toLowerCase()))
        throw new Error("An attachment has an unsupported type, duplicate name, or exceeds 2 MB.");
      names.add(name.toLowerCase());
    }
    const token = process.env.STUDIO_GITHUB_TOKEN!;
    const branch = `studio/${slug}-${Date.now()}`;
    const base = await github(token, "git/ref/heads/main");
    const baseSha = base.object.sha as string;
    const baseCommit = await github(token, `git/commits/${baseSha}`);
    const catalogFile = await github(token, "contents/content/writeups/catalog.json?ref=main");
    const catalog = JSON.parse(Buffer.from(catalogFile.content, "base64").toString("utf8")) as Record<string, unknown>[];
    if (catalog.some((entry) => entry.slug === slug)) throw new Error("This challenge already exists in the library.");
    const entry = {
      slug, title, collection, collectionId, category, difficulty, summary,
      tags: [], skills: [], date, points: typeof pointsRaw === "string" && pointsRaw ? pointsRaw : null,
      solves: null, source: `content/writeups/${slug}/README.md`, format: "markdown", archivePath: null,
      readingMinutes: Math.max(1, Math.ceil(body.split(/\s+/).length / 200)),
    };
    catalog.push(entry);
    const uploadFiles: { path: string; content: Buffer }[] = [
      { path: "content/writeups/catalog.json", content: Buffer.from(JSON.stringify(catalog, null, 2) + "\n") },
      { path: `content/writeups/${slug}/README.md`, content: Buffer.from(body + "\n") },
    ];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 100);
      uploadFiles.push({ path: `content/writeups/${slug}/${safeName}`, content: Buffer.from(await file.arrayBuffer()) });
    }
    const treeItems = [];
    for (const file of uploadFiles) {
      const blob = await github(token, "git/blobs", { method: "POST", body: JSON.stringify({ content: file.content.toString("base64"), encoding: "base64" }) });
      treeItems.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const tree = await github(token, "git/trees", { method: "POST", body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree: treeItems }) });
    const commit = await github(token, "git/commits", { method: "POST", body: JSON.stringify({ message: `Add ${title} writeup`, tree: tree.sha, parents: [baseSha] }) });
    await github(token, "git/refs", { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }) });
    const pr = await github(token, "pulls", { method: "POST", body: JSON.stringify({ title: `Publish ${title} writeup`, head: branch, base: "main", draft: true, body: `Adds ${title} (${category}) to ${collection}.\n\nReview the Markdown and attachments, then mark ready and merge to publish.` }) });
    return Response.json({ url: pr.html_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the draft.";
    const safe = message.startsWith("GitHub ") ? "GitHub rejected the draft. Check repository access and try again." : message;
    return Response.json({ error: safe }, { status: 400 });
  }
}
