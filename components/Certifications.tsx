import { certifications } from "@/lib/portfolio";
import { Arrow } from "./Icons";
export default function Certifications() {
  return (
    <section id="credentials" className="section wrap">
      <div className="section-heading" data-reveal>
        <div>
          <p className="eyebrow">05 / CREDENTIALS</p>
          <h2>
            A foundation.
            <br />
            <em>Always expanding.</em>
          </h2>
        </div>
        <p>
          Professional certifications and completed training,
          <br />
          with links to the corresponding credentials.
        </p>
      </div>
      <div className="credentials-grid">
        {certifications.map((cert, index) => (
          <article
            className={
              index === 0 ? "credential credential-featured" : "credential"
            }
            key={cert.title}
            data-reveal
          >
            <div className="credential-top">
              <span>{cert.type}</span>
              <span aria-hidden="true">
                {index === 0 ? "AWS" : String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div>
              <p className="eyebrow">{cert.issuer}</p>
              <h3>{cert.title}</h3>
              <p>{cert.detail}</p>
              {"verification" in cert ? (
                <p className="verification-id">
                  Verification ID: {cert.verification}
                </p>
              ) : null}
            </div>
            <a
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              {index === 0 ? "Verify with AWS" : "View credential"}
              <Arrow diagonal />
            </a>
          </article>
        ))}
      </div>
      <p className="credential-footnote">
        Also: ISC2 Candidate · Candidate status, not a professional
        certification.
      </p>
    </section>
  );
}
