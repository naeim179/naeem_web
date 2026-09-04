export default function Navbar() {
  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Labs", href: "/labs" },
    { name: "Reports", href: "/reports" },
    { name: "Legacy", href: "/legacy" },
    { name: "Contact", href: "/contact" },
  ];

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

          <div className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-slate-300 transition hover:text-green-400"
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