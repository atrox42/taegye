import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-5 pt-28 pb-24 sm:px-6">
      <p className="text-[11px] lowercase tracking-[0.14em]">404</p>
      <Link
        href="/"
        className="mt-6 inline-block text-[11px] lowercase tracking-[0.14em] hover:opacity-50"
      >
        home
      </Link>
    </div>
  );
}
