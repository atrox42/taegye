"use client";

import { useLayoutEffect, type ReactNode } from "react";

export function PdpReveal({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    try {
      sessionStorage.removeItem("taegye-dissolve");
    } catch {
      /* ignore */
    }
  }, []);

  return <div className="pdp-reveal is-on">{children}</div>;
}
