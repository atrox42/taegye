"use client";

import { useEffect, useRef } from "react";

import { CANVAS_WHITE } from "@/lib/canvas-white";
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
 * The PNG stays the source; pixels become canvas ink.
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
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = CANVAS_WHITE;
      ctx.fillRect(0, 0, width, height);
      const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = align === "center" ? (width - dw) / 2 : 0;
      const dy = (height - dh) / 2;
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
