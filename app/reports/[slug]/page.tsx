import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { reports } from "@/lib/reports";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(reports).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const report = Object.entries(reports).find(([key]) => key === slug)?.[1];
  return {
    title: report?.title ?? "Report not found",
    description: report?.summary,
  };
}
export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = Object.entries(reports).find(([key]) => key === slug)?.[1];
  if (!report) notFound();
  return (
    <article className="wrap subpage">
      <Link href="/reports" className="back-link">
        ← All reports & notes
      </Link>
      <p className="eyebrow">{report.type}</p>
      <h1>{report.title}</h1>
      <p className="subpage-lead">{report.summary}</p>
      <div className="case-body">
        <h2>
          Notes from
          <br />
          <em>the investigation.</em>
        </h2>
        <div>
          {report.sections.map((section) => (
            <section key={section.heading}>
              <h3>{section.heading}</h3>
              <p>{section.body}</p>
            </section>
          ))}
          <p className="case-note">{report.note}</p>
        </div>
      </div>
      <Link href="/labs" className="text-link">
        Explore the security labs →
      </Link>
    </article>
  );
}
