"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

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

/** Sticky bottom-center mark. No scroll listeners — docking is native CSS. */
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
      <span className="site-float-logo-mark" aria-hidden>
        <span className="site-ink-fill" />
      </span>
    </Link>
  );
}
