import type { Metadata } from "next";
import { metaCtfResult } from "@/lib/competitions";
import Link from "next/link";
import Legacy from "@/components/Legacy";
import { profile } from "@/lib/portfolio";
import { Arrow } from "@/components/Icons";
export const metadata: Metadata = { title: "CTF Writeups & Research" };
// Existing results and the MetaCTF finals result confirmed by the owner.
const results = [
  {
    name: `${metaCtfResult.name} — ${metaCtfResult.institution}`,
    result: `Finals · ${metaCtfResult.teamRank}nd place`,
    details: `Team score: ${metaCtfResult.teamPoints.toLocaleString("en-US")} points · My contribution: ${metaCtfResult.personalPoints} points`,
  },
  {
    name: "National Cyber Security Center of Jordan v2",
    result: "Top 10 in Jordan",
  },
  { name: "ZeroCTF", result: "13th / 41 teams" },
  { name: "Catch the Hilal CTF", result: "20th / 47 teams" },
  { name: "JordanSec CTF", result: "39th / 72 teams" },
];
export default function LegacyPage() {
  return (
    <div className="wrap subpage">
      <Link href="/" className="back-link">
        ← Back to portfolio
      </Link>
      <p className="eyebrow">THE RESEARCH ARCHIVE</p>
      <h1 className="sr-only">CTF Writeups & Research</h1>
      <Legacy />
      <div className="archive-actions">
        <Link className="button button-ink" href="/writeups">
          Browse the library
          <Arrow diagonal />
        </Link>
        <a
          className="text-link"
          href={profile.tryhackme}
          target="_blank"
          rel="noopener noreferrer"
        >
          TryHackMe profile
          <Arrow diagonal />
        </a>
      </div>
      <div
        className="section-heading"
        style={{ marginTop: 70, marginBottom: 0 }}
      >
        <div>
          <p className="eyebrow">COMPETITION EXPERIENCE</p>
          <h2>
            Learning under
            <br />
            <em>a different kind of pressure.</em>
          </h2>
        </div>
      </div>
      <div className="ranking-list">
        {results.map((item) => (
          <article className="ranking-row" key={item.name}>
            <div>
              <h3>{item.name}</h3>
              {item.details ? (
                <p className="ranking-detail">{item.details}</p>
              ) : null}
            </div>
            <span>{item.result}</span>
          </article>
        ))}
      </div>
      <p className="rank-caption">
        Selected competition results and participation milestones.
      </p>
      <p className="subpage-lead">
        Additional participation includes BRK CYS CTF 2026, AI Odyssey on
        TryHackMe, SecLeaf CTF, KITCTF, Black Hat MENA CTF v2, and Cyber Warrior
        v1 & v2.
      </p>
    </div>
  );
}
