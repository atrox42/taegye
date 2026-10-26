"use client";

import { useEffect, useId, useState } from "react";

import { forceInkStyle } from "@/lib/force-white";
import type { ProductSpecLine, ProductSpecSectionKey } from "@/lib/site";

const DESKTOP_QUERY = "(min-width: 768px)";

const labelStyle = { ...forceInkStyle, whiteSpace: "pre-line" as const };

export function PdpSpecSection({
  sectionKey,
  en,
  ko,
  lines,
}: {
  sectionKey: ProductSpecSectionKey;
  en: string;
  ko: string;
  lines: ProductSpecLine[];
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setOpen(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <>
      <h2 className="site-type pdp-spec-label">
        <button
          type="button"
          className="pdp-spec-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            if (window.matchMedia(DESKTOP_QUERY).matches) return;
            setOpen((value) => !value);
          }}
        >
          <span className="pdp-spec-label-text" style={labelStyle}>{`${en}\n${ko}`}</span>
          <span className="pdp-spec-toggle-mark" aria-hidden>
            {open ? "–" : "+"}
          </span>
        </button>
      </h2>
      <div
        id={panelId}
        className={open ? "pdp-spec-body" : "pdp-spec-body is-collapsed"}
        data-pdp-spec-body={sectionKey}
        lang="ko"
      >
        {lines.map((line, index) => (
          <p
            key={`${line.role}-${index}`}
            className={line.role === "subhead" ? "site-type pdp-spec-subhead" : "site-type pdp-spec-line"}
            style={forceInkStyle}
          >
            {line.text}
          </p>
        ))}
      </div>
    </>
  );
}
