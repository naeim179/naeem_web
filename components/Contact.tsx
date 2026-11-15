import { profile } from "@/lib/portfolio";
import { Arrow } from "./Icons";
export default function Contact() {
  return (
    <section id="contact" className="contact-section">
      <div className="wrap contact-grid" data-reveal>
        <div>
          <p className="eyebrow">LET’S CONNECT</p>
          <h2>
            Have something
            <br />
            <em>in mind?</em>
          </h2>
          <p>
            Open to cybersecurity opportunities, development projects,
            <br />
            and conversations that lead somewhere interesting.
          </p>
        </div>
        <div className="contact-links">
          <a href={`mailto:${profile.email}`} className="contact-email">
            {profile.email}
            <Arrow diagonal />
          </a>
          <div>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn <Arrow diagonal />
            </a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              GitHub <Arrow diagonal />
            </a>
            <a
              href={profile.tryhackme}
              target="_blank"
              rel="noopener noreferrer"
            >
              TryHackMe <Arrow diagonal />
            </a>
          </div>
          <a href={profile.resume} className="text-link light" download>
            Download my CV <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
