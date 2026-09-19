"use client";

import { useEffect } from "react";

import { WHITE_BITMAP_SRC } from "@/lib/force-white";

function rgbSum(color: string): number | null {
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return null;
  return Number(match[1]) + Number(match[2]) + Number(match[3]);
}

function isDarkPaint(color: string) {
  const sum = rgbSum(color);
  return sum !== null && sum < 300;
}

function paintWhite(el: HTMLElement) {
  el.style.setProperty("background-color", "#ffffff", "important");
  el.style.setProperty("background-image", `url("${WHITE_BITMAP_SRC}")`, "important");
  el.style.setProperty("background-size", "100% 100%", "important");
  el.style.setProperty("background-repeat", "no-repeat", "important");
  el.style.setProperty("color-scheme", "only light", "important");
}

function ensureOverlay() {
  if (document.querySelector("img.force-dark-overlay")) return;
  const img = document.createElement("img");
  img.src = WHITE_BITMAP_SRC;
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  img.className = "force-dark-overlay";
  img.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;";
  document.body.prepend(img);
}

function inspectAndRepair() {
  const nodes = [
    document.documentElement,
    document.body,
    document.querySelector<HTMLElement>(".site-shell"),
    document.querySelector<HTMLElement>(".site-main"),
    document.querySelector<HTMLElement>(".new-page"),
    document.querySelector<HTMLElement>(".new-grid"),
  ].filter((el): el is HTMLElement => Boolean(el));

  const inverted = nodes.some((el) => isDarkPaint(getComputedStyle(el).backgroundColor));
  if (!inverted) return;

  document.documentElement.classList.add("force-dark-caught");
  for (const el of nodes) paintWhite(el);

  const nav = document.querySelector<HTMLElement>(".site-nav");
  if (nav) paintWhite(nav);

  ensureOverlay();
}

export function ForceDarkGuard() {
  useEffect(() => {
    inspectAndRepair();
    const frame = window.requestAnimationFrame(inspectAndRepair);
    const timeout = window.setTimeout(inspectAndRepair, 400);
    window.addEventListener("resize", inspectAndRepair);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener("resize", inspectAndRepair);
    };
  }, []);

  return null;
}
