"use client";
import { useEffect, useRef, useState } from "react";
export default function CopyCode({ text }: { text: string }) {
  const [status, setStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied");
    } catch {
      setStatus("Select the code to copy");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(""), 2500);
  }
  return (
    <div className="code-toolbar">
      <span>CODE / COMMANDS</span>
      <button type="button" onClick={copy} aria-label="Copy code sample">
        Copy code <span aria-hidden="true">⧉</span>
      </button>
      <span className="sr-only" role="status">
        {status}
      </span>
      {status ? (
        <span aria-hidden="true" className="copy-status">
          {status}
        </span>
      ) : null}
    </div>
  );
}
