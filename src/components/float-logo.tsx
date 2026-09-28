"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { SITE_NAME } from "@/lib/site";

const LOGO_W = 67;
const LOGO_H = 43;
const LOGO_SRC = "/logo-taegye.png";

function isChromeOpen() {
  const introDone = document.documentElement.dataset.intro === "done";
  const desktop = window.matchMedia("(min-width: 768px)").matches;
  const splashOpen =
    !introDone &&
    !desktop &&
    Boolean(document.querySelector(".site-splash:not(.is-out)"));
  return Boolean(
    splashOpen ||
      document.querySelector(".site-promo") ||
      document.querySelector(".site-header.is-open"),
  );
}

function paintLogo(canvas: HTMLCanvasElement, source: HTMLImageElement) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(LOGO_W * dpr);
  canvas.height = Math.round(LOGO_H * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
}

/** Viewport-fixed mark. Canvas pixels survive OEM Force Dark; CSS-mask fills do not. */
export function FloatLogo() {
  const logoRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    const syncHide = () => {
      logo.classList.toggle("is-hidden", isChromeOpen());
    };

    syncHide();
    const mo = new MutationObserver(syncHide);
    mo.observe(document.documentElement, { attributes: true, subtree: true, childList: true });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    sourceRef.current = img;
    img.decoding = "async";
    img.onload = () => {
      if (canvasRef.current && sourceRef.current === img) {
        paintLogo(canvasRef.current, img);
      }
    };
    img.src = LOGO_SRC;

    const onResize = () => {
      if (img.naturalWidth && canvasRef.current) paintLogo(canvasRef.current, img);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      sourceRef.current = null;
    };
  }, []);

  return (
    <Link ref={logoRef} href="/" className="site-float-logo" aria-label={`${SITE_NAME} home`}>
      <canvas
        ref={canvasRef}
        className="site-float-logo-mark"
        width={LOGO_W}
        height={LOGO_H}
        aria-hidden
      />
    </Link>
  );
}
