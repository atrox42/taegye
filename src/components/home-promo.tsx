"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useId, useState } from "react";

import { CanvasColorPlate, CanvasWhitePlate } from "@/components/canvas-white-plate";
import { CanvasText } from "@/components/canvas-text";
import { CanvasX } from "@/components/canvas-x";
import { DIM_BLACK_PNG_SRC } from "@/lib/force-white";
import { HOME_PROMO } from "@/lib/site";

export const PROMO_HIDE_KEY = "taegye-promo-hide-until";
export const PROMO_SESSION_KEY = "taegye-promo-closed";
const DAY_MS = 24 * 60 * 60 * 1000;

function forceHold() {
  return new URLSearchParams(window.location.search).get("promo") === "hold";
}

function querySkip() {
  return new URLSearchParams(window.location.search).get("promo") === "skip";
}

function hiddenForToday() {
  try {
    const until = Number(window.localStorage.getItem(PROMO_HIDE_KEY) || "0");
    return until > Date.now();
  } catch {
    return false;
  }
}

function closedThisSession() {
  try {
    return window.sessionStorage.getItem(PROMO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function setPromoFlag(on: boolean) {
  document.documentElement.dataset.promo = on ? "on" : "off";
}

/** Freeze the page behind the promo. overflow:hidden on html is not enough
 *  (first-paint CSS forces overflow-y:auto !important; Samsung/Android
 *  still pan the document under a position:fixed overlay). */
let promoScrollY = 0;
let promoLocked = false;
let stopPromoScroll: (() => void) | null = null;

function lockPage() {
  if (promoLocked || typeof document === "undefined") return;
  promoLocked = true;
  promoScrollY = window.scrollY || window.pageYOffset || 0;
  const html = document.documentElement;
  const body = document.body;
  html.classList.add("is-promo-open");
  html.style.setProperty("overflow", "hidden", "important");
  html.style.setProperty("overflow-y", "hidden", "important");
  html.style.setProperty("overscroll-behavior", "none");
  html.style.setProperty("touch-action", "none");
  body.style.position = "fixed";
  body.style.top = `-${promoScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";
  const block = (event: Event) => {
    event.preventDefault();
  };
  const pin = () => {
    if (window.scrollY !== 0) window.scrollTo(0, 0);
  };
  window.addEventListener("wheel", block, { passive: false, capture: true });
  window.addEventListener("touchmove", block, { passive: false, capture: true });
  window.addEventListener("scroll", pin, { passive: true, capture: true });
  stopPromoScroll = () => {
    window.removeEventListener("wheel", block, { capture: true });
    window.removeEventListener("touchmove", block, { capture: true });
    window.removeEventListener("scroll", pin, { capture: true });
  };
}

function unlockPage() {
  if (!promoLocked || typeof document === "undefined") return;
  promoLocked = false;
  stopPromoScroll?.();
  stopPromoScroll = null;
  const html = document.documentElement;
  const body = document.body;
  html.classList.remove("is-promo-open");
  html.style.removeProperty("overflow");
  html.style.removeProperty("overflow-y");
  html.style.removeProperty("overscroll-behavior");
  html.style.removeProperty("touch-action");
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  body.style.overflow = "";
  window.scrollTo(0, promoScrollY);
}

export function HomePromo() {
  const pathname = usePathname();
  const titleId = useId();
  /** Do not SSR the dim PNG. A stuck overlay would tint the whole home page. */
  const [open, setOpen] = useState(false);

  const hide = (today: boolean) => {
    setPromoFlag(false);
    setOpen(false);
    unlockPage();
    try {
      window.sessionStorage.setItem(PROMO_SESSION_KEY, "1");
      if (today) window.localStorage.setItem(PROMO_HIDE_KEY, String(Date.now() + DAY_MS));
    } catch {
      /* ignore */
    }
  };

  useLayoutEffect(() => {
    const show =
      HOME_PROMO.enabled &&
      pathname === "/" &&
      !querySkip() &&
      (forceHold() || !(hiddenForToday() || closedThisSession()));
    setPromoFlag(show);
    setOpen(show);
    if (show) lockPage();
    else unlockPage();
    return () => {
      unlockPage();
    };
  }, [pathname]);

  if (!open) return null;

  return (
    <div className="site-promo" role="presentation">
      <div className="site-promo-dim" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element -- dark raster dimmer skips Force Dark invert */}
      <img src={DIM_BLACK_PNG_SRC} alt="" aria-hidden className="site-promo-dim-bitmap" />
      <div className="site-promo-card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <CanvasWhitePlate />
        <div className="site-promo-visual">
          <button
            type="button"
            className="site-promo-x"
            aria-label="Close"
            onClick={() => hide(false)}
          >
            <CanvasX color="#999999" />
          </button>
          <a href={HOME_PROMO.href} className="site-promo-product" onClick={() => hide(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element -- transparent product PNG must stay raster */}
            <img
              src={HOME_PROMO.productSrc}
              alt={HOME_PROMO.productName}
              className="site-promo-photo"
              width={1254}
              height={1254}
            />
            <CanvasText
              id={titleId}
              text={HOME_PROMO.productName}
              fill="#111111"
              className="site-promo-name"
            />
            <CanvasText
              text={HOME_PROMO.productKicker}
              fill="#999999"
              className="site-promo-kicker"
            />
          </a>
        </div>
        <div className="site-promo-strip">
          <CanvasWhitePlate />
          <span className="site-promo-strip-rule" aria-hidden>
            <CanvasColorPlate color="#E5E5E5" />
          </span>
          <button
            type="button"
            className="site-promo-strip-btn"
            onClick={() => hide(true)}
          >
            <CanvasText text={HOME_PROMO.hideTodayLabel} fill="#111111" fit="fill" />
          </button>
          <span className="site-promo-strip-divider" aria-hidden>
            <CanvasColorPlate color="#E5E5E5" />
          </span>
          <button
            type="button"
            className="site-promo-strip-btn site-promo-strip-close"
            onClick={() => hide(false)}
          >
            <CanvasText text={HOME_PROMO.closeLabel} fill="#111111" fit="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}
