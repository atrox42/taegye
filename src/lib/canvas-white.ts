/** Samsung Force Dark leaves 2D canvas pixels alone (JPEG/CSS white is dimmed). */

export const CANVAS_WHITE = "#FFFFFF";
export const PAGE_WHITE_CANVAS_ID = "taegye-page-white";

export function viewportCssSize() {
  const vv = window.visualViewport;
  return {
    width: Math.max(1, Math.round(vv?.width ?? window.innerWidth)),
    height: Math.max(1, Math.round(vv?.height ?? window.innerHeight)),
  };
}

export function paintOpaqueWhite(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(cssWidth * dpr));
  const h = Math.max(1, Math.round(cssHeight * dpr));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  canvas.style.width = `${Math.max(0, cssWidth)}px`;
  canvas.style.height = `${Math.max(0, cssHeight)}px`;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = CANVAS_WHITE;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function bindWhiteCanvas(
  canvas: HTMLCanvasElement,
  measure: () => { width: number; height: number },
) {
  const paint = () => {
    const { width, height } = measure();
    paintOpaqueWhite(canvas, width, height);
  };
  paint();
  const parent = canvas.parentElement;
  const ro = parent ? new ResizeObserver(paint) : null;
  if (parent) ro?.observe(parent);
  window.addEventListener("resize", paint, { passive: true });
  window.addEventListener("orientationchange", paint);
  const vv = window.visualViewport;
  vv?.addEventListener("resize", paint);
  return () => {
    ro?.disconnect();
    window.removeEventListener("resize", paint);
    window.removeEventListener("orientationchange", paint);
    vv?.removeEventListener("resize", paint);
  };
}
