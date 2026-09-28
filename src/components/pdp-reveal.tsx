"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";

export function PdpReveal({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(true);

  useLayoutEffect(() => {
    let fromDissolve = false;
    try {
      fromDissolve = sessionStorage.getItem("taegye-dissolve") === "1";
      sessionStorage.removeItem("taegye-dissolve");
    } catch {
      /* ignore */
    }
    if (!fromDissolve || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    setOn(false);
    const id = window.requestAnimationFrame(() => setOn(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return <div className={`pdp-reveal${on ? " is-on" : ""}`}>{children}</div>;
}
