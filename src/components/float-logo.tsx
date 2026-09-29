"use client";

import Link from "next/link";

import { CanvasLogo } from "@/components/canvas-logo";
import { SITE_NAME } from "@/lib/site";

/** In-flow mobile mark above the footer. Canvas ink stays black under Force Dark. */
export function FloatLogo() {
  return (
    <div className="site-float-dock">
      <Link href="/" className="site-float-logo" aria-label={`${SITE_NAME} home`}>
        <CanvasLogo
          src="/logo-taegye.png"
          alt=""
          width={67}
          height={43}
          align="center"
          className="site-float-logo-mark"
        />
      </Link>
    </div>
  );
}
