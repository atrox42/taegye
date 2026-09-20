"use client";

import { useId, useState } from "react";

import { COPYRIGHT, legalLine } from "@/lib/site";

export function FooterLegal() {
  const [open, setOpen] = useState(false);
  const detailsId = useId();

  return (
    <div className="site-footer-copy">
      <p className="site-footer-copy-line site-type">
        <span>
          ©{COPYRIGHT.year} {COPYRIGHT.owner}{" "}
        </span>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          aria-label={open ? "Hide business information" : "Show business information"}
          onClick={() => setOpen((value) => !value)}
          className="site-footer-copy-plus"
        >
          +
        </button>
        {open ? (
          <span id={detailsId} className="site-footer-copy-details">
            {" "}
            {legalLine()}
          </span>
        ) : null}
      </p>
    </div>
  );
}
