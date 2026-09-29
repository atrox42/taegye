"use client";

import { useEffect, useRef } from "react";

/** White X drawn as canvas pixels so Force Dark cannot grey the close control. */
export function CanvasX({ size = 18 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const paint = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      canvas.width = Math.max(1, Math.round(size * dpr));
      canvas.height = Math.max(1, Math.round(size * dpr));
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.lineCap = "square";
      ctx.globalAlpha = 1;
      const pad = 3;
      ctx.beginPath();
      ctx.moveTo(pad, pad);
      ctx.lineTo(size - pad, size - pad);
      ctx.moveTo(size - pad, pad);
      ctx.lineTo(pad, size - pad);
      ctx.stroke();
    };
    paint();
    window.addEventListener("resize", paint, { passive: true });
    return () => window.removeEventListener("resize", paint);
  }, [size]);

  return <canvas ref={ref} className="site-promo-x-mark" aria-hidden />;
}
