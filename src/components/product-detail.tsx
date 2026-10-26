import Link from "next/link";

import { PdpGallery } from "@/components/pdp-gallery";
import { PdpAccordion } from "@/components/pdp-spec-section";
import { PdpRelated } from "@/components/pdp-related";
import { PdpReveal } from "@/components/pdp-reveal";
import { PdpSpecSheet } from "@/components/pdp-spec-sheet";
import { ProductPhoto } from "@/components/product-photo";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceInkStyle, forceMutedStyle, forceWhiteClipStyle, forceWhiteStyle } from "@/lib/force-white";
import {
  PDP_FEATURE_SAMPLES,
  PDP_INFO_SECTIONS,
  PRODUCT_DIMENSION_PLACEHOLDER,
  STORE_URL,
  productColorLabel,
  productColorName,
  productFamilyLabel,
  productNote,
  productSpecSectionBody,
  productSpecValue,
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
  const planting = productSpecSectionBody(product, "planting");
  const notes = productSpecSectionBody(product, "temperature");
  const dimensions = productSpecValue(product, "dimensions");
  const family = productsInFamily(product);
  const showSwatches =
    product.category === "wall-kit" || product.category === "one-port" || product.category === "cascade";
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
      <div className="pdp-media">
        <PdpReveal>
          <ProductHero
            src={product.emptySrc}
            mobileSrc={product.emptySrcMobile}
            alt={product.emptyAlt}
            priority
            className="pdp-hero-empty"
          />
        </PdpReveal>
        {mossSrc ? (
          <ProductHero
            src={mossSrc}
            mobileSrc={product.mossSrcMobile}
            alt={product.mossAlt ?? product.emptyAlt}
            className="pdp-hero-moss pdp-desktop-moss"
          />
        ) : null}
      </div>

      <div className="pdp-buy" data-pdp-buy="true">
        <p className="pdp-crumb">
          <Link href="/new">Product</Link>
          <span aria-hidden="true"> / </span>
          <span>{productFamilyLabel(product)}</span>
        </p>
        <h1 className="site-type pdp-name" style={forceInkStyle}>
          {product.name}
        </h1>
        <p className="pdp-subtitle" lang="ko" style={forceInkStyle}>
          {product.nameKr}
        </p>
        {product.price ? (
          <p className="site-type pdp-price product-price" style={forceInkStyle}>
            {product.price}
          </p>
        ) : null}
        {showSwatches ? (
          <div className="pdp-color">
            <p className="pdp-color-name" style={forceInkStyle}>
              {productColorName(product)}
            </p>
            <div className="pdp-swatches" role="list" aria-label="Color">
              {family.map((item) => {
                const label = productColorLabel(item);
                const current = item.id === product.id;
                const className = `pdp-swatch${current ? " is-current" : ""}`;
                if (current) {
                  return (
                    <span key={item.id} role="listitem" className={className} aria-current="true" title={label}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- raster swatch skips Force Dark invert */}
                      <img src={`/swatches/${item.id}.png`} alt={label} />
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
                    <img src={`/swatches/${item.id}.png`} alt={label} />
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="pdp-store no-underline hover:no-underline"
          data-pdp-store="true"
        >
          <span className="pdp-store-face" aria-hidden="true" />
          <span className="pdp-store-label" style={forceWhiteClipStyle}>
            Store
          </span>
        </a>
        <section className="pdp-features" aria-label="Features">
          <h2 className="pdp-features-title" style={forceInkStyle}>
            Features
          </h2>
          <ol className="pdp-features-list">
            {PDP_FEATURE_SAMPLES.map((feature) => (
              <li key={feature.n} className="pdp-features-line" style={forceMutedStyle}>
                <span className="pdp-features-num">{feature.n}</span>
                <span>{feature.text}</span>
              </li>
            ))}
          </ol>
        </section>
        <div className="pdp-acc-list">
          {PDP_INFO_SECTIONS.map((section) => (
            <PdpAccordion key={section.key} sectionKey={section.key} en={section.en} ko={section.ko}>
              {section.key === "description" ? (
                <>
                  <p lang="ko" className="pdp-note pdp-spec-line" style={forceInkStyle}>
                    {note}
                  </p>
                  {planting ? (
                    <>
                      <p className="pdp-spec-subhead" style={forceInkStyle}>
                        추천 식재 조건 및 환경
                      </p>
                      <p lang="ko" className="pdp-spec-line" style={forceInkStyle}>
                        {planting}
                      </p>
                    </>
                  ) : null}
                </>
              ) : null}
              {section.key === "details" ? (
                <>
                  <p
                    className={dimensions ? "pdp-spec-value" : "pdp-spec-value is-empty"}
                    style={dimensions ? forceInkStyle : forceMutedStyle}
                  >
                    {dimensions || PRODUCT_DIMENSION_PLACEHOLDER}
                  </p>
                  {notes ? (
                    <>
                      <p className="pdp-spec-subhead" style={forceInkStyle}>
                        주의사항
                      </p>
                      <p lang="ko" className="pdp-spec-line" style={forceInkStyle}>
                        {notes}
                      </p>
                    </>
                  ) : null}
                </>
              ) : null}
            </PdpAccordion>
          ))}
        </div>
      </div>

      {product.category === "drain-tower" ? (
        <div className="pdp-hero pdp-hero-guide" style={forceWhiteStyle}>
          <WhiteSurfaceFill />
          <div className="pdp-guide-stage" data-pdp-photo="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- assembly guide must stay the committed raster */}
            <img
              src="/products/drain-tower-guide.png"
              alt="TAEGYE Drain Tower assembly guide"
              width={950}
              height={1656}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </div>
        </div>
      ) : null}
      <PdpSpecSheet product={product} />
      <PdpRelated product={product} />
    </article>
  );
}
