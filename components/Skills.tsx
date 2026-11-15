import { skillGroups } from "@/lib/portfolio";
export default function Skills() {
  return (
    <section className="skills-section">
      <div className="wrap">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow">04 / TOOLKIT</p>
            <h2>
              A practical
              <br />
              <em>set of tools.</em>
            </h2>
          </div>
          <p>
            Skills I use, alongside the foundations
            <br />
            I’m continuing to develop.
          </p>
        </div>
        <div className="skills-grid">
          {skillGroups.map((group) => (
            <article key={group.title} data-reveal>
              <span className="skill-number">{group.number}</span>
              <h3>{group.title}</h3>
              <p>{group.text}</p>
              <ul>
                {group.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
