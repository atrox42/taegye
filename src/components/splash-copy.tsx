"use client";

import { useEffect, useRef } from "react";

/** Mobile splash lockup. Canvas #000 so Samsung Force Dark cannot invert the type. */
function SplashLine({ text }: { text: string }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let cancelled = false;

    const paint = () => {
      if (cancelled) return;
      const style = getComputedStyle(wrap);
      const fontSize = parseFloat(style.fontSize) || 16;
      const weight = style.fontWeight || "400";
      const family = style.fontFamily || '"Roboto Condensed", "Arial Narrow", sans-serif';
      const lineHeight =
        style.lineHeight === "normal" ? fontSize : parseFloat(style.lineHeight) || fontSize;
      let tracking = 0;
      const ls = style.letterSpacing;
      if (ls && ls !== "normal") {
        tracking = ls.endsWith("em") ? parseFloat(ls) * fontSize : parseFloat(ls) || 0;
      }
      const font = `${weight} ${fontSize}px ${family}`;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const ctx0 = canvas.getContext("2d", { alpha: true });
      if (!ctx0) return;
      ctx0.setTransform(1, 0, 0, 1, 0, 0);
      ctx0.font = font;
      if ("letterSpacing" in ctx0) {
        (ctx0 as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          `${tracking}px`;
      }
      const metrics = ctx0.measureText(text);
      const cssW = Math.max(1, Math.ceil(metrics.width + 4));
      const cssH = Math.max(1, Math.ceil(Math.max(lineHeight, fontSize) + 4));
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = font;
      if ("letterSpacing" in ctx) {
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${tracking}px`;
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000000";
      ctx.globalAlpha = 1;
      ctx.fillText(text, cssW / 2, cssH / 2);
      wrap.classList.add("is-painted");
    };

    const run = () => {
      const style = getComputedStyle(wrap);
      const spec = `${style.fontWeight || 400} ${parseFloat(style.fontSize) || 16}px ${style.fontFamily}`;
      const ready = document.fonts?.ready ?? Promise.resolve();
      const load = document.fonts?.load ? document.fonts.load(spec) : Promise.resolve();
      Promise.all([ready, load]).then(() => {
        if (!cancelled) paint();
      });
      paint();
    };

    run();
    window.addEventListener("resize", run, { passive: true });
    return () => {
      cancelled = true;
      window.removeEventListener("resize", run);
    };
  }, [text]);

  return (
    <span ref={wrapRef} className="site-splash-line">
      <span className="site-splash-ink">{text}</span>
      <canvas ref={canvasRef} className="site-splash-type" aria-hidden />
    </span>
  );
}

export function SplashCopy() {
  return (
    <p className="site-splash-copy">
      <SplashLine text="ALL" />
      <SplashLine text="TAEGYE-RIUM" />
    </p>
  );
}
