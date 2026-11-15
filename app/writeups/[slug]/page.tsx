import { categoryLabel } from "@/lib/writeup-labels";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { writeups, getWriteup } from "@/lib/writeups";
import { readWriteup, renderWriteup } from "@/lib/writeup-content";
import { Arrow } from "@/components/Icons";
export const dynamicParams = false;
export function generateStaticParams() {
  return writeups.map((w) => ({ slug: w.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const w = getWriteup(slug);
  return {
    title: w ? `${w.title} — ${w.collection}` : "Writeup not found",
    description: w?.summary,
  };
}
export default async function WriteupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const w = getWriteup(slug);
  if (!w) notFound();
  const document = await readWriteup(w);
  const index = writeups.findIndex((entry) => entry.slug === slug);
  const next = writeups[(index + 1) % writeups.length];
  return (
    <div className="wrap subpage writeup-detail">
      <Link href="/writeups" className="back-link">
        ← All writeups
      </Link>
      <header className="writeup-heading">
        <p className="eyebrow">
          {w.collection} / {categoryLabel(w.category)}
        </p>
        <h1>{w.title}</h1>
        <p className="subpage-lead">{w.summary}</p>
        <div className="writeup-meta">
          {w.difficulty ? <span>{w.difficulty}</span> : null}
          <span>{w.readingMinutes} min read</span>
          {w.date ? (
            <time dateTime={w.date}>
              {new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              }).format(new Date(w.date))}
            </time>
          ) : null}
          {w.points ? <span>{w.points} points</span> : null}
          {w.solves ? <span>{w.solves} solves</span> : null}
        </div>
        <ul className="writeup-tags" aria-label="Skills">
          {w.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </header>
      <div className="writeup-reading">
        <aside className="writeup-toc" aria-label="On this page">
          <div className="writeup-toc-desktop">
            <p className="eyebrow">ON THIS PAGE</p>
            <nav>
              {document.toc.map((item, i) => (
                <a key={item.id} href={`#${item.id}`}>
                  <span>{(i + 1).toString().padStart(2, "0")}</span>
                  {item.title}
                </a>
              ))}
            </nav>
            <a
              className="writeup-source"
              href={`https://github.com/naeim179/naeem_web/blob/main/${w.source}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View source <Arrow diagonal />
            </a>
          </div>
          <details className="writeup-toc-mobile">
            <summary>
              On this page <span aria-hidden="true">↓</span>
            </summary>
            <nav>
              {document.toc.map((item, i) => (
                <a key={item.id} href={`#${item.id}`}>
                  <span>{(i + 1).toString().padStart(2, "0")}</span>
                  {item.title}
                </a>
              ))}
            </nav>
            <a
              className="writeup-source"
              href={`https://github.com/naeim179/naeem_web/blob/main/${w.source}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View source <Arrow diagonal />
            </a>
          </details>
        </aside>
        <article className="writeup-prose">
          {renderWriteup(w, document)}
          {w.slug === "jordansec-the-will" ? (
            <div className="writeup-downloads">
              <h2>Solution files</h2>
              <p>
                The original solver and evidence are preserved in the portfolio
                repository.
              </p>
              <a
                className="text-link"
                href="/writeup-files/jordansec-the-will/sol.py"
                download
              >
                Download the original solver <Arrow />
              </a>
              <a
                className="text-link"
                href="/writeup-files/jordansec-the-will/requirements.txt"
                download
              >
                Download requirements <Arrow />
              </a>
            </div>
          ) : null}
        </article>
      </div>
      <div className="writeup-next">
        <Link href="/writeups" className="text-link">
          Back to the library <Arrow />
        </Link>
        <Link href={`/writeups/${next.slug}`}>
          <span className="eyebrow">KEEP EXPLORING</span>
          <strong>
            {next.title}
            <Arrow diagonal />
          </strong>
        </Link>
      </div>
    </div>
  );
}
