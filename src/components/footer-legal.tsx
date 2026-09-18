"use client";

import { useId, useState } from "react";

import { COPYRIGHT, legalLine } from "@/lib/site";

export function FooterLegal() {
  const [open, setOpen] = useState(false);
  const detailsId = useId();

  return (
    <div>
      <p className="text-[10px] tracking-[0.08em] text-foreground/50">
        <span>
          © {COPYRIGHT.year} {COPYRIGHT.owner}{" "}
        </span>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          aria-label={open ? "Hide business information" : "Show business information"}
          onClick={() => setOpen((value) => !value)}
          className="inline cursor-pointer align-baseline text-[10px] tracking-[0.08em] text-foreground/50 transition-opacity hover:opacity-70"
        >
          +
        </button>
      </p>
      {open ? (
        <p
          id={detailsId}
          className="mt-2 overflow-x-auto whitespace-nowrap text-[10px] leading-none tracking-[0.02em] text-foreground/45"
        >
          {legalLine()}
        </p>
      ) : null}
    </div>
  );
}
