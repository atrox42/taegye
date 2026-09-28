"use client";

import { useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceWhiteStyle } from "@/lib/force-white";
import {
  COPYRIGHT,
  FOOTER_LINKS,
  FOOTER_LOGO_DISPLAY,
  SITE_NAME,
  legalLine,
} from "@/lib/site";

export function SiteFooter() {
  const [legalOpen, setLegalOpen] = useState(false);

  const toggleLegal = () => setLegalOpen((value) => !value);

  return (
    <footer className="site-footer" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <div className="site-footer-inner site-gutter">
        <WhiteSurfaceFill />
        <div className="site-footer-row">
          <WhiteSurfaceFill />
          <div className="site-footer-brand">
            <a href="/" className="site-footer-logo" aria-label={SITE_NAME}>
              <BrandLogo width={FOOTER_LOGO_DISPLAY.width} height={FOOTER_LOGO_DISPLAY.height} />
            </a>
            <div className="site-footer-copy">
              <p className="site-footer-copy-line site-type">
                <span>
                  ©{COPYRIGHT.year} {COPYRIGHT.owner}{" "}
                </span>
                <span
                  className="site-footer-copy-plus"
                  tabIndex={0}
                  onClick={toggleLegal}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleLegal();
                    }
                  }}
                >
                  +
                </span>
                {legalOpen ? (
                  <span className="site-footer-copy-details"> {legalLine()}</span>
                ) : null}
              </p>
            </div>
          </div>
          <div className="site-footer-nav">
            {FOOTER_LINKS.map((item) =>
              item.external ? (
                <a
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-type site-footer-link"
                >
                  {item.label}
                </a>
              ) : (
                <a
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  className="site-type site-footer-link"
                >
                  {item.label}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
