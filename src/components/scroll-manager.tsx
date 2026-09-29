"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

function isPdp(pathname: string) {
  return /^\/new\/[^/]+\/?$/.test(pathname);
}

function scrollWindowToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function syncHairline() {
  document.documentElement.style.setProperty("--grid-hairline", "1px");
}

/** Device-pixel hairlines + PDP always opens at scroll 0. */
export function ScrollManager() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    try {
      history.scrollRestoration = "manual";
    } catch {
      /* ignore */
    }
    syncHairline();
    window.addEventListener("resize", syncHairline, { passive: true });
    window.visualViewport?.addEventListener("resize", syncHairline);
    return () => {
      window.removeEventListener("resize", syncHairline);
      window.visualViewport?.removeEventListener("resize", syncHairline);
    };
  }, []);

  useLayoutEffect(() => {
    if (!isPdp(pathname)) return;
    scrollWindowToTop();
    const a = window.requestAnimationFrame(scrollWindowToTop);
    const b = window.setTimeout(scrollWindowToTop, 0);
    return () => {
      window.cancelAnimationFrame(a);
      window.clearTimeout(b);
    };
  }, [pathname]);

  return null;
}
