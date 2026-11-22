import Link from "next/link";
import { overpassResult as event } from "@/lib/competitions";
import { Arrow } from "@/components/Icons";

export default function CompetitionSpotlight() {
  return (
    <aside className="competition-spotlight" aria-label="OVERPASS 2026 qualifying result">
      <div>
        <p className="eyebrow">LATEST COMPETITION / QUALIFIERS</p>
        <h2>{event.name}</h2>
        <p>{event.team} · Qualified for the finals</p>
      </div>
      <p className="competition-spotlight-rank">
        <strong>{event.teamRank}th</strong>
        <span>of {event.totalTeams} teams</span>
      </p>
      <Link href={event.collectionPath} className="text-link">
        Explore the collection <Arrow diagonal />
      </Link>
    </aside>
  );
}
