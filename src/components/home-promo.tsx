"use client";

import { usePathname } from "next/navigation";
import { useId, useLayoutEffect, useState } from "react";

import { CanvasWhitePlate } from "@/components/canvas-white-plate";
import { DIM_BLACK_PNG_SRC, forceInkStyle } from "@/lib/force-white";
import { HOME_PROMO } from "@/lib/site";

export const PROMO_SESSION_KEY = "taegye-promo-closed";
export const LANGUAGE_KEY = "taegye-language";

const LANGUAGES = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "zh", label: "中文" },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]["value"];

function forceHold() {
  return new URLSearchParams(window.location.search).get("promo") === "hold";
}

function querySkip() {
  return new URLSearchParams(window.location.search).get("promo") === "skip";
}

function savedLanguage() {
  try {
    return window.localStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
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
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageCode>("ko");

  const dismiss = (save: boolean) => {
    setPromoFlag(false);
    setOpen(false);
    unlockPage();
    try {
      window.sessionStorage.setItem(PROMO_SESSION_KEY, "1");
      if (save) window.localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      /* ignore */
    }
  };

  useLayoutEffect(() => {
    const show =
      HOME_PROMO.enabled &&
      !querySkip() &&
      (forceHold() || !(savedLanguage() || closedThisSession()));
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
      <div className="site-promo-card site-lang-card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <CanvasWhitePlate />
        <button type="button" className="site-promo-x" aria-label="Close" onClick={() => dismiss(false)}>
          <span className="site-lang-x" aria-hidden>
            ×
          </span>
        </button>
        <div className="site-lang-body">
          <h2 id={titleId} className="site-lang-title" style={forceInkStyle}>
            Choose your language
          </h2>
          <label className="site-lang-field">
            <span className="site-type site-lang-label" style={forceInkStyle}>
              Language
            </span>
            <span className="site-lang-select">
              <select
                value={language}
                aria-label="Language"
                onChange={(event) => setLanguage(event.target.value as LanguageCode)}
              >
                {LANGUAGES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <span className="site-lang-caret" aria-hidden>
                ▾
              </span>
            </span>
          </label>
          <button type="button" className="site-lang-confirm" onClick={() => dismiss(true)}>
            Confirm & Close
          </button>
        </div>
      </div>
    </div>
  );
}
