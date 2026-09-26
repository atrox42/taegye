"use client";

import { useEffect, useState } from "react";

import { forceInkStyle, WHITE_BITMAP_SRC } from "@/lib/force-white";

const STORAGE_KEY = "taegye-intro";
const HOLD_MS = 2200;
const FADE_MS = 400;

type Phase = "hidden" | "in" | "out";

function queryFlag(name: string, value: string) {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(name) === value;
}

function shouldHold() {
  return queryFlag("intro", "hold");
}

function shouldSkip() {
  return queryFlag("intro", "skip") || queryFlag("promo", "hold");
}

function alreadySeen() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function IntroSplash() {
  const [phase, setPhase] = useState<Phase>("hidden");

  useEffect(() => {
    const hold = shouldHold();
    if (!hold && (alreadySeen() || shouldSkip())) {
      document.documentElement.dataset.intro = "done";
      window.dispatchEvent(new Event("taegye:intro-done"));
      return;
    }

    document.documentElement.dataset.intro = "pending";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fade = reduced ? 0 : FADE_MS;
    const holdFor = hold ? 120000 : reduced ? 1600 : HOLD_MS;

    const frame = window.requestAnimationFrame(() => setPhase("in"));
    let hideTimer = 0;
    const outTimer = window.setTimeout(() => {
      if (hold) return;
      setPhase("out");
      hideTimer = window.setTimeout(() => {
        setPhase("hidden");
        document.documentElement.dataset.intro = "done";
        try {
          window.sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
          /* ignore quota / private mode */
        }
        window.dispatchEvent(new Event("taegye:intro-done"));
      }, fade);
    }, fade + holdFor);

    document.body.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(outTimer);
      window.clearTimeout(hideTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      className={`site-splash ${phase === "in" ? "is-in" : "is-out"}`}
      role="presentation"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- OEM force-dark inverts CSS paint */}
      <img src={WHITE_BITMAP_SRC} alt="" className="site-splash-bitmap" />
      <p className="site-splash-copy" style={forceInkStyle}>
        <span>ALL</span>
        <span>TAEGYE-RIUM</span>
      </p>
    </div>
  );
}
