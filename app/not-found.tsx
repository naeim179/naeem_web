import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap not-found">
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>A different direction.</h1>
      <p>The page you’re looking for is not here.</p>
      <Link href="/" className="button button-ink">
        Back to the portfolio →
      </Link>
    </div>
  );
}
