"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { CanvasLogo } from "@/components/canvas-logo";
import { SITE_NAME } from "@/lib/site";

function isChromeOpen() {
  const introDone = document.documentElement.dataset.intro === "done";
  const desktop = window.matchMedia("(min-width: 768px)").matches;
  const splash = document.querySelector(".site-splash:not(.is-out)");
  const splashOpen = !introDone && !desktop && Boolean(splash);
  return Boolean(
    splashOpen ||
      document.querySelector(".site-promo") ||
      document.querySelector(".site-header.is-open"),
  );
}

/**
 * Viewport-fixed mark (pre-PR 90 / 7d587bf). Stays visible over the footer
 * edge. Canvas ink; no dock plate or box edges. Hidden only for splash/promo/menu.
 */
export function FloatLogo() {
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    const syncHide = () => {
      logo.classList.toggle("is-hidden", isChromeOpen());
    };

    syncHide();
    const mo = new MutationObserver(syncHide);
    mo.observe(document.documentElement, { attributes: true, subtree: true, childList: true });
    return () => mo.disconnect();
  }, []);

  return (
    <Link ref={logoRef} href="/" className="site-float-logo" aria-label={`${SITE_NAME} home`}>
      <CanvasLogo
        src="/logo-taegye.png"
        alt=""
        width={67}
        height={43}
        align="center"
        className="site-float-logo-mark"
      />
    </Link>
  );
}
