type ProjectCardProps = {
  title: string;
  category: string;
  description: string;
  tools: string[];
};

export default function ProjectCard({
  title,
  category,
  description,
  tools,
}: ProjectCardProps) {
  return (
    <div className="glass-card p-6 transition hover:-translate-y-1 hover:border-sky-400">
      <p className="font-mono text-sm text-green-400">
        {category}
      </p>

      <h3 className="mt-3 text-xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-3 text-slate-400">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {tools.map((tool) => (
          <span
            key={tool}
            className="rounded-md border border-slate-700 px-3 py-1 text-xs text-sky-400"
          >
            {tool}
          </span>
        ))}
      </div>
    </div>
  );
}
