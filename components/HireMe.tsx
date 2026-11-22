import { profile } from "@/lib/portfolio";
import { Arrow } from "./Icons";

const services = [
  {
    number: "01",
    title: "Web development",
    description:
      "Websites and web applications, from a clear interface to the backend and deployment. I can help with new builds, integrations, and improving existing products.",
    examples: "NEXT.JS · TYPESCRIPT · APIS · CLOUD",
    subject: "Web project inquiry",
  },
  {
    number: "02",
    title: "Cybersecurity",
    description:
      "Security-focused code review, configuration checks, and practical findings for systems you own or are authorized to assess. Scope and deliverables are agreed before work begins.",
    examples: "SECURITY REVIEW · HARDENING · REPORTING",
    subject: "Cybersecurity project inquiry",
  },
] as const;

export default function HireMe() {
  return (
    <section id="hire" className="hire-section" aria-labelledby="hire-heading">
      <div className="wrap">
        <div className="hire-heading">
          <div>
            <p className="eyebrow">WORK WITH ME</p>
            <h2 id="hire-heading">Need a hand with your next project?</h2>
          </div>
          <p>
            Tell me what you are building or what you need reviewed. I will help
            define a practical scope and the next steps.
          </p>
        </div>
        <div className="hire-services">
          {services.map((service) => (
            <article className="hire-service" key={service.number}>
              <span className="hire-number">{service.number} / SERVICE</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <span className="hire-examples">{service.examples}</span>
              <a
                href={`mailto:${profile.email}?subject=${encodeURIComponent(service.subject)}`}
                className="hire-link"
              >
                Discuss a project <Arrow diagonal />
              </a>
            </article>
          ))}
        </div>
        <p className="hire-note">
          A useful first message includes your goal, a short description of the
          project, and your preferred timeline.
        </p>
      </div>
    </section>
  );
}
