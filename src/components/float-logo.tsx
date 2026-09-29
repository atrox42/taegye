"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { CanvasLogo } from "@/components/canvas-logo";
import { SITE_NAME } from "@/lib/site";

function isChromeOpen() {
  const introDone = document.documentElement.dataset.intro === "done";
  const desktop = window.matchMedia("(min-width: 768px)").matches;
  const splashOpen =
    !introDone &&
    !desktop &&
    Boolean(document.querySelector(".site-splash:not(.is-out)"));
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

    let footerInView = false;
    const syncHide = () => {
      logo.classList.toggle("is-hidden", isChromeOpen() || footerInView);
    };

    syncHide();
    const mo = new MutationObserver(syncHide);
    mo.observe(document.documentElement, { attributes: true, subtree: true, childList: true });

    const footer = document.querySelector(".site-footer");
    let io: IntersectionObserver | undefined;
    if (footer) {
      io = new IntersectionObserver(
        ([entry]) => {
          footerInView = Boolean(entry?.isIntersecting);
          syncHide();
        },
        { threshold: 0.35 },
      );
      io.observe(footer);
    }

    return () => {
      mo.disconnect();
      io?.disconnect();
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
