"use client";

import Link from "next/link";
import { useRef, type MouseEvent } from "react";

import { CanvasColorPlate } from "@/components/canvas-white-plate";
import { ProductPhoto } from "@/components/product-photo";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceInkStyle, forceWhiteStyle } from "@/lib/force-white";
import { HOME_NEW_IN, getNewProduct, productColorLabel, productsInFamily } from "@/lib/site";

const FEATURED = HOME_NEW_IN.map((item) => {
  const product = getNewProduct(item.id);
  if (!product) return null;
  return { ...item, product, family: productsInFamily(product) };
}).filter((item): item is NonNullable<typeof item> => item !== null);

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <span className={`home-new-in-chevron is-${dir}`} aria-hidden>
      <svg viewBox="0 0 12 24" width="10" height="20">
        {dir === "prev" ? (
          <path d="M9 2 L2 12 L9 22" fill="none" stroke="#111111" strokeWidth="1" />
        ) : (
          <path d="M3 2 L10 12 L3 22" fill="none" stroke="#111111" strokeWidth="1" />
        )}
      </svg>
    </span>
  );
}

export function HomeNewIn() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBySlide = (dir: -1 | 1) => {
    const track = trackRef.current;
    const slide = track?.querySelector(".home-new-in-slide");
    if (!track || !(slide instanceof HTMLElement)) return;
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "12") || 12;
    track.scrollBy({ left: dir * (slide.offsetWidth + gap), behavior: "smooth" });
  };

  const onChevron = (event: MouseEvent<HTMLButtonElement>, dir: -1 | 1) => {
    event.preventDefault();
    event.stopPropagation();
    scrollBySlide(dir);
  };

  return (
    <section className="home-new-in" aria-label="New In" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <div className="home-new-in-rule" aria-hidden>
        <CanvasColorPlate color="#111111" />
      </div>
      <div className="home-new-in-head">
        <WhiteSurfaceFill />
        <h2 className="home-new-in-title" style={forceInkStyle}>
          New In
        </h2>
        <Link href="/new" className="home-new-in-more site-type" style={forceInkStyle}>
          View more +
        </Link>
      </div>
      <div ref={trackRef} className="home-new-in-track">
        {FEATURED.map((item, index) => (
          <article key={item.id} className="home-new-in-slide">
            <Link href={`/new/${item.product.id}`} className="home-new-in-card">
              <div className="home-new-in-visual home-new-in-panel">
                <CanvasColorPlate color="#F2F2F2" />
                <ProductPhoto
                  src={item.product.mossSrc ?? item.product.emptySrc}
                  mobileSrc={item.product.mossSrcMobile}
                  alt={item.product.mossAlt ?? item.product.emptyAlt}
                  width={1024}
                  height={1024}
                />
                {index > 0 ? (
                  <button
                    type="button"
                    className="home-new-in-chevron-btn is-prev"
                    aria-label="Previous"
                    onClick={(event) => onChevron(event, -1)}
                  >
                    <Chevron dir="prev" />
                  </button>
                ) : null}
                {index < FEATURED.length - 1 ? (
                  <button
                    type="button"
                    className="home-new-in-chevron-btn is-next"
                    aria-label="Next"
                    onClick={(event) => onChevron(event, 1)}
                  >
                    <Chevron dir="next" />
                  </button>
                ) : null}
              </div>
              {item.family.length > 1 ? (
                <div className="home-new-in-dots" role="list" aria-label="Color">
                  {item.family.map((swatch) => {
                    const label = productColorLabel(swatch);
                    const current = swatch.id === item.product.id;
                    return (
                      <span
                        key={swatch.id}
                        role="listitem"
                        className={`home-new-in-dot${current ? " is-current" : ""}${label === "MIST" ? " is-mist" : ""}`}
                        title={label}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- raster swatch skips Force Dark invert */}
                        <img src={`/swatches/${swatch.id}.png`} alt={label} />
                        <span className="sr-only">{label}</span>
                      </span>
                    );
                  })}
                </div>
              ) : null}
              <div className="home-new-in-copy">
                <p className="home-new-in-name" style={forceInkStyle}>
                  {item.product.name}
                </p>
                {item.product.price ? (
                  <p className="home-new-in-price" style={forceInkStyle}>
                    {item.product.price}
                  </p>
                ) : null}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
