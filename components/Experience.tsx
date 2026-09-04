export default function Experience() {
  return (
    <section className="container py-20">
      <div className="glass-card p-8">
        <p className="font-mono text-sm text-green-400">
          &gt; experience_log
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Cybersecurity Experience
        </h2>

        <div className="mt-6">
          <h3 className="text-xl font-bold text-sky-400">
            Cybersecurity Trainee
          </h3>

          <p className="mt-2 text-slate-400">
            National Cyber Security Center (NCSCJO) /
            Skidz Training — Masar Cybersecurity Field Training Program
          </p>

          <p className="mt-2 font-mono text-sm text-green-400">
            200 Hours | 8 Weeks
          </p>

          <ul className="mt-5 space-y-3 text-slate-300">
            <li>
              ✓ Configured Wazuh SIEM for log collection and alerting
            </li>
            <li>
              ✓ Investigated Apache logs, Bash history, and security alerts
            </li>
            <li>
              ✓ Practiced attack investigation and remediation workflows
            </li>
            <li>
              ✓ Created basic detection logic for common web attacks
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
