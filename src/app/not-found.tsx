import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-page site-gutter pt-10 pb-24 sm:pt-28">
      <p className="text-[11px] tracking-[var(--tracking-label-lg)]">404</p>
      <Link
        href="/"
        className="mt-6 inline-block text-[11px] tracking-[var(--tracking-label-lg)] hover:opacity-50"
      >
        Home
      </Link>
    </div>
  );
}
