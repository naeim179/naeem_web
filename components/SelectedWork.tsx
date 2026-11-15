"use client";
import Link from "next/link";
import { useState } from "react";
import { projects } from "@/lib/portfolio";
import { Arrow } from "./Icons";
import ProjectVisual from "./ProjectVisual";
const filters = ["All work", "Development", "Security"] as const;
export default function SelectedWork() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All work");
  const visible = projects.filter(
    (project) => filter === "All work" || project.category === filter,
  );
  return (
    <section id="work" className="section wrap">
      <div className="section-heading" data-reveal>
        <div>
          <p className="eyebrow">01 / SELECTED WORK</p>
          <h2>
            Ideas, put
            <br />
            <em>into practice.</em>
          </h2>
        </div>
        <p>
          Real applications. Controlled investigations.
          <br />A closer look at what I build and explore.
        </p>
      </div>
      <div className="filter-row" role="group" aria-label="Filter projects">
        {filters.map((item) => (
          <button
            key={item}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
            <span>
              {item === "All work"
                ? projects.length
                : projects.filter((p) => p.category === item).length}
            </span>
          </button>
        ))}
      </div>
      <div className="work-list" aria-live="polite" aria-atomic="true">
        {visible.map((project) => (
          <article className="work-card" key={project.slug}>
            <Link
              href={`/work/${project.slug}`}
              className="work-art-link"
              aria-label={`View ${project.name} case study`}
            >
              <ProjectVisual kind={project.visual} />
            </Link>
            <div className="work-content">
              <p className="eyebrow">{project.kind}</p>
              <span className="work-name">{project.name}</span>
              <h3>
                <Link href={`/work/${project.slug}`}>{project.title}</Link>
              </h3>
              <p>{project.summary}</p>
              <ul className="tags" aria-label="Technologies">
                {project.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href={`/work/${project.slug}`} className="text-link">
                Explore the project <Arrow diagonal />
              </Link>
              <span className="work-index" aria-hidden="true">
                /{project.number}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
