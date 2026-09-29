"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import { NEW_PRODUCTS } from "@/lib/site";

const COVER_MS = 360;
const REVEAL_MS = 360;
const SAFETY_MS = COVER_MS + REVEAL_MS + 1200;
const SESSION_KEY = "taegye-dissolve";
const PLATE = "#FFFFFF";

type DissolveApi = {
  start: (href: string) => boolean;
};

const DissolveContext = createContext<DissolveApi>({
  start: (href: string) => {
    window.location.assign(href);
    return true;
  },
});

type Block = {
  x: number;
  y: number;
  w: number;
  h: number;
  order: number;
};

type HoldState = {
  hold: number;
  phase: "cover" | "reveal";
};

type DissolveWindow = Window & {
  __TAEGYE_DISSOLVE_HOLD?: number;
  __TAEGYE_DISSOLVE_PHASE?: "cover" | "reveal";
  __TAEGYE_DISSOLVE_TILES?: Array<{ x: number; y: number; w: number; h: number; on: boolean }>;
};

function canvasDpr() {
  const raw = window.devicePixelRatio || 1;
  return Math.min(window.innerWidth < 768 ? 1.25 : 1.5, raw);
}

function viewportSize() {
  return { w: window.innerWidth, h: window.innerHeight };
}

function buildBlocks(vw: number, vh: number): Block[] {
  const size = vw < 768 ? 72 : 96;
  const cols = Math.max(4, Math.ceil(vw / size));
  const rows = Math.max(4, Math.ceil(vh / size));
  const blocks: Block[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const x = c * size;
      const y = r * size;
      const jitter = ((((r * 73856093) ^ (c * 19349663)) >>> 0) % 1000) / 1000;
      blocks.push({
        x,
        y,
        w: c === cols - 1 ? vw - x : size,
        h: r === rows - 1 ? vh - y : size,
        order: r + c + jitter * 0.72,
      });
    }
  }
  blocks.sort((a, b) => a.order - b.order);
  return blocks;
}

function holdState(): HoldState | null {
  const hold = Number((window as DissolveWindow).__TAEGYE_DISSOLVE_HOLD);
  if (!Number.isFinite(hold)) return null;
  const phase = (window as DissolveWindow).__TAEGYE_DISSOLVE_PHASE === "reveal" ? "reveal" : "cover";
  return { hold: Math.min(1, Math.max(0, hold)), phase };
}

function publishTiles(blocks: Block[], onFrom: number, onTo: number) {
  (window as DissolveWindow).__TAEGYE_DISSOLVE_TILES = blocks.map((block, index) => ({
    x: block.x,
    y: block.y,
    w: block.w,
    h: block.h,
    on: index >= onFrom && index < onTo,
  }));
}

function armCanvas(canvas: HTMLCanvasElement, capture: boolean) {
  canvas.style.pointerEvents = capture ? "auto" : "none";
}

function ensureCanvas(capture: boolean) {
  let canvas = document.querySelector<HTMLCanvasElement>(".grid-dissolve-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "grid-dissolve-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
  }
  const dpr = canvasDpr();
  const { w, h } = viewportSize();
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  canvas.style.backgroundColor = "transparent";
  canvas.style.zIndex = "90";
  canvas.style.colorScheme = "only light";
  canvas.style.setProperty("forced-color-adjust", "none");
  armCanvas(canvas, capture);
  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  return { canvas, ctx, dpr, w, h };
}

function paint(ctx: CanvasRenderingContext2D, blocks: Block[], t: number, phase: "cover" | "reveal") {
  const dpr = canvasDpr();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.fillStyle = PLATE;

  const cut = Math.round(t * blocks.length);
  const start = phase === "cover" ? 0 : cut;
  const end = phase === "cover" ? cut : blocks.length;

  for (let i = start; i < end; i += 1) {
    const block = blocks[i];
    ctx.fillRect(block.x, block.y, block.w, block.h);
  }

  publishTiles(blocks, start, end);
}

function paintIncremental(
  ctx: CanvasRenderingContext2D,
  blocks: Block[],
  from: number,
  to: number,
  phase: "cover" | "reveal",
) {
  const dpr = canvasDpr();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = PLATE;
  if (phase === "cover") {
    ctx.globalCompositeOperation = "source-over";
    for (let i = from; i < to; i += 1) {
      const block = blocks[i];
      ctx.fillRect(block.x, block.y, block.w, block.h);
    }
    publishTiles(blocks, 0, to);
    return;
  }
  for (let i = from; i < to; i += 1) {
    const block = blocks[i];
    ctx.clearRect(block.x, block.y, block.w, block.h);
  }
  publishTiles(blocks, to, blocks.length);
}

function removeCanvas() {
  document.querySelectorAll(".grid-dissolve-canvas").forEach((node) => node.remove());
  document.documentElement.classList.remove("is-dissolving");
}

function waitForPath(href: string, ms = 1600) {
  const begun = performance.now();
  return new Promise<void>((resolve) => {
    const tick = () => {
      if (window.location.pathname === href || performance.now() - begun > ms) {
        resolve();
        return;
      }
      window.requestAnimationFrame(tick);
    };
    tick();
  });
}

function goNow(href: string, router: { push: (url: string) => void }) {
  try {
    router.push(href);
  } catch {
    window.location.assign(href);
  }
}

export function GridDissolveProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const busy = useRef(false);
  const dest = useRef<string | null>(null);
  const raf = useRef(0);
  const safety = useRef(0);

  const clearTimers = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    window.clearTimeout(safety.current);
    safety.current = 0;
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    busy.current = false;
    dest.current = null;
    removeCanvas();
  }, [clearTimers]);

  const start = useCallback(
    (href: string) => {
      if (href.startsWith("http") || href.startsWith("//")) {
        window.location.assign(href);
        return true;
      }

      const held = holdState();
      if (held) {
        try {
          document.documentElement.classList.add("is-dissolving");
          const { ctx, canvas } = ensureCanvas(false);
          const { w, h } = viewportSize();
          const blocks = buildBlocks(w, h);
          if (!ctx) return false;
          if (held.phase === "reveal") {
            paint(ctx, blocks, 1, "cover");
            goNow(href, router);
            void waitForPath(href).then(() => {
              const next = ensureCanvas(false);
              if (next.ctx) paint(next.ctx, blocks, held.hold, "reveal");
            });
            return true;
          }
          paint(ctx, blocks, held.hold, "cover");
          armCanvas(canvas, false);
          return true;
        } catch {
          removeCanvas();
          return false;
        }
      }

      if (busy.current) return true;

      busy.current = true;
      dest.current = href;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }

      try {
        router.prefetch(href);
      } catch {
        /* ignore */
      }

      safety.current = window.setTimeout(() => {
        if (dest.current === href && window.location.pathname !== href) {
          window.location.assign(href);
        }
        reset();
      }, SAFETY_MS);

      try {
        document.documentElement.classList.add("is-dissolving");
        const { ctx } = ensureCanvas(true);
        const { w, h } = viewportSize();
        const blocks = buildBlocks(w, h);

        if (!ctx) {
          goNow(href, router);
          reset();
          return true;
        }

        const finishCover = () => {
          paint(ctx, blocks, 1, "cover");
          goNow(href, router);
          void waitForPath(href).then(() => {
            if (!busy.current || dest.current !== href) return;
            const live = ensureCanvas(true);
            if (!live.ctx) {
              reset();
              return;
            }
            paint(live.ctx, blocks, 0, "reveal");
            let cleared = 0;
            const revealStart = performance.now();
            const tickReveal = (stamp: number) => {
              if (!busy.current || dest.current !== href) return;
              const u = Math.min(1, (stamp - revealStart) / REVEAL_MS);
              const nextCleared = Math.round(u * blocks.length);
              if (nextCleared !== cleared) {
                paintIncremental(live.ctx!, blocks, cleared, nextCleared, "reveal");
                cleared = nextCleared;
              }
              if (u < 1) {
                raf.current = requestAnimationFrame(tickReveal);
                return;
              }
              reset();
            };
            raf.current = requestAnimationFrame(tickReveal);
          });
        };

        paint(ctx, blocks, 0, "cover");
        let last = 0;
        const begun = performance.now();
        const tickCover = (now: number) => {
          if (!busy.current || dest.current !== href) return;
          const t = Math.min(1, (now - begun) / COVER_MS);
          const next = Math.round(t * blocks.length);
          if (next !== last) {
            paintIncremental(ctx, blocks, last, next, "cover");
            last = next;
          }
          if (t < 1) {
            raf.current = requestAnimationFrame(tickCover);
            return;
          }
          finishCover();
        };
        raf.current = requestAnimationFrame(tickCover);
        return true;
      } catch {
        goNow(href, router);
        reset();
        return true;
      }
    },
    [reset, router],
  );

  useEffect(() => {
    for (const product of NEW_PRODUCTS) {
      try {
        router.prefetch(`/new/${product.id}`);
      } catch {
        /* ignore */
      }
    }
  }, [router]);

  useEffect(() => {
    if (busy.current && dest.current && pathname === dest.current) return;
    if (busy.current && dest.current && pathname !== dest.current) {
      reset();
      return;
    }
    if (!busy.current) removeCanvas();
  }, [pathname, reset]);

  useEffect(() => {
    const onPageShow = () => reset();
    const onPop = () => reset();
    const onVisible = () => {
      if (document.visibilityState === "visible" && !busy.current) removeCanvas();
    };
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPop);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("visibilitychange", onVisible);
      reset();
    };
  }, [reset]);

  const api = useMemo(() => ({ start }), [start]);

  return <DissolveContext.Provider value={api}>{children}</DissolveContext.Provider>;
}

export function useGridDissolve() {
  return useContext(DissolveContext);
}
