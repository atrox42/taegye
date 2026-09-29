"use client";

import { useEffect, useRef } from "react";

import {
  bindColorCanvas,
  bindWhiteCanvas,
  PAGE_WHITE_CANVAS_ID,
  viewportCssSize,
} from "@/lib/canvas-white";
import { cn } from "@/lib/utils";

type CanvasWhitePlateProps = {
  mode?: "fixed" | "fill";
  className?: string;
};

/** Opaque #FFFFFF canvas plate. OEM Force Dark does not recolor canvas pixels. */
export function CanvasWhitePlate({ mode = "fill", className }: CanvasWhitePlateProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const measure =
      mode === "fixed"
        ? viewportCssSize
        : () => {
            const parent = canvas.parentElement;
            return {
              width: parent?.clientWidth ?? 0,
              height: parent?.clientHeight ?? 0,
            };
          };
    return bindWhiteCanvas(canvas, measure);
  }, [mode]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn(mode === "fixed" ? "canvas-white-fixed" : "canvas-white-fill", className)}
    />
  );
}

/** Opaque color canvas plate. OEM Force Dark does not recolor canvas pixels. */
export function CanvasColorPlate({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const measure = () => {
      const parent = canvas.parentElement;
      return {
        width: parent?.clientWidth ?? 0,
        height: parent?.clientHeight ?? 0,
      };
    };
    return bindColorCanvas(canvas, measure, color);
  }, [color]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("canvas-white-fill", className)}
    />
  );
}

/** Adopts the first-paint #taegye-page-white canvas, or creates it. */
export function PageWhiteLayer() {
  useEffect(() => {
    let canvas = document.getElementById(PAGE_WHITE_CANVAS_ID) as HTMLCanvasElement | null;
    if (!(canvas instanceof HTMLCanvasElement)) {
      canvas = document.createElement("canvas");
      canvas.id = PAGE_WHITE_CANVAS_ID;
      canvas.className = "canvas-white-fixed";
      canvas.setAttribute("aria-hidden", "true");
      document.body.insertBefore(canvas, document.body.firstChild);
    }
    return bindWhiteCanvas(canvas, viewportCssSize);
  }, []);
  return null;
}
