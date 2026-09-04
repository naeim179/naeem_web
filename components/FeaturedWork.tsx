import ProjectCard from "./ProjectCard";

const projects = [
  {
    title: "Wazuh SIEM Attack & Defense Lab",
    category: "Security Lab",
    description:
      "Built a defensive security lab focused on SIEM monitoring, attack simulation, detection, and remediation.",
    tools: ["Wazuh", "Linux", "SIEM", "Detection"],
  },
  {
    title: "Phishing Investigation",
    category: "Incident Response",
    description:
      "SOC-style investigation of a phishing attack using log analysis, IOC extraction, and threat analysis.",
    tools: ["Splunk", "IOC", "Threat Hunting"],
  },
  {
    title: "My Legacy Work",
    category: "CTF Research",
    description:
      "Previous cybersecurity journey including web exploitation, forensics, crypto, and reverse engineering challenges.",
    tools: ["CTF", "Web", "Forensics"],
  },
];

export default function FeaturedWork() {
  return (
    <section className="container py-20">
      <div className="mb-10">
        <p className="font-mono text-sm text-green-400">
          &gt; featured_work
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
