const experience = [
  {
    date: "2026",
    duration: "APPROX. 4–5 MONTHS",
    role: "Freelance Full-Stack Developer",
    company: "Independent client project",
    subtitle: "Educational platform · Cloud & payment integrations",
    bullets: [
      "Contributed across full-stack development and external service integration.",
      "Connected Supabase, Cloudflare, and PayTabs within the website workflow.",
      "Managed source code with GitHub and resolved integration and configuration issues.",
    ],
  },
  {
    date: "200 HOURS",
    duration: "8-WEEK FIELD TRAINING",
    role: "Cybersecurity Trainee",
    company: "NCSCJO / Skidz Training",
    subtitle: "Masar Cybersecurity Field Training Program",
    bullets: [
      "Practiced SOC monitoring, attack simulation, investigation, and remediation in controlled labs.",
      "Configured Wazuh SIEM and investigated Apache logs, Bash history, and security alerts.",
      "Developed and tested basic detection logic for common web attacks.",
    ],
  },
];
export default function Experience() {
  return (
    <section id="experience" className="section wrap">
      <div className="section-heading" data-reveal>
        <div>
          <p className="eyebrow">03 / EXPERIENCE</p>
          <h2>
            Learning by doing.
            <br />
            <em>Growing through work.</em>
          </h2>
        </div>
        <p>
          Client work and structured training,
          <br />
          with a practical thread running through both.
        </p>
      </div>
      <div className="timeline">
        {experience.map((item) => (
          <article className="experience-row" key={item.role} data-reveal>
            <div className="experience-date">
              <strong>{item.date}</strong>
              <span>{item.duration}</span>
            </div>
            <div>
              <p className="eyebrow">{item.company}</p>
              <h3>{item.role}</h3>
              <p className="experience-subtitle">{item.subtitle}</p>
              <ul>
                {item.bullets.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>
            <span className="timeline-plus" aria-hidden="true">
              ↗
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
