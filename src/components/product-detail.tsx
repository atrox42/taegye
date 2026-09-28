import Image from "next/image";
import Link from "next/link";

import { PdpReveal } from "@/components/pdp-reveal";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceInkStyle, forceWhiteStyle } from "@/lib/force-white";
import {
  NEW_PRODUCTS,
  STAND_NOTE,
  STORE_URL,
  productColorLabel,
  type NewProduct,
} from "@/lib/site";

type ProductDetailProps = {
  product: NewProduct;
};

function ProductHero({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={className ? `pdp-hero ${className}` : "pdp-hero"} style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <div className="pdp-stage relative aspect-square">
        <WhiteSurfaceFill />
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-contain object-center"
        />
      </div>
    </div>
  );
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [blurbOne, blurbTwo] = STAND_NOTE.en;

  return (
    <article className="site-page pdp pdp-atelier site-gutter" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <PdpReveal>
        <ProductHero src={product.emptySrc} alt={product.emptyAlt} priority className="pdp-hero-empty" />
      </PdpReveal>

      <div className="pdp-rails">
        <h1 className="site-type pdp-name pdp-rail-cell pdp-row-name">{product.name}</h1>
        <p className="site-type pdp-price product-price pdp-rail-cell pdp-row-price" style={forceInkStyle}>
          {product.price}
        </p>
        <p lang="en" className="site-type pdp-rail-cell pdp-row-blurb1" style={forceInkStyle}>
          {blurbOne}
        </p>
        <div className="pdp-swatches pdp-rail-cell pdp-row-swatches" role="list" aria-label="Color">
          {NEW_PRODUCTS.map((item) => {
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
        <p lang="en" className="site-type pdp-rail-cell pdp-row-blurb2" style={forceInkStyle}>
          {blurbTwo}
        </p>
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="site-type pdp-store pdp-rail-cell pdp-row-store no-underline hover:no-underline"
          style={forceInkStyle}
        >
          Store
        </a>
      </div>

      <ProductHero src={product.mossSrc} alt={product.mossAlt} className="pdp-hero-moss" />
    </article>
  );
}
