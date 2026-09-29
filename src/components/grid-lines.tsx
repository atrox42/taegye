"use client";

import { useLayoutEffect, useRef } from "react";

const INK = "#111111";

function collapseDevice(values: Iterable<number>, max: number) {
  const sorted = [...values]
    .map((value) => Math.max(0, Math.min(max, Math.round(value))))
    .sort((a, b) => a - b);
  const out: number[] = [];
  for (const value of sorted) {
    if (out.length === 0 || value - out[out.length - 1] > 1) out.push(value);
  }
  return out;
}

/** One device-pixel ink lines for the /new catalog — no CSS gap, no plate-edge seams. */
export function GridLines({
  gridRef,
  revision = 0,
}: {
  gridRef: { readonly current: HTMLElement | null };
  revision?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const grid = gridRef.current;
    if (!canvas || !grid) return;

    const paint = () => {
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      if (!desktop) {
        canvas.width = 0;
        canvas.height = 0;
        canvas.style.display = "none";
        return;
      }

      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const rect = grid.getBoundingClientRect();
      const wrap = canvas.offsetParent instanceof HTMLElement ? canvas.offsetParent : grid.parentElement;
      const wrapRect = wrap?.getBoundingClientRect() ?? rect;
      const cssW = Math.max(1, rect.width);
      const cssH = Math.max(1, rect.height);
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));

      canvas.style.display = "block";
      canvas.style.left = `${rect.left - wrapRect.left}px`;
      canvas.style.top = `${rect.top - wrapRect.top}px`;
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = INK;

      const xs = new Set<number>([0, w - 1]);
      const ys = new Set<number>([0, h - 1]);
      for (const item of grid.querySelectorAll(":scope > .new-grid-item")) {
        const box = item.getBoundingClientRect();
        xs.add((box.left - rect.left) * dpr);
        xs.add((box.right - rect.left) * dpr);
        ys.add((box.top - rect.top) * dpr);
        ys.add((box.bottom - rect.top) * dpr);
      }

      for (const x of collapseDevice(xs, w - 1)) ctx.fillRect(x, 0, 1, h);
      for (const y of collapseDevice(ys, h - 1)) ctx.fillRect(0, y, w, 1);
      canvas.dataset.gridLines = "1";
      canvas.dataset.gridDpr = String(dpr);
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(grid);
    for (const child of grid.children) ro.observe(child);
    window.addEventListener("resize", paint, { passive: true });
    window.visualViewport?.addEventListener("resize", paint);
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", paint);
    const mo = new MutationObserver(() => {
      for (const child of grid.children) ro.observe(child);
      paint();
    });
    mo.observe(grid, { childList: true, subtree: false });
    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", paint);
      window.visualViewport?.removeEventListener("resize", paint);
      mq.removeEventListener("change", paint);
    };
  }, [gridRef, revision]);

  return <canvas ref={canvasRef} className="new-grid-lines" aria-hidden />;
}
