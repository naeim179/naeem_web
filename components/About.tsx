export default function About() {
  return (
    <section className="container py-20">
      <div className="glass-card p-8">
        <p className="font-mono text-sm text-green-400">
          &gt; about_me
        </p>

        <h2 className="mt-3 text-3xl font-bold text-white">
          Who Am I?
        </h2>

        <p className="mt-5 max-w-3xl leading-8 text-slate-400">
          I am a cybersecurity enthusiast focused on defensive security,
          SOC operations, SIEM monitoring, and incident response.
          I enjoy building practical security labs, analyzing attacks,
          and improving my skills through hands-on investigation.
        </p>

        <p className="mt-4 max-w-3xl leading-8 text-slate-400">
          My goal is to grow as a Blue Team professional by combining
          security tools, investigation techniques, and real-world
          defensive practices.
        </p>
      </div>
    </section>
  );
}
