"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Arrow, Mark } from "./Icons";
const links = [
  { href: "/#work", label: "Selected work" },
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#credentials", label: "Credentials" },
  { href: "/writeups", label: "Writeups" },
];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link
          href="/"
          className="brand"
          aria-label="Naim Althabatah — home"
          onClick={() => setOpen(false)}
        >
          <span className="brand-mark">
            <Mark />
          </span>
          <span>
            NAIM<span className="brand-dot">.</span>
          </span>
        </Link>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
        <nav
          id="primary-nav"
          className={`primary-nav${open ? " is-open" : ""}`}
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={link.href === path ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#hire"
            className="nav-contact"
            onClick={() => setOpen(false)}
          >
            Hire me <Arrow diagonal />
          </Link>
        </nav>
      </div>
    </header>
  );
}
