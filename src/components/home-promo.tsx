"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useId, useState } from "react";

import { CanvasColorPlate, CanvasWhitePlate } from "@/components/canvas-white-plate";
import { CanvasText } from "@/components/canvas-text";
import { CanvasX } from "@/components/canvas-x";
import {
  BRAND_MAIN,
  BRAND_SUB,
  forcePurpleLightStyle,
  forcePurpleStyle,
  DIM_BLACK_PNG_SRC,
  PURPLE_574667_PNG_SRC,
  PURPLE_6F5C82_PNG_SRC,
} from "@/lib/force-white";
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

export function HomePromo() {
  const pathname = usePathname();
  const titleId = useId();
  /** Do not SSR the dim PNG. A stuck overlay would tint the whole home page. */
  const [open, setOpen] = useState(false);

  const hide = (today: boolean) => {
    setPromoFlag(false);
    setOpen(false);
    document.documentElement.classList.remove("is-promo-open");
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
    document.documentElement.classList.toggle("is-promo-open", show);
    return () => {
      document.documentElement.classList.remove("is-promo-open");
    };
  }, [pathname]);

  if (!open) return null;

  return (
    <div className="site-promo" role="presentation">
      <div className="site-promo-dim" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element -- dark raster dimmer skips Force Dark invert */}
      <img src={DIM_BLACK_PNG_SRC} alt="" aria-hidden className="site-promo-dim-bitmap" />
      <div className="site-promo-card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="site-promo-visual" style={forcePurpleStyle}>
          <CanvasColorPlate color={BRAND_MAIN} className="site-promo-purple-fill" />
          {/* eslint-disable-next-line @next/next/no-img-element -- exact #574667 PNG fill skips Force Dark invert */}
          <img src={PURPLE_574667_PNG_SRC} alt="" aria-hidden className="site-promo-purple" />
          <button
            type="button"
            className="site-promo-x"
            aria-label="Close"
            onClick={() => hide(false)}
          >
            <CanvasX />
          </button>
          <CanvasText text={HOME_PROMO.eyebrow} className="site-promo-eyebrow" />
          <CanvasText id={titleId} text={HOME_PROMO.title} className="site-promo-title" />
          <div className="site-promo-copy">
            <CanvasText text={HOME_PROMO.line} className="site-promo-line" />
            <a href={HOME_PROMO.href} target="_blank" rel="noopener noreferrer" className="site-promo-cta">
              <span className="site-promo-cta-face" style={forcePurpleLightStyle}>
                <CanvasColorPlate color={BRAND_SUB} className="site-promo-cta-plate" />
                {/* eslint-disable-next-line @next/next/no-img-element -- exact #6F5C82 PNG fill skips Force Dark invert */}
                <img src={PURPLE_6F5C82_PNG_SRC} alt="" aria-hidden className="site-promo-cta-fill" />
                <CanvasText text={HOME_PROMO.cta} className="site-promo-cta-label" fit="fill" />
              </span>
            </a>
          </div>
        </div>
        <div className="site-promo-strip">
          <CanvasWhitePlate />
          <button
            type="button"
            className="site-promo-strip-btn"
            onClick={() => hide(true)}
          >
            <CanvasText text={HOME_PROMO.hideTodayLabel} fill="#111111" />
          </button>
          <button
            type="button"
            className="site-promo-strip-btn site-promo-strip-close"
            onClick={() => hide(false)}
          >
            <CanvasText text={HOME_PROMO.closeLabel} fill="#111111" />
          </button>
        </div>
      </div>
    </div>
  );
}
