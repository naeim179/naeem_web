import type { Metadata } from "next";
import Link from "next/link";
import { writeups, collections, categories } from "@/lib/writeups";
import WriteupLibrary from "@/components/writeups/WriteupLibrary";
import { Arrow } from "@/components/Icons";
export const metadata: Metadata = {
  title: "CTF Writeup Library",
  description: `${writeups.length} technical CTF writeups across web security, reverse engineering, cryptography, forensics, OSINT, and binary exploitation.`,
};
export default function WriteupsPage() {
  return (
    <div className="wrap subpage writeups-page">
      <Link href="/" className="back-link">
        ← Back to portfolio
      </Link>
      <div className="writeups-intro">
        <div>
          <p className="eyebrow">THE RESEARCH LIBRARY</p>
          <h1>
            Behind every flag,
            <br />
            <em>a way of thinking.</em>
          </h1>
          <p className="subpage-lead">
            The investigation, the wrong turns, and the moment it makes sense.
            Technical writeups from my hands-on cybersecurity practice.
          </p>
        </div>
        <div className="library-numbers">
          <div>
            <strong>{writeups.length.toString().padStart(2, "0")}</strong>
            <span>WRITEUPS</span>
          </div>
          <div>
            <strong>{collections.length.toString().padStart(2, "0")}</strong>
            <span>COMPETITIONS</span>
          </div>
          <Link href="/legacy">
            Competition experience <Arrow diagonal />
          </Link>
        </div>
      </div>
      <WriteupLibrary
        entries={writeups}
        collections={collections}
        categories={categories}
      />
      <div className="library-end">
        <p>Every casefile is part of the same learning journey.</p>
        <a
          className="text-link"
          href="https://github.com/naeim179/naeem_web/tree/main/content/writeups"
          target="_blank"
          rel="noopener noreferrer"
        >
          Browse the repository <Arrow diagonal />
        </a>
      </div>
    </div>
  );
}
