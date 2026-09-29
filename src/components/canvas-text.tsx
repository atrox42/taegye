"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type CanvasTextProps = {
  text: string;
  fill?: string;
  className?: string;
  fit?: "text" | "fill";
  id?: string;
};

function spacingPx(letterSpacing: string, fontSize: number) {
  if (!letterSpacing || letterSpacing === "normal") return 0;
  if (letterSpacing.endsWith("em")) return parseFloat(letterSpacing) * fontSize;
  if (letterSpacing.endsWith("px")) return parseFloat(letterSpacing);
  const n = parseFloat(letterSpacing);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Glyphs painted as opaque canvas pixels so Samsung Force Dark cannot grey them.
 * HTML color / background-clip text is inverted on OEM dark; canvas is not.
 */
export function CanvasText({
  text,
  fill = "#FFFFFF",
  className,
  fit = "text",
  id,
}: CanvasTextProps) {
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
      const family = style.fontFamily || '"Pretendard Variable", Pretendard, sans-serif';
      const lineHeight =
        style.lineHeight === "normal" ? fontSize : parseFloat(style.lineHeight) || fontSize;
      const tracking = spacingPx(style.letterSpacing, fontSize);
      const transform = style.textTransform;
      const display = transform === "uppercase" ? text.toUpperCase() : text;
      const font = `${weight} ${fontSize}px ${family}`;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const parent = wrap.parentElement;
      const measurer = canvas.getContext("2d", { alpha: true });
      if (!measurer) return;
      measurer.setTransform(1, 0, 0, 1, 0, 0);
      measurer.font = font;
      if ("letterSpacing" in measurer) {
        (measurer as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          `${tracking}px`;
      }
      const metrics = measurer.measureText(display);
      const textW = Math.max(1, Math.ceil(metrics.width + 2));
      const textH = Math.max(1, Math.ceil(Math.max(lineHeight, fontSize) + 2));
      const minH = parseFloat(style.minHeight);
      const cssW =
        fit === "fill"
          ? Math.max(textW, wrap.clientWidth || parent?.clientWidth || textW)
          : textW;
      const cssH =
        fit === "fill"
          ? Math.max(textH, Number.isFinite(minH) && minH > 0 ? minH : textH)
          : textH;
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
      ctx.fillStyle = fill;
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = false;
      ctx.fillText(display, cssW / 2, cssH / 2);
    };

    const run = () => {
      const style = getComputedStyle(wrap);
      const fontSize = parseFloat(style.fontSize) || 16;
      const spec = `${style.fontWeight || 400} ${fontSize}px ${style.fontFamily}`;
      const ready = document.fonts?.ready ?? Promise.resolve();
      const load = document.fonts?.load ? document.fonts.load(spec) : Promise.resolve();
      Promise.all([ready, load]).then(() => {
        if (!cancelled) paint();
      });
      paint();
    };

    run();
    const ro = new ResizeObserver(run);
    ro.observe(wrap);
    if (wrap.parentElement) ro.observe(wrap.parentElement);
    window.addEventListener("resize", run, { passive: true });
    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener("resize", run);
    };
  }, [text, fill, fit]);

  return (
    <span ref={wrapRef} id={id} className={cn("site-promo-canvas-text", className)}>
      <span className="sr-only">{text}</span>
      <canvas ref={canvasRef} aria-hidden />
    </span>
  );
}
