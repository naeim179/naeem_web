export default function Footer() {
  return (
    <footer className="container py-10">
      <div className="glass-card flex flex-col gap-4 p-6 text-center">
        <p className="font-mono text-green-400">
          &gt; system_exit
        </p>

        <h3 className="text-xl font-bold text-white">
          Naim Althabata
        </h3>

        <p className="text-slate-400">
          SOC Trainee | Cybersecurity Practitioner
        </p>

        <div className="flex justify-center gap-5 text-sm">
          <a
            href="https://github.com/naeim179"
            target="_blank"
            className="text-sky-400 hover:text-sky-300"
          >
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/naeim-althabata-427331316"
            target="_blank"
            className="text-sky-400 hover:text-sky-300"
          >
            LinkedIn
          </a>

          <a
            href="https://tryhackme.com/p/NK179"
            target="_blank"
            className="text-sky-400 hover:text-sky-300"
          >
            TryHackMe
          </a>
        </div>

        <p className="text-xs text-slate-500">
          © 2026 Naim Althabata. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
