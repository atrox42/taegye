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

import { GRID_TEXTURE_SRCS, NEW_PRODUCTS } from "@/lib/site";

const DURATION_MS = 660;
const STEPS = 6;
const SESSION_KEY = "taegye-dissolve";
const PLATE_A = "#FAFAFA";
const PLATE_B = "#F6F6F6";
const opaqueCache = new Map<string, { sx: number; sy: number; sw: number; sh: number } | null>();

type DissolveApi = {
  start: (href: string) => void;
};

const DissolveContext = createContext<DissolveApi>({
  start: (href: string) => {
    window.location.assign(href);
    return;
  },
});

type Tile = {
  img: HTMLImageElement;
  layout: HTMLImageElement;
  box: { x: number; y: number; w: number; h: number };
  dx: number;
  dy: number;
  dw: number;
  dh: number;
  step: number;
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
    cached.decoding = "async";
    cached.src = url;
    drawCache.set(url, cached);
  }
  if (cached.complete && cached.naturalWidth > 1) return cached;
  return img;
}

function preloadUrl(src: string) {
  try {
    const abs = new URL(src, window.location.origin).href;
    if (drawCache.has(abs)) return drawCache.get(abs)!;
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    drawCache.set(abs, img);
    void (img.decode ? img.decode().catch(() => undefined) : Promise.resolve()).then(() => {
      if (img.naturalWidth > 1) opaqueSource(img);
    });
    return img;
  } catch {
    return null;
  }
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

function snapBox(img: HTMLImageElement) {
  const r = img.getBoundingClientRect();
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const round = (n: number) => Math.round(n * dpr) / dpr;
  if (window.getComputedStyle(img).objectFit === "cover") {
    const x = round(r.left);
    const y = round(r.top);
    return { x, y, w: round(r.left + r.width) - x, h: round(r.top + r.height) - y, nw, nh };
  }
  const scale = Math.min(r.width / nw, r.height / nh);
  const w = nw * scale;
  const h = nh * scale;
  const x = round(r.left + (r.width - w) / 2);
  const y = round(r.top + (r.height - h) / 2);
  return { x, y, w: round(r.left + (r.width + w) / 2) - x, h: round(r.top + (r.height + h) / 2) - y, nw, nh };
}

function opaqueSource(img: HTMLImageElement) {
  const url = rawUrl(img);
  const hit = opaqueCache.get(url);
  if (hit !== undefined) return hit;
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const full = { sx: 0, sy: 0, sw: nw, sh: nh };
  if (nw < 2 || nh < 2) {
    opaqueCache.set(url, full);
    return full;
  }
  try {
    const canvas = document.createElement("canvas");
    canvas.width = nw;
    canvas.height = nh;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      opaqueCache.set(url, full);
      return full;
    }
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, nw, nh).data;
    let minX = nw;
    let minY = nh;
    let maxX = 0;
    let maxY = 0;
    const step = nw > 400 ? 4 : 2;
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
      opaqueCache.set(url, null);
      return null;
    }
    const box = {
      sx: Math.max(0, minX - 2),
      sy: Math.max(0, minY - 2),
      sw: Math.min(nw, maxX + 3) - Math.max(0, minX - 2),
      sh: Math.min(nh, maxY + 3) - Math.max(0, minY - 2),
    };
    opaqueCache.set(url, box);
    return box;
  } catch {
    opaqueCache.set(url, full);
    return full;
  }
}

type Cell = { r: number; c: number; r2: number; c2: number };

function cellArea(cell: Cell) {
  return (cell.r2 - cell.r + 1) * (cell.c2 - cell.c + 1);
}

function canJoin(a: Cell, b: Cell) {
  const union: Cell = {
    r: Math.min(a.r, b.r),
    c: Math.min(a.c, b.c),
    r2: Math.max(a.r2, b.r2),
    c2: Math.max(a.c2, b.c2),
  };
  return cellArea(a) + cellArea(b) === cellArea(union);
}

function chunkRects(w: number, h: number, dpr: number) {
  const cols = 3;
  const W = Math.max(cols, Math.round(w * dpr));
  const H = Math.max(2, Math.round(h * dpr));
  const rows = H * 10 >= W * 9 ? 3 : 2;
  const xs = Array.from({ length: cols + 1 }, (_, i) => Math.round((W * i) / cols));
  const ys = Array.from({ length: rows + 1 }, (_, i) => Math.round((H * i) / rows));
  xs[0] = 0;
  ys[0] = 0;
  xs[cols] = W;
  ys[rows] = H;

  const pieces: Cell[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      pieces.push({ r, c, r2: r, c2: c });
    }
  }

  const target = Math.min(pieces.length, 5 + Math.floor(Math.random() * 3));
  let guard = 32;
  while (pieces.length > target && guard-- > 0) {
    const pairs: Array<[number, number]> = [];
    for (let i = 0; i < pieces.length; i += 1) {
      for (let j = i + 1; j < pieces.length; j += 1) {
        if (canJoin(pieces[i], pieces[j])) pairs.push([i, j]);
      }
    }
    if (pairs.length === 0) break;
    const [i, j] = pairs[Math.floor(Math.random() * pairs.length)];
    const a = pieces[i];
    const b = pieces[j];
    const merged: Cell = {
      r: Math.min(a.r, b.r),
      c: Math.min(a.c, b.c),
      r2: Math.max(a.r2, b.r2),
      c2: Math.max(a.c2, b.c2),
    };
    pieces.splice(j, 1);
    pieces.splice(i, 1);
    pieces.push(merged);
  }

  return pieces.map((piece) => ({
    x: xs[piece.c] / dpr,
    y: ys[piece.r] / dpr,
    w: (xs[piece.c2 + 1] - xs[piece.c]) / dpr,
    h: (ys[piece.r2 + 1] - ys[piece.r]) / dpr,
  }));
}

function currentStep(t: number) {
  if (t <= 0) return 0;
  if (t >= 1) return STEPS + 1;
  return Math.min(STEPS, Math.floor(t * STEPS) + 1);
}

function holdProgress(hold: number) {
  if (hold > 1) return hold / DURATION_MS;
  return hold;
}

function buildTiles(): { tiles: Tile[]; boxes: Array<{ x: number; y: number; w: number; h: number }> } {
  const tiles: Tile[] = [];
  const boxes: Array<{ x: number; y: number; w: number; h: number }> = [];
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let card = 0;
  for (const layout of visibleGridImages()) {
    const draw = primedDrawImage(layout);
    const box = snapBox(layout);
    boxes.push({ x: box.x, y: box.y, w: box.w, h: box.h });
    const raw = chunkRects(box.w, box.h, dpr);
    const order = raw.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const swap = order[i];
      order[i] = order[j];
      order[j] = swap;
    }
    const offset = card % STEPS;
    card += 1;
    raw.forEach((piece, index) => {
      tiles.push({
        img: draw,
        layout,
        box: { x: box.x, y: box.y, w: box.w, h: box.h },
        dx: box.x + piece.x,
        dy: box.y + piece.y,
        dw: piece.w,
        dh: piece.h,
        step: 1 + ((order[index] + offset) % STEPS),
        gray: Math.random() < 0.5 ? PLATE_A : PLATE_B,
      });
    });
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
  canvas.style.backgroundColor = "transparent";
  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }
  return { canvas, ctx, dpr };
}

function drawFull(ctx: CanvasRenderingContext2D, tile: Tile) {
  const nw = tile.img.naturalWidth;
  const nh = tile.img.naturalHeight;
  if (nw < 1 || nh < 1) return;
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(tile.img, 0, 0, nw, nh, tile.box.x, tile.box.y, tile.box.w, tile.box.h);
}

function paint(ctx: CanvasRenderingContext2D, tiles: Tile[], t: number) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const seen = new Set<HTMLImageElement>();
  for (const tile of tiles) {
    if (seen.has(tile.layout)) continue;
    seen.add(tile.layout);
    drawFull(ctx, tile);
  }

  if (t <= 0) return;

  const step = currentStep(t);
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "#000000";
  for (const tile of tiles) {
    if (tile.step > step) continue;
    ctx.fillRect(tile.dx, tile.dy, tile.dw, tile.dh);
  }
  ctx.restore();

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  for (const tile of tiles) {
    if (tile.step !== step) continue;
    ctx.fillStyle = tile.gray;
    ctx.fillRect(tile.dx, tile.dy, tile.dw, tile.dh);
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

function publishTiles(tiles: Tile[]) {
  (
    window as Window & {
      __TAEGYE_DISSOLVE_TILES?: Array<{ x: number; y: number; w: number; h: number; step: number }>;
    }
  ).__TAEGYE_DISSOLVE_TILES = tiles.map((tile) => ({
    x: tile.dx,
    y: tile.dy,
    w: tile.dw,
    h: tile.dh,
    step: tile.step,
  }));
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

      try {
        router.prefetch(href);
      } catch {
        /* ignore */
      }
      const id = href.split("/").pop();
      if (id) preloadUrl(`/products/stand-${id}.webp`);

      document.documentElement.classList.add("is-dissolving");
      document.querySelector(".new-grid")?.classList.add("is-dissolve-lock");

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
          paint(ctx, tiles, Math.min(1, Math.max(0, holdProgress(hold))));
          return;
        }

        if (tiles.length === 0) {
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
        publishTiles(built.tiles);
        run(built.tiles);
      };

      if (sourcesReady()) {
        kick();
        return;
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
    for (const product of NEW_PRODUCTS) {
      preloadUrl(product.emptySrc);
      preloadUrl(product.mossSrc);
      try {
        router.prefetch(`/new/${product.id}`);
      } catch {
        /* ignore */
      }
    }
    for (const src of GRID_TEXTURE_SRCS) preloadUrl(src);
  }, [router]);

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
