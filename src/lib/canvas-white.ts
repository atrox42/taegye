/** Samsung Force Dark leaves 2D canvas pixels alone (JPEG/CSS white is dimmed). */

export const CANVAS_WHITE = "#FFFFFF";
export const PAGE_WHITE_CANVAS_ID = "taegye-page-white";

export function viewportCssSize() {
  const vv = window.visualViewport;
  const gutter = Math.max(
    0,
    (document.documentElement?.offsetWidth ?? 0) - window.innerWidth,
  );
  return {
    width: Math.max(
      1,
      Math.round(vv?.width ?? window.innerWidth),
      window.innerWidth,
      document.documentElement?.clientWidth ?? 0,
    ) + gutter + 24,
    height: Math.max(
      1,
      Math.round(vv?.height ?? window.innerHeight),
      window.innerHeight,
      document.documentElement?.clientHeight ?? 0,
    ) + 24,
  };
}

export function paintOpaqueWhite(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
  pinCssSize = true,
) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(cssWidth * dpr));
  const h = Math.max(1, Math.round(cssHeight * dpr));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  if (pinCssSize) {
    canvas.style.width = `${Math.max(0, cssWidth)}px`;
    canvas.style.height = `${Math.max(0, cssHeight)}px`;
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
  }
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
  const pinCssSize = canvas.id !== PAGE_WHITE_CANVAS_ID && !canvas.classList.contains("canvas-white-fixed");
  const paint = () => {
    const { width, height } = measure();
    paintOpaqueWhite(canvas, width, height, pinCssSize);
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
