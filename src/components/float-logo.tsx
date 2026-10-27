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
 * edge. On mobile PDP it lifts clear of the Store button and the sticky bar.
 */
const PDP_LOGO_GAP = 16;

function placePdpLogo(logo: HTMLAnchorElement, probe: HTMLElement) {
  const mobile = window.matchMedia("(max-width: 767.98px)").matches;
  const pdp = document.querySelector(".pdp");
  if (!mobile || !pdp) {
    if (logo.style.bottom) logo.style.bottom = "";
    return;
  }

  const vh = window.innerHeight;
  const store = document.querySelector("[data-pdp-store]");
  const bar = document.querySelector("[data-pdp-buybar]");
  const barOn = bar?.getAttribute("data-pdp-buybar") === "on";
  const storeRect = store?.getBoundingClientRect() ?? null;
  const barRect = barOn && bar ? bar.getBoundingClientRect() : null;
  const storeOnScreen = Boolean(storeRect && storeRect.bottom > 0 && storeRect.top < vh && storeRect.width > 1);

  const parkedEdge = probe.getBoundingClientRect().bottom;
  const logoH = logo.getBoundingClientRect().height || 43;
  const parkedBottom = vh - parkedEdge;

  const gapTo = (bottomPx: number, obstacle: DOMRect) => {
    const logoTop = vh - bottomPx - logoH;
    const logoBottom = vh - bottomPx;
    const overlap = Math.min(logoBottom, obstacle.bottom) - Math.max(logoTop, obstacle.top);
    if (overlap > 0) return -overlap;
    if (logoBottom <= obstacle.top) return obstacle.top - logoBottom;
    return logoTop - obstacle.bottom;
  };
  const inside = (bottomPx: number) => {
    const logoTop = vh - bottomPx - logoH;
    const logoBottom = vh - bottomPx;
    return logoTop >= -0.5 && logoBottom <= vh + 0.5;
  };
  const clearOf = (bottomPx: number) =>
    inside(bottomPx) &&
    !(storeOnScreen && storeRect && gapTo(bottomPx, storeRect) < PDP_LOGO_GAP - 0.5) &&
    !(barRect && gapTo(bottomPx, barRect) < PDP_LOGO_GAP - 0.5);

  let chosen = parkedBottom;
  if (!clearOf(parkedBottom)) {
    const candidates: number[] = [];
    if (storeOnScreen && storeRect) {
      candidates.push(vh - (storeRect.bottom + PDP_LOGO_GAP + logoH));
      candidates.push(vh - (storeRect.top - PDP_LOGO_GAP));
    }
    if (barRect) candidates.push(vh - barRect.top + PDP_LOGO_GAP);
    const viable = candidates.filter((bottomPx) => clearOf(bottomPx));
    if (viable.length) {
      viable.sort((a, b) => Math.abs(a - parkedBottom) - Math.abs(b - parkedBottom));
      chosen = viable[0];
    }
  }

  const next = Number.isFinite(chosen) && Math.abs(chosen - parkedBottom) > 0.5 ? `${Math.round(chosen)}px` : "";
  if (logo.style.bottom !== next) logo.style.bottom = next;
}

export function FloatLogo() {
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    const probe = document.createElement("div");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText =
      "position:fixed;left:0;width:0;height:0;visibility:hidden;pointer-events:none;bottom:calc(92px + var(--pdp-buybar-space, 0px))";
    document.body.appendChild(probe);

    let frame = 0;
    const sync = () => {
      logo.classList.toggle("is-hidden", isChromeOpen());
      placePdpLogo(logo, probe);
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };

    sync();
    const mo = new MutationObserver(schedule);
    mo.observe(document.documentElement, { attributes: true, subtree: true, childList: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      mo.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
      probe.remove();
      logo.style.bottom = "";
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
