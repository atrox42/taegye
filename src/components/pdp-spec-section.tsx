"use client";

import { useId, useState, type ReactNode } from "react";

import { forceInkStyle } from "@/lib/force-white";

export function PdpAccordion({
  sectionKey,
  label,
  children,
}: {
  sectionKey: string;
  label: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className="pdp-acc-row" data-pdp-spec={sectionKey}>
      <h2 className="pdp-acc-label">
        <button
          type="button"
          className="pdp-spec-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="pdp-spec-label-text" style={forceInkStyle}>
            {label}
          </span>
          <span className="pdp-spec-toggle-mark" aria-hidden>
            <span className="pdp-spec-toggle-bar pdp-spec-toggle-bar-h" />
            <span className={`pdp-spec-toggle-bar pdp-spec-toggle-bar-v${open ? " is-open" : ""}`} />
          </span>
        </button>
      </h2>
      <div
        id={panelId}
        className={open ? "pdp-spec-body" : "pdp-spec-body is-collapsed"}
        data-pdp-spec-body={sectionKey}
      >
        <div className="pdp-spec-body-inner">{children}</div>
      </div>
    </section>
  );
}
