type ReportCardProps = {
  title: string;
  type: string;
  description: string;
  tools: string[];
};

export default function ReportCard({
  title,
  type,
  description,
  tools,
}: ReportCardProps) {
  return (
    <div className="glass-card p-6 transition hover:-translate-y-1 hover:border-green-400">
      <p className="font-mono text-sm text-green-400">
        {type}
      </p>

      <h3 className="mt-3 text-xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-slate-400">
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

      <button className="mt-6 rounded-lg border border-green-500 px-4 py-2 font-mono text-sm text-green-400 transition hover:bg-green-500 hover:text-black">
        View Report →
      </button>
    </div>
  );
}
