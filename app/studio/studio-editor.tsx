"use client";
import { useRef, useState, type FormEvent } from "react";

type Result = { url?: string; error?: string };
export default function StudioEditor() {
  const [result, setResult] = useState<Result>({});
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState({ title: "", summary: "", body: "" });
  function togglePreview() {
    if (!preview && form.current) {
      const data = new FormData(form.current);
      setDraft({ title: String(data.get("title") || ""), summary: String(data.get("summary") || ""), body: String(data.get("body") || "") });
    }
    setPreview(!preview);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setResult({});
    try {
      const response = await fetch("/api/studio/writeups", { method: "POST", body: new FormData(event.currentTarget) });
      setResult(await response.json());
    } catch { setResult({ error: "Could not submit the writeup. Try again." }); }
    finally { setBusy(false); }
  }
  return <form ref={form} className="studio-form" onSubmit={submit}>
    <div className="studio-fields">
      <label>Title<input name="title" required maxLength={100} placeholder="Challenge title" /></label>
      <label>Competition<input name="collection" required maxLength={90} placeholder="OVERPASS 2026" /></label>
      <label>Category<select name="category" defaultValue="Web"><option>Web</option><option>Reverse</option><option>Crypto</option><option>Pwn</option><option>Machine</option><option>Misc</option></select></label>
      <label>Date<input name="date" type="date" required /></label>
      <label>Difficulty<select name="difficulty" defaultValue="Medium"><option>Easy</option><option>Medium</option><option>Hard</option><option>Insane</option></select></label>
      <label>Points (optional)<input name="points" inputMode="numeric" pattern="[0-9]*" /></label>
    </div>
    <label>Short summary<textarea name="summary" rows={3} required maxLength={400} placeholder="What did you solve, and how?" /></label>
    <label>Writeup in Markdown<textarea name="body" rows={18} required minLength={80} maxLength={100000} placeholder="# Challenge title\n\n## Approach\n..." /></label>
    <label>Supporting files (optional, up to 5 files of 2 MB each)<input name="attachments" type="file" multiple accept=".png,.jpg,.jpeg,.webp,.pdf,.md,.txt,.py,.zip,.wav,.docx" /></label>
    <button type="button" className="studio-button secondary" onClick={togglePreview}>{preview ? "Hide preview" : "Preview draft"}</button>
    {preview && <div className="studio-preview"><h2>{draft.title || "Untitled writeup"}</h2><p>{draft.summary || "No summary yet."}</p><pre>{draft.body || "No content yet."}</pre><p>Markdown formatting and attachments can be reviewed in the GitHub draft before publication.</p></div>}
    <button type="submit" className="studio-button" disabled={busy}>{busy ? "Submitting…" : "Create publishing request"}</button>
    {result.error && <p role="alert">{result.error}</p>}
    {result.url && <p role="status">Draft created: <a href={result.url} target="_blank" rel="noopener noreferrer">Review on GitHub</a></p>}
  </form>;
}
