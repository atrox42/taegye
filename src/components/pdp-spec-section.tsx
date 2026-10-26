"use client";

import { useId, useState } from "react";

import { forceInkStyle } from "@/lib/force-white";
import { type ProductSpecLine, type ProductSpecSectionKey } from "@/lib/site";

export function PdpSpecHeadingLines({ en, ko }: { en: string; ko: string }) {
  return (
    <span className="pdp-spec-label-text">
      <span className="pdp-spec-label-ko" style={forceInkStyle}>{ko}</span>
      <span className="pdp-spec-label-en">({en})</span>
    </span>
  );
}

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

  return (
    <>
      <h2 className="site-type pdp-spec-label">
        <button
          type="button"
          className="pdp-spec-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <PdpSpecHeadingLines en={en} ko={ko} />
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
