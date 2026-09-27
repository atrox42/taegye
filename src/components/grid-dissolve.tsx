"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

const DURATION_MS = 860;
const SESSION_KEY = "taegye-dissolve";

type DissolveApi = {
  start: (href: string) => void;
};

const DissolveContext = createContext<DissolveApi>({
  start: (href: string) => {
    window.location.assign(href);
  },
});

type Tile = {
  img: HTMLImageElement;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
  delay: number;
  dur: number;
  ox: number;
  oy: number;
};

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isShown(el: Element) {
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) < 0.2) {
      return false;
    }
    node = node.parentElement;
  }
  return true;
}

function visibleGridImages() {
  return Array.from(document.querySelectorAll<HTMLImageElement>(".new-grid img")).filter((img) => {
    if (img.classList.contains("white-surface-fill")) return false;
    if (!isShown(img)) return false;
    const r = img.getBoundingClientRect();
    return r.width > 4 && r.height > 4 && img.naturalWidth > 0;
  });
}

function containedBox(img: HTMLImageElement) {
  const r = img.getBoundingClientRect();
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (window.getComputedStyle(img).objectFit === "cover") {
    return { x: r.left, y: r.top, w: r.width, h: r.height, nw, nh };
  }
  const scale = Math.min(r.width / nw, r.height / nh);
  const w = nw * scale;
  const h = nh * scale;
  return {
    x: r.left + (r.width - w) / 2,
    y: r.top + (r.height - h) / 2,
    w,
    h,
    nw,
    nh,
  };
}

function splitRect(
  x: number,
  y: number,
  w: number,
  h: number,
  tiles: Array<{ x: number; y: number; w: number; h: number }>,
  min = 16,
) {
  const area = w * h;
  if (w < min * 2 || h < min * 2 || area < 700 || Math.random() < 0.16) {
    tiles.push({ x, y, w, h });
    return;
  }
  if (w >= h) {
    const cut = Math.max(min, Math.min(w - min, w * (0.28 + Math.random() * 0.44)));
    splitRect(x, y, cut, h, tiles, min);
    splitRect(x + cut, y, w - cut, h, tiles, min);
  } else {
    const cut = Math.max(min, Math.min(h - min, h * (0.28 + Math.random() * 0.44)));
    splitRect(x, y, w, cut, tiles, min);
    splitRect(x, y, w, h - cut, tiles, min);
  }
}

function buildTiles(): Tile[] {
  const tiles: Tile[] = [];
  const vw = window.innerWidth;
  for (const img of visibleGridImages()) {
    const box = containedBox(img);
    const raw: Array<{ x: number; y: number; w: number; h: number }> = [];
    splitRect(0, 0, box.w, box.h, raw, box.w < 180 ? 12 : 16);
    for (const piece of raw) {
      const nx = (box.x + piece.x) / Math.max(1, vw);
      tiles.push({
        img,
        sx: (piece.x / box.w) * box.nw,
        sy: (piece.y / box.h) * box.nh,
        sw: (piece.w / box.w) * box.nw,
        sh: (piece.h / box.h) * box.nh,
        dx: box.x + piece.x,
        dy: box.y + piece.y,
        dw: piece.w,
        dh: piece.h,
        delay: (nx * 0.32 + Math.random() * 0.68) * 0.48,
        dur: 0.22 + Math.random() * 0.22,
        ox: (Math.random() - 0.5) * 14,
        oy: (Math.random() - 0.5) * 10,
      });
    }
  }
  return tiles;
}

function ensureCanvas() {
  let canvas = document.querySelector<HTMLCanvasElement>(".grid-dissolve-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "grid-dissolve-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
  }
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { canvas, ctx, dpr };
}

function paint(ctx: CanvasRenderingContext2D, tiles: Tile[], t: number) {
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  for (const tile of tiles) {
    const local = t - tile.delay;
    if (local >= tile.dur) continue;
    const p = local <= 0 ? 0 : Math.min(1, local / tile.dur);
    const alpha = 1 - p;
    if (alpha <= 0.02) continue;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      tile.img,
      tile.sx,
      tile.sy,
      tile.sw,
      tile.sh,
      tile.dx + tile.ox * p,
      tile.dy + tile.oy * p,
      tile.dw,
      tile.dh,
    );
    ctx.restore();
  }
}

function removeCanvas() {
  document.querySelectorAll(".grid-dissolve-canvas").forEach((node) => node.remove());
  document.documentElement.classList.remove("is-dissolving");
}

export function GridDissolveProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const busy = useRef(false);
  const raf = useRef(0);

  const reset = useCallback(() => {
    cancelAnimationFrame(raf.current);
    busy.current = false;
    removeCanvas();
  }, []);

  const start = useCallback(
    (href: string) => {
      if (busy.current) return;
      if (href.startsWith("http") || href.startsWith("//")) {
        window.location.assign(href);
        return;
      }
      busy.current = true;
      document.documentElement.classList.add("is-dissolving");
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }

      const go = () => {
        router.push(href);
        window.setTimeout(reset, 900);
      };

      if (reducedMotion()) {
        const { canvas, ctx } = ensureCanvas();
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
        }
        canvas.classList.add("is-fade");
        window.setTimeout(go, 280);
        return;
      }

      const tiles = buildTiles();
      const { ctx } = ensureCanvas();
      if (!ctx || tiles.length === 0) {
        go();
        return;
      }

      const begun = performance.now();
      const tick = (now: number) => {
        const t = (now - begun) / DURATION_MS;
        paint(ctx, tiles, Math.min(1, t));
        if (t < 1) {
          raf.current = requestAnimationFrame(tick);
        } else {
          go();
        }
      };
      raf.current = requestAnimationFrame(tick);
    },
    [reset, router],
  );

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) reset();
    };
    const onPop = () => reset();
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPop);
      cancelAnimationFrame(raf.current);
    };
  }, [reset]);

  const api = useMemo(() => ({ start }), [start]);

  return <DissolveContext.Provider value={api}>{children}</DissolveContext.Provider>;
}

export function useGridDissolve() {
  return useContext(DissolveContext);
}
