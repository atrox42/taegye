import Link from "next/link";

import { PdpGallery } from "@/components/pdp-gallery";
import { PdpReveal } from "@/components/pdp-reveal";
import { ProductPhoto } from "@/components/product-photo";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceInkStyle, forceWhiteStyle } from "@/lib/force-white";
import {
  STORE_URL,
  productColorLabel,
  productNote,
  productsInFamily,
  type NewProduct,
} from "@/lib/site";

type ProductDetailProps = {
  product: NewProduct;
};

function ProductHero({
  src,
  mobileSrc,
  alt,
  priority = false,
  className,
}: {
  src: string;
  mobileSrc?: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={className ? `pdp-hero ${className}` : "pdp-hero"} style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <div className="pdp-stage relative aspect-square overflow-hidden" data-pdp-photo="true">
        <WhiteSurfaceFill />
        <ProductPhoto src={src} mobileSrc={mobileSrc} alt={alt} fill priority={priority} />
      </div>
    </div>
  );
}

export function ProductDetail({ product }: ProductDetailProps) {
  const note = productNote(product);
  const family = productsInFamily(product);
  const showSwatches = product.category === "wall-kit" || product.category === "one-port";
  const mossSrc = product.mossSrc;
  const hasMoss = Boolean(mossSrc);
  const emptyHero = (
    <ProductHero
      src={product.emptySrc}
      mobileSrc={product.emptySrcMobile}
      alt={product.emptyAlt}
      priority
      className="pdp-hero-empty"
    />
  );
  const mossHero = mossSrc ? (
    <ProductHero
      src={mossSrc}
      mobileSrc={product.mossSrcMobile}
      alt={product.mossAlt ?? product.emptyAlt}
      className="pdp-hero-moss"
    />
  ) : null;

  return (
    <article className="site-page pdp pdp-atelier site-gutter" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <div className="pdp-mobile-gallery">
        {hasMoss && mossHero ? <PdpGallery empty={emptyHero} moss={mossHero} /> : emptyHero}
      </div>
      <PdpReveal>
        <ProductHero
          src={product.emptySrc}
          mobileSrc={product.emptySrcMobile}
          alt={product.emptyAlt}
          priority
          className="pdp-hero-empty"
        />
      </PdpReveal>

      <div className="pdp-rails">
        <div className="pdp-rail pdp-rail-copy">
          <h1 className="site-type pdp-name">{product.name}</h1>
          {note ? (
            <p lang="en" className="site-type pdp-note" style={forceInkStyle}>
              {note.en[0]}
              <br />
              {note.en[1]}
            </p>
          ) : null}
        </div>
        <div className="pdp-rail pdp-rail-buy">
          {product.price ? (
            <p className="site-type pdp-price product-price" style={forceInkStyle}>
              {product.price}
            </p>
          ) : null}
          {showSwatches ? (
            <div className="pdp-swatches" role="list" aria-label="Color">
              {family.map((item) => {
                const label = productColorLabel(item);
                const current = item.id === product.id;
                const className = `pdp-swatch${current ? " is-current" : ""}`;
                if (current) {
                  return (
                    <span key={item.id} role="listitem" className={className} aria-current="true" title={label}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- raster swatch skips Force Dark invert */}
                      <img src={`/swatches/${item.id}.png`} alt="" />
                      <span className="sr-only">{label}</span>
                    </span>
                  );
                }
                return (
                  <Link
                    key={item.id}
                    role="listitem"
                    href={`/new/${item.id}`}
                    className={className}
                    title={label}
                    aria-label={label}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- raster swatch skips Force Dark invert */}
                    <img src={`/swatches/${item.id}.png`} alt="" />
                  </Link>
                );
              })}
            </div>
          ) : null}
          <a
            href={STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="site-type pdp-store no-underline hover:no-underline"
            data-pdp-store="true"
            style={forceInkStyle}
          >
            Store
            <span className="pdp-store-chevron" aria-hidden />
          </a>
        </div>
      </div>
      {mossSrc ? (
        <ProductHero
          src={mossSrc}
          mobileSrc={product.mossSrcMobile}
          alt={product.mossAlt ?? product.emptyAlt}
          className="pdp-hero-moss pdp-desktop-moss"
        />
      ) : null}
    </article>
  );
}
