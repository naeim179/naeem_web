import type { Metadata } from "next";
import Link from "next/link";
import { reports } from "@/lib/reports";
import { Arrow } from "@/components/Icons";
export const metadata: Metadata = { title: "Security Reports & Notes" };
export default function ReportsPage() {
  return (
    <div className="wrap subpage">
      <Link href="/" className="back-link">
        ← Back to portfolio
      </Link>
      <p className="eyebrow">SECURITY REPORTS & NOTES</p>
      <h1>
        Follow the evidence.
        <br />
        <em>Document the learning.</em>
      </h1>
      <p className="subpage-lead">
        Concise lab summaries and learning workflows, with the scope of each
        clearly identified.
      </p>
      <div className="collection-grid">
        {Object.entries(reports).map(([slug, report]) => (
          <article key={slug} className="collection-card">
            <p className="eyebrow">{report.type}</p>
            <h2>{report.title}</h2>
            <p>{report.summary}</p>
            <Link className="text-link" href={`/reports/${slug}`}>
              Read the overview
              <Arrow diagonal />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
