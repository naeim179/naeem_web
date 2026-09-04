export default function Certifications() {
  const certifications = [
    "Masar Cybersecurity Field Training Program - NCSCJO",
    "Certified Associate Penetration Tester (CAPT) - Hackviser",
    "Red Hat System Administration I (RH124)",
    "Red Hat System Administration II (RH134)",
    "CCNA Training - 60 Hours",
    "CEH Training - 40 Hours",
    "ISC2 Candidate",
  ];

  return (
    <section className="container py-20">
      <div className="glass-card p-8">
        <p className="font-mono text-sm text-green-400">
          &gt; certifications
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Certifications & Training
        </h2>

        <ul className="mt-6 space-y-3 text-slate-300">
          {certifications.map((cert) => (
            <li key={cert}>
              ✓ {cert}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
