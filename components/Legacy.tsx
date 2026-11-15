import Link from "next/link";
import { Arrow } from "./Icons";
export default function Legacy({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "library-section" : ""}>
      <div
        className={compact ? "wrap library-banner" : "library-banner"}
        data-reveal
      >
        <div>
          <p className="eyebrow">06 / NOTES FROM THE FIELD</p>
          <h2>
            Challenges solved.
            <br />
            <em>Lessons kept.</em>
          </h2>
          <p>
            Technical writeups across web security, cryptography, forensics,
            reverse engineering, and more. A record of how I approach unfamiliar
            problems.
          </p>
          <Link
            href={compact ? "/legacy" : "/archive/wrup/index.html"}
            className="text-link"
          >
            {compact ? "Explore the writeups" : "Open the writeup library"}
            <Arrow diagonal />
          </Link>
        </div>
        <div className="library-art" aria-hidden="true">
          <div>
            <span>RESEARCH & WRITEUPS</span>
            <span>↗</span>
          </div>
          <div>
            <span>01 — WEB SECURITY</span>
            <span>HTTP / JWT / SSTI</span>
          </div>
          <div>
            <span>02 — FORENSICS</span>
            <span>EVIDENCE / ANALYSIS</span>
          </div>
          <div>
            <span>03 — REVERSE ENGINEERING</span>
            <span>GHIDRA / GDB</span>
          </div>
          <div>
            <span>04 — CRYPTOGRAPHY</span>
            <span>LOGIC / CIPHERS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
