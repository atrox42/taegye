"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

/** Button accordion — no <details>/<summary>, so Samsung cannot paint a native ▼ chip. */
export function ProductDisclosure({
  label,
  children,
  className,
  bodyClassName,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={cn("pdp-acc", className)}>
      <button
        type="button"
        className="pdp-acc-summary site-type"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{label}</span>
        <span aria-hidden>{open ? "–" : "+"}</span>
      </button>
      {open ? (
        <div id={panelId} className={cn("pdp-acc-body", bodyClassName)}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
