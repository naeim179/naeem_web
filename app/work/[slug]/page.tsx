import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/portfolio";
import { Arrow } from "@/components/Icons";
import ProjectVisual from "@/components/ProjectVisual";
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  return { title: p?.name ?? "Project not found", description: p?.summary };
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return (
    <div className="wrap subpage">
      <Link href="/#work" className="back-link">
        ← All selected work
      </Link>
      <p className="eyebrow">
        {project.kind} / PROJECT {project.number}
      </p>
      <h1>
        {project.name}
        <br />
        <em>{project.title}</em>
      </h1>
      <p className="subpage-lead">{project.summary}</p>
      <dl className="case-meta">
        <div>
          <dt>My contribution</dt>
          <dd>{project.role}</dd>
        </div>
        <div>
          <dt>Context</dt>
          <dd>{project.context}</dd>
        </div>
        <div>
          <dt>Toolkit</dt>
          <dd>{project.stack.join(" · ")}</dd>
        </div>
      </dl>
      <div className="case-visual">
        <ProjectVisual kind={project.visual} />
      </div>
      <p className="rank-caption">
        Conceptual illustration of the project, not a product screenshot.
      </p>
      <div className="case-body">
        <h2>
          The work
          <br />
          <em>behind the project.</em>
        </h2>
        <div>
          <p>{project.overview}</p>
          <h3>What I worked on</h3>
          <ul>
            {project.work.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="case-note">{project.scope}</p>
        </div>
      </div>
      <div className="case-actions">
        {project.repository ? (
          <a
            href={project.repository}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-ink"
          >
            View on GitHub
            <Arrow diagonal />
          </a>
        ) : (
          <Link href="/reports/wazuh-lab" className="button button-ink">
            Read the lab overview
            <Arrow />
          </Link>
        )}
        <Link href="/#work" className="text-link">
          Back to selected work
          <Arrow />
        </Link>
      </div>
    </div>
  );
}
