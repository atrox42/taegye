"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";

export function PdpReveal({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(false);

  useLayoutEffect(() => {
    try {
      sessionStorage.removeItem("taegye-dissolve");
    } catch {
      /* ignore */
    }
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => setOn(true));
    });
    return () => {
      window.cancelAnimationFrame(outer);
      window.cancelAnimationFrame(inner);
    };
  }, []);

  return <div className={on ? "pdp-reveal is-on" : "pdp-reveal"}>{children}</div>;
}
