"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useId, useState } from "react";

import { InkClose } from "@/components/ink-icons";
import {
  forceInkStyle,
  forcePurpleDarkStyle,
  forcePurpleStyle,
  forceWhiteClipStyle,
  forceWhiteStyle,
  DIM_BLACK_PNG_SRC,
  PURPLE_574667_PNG_SRC,
  WHITE_BITMAP_SRC,
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
  const [dismissed, setDismissed] = useState(false);

  const hide = (today: boolean) => {
    setPromoFlag(false);
    setDismissed(true);
    try {
      window.sessionStorage.setItem(PROMO_SESSION_KEY, "1");
      if (today) window.localStorage.setItem(PROMO_HIDE_KEY, String(Date.now() + DAY_MS));
    } catch {
      /* ignore */
    }
  };

  useLayoutEffect(() => {
    if (!HOME_PROMO.enabled || pathname !== "/" || querySkip()) {
      setPromoFlag(false);
      return;
    }
    if ((hiddenForToday() || closedThisSession()) && !forceHold()) {
      setPromoFlag(false);
      setDismissed(true);
      return;
    }
    setPromoFlag(true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [pathname]);

  if (!HOME_PROMO.enabled || pathname !== "/" || dismissed) return null;

  return (
    <div className="site-promo" role="presentation">
      <button type="button" className="site-promo-dim" aria-label="Close promotion" onClick={() => hide(false)} />
      {/* eslint-disable-next-line @next/next/no-img-element -- dark raster dimmer skips Force Dark invert */}
      <img src={DIM_BLACK_PNG_SRC} alt="" aria-hidden className="site-promo-dim-bitmap" />
      <div
        className="site-promo-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={forceWhiteStyle}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- OEM force-dark inverts CSS paint */}
        <img src={WHITE_BITMAP_SRC} alt="" aria-hidden className="site-promo-card-bitmap" />
        <div className="site-promo-visual" style={forcePurpleStyle}>
          {/* eslint-disable-next-line @next/next/no-img-element -- exact #574667 PNG fill skips Force Dark invert */}
          <img src={PURPLE_574667_PNG_SRC} alt="" aria-hidden className="site-promo-purple" />
          <button type="button" className="site-promo-x" aria-label="Close" onClick={() => hide(false)}>
            <InkClose tone="white" />
          </button>
          <p className="site-promo-white site-promo-eyebrow" style={forceWhiteClipStyle}>
            {HOME_PROMO.eyebrow}
          </p>
          <p id={titleId} className="site-promo-white site-promo-title" style={forceWhiteClipStyle}>
            {HOME_PROMO.title}
          </p>
          <div className="site-promo-copy">
            <p className="site-promo-white site-promo-line" style={forceWhiteClipStyle}>
              {HOME_PROMO.line}
            </p>
            <a href={HOME_PROMO.href} target="_blank" rel="noopener noreferrer" className="site-promo-cta">
              <span className="site-promo-cta-face" style={forcePurpleDarkStyle}>
                <span className="site-promo-white site-promo-cta-label" style={forceWhiteClipStyle}>
                  {HOME_PROMO.cta}
                </span>
              </span>
            </a>
          </div>
        </div>
        <div className="site-promo-strip">
          <button
            type="button"
            className="site-promo-ink site-promo-strip-btn"
            onClick={() => hide(true)}
            style={forceInkStyle}
          >
            {HOME_PROMO.hideTodayLabel}
          </button>
          <button
            type="button"
            className="site-promo-ink site-promo-strip-btn site-promo-strip-close"
            onClick={() => hide(false)}
            style={forceInkStyle}
          >
            {HOME_PROMO.closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
