"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { CanvasLogo } from "@/components/canvas-logo";
import { SITE_NAME } from "@/lib/site";

function isChromeOpen() {
  const introDone = document.documentElement.dataset.intro === "done";
  const desktop = window.matchMedia("(min-width: 768px)").matches;
  const splash = document.querySelector(".site-splash");
  const splashOpen =
    !introDone &&
    !desktop &&
    splash instanceof HTMLElement &&
    getComputedStyle(splash).display !== "none";
  return Boolean(
    splashOpen ||
      document.querySelector(".site-promo") ||
      document.querySelector(".site-header.is-open"),
  );
}

/** Viewport-fixed mobile mark. Canvas ink stays black under Force Dark; no dock plate. */
export function FloatLogo() {
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    let overFooter = false;
    const syncHide = () => {
      const el = logoRef.current;
      const footer = document.querySelector(".site-footer");
      if (el && footer) {
        const lr = el.getBoundingClientRect();
        const fr = footer.getBoundingClientRect();
        overFooter = fr.top < lr.bottom - 4 && fr.bottom > lr.top + 4;
      }
      logo.classList.toggle("is-hidden", isChromeOpen() || overFooter);
    };

    syncHide();
    const mo = new MutationObserver(syncHide);
    mo.observe(document.documentElement, { attributes: true, subtree: true, childList: true });
    window.addEventListener("scroll", syncHide, { passive: true });
    window.addEventListener("resize", syncHide, { passive: true });

    return () => {
      mo.disconnect();
      window.removeEventListener("scroll", syncHide);
      window.removeEventListener("resize", syncHide);
    };
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
