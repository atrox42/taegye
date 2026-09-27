"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";

export function PdpReveal({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(false);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      sessionStorage.removeItem("taegye-dissolve");
    } catch {
      /* ignore */
    }
    if (reduced) {
      setOn(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setOn(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return <div className={`pdp-reveal${on ? " is-on" : ""}`}>{children}</div>;
}
