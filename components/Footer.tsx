import Link from "next/link";
import { Mark } from "./Icons";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <Link
          href="/"
          aria-label="Naim Althabatah — home"
          className="footer-brand"
        >
          <Mark />
          <span>Naim Althabatah</span>
        </Link>
        <p>Security mindset. Builder’s perspective.</p>
        <span>© {new Date().getFullYear()} Naim Althabatah</span>
        <a href="#top" className="back-top">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
