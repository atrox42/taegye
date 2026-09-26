"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { InkClose, InkHairline } from "@/components/ink-icons";
import {
  forceInkStyle,
  forcePurpleStyle,
  forceWhiteClipStyle,
  forceWhiteStyle,
  PURPLE_574667_PNG_SRC,
  WHITE_BITMAP_SRC,
} from "@/lib/force-white";
import { HOME_PROMO } from "@/lib/site";

const HIDE_KEY = "taegye-promo-hide-until";
const SESSION_KEY = "taegye-promo-closed";
const DAY_MS = 24 * 60 * 60 * 1000;

function forceHold() {
  return new URLSearchParams(window.location.search).get("promo") === "hold";
}

function querySkip() {
  return new URLSearchParams(window.location.search).get("promo") === "skip";
}

function hiddenForToday() {
  try {
    const until = Number(window.localStorage.getItem(HIDE_KEY) || "0");
    return until > Date.now();
  } catch {
    return false;
  }
}

function closedThisSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function HomePromo() {
  const pathname = usePathname();
  const titleId = useId();
  const [open, setOpen] = useState(false);

  const closeSession = () => {
    setOpen(false);
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const hideToday = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(HIDE_KEY, String(Date.now() + DAY_MS));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (!HOME_PROMO.enabled || pathname !== "/") return;
    if (typeof window === "undefined") return;
    if (querySkip()) return;
    if (hiddenForToday() || closedThisSession()) {
      if (!forceHold()) return;
    }

    let delay = 0;
    const show = () => {
      delay = window.setTimeout(() => setOpen(true), forceHold() ? 0 : 500);
    };

    if (forceHold() || document.documentElement.dataset.intro === "done") {
      show();
    } else {
      window.addEventListener("taegye:intro-done", show, { once: true });
    }

    return () => {
      window.clearTimeout(delay);
      window.removeEventListener("taegye:intro-done", show);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSession();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="site-promo" role="presentation">
      <button type="button" className="site-promo-dim" aria-label="Close promotion" onClick={closeSession} />
      {/* eslint-disable-next-line @next/next/no-img-element -- dark raster dimmer skips Force Dark invert */}
      <img src="/dim-black.jpg" alt="" aria-hidden className="site-promo-dim-bitmap" />
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
          <button type="button" className="site-promo-x" aria-label="Close" onClick={closeSession}>
            <InkClose tone="white" />
          </button>
          <p className="site-promo-white site-promo-eyebrow" style={forceWhiteClipStyle}>
            {HOME_PROMO.eyebrow}
          </p>
          <p id={titleId} className="site-promo-white site-promo-title" style={forceWhiteClipStyle}>
            {HOME_PROMO.title}
          </p>
          <p className="site-promo-white site-promo-line" style={forceWhiteClipStyle}>
            {HOME_PROMO.line}
          </p>
          <a
            href={HOME_PROMO.href}
            target="_blank"
            rel="noopener noreferrer"
            className="site-promo-cta"
          >
            <span className="site-promo-cta-face" style={forcePurpleStyle}>
              <span className="site-promo-white site-promo-cta-label" style={forceWhiteClipStyle}>
                {HOME_PROMO.cta}
              </span>
            </span>
          </a>
        </div>
        <div className="site-promo-strip">
          <InkHairline />
          <button type="button" className="site-promo-ink site-promo-strip-btn" onClick={hideToday} style={forceInkStyle}>
            {HOME_PROMO.hideTodayLabel}
          </button>
          <button
            type="button"
            className="site-promo-ink site-promo-strip-btn site-promo-strip-close"
            onClick={closeSession}
            style={forceInkStyle}
          >
            {HOME_PROMO.closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
