import ReportCard from "./ReportCard";

const reports = [
  {
    title: "Wazuh SIEM Attack & Defense Lab",
    type: "BLUE TEAM REPORT",
    description:
      "A security lab report covering SIEM deployment, attack simulation, alert detection, investigation, and defensive response.",
    tools: [
      "Wazuh",
      "Linux",
      "SIEM",
      "Detection Rules",
    ],
  },
  {
    title: "Phishing Investigation Report",
    type: "INCIDENT RESPONSE REPORT",
    description:
      "SOC-style investigation covering phishing analysis, IOC extraction, log investigation, and threat identification.",
    tools: [
      "Splunk",
      "IOC Analysis",
      "Threat Hunting",
    ],
  },
];

export default function Reports() {
  return (
    <section className="container py-20">
      <div className="mb-10">
        <p className="font-mono text-sm text-green-400">
          &gt; security_reports
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          My Reports
        </h2>

        <p className="mt-3 max-w-2xl text-slate-400">
          Security investigations, labs, and technical reports
          documenting my Blue Team learning journey.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <ReportCard
            key={report.title}
            {...report}
          />
        ))}
      </div>
    </section>
  );
}
