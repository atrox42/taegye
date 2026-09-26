"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { LOGO_SRC, SITE_NAME } from "@/lib/site";

function isChromeOpen() {
  return Boolean(
    document.querySelector(".site-splash") ||
      document.querySelector(".site-promo") ||
      document.querySelector(".site-header.is-open"),
  );
}

export function FloatLogo() {
  const logoRef = useRef<HTMLAnchorElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const logo = logoRef.current;
    const slot = slotRef.current;
    if (!logo || !slot) return;

    const update = () => {
      logo.classList.toggle("is-hidden", isChromeOpen());
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      const logoH = logo.offsetHeight || (desktop ? 77 : 62);
      const padTop = parseFloat(getComputedStyle(slot).paddingTop) || 52;
      const dockLine = window.innerHeight - 24 - logoH;
      logo.classList.toggle("is-docked", slot.getBoundingClientRect().top + padTop <= dockLine);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, subtree: true, childList: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="site-float-dock" ref={slotRef}>
      <Link ref={logoRef} href="/" className="site-float-logo" aria-label={`${SITE_NAME} home`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- JPEG wordmark on a white plate */}
        <img src={LOGO_SRC} alt="" width={598} height={384} />
      </Link>
    </div>
  );
}
