"use client";

import Link from "next/link";

import { SITE_NAME } from "@/lib/site";

/** In-flow mobile mark above the footer. Transparent PNG stays ink under Force Dark. */
export function FloatLogo() {
  return (
    <Link href="/" className="site-float-logo" aria-label={`${SITE_NAME} home`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- OEM force-dark inverts CSS-mask fills */}
      <img src="/logo-taegye.png" alt="" className="site-float-logo-mark" />
    </Link>
  );
}
