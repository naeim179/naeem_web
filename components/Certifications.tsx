import { certifications } from "@/lib/portfolio";
import { tvxCtfResult } from "@/lib/competitions";
import Image from "next/image";
import Link from "next/link";
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
          Professional certifications, training, and competition achievements,
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
      <article
        id="tvx-certificate"
        className="competition-credential"
        aria-labelledby="tvx-certificate-title"
        data-reveal
      >
        <a
          className="competition-credential-preview"
          href={tvxCtfResult.certificate.pdf}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View Naim Althabata’s TVX CTF certificate as a PDF in a new tab"
        >
          <Image
            src={tvxCtfResult.certificate.preview}
            width={tvxCtfResult.certificate.width}
            height={tvxCtfResult.certificate.height}
            alt="TVX CTF Certificate of Achievement awarded to Naim Althabata of IV LEGION, confirming 31st place and 2,110 team points"
            unoptimized
          />
        </a>
        <div className="competition-credential-details">
          <p className="eyebrow">Competition achievement</p>
          <h3 id="tvx-certificate-title">
            {tvxCtfResult.name}
            <br />
            {tvxCtfResult.certificate.title}
          </h3>
          <p className="competition-credential-issued">
            {tvxCtfResult.certificate.issuer} ·{" "}
            <time dateTime={tvxCtfResult.certificate.issuedOn}>13 Nov 2026</time>
          </p>
          <dl className="competition-credential-result">
            <div><dt>Final placement</dt><dd>{tvxCtfResult.teamRank}st</dd></div>
            <div><dt>Team points</dt><dd>{tvxCtfResult.teamPoints.toLocaleString("en-US")}</dd></div>
            <div><dt>Team</dt><dd>{tvxCtfResult.team}</dd></div>
          </dl>
          <div className="competition-credential-actions">
            <a href={tvxCtfResult.certificate.pdf} download="Naim-Althabata-TVX-CTF-Certificate.pdf" className="text-link">
              Download certificate <Arrow diagonal />
            </a>
            <Link href="/writeups/tvx-ending" className="text-link">
              Read TVX case study <Arrow diagonal />
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}
