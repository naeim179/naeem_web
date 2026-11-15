import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/Icons";
export const metadata: Metadata = { title: "Security Labs" };
export default function LabsPage() {
  return (
    <div className="wrap subpage">
      <Link href="/" className="back-link">
        ← Back to portfolio
      </Link>
      <p className="eyebrow">HANDS-ON SECURITY</p>
      <h1>
        Understand the attack.
        <br />
        <em>Improve the defense.</em>
      </h1>
      <p className="subpage-lead">
        Controlled environments for web attack simulation, monitoring, and
        investigation. The documented work centers on Wazuh, Linux, and Apache
        logs.
      </p>
      <div className="collection-grid">
        <article className="collection-card">
          <p className="eyebrow">BLUE TEAM LAB</p>
          <h2>Attack & Defense Simulation</h2>
          <p>
            Multi-VM security practice, evidence correlation, and mitigation
            retesting.
          </p>
          <Link href="/work/attack-defense-lab" className="text-link">
            Explore the lab
            <Arrow diagonal />
          </Link>
        </article>
        <article className="collection-card">
          <p className="eyebrow">LAB NOTES</p>
          <h2>Wazuh SIEM</h2>
          <p>
            Log collection, investigation workflow, and basic web attack
            detection.
          </p>
          <Link href="/reports/wazuh-lab" className="text-link">
            Read the overview
            <Arrow diagonal />
          </Link>
        </article>
        <article className="collection-card">
          <p className="eyebrow">CONTINUED PRACTICE</p>
          <h2>CTF & Security Research</h2>
          <p>
            Web security, forensics, cryptography, and reverse engineering
            writeups.
          </p>
          <Link href="/legacy" className="text-link">
            Explore the archive
            <Arrow diagonal />
          </Link>
        </article>
      </div>
    </div>
  );
}
