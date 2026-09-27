"use client";

import { useEffect, useState } from "react";

import { forceInkStyle, WHITE_BITMAP_SRC } from "@/lib/force-white";

const STORAGE_KEY = "taegye-intro";
const HOLD_MS = 2200;
const FADE_MS = 400;

function queryFlag(name: string, value: string) {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(name) === value;
}

function shouldHold() {
  return queryFlag("intro", "hold");
}

export function IntroSplash() {
  const [out, setOut] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro === "done") {
      window.dispatchEvent(new Event("taegye:intro-done"));
      return;
    }

    root.dataset.intro = "pending";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fade = reduced ? 0 : FADE_MS;
    const holdFor = shouldHold() ? 120000 : reduced ? 1600 : HOLD_MS;

    document.body.style.overflow = "hidden";

    let hideTimer = 0;
    const outTimer = window.setTimeout(() => {
      if (shouldHold()) return;
      setOut(true);
      hideTimer = window.setTimeout(() => {
        root.dataset.intro = "done";
        try {
          window.sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
          /* ignore quota / private mode */
        }
        document.body.style.overflow = "";
        window.dispatchEvent(new Event("taegye:intro-done"));
      }, fade);
    }, holdFor);

    return () => {
      window.clearTimeout(outTimer);
      window.clearTimeout(hideTimer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className={`site-splash${out ? " is-out" : ""}`}
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
