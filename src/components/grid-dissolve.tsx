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

const DURATION_MS = 680;
const SESSION_KEY = "taegye-dissolve";
const PLATE_A = "#D9D9D9";
const PLATE_B = "#CFCFCF";
const PLATE_EDGE = "#BDBDBD";
const opaqueCache = new WeakMap<HTMLImageElement, { sx: number; sy: number; sw: number; sh: number } | null>();

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
  layout: HTMLImageElement;
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
  gray: string;
};

const drawCache = new Map<string, HTMLImageElement>();

function rawUrl(img: HTMLImageElement) {
  const src = img.currentSrc || img.src || "";
  try {
    const url = new URL(src, window.location.origin);
    if (url.pathname.includes("/_next/image")) {
      const inner = url.searchParams.get("url");
      if (inner) return new URL(inner, window.location.origin).href;
    }
    return url.href;
  } catch {
    return src;
  }
}

function primedDrawImage(img: HTMLImageElement) {
  const url = rawUrl(img);
  let cached = drawCache.get(url);
  if (!cached) {
    cached = new Image();
    cached.decoding = "sync";
    cached.src = url;
    drawCache.set(url, cached);
  }
  if (cached.complete && cached.naturalWidth > 1) return cached;
  return img;
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
  const candidates = Array.from(document.querySelectorAll<HTMLImageElement>(".new-grid img")).filter((img) => {
    if (img.classList.contains("white-surface-fill")) return false;
    if (!isShown(img)) return false;
    const r = img.getBoundingClientRect();
    return r.width > 4 && r.height > 4 && img.naturalWidth > 0;
  });

  const picked = new Map<Element, HTMLImageElement>();
  const loose: HTMLImageElement[] = [];
  for (const img of candidates) {
    const card = img.closest(".product-card");
    if (!card) {
      loose.push(img);
      continue;
    }
    if (img.closest(".product-moss") && Number(window.getComputedStyle(img.closest(".product-moss")!).opacity) < 0.8) {
      continue;
    }
    const prev = picked.get(card);
    if (!prev) {
      picked.set(card, img);
      continue;
    }
    const preferMoss = img.closest(".product-moss") && Number(window.getComputedStyle(img.closest(".product-moss")!).opacity) >= 0.8;
    if (preferMoss) picked.set(card, img);
  }
  return [...picked.values(), ...loose];
}

function snap(n: number, dpr: number) {
  return Math.round(n * dpr) / dpr;
}

function containedBox(img: HTMLImageElement) {
  const r = img.getBoundingClientRect();
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (window.getComputedStyle(img).objectFit === "cover") {
    return {
      x: snap(r.left, dpr),
      y: snap(r.top, dpr),
      w: snap(r.width, dpr),
      h: snap(r.height, dpr),
      nw,
      nh,
    };
  }
  const scale = Math.min(r.width / nw, r.height / nh);
  const w = nw * scale;
  const h = nh * scale;
  return {
    x: snap(r.left + (r.width - w) / 2, dpr),
    y: snap(r.top + (r.height - h) / 2, dpr),
    w: snap(w, dpr),
    h: snap(h, dpr),
    nw,
    nh,
  };
}

function opaqueSource(img: HTMLImageElement) {
  const hit = opaqueCache.get(img);
  if (hit !== undefined) return hit;
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const full = { sx: 0, sy: 0, sw: nw, sh: nh };
  if (nw < 2 || nh < 2) {
    opaqueCache.set(img, full);
    return full;
  }
  try {
    const canvas = document.createElement("canvas");
    canvas.width = nw;
    canvas.height = nh;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      opaqueCache.set(img, full);
      return full;
    }
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, nw, nh).data;
    let minX = nw;
    let minY = nh;
    let maxX = 0;
    let maxY = 0;
    const step = nw > 400 ? 2 : 1;
    for (let y = 0; y < nh; y += step) {
      for (let x = 0; x < nw; x += step) {
        if (data[(y * nw + x) * 4 + 3] > 16) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX) {
      opaqueCache.set(img, null);
      return null;
    }
    const box = {
      sx: Math.max(0, minX - 2),
      sy: Math.max(0, minY - 2),
      sw: Math.min(nw, maxX + 3) - Math.max(0, minX - 2),
      sh: Math.min(nh, maxY + 3) - Math.max(0, minY - 2),
    };
    opaqueCache.set(img, box);
    return box;
  } catch {
    opaqueCache.set(img, full);
    return full;
  }
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

function buildTiles(): { tiles: Tile[]; boxes: Array<{ x: number; y: number; w: number; h: number }> } {
  const tiles: Tile[] = [];
  const boxes: Array<{ x: number; y: number; w: number; h: number }> = [];
  const vw = window.innerWidth;
  for (const layout of visibleGridImages()) {
    const draw = primedDrawImage(layout);
    const box = containedBox(layout);
    boxes.push({ x: box.x, y: box.y, w: box.w, h: box.h });
    const opaque = opaqueSource(draw);
    const nw = draw.naturalWidth || box.nw;
    const nh = draw.naturalHeight || box.nh;
    const region = opaque
      ? {
          x: box.x + (opaque.sx / nw) * box.w,
          y: box.y + (opaque.sy / nh) * box.h,
          w: (opaque.sw / nw) * box.w,
          h: (opaque.sh / nh) * box.h,
          sx: opaque.sx,
          sy: opaque.sy,
          sw: opaque.sw,
          sh: opaque.sh,
        }
      : { x: box.x, y: box.y, w: box.w, h: box.h, sx: 0, sy: 0, sw: nw, sh: nh };
    const raw: Array<{ x: number; y: number; w: number; h: number }> = [];
    splitRect(0, 0, region.w, region.h, raw, region.w < 180 ? 12 : 16);
    for (const piece of raw) {
      const nx = (region.x + piece.x) / Math.max(1, vw);
      tiles.push({
        img: draw,
        layout,
        sx: region.sx + (piece.x / region.w) * region.sw,
        sy: region.sy + (piece.y / region.h) * region.sh,
        sw: (piece.w / region.w) * region.sw,
        sh: (piece.h / region.h) * region.sh,
        dx: region.x + piece.x,
        dy: region.y + piece.y,
        dw: piece.w,
        dh: piece.h,
        delay: nx * 0.16 + Math.random() * 0.1,
        dur: 0.64 + Math.random() * 0.16,
        gray: Math.random() < 0.5 ? PLATE_A : PLATE_B,
      });
    }
  }
  return { tiles, boxes };
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
  canvas.style.pointerEvents = "auto";
  const ctx = canvas.getContext("2d", { alpha: false });
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  void canvas.offsetHeight;
  return { canvas, ctx, dpr };
}

function paint(ctx: CanvasRenderingContext2D, tiles: Tile[], t: number) {
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  if (t <= 0) {
    const seen = new Set<HTMLImageElement>();
    for (const tile of tiles) {
      if (seen.has(tile.layout)) continue;
      seen.add(tile.layout);
      const box = containedBox(tile.layout);
      ctx.drawImage(tile.img, 0, 0, tile.img.naturalWidth, tile.img.naturalHeight, box.x, box.y, box.w, box.h);
    }
    return;
  }
  for (const tile of tiles) {
    const local = t - tile.delay;
    if (local >= tile.dur) continue;
    const p = local <= 0 ? 0 : Math.min(1, local / tile.dur);
    const alpha = 1 - p;
    if (alpha <= 0.02) continue;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = tile.gray;
    ctx.fillRect(tile.dx, tile.dy, tile.dw, tile.dh);
    ctx.strokeStyle = PLATE_EDGE;
    ctx.lineWidth = 1;
    ctx.strokeRect(tile.dx + 0.5, tile.dy + 0.5, Math.max(0, tile.dw - 1), Math.max(0, tile.dh - 1));
    ctx.drawImage(tile.img, tile.sx, tile.sy, tile.sw, tile.sh, tile.dx, tile.dy, tile.dw, tile.dh);
    ctx.restore();
  }
}

function removeCanvas() {
  document.querySelectorAll(".grid-dissolve-canvas").forEach((node) => node.remove());
  document.documentElement.classList.remove("is-dissolving");
  document.querySelector(".new-grid")?.classList.remove("is-dissolve-lock");
}

function publishBoxes(boxes: Array<{ x: number; y: number; w: number; h: number }>) {
  (
    window as Window & {
      __TAEGYE_DISSOLVE_BOXES?: Array<{ x: number; y: number; w: number; h: number }>;
    }
  ).__TAEGYE_DISSOLVE_BOXES = boxes;
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
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }

      const go = () => {
        router.push(href);
        window.setTimeout(reset, 900);
      };

      document.documentElement.classList.add("is-dissolving");
      document.querySelector(".new-grid")?.classList.add("is-dissolve-lock");
      void document.body.offsetHeight;

      const visibles = visibleGridImages();
      for (const img of visibles) primedDrawImage(img);

      const sourcesReady = () =>
        visibles.every((img) => {
          const draw = primedDrawImage(img);
          return draw.complete && draw.naturalWidth > 1;
        });

      const run = (tiles: Tile[]) => {
        const { ctx } = ensureCanvas();
        if (!ctx) {
          window.setTimeout(go, DURATION_MS);
          return;
        }

        const hold = Number((window as Window & { __TAEGYE_DISSOLVE_HOLD?: number }).__TAEGYE_DISSOLVE_HOLD);
        if (Number.isFinite(hold)) {
          paint(ctx, tiles, Math.min(1, Math.max(0, hold)));
          return;
        }

        if (tiles.length === 0) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
          window.setTimeout(go, DURATION_MS);
          return;
        }

        paint(ctx, tiles, 0);
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
      };

      const kick = () => {
        const built = buildTiles();
        publishBoxes(built.boxes);
        run(built.tiles);
      };

      if (sourcesReady()) {
        kick();
        return;
      }

      const { ctx } = ensureCanvas();
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
      }

      void Promise.all(
        visibles.map((img) => {
          const draw = primedDrawImage(img);
          return draw.decode ? draw.decode().catch(() => undefined) : Promise.resolve();
        }),
      ).then(() => {
        kick();
      });
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
