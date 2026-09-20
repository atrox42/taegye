"use client";

import { useEffect } from "react";

import { WHITE_BITMAP_SRC } from "@/lib/force-white";

function parseRgb(color: string): [number, number, number] | null {
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Samsung mid-gray (~#808080–#9a9a9a) is not “dark” but is not white. */
function isNotWhite(color: string) {
  const rgb = parseRgb(color);
  if (!rgb) return false;
  return rgb.some((channel) => channel < 245);
}

function isLightInk(color: string) {
  const rgb = parseRgb(color);
  if (!rgb) return false;
  return rgb[0] + rgb[1] + rgb[2] > 480;
}

function paintWhite(el: HTMLElement) {
  el.style.setProperty("background-color", "#ffffff", "important");
  el.style.setProperty("background-image", `url("${WHITE_BITMAP_SRC}")`, "important");
  el.style.setProperty("background-size", "100% 100%", "important");
  el.style.setProperty("background-repeat", "no-repeat", "important");
  el.style.setProperty("color-scheme", "only light", "important");
  el.style.setProperty("forced-color-adjust", "none", "important");
}

function setInk(el: HTMLElement, color: string) {
  el.style.setProperty("color", color, "important");
  el.style.setProperty("-webkit-text-fill-color", color, "important");
}

function restoreInk() {
  document.querySelectorAll<HTMLElement>(".site-nav a").forEach((link) => {
    const current = link.getAttribute("aria-current") === "page";
    setInk(link, current ? "#111111" : "#999999");
  });

  document.querySelectorAll<HTMLElement>(".new-subnav-item").forEach((item) => {
    const current = item.getAttribute("aria-current") === "page";
    setInk(item, current ? "#111111" : "#999999");
  });

  document
    .querySelectorAll<HTMLElement>(
      ".site-type, .pdp-copy, .pdp-copy *, .pdp-label, .pdp-title, .pdp-title-kr, .pdp-price, .pdp-note, .pdp-origin, .pdp-store, .pdp-features li, .pdp-acc-summary, .pdp-acc-body, .site-footer a, .site-footer li, .product-price, .new-empty"
    )
    .forEach((el) => {
      if (el.closest(".site-nav") || el.classList.contains("new-subnav-item")) return;
      setInk(el, "#111111");
    });

  document.querySelectorAll<HTMLElement>(".site-footer-legal p, .site-footer-legal button").forEach((el) => {
    setInk(el, "#999999");
  });

  document.querySelectorAll<HTMLElement>(".site-footer-logo img, .brand-logo").forEach((el) => {
    el.style.setProperty("filter", "none", "important");
    el.style.setProperty("background-color", "#ffffff", "important");
    el.style.setProperty("-webkit-filter", "none", "important");
  });
}

function collectNodes() {
  return [
    document.documentElement,
    document.body,
    document.querySelector<HTMLElement>(".site-shell"),
    document.querySelector<HTMLElement>(".site-main"),
    document.querySelector<HTMLElement>(".site-page"),
    document.querySelector<HTMLElement>(".site-header"),
    document.querySelector<HTMLElement>(".site-nav"),
    document.querySelector<HTMLElement>(".home-hero"),
    document.querySelector<HTMLElement>(".new-page"),
    document.querySelector<HTMLElement>(".new-grid"),
    document.querySelector<HTMLElement>(".pdp"),
    document.querySelector<HTMLElement>(".pdp-visual"),
    document.querySelector<HTMLElement>(".pdp-stage"),
    document.querySelector<HTMLElement>(".pdp-copy"),
    document.querySelector<HTMLElement>(".site-footer"),
    document.querySelector<HTMLElement>(".site-footer-inner"),
  ].filter((el): el is HTMLElement => Boolean(el));
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
  const nodes = collectNodes();
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const inverted = nodes.some((el) => isNotWhite(getComputedStyle(el).backgroundColor));
  const inkFlipped = Array.from(
    document.querySelectorAll<HTMLElement>(".site-type, .pdp-copy, .site-footer a, .pdp-title")
  ).some((el) => isLightInk(getComputedStyle(el).color));

  restoreInk();

  if (!mobile && !inverted && !inkFlipped) return;

  document.documentElement.classList.add("force-dark-caught");
  for (const el of nodes) paintWhite(el);

  const nav = document.querySelector<HTMLElement>(".site-nav");
  if (nav) paintWhite(nav);

  restoreInk();
  ensureOverlay();
}

export function ForceDarkGuard() {
  useEffect(() => {
    inspectAndRepair();
    const frame = window.requestAnimationFrame(inspectAndRepair);
    const late = window.setTimeout(inspectAndRepair, 80);
    let elapsed = 0;
    const interval = window.setInterval(() => {
      inspectAndRepair();
      elapsed += 150;
      if (elapsed >= 4000) window.clearInterval(interval);
    }, 150);

    const observer = new MutationObserver(() => inspectAndRepair());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    window.addEventListener("resize", inspectAndRepair);
    window.addEventListener("pageshow", inspectAndRepair);
    window.addEventListener("orientationchange", inspectAndRepair);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(late);
      window.clearInterval(interval);
      observer.disconnect();
      window.removeEventListener("resize", inspectAndRepair);
      window.removeEventListener("pageshow", inspectAndRepair);
      window.removeEventListener("orientationchange", inspectAndRepair);
    };
  }, []);

  return null;
}
