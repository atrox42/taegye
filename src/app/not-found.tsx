import Link from "next/link";

import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceWhiteStyle } from "@/lib/force-white";

export default function NotFound() {
  return (
    <div className="site-page site-gutter pt-10 pb-24 sm:pt-28" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
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
