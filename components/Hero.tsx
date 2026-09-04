export default function Hero() {
  return (
    <section className="container flex min-h-screen items-center pt-32">
      <div className="grid w-full gap-10 md:grid-cols-2">
        <div className="flex flex-col justify-center">
          <p className="mb-4 font-mono text-sm text-green-400">
            &gt; cybersecurity analyst portfolio
          </p>

          <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
            Naim
            <br />
            <span className="text-sky-400">
              Cybersecurity Analyst
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
            Focused on SOC operations, SIEM monitoring, incident response,
            threat detection, and security research through hands-on labs.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/reports"
              className="rounded-lg bg-green-500 px-6 py-3 font-medium text-black transition hover:bg-green-400"
            >
              View Reports
            </a>

            <a
              href="/labs"
              className="rounded-lg border border-slate-700 px-6 py-3 font-medium text-white transition hover:border-sky-400 hover:text-sky-400"
            >
              Explore Labs
            </a>
          </div>

          <div className="mt-8 flex items-center gap-3 font-mono text-sm text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Available for cybersecurity opportunities
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="glass-card w-full max-w-md p-6 font-mono text-sm text-slate-300">
            <p className="text-green-400">$ system_status</p>

            <div className="mt-4 space-y-3">
              <p>
                <span className="text-sky-400">role:</span> SOC Analyst
              </p>

              <p>
                <span className="text-sky-400">focus:</span> Blue Team
              </p>

              <p>
                <span className="text-sky-400">tools:</span> Splunk, Wazuh, ELK
              </p>

              <p>
                <span className="text-sky-400">status:</span>{" "}
                <span className="text-green-400">monitoring</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
