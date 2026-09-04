import ProjectCard from "./ProjectCard";

const projects = [
  {
    title: "Real-World Attack & Defense Simulation Lab",
    category: "BLUE TEAM LAB",
    description:
      "Multi-VM cybersecurity lab focused on attack simulation, SIEM monitoring, log analysis, detection engineering, and remediation validation.",
    tools: [
      "Wazuh",
      "Linux",
      "Apache Logs",
      "Detection",
    ],
  },
  {
    title: "QRShield - AI QR Code Security Analyzer",
    category: "SECURITY PROJECT",
    description:
      "AI-powered QR security analyzer that evaluates QR payloads, calculates risk scores, and generates security reports.",
    tools: [
      "Python",
      "FastAPI",
      "Security Analysis",
    ],
  },
  {
    title: "My Legacy Work",
    category: "CTF RESEARCH",
    description:
      "Cybersecurity journey including CTF challenges, writeups, web exploitation, forensics, crypto, and reverse engineering.",
    tools: [
      "CTF",
      "Web",
      "Forensics",
      "Reverse",
    ],
  },
];

export default function FeaturedWork() {
  return (
    <section className="container py-20">
      <div className="mb-10">
        <p className="font-mono text-sm text-green-400">
          &gt; featured_security_work
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Security Projects
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.title}
            {...project}
          />
        ))}
      </div>
    </section>
  );
}
