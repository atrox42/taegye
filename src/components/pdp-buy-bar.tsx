"use client";

import { useEffect, useRef, useState } from "react";
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
  const [mobile, setMobile] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const label = "Store";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-pdp-buybar");
    return () => root.classList.remove("has-pdp-buybar");
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767.98px)");
    const sync = () => setMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const store = document.querySelector("[data-pdp-store]");
    const footer = document.querySelector(".site-footer");
    if (!(store instanceof Element)) return;
    if (mobile) {
      setOn(true);
      return;
    }
    let storeAway = false;
    let footerInView = false;
    const sync = () => setOn(storeAway && !footerInView);
    const storeObserver = new IntersectionObserver(
      ([entry]) => {
        storeAway = !entry || entry.intersectionRatio < 0.6;
        sync();
      },
      { threshold: [0, 0.6, 1] },
    );
    storeObserver.observe(store);
    const barHeight = Math.ceil(barRef.current?.getBoundingClientRect().height || 56);
    const footerObserver = new IntersectionObserver(
      ([entry]) => {
        footerInView = Boolean(entry?.isIntersecting);
        sync();
      },
      { threshold: 0, rootMargin: `0px 0px -${barHeight}px 0px` },
    );
    if (footer instanceof Element) footerObserver.observe(footer);
    return () => {
      storeObserver.disconnect();
      footerObserver.disconnect();
    };
  }, [product.id, mobile]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={barRef}
      className={on ? "pdp-buybar is-on" : "pdp-buybar"}
      data-pdp-buybar={on ? "on" : "off"}
      aria-hidden={!on}
    >
      <CanvasWhitePlate />
      <div className="pdp-buybar-inner">
        <p className="pdp-buybar-name" style={forceInkStyle}>
          {product.name}
        </p>
        {product.price ? (
          <p className="pdp-buybar-price" style={forceInkStyle}>
            {product.price}
          </p>
        ) : null}
        <div className="pdp-buybar-actions">
          {showSwatches ? <PdpSwatches product={product} family={family} className="pdp-buybar-swatches" /> : null}
          <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className="pdp-buybar-store" data-pdp-buybar-store="true">
            <span className="pdp-store-face" aria-hidden="true" />
            <span className="pdp-buybar-store-label" style={forceWhiteClipStyle}>
              {label}
            </span>
            <span className="pdp-store-arrow" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
