type LabCardProps = {
  title: string;
  description: string;
  tools: string[];
};

export default function LabCard({
  title,
  description,
  tools,
}: LabCardProps) {
  return (
    <div className="glass-card p-6 transition hover:-translate-y-1 hover:border-sky-400">
      <h3 className="text-xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-slate-400">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {tools.map((tool) => (
          <span
            key={tool}
            className="rounded-md border border-slate-700 px-3 py-1 text-xs text-green-400"
          >
            {tool}
          </span>
        ))}
      </div>
    </div>
  );
}
