import Link from "next/link";
import { profile } from "@/lib/portfolio";
import { Arrow } from "./Icons";
export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> CYBERSECURITY × FULL-STACK
            DEVELOPMENT
          </p>
          <h1>
            Naim
            <br />
            <em>Althabatah.</em>
          </h1>
          <p className="hero-description">
            A security mindset.
            <br />A builder’s perspective.
          </p>
          <p className="hero-note">
            I investigate how systems break, and build applications that bring
            people and services together.
          </p>
          <div className="hero-actions">
            <Link href="#work" className="button button-copper">
              Explore my work <Arrow />
            </Link>
            <a href={profile.resume} className="text-link light" download>
              Download CV <Arrow diagonal />
            </a>
          </div>
          <div className="hero-location">
            <span>BASED IN AMMAN, JORDAN</span>
            <span>OPEN TO OPPORTUNITIES</span>
          </div>
        </div>
        <div className="hero-composition">
          <div className="orbit-caption">TWO DISCIPLINES. ONE PERSPECTIVE.</div>
          <div className="orbit-system" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit-cross horizontal" />
            <div className="orbit-cross vertical" />
            <div className="orbit-core">
              N<span>179</span>
            </div>
            <span className="orbit-node node-build">
              BUILD<span>FULL-STACK & CLOUD</span>
            </span>
            <span className="orbit-node node-secure">
              DEFEND<span>SECURITY & INVESTIGATION</span>
            </span>
            <span className="orbit-point" />
          </div>
          <div className="hero-card">
            <span className="aws-monogram">
              aws<span>⌣</span>
            </span>
            <div>
              <small>CERTIFIED FOUNDATION</small>
              <strong>AWS Cloud Practitioner</strong>
              <span>Cloud knowledge. Practical application.</span>
            </div>
            <span className="hero-card-year">2026</span>
          </div>
          <span className="composition-note">
            Curious by nature. Practical by approach.
          </span>
        </div>
      </div>
      <div className="wrap hero-bottom">
        <span>SELECTED PORTFOLIO / 2026</span>
        <Link href="#work">
          SCROLL TO DISCOVER <span aria-hidden="true">↓</span>
        </Link>
      </div>
    </section>
  );
}
