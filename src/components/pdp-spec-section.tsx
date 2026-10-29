"use client";

import { useId, useRef, useState, type ReactNode } from "react";

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
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    const button = buttonRef.current;
    const target = button?.getBoundingClientRect().top ?? null;
    setOpen((value) => !value);
    if (!button || target == null) return;
    const root = document.documentElement;
    const previousAnchor = root.style.overflowAnchor;
    root.style.overflowAnchor = "none";
    let expected = window.scrollY;
    const start = performance.now();
    const step = () => {
      if (Math.abs(window.scrollY - expected) > 1) {
        root.style.overflowAnchor = previousAnchor;
        return;
      }
      const drift = button.getBoundingClientRect().top - target;
      if (Math.abs(drift) > 0.2) {
        window.scrollBy(0, drift);
        expected = window.scrollY;
      }
      if (performance.now() - start < 420) requestAnimationFrame(step);
      else root.style.overflowAnchor = previousAnchor;
    };
    requestAnimationFrame(step);
  };

  return (
    <section className="pdp-acc-row" data-pdp-spec={sectionKey}>
      <h2 className="pdp-acc-label">
        <button
          ref={buttonRef}
          type="button"
          className="pdp-spec-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
        >
          <span className="pdp-spec-label-text" style={forceInkStyle}>
            {label}
          </span>
          <span className="pdp-spec-toggle-mark" aria-hidden>
            <span className="pdp-spec-toggle-spin">
              <span className="pdp-spec-toggle-bar pdp-spec-toggle-bar-h" />
              <span className={`pdp-spec-toggle-bar pdp-spec-toggle-bar-v${open ? " is-open" : ""}`} />
            </span>
          </span>
        </button>
      </h2>
      <div
        id={panelId}
        className={open ? "pdp-spec-body" : "pdp-spec-body is-collapsed"}
        data-pdp-spec-body={sectionKey}
      >
        <div className="pdp-spec-body-inner">
          <div className="pdp-spec-body-pad">{children}</div>
        </div>
      </div>
    </section>
  );
}
