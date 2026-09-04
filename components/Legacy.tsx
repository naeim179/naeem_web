import LegacyCard from "./LegacyCard";

const legacyItems = [
  {
    title: "CTF Journey",
    description:
      "A collection of cybersecurity challenges covering exploitation, investigation, and problem solving.",
    skills: [
      "Web Security",
      "Forensics",
      "Crypto",
      "Reverse Engineering",
    ],
  },
  {
    title: "Writeups Archive",
    description:
      "Technical writeups documenting previous challenges, methodologies, and security research notes.",
    skills: [
      "Recon",
      "Enumeration",
      "Exploitation",
    ],
  },
  {
    title: "TryHackMe Experience",
    description:
      "Hands-on practice through guided cybersecurity rooms and practical security scenarios.",
    skills: [
      "Linux",
      "Networking",
      "Security Basics",
    ],
  },
];

export default function Legacy() {
  return (
    <section className="container py-20">
      <div className="mb-10">
        <p className="font-mono text-sm text-green-400">
          &gt; my_legacy_work
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Cybersecurity Journey
        </h2>

        <p className="mt-3 max-w-2xl text-slate-400">
          Previous cybersecurity work, CTF challenges, and technical
          writeups that shaped my Blue Team journey.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {legacyItems.map((item) => (
          <LegacyCard
            key={item.title}
            {...item}
          />
        ))}
      </div>

      <div className="mt-10">
        <a
          href="/legacy/ctf-portfolio"
          className="inline-block rounded-lg border border-green-500 px-5 py-3 font-mono text-sm text-green-400 transition hover:bg-green-500 hover:text-black"
        >
          Open Legacy Archive →
        </a>
      </div>
    </section>
  );
}
