const skills = [
  {
    title: "SIEM & Monitoring",
    items: ["Splunk", "Wazuh", "ELK"],
  },
  {
    title: "Security Operations",
    items: [
      "Alert Triage",
      "Incident Response",
      "Threat Hunting",
    ],
  },
  {
    title: "Security Analysis",
    items: [
      "Log Analysis",
      "IOC Investigation",
      "Attack Analysis",
    ],
  },
  {
    title: "Technical Skills",
    items: [
      "Linux",
      "Networking",
      "Python Basics",
    ],
  },
];

export default function Skills() {
  return (
    <section className="container py-20">
      <div className="mb-10">
        <p className="font-mono text-sm text-green-400">
          &gt; security_skills
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Skills & Tools
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {skills.map((skill) => (
          <div
            key={skill.title}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-bold text-white">
              {skill.title}
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {skill.items.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-slate-700 px-3 py-1 text-sm text-sky-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
