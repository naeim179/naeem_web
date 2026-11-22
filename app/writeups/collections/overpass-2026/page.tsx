import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/Icons";
import WriteupLibrary from "@/components/writeups/WriteupLibrary";
import { overpassResult as event } from "@/lib/competitions";
import { writeups } from "@/lib/writeups";

const entries = writeups.filter(entry => entry.collectionId === event.collectionId);
export const metadata: Metadata = {
  title: "OVERPASS 2026 — Qualifiers & Writeups",
  description: "IV LEGION qualified for the OVERPASS 2026 finals: 11th of 104 teams, 3,207 points, and 24 of 41 challenges solved. Explore Naim Althabatah’s challenge writeups.",
};

export default function OverpassCollectionPage() {
  return (
    <div className="wrap subpage competition-page">
      <Link href="/writeups" className="back-link">← All writeups</Link>
      <header className="competition-heading">
        <p className="eyebrow">OVERPASS / QUALIFIERS / 20 NOVEMBER 2026</p>
        <h1>A place in<br /><em>the finals.</em></h1>
        <p className="subpage-lead">
          {event.name} by {event.organizer}. Competing as {event.team}, we finished
          11th out of 104 teams and qualified for the finals. These are my
          writeups from the qualifying event.
        </p>
        <div className="competition-links">
          <span className="competition-status">Qualified for the finals</span>
          <a href={event.eventUrl} className="text-link" target="_blank" rel="noopener noreferrer">
            Event website <Arrow diagonal />
          </a>
        </div>
      </header>
      <dl className="competition-stats" aria-label="IV LEGION qualifying team result">
        <div><dt>TEAM PLACEMENT</dt><dd>{event.teamRank}th <small>/ {event.totalTeams}</small></dd></div>
        <div><dt>TEAM POINTS</dt><dd>{event.teamPoints.toLocaleString("en-US")}</dd></div>
        <div><dt>TEAM SOLVES</dt><dd>{event.teamSolves} <small>/ {event.totalChallenges}</small></dd></div>
      </dl>
      <p className="competition-caption">Qualifying-stage team results. This is not a finals placement or an individual solve count.</p>
      <section className="competition-casefiles" aria-labelledby="competition-casefiles-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE INVESTIGATIONS</p>
            <h2 id="competition-casefiles-title">Challenge <em>writeups.</em></h2>
          </div>
          <p>{entries.length} published {entries.length === 1 ? "casefile" : "casefiles"}</p>
        </div>
        {entries.length ? (
          <WriteupLibrary entries={entries} collections={[{id: event.collectionId, label: event.name}]} categories={[...new Set(entries.map(entry => entry.category))].sort()} />
        ) : (
          <p className="subpage-lead">The challenge writeups will appear here as they are published.</p>
        )}
      </section>
      <div className="library-end">
        <p>More investigations, from other competitions.</p>
        <Link href="/writeups" className="text-link">Explore the full library <Arrow /></Link>
      </div>
    </div>
  );
}
