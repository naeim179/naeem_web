import LabCard from "./LabCard";

const labs = [
  {
    title: "Wazuh Detection Lab",
    description:
      "Hands-on Blue Team lab focused on SIEM deployment, log collection, alert monitoring, and detection engineering.",
    tools: [
      "Wazuh",
      "Linux",
      "SIEM",
      "Detection Rules",
    ],
  },
  {
    title: "Splunk Investigation Lab",
    description:
      "Security investigation workflow using log searching, event correlation, and threat hunting techniques.",
    tools: [
      "Splunk",
      "SPL",
      "Threat Hunting",
    ],
  },
  {
    title: "Active Directory Security Lab",
    description:
      "Practice environment for understanding Windows security, authentication events, and defensive monitoring.",
    tools: [
      "Windows",
      "Active Directory",
      "Security Logs",
    ],
  },
];

export default function Labs() {
  return (
    <section className="container py-20">
      <div className="mb-10">
        <p className="font-mono text-sm text-green-400">
          &gt; security_labs
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Hands-on Labs
        </h2>

        <p className="mt-3 max-w-2xl text-slate-400">
          Practical cybersecurity environments built to improve
          defensive security and SOC investigation skills.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {labs.map((lab) => (
          <LabCard
            key={lab.title}
            {...lab}
          />
        ))}
      </div>
    </section>
  );
}
