type LegacyCardProps = {
  title: string;
  description: string;
  skills: string[];
};

export default function LegacyCard({
  title,
  description,
  skills,
}: LegacyCardProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-4 text-slate-400">
        {description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded border border-slate-700 px-3 py-1 text-xs text-green-400"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
