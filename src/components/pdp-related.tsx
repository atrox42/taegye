"use client";

import Link from "next/link";
import { useRef } from "react";

import { ProductPhoto } from "@/components/product-photo";
import { forceInkStyle } from "@/lib/force-white";
import { relatedProducts, type NewProduct } from "@/lib/site";

export function PdpRelated({ product }: { product: NewProduct }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const items = relatedProducts(product);

  if (items.length === 0) return null;

  const scrollByCard = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".pdp-related-card");
    const styles = getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const distance = (card?.getBoundingClientRect().width || track.clientWidth / 2) + gap;
    track.scrollBy({ left: direction * distance, behavior: "smooth" });
  };

  return (
    <section className="pdp-related" aria-labelledby="pdp-related-title">
      <div className="pdp-related-head">
        <h2 id="pdp-related-title" className="pdp-section-title" style={forceInkStyle}>
          Recommended for you
        </h2>
        <div className="pdp-related-nav">
          <button type="button" className="pdp-related-arrow" aria-label="Previous products" onClick={() => scrollByCard(-1)}>
            ‹
          </button>
          <button type="button" className="pdp-related-arrow" aria-label="Next products" onClick={() => scrollByCard(1)}>
            ›
          </button>
        </div>
      </div>
      <div className="pdp-related-track" ref={trackRef}>
        {items.map((item) => (
          <Link key={item.id} href={`/new/${item.id}`} className="pdp-related-card">
            <span className="pdp-related-plate">
              <ProductPhoto src={item.emptySrc} mobileSrc={item.emptySrcMobile} alt={item.emptyAlt} fill />
            </span>
            <span className="pdp-related-copy">
              <span className="site-type pdp-related-name" style={forceInkStyle}>
                {item.name}
              </span>
              {item.price ? (
                <span className="site-type product-price pdp-related-price" style={forceInkStyle}>
                  {item.price}
                </span>
              ) : null}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
