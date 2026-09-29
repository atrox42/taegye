"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type CanvasLogoProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  align?: "left" | "center";
};

/**
 * Draw the transparent black PNG onto a canvas so OEM Force Dark cannot grey the mark.
 * Alpha canvas — no opaque rectangle whose right/bottom edge can read as a grid line.
 */
export function CanvasLogo({
  src,
  alt,
  width,
  height,
  className,
  align = "left",
}: CanvasLogoProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (cancelled) return;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      const pad = 1;
      const innerW = Math.max(1, width - pad * 2);
      const innerH = Math.max(1, height - pad * 2);
      const scale = Math.min(innerW / img.naturalWidth, innerH / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = pad + (align === "center" ? (innerW - dw) / 2 : 0);
      const dy = pad + (innerH - dh) / 2;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, dx, dy, dw, dh);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, width, height, align]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={alt}
      className={cn("canvas-logo", className)}
      width={width}
      height={height}
    />
  );
}
