import Link from "next/link";

import { PdpBuyBar } from "@/components/pdp-buy-bar";
import { PdpGallery } from "@/components/pdp-gallery";
import { PdpAccordion } from "@/components/pdp-spec-section";
import { PdpRelated } from "@/components/pdp-related";
import { PdpReveal } from "@/components/pdp-reveal";
import { PdpSpecTable } from "@/components/pdp-spec-sheet";
import { PdpSwatches } from "@/components/pdp-swatches";
import { ProductPhoto } from "@/components/product-photo";
import { WhiteSurfaceFill } from "@/components/white-surface-fill";
import { forceInkStyle, forceWhiteClipStyle, forceWhiteStyle } from "@/lib/force-white";
import {
  PDP_INFO_SECTIONS,
  STORE_URL,
  productColorName,
  productFamilyLabel,
  productFeatures,
  productNote,
  productSpecSectionBody,
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
  const family = productsInFamily(product);
  const showSwatches =
    product.category === "wall-kit" || product.category === "one-port" || product.category === "cascade";
  const mossSrc = product.mossSrc;
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
      <div className="pdp-stage-row">
      <div className="pdp-media">
        <PdpGallery
          slides={[<PdpReveal key="photo">{emptyHero}</PdpReveal>, ...(mossHero ? [mossHero] : [])]}
        />
      </div>

      <div className="pdp-buy" data-pdp-buy="true">
        <p className="pdp-crumb">
          <Link href="/new">Product</Link>
          <span aria-hidden="true"> / </span>
          <span>{productFamilyLabel(product)}</span>
        </p>
        <div className="pdp-title-row">
          <div className="pdp-title-copy">
            <h1 className="site-type pdp-name" style={forceInkStyle}>
              {productFamilyLabel(product)}
            </h1>
            {product.name.includes(", ") ? (
              <p className="pdp-title-color" style={forceInkStyle}>
                {productColorName(product)}
              </p>
            ) : null}
          </div>
          {product.price ? (
            <p className="site-type pdp-price product-price" style={forceInkStyle}>
              {product.price}
            </p>
          ) : null}
        </div>
        {showSwatches ? (
          <div className="pdp-color">
            <PdpSwatches product={product} family={family} />
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
            {productFeatures(product).map((feature) => (
              <li key={feature.n} className="pdp-features-line" lang="ko" style={forceInkStyle}>
                <span className="pdp-features-num">{feature.n}</span>
                <span>{feature.text}</span>
              </li>
            ))}
          </ol>
        </section>
        <div className="pdp-acc-list">
          {PDP_INFO_SECTIONS.map((section) => (
            <PdpAccordion key={section.key} sectionKey={section.key} label={section.label}>
              {section.key === "description" ? (
                <>
                  <p lang="ko" className="pdp-note pdp-spec-line" style={forceInkStyle}>
                    {note}
                  </p>
                  {planting ? (
                    <>
                      <p className="pdp-spec-subhead" style={forceInkStyle}>
                        Planting Guide
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
                  <p className="pdp-spec-subhead" style={forceInkStyle}>
                    Product specifications
                  </p>
                  <PdpSpecTable product={product} />
                  {notes ? (
                    <>
                      <p className="pdp-spec-subhead" style={forceInkStyle}>
                        Notes
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
      <PdpRelated product={product} />
      <PdpBuyBar product={product} family={family} showSwatches={showSwatches} />
    </article>
  );
}
