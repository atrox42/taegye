import Image from "next/image";
import Link from "next/link";

import { PdpGallery } from "@/components/pdp-gallery";
import { PdpReveal } from "@/components/pdp-reveal";
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
          unoptimized={src.includes("/products/stand-") || src.includes("/products/one-port-")}
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-contain object-center"
        />
      </div>
    </div>
  );
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [blurbOne, blurbTwo] = productNote(product).en;
  const emptyHero = (
    <ProductHero src={product.emptySrc} alt={product.emptyAlt} priority className="pdp-hero-empty" />
  );
  const mossHero = <ProductHero src={product.mossSrc} alt={product.mossAlt} className="pdp-hero-moss" />;

  return (
    <article className="site-page pdp pdp-atelier site-gutter" style={forceWhiteStyle}>
      <WhiteSurfaceFill />
      <div className="pdp-mobile-gallery">
        <PdpGallery empty={emptyHero} moss={mossHero} />
      </div>
      <PdpReveal>
        <ProductHero src={product.emptySrc} alt={product.emptyAlt} priority className="pdp-hero-empty" />
      </PdpReveal>

      <div className="pdp-rails" style={forceWhiteStyle}>
        <WhiteSurfaceFill />
        <div className="pdp-rail pdp-rail-copy">
          <h1 className="site-type pdp-name">{product.name}</h1>
          <p lang="en" className="site-type pdp-note" style={forceInkStyle}>
            {blurbOne}
            <br />
            {blurbTwo}
          </p>
        </div>
        <div className="pdp-rail pdp-rail-buy">
          <p className="site-type pdp-price product-price" style={forceInkStyle}>
            {product.price}
          </p>
          <div className="pdp-swatches" role="list" aria-label="Color">
            {productsInFamily(product).map((item) => {
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
          <a
            href={STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="site-type pdp-store no-underline hover:no-underline"
            style={forceInkStyle}
          >
            Store
            <span className="pdp-store-chevron" aria-hidden />
          </a>
        </div>
      </div>
      <ProductHero src={product.mossSrc} alt={product.mossAlt} className="pdp-hero-moss pdp-desktop-moss" />
    </article>
  );
}
