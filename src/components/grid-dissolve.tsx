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

import { NEW_PRODUCTS } from "@/lib/site";

const COVER_MS = 360;
const REVEAL_MS = 360;
const SESSION_KEY = "taegye-dissolve";
const PLATE_A = "#FAFAFA";
const PLATE_B = "#F6F6F6";

type DissolveApi = {
  start: (href: string) => void;
};

const DissolveContext = createContext<DissolveApi>({
  start: (href: string) => {
    window.location.assign(href);
  },
});

type Block = {
  x: number;
  y: number;
  w: number;
  h: number;
  order: number;
  gray: string;
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
  const size = vw < 768 ? 32 : 44;
  const cols = Math.max(8, Math.ceil(vw / size));
  const rows = Math.max(8, Math.ceil(vh / size));
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
        gray: ((r + c) & 1) === 0 ? PLATE_A : PLATE_B,
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

function ensureCanvas() {
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
  canvas.style.pointerEvents = "auto";
  canvas.style.backgroundColor = "transparent";
  canvas.style.zIndex = "90";
  canvas.style.colorScheme = "only light";
  canvas.style.setProperty("forced-color-adjust", "none");
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

  const cut = Math.round(t * blocks.length);
  const start = phase === "cover" ? 0 : cut;
  const end = phase === "cover" ? cut : blocks.length;

  for (let i = start; i < end; i += 1) {
    const block = blocks[i];
    ctx.fillStyle = block.gray;
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
  if (phase === "cover") {
    ctx.globalCompositeOperation = "source-over";
    for (let i = from; i < to; i += 1) {
      const block = blocks[i];
      ctx.fillStyle = block.gray;
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

function waitForPdp(ms = 1600) {
  const begun = performance.now();
  return new Promise<void>((resolve) => {
    const tick = () => {
      if (document.querySelector(".pdp") || performance.now() - begun > ms) {
        resolve();
        return;
      }
      window.requestAnimationFrame(tick);
    };
    tick();
  });
}

export function GridDissolveProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const busy = useRef(false);
  const raf = useRef(0);
  const blocksRef = useRef<Block[]>([]);

  const reset = useCallback(() => {
    cancelAnimationFrame(raf.current);
    busy.current = false;
    blocksRef.current = [];
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

      try {
        router.prefetch(href);
      } catch {
        /* ignore */
      }

      document.documentElement.classList.add("is-dissolving");
      const { ctx } = ensureCanvas();
      const { w, h } = viewportSize();
      const blocks = buildBlocks(w, h);
      blocksRef.current = blocks;

      if (!ctx) {
        router.push(href);
        window.setTimeout(reset, 400);
        return;
      }

      const held = holdState();
      if (held) {
        if (held.phase === "reveal") {
          paint(ctx, blocks, 1, "cover");
          router.push(href);
          void waitForPdp().then(() => {
            const next = ensureCanvas();
            if (next.ctx) paint(next.ctx, blocks, held.hold, "reveal");
          });
          return;
        }
        paint(ctx, blocks, held.hold, "cover");
        return;
      }

      paint(ctx, blocks, 0, "cover");
      let last = 0;
      const begun = performance.now();
      const tickCover = (now: number) => {
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
        paint(ctx, blocks, 1, "cover");
        router.push(href);
        void waitForPdp().then(() => {
          const live = ensureCanvas();
          if (!live.ctx) {
            reset();
            return;
          }
          paint(live.ctx, blocks, 0, "reveal");
          let cleared = 0;
          const revealStart = performance.now();
          const tickReveal = (stamp: number) => {
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
      raf.current = requestAnimationFrame(tickCover);
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
