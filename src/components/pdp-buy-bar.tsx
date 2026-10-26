"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { CanvasWhitePlate } from "@/components/canvas-white-plate";
import { PdpSwatches } from "@/components/pdp-swatches";
import { forceInkStyle, forceWhiteClipStyle } from "@/lib/force-white";
import { STORE_URL, type NewProduct } from "@/lib/site";

export function PdpBuyBar({
  product,
  family,
  showSwatches,
}: {
  product: NewProduct;
  family: NewProduct[];
  showSwatches: boolean;
}) {
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const label = product.price ? `Store · ${product.price}` : "Store";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-pdp-buybar");
    return () => root.classList.remove("has-pdp-buybar");
  }, []);

  useEffect(() => {
    const target = document.querySelector("[data-pdp-store]");
    if (!(target instanceof Element)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setOn(!entry || entry.intersectionRatio < 0.6);
      },
      { threshold: [0, 0.6, 1] },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [product.id]);

  if (!mounted) return null;

  return createPortal(
    <div className={on ? "pdp-buybar is-on" : "pdp-buybar"} data-pdp-buybar={on ? "on" : "off"} aria-hidden={!on}>
      <CanvasWhitePlate />
      <div className="pdp-buybar-inner">
        <p className="pdp-buybar-name" style={forceInkStyle}>
          {product.name}
        </p>
        <div className="pdp-buybar-actions">
          {showSwatches ? <PdpSwatches product={product} family={family} className="pdp-buybar-swatches" /> : null}
          <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className="pdp-buybar-store" data-pdp-buybar-store="true">
            <span className="pdp-store-face" aria-hidden="true" />
            <span className="pdp-buybar-store-label" style={forceWhiteClipStyle}>
              {label}
            </span>
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
