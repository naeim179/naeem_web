const links = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Reports",
    href: "/reports",
  },
  {
    name: "Labs",
    href: "/labs",
  },
  {
    name: "Legacy",
    href: "/legacy",
  },
];

const externalLinks = [
  {
    name: "GitHub",
    href: "https://github.com/naeim179",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/naeim-althabata-427331316",
  },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full">
      <nav className="container mt-4">
        <div className="glass-card flex items-center justify-between px-6 py-4">
          <a
            href="/"
            className="font-mono text-lg font-bold tracking-wide text-white"
          >
            <span className="text-green-400">&gt;</span> Naim
          </a>

          <div className="hidden items-center gap-5 md:flex">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-slate-300 transition hover:text-green-400"
              >
                {link.name}
              </a>
            ))}

            {externalLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sky-400 transition hover:text-sky-300"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            ONLINE
          </div>
        </div>
      </nav>
    </header>
  );
}
