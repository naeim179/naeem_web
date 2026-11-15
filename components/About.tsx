import { profile } from "@/lib/portfolio";
import { Arrow } from "./Icons";
export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="wrap about-grid" data-reveal>
        <div>
          <p className="eyebrow">02 / A LITTLE CONTEXT</p>
          <h2>
            The person
            <br />
            <em>behind the work.</em>
          </h2>
          <a
            className="text-link light"
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            Connect on LinkedIn <Arrow diagonal />
          </a>
        </div>
        <div className="about-copy">
          <p className="about-lead">
            I’m a cybersecurity student and freelance developer who enjoys
            understanding the whole system.
          </p>
          <p>
            My work spans SOC-focused training, hands-on investigations, and
            full-stack development for an educational platform. I’m interested
            in the space where security, useful software, and cloud services
            meet.
          </p>
          <p>
            I learn by building, testing, and documenting what I find. Whether
            it is following an alert through a log file or tracing a payment
            integration, I care about how the pieces fit together.
          </p>
          <div className="education">
            <span className="eyebrow">CURRENTLY STUDYING</span>
            <h3>BSc in Cybersecurity</h3>
            <p>Al al-Bayt University · Mafraq, Jordan</p>
            <span>Sep 2022 — Expected Dec 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
