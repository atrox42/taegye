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
import { paintOpaqueWhite } from "@/lib/canvas-white";

const COVER_MS = 350;
const REVEAL_MS = 350;
const REDUCE_MS = 120;
const SAFETY_MS = COVER_MS + REVEAL_MS + 1200;
const SESSION_KEY = "taegye-dissolve";
const OVERLAY_CLASS = "grid-dissolve-canvas";

type DissolveApi = {
  start: (href: string) => boolean;
};

const DissolveContext = createContext<DissolveApi>({
  start: (href: string) => {
    window.location.assign(href);
    return true;
  },
});

type HoldState = {
  hold: number;
  phase: "cover" | "reveal";
};

type DissolveWindow = Window & {
  __TAEGYE_DISSOLVE_HOLD?: number;
  __TAEGYE_DISSOLVE_OPACITY?: number;
  __TAEGYE_DISSOLVE_PHASE?: "cover" | "reveal";
};

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function phaseMs(full: number) {
  return prefersReduced() ? REDUCE_MS : full;
}

function easeInOut(t: number) {
  const u = Math.min(1, Math.max(0, t));
  return u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
}

function publishOpacity(hold: number, phase: "cover" | "reveal") {
  const value = Math.min(1, Math.max(0, hold));
  const win = window as DissolveWindow;
  win.__TAEGYE_DISSOLVE_OPACITY = value;
  win.__TAEGYE_DISSOLVE_PHASE = phase;
}

function holdState(): HoldState | null {
  const hold = Number((window as DissolveWindow).__TAEGYE_DISSOLVE_HOLD);
  if (!Number.isFinite(hold)) return null;
  const phase = (window as DissolveWindow).__TAEGYE_DISSOLVE_PHASE === "reveal" ? "reveal" : "cover";
  return { hold: Math.min(1, Math.max(0, hold)), phase };
}

function ensureOverlay() {
  let overlay = document.querySelector<HTMLElement>(`.${OVERLAY_CLASS}`);
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = OVERLAY_CLASS;
    overlay.setAttribute("aria-hidden", "true");
    const plate = document.createElement("canvas");
    plate.className = "grid-dissolve-plate";
    overlay.appendChild(plate);
    document.body.appendChild(overlay);
  }
  overlay.style.pointerEvents = "none";
  overlay.style.setProperty("forced-color-adjust", "none");
  overlay.style.colorScheme = "only light";
  overlay.style.zIndex = "90";
  const plate = overlay.querySelector("canvas");
  if (plate instanceof HTMLCanvasElement) {
    paintOpaqueWhite(plate, window.innerWidth, window.innerHeight);
  }
  return overlay;
}

function setOverlayOpacity(overlay: HTMLElement, value: number) {
  overlay.style.opacity = String(Math.min(1, Math.max(0, value)));
}

function removeOverlay() {
  document.querySelectorAll(`.${OVERLAY_CLASS}`).forEach((node) => node.remove());
  document.documentElement.classList.remove("is-dissolving");
  const win = window as DissolveWindow;
  delete win.__TAEGYE_DISSOLVE_OPACITY;
  delete win.__TAEGYE_DISSOLVE_PHASE;
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
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
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
    removeOverlay();
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
          busy.current = true;
          dest.current = href;
          document.documentElement.classList.add("is-dissolving");
          const overlay = ensureOverlay();
          setOverlayOpacity(overlay, held.hold);
          publishOpacity(held.hold, held.phase);
          if (held.phase === "reveal") {
            goNow(href, router);
            void waitForPath(href)
              .then(() => {
                const live = ensureOverlay();
                setOverlayOpacity(live, held.hold);
                publishOpacity(held.hold, "reveal");
              })
              .catch(() => {
                removeOverlay();
              });
            return true;
          }
          return true;
        } catch {
          removeOverlay();
          return false;
        }
      }

      if (busy.current) {
        reset();
      }

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

      const failAway = () => {
        goNow(href, router);
        reset();
        return true;
      };

      try {
        document.documentElement.classList.add("is-dissolving");
        const overlay = ensureOverlay();
        setOverlayOpacity(overlay, 0);
        publishOpacity(0, "cover");

        const finishCover = () => {
          setOverlayOpacity(overlay, 1);
          publishOpacity(1, "cover");
          goNow(href, router);
          void waitForPath(href)
            .then(() => {
              if (!busy.current || dest.current !== href) return;
              const live = ensureOverlay();
              setOverlayOpacity(live, 1);
              publishOpacity(1, "reveal");
              const revealMs = phaseMs(REVEAL_MS);
              const revealStart = performance.now();
              const tickReveal = (stamp: number) => {
                try {
                  if (!busy.current || dest.current !== href) return;
                  const u = Math.min(1, (stamp - revealStart) / revealMs);
                  const opacity = 1 - easeInOut(u);
                  setOverlayOpacity(live, opacity);
                  publishOpacity(opacity, "reveal");
                  if (u < 1) {
                    raf.current = requestAnimationFrame(tickReveal);
                    return;
                  }
                  reset();
                } catch {
                  reset();
                }
              };
              raf.current = requestAnimationFrame(tickReveal);
            })
            .catch(() => {
              reset();
            });
        };

        const coverMs = phaseMs(COVER_MS);
        const begun = performance.now();
        const tickCover = (now: number) => {
          try {
            if (!busy.current || dest.current !== href) return;
            const t = Math.min(1, (now - begun) / coverMs);
            const opacity = easeInOut(t);
            setOverlayOpacity(overlay, opacity);
            publishOpacity(opacity, "cover");
            if (t < 1) {
              raf.current = requestAnimationFrame(tickCover);
              return;
            }
            finishCover();
          } catch {
            failAway();
          }
        };
        raf.current = requestAnimationFrame(tickCover);
        return true;
      } catch {
        return failAway();
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
    if (!busy.current) removeOverlay();
  }, [pathname, reset]);

  useEffect(() => {
    const onPageShow = () => reset();
    const onPop = () => reset();
    const onVisible = () => {
      if (document.visibilityState === "visible" && !busy.current) removeOverlay();
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
