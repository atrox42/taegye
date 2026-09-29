"use client";

import { useEffect } from "react";

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

/** Fades the SSR splash. Markup lives in SiteShell so the first HTML frame has it. */
export function IntroSplashController() {
  useEffect(() => {
    const root = document.documentElement;
    const splash = document.querySelector(".site-splash");
    const home = window.location.pathname === "/";
    let stored = false;
    try {
      stored = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      stored = false;
    }
    const skip = queryFlag("intro", "skip") || queryFlag("promo", "hold") || (!shouldHold() && stored);

    if (!home || (skip && !shouldHold())) {
      root.dataset.intro = "done";
      window.dispatchEvent(new Event("taegye:intro-done"));
      return;
    }

    if (root.dataset.intro === "done") {
      window.dispatchEvent(new Event("taegye:intro-done"));
      return;
    }

    root.dataset.intro = "pending";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fade = reduced ? 0 : FADE_MS;
    const holdFor = shouldHold() ? 120000 : reduced ? 1600 : HOLD_MS;

    let hideTimer = 0;
    const outTimer = window.setTimeout(() => {
      if (shouldHold()) return;
      splash?.classList.add("is-out");
      hideTimer = window.setTimeout(() => {
        root.dataset.intro = "done";
        try {
          window.sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
          /* ignore quota / private mode */
        }
        window.dispatchEvent(new Event("taegye:intro-done"));
      }, fade);
    }, holdFor);

    return () => {
      window.clearTimeout(outTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return null;
}
