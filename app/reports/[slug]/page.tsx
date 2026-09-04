const reports = {
  "wazuh-lab": {
    title: "Wazuh SIEM Attack & Defense Lab",
    type: "Blue Team Report",
    overview:
      "A practical security lab focused on SIEM monitoring, attack detection, and defensive response.",
    sections: [
      "Environment Setup",
      "Attack Simulation",
      "Alert Detection",
      "Investigation",
      "Mitigation",
      "Lessons Learned",
    ],
  },

  "phishing-investigation": {
    title: "Phishing Investigation",
    type: "Incident Response Report",
    overview:
      "SOC investigation workflow for analyzing phishing activity and identifying malicious indicators.",
    sections: [
      "Incident Overview",
      "IOC Extraction",
      "Log Analysis",
      "Threat Investigation",
      "Response Actions",
    ],
  },
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const report =
    reports[slug as keyof typeof reports];

  if (!report) {
    return (
      <main className="container py-32 text-white">
        Report not found
      </main>
    );
  }

  return (
    <main className="container min-h-screen py-32">
      <p className="font-mono text-sm text-green-400">
        &gt; {report.type}
      </p>

      <h1 className="mt-4 text-4xl font-bold text-white">
        {report.title}
      </h1>

      <div className="glass-card mt-8 p-8">
        <h2 className="text-xl font-bold text-white">
          Overview
        </h2>

        <p className="mt-4 text-slate-400">
          {report.overview}
        </p>

        <h2 className="mt-8 text-xl font-bold text-white">
          Investigation Flow
        </h2>

        <ul className="mt-4 space-y-3 text-slate-400">
          {report.sections.map((section) => (
            <li key={section}>
              ✓ {section}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
