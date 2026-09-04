import Link from "next/link";

const reports = [
  {
    slug: "wazuh-lab",
    title: "Wazuh SIEM Attack & Defense Lab",
    type: "Blue Team Report",
    description:
      "A defensive security lab covering SIEM monitoring, attack simulation, detection, investigation, and response.",
    tools: ["Wazuh", "Linux", "SIEM"],
  },
  {
    slug: "phishing-investigation",
    title: "Phishing Investigation",
    type: "Incident Response Report",
    description:
      "SOC-style investigation covering phishing analysis, IOC extraction, and threat investigation.",
    tools: ["Splunk", "IOC", "Threat Hunting"],
  },
];

export default function ReportsPage() {
  return (
    <main className="container min-h-screen py-32">
      <p className="font-mono text-sm text-green-400">
        &gt; security_reports
      </p>

      <h1 className="mt-3 text-4xl font-bold text-white">
        My Reports
      </h1>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <div
            key={report.slug}
            className="glass-card p-6"
          >
            <p className="font-mono text-sm text-green-400">
              {report.type}
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">
              {report.title}
            </h2>

            <p className="mt-4 text-slate-400">
              {report.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {report.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded border border-slate-700 px-3 py-1 text-xs text-sky-400"
                >
                  {tool}
                </span>
              ))}
            </div>

            <Link
              href={`/reports/${report.slug}`}
              className="mt-6 inline-block text-green-400 hover:text-green-300"
            >
              Read Report →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
